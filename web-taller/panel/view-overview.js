/* Panel · Resumen (KPI). Todo se calcula a partir de la capa de datos: en
   demo, de los datos de ejemplo; en real, solo de datos reales.
   Ingresos y MRR solo si la capa los soporta (caps.revenue). En demo llevan
   la etiqueta fija «Sample figures»; en real, sin precios no hay cifra. */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;

  const pct = (x) => Math.round(x * 100) + "%";
  const qar = (n) => new Intl.NumberFormat(I.loc(), { maximumFractionDigits: 0 }).format(n) + " " + (I.lang === "ar" ? "ر.ق" : "QAR");

  /* Tarjeta KPI con la capa holográfica (borde, brillo y esquinas HUD). */
  const kpi = (label, value, hint) => {
    const { el } = MP.ui;
    const c = el("div", "p-card p-holo p-kpi");
    c.append(el("span", "p-hud"), el("p", "p-kpi__l", label), el("p", "p-kpi__v", value));
    if (hint) c.append(el("p", "p-kpi__h", hint));
    return c;
  };

  MP.views.overview = {
    async render(pane) {
      const { el } = MP.ui;
      const s = MP.store;
      const hoy = MP.hoyDoha();
      const sem0 = MP.inicioSemana(hoy);
      const desde30 = MP.sumaDias(hoy, -30);
      const [todas, leadsNew, clientes] = await Promise.all([
        s.bookings({ from: MP.sumaDias(sem0, -35), to: MP.sumaDias(sem0, 13) }),
        s.leads({ status: "new" }),
        s.customers ? s.customers() : Promise.resolve([]),
      ]);
      const vivas = (b) => b.status !== "cancelled";
      const deHoy = todas.filter((b) => MP.diaDe(b.start_at) === hoy && vivas(b));
      const semana = todas.filter((b) => { const d = MP.diaDe(b.start_at); return d >= sem0 && d <= MP.sumaDias(sem0, 6); });
      /* En taller: con estado distinto de «Delivered», o de hoy sin estado (cuenta como «Received»). */
      const enTaller = todas.filter((b) => vivas(b) && (b.work_status ? b.work_status !== "delivered" : MP.diaDe(b.start_at) === (MP.store.workshopDay || hoy)));
      const ult30 = todas.filter((b) => { const d = MP.diaDe(b.start_at); return d >= desde30 && d <= hoy; });
      const canc = ult30.length ? ult30.filter((b) => b.status === "cancelled").length / ult30.length : 0;

      /* Ocupación: minutos reservados / minutos de apertura, dom–jue. */
      const abiertoMin = MP.CLOSE_MIN - MP.OPEN_MIN;
      const dias = Array.from({ length: 7 }, (_, i) => MP.sumaDias(sem0, i));
      const porDia = dias.map((d) => {
        const min = semana.filter((b) => MP.diaDe(b.start_at) === d && vivas(b)).reduce((a, b) => a + MP.durMin(b), 0);
        return { d, abre: MP.abre(d), occ: MP.abre(d) ? min / abiertoMin : 0 };
      });
      const lab = porDia.filter((x) => x.abre);
      const occSemana = lab.length ? lab.reduce((a, x) => a + x.occ, 0) / lab.length : 0;

      pane.textContent = "";
      const grid = el("div", "p-kpis");
      grid.append(
        kpi(T().kToday, String(deHoy.length)),
        kpi(T().kWeek, String(semana.filter(vivas).length)),
        kpi(T().kInShop, String(enTaller.length)),
        kpi(T().kOcc, pct(occSemana)),
        kpi(T().kLeads, String(leadsNew.length)),
        kpi(T().kCancel, pct(canc), T().kCancelHint),
      );
      pane.append(grid);

      /* Gráfica de ocupación por día: barras con transform: scaleY. */
      const chart = el("section", "p-card p-holo p-chart");
      chart.append(el("span", "p-hud"), el("h2", "p-h2", T().kOccChart));
      const bars = el("div", "p-bars");
      bars.setAttribute("role", "list");
      porDia.forEach((x) => {
        const col = el("div", "p-bar" + (x.abre ? "" : " is-closed") + (x.d === MP.hoyDoha() ? " is-today" : ""));
        col.setAttribute("role", "listitem");
        const dia = new Date(x.d + "T12:00:00+03:00").toLocaleDateString(I.loc(), { timeZone: MP.TZ, weekday: "short" });
        col.setAttribute("aria-label", dia + ": " + (x.abre ? pct(x.occ) : T().closedDay));
        const track = el("div", "p-bar__track");
        const fill = el("div", "p-bar__fill");
        fill.style.transform = "scaleY(" + Math.min(1, x.occ).toFixed(3) + ")";
        track.append(fill);
        col.append(el("span", "p-bar__v", x.abre ? pct(x.occ) : "—"), track, el("span", "p-bar__d", x.abre ? dia : dia + " · " + T().closedDay));
        bars.append(col);
      });
      chart.append(bars);
      pane.append(el("hr", "p-sep"), chart);

      /* Ingresos: precio actual de cada servicio × citas atendidas del mes.
         Demo: cifras de ejemplo con «Sample figures». Real: solo si el dueño
         ha puesto precios; si falta alguno se dice cuántas citas no cuentan. */
      if (s.caps.revenue) {
        const svcs = MP.ui.services();
        const mes = hoy.slice(0, 7);
        const hechas = todas.filter((b) => b.status === "done" && MP.diaDe(b.start_at).slice(0, 7) === mes);
        const precio = (b) => { const p = (svcs.get(b.service_id) || {}).price_qar; return p === null || p === undefined ? null : Number(p); };
        const conPrecio = hechas.filter((b) => precio(b) !== null);
        const hayPrecios = Array.from(svcs.values()).some((x) => x.price_qar !== null && x.price_qar !== undefined);
        const ingresos = conPrecio.reduce((a, b) => a + precio(b), 0);
        const planes = clientes.filter((c) => c.plan);
        const mrr = planes.reduce((a, c) => a + c.plan.fee_qar, 0);
        const rev = el("div", "p-kpis p-kpis--2");
        const k1 = hayPrecios
          ? kpi(T().kRevenue, qar(ingresos), hechas.length > conPrecio.length ? T().kRevMissing(hechas.length - conPrecio.length) : T().kRevHint)
          : kpi(T().kRevenue, "—", T().kRevNoPrices);
        const k2 = planes.length ? kpi(T().kMrr, qar(mrr), T().kPlans(planes.length)) : kpi(T().kMrr, "—", T().kNoPlans);
        if (MP.DEMO) [k1, k2].forEach((k) => k.prepend(el("span", "p-sample", T().sample)));
        if (s.caps.prices && MP.openPrices) k1.append(MP.ui.boton(T().kSetPrices, "p-btn--ghost", () => MP.openPrices()));
        rev.append(k1, k2);
        pane.append(el("hr", "p-sep"), rev);
      }
      MP.holoBind(pane);
    },
  };
})();
