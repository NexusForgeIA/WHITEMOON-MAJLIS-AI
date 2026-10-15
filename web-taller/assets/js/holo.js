/* Capa holográfica de las tarjetas de servicio (estilos en style.css).
   Crea las capas decorativas, mueve el brillo con el puntero (una escritura
   por frame, vía rAF) y en táctil enciende la tarjeta que está a la vista. */
(() => {
  "use strict";
  const cards = document.querySelectorAll(".svc-card");
  const hover = matchMedia("(hover:hover) and (pointer:fine)").matches;

  cards.forEach((c) => {
    const m = c.querySelector(".svc-media");
    if (!m) return;
    ["svc-floor", "svc-scan", "svc-hud"].forEach((k) => {
      const d = document.createElement("span");
      d.className = k; d.setAttribute("aria-hidden", "true");
      m.appendChild(d);
    });
    if (!hover) return;
    let x = 0, y = 0, pendiente = false;
    c.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      x = e.clientX - r.left; y = e.clientY - r.top;
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        c.style.setProperty("--mx", x + "px");
        c.style.setProperty("--my", y + "px");
        pendiente = false;
      });
    }, { passive: true });
  });

  /* En táctil no hay hover: se activa la tarjeta que está casi entera en
     pantalla, y solo esa. */
  if (!hover && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle("hl-on", e.intersectionRatio > 0.6)),
      { threshold: [0, 0.6, 1] }
    );
    cards.forEach((c) => io.observe(c));
  }
})();
