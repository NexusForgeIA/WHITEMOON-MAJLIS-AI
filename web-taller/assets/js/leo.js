/* =========================================================================
   Leo — asistente de IA de Example Garage (negocio ficticio, demo Majlis AI)

   Flujo de reserva: servicio -> nombre -> móvil de Qatar (+974) -> día ->
   hora -> confirmación. El contacto va ANTES del calendario a propósito: si
   alguien abandona eligiendo día, el lead ya está completo.

   Reglas de estilo (CLAUDE.md): se presenta siempre como asistente de IA,
   máximo 3 frases por mensaje y UNA pregunta cada vez. Nunca da precios: el
   precio es un presupuesto escrito en QAR tras la inspección.

   Los huecos NO se inventan en cliente: se piden a la Edge Function
   `majlis-cita` (action 'slots') y al elegir hora se reserva de verdad
   (action 'book'). Si el backend no responde, el chat lo dice y ofrece que
   llame una persona; el flujo no se rompe.

   Texto libre (en el menú inicial y al final): se manda a `majlis-cita`
   (action 'understand'), que usa Claude para extraer intención, servicio,
   nombre, teléfono, día y hora. Lo que devuelve se vuelve a validar aquí y
   la hora solo se acepta si está entre los huecos reales.

   Ningún secreto en este fichero: majlis-cita es pública (--no-verify-jwt)
   y escribe con la service role. La única clave aquí es la publicable,
   que solo puede insertar leads en majlis_leads (RLS).

   Idioma: inglés o árabe según window.I18N (i18n.js). Si el visitante cambia
   de idioma a mitad, los mensajes nuevos salen en el idioma nuevo.
   ========================================================================= */
