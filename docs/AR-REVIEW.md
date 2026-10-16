# Revisión del árabe — web-taller (landing, chat de Leo y panel)

**Para el revisor:** corrige el árabe con un tono formal y claro, como el de un taller que se dirige a sus clientes en Doha (registro estándar moderno; nada demasiado coloquial ni literario).
Si un texto suena a traducción automática o a calco del inglés, dilo en la columna aunque sea correcto, y propone cómo lo diría de forma natural un taller en Qatar.
Escribe solo la versión corregida (o «OK» si está bien); no cambies las partes entre llaves como `{n}` o `{v}`: el sistema las sustituye por el nombre del cliente, el vehículo, la fecha, etc.

**37 textos** en 21 líneas marcadas con `AR-REVIEW` en el código (7 de la landing, 2 del chat y 12 del panel). La marca va por línea: cuando una línea lleva varios textos, se listan todos. Los negocios, nombres y cifras son ficticios (demo).

| # | Pantalla | Clave i18n | Árabe (actual) | Inglés (equivalente) | Corrección del nativo |
|---|---|---|---|---|---|
| 1 | Landing · Hero (segunda línea del titular) | `hero.h1b` | <span dir="rtl">واحجز في دقيقة.</span> | booked in a minute. | |
| 2 | Landing · Servicios › tarjeta «Tyres» | `svc.tyres.d` | <span dir="rtl">تركيب وموازنة وضبط الزوايا. ونشرح لك الفرق الحقيقي بين الخيارات المتاحة لسيارتك.</span> | Fitting, balancing and alignment. We explain the real difference between the options available for your car. | |
| 3 | Landing · Servicios › tarjeta «Brakes» | `svc.brakes.d` | <span dir="rtl">الفحمات والأقراص وفحص كامل لنظام الفرامل، مع وقت مخصص لتجربة القيادة بعد ذلك.</span> | Pads, discs and a full check of the braking system, with time set aside for a road test afterwards. | |
| 4 | Landing · Asistente IA (botón secundario) | `cta.panel` | <span dir="rtl">شاهد لوحة صاحب الورشة (تجريبي)</span> | See the owner panel (demo) | |
| 5 | Landing · Áreas del taller › «Mechanical» | `ar.1` | <span dir="rtl">المحرك والتوقيت والكلتش والفرامل والتعليق، دائماً مع عرض سعر مسبق.</span> | Engine, timing, clutch, brakes and suspension, always with a quote first. | |
| 6 | Landing · Áreas del taller › «Mechanical» (lista) | `ar.1a` | <span dir="rtl">سيور التوقيت والكلتش</span> | Timing belts and clutches | |
| 7 | Chat de Leo · respuesta al elegir «Tyres» | `leo.js · info.tyres` | <span dir="rtl">تركيب وموازنة وضبط الزوايا، ونشرح لك الخيارات المناسبة لسيارتك. تستغرق نحو 45 دقيقة. السعر يُحدَّد في عرض مكتوب بالريال القطري.</span> | Fitting, balancing and alignment, and we explain the options for your car. It takes about 45 minutes. The price comes in a written quote in QAR. | |
| 8 | Chat de Leo · respuesta al elegir «Brakes» | `leo.js · info.brakes` | <span dir="rtl">الفحمات والأقراص وفحص كامل لنظام الفرامل، مع تجربة قيادة. نخصص لها ساعتين. السعر يُحدَّد في عرض مكتوب بالريال القطري.</span> | Pads, discs and a full check of the braking system, plus a road test. We set aside two hours. The price comes in a written quote in QAR. | |
| 9 | Panel · Acceso (login) | `panel · tryDemo` | <span dir="rtl">جرّب العرض التجريبي</span> | Try the demo | |
| 10 | Panel · Acceso (login) | `panel · demoHint` | <span dir="rtl">بيانات نموذجية فقط. لا يُحفظ أو يُرسل أي شيء.</span> | Sample data only. Nothing is saved or sent. | |
| 11 | Panel · Banner del modo demo (todas las pestañas) | `panel · demoBanner` | <span dir="rtl">عرض تجريبي · بيانات نموذجية، لا يُحفظ أو يُرسل أي شيء</span> | DEMO · sample data, nothing is saved or sent | |
| 12 | Panel · Reservas (estado y filtro) | `panel · s_confirmed` | <span dir="rtl">مؤكد</span> | Confirmed | |
| 13 | Panel · Reservas (estado y filtro) | `panel · s_done` | <span dir="rtl">تمت الخدمة</span> | Attended | |
| 14 | Panel · Reservas (estado y filtro) | `panel · s_cancelled` | <span dir="rtl">ملغى</span> | Cancelled | |
| 15 | Panel · Resumen (KPI) | `panel · kOcc` | <span dir="rtl">نسبة إشغال الجدول هذا الأسبوع</span> | Calendar occupancy this week | |
| 16 | Panel · Resumen (KPI) | `panel · kLeads` | <span dir="rtl">طلبات جديدة</span> | New leads | |
| 17 | Panel · Resumen (KPI) | `panel · kCancel` | <span dir="rtl">نسبة الإلغاء</span> | Cancellation rate | |
| 18 | Panel · Resumen (KPI) | `panel · kRevenue` | <span dir="rtl">إيرادات هذا الشهر</span> | Revenue this month | |
| 19 | Panel · Resumen (KPI) | `panel · kMrr` | <span dir="rtl">الإيرادات المتكررة (MRR)</span> | Recurring revenue (MRR) | |
| 20 | Panel · Resumen (KPI) | `panel · kPlans` | <span dir="rtl">{n} خطط صيانة نشطة</span> | {n} active maintenance plans | |
| 21 | Panel · Resumen (KPI) | `panel · kRevNoPrices` | <span dir="rtl">أضف أسعار خدماتك لعرض الإيرادات. لا نقدّر أي رقم من دونها.</span> | Add your service prices to see revenue. Nothing is estimated without them. | |
| 22 | Panel · Resumen (KPI) | `panel · kRevMissing` | <span dir="rtl">{n} حجوزات منجزة لخدمات بلا سعر</span> | {n} attended bookings have a service without price | |
| 23 | Panel · Resumen › diálogo «Precios de servicio» | `panel · prTitle` | <span dir="rtl">أسعار الخدمات (ر.ق)</span> | Service prices (QAR) | |
| 24 | Panel · Resumen › diálogo «Precios de servicio» | `panel · prHint` | <span dir="rtl">أسعارك أنت. اتركها فارغة إن لم ترد تحديدها؛ الإيرادات تحسب فقط الخدمات التي لها سعر.</span> | Your own prices. Leave empty if you prefer not to set one; revenue only counts services with a price. | |
| 25 | Panel · Taller (columnas) y ficha (estado del vehículo) | `panel · w_in_progress` | <span dir="rtl">قيد العمل</span> | In progress | |
| 26 | Panel · Taller (columnas) y ficha (estado del vehículo) | `panel · w_ready` | <span dir="rtl">جاهزة</span> | Ready | |
| 27 | Panel · Taller (columnas) y ficha (estado del vehículo) | `panel · w_delivered` | <span dir="rtl">تم التسليم</span> | Delivered | |
| 28 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.received` | <span dir="rtl">مرحباً {n}، معك Example Garage. استلمنا سيارتك ({v}). سنوافيك بالمستجدات بعد الفحص الأول.</span> | Hello {n}, this is Example Garage. We have received your {v}. We will update you after the first check. | |
| 29 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.diagnosing` | <span dir="rtl">مرحباً {n}، يقوم فنيونا الآن بتشخيص سيارتك ({v}). سنرسل لك النتائج وعرض سعر مكتوباً قبل أي عمل.</span> | Hello {n}, our technicians are now diagnosing your {v}. We will send you the findings and a written quote before any work. | |
| 30 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.parts` | <span dir="rtl">مرحباً {n}، نحن بانتظار قطع الغيار لسيارتك ({v}). سنخبرك فور وصولها.</span> | Hello {n}, we are waiting for parts for your {v}. We will let you know as soon as they arrive. | |
| 31 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.in_progress` | <span dir="rtl">مرحباً {n}، بدأ العمل على سيارتك ({v}) كما هو متفق عليه في عرض السعر.</span> | Hello {n}, work on your {v} has started as agreed in your quote. | |
| 32 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.ready` | <span dir="rtl">مرحباً {n}، سيارتك ({v}) جاهزة للاستلام. نعمل من الأحد إلى الخميس، 08:00–18:00.</span> | Hello {n}, your {v} is ready for collection. We are open Sunday to Thursday, 08:00–18:00. | |
| 33 | Panel · Ficha › «Mensaje para el cliente» (vista previa) | `panel · notify.delivered` | <span dir="rtl">مرحباً {n}، شكراً لزيارتك Example Garage. نتمنى أن تكون سيارتك ({v}) بأفضل حال.</span> | Hello {n}, thank you for visiting Example Garage. We hope everything is fine with your {v}. | |
| 34 | Panel · Clientes | `panel · cuNextRule` | <span dir="rtl">صيانة عند {km} كم أو قبل {d}، أيهما أسبق</span> | Service at {km} km or by {d}, whichever comes first | |
| 35 | Panel · Clientes | `panel · cuRuleDate` | <span dir="rtl">قبل {d} (6 أشهر بعد آخر زيارة)</span> | By {d} (6 months after the last visit) | |
| 36 | Panel · Clientes | `panel · cuRule` | <span dir="rtl">قاعدة</span> | Rule | |
| 37 | Panel · Clientes | `panel · cuRealRemind` | <span dir="rtl">معاينة فقط: لا توجد قناة رسائل متصلة بعد.</span> | Preview only: no message channel is connected yet. | |

**Dónde está cada texto en el código:** `web-taller/assets/js/i18n.js` (landing), `web-taller/assets/js/leo.js` (chat), `web-taller/panel/i18n.js` (panel; las claves llevan el prefijo `panel ·` en esta tabla).
