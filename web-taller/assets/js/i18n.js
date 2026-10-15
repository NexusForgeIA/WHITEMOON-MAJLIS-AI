/* =========================================================================
   i18n — inglés (por defecto, vive en el HTML) y árabe (RTL).

   El inglés NO se duplica aquí: es el texto del propio HTML. La primera vez
   que se cambia de idioma se guarda el original de cada nodo y se restaura al
   volver a inglés. Aquí solo vive el diccionario árabe.

   Atributos que entiende:
     data-i18n="clave"          → textContent
     data-i18n-html="clave"     → innerHTML (solo texto de este fichero, nunca
                                  datos del usuario)
     data-i18n-attr="attr:clave;attr2:clave2"

   Al cambiar de idioma emite `langchange` en document con { lang }; leo.js
   lo escucha. La elección se guarda en localStorage (con try/catch) y se
   puede forzar con ?lang=ar / ?lang=en.

   Textos árabes pendientes de revisión por un hablante nativo: las claves
   marcadas con AR-REVIEW son las dudosas (terminología técnica o giros).
   ========================================================================= */
(() => {
  "use strict";

  const AR = {
    "meta.title": "Example Garage · ورشة سيارات في الدوحة (نسخة تجريبية)",
    "meta.desc": "نسخة تجريبية لورشة سيارات وهمية في الدوحة: تغيير الزيت، الصيانة الدورية، فحص ما قبل الشراء، الإطارات، الفرامل، الفحص بالكمبيوتر والتكييف. احجز موعدك بالعربية أو الإنجليزية مع ليو، المساعد الذكي.",
    "skip": "انتقل إلى المحتوى",

    "nav.tagline": "ورشة سيارات · الدوحة · تجريبي",
    "nav.aria": "التنقل الرئيسي",
    "nav.home": "الرئيسية",
    "nav.workshop": "الورشة",
    "nav.services": "الخدمات",
    "nav.process": "طريقة عملنا",
    "nav.assistant": "المساعد الذكي",
    "nav.faq": "الأسئلة الشائعة",
    "nav.contact": "تواصل معنا",
    "nav.menu": "فتح القائمة",

    "lang.label": "English",
    "lang.aria": "Switch to English",
    "lang.code": "en",

    "cta.book": "احجز موعداً",
    "cta.bookMine": "احجز موعدي",
    "cta.seeServices": "اطّلع على الخدمات",
    "cta.bookShort": "احجز",
    "cta.try": "جرّب المساعد",
    "cta.talk": "تحدّث مع ليو",

    "hero.eyebrow": "نسخة تجريبية · ورشة وهمية في الدوحة",
    "hero.h1a": "عناية متخصصة بسيارتك،",
    "hero.h1b": "واحجز في دقيقة.", // AR-REVIEW
    "hero.rotlead": "متخصصون في",
    "hero.rot0": "الصيانة",
    "hero.rotwords": "الصيانة|الفحص بالكمبيوتر|الفرامل|الإطارات|التكييف",
    "hero.desc": "الميكانيكا والكهرباء والإطارات والتكييف تحت سقف واحد. تحصل على <strong>عرض سعر مكتوب بالريال القطري قبل بدء أي عمل</strong>، وتختار اليوم والساعة في المحادثة مع ليو، <strong>مساعدنا الذكي</strong>.",

    "stat.1": "خدمات يمكن حجزها عبر الإنترنت",
    "stat.2v": "الأحد–الخميس",
    "stat.2": "أيام العمل · الجمعة والسبت مغلق",
    "stat.3v": "ر.ق",
    "stat.3": "عرض سعر مكتوب قبل أي عمل",
    "stat.4": "حجز عبر الإنترنت مع المساعد الذكي",

    "mq.1b": "عرض سعر مكتوب",
    "mq.1": "قبل أي عمل",
    "mq.2b": "مواعيد متاحة فعلاً",
    "mq.2": "من جدول الورشة",
    "mq.3b": "العربية والإنجليزية",
    "mq.3": "في المحادثة نفسها",
    "mq.4b": "مفتوح",
    "mq.4": "من الأحد إلى الخميس",
    "mq.5b": "فحص التكييف",
    "mq.5": "استعداداً للصيف",
    "mq.6b": "مساعد ذكي",
    "mq.6": "يحوّلك إلى موظف عند الحاجة",

    "ws.eyebrow": "الورشة",
    "ws.h2": "عمل دقيق وشرح واضح",
    "ws.p1": "<strong>Example Garage ورشة وهمية.</strong> وُجدت لتوضيح كيف يمكن لمساعد ذكي أن يستقبل الحجوزات لنشاط تجاري حقيقي: الاسم والعنوان ورقم الهاتف في هذه الصفحة بيانات تجريبية.",
    "ws.p2": "يبدأ كل عمل <strong>بتشخيص واضح</strong> وعرض سعر مكتوب بالريال القطري. لا نقوم بأي شيء دون موافقتك، فلا مفاجآت عند استلام سيارتك.",
    "ws.p3": "الميكانيكا والفحص بالكمبيوتر والإطارات والتكييف في مكان واحد، وجدول المواعيد يديره ليو، <strong>مساعدنا الذكي</strong>، بالعربية والإنجليزية.",
    "ws.badgeS": "الورشة",
    "ws.badge": "الدوحة · تجريبي",

    "svc.eyebrow": "الخدمات",
    "svc.h2": "كل ما تحتاجه سيارتك",
    "svc.lead": "سبع خدمات يمكنك حجزها عبر الإنترنت. تختار اليوم والساعة من المواعيد المتاحة فعلاً، ويُسجَّل الحجز مباشرة في جدول الورشة. السعر يُحدَّد في عرض مكتوب بالريال القطري بعد الفحص، ولا نعرض أسعاراً ثابتة على الإنترنت.",
    "svc.quote": "عرض سعر بالريال",
    "svc.oil.t": "تغيير الزيت",
    "svc.oil.d": "زيت المحرك والفلتر حسب مواصفات الشركة المصنّعة، مع إعادة تدوير الزيت المستعمل. ونفحص أيضاً مستويات السوائل والأضواء وضغط الإطارات.",
    "svc.oil.alt": "رسم توضيحي لسيارة كوبيه رياضية زرقاء",
    "svc.service.t": "الصيانة الدورية",
    "svc.service.d": "الفرامل والتعليق والسوائل والسيور والبطارية والأضواء والإطارات، مع تقرير مختصر بما هو سليم وما يحتاج إلى اهتمام.",
    "svc.service.alt": "رسم توضيحي لسيارة دفع رباعي فاخرة فضية",
    "svc.inspect.t": "فحص ما قبل الشراء",
    "svc.inspect.d": "تفكر في شراء سيارة مستعملة؟ نفحص الهيكل والمحرك وناقل الحركة والأنظمة الكهربائية ونجري تجربة قيادة قبل أن تقرر.",
    "svc.inspect.alt": "رسم توضيحي لسيارة سيدان فاخرة ذهبية",
    "svc.tyres.t": "الإطارات",
    "svc.tyres.d": "تركيب وموازنة وضبط الزوايا. ونشرح لك الفرق الحقيقي بين الخيارات المتاحة لسيارتك.", // AR-REVIEW
    "svc.tyres.alt": "رسم توضيحي لسيارة جي تي زرقاء داكنة", // AR-REVIEW
    "svc.brakes.t": "الفرامل",
    "svc.brakes.d": "الفحمات والأقراص وفحص كامل لنظام الفرامل، مع وقت مخصص لتجربة القيادة بعد ذلك.", // AR-REVIEW
    "svc.brakes.alt": "رسم توضيحي لسيارة خارقة بيضاء لؤلؤية",
    "svc.diag.t": "الفحص بالكمبيوتر",
    "svc.diag.d": "لمبات التحذير والأعطال الكهربائية والمشاكل المتقطعة، نقرؤها من وحدات التحكم في السيارة ونشرحها بكلمات بسيطة.",
    "svc.diag.alt": "رسم توضيحي لسيارة كوبيه برونزية",
    "svc.ac.t": "التكييف",
    "svc.ac.d": "فحص التسريبات وفلتر المقصورة وتعبئة غاز التبريد. إذا كان الهواء يخرج ولا يبرد، فهنا غالباً نبدأ.",
    "svc.ac.alt": "رسم توضيحي لسيارة دفع رباعي سوداء",

    "dur.45": "45 دقيقة",
    "dur.60": "ساعة واحدة",
    "dur.120": "ساعتان",

    "pr.eyebrow": "طريقة عملنا",
    "pr.h2": "لا مفاجآت في الفاتورة",
    "pr.lead": "عرض سعر مكتوب قبل أن نلمس سيارتك. بهذه البساطة.",
    "pr.1t": "أحضر سيارتك",
    "pr.1": "احجز موعداً أولاً وتدخل سيارتك في الوقت المتفق عليه، دون انتظار في الطابور.",
    "pr.2t": "التشخيص",
    "pr.2": "نفحص السيارة ونحدد ما تحتاجه، ثم نشرحه لك بلغة بسيطة.",
    "pr.3t": "عرض سعر مكتوب",
    "pr.3": "السعر بالريال القطري قبل بدء العمل. لا نقوم بشيء دون موافقتك.",
    "pr.4t": "الاستلام",
    "pr.4": "نخبرك عندما تجهز السيارة، وتدفع عند الاستلام.",

    "as.eyebrow": "المساعد الذكي",
    "as.h2": "ليو يحجز موعدك دون مكالمة هاتفية",
    "as.p1": "ليو هو <strong>المساعد الذكي</strong> للورشة. أخبره بما تحتاجه سيارتك، بالعربية أو الإنجليزية، ولن يطلب منك سوى اسمك ورقم جوال قطري. <strong>بعدها</strong> يعرض عليك المواعيد المتاحة فعلاً.",
    "as.p2": "عندما تختار الساعة، <strong>يُسجَّل الحجز في جدول الورشة</strong> وتحصل على ملخص بالتاريخ والساعة والخدمة. وإذا فضّلت التحدث مع موظف، ينقل ليو بياناتك إلى الفريق.",
    "as.c1t": "مواعيد حقيقية لا تخمينات",
    "as.c1": "تأتي من جدول الورشة: إذا كان الوقت محجوزاً فلن يظهر.",
    "as.c2t": "حجز فوري",
    "as.c2": "لا يوجد «بانتظار التأكيد»: الموعد لك بمجرد أن تختاره.",
    "as.c3t": "العربية والإنجليزية",
    "as.c3": "اكتب بأي من اللغتين وسيرد ليو باللغة نفسها.",
    "as.c4t": "الورشة تعلم فوراً",
    "as.c4": "كل حجز جديد يصل إلى الفريق كتنبيه فوري.",

    "why.eyebrow": "لماذا هذه الورشة",
    "why.h2": "نشرح أولاً ثم نقدّم عرض السعر",
    "why.1t": "عرض سعر مكتوب",
    "why.1": "سعر واضح بالريال القطري قبل أي عمل. بلا رسوم خفية ولا قطع غير ضرورية.",
    "why.2t": "تشخيص واضح",
    "why.2": "نريك ما وجدناه ولماذا يهم، دون مصطلحات معقدة.",
    "why.3t": "الفحص بالكمبيوتر",
    "why.3": "أجهزة فحص تقرأ وحدات التحكم في السيارة لتحديد الأعطال.",
    "why.4t": "حجز سهل",
    "why.4": "اختر اليوم والساعة عبر الإنترنت في أي وقت، دون انتظار على الهاتف.",

    "ar.eyebrow": "أقسام الورشة",
    "ar.h2": "لكل سيارة المختص المناسب",
    "ar.lead": "ثلاثة أقسام عمل، لكل منها فريقه ومعداته.",
    "ar.1t": "الميكانيكا",
    "ar.1": "المحرك والتوقيت والكلتش والفرامل والتعليق، دائماً مع عرض سعر مسبق.", // AR-REVIEW
    "ar.1a": "سيور التوقيت والكلتش", // AR-REVIEW
    "ar.1b": "الفرامل والتعليق والتوجيه",
    "ar.1c": "الصيانة الدورية وفحص ما قبل الشراء",
    "ar.2t": "الكهرباء والفحص بالكمبيوتر",
    "ar.2": "وحدات التحكم والأعطال الكهربائية وأنظمة مساعدة السائق.",
    "ar.2a": "قراءة رموز الأعطال ومسحها",
    "ar.2b": "برمجة وحدات التحكم",
    "ar.2c": "لمبات التحذير وأنظمة مساعدة السائق",
    "ar.3t": "الإطارات والتكييف",
    "ar.3": "العجلات وضبط الزوايا ودائرة التكييف بالكامل.",
    "ar.3a": "التركيب والموازنة وضبط الزوايا",
    "ar.3b": "تعبئة غاز التبريد وفلتر المقصورة",
    "ar.3c": "كشف التسريبات في دائرة التكييف",

    "faq.eyebrow": "الأسئلة الشائعة",
    "faq.h2": "أكثر ما يسألنا عنه العملاء",
    "faq.1q": "كيف أحجز موعداً؟",
    "faq.1a": "تحدّث مع ليو، المساعد الذكي في هذا الموقع. اختر الخدمة، واترك اسمك ورقم جوال قطري، ثم اختر اليوم والساعة من المواعيد المتاحة فعلاً.",
    "faq.2q": "هل يمكنني الكتابة للمساعد بالعربية؟",
    "faq.2a": "نعم. حوّل الموقع إلى العربية أو اكتب بالعربية مباشرة، وسيرد ليو باللغة نفسها.",
    "faq.3q": "هل تقدمون عرض سعر قبل الإصلاح؟",
    "faq.3a": "نعم. تحصل على عرض سعر مكتوب بالريال القطري بعد الفحص وقبل بدء أي عمل. لا نقوم بشيء دون موافقتك.",
    "faq.4q": "ما هي ساعات العمل؟",
    "faq.4a": "من الأحد إلى الخميس، من 08:00 إلى 18:00. الجمعة والسبت مغلق. هذه ساعات تجريبية لهذا العرض.",
    "faq.5q": "هل تعرضون الأسعار على الإنترنت؟",
    "faq.5a": "لا. كل سيارة مختلفة، لذلك يُحدَّد السعر في عرض مكتوب بالريال القطري بعد الفحص.",
    "faq.6q": "هل أتحدث مع شخص حقيقي؟",
    "faq.6a": "ليو مساعد ذكي. إذا كنت تفضّل التحدث مع موظف، اطلب ذلك من ليو وسينقل بياناتك إلى الفريق.",

    "ct.eyebrow": "تواصل معنا",
    "ct.h2": "تجدنا في الدوحة",
    "ct.addrK": "العنوان",
    "ct.addr": "المنطقة الصناعية، الدوحة، قطر<br><small>عنوان تجريبي</small>",
    "ct.phoneK": "الهاتف",
    "ct.phoneNote": "رقم تجريبي",
    "ct.hoursK": "ساعات العمل",
    "ct.hours": "الأحد–الخميس 08:00–18:00<br>الجمعة والسبت مغلق",
    "ct.ctaT": "احجز موعدك",
    "ct.cta": "أخبر ليو بما تحتاجه سيارتك واختر اليوم والساعة. يتم الحجز فوراً، دون انتظار اتصال.",
    "ct.demo": "نشاط تجاري وهمي · بيانات تجريبية",

    "foot.l": "ورشة وهمية لأغراض العرض · الدوحة",
    "foot.r": "نموذج أولي قيد التطوير",

    "leo.open": "افتح المحادثة مع ليو، المساعد الذكي للورشة",
    "leo.aria": "ليو، المساعد الذكي للورشة",
    "leo.role": "مساعد ذكي · Example Garage",
    "leo.close": "إغلاق المحادثة",
    "leo.inputLabel": "اكتب ردّك",
    "leo.send": "إرسال",
    "leo.note": "تجريبي · تُستخدم بياناتك فقط لإدارة هذا الحجز.",
  };

  const html = document.documentElement;
  const orig = new Map(); // nodo -> { text, html, attrs: {} } en inglés
  const origMeta = { title: document.title, desc: "" };
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) origMeta.desc = metaDesc.content;

  const memo = (el) => {
    let o = orig.get(el);
    if (!o) { o = { attrs: {} }; orig.set(el, o); }
    return o;
  };

  const apply = (lang) => {
    const ar = lang === "ar";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const o = memo(el);
      if (o.text === undefined) o.text = el.textContent;
      const v = ar ? AR[el.dataset.i18n] : o.text;
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const o = memo(el);
      if (o.html === undefined) o.html = el.innerHTML;
      const v = ar ? AR[el.dataset.i18nHtml] : o.html;
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const o = memo(el);
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (!(attr in o.attrs)) o.attrs[attr] = el.getAttribute(attr);
        const v = ar ? AR[key] : o.attrs[attr];
        if (v !== undefined && v !== null) el.setAttribute(attr, v);
      });
    });
    document.title = ar ? AR["meta.title"] : origMeta.title;
    if (metaDesc) metaDesc.content = ar ? AR["meta.desc"] : origMeta.desc;
    html.lang = ar ? "ar" : "en";
    html.dir = ar ? "rtl" : "ltr";
  };

  let current = "en";
  const set = (lang, persist) => {
    lang = lang === "ar" ? "ar" : "en";
    if (lang !== current || lang === "ar") apply(lang);
    current = lang;
    if (persist) { try { localStorage.setItem("lang", lang); } catch (e) { /* modo privado */ } }
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  };

  window.I18N = { get lang() { return current; }, set };

  let inicial = "en";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    inicial = q === "ar" || q === "en" ? q : (localStorage.getItem("lang") || "en");
  } catch (e) { /* sin storage: inglés */ }
  if (inicial === "ar") set("ar", false);

  document.querySelectorAll("[data-lang-toggle]").forEach((b) =>
    b.addEventListener("click", () => set(current === "ar" ? "en" : "ar", true))
  );
})();
