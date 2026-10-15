/* Panel · Ficha de la cita / orden de trabajo (diálogo modal).
   Cliente, móvil, servicio, vehículo en texto libre (sin matrícula), notas
   del taller, estado del vehículo con historial y orden imprimible (el
   diálogo de impresión del navegador permite guardarla como PDF).
   Se puede abrir con enlace directo: #card=<id>. */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;
  let abierta = null;

  const fila = (k, v, dir) => {
    const { el } = MP.ui;
    const r = el("div", "p-kv");
    const dd = el("dd", "", v);
    if (dir) dd.setAttribute("dir", dir);
    r.append(el("dt", "", k), dd);
    return r;
  };

  async function pinta() {
    const { el, boton, badge, svcName, fmtHora, fmtFecha, tel } = MP.ui;
    const dlg = document.getElementById("card");
    const b = await MP.store.booking(abierta);
    if (!b) { dlg.close(); return; }
    const body = dlg.querySelector(".p-card__body");
    body.textContent = "";

    const head = dlg.querySelector(".p-dlg__head h2");
    head.textContent = T().cardTitle + " · " + svcName(b.service_id);

    const estado = el("p", "p-badges");
    estado.append(badge(b.status, T()["s_" + b.status]));
    if (b.work_status) estado.append(badge("work", T()["w_" + b.work_status]));
    body.append(estado);

    const dl = el("dl", "p-kvs");
    const nm = fila(T().cardCustomer, b.customer_name, "auto");
    const mob = fila(T().cardMobile, "");
    mob.querySelector("dd").append(tel(b.customer_phone));
    const cuando = fila(T().cardWhen, fmtFecha(MP.diaDe(b.start_at)) + " · ");
    const rango = el("span", "", fmtHora(b.start_at) + "–" + fmtHora(b.end_at));
    rango.setAttribute("dir", "ltr");
    cuando.querySelector("dd").append(rango);
    dl.append(nm, mob, fila(T().cardService, svcName(b.service_id)), cuando);
    body.append(dl);

    /* Vehículo y notas (editables) */
    const form = el("form", "p-cardform");
    form.noValidate = true;
    const lv = el("label", "", T().cardVehicle);
    const iv = el("input"); iv.type = "text"; iv.maxLength = 80; iv.value = b.vehicle_label || ""; iv.setAttribute("dir", "auto");
    lv.append(iv, el("small", "p-muted", T().cardVehicleHint));
    const ln = el("label", "", T().cardNotes);
    const tn = el("textarea"); tn.rows = 3; tn.maxLength = 1000; tn.value = b.notes || ""; tn.setAttribute("dir", "auto");
    ln.append(tn);
    const guardar = boton(T().cardSave, "");
    guardar.type = "submit";
    form.append(lv, ln, guardar);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = await MP.actualiza("majlis_bookings", b.id, { vehicle_label: iv.value.trim().slice(0, 80), notes: tn.value.trim().slice(0, 1000) }, null);
      if (ok) MP.ui.toast(T().cardSaved);
    });
    body.append(el("hr", "p-sep"), form);

    /* Estado del vehículo */
    const st = el("section", "p-cardsec");
    st.append(el("h3", "", T().cardStatus));
    if (b.status !== "cancelled") {
      const sel = el("select");
      sel.setAttribute("aria-label", T().cardStatus);
      /* Sin estado: el selector arranca en «Not checked in yet»; elegir
         «Received» lo registra en el historial. */
      if (!b.work_status) { const o = el("option", "", T().cardNoStatus); o.value = ""; sel.append(o); }
      MP.WORK.forEach((w) => { const o = el("option", "", T()["w_" + w]); o.value = w; o.selected = w === b.work_status; sel.append(o); });
      sel.addEventListener("change", async () => { if (sel.value && await MP.cambiaEstado(b, sel.value)) pinta(); });
      st.append(sel);
    }
    const hist = el("ol", "p-hist");
    const log = b.log || [];
    if (!log.length) hist.append(el("li", "p-muted", T().cardNoHistory));
    log.slice().reverse().forEach((l) => {
      const li = el("li", "");
      li.append(el("time", "", fmtFecha(MP.diaDe(l.at)) + " " + fmtHora(l.at)),
        el("span", "", (l.from ? T()["w_" + l.from] + " → " : "") + T()["w_" + l.to]));
      hist.append(li);
    });
    st.append(el("h3", "", T().cardHistory), hist);
    body.append(el("hr", "p-sep"), st);

    /* Acciones */
    const acts = el("div", "p-actions p-noprint");
    if (b.status === "confirmed") {
      const zona = el("div", "p-cardmove");
      acts.append(
        boton(T().markDone, "", async () => { if (await MP.actualiza("majlis_bookings", b.id, { status: "done" }, null)) pinta(); }),
        boton(T().move, "p-btn--ghost", () => MP.abreMover(zona, b, pinta)),
        MP.botonCancelar(b, pinta),
      );
      body.append(acts, zona);
    }
    const pie = el("div", "p-actions p-noprint");
    pie.append(boton(T().cardPrint, "p-btn--ghost", () => window.print()), boton(T().cardClose, "p-btn--ghost", () => dlg.close()));
    body.append(pie, el("p", "p-printonly p-muted", T().printFoot));
  }

  MP.openCard = async (id) => {
    abierta = id;
    const dlg = document.getElementById("card");
    await pinta();
    if (!dlg.open) dlg.showModal();
  };
  MP.cardRelang = () => { const d = document.getElementById("card"); if (d && d.open) pinta(); };

  /* Cerrar con clic fuera del contenido y limpiar el enlace directo. */
  document.querySelectorAll("dialog.p-dlg").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.querySelector(".p-dlg__x").addEventListener("click", () => d.close());
  });
  document.getElementById("card").addEventListener("close", () => {
    if (location.hash.startsWith("#card=")) history.replaceState(null, "", location.pathname + location.search);
  });
  /* Al imprimir solo sale la orden. */
  window.addEventListener("beforeprint", () => document.body.classList.toggle("is-printing-card", document.getElementById("card").open));
  window.addEventListener("afterprint", () => document.body.classList.remove("is-printing-card"));

  /* Enlace directo #card=<id>, cuando el panel ya está cargado. */
  MP.abreDesdeHash = () => {
    const m = location.hash.match(/^#card=([\w-]+)$/);
    if (m && MP.store && MP.store.booking) MP.openCard(m[1]);
  };
})();
