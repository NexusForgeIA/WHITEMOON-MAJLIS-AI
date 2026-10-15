// majlis-cita — agenda del taller demo (Example Garage, Doha) para Leo.
// Pública (--no-verify-jwt): escribe con la service role, nunca con claves
// del cliente.
//
// POST JSON { action, ... }
//   slots       { service, date: "YYYY-MM-DD" }            -> { ok, slots: [iso+03:00] }
//   book        { service, name, phone, start, lang }      -> { ok, booking_id } | { ok:false, reason:"taken"|"limit" }
//   understand  { text, lang, step }                       -> { ok, intent, service, name, phone, date, time, reply, limited? }
//
// Límites (contadores en majlis_rate, solo service role):
//   · understand: 20 mensajes por IP y hora, y un tope global diario de
//     llamadas a Claude. Pasado el límite se responde con un texto amable
//     y NO se llama al modelo.
//   · book: máximo 3 citas confirmadas futuras por móvil y 30 en total.
//     Pasado eso no se reserva: se guarda un lead y el cliente dice
//     "te llamamos".
//
// Los huecos salen SIEMPRE de la base de datos: horario fijo de la demo
// (domingo–jueves, 08:00–18:00 hora de Doha, cada 30 min) menos las citas
// confirmadas. El modelo de lenguaje solo interpreta texto libre: no da
// huecos ni precios, y el cliente vuelve a validar todo contra `slots`.
import Anthropic from "npm:@anthropic-ai/sdk@0.68.0";
import { cleanName, cors, db, hoyDoha, json, normPhone, TZ_OFFSET } from "../_shared/common.ts";

const OPEN_MIN = 8 * 60;
const CLOSE_MIN = 18 * 60;
const STEP_MIN = 30;
const LEAD_MIN = 60;     // no se reserva con menos de 1 h de margen
const MAX_DAYS = 60;
const MODEL = "claude-haiku-4-5-20251001";
const IP_PER_HOUR = 20;
const CLAUDE_PER_DAY = 500;
const MAX_PER_PHONE = 3;
const MAX_FUTURE = 30;

type Service = { id: string; name_en: string; name_ar: string; duration_min: number };

const hhmm = (m: number) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const isoAt = (date: string, m: number) => `${date}T${hhmm(m)}:00${TZ_OFFSET}`;

function diasDesdeHoy(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, mo, d] = date.split("-").map(Number);
  const t = Date.UTC(y, mo - 1, d);
  if (Number.isNaN(t) || new Date(t).getUTCDate() !== d) return null;
  const [hy, hm, hd] = hoyDoha().split("-").map(Number);
  return Math.round((t - Date.UTC(hy, hm - 1, hd)) / 86400000);
}
const laborable = (date: string) => {
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay() <= 4; // dom(0)–jue(4)
};

async function servicio(id: unknown): Promise<Service | null> {
  const { data, error } = await db().from("majlis_services")
    .select("id,name_en,name_ar,duration_min").eq("id", String(id ?? "")).eq("active", true).maybeSingle();
  if (error) console.warn("[majlis-cita] services", error.message);
  return data ?? null;
}

async function huecos(svc: Service, date: string): Promise<string[]> {
  const dd = diasDesdeHoy(date);
  if (dd === null || dd < 0 || dd > MAX_DAYS || !laborable(date)) return [];
  const { data, error } = await db().from("majlis_bookings")
    .select("start_at,end_at").neq("status", "cancelled")
    .lt("start_at", isoAt(date, CLOSE_MIN)).gt("end_at", isoAt(date, OPEN_MIN));
  if (error) throw new Error(error.message);
  const ocupadas = (data ?? []).map((b) => [Date.parse(b.start_at), Date.parse(b.end_at)]);
  const minimo = Date.now() + LEAD_MIN * 60000;
  const out: string[] = [];
  for (let m = OPEN_MIN; m + svc.duration_min <= CLOSE_MIN; m += STEP_MIN) {
    const ini = Date.parse(isoAt(date, m));
    const fin = ini + svc.duration_min * 60000;
    if (ini < minimo) continue;
    if (ocupadas.some(([a, b]) => ini < b && fin > a)) continue;
    out.push(isoAt(date, m));
  }
  return out;
}

