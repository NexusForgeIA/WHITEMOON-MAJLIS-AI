/* =========================================================================
   Panel del dueño — Example Garage (demo Majlis AI)

   Dos fuentes de datos con la MISMA interfaz (`store`):

   · Real (por defecto): Supabase Auth + tablas majlis_*. Quien protege los
     datos es la base de datos (RLS: solo usuarios autenticados con
     app_metadata.majlis_role = 'owner'). Ocultar vistas aquí es solo
     interfaz. La clave del fichero es la PUBLICABLE; ningún secreto.

   · Demo (?demo=1): datos ficticios en memoria. NO se crea el cliente de
     Supabase, no hay login, ni lecturas, ni escrituras, ni llamadas a
     funciones. El modo demo solo sustituye la capa de datos: no puede leer
     ni tocar nada real, porque en ese modo no existe ningún cliente que lo
     haga. Al recargar, los datos vuelven a su estado inicial.

   Horas: todo en hora de Doha (Asia/Qatar, UTC+3, sin cambio de hora).
   ========================================================================= */
(() => {
  "use strict";

  const SUPABASE_URL = "https://mlaqtniujnvfxcvcourm.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_6no6BuOgiA_2nonTJntAuQ_DTqEgrcV";
  const CITA_FN = SUPABASE_URL + "/functions/v1/majlis-cita";
  const TZ = "Asia/Qatar";
  const REFRESH_MS = 30000;
  const DEMO = new URLSearchParams(location.search).get("demo") === "1";

  /* ---------- textos ---------- */
  const L = {
    en: {
      brandSub: "Owner panel · Demo", logout: "Sign out", exitDemo: "Exit demo",
      loginTitle: "Sign in", loginLead: "Bookings and call-back requests from Leo, the AI assistant.",
      email: "Email", password: "Password", signIn: "Sign in",
      tryDemo: "Try the demo", demoHint: "Sample data only. Nothing is saved or sent.",
      demoBanner: "DEMO · sample data, nothing is saved or sent",
      loginBad: "Wrong email or password.", noAccess: "This account has no access to this panel.",
      tabsAria: "Panel sections", tabBookings: "Bookings", tabLeads: "Leads without booking",
      refresh: "Refresh", updated: (t) => "Updated " + t,
      fDay: "Day", fUpcoming: "Upcoming", fOneDay: "One day", fAll: "All", fDate: "Date",
      fStatus: "Status", sAll: "All", export: "Export CSV",
      s_confirmed: "Confirmed", s_done: "Attended", s_cancelled: "Cancelled",
      l_new: "New", l_contacted: "Contacted", l_closed: "Closed",
      emptyBookings: "No bookings for these filters.", emptyLeads: "No leads for this filter.",
      markDone: "Mark attended", cancel: "Cancel", cancelSure: "Tap again to cancel",
      move: "Move", moveDate: "New day", moveNone: "No free slots that day.", moveClose: "Close",
      busy: "taken",
      taken: "That slot is already taken. Pick another.",
      markContacted: "Mark contacted", markClosed: "Close", reopen: "Reopen",
      handoff: "Wants a person", pref: "Preferred",
      saveErr: "Couldn't save. Please try again.", loadErr: "Couldn't load data.",
      foot: "Demo · fictitious business · times in Doha (UTC+3)",
      langLabel: "العربية", langAria: "التبديل إلى العربية", langCode: "ar",
      csv: ["Date", "Time", "Service", "Name", "Mobile", "Status"],
    },
    ar: {
      brandSub: "لوحة صاحب الورشة · تجريبي", logout: "تسجيل الخروج", exitDemo: "الخروج من العرض التجريبي",
      loginTitle: "تسجيل الدخول", loginLead: "الحجوزات وطلبات الاتصال من ليو، المساعد الذكي.",
      email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "دخول",
      tryDemo: "جرّب العرض التجريبي", demoHint: "بيانات نموذجية فقط. لا يُحفظ أو يُرسل أي شيء.", // AR-REVIEW
      demoBanner: "عرض تجريبي · بيانات نموذجية، لا يُحفظ أو يُرسل أي شيء", // AR-REVIEW
      loginBad: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", noAccess: "هذا الحساب لا يملك صلاحية الدخول إلى هذه اللوحة.",
      tabsAria: "أقسام اللوحة", tabBookings: "الحجوزات", tabLeads: "طلبات بلا حجز",
      refresh: "تحديث", updated: (t) => "آخر تحديث " + t,
      fDay: "اليوم", fUpcoming: "القادمة", fOneDay: "يوم محدد", fAll: "الكل", fDate: "التاريخ",
      fStatus: "الحالة", sAll: "الكل", export: "تصدير CSV",
      s_confirmed: "مؤكد", s_done: "تمت الخدمة", s_cancelled: "ملغى", // AR-REVIEW
      l_new: "جديد", l_contacted: "تم التواصل", l_closed: "مغلق",
      emptyBookings: "لا توجد حجوزات لهذه الفلاتر.", emptyLeads: "لا توجد طلبات لهذا الفلتر.",
      markDone: "تمت الخدمة", cancel: "إلغاء", cancelSure: "اضغط مرة أخرى للإلغاء",
      move: "نقل", moveDate: "اليوم الجديد", moveNone: "لا توجد مواعيد متاحة في هذا اليوم.", moveClose: "إغلاق",
      busy: "محجوز",
      taken: "هذا الموعد محجوز بالفعل. اختر موعداً آخر.",
      markContacted: "تم التواصل", markClosed: "إغلاق", reopen: "إعادة فتح",
      handoff: "يريد التحدث مع موظف", pref: "المفضّل",
      saveErr: "تعذّر الحفظ. حاول مرة أخرى.", loadErr: "تعذّر تحميل البيانات.",
      foot: "تجريبي · نشاط تجاري وهمي · الأوقات بتوقيت الدوحة (UTC+3)",
      langLabel: "English", langAria: "Switch to English", langCode: "en",
      csv: ["التاريخ", "الساعة", "الخدمة", "الاسم", "الجوال", "الحالة"],
    },
  };
  let lang = document.documentElement.lang === "ar" ? "ar" : "en";
  const T = () => L[lang];
  const loc = () => (lang === "ar" ? "ar-QA-u-nu-latn" : "en-GB");

  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  const pintaTextos = () => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach((n) => {
      const v = T()[n.dataset.t];
      if (typeof v === "string") n.textContent = v;
    });
    document.querySelectorAll("[data-t-attr]").forEach((n) => {
      n.dataset.tAttr.split(";").forEach((p) => { const [a, k] = p.split(":"); n.setAttribute(a, T()[k]); });
    });
    const lb = $("#langBtn");
    lb.querySelector("span").textContent = T().langLabel;
    lb.setAttribute("aria-label", T().langAria);
    lb.setAttribute("lang", T().langCode);
    $("#logoutBtn").textContent = DEMO ? T().exitDemo : T().logout;
  };

  /* ---------- fechas en Doha ---------- */
  const partesDoha = (d) => {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    const o = Object.fromEntries(f.formatToParts(d).map((p) => [p.type, p.value]));
    return { date: `${o.year}-${o.month}-${o.day}`, time: `${o.hour === "24" ? "00" : o.hour}:${o.minute}` };
  };
  const hoyDoha = () => partesDoha(new Date()).date;
  const inicioDia = (date) => `${date}T00:00:00+03:00`;
  const sumaDias = (date, n) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  };
  const diaSemana = (date) => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  const fmtDia = (iso) => new Date(iso).toLocaleDateString(loc(), { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
  const fmtHora = (iso) => partesDoha(new Date(iso)).time;

  /* =======================================================================
     CAPA DE DATOS
     Interfaz común: services() · bookings(f) · leads(f) · update(t,id,c)
     · slots(serviceId, date) → [{ iso, free }]
     update devuelve { error: null | { code } }; '23P01' = hueco ocupado.
     ======================================================================= */
  const filtraBookings = (lista, f) => lista.filter((b) => {
    const d = partesDoha(new Date(b.start_at)).date;
    if (f.range === "upcoming" && d < hoyDoha()) return false;
    if (f.range === "day" && d !== f.date) return false;
    if (f.status && b.status !== f.status) return false;
    return true;
  }).sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));

  /* ---------- real: Supabase ---------- */
  function storeReal() {
    const sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return {
      sb,
      async services() {
        const { data, error } = await sb.from("majlis_services").select("id,name_en,name_ar,duration_min");
        if (error) throw error;
        return data;
      },
      async bookings(f) {
        let q = sb.from("majlis_bookings")
          .select("id,service_id,customer_name,customer_phone,start_at,end_at,status,lang,created_at")
          .order("start_at", { ascending: true }).limit(500);
        if (f.range === "upcoming") q = q.gte("start_at", inicioDia(hoyDoha()));
        if (f.range === "day") q = q.gte("start_at", inicioDia(f.date)).lt("start_at", inicioDia(sumaDias(f.date, 1)));
        if (f.status) q = q.eq("status", f.status);
        const { data, error } = await q;
        if (error) throw error;
        return data;
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
      async update(tabla, id, cambios) {
        const { error } = await sb.from(tabla).update(cambios).eq("id", id);
        return { error };
      },
      /* Los huecos libres los da majlis-cita, los mismos que ve el cliente. */
      async slots(serviceId, date) {
        const r = await fetch(CITA_FN, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "slots", service: serviceId, date }),
        });
        const res = await r.json();
        return (res && res.ok ? res.slots : []).map((iso) => ({ iso, free: true }));
      },
    };
  }

  /* ---------- demo: memoria ---------- */
  function storeDemo() {
    const SERVICES = [
      { id: "oil", name_en: "Oil change", name_ar: "تغيير الزيت", duration_min: 45 },
      { id: "service", name_en: "General service", name_ar: "الصيانة الدورية", duration_min: 60 },
      { id: "inspect", name_en: "Pre-purchase inspection", name_ar: "فحص ما قبل الشراء", duration_min: 60 },
      { id: "tyres", name_en: "Tyres", name_ar: "الإطارات", duration_min: 45 },
      { id: "brakes", name_en: "Brakes", name_ar: "الفرامل", duration_min: 120 },
      { id: "diag", name_en: "Computer diagnostics", name_ar: "الفحص بالكمبيوتر", duration_min: 60 },
      { id: "ac", name_en: "Air conditioning", name_ar: "التكييف", duration_min: 60 },
    ];
    const dur = (id) => (SERVICES.find((s) => s.id === id) || { duration_min: 60 }).duration_min;

    /* Días laborables (dom–jue) alrededor de hoy en Doha: dos pasados para
       las citas atendidas y tres próximos para las confirmadas. */
    const laborables = (desde, paso, n) => {
      const out = []; let d = desde;
      while (out.length < n) { d = sumaDias(d, paso); if (diaSemana(d) <= 4) out.push(d); }
      return out;
    };
    const [p1, p2] = laborables(hoyDoha(), -1, 2);
    const [f1, f2, f3] = laborables(hoyDoha(), 1, 3);
    /* Móviles con formato válido pero claramente ficticios (+974 5000 00xx). */
    const tel = (n) => "+974 5000 00" + String(n).padStart(2, "0");
    const iso = (date, hhmm) => `${date}T${hhmm}:00+03:00`;
    let seq = 0;
    const cita = (date, hhmm, service, name, n, status, lng) => {
      const start = iso(date, hhmm);
      return {
        id: "demo-b" + (++seq), service_id: service, customer_name: name, customer_phone: tel(n),
        start_at: start, end_at: new Date(Date.parse(start) + dur(service) * 60000).toISOString(),
        status, lang: lng, created_at: new Date().toISOString(),
      };
    };
    const bookings = [
      cita(p2, "09:00", "service", "Sara Lewis", 11, "done", "en"),
      cita(p2, "11:30", "ac", "خالد المنصوري", 12, "done", "ar"),
      cita(p1, "08:30", "tyres", "James Carter", 13, "done", "en"),
      cita(p1, "13:00", "diag", "نورة الكعبي", 14, "cancelled", "ar"),
      cita(f1, "09:00", "oil", "Omar Haddad", 15, "confirmed", "en"),
      cita(f1, "10:00", "brakes", "فاطمة السيد", 16, "confirmed", "ar"),
      cita(f1, "14:30", "inspect", "Daniel Brooks", 17, "confirmed", "en"),
      cita(f2, "08:00", "ac", "يوسف الحمادي", 18, "confirmed", "ar"),
      cita(f2, "12:00", "service", "Emma Grant", 19, "cancelled", "en"),
      cita(f3, "16:00", "diag", "مريم العلي", 20, "confirmed", "ar"),
    ];
    const hace = (h) => new Date(Date.now() - h * 3600000).toISOString();
    const leads = [
      { id: "demo-l1", created_at: hace(2), name: "Ahmed Rahman", phone: tel(21), service_id: "tyres", pref_date: f2, pref_time: "10:00", handoff: false, lang: "en", status: "new" },
      { id: "demo-l2", created_at: hace(20), name: "ليلى الشمري", phone: tel(22), service_id: null, pref_date: null, pref_time: null, handoff: true, lang: "ar", status: "contacted" },
      { id: "demo-l3", created_at: hace(50), name: "Chris Martin", phone: tel(23), service_id: "brakes", pref_date: null, pref_time: null, handoff: false, lang: "en", status: "closed" },
    ];
    const db = { majlis_bookings: bookings, majlis_leads: leads };
    const copia = (x) => JSON.parse(JSON.stringify(x));
    const solapa = (b, ini, fin) => b.status !== "cancelled" && ini < Date.parse(b.end_at) && fin > Date.parse(b.start_at);

    return {
      async services() { return copia(SERVICES); },
      async bookings(f) { return copia(filtraBookings(bookings, f)); },
      async leads(f) {
        return copia(leads.filter((l) => !f.status || l.status === f.status)
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
      },
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
      /* Mismo horario que majlis-cita (dom–jue 08:00–18:00, cada 30 min), pero
         devuelve también los ocupados para poder enseñar el aviso. */
      async slots(serviceId, date) {
        if (diaSemana(date) > 4) return [];
        const d = dur(serviceId), out = [];
        for (let m = 8 * 60; m + d <= 18 * 60; m += 30) {
          const hhmm = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
          const ini = Date.parse(iso(date, hhmm));
          if (ini < Date.now() + 3600000) continue;
          out.push({ iso: iso(date, hhmm), free: !bookings.some((b) => solapa(b, ini, ini + d * 60000)) });
        }
        return out;
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
  let store = null;

  /* ---------- sesión ---------- */
  let services = new Map();
  let timer = null;

  const esOwner = (user) => user && user.app_metadata && user.app_metadata.majlis_role === "owner";

  const mostrar = async (ok) => {
    $("#loginView").hidden = !!ok;
    $("#appView").hidden = !ok;
    $("#logoutBtn").hidden = !ok;
    clearInterval(timer);
    if (!ok) return;
    await cargaServicios();
    await recarga();
    if (!DEMO) timer = setInterval(() => { if (!document.hidden) recarga(); }, REFRESH_MS);
  };

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (DEMO || !store) return;
    const err = $("#loginErr");
    err.hidden = true;
    $("#loginBtn").disabled = true;
    const { data, error } = await store.sb.auth.signInWithPassword({
      email: $("#email").value.trim(),
      password: $("#password").value,
    });
    $("#loginBtn").disabled = false;
    $("#password").value = "";
    if (error) { err.textContent = T().loginBad; err.hidden = false; return; }
    if (!esOwner(data.user)) {
      await store.sb.auth.signOut();
      err.textContent = T().noAccess; err.hidden = false; return;
    }
    mostrar(true);
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (DEMO) { location.href = location.pathname; return; }
    await store.sb.auth.signOut();
    mostrar(false);
  });

  /* ---------- datos ---------- */
  const cargaServicios = async () => {
    try { services = new Map((await store.services()).map((s) => [s.id, s])); }
    catch (e) { console.warn("[panel] services", e.message || e); }
  };
  const nombreSvc = (id) => {
    const s = services.get(id);
    return s ? (lang === "ar" ? s.name_ar : s.name_en) : (id || "—");
  };

  let bookings = [];
  let leads = [];
  const filtro = () => ({
    range: $("#fRange").value,
    date: $("#fDate").value || hoyDoha(),
    status: $("#fStatus").value,
  });

  const carga = async (fn, errBox) => {
    try { $(errBox).hidden = true; return await fn(); }
    catch (e) {
      console.warn("[panel]", e.message || e);
      $(errBox).textContent = T().loadErr; $(errBox).hidden = false;
      return null;
    }
  };

  const recarga = async () => {
    const [b, l] = await Promise.all([
      carga(() => store.bookings(filtro()), "#bookingsErr"),
      carga(() => store.leads({ status: $("#fLeadStatus").value }), "#leadsErr"),
    ]);
    if (b) bookings = b;
    if (l) leads = l;
    pintaBookings();
    pintaLeads();
    $("#updatedAt").textContent = T().updated(partesDoha(new Date()).time);
  };

  /* ---------- citas ---------- */
  const badge = (kind, text) => el("span", "p-badge p-badge--" + kind, text);
  const tel = (phone) => {
    const a = el("a", "", phone);
    a.href = "tel:" + phone.replace(/\s/g, "");
    a.setAttribute("dir", "ltr");
    return a;
  };

  const actualiza = async (tabla, id, cambios, errBox) => {
    const { error } = await store.update(tabla, id, cambios);
    if (error) {
      console.warn("[panel] update", error.code, error.message || "");
      $(errBox).textContent = error.code === "23P01" ? T().taken : T().saveErr;
      $(errBox).hidden = false;
      return false;
    }
    $(errBox).hidden = true;
    await recarga();
    return true;
  };

  function pintaBookings() {
    const ul = $("#bookingsList");
    ul.textContent = "";
    $("#bookingsEmpty").hidden = bookings.length > 0;
    $("#countBookings").textContent = String(bookings.filter((b) => b.status === "confirmed").length);
    bookings.forEach((b) => {
      const li = el("li", "p-card p-item");
      const when = el("div", "p-when");
      when.append(el("b", "", fmtHora(b.start_at)), el("small", "", fmtDia(b.start_at)));
      const main = el("div", "p-main");
      const h = el("h3", "", nombreSvc(b.service_id));
      h.append(badge(b.status, T()["s_" + b.status]));
      const meta = el("p", "p-meta");
      const nm = el("span", "", b.customer_name); nm.setAttribute("dir", "auto");
      meta.append(nm, tel(b.customer_phone));
      main.append(h, meta);
      li.append(when, main);

      if (b.status === "confirmed") {
        const acts = el("div", "p-actions");
        const done = el("button", "p-btn p-btn--sm", T().markDone);
        done.type = "button";
        done.addEventListener("click", () => actualiza("majlis_bookings", b.id, { status: "done" }, "#bookingsErr"));
        const mover = el("button", "p-btn p-btn--ghost p-btn--sm", T().move);
        mover.type = "button";
        mover.addEventListener("click", () => abreMover(li, b));
        /* Cancelar en dos toques, sin diálogo del navegador. */
        const cancel = el("button", "p-btn p-btn--danger p-btn--sm", T().cancel);
        cancel.type = "button";
        let armado = null;
        cancel.addEventListener("click", () => {
          if (!armado) {
            cancel.classList.add("is-armed"); cancel.textContent = T().cancelSure;
            armado = setTimeout(() => { armado = null; cancel.classList.remove("is-armed"); cancel.textContent = T().cancel; }, 4000);
            return;
          }
          clearTimeout(armado);
          actualiza("majlis_bookings", b.id, { status: "cancelled" }, "#bookingsErr");
        });
        acts.append(done, mover, cancel);
        li.append(acts);
      }
      ul.append(li);
    });
  }

  /* Mover: la capa de datos da los huecos; si uno está ocupado (o lo coge
     otra persona entre medias) update devuelve 23P01 y se avisa. */
  function abreMover(li, b) {
    const prev = li.querySelector(".p-move");
    if (prev) { prev.remove(); return; }
    const box = el("div", "p-move");
    const lab = el("label", "", T().moveDate);
    const inp = el("input");
    inp.type = "date"; inp.min = hoyDoha(); inp.value = partesDoha(new Date(b.start_at)).date;
    lab.append(document.createElement("br"), inp);
    const slots = el("div", "p-move__slots");
    const cerrar = el("button", "p-btn p-btn--ghost p-btn--sm", T().moveClose);
    cerrar.type = "button";
    cerrar.addEventListener("click", () => box.remove());
    const pinta = async () => {
      slots.textContent = "";
      try {
        const lista = await store.slots(b.service_id, inp.value);
        if (!lista.some((s) => s.free)) { slots.append(el("span", "p-muted", T().moveNone)); }
        lista.forEach(({ iso, free }) => {
          const bt = el("button", free ? "" : "is-busy", iso.slice(11, 16));
          bt.type = "button";
          if (!free) bt.setAttribute("aria-label", iso.slice(11, 16) + ", " + T().busy);
          bt.addEventListener("click", () => {
            const dur = Date.parse(b.end_at) - Date.parse(b.start_at);
            actualiza("majlis_bookings", b.id, {
              start_at: iso,
              end_at: new Date(Date.parse(iso) + dur).toISOString(),
            }, "#bookingsErr");
          });
          slots.append(bt);
        });
      } catch (e) {
        console.warn("[panel] slots", e);
        slots.append(el("span", "p-muted", T().loadErr));
      }
    };
    inp.addEventListener("change", pinta);
    box.append(lab, slots, cerrar);
    li.append(box);
    pinta();
  }

  /* ---------- leads ---------- */
  function pintaLeads() {
    const ul = $("#leadsList");
    ul.textContent = "";
    $("#leadsEmpty").hidden = leads.length > 0;
    $("#countLeads").textContent = String(leads.filter((l) => l.status === "new").length);
    leads.forEach((l) => {
      const li = el("li", "p-card p-item");
      const when = el("div", "p-when");
      when.append(el("b", "", fmtHora(l.created_at)), el("small", "", fmtDia(l.created_at)));
      const main = el("div", "p-main");
      const nm = el("h3", "", "");
      const n = el("span", "", l.name); n.setAttribute("dir", "auto");
      nm.append(n, badge(l.status, T()["l_" + l.status]));
      if (l.handoff) nm.append(badge("handoff", T().handoff));
      const meta = el("p", "p-meta");
      meta.append(tel(l.phone));
      if (l.service_id) meta.append(el("span", "", nombreSvc(l.service_id)));
      if (l.pref_date) meta.append(el("span", "", T().pref + ": " + l.pref_date + (l.pref_time ? " " + l.pref_time : "")));
      main.append(nm, meta);
      li.append(when, main);
      const acts = el("div", "p-actions");
      const boton = (txt, status, cls) => {
        const bt = el("button", "p-btn p-btn--sm" + (cls ? " " + cls : ""), txt);
        bt.type = "button";
        bt.addEventListener("click", () => actualiza("majlis_leads", l.id, { status }, "#leadsErr"));
        acts.append(bt);
      };
      if (l.status === "new") { boton(T().markContacted, "contacted"); boton(T().markClosed, "closed", "p-btn--ghost"); }
      else if (l.status === "contacted") boton(T().markClosed, "closed", "p-btn--ghost");
      else boton(T().reopen, "new", "p-btn--ghost");
      li.append(acts);
      ul.append(li);
    });
  }

  /* ---------- exportar ---------- */
  $("#exportBtn").addEventListener("click", () => {
    const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const filas = [T().csv].concat(bookings.map((b) => [
      partesDoha(new Date(b.start_at)).date, fmtHora(b.start_at), nombreSvc(b.service_id),
      b.customer_name, b.customer_phone, T()["s_" + b.status],
    ]));
    const blob = new Blob(["﻿" + filas.map((f) => f.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (DEMO ? "demo-bookings-" : "bookings-") + hoyDoha() + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- pestañas y filtros ---------- */
  const tab = (cual) => {
    const b = cual === "bookings";
    $("#tabBookings").setAttribute("aria-selected", String(b));
    $("#tabLeads").setAttribute("aria-selected", String(!b));
    $("#bookingsPane").hidden = !b;
    $("#leadsPane").hidden = b;
  };
  $("#tabBookings").addEventListener("click", () => tab("bookings"));
  $("#tabLeads").addEventListener("click", () => tab("leads"));
  $("#fRange").addEventListener("change", () => {
    $("#fDayWrap").hidden = $("#fRange").value !== "day";
    if (!$("#fDate").value) $("#fDate").value = hoyDoha();
    recarga();
  });
  ["#fDate", "#fStatus", "#fLeadStatus"].forEach((s) => $(s).addEventListener("change", recarga));
  $("#refreshBtn").addEventListener("click", recarga);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("#appView").hidden) recarga(); });

  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("lang", lang); } catch (e) { /* modo privado */ }
    pintaTextos();
    if (!$("#appView").hidden) { pintaBookings(); pintaLeads(); }
  });

  /* ---------- arranque ---------- */
  $("#demoBanner").hidden = !DEMO;
  document.body.classList.toggle("is-demo", DEMO);
  pintaTextos();
  if (DEMO) {
    store = storeDemo();
    mostrar(true);
  } else {
    cargaLib().then(() => {
      store = storeReal();
      return store.sb.auth.getSession();
    }).then(({ data }) => mostrar(!!(data.session && esOwner(data.session.user))))
      .catch((e) => { console.warn("[panel] supabase-js", e); mostrar(false); });
  }
})();
