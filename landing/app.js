(function () {
  'use strict';

  /* ---------- i18n ---------- */
  var T = {
    en: {"brand": "Majlis AI", "nav_problem": "The problem", "nav_features": "What it does", "nav_demo": "Live demo", "nav_how": "How it works", "nav_faq": "FAQ", "eyebrow": "AI assistant · Arabic + English", "h1": "Your customers write at midnight. Your business answers.", "lead": "Majlis AI talks to your customers in Arabic and English, answers their questions and books appointments around the clock. They get an instant reply. You get the booking.", "cta1": "Try the live demo", "cta2": "See how it works", "p1": "Arabic first, RTL", "p2": "Books 24/7", "p3": "Hands over to a person", "pr_eyebrow": "The problem", "pr_h": "Small businesses lose customers in the gaps", "pr1_h": "Messages left waiting", "pr1_p": "A customer who writes after hours and gets no answer may simply book somewhere else.", "pr2_h": "Staff on repeat", "pr2_p": "The team stops what it is doing to answer the same questions about hours, location and free slots.", "pr3_h": "Two languages, one inbox", "pr3_p": "Customers write in Arabic or English, sometimes both in one message. The reply should follow them.", "ft_eyebrow": "What it does", "ft_h": "One assistant for the whole booking conversation", "f1_h": "Arabic and English", "f1_p": "Replies in the language the customer uses, with a full right-to-left experience.", "f2_h": "Books appointments", "f2_p": "Service, day, time, name and mobile number, with only the free slots on offer.", "f3_h": "Owner dashboard", "f3_p": "Every booking appears in one place, and it can be cancelled in a click.", "f4_h": "Human handover", "f4_p": "When a customer wants a person, or the question is sensitive, the team takes over.", "f5_h": "Only approved answers", "f5_p": "It answers with the information you provide. When it does not know, it says so.", "f6_h": "On your website or a link", "f6_p": "Embedded in your site or shared as a QR code or link, with a clear “AI assistant” label.", "demo_eyebrow": "Live demo", "demo_h": "Talk to the assistant. Watch the booking appear.", "demo_sub": "Pick a service, or type in Arabic or English. Try asking for the opening hours, or write “cancel”.", "biz_name": "Demo Dental Clinic · Doha", "ai_tag": "AI assistant", "reset": "Restart", "send": "Send", "ph": "Write a message…", "panel_h": "Business dashboard", "panel_sub": "What the owner sees, in real time.", "empty": "No bookings yet. Book one in the chat.", "how_eyebrow": "How it works", "how_h": "Live in days, with no new software to learn", "s1_h": "We learn your business", "s1_p": "Services, hours, location and tone of voice. The assistant only uses what you approve.", "s2_h": "It talks to your customers", "s2_p": "On your website, or through a QR code or link. Arabic or English, whichever the customer writes.", "s3_h": "You receive the booking", "s3_p": "Appointments land in your dashboard. If the assistant is unsure, it hands over to a person.", "cmp_eyebrow": "Before and after", "cmp_h": "The same business, with and without", "cmp_a": "Without Majlis AI", "cmp_b": "With Majlis AI", "a1": "Messages wait until someone is free", "a2": "Bookings are written down by hand", "a3": "Staff repeat the same answers all day", "a4": "After-hours enquiries go unanswered", "b1": "Instant reply, day and night", "b2": "Bookings arrive already structured", "b3": "Staff handle only what needs a person", "b4": "Every enquiry gets an answer", "sec_eyebrow": "Who it is for", "sec_h": "Any business that works by appointment", "t1": "Clinics and dental", "t2": "Salons and barbers", "t3": "Spas and wellness", "t4": "Car services", "t5": "Fitness studios", "t6": "Property viewings", "gl_eyebrow": "Built for Qatar", "gl_h": "Designed around how business works here", "g1_h": "Arabic-first", "g1_p": "Right-to-left layout and Arabic writing from the start, not translated afterwards.", "g2_h": "Local week", "g2_p": "Sunday to Thursday scheduling, with Friday and Saturday handled as closed days.", "g3_h": "Local numbers", "g3_p": "Qatar mobile format, and Arabic-Indic digits are understood.", "g4_h": "Clear and careful", "g4_p": "Always labelled as an AI assistant, and it collects only what a booking needs.", "rm_eyebrow": "Where we are", "rm_h": "A working prototype, and the road ahead", "st_done": "Done", "st_next": "Next", "st_then": "Then", "r1_h": "Working prototype", "r1_p": "Bilingual landing, booking conversation and owner dashboard, as shown above.", "r2_h": "Real AI conversation", "r2_p": "Free-form understanding in Arabic and English, with a database and instant alerts to the owner.", "r3_h": "Pilot in Doha", "r3_p": "Launch with a first group of businesses, learn from real conversations and refine.", "faq_eyebrow": "Questions", "faq_h": "Straight answers", "q1": "Does the customer know it is an AI?", "q1a": "Yes. The chat is labelled “AI assistant” and says so in its first message.", "q2": "What if it does not know the answer?", "q2a": "It says so and offers to pass the customer to a person. It never invents prices or medical, legal or financial advice.", "q3": "Does it guarantee more sales?", "q3a": "No. It answers faster and never misses a message. What you earn from that depends on your business.", "q4": "Where does it run?", "q4a": "On your website, or through a QR code or link. Other channels can come later.", "fin_h": "See it working with your own business", "fin_p": "Tell us your services and opening hours, and we will set up a version for you to test.", "foot": "Majlis AI is a working name. Prototype in development. The business shown is fictional."},
    ar: {"brand": "مجلس AI", "nav_problem": "المشكلة", "nav_features": "ماذا يفعل", "nav_demo": "تجربة مباشرة", "nav_how": "كيف يعمل", "nav_faq": "أسئلة", "eyebrow": "مساعد ذكاء اصطناعي · عربي + إنجليزي", "h1": "عملاؤك يكتبون في منتصف الليل. ونشاطك يرد.", "lead": "مجلس AI يتحدث مع عملائك بالعربية والإنجليزية، ويجيب عن أسئلتهم ويحجز المواعيد على مدار الساعة. هم يحصلون على رد فوري، وأنت تحصل على الحجز.", "cta1": "جرّب العرض المباشر", "cta2": "تعرّف على طريقة العمل", "p1": "عربي أولاً، من اليمين لليسار", "p2": "حجز على مدار الساعة", "p3": "تحويل إلى شخص", "pr_eyebrow": "المشكلة", "pr_h": "الأنشطة الصغيرة تخسر عملاءها في الفجوات", "pr1_h": "رسائل تنتظر", "pr1_p": "العميل الذي يكتب بعد الدوام ولا يجد رداً قد يحجز عند غيرك.", "pr2_h": "فريق يكرّر نفسه", "pr2_p": "يتوقف الفريق عن عمله ليجيب عن الأسئلة نفسها: المواعيد والموقع والأوقات المتاحة.", "pr3_h": "لغتان وصندوق واحد", "pr3_p": "يكتب العملاء بالعربية أو بالإنجليزية، وأحياناً بهما معاً. ويجب أن يتبعهم الرد.", "ft_eyebrow": "ماذا يفعل", "ft_h": "مساعد واحد لمحادثة الحجز كاملة", "f1_h": "عربي وإنجليزي", "f1_p": "يرد بلغة العميل، بتجربة كاملة من اليمين إلى اليسار.", "f2_h": "يحجز المواعيد", "f2_p": "الخدمة واليوم والوقت والاسم ورقم الجوال، ولا يعرض إلا الأوقات المتاحة.", "f3_h": "لوحة لصاحب النشاط", "f3_p": "كل الحجوزات في مكان واحد، ويمكن إلغاؤها بنقرة.", "f4_h": "تحويل إلى شخص", "f4_p": "حين يريد العميل التحدث مع شخص، أو يكون السؤال حساساً، يتولى الفريق الأمر.", "f5_h": "إجابات معتمدة فقط", "f5_p": "يجيب بالمعلومات التي تقدّمها أنت. وإذا لم يعرف يقول ذلك.", "f6_h": "على موقعك أو عبر رابط", "f6_p": "مدمج في موقعك أو عبر رمز QR أو رابط، مع تنبيه واضح بأنه «مساعد ذكاء اصطناعي».", "demo_eyebrow": "تجربة مباشرة", "demo_h": "تحدّث مع المساعد وشاهد الحجز يظهر.", "demo_sub": "اختر خدمة، أو اكتب بالعربية أو الإنجليزية. جرّب أن تسأل عن ساعات العمل، أو اكتب «إلغاء».", "biz_name": "عيادة تجريبية للأسنان · الدوحة", "ai_tag": "مساعد ذكاء اصطناعي", "reset": "إعادة", "send": "إرسال", "ph": "اكتب رسالة…", "panel_h": "لوحة صاحب النشاط", "panel_sub": "ما يراه صاحب النشاط لحظة بلحظة.", "empty": "لا توجد حجوزات بعد. احجز من المحادثة.", "how_eyebrow": "كيف يعمل", "how_h": "جاهز خلال أيام دون تعلّم برنامج جديد", "s1_h": "نتعرّف على نشاطك", "s1_p": "الخدمات والمواعيد والموقع وأسلوب الكلام. ولا يستخدم المساعد إلا ما تعتمده.", "s2_h": "يتحدث مع عملائك", "s2_p": "على موقعك أو عبر رمز QR أو رابط. بالعربية أو الإنجليزية حسب لغة العميل.", "s3_h": "يصلك الحجز", "s3_p": "تظهر المواعيد في لوحتك. وإذا لم يكن المساعد متأكداً يحوّل المحادثة إلى شخص.", "cmp_eyebrow": "قبل وبعد", "cmp_h": "النشاط نفسه، بدون المساعد ومعه", "cmp_a": "بدون مجلس AI", "cmp_b": "مع مجلس AI", "a1": "الرسائل تنتظر حتى يتفرغ أحد", "a2": "الحجوزات تُكتب يدوياً", "a3": "الفريق يكرّر الإجابات طوال اليوم", "a4": "استفسارات ما بعد الدوام بلا رد", "b1": "رد فوري ليلاً ونهاراً", "b2": "الحجوزات تصل منظّمة", "b3": "الفريق يتولى فقط ما يحتاج إلى شخص", "b4": "كل استفسار يحصل على جواب", "sec_eyebrow": "لمن هو", "sec_h": "أي نشاط يعمل بالمواعيد", "t1": "العيادات وطب الأسنان", "t2": "الصالونات والحلاقة", "t3": "السبا والعافية", "t4": "خدمات السيارات", "t5": "استوديوهات اللياقة", "t6": "معاينات العقارات", "gl_eyebrow": "مصمَّم لقطر", "gl_h": "مبني على طريقة العمل هنا", "g1_h": "عربي أولاً", "g1_p": "واجهة من اليمين إلى اليسار وكتابة عربية من البداية، لا ترجمة لاحقة.", "g2_h": "أسبوع العمل المحلي", "g2_p": "جدولة من الأحد إلى الخميس، والجمعة والسبت أيام إغلاق.", "g3_h": "أرقام محلية", "g3_p": "صيغة جوال قطر، ويفهم الأرقام العربية الهندية.", "g4_h": "واضح وحذر", "g4_p": "يظهر دائماً كمساعد ذكاء اصطناعي، ويجمع فقط ما يحتاجه الحجز.", "rm_eyebrow": "أين نحن", "rm_h": "نموذج أولي يعمل، والطريق إلى ما بعده", "st_done": "تم", "st_next": "التالي", "st_then": "ثم", "r1_h": "نموذج أولي يعمل", "r1_p": "صفحة ثنائية اللغة ومحادثة حجز ولوحة لصاحب النشاط، كما ترى أعلاه.", "r2_h": "محادثة ذكاء اصطناعي حقيقية", "r2_p": "فهم حر للكلام بالعربية والإنجليزية، مع قاعدة بيانات وتنبيهات فورية لصاحب النشاط.", "r3_h": "تجربة تشغيلية في الدوحة", "r3_p": "الانطلاق مع مجموعة أولى من الأنشطة، والتعلّم من المحادثات الحقيقية وتحسين المنتج.", "faq_eyebrow": "أسئلة", "faq_h": "إجابات مباشرة", "q1": "هل يعرف العميل أنه يتحدث مع ذكاء اصطناعي؟", "q1a": "نعم. المحادثة موسومة بـ«مساعد ذكاء اصطناعي» ويذكر ذلك في أول رسالة.", "q2": "ماذا لو لم يعرف الإجابة؟", "q2a": "يقول ذلك ويعرض تحويل العميل إلى شخص. ولا يختلق أسعاراً ولا نصائح طبية أو قانونية أو مالية.", "q3": "هل يضمن زيادة المبيعات؟", "q3a": "لا. يرد أسرع ولا تفوته رسالة، وما تكسبه من ذلك يعتمد على نشاطك.", "q4": "أين يعمل؟", "q4a": "على موقعك، أو عبر رمز QR أو رابط. ويمكن إضافة قنوات أخرى لاحقاً.", "fin_h": "شاهده يعمل مع نشاطك أنت", "fin_p": "أخبرنا بخدماتك ومواعيد عملك، ونجهّز لك نسخة تجريبية.", "foot": "مجلس AI اسم عمل مؤقت. نموذج أولي قيد التطوير. النشاط المعروض خيالي."}
  };

  var SERVICES = [
    { id: 'check', en: 'Check-up', ar: 'فحص عام' },
    { id: 'clean', en: 'Cleaning', ar: 'تنظيف الأسنان' },
    { id: 'white', en: 'Whitening', ar: 'تبييض الأسنان' },
    { id: 'pain', en: 'Tooth pain', ar: 'ألم في الأسنان' }
  ];

  var A = {
    en: {
      hello: 'Hello! I am the clinic’s AI assistant. I can book your appointment. What do you need?',
      day: 'Which day suits you?', time: 'And what time?', name: 'Your name, please?',
      phone: 'Thanks, {n}. What is your mobile number? (Qatar numbers have 8 digits)',
      badphone: 'That number does not look right. Please send 8 digits (for example 5551 2345).',
      done: 'Booked, {n}: {s}, {d} at {t}. We will see you then. You can type "cancel" to cancel.',
      noday: 'Please pick one of the days shown.', notime: 'Please pick one of the free times shown.',
      noservice: 'Please choose one of the services shown.',
      hours: 'Opening hours: Sunday to Thursday, 09:00 to 17:00. Closed Friday and Saturday.',
      where: 'We are in Doha. The team will confirm the exact address when you book.',
      price: 'The team confirms prices after the visit. I do not want to give you a wrong number.',
      human: 'No problem. A person from the clinic will contact you. If you leave your name and number I will pass them on.',
      cancel: 'Your last booking has been cancelled.', nocancel: 'You have no active bookings to cancel.',
      again: 'Anything else? I can book another appointment.',
      anotherBtn: 'New booking', fallback: 'I can book appointments and answer on hours and location. What would you like?',
      none: 'No free slots left that day.'
    },
    ar: {
      hello: 'أهلاً! أنا المساعد الذكي للعيادة. أستطيع حجز موعدك. ماذا تحتاج؟',
      day: 'أي يوم يناسبك؟', time: 'وأي وقت؟', name: 'ما اسمك من فضلك؟',
      phone: 'شكراً {n}. ما رقم جوالك؟ (أرقام قطر من 8 خانات)',
      badphone: 'الرقم غير صحيح. أرسل 8 أرقام (مثال 5551 2345).',
      done: 'تم الحجز يا {n}: {s}، {d} الساعة {t}. بانتظارك. اكتب «إلغاء» إن أردت الإلغاء.',
      noday: 'اختر أحد الأيام المعروضة من فضلك.', notime: 'اختر أحد الأوقات المتاحة المعروضة.',
      noservice: 'اختر إحدى الخدمات المعروضة.',
      hours: 'ساعات العمل: من الأحد إلى الخميس، من 9:00 إلى 17:00. مغلق الجمعة والسبت.',
      where: 'نحن في الدوحة. سيؤكد لك الفريق العنوان الدقيق عند الحجز.',
      price: 'يؤكد الفريق الأسعار بعد الفحص. لا أريد أن أعطيك رقماً غير صحيح.',
      human: 'لا مشكلة. سيتواصل معك أحد أفراد العيادة. اترك اسمك ورقمك وسأحوّلهما.',
      cancel: 'تم إلغاء آخر حجز لك.', nocancel: 'ليس لديك حجوزات فعّالة للإلغاء.',
      again: 'هل تحتاج شيئاً آخر؟ أستطيع حجز موعد جديد.',
      anotherBtn: 'حجز جديد', fallback: 'أستطيع حجز المواعيد والإجابة عن المواعيد والموقع. كيف أساعدك؟',
      none: 'لا توجد أوقات متاحة في ذلك اليوم.'
    }
  };

  var KEY = 'majlis_demo_bookings_v1';
  var ui = 'en';
  var alang = 'en';
  var st = { step: 'service', service: null, day: null, time: null, name: null };

  var $ = function (id) { return document.getElementById(id); };
  var log = $('log'), chips = $('chips'), input = $('input');

  /* ---------- storage ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  var memory = load();
  function bookings() { return memory; }
  function setBookings(v) { memory = v; save(v); }

  /* ---------- helpers ---------- */
  function digits(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x6F0; });
  }
  function isArabic(s) { return /[؀-ۿ]/.test(s); }
  function loc() { return alang === 'ar' ? 'ar-QA-u-nu-latn' : 'en-GB'; }
  function fmtDay(iso) {
    var d = new Date(iso + 'T12:00:00');
    return new Intl.DateTimeFormat(loc(), { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  }
  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function openDays() {
    var out = [], d = new Date();
    d.setDate(d.getDate() + 1);
    while (out.length < 5) {
      var w = d.getDay();               // 5 = Friday, 6 = Saturday: closed
      if (w !== 5 && w !== 6) out.push(iso(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function freeTimes(day) {
    var taken = bookings().filter(function (b) { return b.day === day && b.status === 'ok'; }).map(function (b) { return b.time; });
    var out = [];
    for (var h = 9; h <= 16; h++) {
      var t = String(h).padStart(2, '0') + ':00';
      if (hash(day + t) % 4 === 0) continue;          // simulated pre-existing bookings
      if (taken.indexOf(t) === -1) out.push(t);
    }
    return out;
  }
  function svc(id) { return SERVICES.filter(function (s) { return s.id === id; })[0]; }
  function fill(s, o) { return s.replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }

  /* ---------- rendering ---------- */
  function say(text, who) {
    var m = document.createElement('div');
    m.className = 'msg ' + (who === 'me' ? 'me' : 'bot');
    m.textContent = text;
    m.dir = isArabic(text) ? 'rtl' : 'ltr';
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function setChips(list) {
    chips.innerHTML = '';
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = c.label;
      b.addEventListener('click', function () { handle(c.label, c.value); });
      chips.appendChild(b);
    });
  }
  function renderBookings() {
    var ul = $('bookings'); ul.innerHTML = '';
    var list = bookings().slice().reverse();
    $('count').textContent = bookings().filter(function (b) { return b.status === 'ok'; }).length;
    $('empty').style.display = list.length ? 'none' : '';
    list.forEach(function (b) {
      var s = svc(b.service);
      var li = document.createElement('li'); li.className = 'bk';
      var top = document.createElement('div'); top.className = 'bk-top';
      var n = document.createElement('strong'); n.textContent = b.name;
      var badge = document.createElement('span');
      badge.className = 'badge' + (b.status === 'ok' ? '' : ' off');
      badge.textContent = b.status === 'ok' ? (ui === 'ar' ? 'مؤكد' : 'Confirmed') : (ui === 'ar' ? 'ملغى' : 'Cancelled');
      top.appendChild(n); top.appendChild(badge);
      var sm = document.createElement('small');
      sm.textContent = (s ? s[ui] : b.service) + ' · ' + fmtDay(b.day) + ' · ' + b.time;
      var sm2 = document.createElement('small'); sm2.textContent = '+974 ' + b.phone;
      li.appendChild(top); li.appendChild(sm); li.appendChild(sm2);
      if (b.status === 'ok') {
        var cb = document.createElement('button'); cb.type = 'button';
        cb.textContent = ui === 'ar' ? 'إلغاء' : 'Cancel';
        cb.addEventListener('click', function () { cancelId(b.id); });
        li.appendChild(cb);
      }
      ul.appendChild(li);
    });
  }
  function cancelId(id) {
    setBookings(bookings().map(function (b) { return b.id === id ? Object.assign({}, b, { status: 'cancelled' }) : b; }));
    renderBookings();
  }

  /* ---------- conversation ---------- */
  function askService() {
    st.step = 'service';
    setChips(SERVICES.map(function (s) { return { label: s[alang], value: s.id }; }));
  }
  function askDay() {
    st.step = 'day';
    say(A[alang].day);
    setChips(openDays().map(function (d) { return { label: fmtDay(d), value: d }; }));
  }
  function askTime() {
    st.step = 'time';
    var ts = freeTimes(st.day);
    if (!ts.length) { say(A[alang].none); askDay(); return; }
    say(A[alang].time);
    setChips(ts.map(function (t) { return { label: t, value: t }; }));
  }
  function intent(t) {
    var s = t.toLowerCase();
    if (/cancel|الغ|إلغ/.test(s)) return 'cancel';
    if (/hour|open|when|time.*open|دوام|ساعات|مواعيد العمل|متى/.test(s) && !/book|احجز/.test(s)) return 'hours';
    if (/where|address|location|map|فين|وين|أين|اين|موقع|عنوان/.test(s)) return 'where';
    if (/price|cost|how much|fee|سعر|كم|تكلفة|بكم/.test(s)) return 'price';
    if (/human|person|someone|agent|call me|بشر|موظف|شخص|اتصل/.test(s)) return 'human';
    return null;
  }
  function handle(text, value) {
    text = String(text).trim();
    if (!text) return;
    if (!value && isArabic(text)) alang = 'ar';
    else if (!value && /[a-z]{3,}/i.test(text)) alang = 'en';
    say(text, 'me');
    var L = A[alang];

    var it = intent(text);
    if (st.step !== 'name' && st.step !== 'phone' && it) {
      if (it === 'cancel') {
        var last = bookings().slice().reverse().filter(function (b) { return b.status === 'ok'; })[0];
        if (last) { cancelId(last.id); say(L.cancel); } else say(L.nocancel);
      } else say(L[it]);
      return;
    }

    if (st.step === 'service') {
      var s = value ? svc(value) : SERVICES.filter(function (x) { return text.toLowerCase().indexOf(x.en.toLowerCase()) > -1 || text.indexOf(x.ar) > -1; })[0];
      if (!s) { say(L.noservice); return; }
      st.service = s.id; askDay();
    } else if (st.step === 'day') {
      var d = value || openDays().filter(function (x) { return fmtDay(x).toLowerCase() === text.toLowerCase(); })[0];
      if (!d) { say(L.noday); return; }
      st.day = d; askTime();
    } else if (st.step === 'time') {
      var m = digits(text).match(/(\d{1,2})(?::?(\d{2}))?/);
      var t = value || (m ? String(m[1]).padStart(2, '0') + ':00' : null);
      if (!t || freeTimes(st.day).indexOf(t) === -1) { say(L.notime); return; }
      st.time = t; st.step = 'name'; say(L.name); setChips([]);
    } else if (st.step === 'name') {
      if (text.length < 2 || text.length > 60 || /\d/.test(digits(text))) { say(L.name); return; }
      st.name = text; st.step = 'phone'; say(fill(L.phone, { n: st.name }));
    } else if (st.step === 'phone') {
      var p = digits(text).replace(/\D/g, '').replace(/^974/, '');
      if (p.length !== 8) { say(L.badphone); return; }
      var rec = { id: 'b' + Date.now(), service: st.service, day: st.day, time: st.time, name: st.name, phone: p.slice(0, 4) + ' ' + p.slice(4), status: 'ok' };
      setBookings(bookings().concat([rec]));
      renderBookings();
      say(fill(L.done, { n: st.name, s: svc(st.service)[alang], d: fmtDay(st.day), t: st.time }));
      st.step = 'done';
      setChips([{ label: L.anotherBtn, value: 'again' }]);
    } else if (st.step === 'done') {
      st = { step: 'service', service: null, day: null, time: null, name: null };
      say(L.again); askService();
    }
  }

  function restart() {
    log.innerHTML = ''; st = { step: 'service', service: null, day: null, time: null, name: null };
    alang = ui; say(A[alang].hello); askService();
  }

  /* ---------- language ---------- */
  function applyUI() {
    var html = document.documentElement;
    html.lang = ui; html.dir = ui === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T[ui][el.getAttribute('data-i18n')]; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = T[ui][el.getAttribute('data-i18n-ph')]; });
    $('langBtn').textContent = ui === 'ar' ? 'English' : 'العربية';
    document.title = ui === 'ar' ? 'مجلس AI · مساعد الحجوزات' : 'Majlis AI · Bilingual booking agent';
    renderBookings();
  }

  /* ---------- events ---------- */
  $('form').addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; handle(v); });
  $('resetBtn').addEventListener('click', restart);
  $('langBtn').addEventListener('click', function () { ui = ui === 'ar' ? 'en' : 'ar'; applyUI(); restart(); });

  applyUI(); restart();
})();
