/* Panel · Taller: tablero de estado del vehículo.
   Received → Diagnosing → Waiting for parts → In progress → Ready → Delivered.
   Cambiar el estado guarda una línea de historial (hora de Doha) y prepara un
   mensaje de ejemplo para el cliente, que solo se muestra: no se envía nada. */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;

  /* Cambia el estado y enseña la vista previa del mensaje. Lo usan el
     tablero y la ficha. */
  MP.cambiaEstado = async (b, to) => {
    const { error } = await MP.store.setWorkStatus(b.id, to);
    if (error) { MP.ui.toast(T().saveErr, true); return false; }
    await MP.refresh();
    MP.previewMensaje(b, to);
    return true;
  };

  /* Vista previa del aviso al cliente (diálogo propio, nunca alert). */
  MP.previewMensaje = (b, estado, textoLibre) => {
    const { el, boton } = MP.ui;
    const dlg = document.getElementById("notify");
    const body = dlg.querySelector(".p-notify__body");
    body.textContent = "";
    /* El mensaje va en el idioma en que reservó el cliente. */
    const TL = I.Tde(b.lang || I.lang);
    const nombre = (b.customer_name || "").split(" ")[0];
    const vehiculo = b.vehicle_label || "";
    const texto = textoLibre || TL.notify[estado](nombre, vehiculo || (b.lang === "ar" ? "سيارتك" : "car"));
    const msg = el("p", "p-notify__msg", texto);
    msg.setAttribute("lang", b.lang || I.lang);
    msg.setAttribute("dir", "auto");
    const para = el("p", "p-muted", b.customer_phone ? "→ " + b.customer_phone : "");
    para.setAttribute("dir", "ltr");
    const copiar = boton(T().notifyCopy, "p-btn--ghost", async () => {
      try { await navigator.clipboard.writeText(texto); copiar.textContent = T().notifyCopied; } catch (e) { console.warn("[panel] clipboard", e); }
    });
    body.append(el("p", "p-sample", T().notifyNote), msg, para, copiar);
    dlg.querySelector("h2").textContent = T().notifyTitle;
    if (!dlg.open) dlg.showModal();
  };

  MP.views.workshop = {
    async render(pane) {
      const { el, boton, svcName, fmtHora } = MP.ui;
      const dia = MP.store.workshopDay || MP.hoyDoha();
      const lista = await MP.store.bookings({ from: MP.sumaDias(dia, -3), to: dia });
      const vivas = lista.filter((b) => b.status !== "cancelled");
      const sinEntrar = vivas.filter((b) => !b.work_status && MP.diaDe(b.start_at) === dia);
      const enTablero = vivas.filter((b) => b.work_status);

      pane.textContent = "";
      pane.append(el("p", "p-muted p-calhint", T().wHint));

      if (sinEntrar.length) {
        const fila = el("div", "p-expected");
        fila.append(el("h2", "p-h2", T().cardNoStatus));
        sinEntrar.forEach((b) => {
          const c = el("div", "p-card p-exp");
          const n = el("b", "", b.customer_name); n.setAttribute("dir", "auto");
          c.append(el("span", "p-exp__t", fmtHora(b.start_at)), n, el("span", "p-muted", svcName(b.service_id)),
            boton(T().cardCheckIn, "", () => MP.cambiaEstado(b, "received")));
          fila.append(c);
        });
        pane.append(fila, el("hr", "p-sep"));
      }

      const board = el("div", "p-board");
      board.setAttribute("role", "list");
      MP.WORK.forEach((estado, i) => {
        const col = el("div", "p-col p-col--" + estado);
        col.setAttribute("role", "listitem");
        const cards = enTablero.filter((b) => b.work_status === estado);
        const h = el("h2", "p-col__h", T()["w_" + estado]);
        h.append(el("span", "p-count", String(cards.length)));
        col.append(h);
        if (!cards.length) col.append(el("p", "p-muted p-col__empty", T().wEmpty));
        cards.forEach((b) => {
          const c = el("article", "p-card p-holo p-veh");
          c.append(el("span", "p-hud"));
          const v = el("h3", "p-veh__v", b.vehicle_label || svcName(b.service_id));
          v.setAttribute("dir", "auto");
          const ult = (b.log || [])[b.log.length - 1];
          const meta = el("p", "p-meta");
          const n = el("span", "", b.customer_name); n.setAttribute("dir", "auto");
          meta.append(n, el("span", "", svcName(b.service_id)));
          c.append(v, meta);
          if (ult) c.append(el("p", "p-muted p-veh__since", T().wSince(MP.ui.fmtFecha(MP.diaDe(ult.at)) + " " + fmtHora(ult.at))));
          const acts = el("div", "p-actions");
          acts.append(boton(T().cardTitle, "p-btn--ghost", () => MP.openCard(b.id)));
          if (i < MP.WORK.length - 1) {
            const sig = MP.WORK[i + 1];
            const flecha = I.lang === "ar" ? "← " : "→ ";
            const nb = boton(flecha + T()["w_" + sig], "", () => MP.cambiaEstado(b, sig));
            nb.setAttribute("aria-label", T().wNext + ": " + T()["w_" + sig]);
            acts.append(nb);
          }
          c.append(acts);
          col.append(c);
        });
        board.append(col);
      });
      const scroller = el("div", "p-boardscroll");
      scroller.append(board);
      pane.append(scroller);
      MP.holoBind(pane);
    },
  };
})();
