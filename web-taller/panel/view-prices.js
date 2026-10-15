/* Panel · Precios de servicio (los pone el dueño; sin valores por defecto).
   En real escribe majlis_services.price_qar (RLS: solo el dueño, y solo esa
   columna). Vacío = sin precio: los ingresos no cuentan ese servicio. */
(() => {
  "use strict";
  const MP = window.MP, I = window.MPI, T = I.T;

  MP.openPrices = async () => {
    const { el, boton, svcName, toast } = MP.ui;
    const dlg = document.getElementById("prices");
    const body = dlg.querySelector(".p-prices__body");
    dlg.querySelector("h2").textContent = T().prTitle;
    body.textContent = "";
    body.append(el("p", "p-muted", T().prHint));
    const lista = await MP.store.services();
    lista.forEach((sv) => {
      const f = el("form", "p-price");
      f.noValidate = true;
      const lab = el("label", "", svcName(sv.id));
      const inp = el("input");
      inp.type = "number"; inp.min = "0"; inp.step = "1"; inp.inputMode = "decimal";
      inp.value = sv.price_qar === null || sv.price_qar === undefined ? "" : String(Number(sv.price_qar));
      inp.setAttribute("aria-label", svcName(sv.id) + " · QAR");
      lab.append(inp);
      const g = boton(T().prSave, "p-btn--ghost");
      g.type = "submit";
      f.append(lab, g);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const v = inp.value.trim();
        const precio = v === "" ? null : Number(v);
        if (precio !== null && (!Number.isFinite(precio) || precio < 0)) { toast(T().prBad, true); return; }
        const { error } = await MP.store.setPrice(sv.id, precio);
        if (error) { console.warn("[panel] precio", error.message || error); toast(T().saveErr, true); return; }
        toast(T().prSaved);
        await MP.recargaServicios();
        MP.refresh();
      });
      body.append(f);
    });
    if (!dlg.open) dlg.showModal();
  };
})();
