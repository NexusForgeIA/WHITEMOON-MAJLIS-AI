// Utilidades compartidas por majlis-cita y majlis-notify.
// Secretos (Supabase Secrets, nunca en el cliente):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (los inyecta Supabase)
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID     (aviso al dueño)
//   ANTHROPIC_API_KEY                        (solo majlis-cita, action 'understand')
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

export const ORIGEN = "majlis-ai";
export const SECTOR = "automocion";
export const EMPRESA = "Example Garage (demo)";
export const TZ_OFFSET = "+03:00"; // Qatar no cambia de hora

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

export const db = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

/* Móvil de Qatar: 8 dígitos que empiezan por 3, 5, 6 o 7, con o sin
   +974 / 00974. Acepta dígitos árabe-índicos. Devuelve "+974 XXXX XXXX". */
export const normPhone = (v: unknown): string | null => {
  let d = String(v ?? "")
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
  if (d.length > 8) d = d.replace(/^(?:00)?974/, "");
  return /^[3567]\d{7}$/.test(d) ? `+974 ${d.slice(0, 4)} ${d.slice(4)}` : null;
};

export const cleanName = (v: unknown): string | null => {
  const s = String(v ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 80);
  return s.length >= 2 ? s : null;
};

/* Fecha de hoy en Doha como YYYY-MM-DD */
export const hoyDoha = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Qatar", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date());

export async function telegram(text: string): Promise<boolean> {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chat = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!token || !chat) {
    console.warn("[majlis] sin TELEGRAM_BOT_TOKEN/CHAT_ID");
    return false;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    if (!r.ok) console.warn("[majlis] Telegram", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.warn("[majlis] Telegram error", e);
    return false;
  }
}

export type Lead = {
  name: string;
  phone: string;
  service: string | null; // nombre legible, no el id
  date: string | null;    // YYYY-MM-DD
  time: string | null;    // HH:MM
  booked: boolean;
  handoff: boolean;
  lang: string;
};

/* Fila en leads_web (origen 'majlis-ai') + aviso por Telegram, en paralelo:
   si uno falla, el otro sale igual. */
export async function registraLead(l: Lead): Promise<{ inserted: boolean; notified: boolean }> {
  const ins = db().from("leads_web").insert({
    nombre: l.name,
    telefono: l.phone,
    empresa: EMPRESA,
    sector: SECTOR,
    interes: l.handoff ? "Hablar con una persona" : (l.service ?? ""),
    mensaje: [
      l.service ? `Service: ${l.service}` : null,
      l.date && l.time ? `When: ${l.date} ${l.time} (Doha)` : null,
      l.booked ? "Booked in calendar" : "Call back to arrange",
      `Lang: ${l.lang}`,
    ].filter(Boolean).join(" · "),
    origen: ORIGEN,
    cita_dia: l.date,
    cita_hora: l.time,
  }).then(({ error }) => {
    if (error) console.warn("[majlis] leads_web", error.message);
    return !error;
  });

  const digits = l.phone.replace(/\D/g, "");
  const msg =
    (l.booked ? "🚗 MAJLIS AI — NEW BOOKING" : l.handoff ? "🙋 MAJLIS AI — WANTS A PERSON" : "📞 MAJLIS AI — CALL BACK") +
    ` · ${EMPRESA}\n\n` +
    `👤 ${l.name}\n📱 ${l.phone}\n` +
    (l.service ? `🛠️ ${l.service}\n` : "") +
    (l.date && l.time ? `📅 ${l.date} ${l.time} (Doha)\n` : "📅 No slot chosen\n") +
    `🌐 ${l.lang === "ar" ? "Arabic" : "English"}\n\n` +
    (l.booked ? "✅ Already in the calendar.\n" : "⚠️ Call to arrange day and time.\n") +
    `📲 https://wa.me/${digits}`;

  const [inserted, notified] = await Promise.all([ins, telegram(msg)]);
  return { inserted, notified };
}
