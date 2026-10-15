/* Panel · Clientes: visitas, última visita, próximo servicio recomendado y
   recordatorio (solo vista previa: no se envía nada).
   · Demo: regla de ejemplo con kilometraje ficticio (10.000 km o 6 meses).
   · Real: no hay kilometraje; solo la regla por fecha (6 meses después de
     la última visita atendida). Planes de mantenimiento: alta y baja. */
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
        const ultima = hechas[hechas.length - 1] || c.last_visit || null;
        const proxKm = c.mileage_km ? Math.ceil((c.mileage_km + 1) / KM_PASO) * KM_PASO : null;
        const proxFecha = ultima ? MP.sumaDias(ultima, DIAS_PASO) : null;
        return { c, visitas: hechas.length, ultima, proxKm, proxFecha };
      }).sort((a, b) => (a.proxFecha || "9999").localeCompare(b.proxFecha || "9999")).forEach(({ c, visitas, ultima, proxKm, proxFecha }) => {
        const li = el("li", "p-card p-holo p-cust");
        li.append(el("span", "p-hud"));
        const h = el("h3", "", "");
        const n = el("span", "", c.name); n.setAttribute("dir", "auto");
        h.append(n, el("span", "p-badge p-badge--confirmed", T().cuVisits(visitas)));
        if (c.plan) h.append(el("span", "p-badge p-badge--handoff", T().cuPlan(c.plan.fee_qar)));
        const meta = el("p", "p-meta");
        const v = el("span", "", c.vehicle_label); v.setAttribute("dir", "auto");
        meta.append(tel(c.phone));
        if (c.vehicle_label) meta.append(v);
        if (c.mileage_km) meta.append(el("span", "", T().cuKm(new Intl.NumberFormat(I.loc()).format(c.mileage_km))));
        const kv = el("dl", "p-kvs p-kvs--inline");
        const r1 = el("div", "p-kv"); r1.append(el("dt", "", T().cuLast), el("dd", "", ultima ? fmtFecha(ultima) : "—"));
        const r2 = el("div", "p-kv");
        const dd = el("dd", "", !proxFecha ? T().cuNoVisit
          : proxKm ? T().cuNextRule(new Intl.NumberFormat(I.loc()).format(proxKm), fmtFecha(proxFecha))
          : T().cuRuleDate(fmtFecha(proxFecha)));
        if (proxFecha) dd.append(" ", el("span", "p-sample", MP.DEMO ? T().cuExample : T().cuRule));
        r2.append(el("dt", "", T().cuNext), dd);
        kv.append(r1, r2);
        const acts = el("div", "p-actions");
        const estado = el("span", "p-muted", c.reminder_at ? T().cuReminded(fmtHora(c.reminder_at)) : "");
        if (proxFecha) acts.append(boton(T().cuRemind, "p-btn--ghost", async () => {
          await MP.store.remind(c.phone);
          const lg = /[؀-ۿ]/.test(c.name) ? "ar" : "en";
          MP.previewMensaje({ customer_name: c.name, customer_phone: c.phone, lang: lg }, null,
            I.Tde(lg).cuRemindMsg(c.name.split(" ")[0], new Date(proxFecha + "T12:00:00+03:00").toLocaleDateString(lg === "ar" ? "ar-QA-u-nu-latn" : "en-GB", { timeZone: MP.TZ, day: "numeric", month: "long" })));
          if (!MP.DEMO) MP.ui.toast(T().cuRealRemind);
          MP.refresh();
        }));
        acts.append(estado);
        /* Planes de mantenimiento (MRR): alta con cuota mensual, o baja. */
        if (c.plan) {
          acts.append(boton(T().cuEndPlan, "p-btn--ghost", async () => {
            const { error } = await MP.store.endPlan(c.plan.id);
            if (error) { console.warn("[panel] plan", error.message || error); MP.ui.toast(T().saveErr, true); return; }
            MP.ui.toast(T().cuPlanEnded); MP.refresh();
          }));
        } else {
          const alta = boton(T().cuAddPlan, "p-btn--ghost", () => {
            alta.hidden = true;
            const f = el("form", "p-price");
            f.noValidate = true;
            const lab = el("label", "", T().cuPlanFee);
            const inp = el("input"); inp.type = "number"; inp.min = "1"; inp.step = "1"; inp.inputMode = "decimal";
            lab.append(inp);
            const g = boton(T().cuPlanSave, ""); g.type = "submit";
            f.append(lab, g);
            f.addEventListener("submit", async (e) => {
              e.preventDefault();
              const fee = Number(inp.value);
              if (!Number.isFinite(fee) || fee <= 0) { MP.ui.toast(T().prBad, true); return; }
              const { error } = await MP.store.addPlan(c.phone, c.name, fee);
              if (error) { console.warn("[panel] plan", error.message || error); MP.ui.toast(T().saveErr, true); return; }
              MP.ui.toast(T().cuPlanSaved); MP.refresh();
            });
            acts.append(f);
            inp.focus();
          });
          acts.append(alta);
        }
        li.append(h, meta, kv, acts);
        ul.append(li);
      });
      pane.append(ul);
      MP.holoBind(pane);
    },
  };
})();