(() => {
  "use strict";

  /* Supabase de WhiteMoon; funciones públicas majlis-* (--no-verify-jwt). */
  const FN_BASE = "https://mlaqtniujnvfxcvcourm.supabase.co";
  const CITA_FN = FN_BASE + "/functions/v1/majlis-cita";
  const LEADS_URL = FN_BASE + "/rest/v1/majlis_leads";
  /* Clave publicable (pública por diseño): solo permite lo que RLS deja a
     anon, que aquí es insertar un lead. No es un secreto. */
  const PUBLISHABLE_KEY = "sb_publishable_6no6BuOgiA_2nonTJntAuQ_DTqEgrcV";
  const BUSINESS = "Example Garage";
  const TZ = "Asia/Qatar";
  const DIAS_VISTA = 60;

  /* `id` es el nombre del servicio en la base de datos (majlis_services) y
     el data-svc de las tarjetas. `dur` es solo el valor por defecto. */
  const SERVICES = [
    { id: "oil", dur: 45 },
    { id: "service", dur: 60 },
    { id: "inspect", dur: 60 },
    { id: "tyres", dur: 45 },
    { id: "brakes", dur: 120 },
    { id: "diag", dur: 60 },
    { id: "ac", dur: 60 },
  ];

  /* ---------- textos ---------- */
  const L = {
    en: {
      hello: "Hi, I'm Leo, the AI assistant of " + BUSINESS + ", a demo workshop in Doha. I can book your visit in English or Arabic.",
      whatNeed: "What does your car need?",
      person: "Talk to a person",
      svc: {
        oil: "Oil change", service: "General service", inspect: "Pre-purchase inspection",
        tyres: "Tyres", brakes: "Brakes", diag: "Computer diagnostics", ac: "Air conditioning",
      },
      info: {
        oil: "Engine oil and filter to the manufacturer's specification, and we check fluid levels, lights and tyre pressure. It takes about 45 minutes. The price comes in a written quote in QAR.",
        service: "A full check of brakes, suspension, fluids, belts, battery, lights and tyres, with a short report. It takes about an hour. The price comes in a written quote in QAR.",
        inspect: "We check bodywork, engine, gearbox and electronics and take the car for a road test. It takes about an hour. The price comes in a written quote in QAR.",
        tyres: "Fitting, balancing and alignment, and we explain the options for your car. It takes about 45 minutes. The price comes in a written quote in QAR.",
        brakes: "Pads, discs and a full check of the braking system, plus a road test. We set aside two hours. The price comes in a written quote in QAR.",
        diag: "We read the control units to find warning lights, electrical faults and intermittent problems. It takes about an hour. The price comes in a written quote in QAR.",
        ac: "Leak check, cabin filter and refrigerant recharge. It takes about an hour. The price comes in a written quote in QAR.",
      },
      askName: "What name should I put the booking under?",
      namePh: "Your name…",
      nameAgain: "Could you tell me your name, please?",
      askPhone: (n) => "Thanks, " + n + ". What Qatar mobile number can the workshop reach you on?",
      phonePh: "+974 5XXX XXXX",
      phoneBad: "That doesn't look like a Qatar mobile number. Please write the 8 digits, for example 5512 3456.",
      askDay: "Which day suits you? We're open Sunday to Thursday.",
      dayPh: "Pick a day in the calendar",
      prevM: "Previous month", nextM: "Next month",
      closed: "closed",
      calNote: "Sun–Thu, 08:00–18:00. Friday and Saturday closed.",
      callMe: "I'd rather the team calls me",
      checking: "Checking the calendar…",
      noSlots: "That day is fully booked.",
      noNet: "I couldn't check the calendar right now.",
      tryOther: "Shall we try another day?",
      otherDay: "Another day",
      askTime: "Great. What time suits you best?",
      timePh: "Pick a time",
      morning: "Morning", afternoon: "Afternoon",
      taken: "Sorry, someone has just taken that slot. Here are the times still free that day.",
      booked: "Booking confirmed",
      rows: { name: "Name", phone: "Phone", service: "Service", date: "Date", time: "Time", place: "Workshop" },
      bookedBye: "See you at the workshop. If your plans change, open this chat and choose to talk to a person.",
      leadOk: (p) => "Noted. The team will call you on " + p + " to arrange the day and time.",
      leadFail: "I've noted your details, but there was a connection problem. Please try again in a moment.",
      handName: "Of course, I'll pass you to the team. What's your name?",
      anythingElse: "Can I help with anything else?",
      newBooking: "Make another booking",
      inputLabel: "Type your reply…",
      freePh: "Or type what you need…",
      notUnderstood: "Sorry, I couldn't read that right now. Please choose one of the options.",
      whichService: "Sure. Which service do you need?",
      closedDay: "We're closed on Fridays and Saturdays, so let's pick another day.",
      timeFree: (h, d) => h + " on " + d + " is free. Shall I book it?",
      timeNotFree: (h) => h + " isn't free that day. These are the times still available.",
      yesBook: "Yes, book it",
      otherTimes: "See other times",
    },
    ar: {
      hello: "مرحباً، أنا ليو، المساعد الذكي لـ " + BUSINESS + "، ورشة تجريبية في الدوحة. يمكنني حجز موعدك بالعربية أو الإنجليزية.",
      whatNeed: "ماذا تحتاج سيارتك؟",
      person: "التحدث مع موظف",
      svc: {
        oil: "تغيير الزيت", service: "الصيانة الدورية", inspect: "فحص ما قبل الشراء",
        tyres: "الإطارات", brakes: "الفرامل", diag: "الفحص بالكمبيوتر", ac: "التكييف",
      },
      info: {
        oil: "زيت المحرك والفلتر حسب مواصفات الشركة المصنّعة، ونفحص مستويات السوائل والأضواء وضغط الإطارات. تستغرق الخدمة نحو 45 دقيقة. السعر يُحدَّد في عرض مكتوب بالريال القطري.",
        service: "فحص كامل للفرامل والتعليق والسوائل والسيور والبطارية والأضواء والإطارات، مع تقرير مختصر. تستغرق نحو ساعة. السعر يُحدَّد في عرض مكتوب بالريال القطري.",
        inspect: "نفحص الهيكل والمحرك وناقل الحركة والأنظمة الكهربائية ونجري تجربة قيادة. يستغرق نحو ساعة. السعر يُحدَّد في عرض مكتوب بالريال القطري.",
        tyres: "تركيب وموازنة وضبط الزوايا، ونشرح لك الخيارات المناسبة لسيارتك. تستغرق نحو 45 دقيقة. السعر يُحدَّد في عرض مكتوب بالريال القطري.", // AR-REVIEW
        brakes: "الفحمات والأقراص وفحص كامل لنظام الفرامل، مع تجربة قيادة. نخصص لها ساعتين. السعر يُحدَّد في عرض مكتوب بالريال القطري.", // AR-REVIEW
        diag: "نقرأ وحدات التحكم لتحديد لمبات التحذير والأعطال الكهربائية والمشاكل المتقطعة. يستغرق نحو ساعة. السعر يُحدَّد في عرض مكتوب بالريال القطري.",
        ac: "فحص التسريبات وفلتر المقصورة وتعبئة غاز التبريد. تستغرق نحو ساعة. السعر يُحدَّد في عرض مكتوب بالريال القطري.",
      },
      askName: "باسم من أسجّل الحجز؟",
      namePh: "اسمك…",
      nameAgain: "هل يمكنك أن تخبرني باسمك من فضلك؟",
      askPhone: (n) => "شكراً يا " + n + ". ما رقم الجوال القطري الذي يمكن للورشة التواصل معك عليه؟",
      phonePh: "+974 5XXX XXXX",
      phoneBad: "لا يبدو هذا رقم جوال قطرياً. اكتب الأرقام الثمانية من فضلك، مثل 5512 3456.",
      askDay: "أي يوم يناسبك؟ نعمل من الأحد إلى الخميس.",
      dayPh: "اختر يوماً من التقويم",
      prevM: "الشهر السابق", nextM: "الشهر التالي",
      closed: "مغلق",
      calNote: "الأحد–الخميس، 08:00–18:00. الجمعة والسبت مغلق.",
      callMe: "أفضّل أن يتصل بي الفريق",
      checking: "أتحقق من جدول المواعيد…",
      noSlots: "هذا اليوم محجوز بالكامل.",
      noNet: "لم أتمكن من الاطلاع على جدول المواعيد الآن.",
      tryOther: "هل نجرّب يوماً آخر؟",
      otherDay: "يوم آخر",
      askTime: "ممتاز. ما الساعة التي تناسبك أكثر؟",
      timePh: "اختر الساعة",
      morning: "صباحاً", afternoon: "بعد الظهر",
      taken: "عذراً، حُجز هذا الموعد للتو. هذه الأوقات التي ما زالت متاحة في ذلك اليوم.",
      booked: "تم تأكيد الحجز",
      rows: { name: "الاسم", phone: "الهاتف", service: "الخدمة", date: "التاريخ", time: "الساعة", place: "الورشة" },
      bookedBye: "نراك في الورشة. إذا تغيّرت خططك، افتح هذه المحادثة واختر التحدث مع موظف.",
      leadOk: (p) => "تم التسجيل. سيتصل بك الفريق على الرقم " + p + " لتحديد اليوم والساعة.",
      leadFail: "سجّلت بياناتك، لكن حدثت مشكلة في الاتصال. حاول مرة أخرى بعد قليل من فضلك.",
      handName: "بالتأكيد، سأحوّلك إلى الفريق. ما اسمك؟",
      anythingElse: "هل يمكنني مساعدتك في شيء آخر؟",
      newBooking: "حجز موعد آخر",
      inputLabel: "اكتب ردّك…",
      freePh: "أو اكتب ما تحتاجه…",
      notUnderstood: "عذراً، لم أتمكن من قراءة ذلك الآن. اختر أحد الخيارات من فضلك.",
      whichService: "بالتأكيد. ما الخدمة التي تحتاجها؟",
      closedDay: "نحن مغلقون يومي الجمعة والسبت، فلنختر يوماً آخر.",
      timeFree: (h, d) => "الساعة " + h + " يوم " + d + " متاحة. هل أحجزها لك؟",
      timeNotFree: (h) => "الساعة " + h + " غير متاحة في ذلك اليوم. هذه الأوقات التي ما زالت متاحة.",
      yesBook: "نعم، احجزها",
      otherTimes: "أوقات أخرى",
    },
  };
  const lang = () => (window.I18N && window.I18N.lang === "ar" ? "ar" : "en");
  const T = () => L[lang()];
  const locale = () => (lang() === "ar" ? "ar-QA-u-nu-latn" : "en-GB");

  /* ---------- fechas en hora de Doha ---------- */
  /* "Hoy" es el de Qatar, no el del navegador: alguien que reserva desde
     fuera no debe ver como libre un día que en Doha ya ha pasado. */
  const hoyDoha = () => {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const [y, m, d] = p.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const isoDia = (d) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const fmtLargo = (d) => d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtCorto = (d) => d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
  /* Los ISO de `slots` vienen con su offset (+03:00): se corta a pelo para
     que el navegador no los pase a su zona. */
  const horaDe = (iso) => iso.slice(11, 16);
  /* Laborable en Qatar: domingo (0) a jueves (4). */
  const abre = (d) => d.getDay() <= 4;
  const candidato = (d, hoy, limite) => abre(d) && d >= hoy && d <= limite;

  /* ---------- DOM ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const panel = $("#leo");
  if (!panel) return;
  const body = $(".leo-body", panel);
  const quick = $(".leo-quick", panel);
  const form = $(".leo-foot", panel);
  const input = $(".leo-foot input", panel);
  const sendBtn = $(".leo-foot button", panel);
  const btn = $("#leo-open");

  const lead = { service: "", name: "", phone: "", day: null, start: "", handoff: false, wantTime: "" };
  let step = "svc";
  let started = false;
  let vista = null;
  let enviado = false;
  let quickActual = null;   // [items, onPick] para repintar al cambiar idioma
  let widgetActual = null;  // función que repinta el widget visible
  let phKey = "inputLabel";

  /* ---------- helpers UI ---------- */
  const scroll = () => { body.scrollTop = body.scrollHeight; };
  const addMsg = (text, who = "bot") => {
    const el = document.createElement("div");
    el.className = "leo-msg " + who;
    el.setAttribute("dir", "auto");
    el.textContent = text;
    body.appendChild(el); scroll();
  };
  const typing = () => {
    const t = document.createElement("div");
    t.className = "leo-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t); scroll();
    return t;
  };
  const botSay = (text, after) =>
    new Promise((res) => {
      const t = typing();
      setTimeout(() => {
        t.remove(); addMsg(text, "bot");
        if (after) after();
        res();
      }, Math.min(900, 340 + text.length * 6));
    });
  const clearQuick = () => { quick.innerHTML = ""; quickActual = null; };
  /* items: [{ key, label: () => texto }] — la etiqueta es una función para
     poder repintarla en el otro idioma. */
  const setQuick = (items, onPick) => {
    quick.innerHTML = "";
    quickActual = [items, onPick];
    items.forEach((it) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = it.label();
      b.addEventListener("click", () => { addMsg(it.label(), "user"); onPick(it); });
      quick.appendChild(b);
    });
  };
  const setInput = (enabled, key) => {
    input.disabled = !enabled; sendBtn.disabled = !enabled;
    phKey = key || "inputLabel";
    input.placeholder = T()[phKey];
    if (enabled) setTimeout(() => input.focus(), 60);
  };
  const widget = (cls) => {
    let w = $("#leo-widget", body);
    if (!w) { w = document.createElement("div"); w.id = "leo-widget"; body.appendChild(w); }
    w.className = cls;
    w.innerHTML = "";
    scroll();
    return w;
  };
  const quitaWidget = () => { const w = $("#leo-widget", body); if (w) w.remove(); widgetActual = null; };
  const linkBtn = (texto, onClick) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "leo-back"; b.textContent = texto;
    b.addEventListener("click", onClick);
    return b;
  };

  /* ---------- backend ---------- */
  const llama = async (payload) => {
    try {
      const r = await fetch(CITA_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) console.warn("[leo] majlis-cita", r.status, data);
      return data;
    } catch (e) {
      console.warn("[leo] majlis-cita sin red:", e);
      return { _neterr: true };
    }
  };

  /* ---------- flujo ---------- */
  const svcItems = () => SERVICES.map((s) => ({ key: s.id, label: () => T().svc[s.id] }));
  const personItem = { key: "person", label: () => T().person };

  const start = async () => {
    if (started) return; started = true;
    setInput(false);
    await botSay(T().hello);
    await botSay(T().whatNeed, menuInicial);
  };

  const menuInicial = () => {
    step = "svc";
    setInput(true, "freePh");
    setQuick(svcItems().concat([personItem]), (it) => {
      if (it.key === "person") handoff(); else pickService(it.key);
    });
  };

  const pickService = async (id) => {
    const s = SERVICES.find((x) => x.id === id) || SERVICES[0];
    lead.service = s.id;
    lead.handoff = false;
    clearQuick();
    await botSay(T().info[s.id]);
    siguiente();
  };

  /* Siguiente dato que falta. Lo que ya llegó por texto libre no se vuelve
     a preguntar. */
  const siguiente = () => {
    if (!lead.name) askName();
    else if (!lead.phone) askPhone();
    else if (lead.handoff) cierreSinCita(false);
    else if (lead.day) askTime();
    else askDay();
  };

  /* ---------- texto libre: Claude vía majlis-cita ---------- */
  const entender = async (text) => {
    /* Después de una cita o un aviso, un mensaje nuevo es una petición nueva. */
    if (step === "done") { enviado = false; lead.day = null; lead.start = ""; lead.handoff = false; }
    step = "ai";
    setInput(false); clearQuick();
    const t = typing();
    const res = await llama({ action: "understand", text, lang: lang() });
    t.remove();
    if (!res || !res.ok) { await botSay(T().notUnderstood, menuInicial); return; }
    if (res.name && !lead.name) lead.name = String(res.name).slice(0, 80);
    if (res.phone && !lead.phone) lead.phone = res.phone;

    if (res.intent === "handoff") { lead.handoff = true; lead.service = ""; siguiente(); return; }
    if (res.intent === "book") {
      if (res.date) {
        const [y, m, d] = res.date.split("-").map(Number);
        const f = new Date(y, m - 1, d);
        const hoy = hoyDoha();
        const lim = new Date(hoy); lim.setDate(lim.getDate() + DIAS_VISTA);
        if (candidato(f, hoy, lim)) { lead.day = f; lead.wantTime = res.time || ""; }
        else if (!abre(f)) await botSay(T().closedDay);
      }
      if (res.service && SERVICES.some((x) => x.id === res.service)) { pickService(res.service); return; }
      await botSay(T().whichService, menuInicial);
      return;
    }
    await botSay(res.reply || T().whatNeed, menuInicial);
  };

  const askName = async () => {
    step = "name";
    clearQuick();
    await botSay(T().askName, () => setInput(true, "namePh"));
  };

  const handoff = async () => {
    lead.handoff = true;
    lead.service = "";
    clearQuick();
    if (lead.name && lead.phone) { cierreSinCita(false); return; }
    step = "name";
    await botSay(T().handName, () => setInput(true, "namePh"));
  };

  const askPhone = async () => {
    step = "phone";
    await botSay(T().askPhone(lead.name.split(" ")[0]), () => setInput(true, "phonePh"));
  };

  /* ---------- día ---------- */
  const askDay = async () => {
    step = "day";
    clearQuick();
    if (!vista) { const h = hoyDoha(); vista = new Date(h.getFullYear(), h.getMonth(), 1); }
    await botSay(T().askDay, () => {
      setInput(false, "dayPh");
      pintaCalendario();
    });
  };

  function pintaCalendario() {
    widgetActual = pintaCalendario;
    const t = T();
    const box = widget("leo-cal");
    const hoy = hoyDoha();
    const limite = new Date(hoy); limite.setDate(limite.getDate() + DIAS_VISTA);
    const mesHoy = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesLimite = new Date(limite.getFullYear(), limite.getMonth(), 1);
    const rtl = lang() === "ar";

    const nav = document.createElement("div");
    nav.className = "leo-cal__nav";
    /* En RTL la rejilla corre de derecha a izquierda: el botón de "anterior"
       queda a la derecha y su flecha tiene que apuntar hacia allí. */
    const mk = (txt, aria, off, dis) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "leo-cal__btn"; b.textContent = txt;
      b.setAttribute("aria-label", aria); b.disabled = dis;
      b.addEventListener("click", () => {
        vista = new Date(vista.getFullYear(), vista.getMonth() + off, 1);
        pintaCalendario();
      });
      return b;
    };
    nav.appendChild(mk(rtl ? "›" : "‹", t.prevM, -1, vista <= mesHoy));
    const titulo = document.createElement("p");
    titulo.className = "leo-cal__mes";
    titulo.setAttribute("aria-live", "polite");
    titulo.textContent = vista.toLocaleDateString(locale(), { month: "long", year: "numeric" });
    nav.appendChild(titulo);
    nav.appendChild(mk(rtl ? "‹" : "›", t.nextM, 1, vista >= mesLimite));
    box.appendChild(nav);

    const grid = document.createElement("div");
    grid.className = "leo-cal__grid";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", titulo.textContent);
    /* Semana de domingo a sábado, como en Qatar. 2023-01-01 fue domingo. */
    for (let i = 0; i < 7; i++) {
      const d = new Date(2023, 0, 1 + i);
      const c = document.createElement("span");
      c.className = "leo-cal__wd"; c.setAttribute("aria-hidden", "true");
      c.textContent = d.toLocaleDateString(locale(), { weekday: "narrow" });
      grid.appendChild(c);
    }
    const primero = new Date(vista.getFullYear(), vista.getMonth(), 1);
    for (let h = 0; h < primero.getDay(); h++) {
      const v = document.createElement("span");
      v.className = "leo-cal__day is-empty"; v.setAttribute("aria-hidden", "true");
      grid.appendChild(v);
    }
    const ultimo = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= ultimo; n++) {
      const fecha = new Date(vista.getFullYear(), vista.getMonth(), n);
      const b = document.createElement("button");
      b.type = "button"; b.className = "leo-cal__day"; b.textContent = String(n);
      if (fecha.getTime() === hoy.getTime()) b.classList.add("is-today");
      if (!candidato(fecha, hoy, limite)) {
        b.disabled = true;
        b.setAttribute("aria-label", fmtLargo(fecha) + (abre(fecha) ? "" : ", " + t.closed));
      } else {
        b.setAttribute("aria-label", fmtLargo(fecha));
        b.addEventListener("click", () => eligeDia(fecha));
      }
      grid.appendChild(b);
    }
    box.appendChild(grid);

    const nota = document.createElement("p");
    nota.className = "leo-cal__nota";
    nota.textContent = t.calNote;
    box.appendChild(nota);
    box.appendChild(linkBtn(t.callMe, () => { addMsg(t.callMe, "user"); quitaWidget(); cierreSinCita(); }));
  }

  const eligeDia = (fecha) => {
    lead.day = fecha;
    addMsg(fmtCorto(fecha), "user");
    quitaWidget();
    askTime();
  };

  /* ---------- hora: huecos REALES de la agenda ---------- */
  const askTime = async () => {
    step = "time";
    const t = typing();
    const s = SERVICES.find((x) => x.id === lead.service);
    const res = await llama({ action: "slots", service: lead.service, date: isoDia(lead.day), duration_min: s ? s.dur : 60 });
    t.remove();
    const slots = res && res.ok && Array.isArray(res.slots) ? res.slots : [];
    if (!slots.length) {
      const motivo = res && res._neterr ? T().noNet : T().noSlots;
      await botSay(motivo + " " + T().tryOther, pintaSinHuecos);
      return;
    }
    const quiere = lead.wantTime;
    lead.wantTime = "";
    if (quiere) {
      const iso = slots.find((h) => horaDe(h) === quiere);
      if (iso) {
        await botSay(T().timeFree(quiere, fmtCorto(lead.day)), () =>
          setQuick([{ key: "yes", label: () => T().yesBook }, { key: "no", label: () => T().otherTimes }], (it) => {
            clearQuick();
            if (it.key === "yes") { lead.start = iso; reservar(); }
            else { setInput(false, "timePh"); pintaHoras(slots); }
          }));
        return;
      }
      await botSay(T().timeNotFree(quiere), () => { setInput(false, "timePh"); pintaHoras(slots); });
      return;
    }
    await botSay(T().askTime, () => {
      setInput(false, "timePh");
      pintaHoras(slots);
    });
  };

  function pintaSinHuecos() {
    widgetActual = pintaSinHuecos;
    const t = T();
    const box = widget("leo-slots");
    box.appendChild(linkBtn(t.otherDay, () => { addMsg(t.otherDay, "user"); quitaWidget(); askDay(); }));
    box.appendChild(linkBtn(t.callMe, () => { addMsg(t.callMe, "user"); quitaWidget(); cierreSinCita(); }));
  }

  function pintaHoras(slots) {
    widgetActual = () => pintaHoras(slots);
    const t = T();
    const box = widget("leo-slots");
    const manana = slots.filter((h) => parseInt(horaDe(h), 10) < 12);
    const tarde = slots.filter((h) => parseInt(horaDe(h), 10) >= 12);
    [[t.morning, manana], [t.afternoon, tarde]].forEach(([etiqueta, lista]) => {
      if (!lista.length) return;
      const sep = document.createElement("p");
      sep.className = "leo-slots__sep";
      sep.textContent = etiqueta;
      box.appendChild(sep);
      lista.forEach((iso) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "leo-slot"; b.textContent = horaDe(iso);
        b.setAttribute("aria-label", horaDe(iso) + ", " + fmtCorto(lead.day));
        b.addEventListener("click", () => eligeHora(iso));
        box.appendChild(b);
      });
    });
    box.appendChild(linkBtn(t.otherDay, () => { addMsg(t.otherDay, "user"); quitaWidget(); askDay(); }));
  }

  const eligeHora = (iso) => {
    lead.start = iso;
    addMsg(horaDe(iso), "user");
    quitaWidget();
    reservar();
  };

  const CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  const tarjetaExito = (texto) => {
    const el = document.createElement("div");
    el.className = "leo-ok";
    el.setAttribute("role", "status");
    const ic = document.createElement("span");
    ic.className = "leo-ok__ic";
    ic.setAttribute("aria-hidden", "true");
    ic.innerHTML = CHECK_SVG;
    const p = document.createElement("p");
    p.textContent = texto;
    el.append(ic, p);
    body.appendChild(el);
    scroll();
  };

  /* Resguardo de la cita: nodos y textContent, nunca innerHTML con datos del
     usuario. */
  const tarjetaCita = (titulo, filas) => {
    const el = document.createElement("div");
    el.className = "leo-cita";
    el.setAttribute("role", "status");
    const head = document.createElement("div");
    head.className = "leo-cita__head";
    const ic = document.createElement("span");
    ic.className = "leo-cita__ic";
    ic.setAttribute("aria-hidden", "true");
    ic.innerHTML = CHECK_SVG;
    const b = document.createElement("b");
    b.textContent = titulo;
    head.append(ic, b);
    const dl = document.createElement("dl");
    dl.className = "leo-cita__rows";
    filas.forEach(([k, v]) => {
      if (!v) return;
      const row = document.createElement("div");
      row.className = "leo-cita__row";
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.setAttribute("dir", "auto");
      dd.textContent = v;
      row.append(dt, dd);
      dl.appendChild(row);
    });
    el.append(head, dl);
    body.appendChild(el);
    scroll();
  };

  /* ---------- reserva real ---------- */
  const reservar = async () => {
    setInput(false); clearQuick();
    const t = typing();
    const res = await llama({
      action: "book",
      service: lead.service,
      name: lead.name,
      phone: lead.phone,
      start: lead.start,
      lang: lang(),
    });
    t.remove();

    if (res && res.ok === false && res.reason === "taken") {
      await botSay(T().taken);
      askTime();
      return;
    }
    /* Tope de citas activas (por móvil o en total): no se reserva y el
       servidor ya ha guardado el lead, así que aquí no se envía otro. */
    if (res && res.ok === false && res.reason === "limit") {
      step = "done";
      enviado = true;
      tarjetaExito(T().leadOk(lead.phone));
      ofreceMas();
      return;
    }
    if (!res || !res.ok) {
      /* La agenda no responde: el lead se guarda con la franja pedida y la
         persona del taller llama para confirmarla. */
      await cierreSinCita(true);
      return;
    }

    step = "done";
    /* majlis-cita guarda el lead y avisa al taller: aquí no se envía nada más. */
    enviado = true;
    const r = T().rows;
    tarjetaCita(T().booked, [
      [r.name, lead.name],
      [r.phone, lead.phone],
      [r.service, T().svc[lead.service]],
      [r.date, fmtLargo(lead.day)],
      [r.time, horaDe(lead.start)],
      [r.place, BUSINESS],
    ]);
    setTimeout(() => { addMsg(T().bookedBye, "bot"); ofreceMas(); }, 700);
  };

  /* Cierre sin cita: el lead sale igual hacia el taller. Si el envío falla,
     console.warn y el usuario no se queda bloqueado. */
  const cierreSinCita = async (conFranja) => {
    step = "done";
    setInput(false); clearQuick(); quitaWidget();
    if (!conFranja) { lead.day = null; lead.start = ""; }
    const t = typing();
    const ok = await enviarLead();
    t.remove();
    if (ok) tarjetaExito(T().leadOk(lead.phone));
    else addMsg(T().leadFail, "bot");
    ofreceMas();
  };

  const ofreceMas = () => {
    setTimeout(() => {
      botSay(T().anythingElse, () => {
        setInput(true, "freePh");
        setQuick([{ key: "new", label: () => T().newBooking }, personItem], (it) => {
          enviado = false;
          lead.day = null; lead.start = ""; lead.wantTime = ""; lead.handoff = false;
          if (it.key === "person") handoff(); else menuInicial();
        });
      });
    }, 900);
  };

  /* ---------- entrada de texto ---------- */
  /* Dígitos árabe-índicos (٠-٩) y persas (۰-۹) a latinos. */
  const aLatin = (v) => String(v).replace(/[٠-٩]/g, (c) => c.charCodeAt(0) - 0x0660)
    .replace(/[۰-۹]/g, (c) => c.charCodeAt(0) - 0x06f0);
  /* Móvil de Qatar: 8 dígitos que empiezan por 3, 5, 6 o 7, con o sin
     +974 / 00974 delante. Devuelve "+974 XXXX XXXX" o null. */
  const normPhone = (v) => {
    let d = aLatin(v).replace(/\D/g, "");
    if (d.length > 8) d = d.replace(/^(?:00)?974/, "");
    return /^[3567]\d{7}$/.test(d) ? "+974 " + d.slice(0, 4) + " " + d.slice(4) : null;
  };

  const handleText = (raw) => {
    const v = raw.trim().slice(0, 400);
    if (!v) return;
    addMsg(v, "user");
    input.value = "";
    if (step === "svc" || step === "done") {
      entender(v);
    } else if (step === "name") {
      if (v.length < 2) { botSay(T().nameAgain); return; }
      lead.name = v.slice(0, 80); setInput(false); siguiente();
    } else if (step === "phone") {
      const p = normPhone(v);
      if (!p) { botSay(T().phoneBad); return; }
      lead.phone = p; setInput(false);
      siguiente();
    }
  };

  form.addEventListener("submit", (e) => { e.preventDefault(); handleText(input.value); });

  /* Con nombre y teléfono ya hay lead: si se marcha a mitad del calendario,
     se manda al salir de la página. */
  window.addEventListener("pagehide", () => {
    if (!enviado && lead.name && lead.phone) enviarLead();
  });

  /* ---------- envío del lead ----------
     Lead sin cita (prefiere que le llamen, la agenda no respondió o pidió
     una persona): INSERT en majlis_leads con la clave PUBLICABLE. RLS solo
     deja a anon insertar filas nuevas en esas columnas; leerlas solo puede
     el dueño desde su panel. keepalive para sobrevivir al cierre de pestaña.
     Si falla: console.warn y el chat sigue. */
  const enviarLead = async () => {
    if (enviado) return true;
    enviado = true;
    const fila = {
      name: lead.name,
      phone: lead.phone,
      service_id: lead.service || null,
      pref_date: lead.day ? isoDia(lead.day) : null,
      pref_time: lead.start ? horaDe(lead.start) : null,
      handoff: lead.handoff,
      lang: lang(),
    };
    try {
      const r = await fetch(LEADS_URL, {
        method: "POST", keepalive: true,
        headers: { apikey: PUBLISHABLE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(fila),
      });
      if (!r.ok) console.warn("[leo] majlis_leads:", r.status);
      return r.ok;
    } catch (e) {
      console.warn("[leo] majlis_leads error:", e);
      return false;
    }
  };

  /* ---------- cambio de idioma a mitad de conversación ---------- */
  document.addEventListener("langchange", () => {
    input.placeholder = T()[phKey];
    if (quickActual) setQuick(quickActual[0], quickActual[1]);
    if (widgetActual) widgetActual();
  });

  /* ---------- abrir / cerrar ---------- */
  const open = (svc) => {
    panel.classList.add("open");
    panel.removeAttribute("inert");
    if (btn) btn.style.display = "none";
    if (started) {
      if (svc && (step === "svc" || step === "done")) { addMsg(T().svc[svc], "user"); enviado = false; pickService(svc); }
      return;
    }
    start().then(() => {
      if (svc && step === "svc") { addMsg(T().svc[svc], "user"); pickService(svc); }
    });
  };
  const close = () => {
    panel.classList.remove("open");
    panel.setAttribute("inert", "");
    if (btn) { btn.style.display = ""; btn.focus(); }
  };
  if (btn) btn.addEventListener("click", () => open());
  $(".leo-head__close", panel).addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });
  document.querySelectorAll("[data-leo]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const svc = el.dataset.svc;
      open(SERVICES.some((s) => s.id === svc) ? svc : undefined);
    })
  );
})();
