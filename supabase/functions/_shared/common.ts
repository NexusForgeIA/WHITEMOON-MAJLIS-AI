// Utilidades de majlis-cita.
// Secretos (Supabase Secrets, nunca en el cliente):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (los inyecta Supabase)
//   ANTHROPIC_API_KEY                        (el mismo que usa client-chat)
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

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
