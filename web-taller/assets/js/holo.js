(() => {
  "use strict";
  const cards = document.querySelectorAll(".svc-card");
  cards.forEach((c) => {
    const m = c.querySelector(".svc-media");
    if (!m) return;
    ["svc-floor", "svc-scan", "svc-hud"].forEach((k) => {
      const d = document.createElement("span");
      d.className = k; d.setAttribute("aria-hidden", "true");
      m.appendChild(d);
    });
    c.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  /* en pantallas táctiles no hay hover: la tarjeta visible activa el efecto */
  if (matchMedia("(hover:none)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("hl-on", e.intersectionRatio > .6)), { threshold: [0, .6, 1] });
    cards.forEach((c) => io.observe(c));
  }
})();
