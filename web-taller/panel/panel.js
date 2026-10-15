/* =========================================================================
   Panel del dueño — Example Garage (demo Majlis AI) · esqueleto

   Seguridad: el login real es Supabase Auth y quien protege los datos es la
   base de datos (RLS, solo app_metadata.majlis_role = 'owner'). Ocultar
   vistas aquí es solo interfaz. Ver data.js para las dos capas de datos.

   Vistas (pestañas): resumen, calendario, taller, citas, clientes, leads.
   Cada vista nueva se registra en MP.views y solo se muestra si la capa de
   datos la soporta (store.caps): en real, fase 1, solo citas y leads.
   ========================================================================= */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI;
  const T = I.T;
  const REFRESH_MS = 30000;

  /* ---------- utilidades de interfaz (compartidas con las vistas) ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  };
  const badge = (kind, text) => el("span", "p-badge p-badge--" + kind, text);
  const tel = (phone) => {
    const a = el("a", "", phone);
    a.href = "tel:" + phone.replace(/\s/g, "");
    a.setAttribute("dir", "ltr");
    return a;
  };
  const fmtDia = (iso) => new Date(iso).toLocaleDateString(I.loc(), { timeZone: MP.TZ, weekday: "short", day: "numeric", month: "short" });
  const fmtFecha = (date) => new Date(date + "T12:00:00+03:00").toLocaleDateString(I.loc(), { timeZone: MP.TZ, weekday: "short", day: "numeric", month: "short" });
  const fmtHora = (iso) => MP.partesDoha(new Date(iso)).time;
  let services = new Map();
  const svcName = (id) => {
    const s = services.get(id);
    return s ? (I.lang === "ar" ? s.name_ar : s.name_en) : (id || "—");
  };
  const boton = (txt, cls, onClick) => {
    const b = el("button", "p-btn p-btn--sm" + (cls ? " " + cls : ""), txt);
    b.type = "button";
    if (onClick) b.addEventListener("click", onClick);
    return b;
  };
  /* Aviso breve (rol status), sin diálogos del navegador. */
  let toastT = null;
  const toast = (texto, error) => {
    const t = $("#toast");
    t.textContent = texto;
    t.classList.toggle("is-err", !!error);
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 3200);
  };

  MP.ui = { $, el, badge, tel, fmtDia, fmtFecha, fmtHora, svcName, boton, toast, services: () => services };

  /* Brillo holográfico que sigue al puntero en las tarjetas .p-holo: una
     escritura por frame (rAF) y solo con ratón; en táctil no hay brillo. */
  const hover = matchMedia("(hover:hover) and (pointer:fine)").matches;
  MP.holoBind = (root) => {
    if (!hover) return;
    root.querySelectorAll(".p-holo").forEach((c) => {
      if (c.dataset.holo) return;
      c.dataset.holo = "1";
      let x = 0, y = 0, pend = false;
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (pend) return;
        pend = true;
        requestAnimationFrame(() => { c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px"); pend = false; });
      }, { passive: true });
    });
  };
  MP.views = MP.views || {};

  /* ---------- textos ---------- */
  const pintaTextos = () => {
    document.documentElement.lang = I.lang;
    document.documentElement.dir = I.lang === "ar" ? "rtl" : "ltr";
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
    $("#logoutBtn").textContent = MP.DEMO ? T().exitDemo : T().logout;
  };

  /* ---------- pestañas ---------- */
  const TABS = [
    { id: "overview", cap: "overview" },
    { id: "calendar", cap: "calendar" },
    { id: "workshop", cap: "workshop" },
    { id: "bookings" },
    { id: "customers", cap: "customers" },
    { id: "leads" },
  ];
  let actual = "bookings";
  const disponibles = () => TABS.filter((t) => !t.cap || (MP.store && MP.store.caps[t.cap]));
  const tab = (id) => {
    actual = id;
    TABS.forEach((t) => {
      const b = $("#tab-" + t.id), p = $("#pane-" + t.id);
      const on = t.id === id;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      p.hidden = !on;
    });
    pintaVista();
  };
  TABS.forEach((t) => $("#tab-" + t.id).addEventListener("click", () => tab(t.id)));
  /* Flechas izquierda/derecha entre pestañas (y al revés en RTL). */
  $("#tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const lista = disponibles().map((t) => t.id);
    const rtl = document.documentElement.dir === "rtl";
    const paso = (e.key === "ArrowRight") !== rtl ? 1 : -1;
    const i = (lista.indexOf(actual) + paso + lista.length) % lista.length;
    tab(lista[i]);
    $("#tab-" + lista[i]).focus();
  });

  /* ---------- sesión ---------- */
  let timer = null;
  const esOwner = (user) => user && user.app_metadata && user.app_metadata.majlis_role === "owner";

  const mostrar = async (ok) => {
    $("#loginView").hidden = !!ok;
    $("#appView").hidden = !ok;
    $("#logoutBtn").hidden = !ok;
    clearInterval(timer);
    if (!ok) return;
    TABS.forEach((t) => { $("#tab-" + t.id).hidden = !disponibles().includes(t); });
    await cargaServicios();
    /* Enlace directo a una pestaña: #tab=calendar (si está disponible). */
    const pedida = (location.hash.match(/^#tab=(\w+)$/) || [])[1];
    const inicial = disponibles().some((t) => t.id === pedida) ? pedida : (MP.store.caps.overview ? "overview" : "bookings");
    tab(inicial);
    if (MP.abreDesdeHash) MP.abreDesdeHash();
    if (!MP.DEMO) timer = setInterval(() => { if (!document.hidden) recarga(); }, REFRESH_MS);
  };

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (MP.DEMO || !MP.store) return;
    const err = $("#loginErr");
    err.hidden = true;
    $("#loginBtn").disabled = true;
    const { data, error } = await MP.store.sb.auth.signInWithPassword({
      email: $("#email").value.trim(),
      password: $("#password").value,
    });
    $("#loginBtn").disabled = false;
    $("#password").value = "";
    if (error) { err.textContent = T().loginBad; err.hidden = false; return; }
    if (!esOwner(data.user)) {
      await MP.store.sb.auth.signOut();
      err.textContent = T().noAccess; err.hidden = false; return;
    }
    mostrar(true);
  });

  $("#logoutBtn").addEventListener("click", async () => {
    if (MP.DEMO) { location.href = location.pathname; return; }
    await MP.store.sb.auth.signOut();
    mostrar(false);
  });

  /* ---------- datos comunes ---------- */
  const cargaServicios = async () => {
    try { services = new Map((await MP.store.services()).map((s) => [s.id, s])); }
    catch (e) { console.warn("[panel] services", e.message || e); }
  };

  const carga = async (fn, errBox) => {
    try { $(errBox).hidden = true; return await fn(); }
    catch (e) {
      console.warn("[panel]", e.message || e);
      $(errBox).textContent = T().loadErr; $(errBox).hidden = false;
      return null;
    }
  };

  /* Recarga la vista visible y los contadores de las pestañas. */
  const recarga = async () => {
    await pintaVista();
    $("#updatedAt").textContent = T().updated(MP.ahoraDoha());
  };
  MP.refresh = recarga;

  const pintaVista = async () => {
    const [up, leadsNew] = await Promise.all([
      carga(() => MP.store.bookings({ range: "upcoming", status: "confirmed" }), "#bookingsErr"),
      carga(() => MP.store.leads({ status: "new" }), "#leadsErr"),
    ]);
    if (up) $("#countBookings").textContent = String(up.length);
    if (leadsNew) $("#countLeads").textContent = String(leadsNew.length);
    if (actual === "bookings") return pintaBookings();
    if (actual === "leads") return pintaLeads();
    const v = MP.views[actual];
    if (v) return v.render($("#pane-" + actual));
  };

  /* ---------- citas (lista) ---------- */
  let bookings = [];
  const filtro = () => ({ range: $("#fRange").value, date: $("#fDate").value || MP.hoyDoha(), status: $("#fStatus").value });

  const actualiza = async (tabla, id, cambios, errBox) => {
    const { error } = await MP.store.update(tabla, id, cambios);
    if (error) {
      console.warn("[panel] update", error.code, error.message || "");
      const msg = error.code === "23P01" ? T().taken : T().saveErr;
      if (errBox) { $(errBox).textContent = msg; $(errBox).hidden = false; } else toast(msg, true);
      return false;
    }
    if (errBox) $(errBox).hidden = true;
    await recarga();
    return true;
  };
  MP.actualiza = actualiza;

  /* Selector de nuevo hueco (lista, ficha y calendario en táctil). Los huecos
     ocupados salen tachados y avisan; la restricción de la tabla manda. */
  MP.abreMover = (cont, b, onDone) => {
    const prev = cont.querySelector(".p-move");
    if (prev) { prev.remove(); return; }
    const box = el("div", "p-move");
    const lab = el("label", "", T().moveDate);
    const inp = el("input");
    inp.type = "date"; inp.min = MP.hoyDoha(); inp.value = MP.diaDe(b.start_at);
    lab.append(document.createElement("br"), inp);
    const slots = el("div", "p-move__slots");
    const cerrar = boton(T().moveClose, "p-btn--ghost", () => box.remove());
    const pinta = async () => {
      slots.textContent = "";
      try {
        const lista = await MP.store.slots(b.service_id, inp.value, b.id);
        if (!lista.some((s) => s.free)) slots.append(el("span", "p-muted", T().moveNone));
        lista.forEach(({ iso, free }) => {
          const bt = el("button", free ? "" : "is-busy", iso.slice(11, 16));
          bt.type = "button";
          if (!free) bt.setAttribute("aria-label", iso.slice(11, 16) + ", " + T().busy);
          bt.addEventListener("click", async () => {
            const ok = await actualiza("majlis_bookings", b.id, {
              start_at: iso, end_at: new Date(Date.parse(iso) + MP.durMin(b) * 60000).toISOString(),
            }, null);
            if (ok) { toast(T().calMoved(fmtFecha(MP.diaDe(iso)) + " " + iso.slice(11, 16))); if (onDone) onDone(); }
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
    cont.append(box);
    pinta();
  };

  /* Cancelar en dos toques, sin diálogo del navegador. */
  MP.botonCancelar = (b, onDone) => {
    const cancel = boton(T().cancel, "p-btn--danger");
    let armado = null;
    cancel.addEventListener("click", async () => {
      if (!armado) {
        cancel.classList.add("is-armed"); cancel.textContent = T().cancelSure;
        armado = setTimeout(() => { armado = null; cancel.classList.remove("is-armed"); cancel.textContent = T().cancel; }, 4000);
        return;
      }
      clearTimeout(armado);
      if (await actualiza("majlis_bookings", b.id, { status: "cancelled" }, null) && onDone) onDone();
    });
    return cancel;
  };

  async function pintaBookings() {
    const b = await carga(() => MP.store.bookings(filtro()), "#bookingsErr");
    if (b) bookings = b;
    const ul = $("#bookingsList");
    ul.textContent = "";
    $("#bookingsEmpty").hidden = bookings.length > 0;
    bookings.forEach((b) => {
      const li = el("li", "p-card p-item");
      const when = el("div", "p-when");
      when.append(el("b", "", fmtHora(b.start_at)), el("small", "", fmtDia(b.start_at)));
      const main = el("div", "p-main");
      const h = el("h3", "", svcName(b.service_id));
      h.append(badge(b.status, T()["s_" + b.status]));
      if (b.work_status) h.append(badge("work", T()["w_" + b.work_status]));
      const meta = el("p", "p-meta");
      const nm = el("span", "", b.customer_name); nm.setAttribute("dir", "auto");
      meta.append(nm, tel(b.customer_phone));
      if (b.vehicle_label) meta.append(el("span", "", b.vehicle_label));
      main.append(h, meta);
      li.append(when, main);
      const acts = el("div", "p-actions");
      if (MP.openCard && MP.store.booking) acts.append(boton(T().cardTitle, "p-btn--ghost", () => MP.openCard(b.id)));
      if (b.status === "confirmed") {
        acts.append(
          boton(T().markDone, "", () => actualiza("majlis_bookings", b.id, { status: "done" }, "#bookingsErr")),
          boton(T().move, "p-btn--ghost", () => MP.abreMover(li, b)),
          MP.botonCancelar(b),
        );
      }
      if (acts.childNodes.length) li.append(acts);
      ul.append(li);
    });
  }

  /* ---------- leads ---------- */
  async function pintaLeads() {
    const leads = (await carga(() => MP.store.leads({ status: $("#fLeadStatus").value }), "#leadsErr")) || [];
    const ul = $("#leadsList");
    ul.textContent = "";
    $("#leadsEmpty").hidden = leads.length > 0;
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
      if (l.service_id) meta.append(el("span", "", svcName(l.service_id)));
      if (l.pref_date) meta.append(el("span", "", T().pref + ": " + l.pref_date + (l.pref_time ? " " + l.pref_time : "")));
      main.append(nm, meta);
      li.append(when, main);
      const acts = el("div", "p-actions");
      const paso = (txt, status, cls) => acts.append(boton(txt, cls, () => actualiza("majlis_leads", l.id, { status }, "#leadsErr")));
      if (l.status === "new") { paso(T().markContacted, "contacted"); paso(T().markClosed, "closed", "p-btn--ghost"); }
      else if (l.status === "contacted") paso(T().markClosed, "closed", "p-btn--ghost");
      else paso(T().reopen, "new", "p-btn--ghost");
      li.append(acts);
      ul.append(li);
    });
  }

  /* ---------- exportar ---------- */
  $("#exportBtn").addEventListener("click", () => {
    const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const filas = [T().csv].concat(bookings.map((b) => [
      MP.diaDe(b.start_at), fmtHora(b.start_at), svcName(b.service_id),
      b.customer_name, b.customer_phone, T()["s_" + b.status],
    ]));
    const blob = new Blob(["﻿" + filas.map((f) => f.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (MP.DEMO ? "demo-bookings-" : "bookings-") + MP.hoyDoha() + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- filtros ---------- */
  $("#fRange").addEventListener("change", () => {
    $("#fDayWrap").hidden = $("#fRange").value !== "day";
    if (!$("#fDate").value) $("#fDate").value = MP.hoyDoha();
    recarga();
  });
  ["#fDate", "#fStatus", "#fLeadStatus"].forEach((s) => $(s).addEventListener("change", recarga));
  $("#refreshBtn").addEventListener("click", recarga);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("#appView").hidden) recarga(); });

  $("#langBtn").addEventListener("click", () => {
    I.lang = I.lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("lang", I.lang); } catch (e) { /* modo privado */ }
    pintaTextos();
    if (!$("#appView").hidden) recarga();
    if (MP.cardRelang) MP.cardRelang();
  });

  /* ---------- arranque ---------- */
  document.body.classList.toggle("is-demo", MP.DEMO);
  pintaTextos();
  /* Las vistas se registran en scripts posteriores (defer): se arranca
     cuando ya están todas. */
  document.addEventListener("DOMContentLoaded", () => {
    MP.init().then(() => {
      if (MP.DEMO) return mostrar(true);
      return MP.store.sb.auth.getSession().then(({ data }) => mostrar(!!(data.session && esOwner(data.session.user))));
    }).catch((e) => { console.warn("[panel] init", e); mostrar(false); });
  });
})();
