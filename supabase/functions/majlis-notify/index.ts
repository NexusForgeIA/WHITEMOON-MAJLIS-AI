// majlis-notify — lead SIN cita reservada (el cliente prefiere que le llamen,
// la agenda no respondió o pidió hablar con una persona).
// Guarda la fila en leads_web (origen 'majlis-ai') y avisa al dueño por
// Telegram. Cuando hay cita, avisa majlis-cita y aquí no llega nada: un solo
// aviso por evento.
//
// El cuerpo llega por navigator.sendBeacon como text/plain (sin preflight);
// req.json() lo parsea igual.
import { cleanName, cors, json, normPhone, registraLead } from "../_shared/common.ts";

const SERVICES: Record<string, string> = {
  oil: "Oil change", service: "General service", inspect: "Pre-purchase inspection",
  tyres: "Tyres", brakes: "Brakes", diag: "Computer diagnostics", ac: "Air conditioning",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);

  let p: Record<string, unknown> = {};
  try { p = await req.json(); } catch { return json({ ok: false, error: "json" }, 400); }

  const name = cleanName(p.name);
  const phone = normPhone(p.phone);
  if (!name || !phone) return json({ ok: false, error: "lead incompleto" }, 400);

  const date = typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : null;
  const time = typeof p.time === "string" && /^\d{2}:\d{2}$/.test(p.time) ? p.time : null;
  const r = await registraLead({
    name, phone,
    service: SERVICES[String(p.service)] ?? null,
    date, time,
    booked: false,
    handoff: p.handoff === true,
    lang: p.lang === "ar" ? "ar" : "en",
  });
  return json({ ok: true, ...r });
});
