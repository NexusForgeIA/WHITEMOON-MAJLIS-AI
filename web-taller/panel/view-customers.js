/* Panel · Clientes: visitas, última visita, próximo servicio recomendado
   (regla de ejemplo: cada 10.000 km o 6 meses desde la última visita, lo
   que llegue antes) y recordatorio simulado (solo se muestra, no se envía). */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;
  const KM_PASO = 10000, DIAS_PASO = 182;

  MP.views.customers = {
    async render(pane) {
      const { el, boton, tel, fmtFecha, fmtHora } = MP.ui;
      const [clientes, citas] = await Promise.all([
        MP.store.customers(),
        MP.store.bookings({ range: "all" }),
      ]);
      pane.textContent = "";
      if (!clientes.length) { pane.append(el("p", "p-empty p-muted", T().cuEmpty)); return; }

      const ul = el("ul", "p-list p-custs");
      clientes.map((c) => {
        const suyas = citas.filter((b) => b.customer_phone === c.phone);
        const hechas = suyas.filter((b) => b.status === "done").map((b) => MP.diaDe(b.start_at)).sort();
        const ultima = hechas[hechas.length - 1] || null;
        const proxKm = Math.ceil((c.mileage_km + 1) / KM_PASO) * KM_PASO;
        const proxFecha = MP.sumaDias(ultima || MP.hoyDoha(), DIAS_PASO);
        return { c, visitas: hechas.length, ultima, proxKm, proxFecha };
      }).sort((a, b) => a.proxFecha.localeCompare(b.proxFecha)).forEach(({ c, visitas, ultima, proxKm, proxFecha }) => {
        const li = el("li", "p-card p-holo p-cust");
        li.append(el("span", "p-hud"));
        const h = el("h3", "", "");
        const n = el("span", "", c.name); n.setAttribute("dir", "auto");
        h.append(n, el("span", "p-badge p-badge--confirmed", T().cuVisits(visitas)));
        if (c.plan) h.append(el("span", "p-badge p-badge--handoff", T().cuPlan(c.plan.fee_qar)));
        const meta = el("p", "p-meta");
        const v = el("span", "", c.vehicle_label); v.setAttribute("dir", "auto");
        meta.append(tel(c.phone), v, el("span", "", T().cuKm(new Intl.NumberFormat(I.loc()).format(c.mileage_km))));
        const kv = el("dl", "p-kvs p-kvs--inline");
        const r1 = el("div", "p-kv"); r1.append(el("dt", "", T().cuLast), el("dd", "", ultima ? fmtFecha(ultima) : "—"));
        const r2 = el("div", "p-kv");
        const dd = el("dd", "", T().cuNextRule(new Intl.NumberFormat(I.loc()).format(proxKm), fmtFecha(proxFecha)));
        dd.append(" ", el("span", "p-sample", T().cuExample));
        r2.append(el("dt", "", T().cuNext), dd);
        kv.append(r1, r2);
        const acts = el("div", "p-actions");
        const estado = el("span", "p-muted", c.reminder_at ? T().cuReminded(fmtHora(c.reminder_at)) : "");
        acts.append(boton(T().cuRemind, "p-btn--ghost", async () => {
          await MP.store.remind(c.phone);
          const lg = /[؀-ۿ]/.test(c.name) ? "ar" : "en";
          MP.previewMensaje({ customer_name: c.name, customer_phone: c.phone, lang: lg }, null,
            I.Tde(lg).cuRemindMsg(c.name.split(" ")[0], new Date(proxFecha + "T12:00:00+03:00").toLocaleDateString(lg === "ar" ? "ar-QA-u-nu-latn" : "en-GB", { timeZone: MP.TZ, day: "numeric", month: "long" })));
          MP.refresh();
        }), estado);
        li.append(h, meta, kv, acts);
        ul.append(li);
      });
      pane.append(ul);
      MP.holoBind(pane);
    },
  };
})();
