/* Panel del dueño · textos EN/AR. Las claves dudosas en árabe llevan AR-REVIEW. */
(() => {
  "use strict";
  const L = {
    en: {
      brandSub: "Owner panel · Demo", logout: "Sign out", exitDemo: "Exit demo",
      loginTitle: "Sign in", loginLead: "Bookings and call-back requests from Leo, the AI assistant.",
      email: "Email", password: "Password", signIn: "Sign in",
      tryDemo: "Try the demo", demoHint: "Sample data only. Nothing is saved or sent.",
      demoBanner: "DEMO · sample data, nothing is saved or sent",
      loginBad: "Wrong email or password.", noAccess: "This account has no access to this panel.",
      tabsAria: "Panel sections",
      tabOverview: "Overview", tabCalendar: "Calendar", tabWorkshop: "Workshop",
      tabBookings: "Bookings", tabCustomers: "Customers", tabLeads: "Leads without booking",
      refresh: "Refresh", updated: (t) => "Updated " + t,
      fDay: "Day", fUpcoming: "Upcoming", fOneDay: "One day", fAll: "All", fDate: "Date",
      fStatus: "Status", sAll: "All", export: "Export CSV",
      s_confirmed: "Confirmed", s_done: "Attended", s_cancelled: "Cancelled",
      l_new: "New", l_contacted: "Contacted", l_closed: "Closed",
      emptyBookings: "No bookings for these filters.", emptyLeads: "No leads for this filter.",
      markDone: "Mark attended", cancel: "Cancel", cancelSure: "Tap again to cancel",
      move: "Move", moveDate: "New day", moveNone: "No free slots that day.", moveClose: "Close",
      busy: "taken", taken: "That slot is already taken. Pick another.", moved: "Booking moved.",
      markContacted: "Mark contacted", markClosed: "Close", reopen: "Reopen",
      handoff: "Wants a person", pref: "Preferred",
      saveErr: "Couldn't save. Please try again.", loadErr: "Couldn't load data.",
      foot: "Demo · fictitious business · times in Doha (UTC+3)",
      langLabel: "العربية", langAria: "التبديل إلى العربية", langCode: "ar",
      csv: ["Date", "Time", "Service", "Name", "Mobile", "Status"],

      /* resumen */
      kToday: "Bookings today", kWeek: "Bookings this week", kInShop: "Vehicles in the workshop",
      kOcc: "Calendar occupancy this week", kLeads: "New leads", kCancel: "Cancellation rate",
      kCancelHint: "Last 30 days", kOccChart: "Occupancy by day (this week)",
      kRevenue: "Revenue this month", kMrr: "Recurring revenue (MRR)", kPlans: (n) => n + " active maintenance plans",
      sample: "Sample figures", closedDay: "Closed",
      kRevHint: "Attended bookings × service price",

      /* calendario */
      calWeek: "Week", calDay: "Day", calPrev: "Previous", calNext: "Next", calToday: "Today",
      calDragHint: "Drag a booking to move it. On touch screens, open it and use “Move”.",
      calFree: "Free", calBusyDrop: "That slot is taken", calMoved: (t) => "Moved to " + t,

      /* taller */
      w_received: "Received", w_diagnosing: "Diagnosing", w_parts: "Waiting for parts",
      w_in_progress: "In progress", w_ready: "Ready", w_delivered: "Delivered",
      wNext: "Next step", wEmpty: "No vehicles", wSince: (t) => "since " + t,
      wHint: "Today's vehicles. Changing a status leaves a line in the history and prepares a message for the customer.",

      /* ficha */
      cardTitle: "Work order", cardCustomer: "Customer", cardMobile: "Mobile", cardService: "Service",
      cardWhen: "Appointment", cardVehicle: "Vehicle (model, colour, year)", cardVehicleHint: "Free text. No licence plate.",
      cardNotes: "Workshop notes", cardSave: "Save", cardSaved: "Saved",
      cardStatus: "Vehicle status", cardNoStatus: "Not checked in yet", cardCheckIn: "Check in vehicle",
      cardHistory: "Status history", cardNoHistory: "No changes yet.",
      cardPrint: "Print / PDF", cardClose: "Close", cardBooking: "Booking",
      notifyTitle: "Message for the customer", notifyNote: "Demo: preview only. Nothing is sent.",
      notifyCopy: "Copy text", notifyCopied: "Copied",
      notify: {
        received: (n, v) => `Hello ${n}, this is Example Garage. We have received your ${v}. We will update you after the first check.`,
        diagnosing: (n, v) => `Hello ${n}, our technicians are now diagnosing your ${v}. We will send you the findings and a written quote before any work.`,
        parts: (n, v) => `Hello ${n}, we are waiting for parts for your ${v}. We will let you know as soon as they arrive.`,
        in_progress: (n, v) => `Hello ${n}, work on your ${v} has started as agreed in your quote.`,
        ready: (n, v) => `Hello ${n}, your ${v} is ready for collection. We are open Sunday to Thursday, 08:00–18:00.`,
        delivered: (n, v) => `Hello ${n}, thank you for visiting Example Garage. We hope everything is fine with your ${v}.`,
      },
      printFoot: "Example Garage · fictitious demo workshop · Doha",

      /* clientes */
      cuVisits: (n) => n === 1 ? "1 visit" : n + " visits", cuLast: "Last visit", cuNext: "Next recommended service",
      cuNextRule: (km, d) => `Service at ${km} km or by ${d}, whichever comes first`,
      cuExample: "Example rule", cuPlan: (q) => "Maintenance plan · " + q + " QAR/month",
      cuRemind: "Send reminder", cuReminded: (t) => "Reminder simulated at " + t,
      cuRemindMsg: (n, d) => `Hello ${n}, your next service at Example Garage is recommended by ${d}. Reply to book a time that suits you.`,
      cuEmpty: "No customers yet.", cuKm: (k) => k + " km",
    },
    ar: {
      brandSub: "لوحة صاحب الورشة · تجريبي", logout: "تسجيل الخروج", exitDemo: "الخروج من العرض التجريبي",
      loginTitle: "تسجيل الدخول", loginLead: "الحجوزات وطلبات الاتصال من ليو، المساعد الذكي.",
      email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "دخول",
      tryDemo: "جرّب العرض التجريبي", demoHint: "بيانات نموذجية فقط. لا يُحفظ أو يُرسل أي شيء.", // AR-REVIEW
      demoBanner: "عرض تجريبي · بيانات نموذجية، لا يُحفظ أو يُرسل أي شيء", // AR-REVIEW
      loginBad: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", noAccess: "هذا الحساب لا يملك صلاحية الدخول إلى هذه اللوحة.",
      tabsAria: "أقسام اللوحة",
      tabOverview: "نظرة عامة", tabCalendar: "التقويم", tabWorkshop: "الورشة",
      tabBookings: "الحجوزات", tabCustomers: "العملاء", tabLeads: "طلبات بلا حجز",
      refresh: "تحديث", updated: (t) => "آخر تحديث " + t,
      fDay: "اليوم", fUpcoming: "القادمة", fOneDay: "يوم محدد", fAll: "الكل", fDate: "التاريخ",
      fStatus: "الحالة", sAll: "الكل", export: "تصدير CSV",
      s_confirmed: "مؤكد", s_done: "تمت الخدمة", s_cancelled: "ملغى", // AR-REVIEW
      l_new: "جديد", l_contacted: "تم التواصل", l_closed: "مغلق",
      emptyBookings: "لا توجد حجوزات لهذه الفلاتر.", emptyLeads: "لا توجد طلبات لهذا الفلتر.",
      markDone: "تمت الخدمة", cancel: "إلغاء", cancelSure: "اضغط مرة أخرى للإلغاء",
      move: "نقل", moveDate: "اليوم الجديد", moveNone: "لا توجد مواعيد متاحة في هذا اليوم.", moveClose: "إغلاق",
      busy: "محجوز", taken: "هذا الموعد محجوز بالفعل. اختر موعداً آخر.", moved: "تم نقل الحجز.",
      markContacted: "تم التواصل", markClosed: "إغلاق", reopen: "إعادة فتح",
      handoff: "يريد التحدث مع موظف", pref: "المفضّل",
      saveErr: "تعذّر الحفظ. حاول مرة أخرى.", loadErr: "تعذّر تحميل البيانات.",
      foot: "تجريبي · نشاط تجاري وهمي · الأوقات بتوقيت الدوحة (UTC+3)",
      langLabel: "English", langAria: "Switch to English", langCode: "en",
      csv: ["التاريخ", "الساعة", "الخدمة", "الاسم", "الجوال", "الحالة"],

      kToday: "حجوزات اليوم", kWeek: "حجوزات هذا الأسبوع", kInShop: "سيارات في الورشة",
      kOcc: "نسبة إشغال الجدول هذا الأسبوع", kLeads: "طلبات جديدة", kCancel: "نسبة الإلغاء", // AR-REVIEW
      kCancelHint: "آخر 30 يوماً", kOccChart: "الإشغال حسب اليوم (هذا الأسبوع)",
      kRevenue: "إيرادات هذا الشهر", kMrr: "الإيرادات المتكررة (MRR)", kPlans: (n) => n + " خطط صيانة نشطة", // AR-REVIEW
      sample: "أرقام نموذجية", closedDay: "مغلق",
      kRevHint: "الحجوزات المنجزة × سعر الخدمة",

      calWeek: "أسبوع", calDay: "يوم", calPrev: "السابق", calNext: "التالي", calToday: "اليوم",
      calDragHint: "اسحب الحجز لنقله. على الشاشات اللمسية، افتحه واستخدم «نقل».",
      calFree: "متاح", calBusyDrop: "هذا الموعد محجوز", calMoved: (t) => "نُقل إلى " + t,

      w_received: "تم الاستلام", w_diagnosing: "قيد التشخيص", w_parts: "بانتظار القطع",
      w_in_progress: "قيد العمل", w_ready: "جاهزة", w_delivered: "تم التسليم", // AR-REVIEW
      wNext: "الخطوة التالية", wEmpty: "لا توجد سيارات", wSince: (t) => "منذ " + t,
      wHint: "سيارات اليوم. تغيير الحالة يضيف سطراً في السجل ويجهّز رسالة للعميل.",

      cardTitle: "أمر العمل", cardCustomer: "العميل", cardMobile: "الجوال", cardService: "الخدمة",
      cardWhen: "الموعد", cardVehicle: "السيارة (الطراز، اللون، السنة)", cardVehicleHint: "نص حر. بدون رقم اللوحة.",
      cardNotes: "ملاحظات الورشة", cardSave: "حفظ", cardSaved: "تم الحفظ",
      cardStatus: "حالة السيارة", cardNoStatus: "لم تُستلم بعد", cardCheckIn: "استلام السيارة",
      cardHistory: "سجل الحالات", cardNoHistory: "لا توجد تغييرات بعد.",
      cardPrint: "طباعة / PDF", cardClose: "إغلاق", cardBooking: "الحجز",
      notifyTitle: "رسالة للعميل", notifyNote: "تجريبي: معاينة فقط. لا يُرسل أي شيء.",
      notifyCopy: "نسخ النص", notifyCopied: "تم النسخ",
      notify: { // AR-REVIEW
        received: (n, v) => `مرحباً ${n}، معك Example Garage. استلمنا سيارتك (${v}). سنوافيك بالمستجدات بعد الفحص الأول.`,
        diagnosing: (n, v) => `مرحباً ${n}، يقوم فنيونا الآن بتشخيص سيارتك (${v}). سنرسل لك النتائج وعرض سعر مكتوباً قبل أي عمل.`,
        parts: (n, v) => `مرحباً ${n}، نحن بانتظار قطع الغيار لسيارتك (${v}). سنخبرك فور وصولها.`,
        in_progress: (n, v) => `مرحباً ${n}، بدأ العمل على سيارتك (${v}) كما هو متفق عليه في عرض السعر.`,
        ready: (n, v) => `مرحباً ${n}، سيارتك (${v}) جاهزة للاستلام. نعمل من الأحد إلى الخميس، 08:00–18:00.`,
        delivered: (n, v) => `مرحباً ${n}، شكراً لزيارتك Example Garage. نتمنى أن تكون سيارتك (${v}) بأفضل حال.`,
      },
      printFoot: "Example Garage · ورشة تجريبية وهمية · الدوحة",

      cuVisits: (n) => n === 1 ? "زيارة واحدة" : n + " زيارات", cuLast: "آخر زيارة", cuNext: "الخدمة التالية الموصى بها",
      cuNextRule: (km, d) => `صيانة عند ${km} كم أو قبل ${d}، أيهما أسبق`, // AR-REVIEW
      cuExample: "قاعدة مثال", cuPlan: (q) => "خطة صيانة · " + q + " ر.ق/شهرياً",
      cuRemind: "إرسال تذكير", cuReminded: (t) => "تمت محاكاة التذكير الساعة " + t,
      cuRemindMsg: (n, d) => `مرحباً ${n}، نوصي بموعد صيانتك القادم في Example Garage قبل ${d}. رُدّ لحجز الوقت المناسب لك.`,
      cuEmpty: "لا يوجد عملاء بعد.", cuKm: (k) => k + " كم",
    },
  };
  let lang = document.documentElement.lang === "ar" ? "ar" : "en";
  window.MPI = {
    get lang() { return lang; },
    set lang(v) { lang = v === "ar" ? "ar" : "en"; },
    T: () => L[lang],
    /* Textos en un idioma concreto (p. ej. el del cliente, no el del panel). */
    Tde: (lg) => L[lg === "ar" ? "ar" : "en"],
    loc: () => (lang === "ar" ? "ar-QA-u-nu-latn" : "en-GB"),
  };
})();
