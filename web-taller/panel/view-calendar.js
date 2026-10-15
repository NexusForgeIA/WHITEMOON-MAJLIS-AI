/* Panel · Calendario (semana dom–sáb con vie/sáb cerrados, y día).
   Bloques posicionados por hora y duración, color por estado. Clic abre la
   ficha. Con ratón se arrastra para mover: el destino se encaja en franjas
   de 30 min y solo se acepta si está libre (misma regla que la restricción
   de la tabla). En táctil se mueve desde la ficha con «Move».
   El arrastre solo usa transform/opacity. */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;
  const ROW = 44;                     // px por franja de 30 min
  const PX = ROW / MP.STEP;           // px por minuto

  let modo = null;                    // 'week' | 'day'
  let ancla = null;                   // fecha visible (día) o cualquier día de la semana

  const tituloSemana = (d0) => {
    const f = (d) => new Date(d + "T12:00:00+03:00").toLocaleDateString(I.loc(), { timeZone: MP.TZ, day: "numeric", month: "short" });
    return f(d0) + " – " + f(MP.sumaDias(d0, 6));
  };

  MP.views.calendar = {
    async render(pane) {
      const { el, boton } = MP.ui;
      if (!modo) modo = window.innerWidth < 700 ? "day" : "week";
      if (!ancla) ancla = MP.store.workshopDay || MP.hoyDoha();
      const dias = modo === "week"
        ? Array.from({ length: 7 }, (_, i) => MP.sumaDias(MP.inicioSemana(ancla), i))
        : [ancla];
      const lista = await MP.store.bookings({ from: dias[0], to: dias[dias.length - 1] });

      pane.textContent = "";
      /* barra */
      const bar = el("div", "p-calbar");
      const vistas = el("div", "p-seg");
      vistas.setAttribute("role", "group");
      [["week", T().calWeek], ["day", T().calDay]].forEach(([v, txt]) => {
        const b = boton(txt, v === modo ? "" : "p-btn--ghost", () => { modo = v; MP.refresh(); });
        b.setAttribute("aria-pressed", String(v === modo));
        vistas.append(b);
      });
      const paso = modo === "week" ? 7 : 1;
      const nav = el("div", "p-seg");
      const prev = boton("‹", "p-btn--ghost p-nav", () => { ancla = MP.sumaDias(ancla, -paso); MP.refresh(); });
      prev.setAttribute("aria-label", T().calPrev);
      const next = boton("›", "p-btn--ghost p-nav", () => { ancla = MP.sumaDias(ancla, paso); MP.refresh(); });
      next.setAttribute("aria-label", T().calNext);
      nav.append(prev, boton(T().calToday, "p-btn--ghost", () => { ancla = MP.hoyDoha(); MP.refresh(); }), next);
      const titulo = el("h2", "p-h2 p-caltitle", modo === "week" ? tituloSemana(dias[0]) : MP.ui.fmtFecha(ancla));
      titulo.setAttribute("aria-live", "polite");
      bar.append(vistas, nav, titulo);
      pane.append(bar, el("p", "p-muted p-calhint", T().calDragHint));

      /* rejilla */
      const filas = (MP.CLOSE_MIN - MP.OPEN_MIN) / MP.STEP;
      const scroller = el("div", "p-calscroll");
      const cal = el("div", "p-cal p-cal--" + modo);
      cal.style.setProperty("--cols", String(dias.length));
      cal.style.setProperty("--h", (filas * ROW) + "px");
      /* cabecera */
      cal.append(el("div", "p-cal__corner"));
      dias.forEach((d) => {
        const h = el("div", "p-cal__dh" + (d === MP.hoyDoha() ? " is-today" : "") + (MP.abre(d) ? "" : " is-closed"));
        h.append(el("b", "", new Date(d + "T12:00:00+03:00").toLocaleDateString(I.loc(), { timeZone: MP.TZ, weekday: "short" })),
          el("small", "", new Date(d + "T12:00:00+03:00").toLocaleDateString(I.loc(), { timeZone: MP.TZ, day: "numeric", month: "short" })));
        cal.append(h);
      });
      /* columna de horas */
      const horas = el("div", "p-cal__times");
      for (let i = 0; i < filas; i++) if (i % 2 === 0) horas.append(el("span", "", MP.hhmm(MP.OPEN_MIN + i * MP.STEP)));
      cal.append(horas);
      /* días */
      dias.forEach((d) => {
        const col = el("div", "p-cal__col" + (MP.abre(d) ? "" : " is-closed"));
        col.dataset.date = d;
        if (!MP.abre(d)) { col.append(el("span", "p-cal__closed", T().closedDay)); cal.append(col); return; }
        lista.filter((b) => MP.diaDe(b.start_at) === d).forEach((b) => col.append(bloque(b)));
        cal.append(col);
      });
      scroller.append(cal);
      pane.append(scroller);
      if (modo === "day" && !MP.abre(ancla)) pane.append(el("p", "p-empty p-muted", T().closedDay));
    },
  };

  function bloque(b) {
    const { el, svcName, fmtHora } = MP.ui;
    const ini = MP.minDe(b.start_at), dur = MP.durMin(b);
    const blk = el("button", "p-blk p-blk--" + b.status + (b.work_status ? " has-work" : ""));
    blk.type = "button";
    blk.style.top = ((ini - MP.OPEN_MIN) * PX) + "px";
    blk.style.height = Math.max(dur * PX - 3, 26) + "px";
    blk.dataset.id = b.id;
    const nombre = el("span", "p-blk__n", b.customer_name);
    nombre.setAttribute("dir", "auto");
    /* Rango horario aislado en LTR: en árabe no se invierte. */
    const rango = el("span", "p-blk__t", fmtHora(b.start_at) + "–" + fmtHora(b.end_at));
    rango.setAttribute("dir", "ltr");
    blk.append(rango, nombre, el("span", "p-blk__s", svcName(b.service_id)));
    blk.append(el("span", "sr-only", ", " + T()["s_" + b.status]));
    const movible = b.status === "confirmed" && Date.parse(b.start_at) > Date.now();
    blk.addEventListener("click", (e) => { if (blk.dataset.dragged) { e.preventDefault(); delete blk.dataset.dragged; return; } MP.openCard(b.id); });
    if (movible) arrastre(blk, b);
    return blk;
  }

  /* Arrastre con puntero (ratón/lápiz). El bloque se traslada con transform;
     un indicador marca el destino en verde (libre) o rojo (ocupado). */
  function arrastre(blk, b) {
    blk.classList.add("is-movable");
    blk.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const x0 = e.clientX, y0 = e.clientY;
      blk.setPointerCapture(e.pointerId);
      let activo = false, destino = null;
      const ind = MP.ui.el("div", "p-drop");
      ind.style.height = blk.style.height;
      const mover = (ev) => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (!activo && Math.hypot(dx, dy) < 6) return;
        if (!activo) { activo = true; blk.classList.add("is-dragging"); }
        blk.style.transform = `translate(${dx}px, ${dy}px)`;
        /* columna bajo el puntero (sirve igual en RTL) */
        blk.style.pointerEvents = "none";
        const col = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n.classList && n.classList.contains("p-cal__col"));
        blk.style.pointerEvents = "";
        if (!col || col.classList.contains("is-closed")) { ind.remove(); destino = null; return; }
        const top = blk.getBoundingClientRect().top - col.getBoundingClientRect().top;
        const min = MP.OPEN_MIN + Math.round(top / PX / MP.STEP) * MP.STEP;
        const iso = MP.isoAt(col.dataset.date, MP.hhmm(min));
        const libre = MP.store.isFree ? MP.store.isFree(b.id, iso) : true;
        destino = { iso, libre };
        ind.style.top = ((min - MP.OPEN_MIN) * PX) + "px";
        ind.classList.toggle("is-busy", !libre);
        ind.textContent = MP.hhmm(min) + " · " + (libre ? T().calFree : T().calBusyDrop);
        if (ind.parentNode !== col) col.append(ind);
      };
      const soltar = async () => {
        blk.removeEventListener("pointermove", mover);
        blk.removeEventListener("pointerup", soltar);
        blk.removeEventListener("pointercancel", soltar);
        ind.remove();
        if (!activo) return;
        blk.dataset.dragged = "1";
        blk.classList.remove("is-dragging");
        blk.style.transform = "";
        if (!destino || destino.iso === b.start_at) return;
        if (!destino.libre) { MP.ui.toast(T().taken, true); return; }
        const ok = await MP.actualiza("majlis_bookings", b.id, {
          start_at: destino.iso, end_at: new Date(Date.parse(destino.iso) + MP.durMin(b) * 60000).toISOString(),
        }, null);
        if (ok) MP.ui.toast(T().calMoved(MP.ui.fmtFecha(MP.diaDe(destino.iso)) + " " + destino.iso.slice(11, 16)));
      };
      blk.addEventListener("pointermove", mover);
      blk.addEventListener("pointerup", soltar);
      blk.addEventListener("pointercancel", soltar);
    });
  }
})();
