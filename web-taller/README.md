# Example Garage · web de taller (demo Majlis AI)

Taller de coches **ficticio** en Doha, en inglés (por defecto) y árabe (RTL). Fondo blanco, azul `#0b3d91` y dorado `#c9a227`.

- `index.html` · web pública. El inglés vive en el HTML; cada texto lleva `data-i18n`.
- `assets/js/i18n.js` · diccionario árabe y selector EN/AR (`?lang=ar` lo fuerza). Las claves con `// AR-REVIEW` esperan revisión de un hablante nativo.
- `assets/js/leo.js` · Leo, asistente de IA: servicio → nombre → móvil +974 → día y hora (huecos de la base de datos). Sin backend conectado todavía (`FN_BASE` vacío): el chat avisa y ofrece que llame una persona.
- `assets/css/style.css` · paleta en `:root`; propiedades lógicas para que RTL se espeje solo.
- `assets/fonts/` · Sora (latín) e IBM Plex Sans Arabic (subset árabe, OFL), auto-hospedadas.

Datos de ejemplo: horario domingo–jueves 08:00–18:00, viernes y sábado cerrado; teléfono `+974 0000 0000` (inválido a propósito); sin precios, solo "presupuesto escrito en QAR".

Probar: `python -m http.server` dentro de `web-taller/`.