/* ---------- límites de uso (majlis_rate) ---------- */
// La IP no se guarda en claro: hash SHA-256 truncado.
async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("majlis:" + ip));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function dentroDe(bucket: string, ventana: string, limite: number): Promise<boolean> {
  const { data, error } = await db().rpc("majlis_rate_hit", { p_bucket: bucket, p_window: ventana, p_limit: limite });
  // Si el contador falla, se corta: mejor un "inténtalo luego" que llamadas sin control.
  if (error) { console.warn("[majlis-cita] rate", error.message); return false; }
  return data === true;
}
/* Primero la IP; el contador global solo sube si la IP pasa. */
async function puedeLlamarClaude(ip: string): Promise<boolean> {
  const hora = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
  if (!(await dentroDe("ip:" + (await hashIp(ip)), hora, IP_PER_HOUR))) return false;
  return dentroDe("claude:global", `${hoyDoha()}T00:00:00${TZ_OFFSET}`, CLAUDE_PER_DAY);
}
const LIMITE_MSG = {
  en: "I'm receiving a lot of messages right now. Please use the buttons below to book, or try writing again a little later.",
  // AR-REVIEW
  ar: "أتلقى الكثير من الرسائل في الوقت الحالي. يُرجى استخدام الأزرار أدناه للحجز، أو المحاولة مرة أخرى بعد قليل.",
};

/* ---------- comprensión de texto libre (Claude) ---------- */

const PRECIO = /(\d[\d.,]*\s*(qar|qr|riyals?|ريال|ر\.?\s?ق))|((qar|qr|ريال|ر\.?\s?ق)\s*\d)/i;
const tresFrases = (s: string) => {
  const partes = s.replace(/\s+/g, " ").trim().match(/[^.!?؟]+[.!?؟]*/g) ?? [];
  return partes.slice(0, 3).join(" ").trim().slice(0, 400);
};

