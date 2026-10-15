/* =========================================================================
   Panel del dueño · capa de datos y utilidades (window.MP)

   Dos fuentes con la MISMA interfaz (`MP.store`):
   · Real: Supabase Auth + tablas majlis_* (RLS: solo app_metadata.majlis_role
     = 'owner'). Las vistas nuevas (resumen, calendario, taller, clientes)
     dependen de `store.caps`, que se activan solo si la migración
     panel_pro está aplicada (detectCaps). Todo sale de datos reales: sin
     precios cargados no hay cifra de ingresos, y no hay kilometraje.
   · Demo (?demo=1): datos ficticios en memoria. No se crea el cliente de
     Supabase ni se descarga supabase-js; no hay ninguna llamada externa.
     Al recargar, todo vuelve al estado inicial.

   Horas siempre en Doha (Asia/Qatar, UTC+3, sin cambio de hora).
   ========================================================================= */
(() => {
  "use strict";

  const SUPABASE_URL = "https://mlaqtniujnvfxcvcourm.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_6no6BuOgiA_2nonTJntAuQ_DTqEgrcV";
  const CITA_FN = SUPABASE_URL + "/functions/v1/majlis-cita";
  const TZ = "Asia/Qatar";
  const DEMO = new URLSearchParams(location.search).get("demo") === "1";

  /* Estados de trabajo del vehículo, en orden. */
  const WORK = ["received", "diagnosing", "parts", "in_progress", "ready", "delivered"];
  /* Horario de la demo: dom–jue, 08:00–18:00, franjas de 30 min. */
  const OPEN_MIN = 8 * 60, CLOSE_MIN = 18 * 60, STEP = 30;

  /* ---------- fechas en Doha ---------- */
  const partesDoha = (d) => {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    const o = Object.fromEntries(f.formatToParts(d).map((p) => [p.type, p.value]));
    return { date: `${o.year}-${o.month}-${o.day}`, time: `${o.hour === "24" ? "00" : o.hour}:${o.minute}` };
  };
  const hoyDoha = () => partesDoha(new Date()).date;
  const ahoraDoha = () => partesDoha(new Date()).time;
  const inicioDia = (date) => `${date}T00:00:00+03:00`;
  const sumaDias = (date, n) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  };
  const diaSemana = (date) => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  const abre = (date) => diaSemana(date) <= 4;
  /* Domingo de la semana que contiene `date`. */
  const inicioSemana = (date) => sumaDias(date, -diaSemana(date));
  const isoAt = (date, hhmm) => `${date}T${hhmm}:00+03:00`;
  const hhmm = (min) => String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
  const minDe = (iso) => { const t = partesDoha(new Date(iso)).time.split(":").map(Number); return t[0] * 60 + t[1]; };
  const diaDe = (iso) => partesDoha(new Date(iso)).date;
  const durMin = (b) => Math.round((Date.parse(b.end_at) - Date.parse(b.start_at)) / 60000);
  const solapa = (b, ini, fin) => b.status !== "cancelled" && ini < Date.parse(b.end_at) && fin > Date.parse(b.start_at);

  const filtraBookings = (lista, f) => lista.filter((b) => {
    const d = diaDe(b.start_at);
    if (f.range === "upcoming" && d < hoyDoha()) return false;
    if (f.range === "day" && d !== f.date) return false;
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
    if (f.status && b.status !== f.status) return false;
    return true;
  }).sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));

  /* =======================================================================
     REAL · Supabase
     ======================================================================= */
  function storeReal() {
    const sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    const COLS = "id,service_id,customer_name,customer_phone,start_at,end_at,status,lang,created_at";
    const COLS_PRO = COLS + ",work_status,vehicle_label,notes";
    let pro = false;
    /* Últimas citas cargadas: sirven para el indicador libre/ocupado al
       arrastrar en el calendario. La restricción de la tabla es la que manda. */
    let cache = [];
    const store = {
      sb,
      /* Hasta comprobar la migración de la fase 2, solo citas y leads. */
      caps: { overview: false, calendar: false, workshop: false, customers: false, revenue: false, prices: false },
      workshopDay: null,
      /* ¿Está aplicada la migración panel_pro? Si las columnas nuevas no
         existen (o no hay permiso), el panel sigue como en la fase 1. */
      async detectCaps() {
        const [a, b] = await Promise.all([
          sb.from("majlis_bookings").select("work_status").limit(1),
          sb.from("majlis_services").select("price_qar").limit(1),
        ]);
        pro = !a.error && !b.error;
        if (!pro) { console.warn("[panel] panel_pro no disponible:", (a.error || b.error).message); return; }
        store.caps = { overview: true, calendar: true, workshop: true, customers: true, revenue: true, prices: true };
      },
      async services() {
        const { data, error } = await sb.from("majlis_services")
          .select(pro ? "id,name_en,name_ar,duration_min,price_qar" : "id,name_en,name_ar,duration_min").order("sort");
        if (error) throw error;
        return data;
      },
      async bookings(f) {
        let q = sb.from("majlis_bookings").select(pro ? COLS_PRO : COLS)
          .order("start_at", { ascending: true }).limit(1000);
        if (f.range === "upcoming") q = q.gte("start_at", inicioDia(hoyDoha()));
        if (f.range === "day") q = q.gte("start_at", inicioDia(f.date)).lt("start_at", inicioDia(sumaDias(f.date, 1)));
        if (f.from) q = q.gte("start_at", inicioDia(f.from));
        if (f.to) q = q.lt("start_at", inicioDia(sumaDias(f.to, 1)));
        if (f.status) q = q.eq("status", f.status);
        const { data, error } = await q;
        if (error) throw error;
        const ids = new Set(data.map((b) => b.id));
        cache = cache.filter((b) => !ids.has(b.id)).concat(data);
        return data;
      },
      /* Ficha: la cita y su historial (majlis_status_log). */
      async booking(id) {
        const [b, l] = await Promise.all([
          sb.from("majlis_bookings").select(COLS_PRO).eq("id", id).maybeSingle(),
          sb.from("majlis_status_log").select("at,from_status,to_status").eq("booking_id", id).order("at"),
        ]);
        if (b.error) throw b.error;
        if (!b.data) return null;
        return { ...b.data, log: (l.data || []).map((x) => ({ at: x.at, from: x.from_status, to: x.to_status })) };
      },
      async leads(f) {
        let q = sb.from("majlis_leads")
          .select("id,created_at,name,phone,service_id,pref_date,pref_time,handoff,lang,status")
          .order("created_at", { ascending: false }).limit(500);
        if (f.status) q = q.eq("status", f.status);
        const { data, error } = await q;
        if (error) throw error;
        return data;
      },
      /* Clientes: vista majlis_customers_v (security_invoker) + planes activos.
         En real no hay kilometraje: no se inventa. */
      async customers() {
        const hoy = hoyDoha();
        const [v, p] = await Promise.all([
          sb.from("majlis_customers_v").select("phone,name,vehicle_label,visits,last_visit,next_booking"),
          sb.from("majlis_plans").select("id,customer_phone,fee_qar,started_on,ended_on").or("ended_on.is.null,ended_on.gte." + hoy),
        ]);
        if (v.error) throw v.error;
        if (p.error) throw p.error;
        return v.data.map((c) => {
          const plan = p.data.find((x) => x.customer_phone === c.phone);
          return {
            phone: c.phone, name: c.name, vehicle_label: c.vehicle_label, mileage_km: null,
            visits: c.visits, last_visit: c.last_visit ? diaDe(c.last_visit) : null,
            plan: plan ? { id: plan.id, fee_qar: Number(plan.fee_qar), since: plan.started_on } : null,
            reminder_at: null,
          };
        });
      },
      async update(tabla, id, cambios) {
        const { error } = await sb.from(tabla).update(cambios).eq("id", id);
        return { error };
      },
      /* Cambio de estado + historial en una sola transacción (rpc). */
      async setWorkStatus(id, to) {
        const { error } = await sb.rpc("majlis_set_work_status", { p_booking: id, p_to: to });
        return { error };
      },
      async setPrice(serviceId, price) {
        const { error } = await sb.from("majlis_services").update({ price_qar: price }).eq("id", serviceId);
        return { error };
      },
      async addPlan(phone, name, fee) {
        const { error } = await sb.from("majlis_plans").insert({ customer_phone: phone, customer_name: name, fee_qar: fee });
        return { error };
      },
      async endPlan(id) {
        const { error } = await sb.from("majlis_plans").update({ ended_on: hoyDoha() }).eq("id", id);
        return { error };
      },
      /* En real el recordatorio es solo la vista previa del mensaje: no hay
         canal de envío conectado y no se guarda nada. */
      async remind() { return { error: null }; },
      /* Los huecos libres los da majlis-cita, los mismos que ve el cliente. */
      async slots(serviceId, date) {
        const r = await fetch(CITA_FN, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "slots", service: serviceId, date }),
        });
        const res = await r.json();
        return (res && res.ok ? res.slots : []).map((iso) => ({ iso, free: true }));
      },
      isFree(id, iso) {
        const b = cache.find((x) => x.id === id);
        if (!b) return false;
        const ini = Date.parse(iso), fin = ini + durMin(b) * 60000, m = minDe(iso);
        if (!abre(diaDe(iso)) || m < OPEN_MIN || m + durMin(b) > CLOSE_MIN || ini < Date.now() + 3600000) return false;
        return !cache.some((x) => x.id !== id && solapa(x, ini, fin));
      },
    };
    return store;
  }

  /* =======================================================================
     DEMO · memoria
     ======================================================================= */
  function storeDemo() {
    /* Precios: cifras de ejemplo, etiquetadas en pantalla como «Sample figures». */
    const SERVICES = [
      { id: "oil", name_en: "Oil change", name_ar: "تغيير الزيت", duration_min: 45, price_qar: 250 },
      { id: "service", name_en: "General service", name_ar: "الصيانة الدورية", duration_min: 60, price_qar: 450 },
      { id: "inspect", name_en: "Pre-purchase inspection", name_ar: "فحص ما قبل الشراء", duration_min: 60, price_qar: 300 },
      { id: "tyres", name_en: "Tyres", name_ar: "الإطارات", duration_min: 45, price_qar: 200 },
      { id: "brakes", name_en: "Brakes", name_ar: "الفرامل", duration_min: 120, price_qar: 600 },
      { id: "diag", name_en: "Computer diagnostics", name_ar: "الفحص بالكمبيوتر", duration_min: 60, price_qar: 200 },
      { id: "ac", name_en: "Air conditioning", name_ar: "التكييف", duration_min: 60, price_qar: 350 },
    ];
    const svc = (id) => SERVICES.find((s) => s.id === id);

    /* Clientes ficticios. Móviles con formato válido pero claramente de
       ejemplo (+974 5000 00xx). Vehículos en texto libre, sin marcas. */
    const CLIENTES = [
      { n: 11, name: "Sara Lewis", vehicle: "Compact SUV · white · 2021", km: 38500 },
      { n: 12, name: "خالد المنصوري", vehicle: "Large SUV · black · 2019", km: 92000, plan: 199 },
      { n: 13, name: "James Carter", vehicle: "Saloon · grey · 2020", km: 61000 },
      { n: 14, name: "نورة الكعبي", vehicle: "Hatchback · red · 2022", km: 21000 },
      { n: 15, name: "Omar Haddad", vehicle: "Pickup · silver · 2018", km: 120500, plan: 149 },
      { n: 16, name: "فاطمة السيد", vehicle: "Coupe · blue · 2023", km: 9800 },
      { n: 17, name: "Daniel Brooks", vehicle: "Saloon · white · 2017", km: 143000 },
      { n: 18, name: "يوسف الحمادي", vehicle: "Large SUV · pearl · 2021", km: 54000, plan: 199 },
      { n: 19, name: "Emma Grant", vehicle: "Estate · green · 2016", km: 158000 },
      { n: 20, name: "مريم العلي", vehicle: "Compact SUV · grey · 2020", km: 47000, plan: 149 },
    ];
    const tel = (n) => "+974 5000 00" + String(n).padStart(2, "0");
    const cli = (n) => CLIENTES.find((c) => c.n === n);

    /* Días laborables alrededor de hoy (Doha). */
    const laborables = (desde, paso, n, incluir) => {
      const out = []; let d = desde;
      if (incluir && abre(d)) out.push(d);
      while (out.length < n) { d = sumaDias(d, paso); if (abre(d)) out.push(d); }
      return out;
    };
    const hoy = hoyDoha();
    const pasados = laborables(hoy, -1, 6, false).reverse();      // 6 laborables anteriores
    const hoyLab = abre(hoy) ? hoy : null;
    const futuros = laborables(hoy, 1, 7, false);                 // 7 laborables siguientes
    const ultimo = hoyLab || pasados[pasados.length - 1];         // "hoy" a efectos del taller

    let seq = 0;
    const stamp = (date, t) => isoAt(date, t);
    const bookings = [];
    const cita = (date, t, service, n, status, work, nota) => {
      const start = isoAt(date, t);
      const c = cli(n);
      const b = {
        id: "demo-b" + (++seq), service_id: service, customer_name: c.name, customer_phone: tel(n),
        start_at: start, end_at: new Date(Date.parse(start) + svc(service).duration_min * 60000).toISOString(),
        status, lang: /[؀-ۿ]/.test(c.name) ? "ar" : "en", created_at: new Date().toISOString(),
        vehicle_label: c.vehicle, notes: nota || "", work_status: work || null, log: [],
      };
      /* Historial coherente hasta el estado actual, con horas del mismo día. */
      if (work) {
        const hasta = WORK.indexOf(work);
        let m = minDe(start);
        for (let i = 0; i <= hasta; i++) {
          b.log.push({ at: stamp(date, hhmm(Math.min(m, CLOSE_MIN - 5))), from: i ? WORK[i - 1] : null, to: WORK[i] });
          m += 25 + i * 10;
        }
      }
      bookings.push(b);
      return b;
    };

    /* Semana pasada y días anteriores: atendidas (entregadas), alguna cancelada. */
    const [p6, p5, p4, p3, p2, p1] = pasados;
    cita(p6, "09:00", "service", 11, "done", "delivered");
    cita(p6, "13:00", "ac", 12, "done", "delivered");
    cita(p5, "08:30", "tyres", 13, "done", "delivered");
    cita(p5, "11:00", "diag", 14, "cancelled");
    cita(p4, "10:00", "oil", 15, "done", "delivered");
    cita(p4, "14:00", "brakes", 16, "done", "delivered");
    cita(p3, "09:30", "inspect", 17, "done", "delivered");
    cita(p3, "15:00", "ac", 20, "done", "delivered");
    cita(p2, "08:00", "service", 18, "done", "delivered");
    cita(p2, "12:30", "oil", 19, "cancelled");
    /* En taller: el último laborable (hoy si se abre) y el anterior. */
    const enTaller = hoyLab ? [p1, hoyLab] : [p2, p1];
    cita(enTaller[0], "08:00", "brakes", 15, "confirmed", "parts", "Rear pads worn. Waiting for parts from supplier.");
    cita(enTaller[0], "11:00", "diag", 17, "confirmed", "ready", "Fault code cleared after sensor reconnection.");
    cita(enTaller[1], "08:00", "service", 12, "confirmed", "in_progress");
    cita(enTaller[1], "09:30", "ac", 19, "confirmed", "diagnosing", "Customer reports weak cooling at idle.");
    cita(enTaller[1], "11:00", "oil", 14, "confirmed", "received");
    cita(enTaller[1], "14:00", "tyres", 11, "confirmed", hoyLab ? null : "received");
    /* Próximos días: confirmadas, alguna cancelada. */
    const [f1, f2, f3, f4, f5, f6, f7] = futuros;
    cita(f1, "09:00", "oil", 13, "confirmed");
    cita(f1, "10:00", "brakes", 16, "confirmed");
    cita(f1, "14:30", "inspect", 17, "confirmed");
    cita(f2, "08:00", "ac", 18, "confirmed");
    cita(f2, "12:00", "service", 19, "cancelled");
    cita(f3, "09:00", "diag", 20, "confirmed");
    cita(f3, "16:00", "tyres", 15, "confirmed");
    cita(f4, "10:30", "service", 11, "confirmed");
    cita(f5, "08:30", "oil", 12, "confirmed");
    cita(f6, "13:00", "ac", 14, "confirmed");
    cita(f7, "09:00", "brakes", 13, "confirmed");

    const hace = (h) => new Date(Date.now() - h * 3600000).toISOString();
    const leads = [
      { id: "demo-l1", created_at: hace(2), name: "Ahmed Rahman", phone: tel(21), service_id: "tyres", pref_date: f2, pref_time: "10:00", handoff: false, lang: "en", status: "new" },
      { id: "demo-l2", created_at: hace(20), name: "ليلى الشمري", phone: tel(22), service_id: null, pref_date: null, pref_time: null, handoff: true, lang: "ar", status: "contacted" },
      { id: "demo-l3", created_at: hace(50), name: "Chris Martin", phone: tel(23), service_id: "brakes", pref_date: null, pref_time: null, handoff: false, lang: "en", status: "closed" },
    ];
    /* Ficha de cliente: kilometraje y plan de mantenimiento (cifras de ejemplo). */
    const customers = CLIENTES.map((c) => ({
      phone: tel(c.n), name: c.name, vehicle_label: c.vehicle, mileage_km: c.km,
      plan: c.plan ? { id: "demo-p" + c.n, fee_qar: c.plan, since: sumaDias(hoy, -40 * (c.n % 5 + 1)) } : null,
      reminder_at: null,
    }));

    const db = { majlis_bookings: bookings, majlis_leads: leads };
    const copia = (x) => JSON.parse(JSON.stringify(x));

    return {
      caps: { overview: true, calendar: true, workshop: true, customers: true, revenue: true, prices: true },
      workshopDay: ultimo,
      async services() { return copia(SERVICES); },
      async bookings(f) { return copia(filtraBookings(bookings, f)); },
      async booking(id) { return copia(bookings.find((b) => b.id === id) || null); },
      async leads(f) {
        return copia(leads.filter((l) => !f.status || l.status === f.status)
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
      },
      async customers() { return copia(customers); },
      async update(tabla, id, cambios) {
        const fila = (db[tabla] || []).find((r) => r.id === id);
        if (!fila) return { error: { code: "not-found" } };
        /* Misma regla que la restricción de exclusión de la tabla real. */
        if (tabla === "majlis_bookings" && cambios.start_at) {
          const ini = Date.parse(cambios.start_at), fin = Date.parse(cambios.end_at);
          if (bookings.some((b) => b.id !== id && solapa(b, ini, fin))) return { error: { code: "23P01" } };
        }
        Object.assign(fila, cambios);
        return { error: null };
      },
      /* Cambio de estado de trabajo + línea de historial con hora de Doha. */
      async setWorkStatus(id, to) {
        const b = bookings.find((x) => x.id === id);
        if (!b) return { error: { code: "not-found" } };
        const from = b.work_status;
        if (from === to) return { error: null };
        b.work_status = to;
        b.log.push({ at: new Date().toISOString(), from, to });
        if (to === "delivered" && b.status === "confirmed") b.status = "done";
        return { error: null };
      },
      async setPrice(serviceId, price) {
        const s = svc(serviceId);
        if (s) s.price_qar = price;
        return { error: null };
      },
      async addPlan(phone, name, fee) {
        const c = customers.find((x) => x.phone === phone);
        if (c) c.plan = { id: "demo-p" + phone.slice(-2), fee_qar: fee, since: hoyDoha() };
        return { error: null };
      },
      async endPlan(id) {
        const c = customers.find((x) => x.plan && x.plan.id === id);
        if (c) c.plan = null;
        return { error: null };
      },
      async remind(phone) {
        const c = customers.find((x) => x.phone === phone);
        if (c) c.reminder_at = new Date().toISOString();
        return { error: null };
      },
      /* Mismo horario que majlis-cita, pero también devuelve los ocupados. */
      async slots(serviceId, date, excludeId) {
        if (!abre(date)) return [];
        const d = svc(serviceId) ? svc(serviceId).duration_min : 60, out = [];
        for (let m = OPEN_MIN; m + d <= CLOSE_MIN; m += STEP) {
          const ini = Date.parse(isoAt(date, hhmm(m)));
          if (ini < Date.now() + 3600000) continue;
          out.push({ iso: isoAt(date, hhmm(m)), free: !bookings.some((b) => b.id !== excludeId && solapa(b, ini, ini + d * 60000)) });
        }
        return out;
      },
      /* ¿Cabe la cita `id` empezando en `iso`? (para arrastrar en el calendario) */
      isFree(id, iso) {
        const b = bookings.find((x) => x.id === id);
        if (!b) return false;
        const ini = Date.parse(iso), fin = ini + durMin(b) * 60000;
        const m = minDe(iso);
        if (!abre(diaDe(iso)) || m < OPEN_MIN || m + durMin(b) > CLOSE_MIN) return false;
        return !bookings.some((x) => x.id !== id && solapa(x, ini, fin));
      },
    };
  }

  /* supabase-js solo se descarga en modo real. */
  const cargaLib = () => new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = "vendor/supabase.min.js";
    s.onload = ok; s.onerror = ko;
    document.head.appendChild(s);
  });

  window.MP = {
    DEMO, TZ, WORK, OPEN_MIN, CLOSE_MIN, STEP,
    store: null,
    init: async () => {
      if (DEMO) { window.MP.store = storeDemo(); return; }
      await cargaLib();
      window.MP.store = storeReal();
    },
    partesDoha, hoyDoha, ahoraDoha, inicioDia, sumaDias, diaSemana, abre, inicioSemana,
    isoAt, hhmm, minDe, diaDe, durMin,
  };
})();