async function entender(text: string, lang: string, servicios: Service[]) {
  const hoy = hoyDoha();
  const [y, m, d] = hoy.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  const lista = servicios.map((s) => `- ${s.id}: ${s.name_en} / ${s.name_ar}`).join("\n");

  const system =
    `You are Leo, the AI assistant of Example Garage, a fictitious demo car workshop in Doha, Qatar. ` +
    `You always say you are an AI assistant if asked; never claim to be human.\n` +
    `Your only job here is to read ONE customer message (English or Arabic) and call the tool "extract".\n` +
    `Today in Doha is ${dow} ${hoy}. The workshop opens Sunday to Thursday; Friday and Saturday are closed.\n` +
    `Services (use the id):\n${lista}\n\n` +
    `Rules:\n` +
    `- intent "book" if they want an appointment or name a service; "handoff" if they ask for a person/human/staff/call; ` +
    `"question" for questions about the workshop; "other" otherwise.\n` +
    `- Fill service, name, phone, date (YYYY-MM-DD, resolve words like "next Sunday" from today) and time (HH:MM, 24h) ONLY if the customer stated them. Never guess.\n` +
    `- reply: only for "question" or "other". At most 3 short sentences, in the customer's language, and end with at most one question. ` +
    `Never give prices or amounts: prices are a written quote in QAR after inspection. Never promise or list available times: availability comes from the calendar. ` +
    `If unsure, offer to book a visit or pass them to a person.`;

  const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    tool_choice: { type: "tool", name: "extract" },
    tools: [{
      name: "extract",
      description: "Structured reading of the customer's message.",
      input_schema: {
        type: "object",
        properties: {
          intent: { type: "string", enum: ["book", "handoff", "question", "other"] },
          service: { type: ["string", "null"], enum: [...servicios.map((s) => s.id), null] },
          name: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          date: { type: ["string", "null"], description: "YYYY-MM-DD" },
          time: { type: ["string", "null"], description: "HH:MM 24h" },
          reply: { type: ["string", "null"] },
        },
        required: ["intent", "service", "name", "phone", "date", "time", "reply"],
      },
    }],
    messages: [{ role: "user", content: text }],
  });

  const blk = res.content.find((b) => b.type === "tool_use");
  const x = (blk && blk.type === "tool_use" ? blk.input : {}) as Record<string, unknown>;

  // Todo lo que devuelve el modelo se valida aquí: nada pasa al cliente sin control.
  const intent = ["book", "handoff", "question", "other"].includes(String(x.intent)) ? String(x.intent) : "other";
  const service = servicios.some((s) => s.id === x.service) ? String(x.service) : null;
  const date = typeof x.date === "string" && diasDesdeHoy(x.date) !== null ? x.date : null;
  const time = typeof x.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time) ? x.time : null;
  let reply = typeof x.reply === "string" ? tresFrases(x.reply) : null;
  if (reply && PRECIO.test(reply)) {
    reply = lang === "ar"
      ? "السعر يُحدَّد في عرض مكتوب بالريال القطري بعد فحص السيارة. هل تريد حجز موعد للفحص؟"
      : "The price comes in a written quote in QAR after we inspect the car. Would you like to book a visit?";
  }
  return {
    ok: true,
    intent,
    service,
    name: cleanName(x.name),
    phone: normPhone(x.phone),
    date,
    time,
    reply: intent === "question" || intent === "other" ? reply : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);

  let p: Record<string, unknown> = {};
  try { p = await req.json(); } catch { return json({ ok: false, error: "json" }, 400); }
  const lang = p.lang === "ar" ? "ar" : "en";

  try {
    if (p.action === "slots") {
      const svc = await servicio(p.service);
      if (!svc) return json({ ok: false, error: "service" }, 400);
      return json({ ok: true, slots: await huecos(svc, String(p.date ?? "")) });
    }

    if (p.action === "book") {
      const svc = await servicio(p.service);
      const name = cleanName(p.name);
      const phone = normPhone(p.phone);
      const start = String(p.start ?? "");
      if (!svc || !name || !phone || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+03:00$/.test(start)) {
        return json({ ok: false, error: "invalid" }, 400);
      }
      const date = start.slice(0, 10);

      // Topes de reservas activas: por móvil y en total.
      const ahora = new Date().toISOString();
      const [porMovil, total] = await Promise.all([
        db().from("majlis_bookings").select("id", { count: "exact", head: true })
          .eq("status", "confirmed").eq("customer_phone", phone).gte("start_at", ahora),
        db().from("majlis_bookings").select("id", { count: "exact", head: true })
          .eq("status", "confirmed").gte("start_at", ahora),
      ]);
      if (porMovil.error || total.error) throw new Error((porMovil.error || total.error)!.message);
      if ((porMovil.count ?? 0) >= MAX_PER_PHONE || (total.count ?? 0) >= MAX_FUTURE) {
        const { error: le } = await db().from("majlis_leads").insert({
          name, phone, service_id: svc.id, pref_date: date, pref_time: start.slice(11, 16), lang,
        });
        if (le) console.warn("[majlis-cita] lead por tope", le.message);
        return json({ ok: false, reason: "limit", lead: !le });
      }

      // El inicio tiene que ser uno de los huecos que daría `slots` ahora mismo:
      // así se validan horario, día laborable, margen y solapes de una vez.
      if (!(await huecos(svc, date)).includes(start)) return json({ ok: false, reason: "taken" });

      const end = new Date(Date.parse(start) + svc.duration_min * 60000).toISOString();
      const { data, error } = await db().from("majlis_bookings").insert({
        service_id: svc.id, customer_name: name, customer_phone: phone,
        start_at: start, end_at: end, lang,
      }).select("id").single();
      if (error) {
        // 23P01 = exclusion_violation: alguien ha cogido el hueco entre medias.
        if (error.code === "23P01") return json({ ok: false, reason: "taken" });
        throw new Error(error.message);
      }
      // La cita aparece en el panel del dueño (majlis_bookings): no hay aviso externo.
      return json({ ok: true, booking_id: data.id });
    }

    if (p.action === "understand") {
      const text = String(p.text ?? "").trim().slice(0, 400);
      if (!text) return json({ ok: false, error: "empty" }, 400);
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "?";
      if (!(await puedeLlamarClaude(ip))) {
        return json({ ok: true, intent: "other", service: null, name: null, phone: null, date: null, time: null, reply: LIMITE_MSG[lang], limited: true });
      }
      const { data, error } = await db().from("majlis_services")
        .select("id,name_en,name_ar,duration_min").eq("active", true).order("sort");
      if (error) throw new Error(error.message);
      return json(await entender(text, lang, data ?? []));
    }

    return json({ ok: false, error: "action" }, 400);
  } catch (e) {
    console.error("[majlis-cita]", e);
    return json({ ok: false, error: "server" }, 500);
  }
});
