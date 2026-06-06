(function () {
  const LEAD_ATTR_KEY = "pearlsLeadAttribution";

  const config = {
    whatsappPhone: "201000000000",
    callPhone: "201000000000",
    mobileStickyEnabled: false,
    formio: {
      endpoint: "https://script.google.com/macros/s/AKfycbz3hDzps2Uf8jmzv1KHNgvi7fxyrrQFi0MH0FqfQAigrla6MLiCj9WeYNoAJBVJtxu9XA/exec",
      popupEndpoint: "",
      bottomEndpoint: "",
      contactEndpoint: ""
    }
  };

  const LANG_KEY = "siteLang";
  const ORIGINALS = new Map();
  const originalDoc = {
    title: document.title,
    htmlLang: document.documentElement.lang || "en",
    dir: document.documentElement.dir || "ltr"
  };

  function getPageKey() {
    let name = window.location.pathname.split("/").pop() || "index.html";
    if (!name || name === "/") name = "index.html";
    if (!name.includes(".")) {
      name = name === "index" ? "index.html" : name + ".html";
    }
    return name.replace(/\.html$/i, "");
  }

  function getCurrentLang() {
    return document.documentElement.lang === "ar" ? "ar" : "en";
  }

  function readAttribution() {
    try {
      const raw = localStorage.getItem(LEAD_ATTR_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function writeAttribution(data) {
    try {
      localStorage.setItem(LEAD_ATTR_KEY, JSON.stringify(data));
    } catch (_) {
      // Ignore storage failures and continue without persistence.
    }
  }

  function initLeadAttribution() {
    const pageKey = getPageKey();
    const params = new URLSearchParams(window.location.search);
    const currentGclid = params.get("gclid") || "";
    const existing = readAttribution();

    const attribution = {
      sessionId: existing.sessionId || ("session-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)),
      firstTouchTime: existing.firstTouchTime || new Date().toISOString(),
      firstTouchPage: existing.firstTouchPage || pageKey,
      gclid: existing.gclid || currentGclid || ""
    };

    writeAttribution(attribution);
    return attribution;
  }

  function getLeadAttribution() {
    const data = readAttribution();
    if (!data.sessionId || !data.firstTouchTime || !data.firstTouchPage) {
      return initLeadAttribution();
    }
    return data;
  }

  function rememberElement(el) {
    if (!el || ORIGINALS.has(el)) return;
    ORIGINALS.set(el, {
      html: el.innerHTML,
      attrs: {
        placeholder: el.getAttribute("placeholder"),
        "aria-label": el.getAttribute("aria-label"),
        content: el.getAttribute("content")
      }
    });
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    rememberElement(el);
    el.textContent = value;
  }

  function setHtml(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    rememberElement(el);
    el.innerHTML = value;
  }

  function setAllText(selector, valueOrArray) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    els.forEach(function (el, index) {
      rememberElement(el);
      if (Array.isArray(valueOrArray)) {
        if (typeof valueOrArray[index] === "string") {
          el.textContent = valueOrArray[index];
        }
      } else {
        el.textContent = valueOrArray;
      }
    });
  }

  function setAttr(selector, attr, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    rememberElement(el);
    el.setAttribute(attr, value);
  }

  function restoreEnglish() {
    ORIGINALS.forEach(function (saved, el) {
      if (!document.contains(el)) return;
      el.innerHTML = saved.html;
      Object.keys(saved.attrs).forEach(function (attrName) {
        const attrValue = saved.attrs[attrName];
        if (attrValue === null || typeof attrValue === "undefined") {
          el.removeAttribute(attrName);
        } else {
          el.setAttribute(attrName, attrValue);
        }
      });
    });

    document.title = originalDoc.title;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }

  function applyCommonArabic() {
    setAllText(".main-nav a[href='index.html']", "الرئيسية");
    setAllText(".main-nav a[href='contact.html']", "تواصل معنا");
    setAllText(".main-nav a[href='privacy.html']", "الخصوصية");
    setAllText(".main-nav a[href='disclaimer.html']", "إخلاء المسؤولية");
    setAllText(".main-nav a[href='hyde-park-compounds.html']", "هايد بارك");
    setAllText(".main-nav a[href='palm-hills-compounds.html']", "بالم هيلز");

    setAllText(".footer-links a[href='privacy.html']", "سياسة الخصوصية");
    setAllText(".footer-links a[href='disclaimer.html']", "إخلاء المسؤولية");
    setAllText(".footer-links a[href='contact.html']", "تواصل معنا");
    setAllText(".footer-links a[href='index.html']", "الرئيسية");

    document.querySelectorAll(".badge-down").forEach(function (el) {
      rememberElement(el);
      el.innerHTML = el.innerHTML.replace("Down Payment: From", "مقدم: من");
    });
    document.querySelectorAll(".badge-install").forEach(function (el) {
      rememberElement(el);
      el.innerHTML = el.innerHTML.replace("Installments: Up to", "تقسيط حتى");
    });
    document.querySelectorAll(".price-pill").forEach(function (el) {
      rememberElement(el);
      el.innerHTML = el.innerHTML.replace("Prices start from:", "الأسعار تبدأ من:");
    });

    document.querySelectorAll(".whatsapp-action span").forEach(function (el) {
      rememberElement(el);
      el.textContent = "المزيد من التفاصيل";
    });
    document.querySelectorAll("[data-open-form]").forEach(function (el) {
      rememberElement(el);
      el.textContent = "احصل على الأسعار";
    });

    setAllText(".project-grid + .form-hint", "*الأسعار وأنظمة السداد استرشادية وقابلة للتغيير حسب التوافر ونوع الوحدة وشروط المطور الرسمية.");

    if (document.querySelector(".cookie-banner p")) {
      setHtml(".cookie-banner p", "يستخدم هذا الموقع ملفات تعريف الارتباط وأدوات التتبع لتحسين الأداء وتحليل الحملات. اقرأ <a href='privacy.html'>سياسة الخصوصية</a> و <a href='disclaimer.html'>إخلاء المسؤولية</a>.");
      setText(".cookie-banner .js-cookie-close", "إغلاق");
    }

    if (document.querySelector(".mobile-sticky-btn.call span")) {
      setText(".mobile-sticky-btn.call span", "اتصال");
      setText(".mobile-sticky-btn.whatsapp span", "واتساب");
    }
  }

  function applyArabicByPage() {
    const page = getPageKey();
    applyCommonArabic();

    if (page === "index") {
      document.title = "Pearls Real Estate | الرئيسية";
      setText(".main-nav a[href='#projects']", "المشروعات");
      setText(".hero h1", "فرص عقارية مميزة في مصر");
      setText(".hero p", "استكشف أفضل المجتمعات السكنية مع أنظمة سداد مرنة ودعم مباشر من Pearls Real Estate.");
      setText(".hero .btn-primary", "استعرض المشروعات");
      setText("#projects .section-title", "المشروعات المميزة");
      setText(".grid.grid-3 article:nth-of-type(1) .card-body p", "وحدات جاهزة للسكن في قلب القاهرة الجديدة مع لاندسكيب مميز وقيمة طويلة الأجل.");
      setText(".grid.grid-3 article:nth-of-type(2) .card-body p", "فرص إطلاق قوية في New Cairo و New Capital مع أسعار مبكرة وأنظمة سداد مرنة.");
      setText(".grid.grid-3 article:nth-of-type(3) .card-body p", "مشروعات PX و Badya في غرب القاهرة بماستر بلان متكامل وخيارات تقسيط ممتدة.");
      setText(".grid.grid-3 article:nth-of-type(4) .card-body p", "امتلك في Palm Hills North Coast من Hacienda Waters حتى Ras El Hekma بتجربة صيفية راقية.");
      setAllText(".grid.grid-3 .btn.btn-primary", "تفاصيل المشروع");
    }

    if (page === "hyde-park-compounds") {
      document.title = "Pearls Real Estate - Hyde Park Compounds";
      setText(".main-nav a[href='#overview']", "نظرة عامة");
      setText(".main-nav a[href='#available-projects']", "المشروعات المتاحة");
      setText(".main-nav a[href='#developer']", "عن المطور");
      setText(".main-nav a[href='#gallery']", "المعرض");
      setText(".main-nav a[href='#contact-form']", "سجل الآن");
      setText(".hero h1", "Hyde Park Compounds");
      setText(".hero p:nth-of-type(1)", "يبدأ المقدم من 5% مع تقسيط حتى 10 سنوات.");
      setText(".hero p:nth-of-type(2)", "وحدات كاملة التشطيب متاحة.");
      setText("#overview .section-title", "اكتشف عالم هايد بارك من المجتمعات المتكاملة");
      setText("#overview p", "تطور هايد بارك مجتمعات نابضة بالحياة في أهم الوجهات المصرية، حيث تلتقي الطبيعة والتصميم والخدمات في تجربة متكاملة تعكس مفهومًا جديدًا للعيش والاستثمار.");
      setText("#available-projects .section-title", "المشروعات المتاحة");
      setText("#developer .section-title", "عن المطور");
      setText("#gallery .section-title", "معرض المشروع");
      setText("#contact-form .section-title", "سجل اهتمامك الآن");
      setText("#card-hyde-new-cairo .project-feature", "وحدات كاملة التشطيب مع خيارات استلام فوري في مراحل مختارة.");
      setText("#card-hyde-central .project-feature", "إطلاق جديد في امتداد مميز بالقاهرة الجديدة مع مرونة في أنظمة السداد.");
      setText("#card-seashore .project-feature", "جميع الوحدات كاملة التشطيب مع فرص تسليم مبكر.");
      setText("#card-hyde-october .project-feature", "وحدات كاملة التشطيب متاحة، بما يشمل وحدات استلام فوري.");
      setText("#developer .developer-kpi:nth-of-type(1) strong", "متميز");
      setText("#developer .developer-kpi:nth-of-type(1) span", "مجتمعات مخططة بعناية في مواقع استراتيجية");
      setText("#developer .developer-kpi:nth-of-type(2) strong", "مرن");
      setText("#developer .developer-kpi:nth-of-type(2) span", "خطط سداد مناسبة لمختلف شرائح المشترين");
      setText("#developer .developer-kpi:nth-of-type(3) strong", "طلب قوي");
      setText("#developer .developer-kpi:nth-of-type(3) span", "معدلات إقبال مرتفعة في المواقع الحيوية");
      setText("#developer .developer-card h3", "نبذة عن Hyde Park Developments");
      setText("#developer .developer-points li:nth-of-type(1) span", "انطلقت في 2007 وتعمل بهويتها الحالية منذ 2011.");
      setText("#developer .developer-points li:nth-of-type(2) span", "مشروعات مميزة في New Cairo و 6th Settlement و October و Ras El Hekma.");
      setText("#developer .developer-points li:nth-of-type(3) span", "تطوير مجتمعات سكنية وتجارية وترفيهية بقيمة طويلة الأجل.");
      setText("#developer .developer-trust", "مطور مؤسسي بخبرة قوية في التخطيط العمراني المتميز.");
      setText("label[for='bottom-name']", "الاسم الكامل *");
      setText("label[for='bottom-phone']", "رقم الهاتف *");
      setText("label[for='bottom-project']", "المشروع *");
      setText("label[for='bottom-email']", "البريد الإلكتروني");
      setText("#bottom-project option:first-of-type", "اختر المشروع");
      setText("#contact-form button[type='submit']", "إرسال");
      setText(".modal-panel h3", "اترك بياناتك للحصول على الأسعار وأنظمة السداد");
      setText("label[for='popup-name']", "الاسم الكامل *");
      setText("label[for='popup-phone']", "رقم الهاتف *");
      setText("label[for='popup-email']", "البريد الإلكتروني");
      setText("label[for='popup-project']", "المشروع");
      setText("label[for='popup-message']", "رسالة (اختياري)");
      setAttr("#popup-message", "placeholder", "اكتب ميزانيتك أو المنطقة أو نوع الوحدة المفضل.");
      setText(".modal-panel button[type='submit']", "إرسال الطلب");
    }

    if (page === "palm-hills-compounds" || page === "palm-hills-west-compounds" || page === "palm-hills-sahel-compounds") {
      setText(".main-nav a[href='#overview']", "نظرة عامة");
      setText(".main-nav a[href='#available-projects']", "المشروعات المتاحة");
      setText(".main-nav a[href='#developer']", "عن المطور");
      setText(".main-nav a[href='#gallery']", "المعرض");
      setText(".main-nav a[href='#contact-form']", "سجل الآن");
      setText("#available-projects .section-title", "المشروعات المتاحة");
      setText("#developer .section-title", "عن المطور");
      setText("#gallery .section-title", "معرض المشروع");
      setText("#contact-form .section-title", "سجل اهتمامك الآن");
      setText("#developer .developer-kpi:nth-of-type(1) strong", "متميز");
      setText("#developer .developer-kpi:nth-of-type(1) span", "مجتمعات كبيرة في المدن الأعلى نموًا بمصر");
      setText("#developer .developer-kpi:nth-of-type(2) strong", "مرن");
      setText("#developer .developer-kpi:nth-of-type(2) span", "خطط سداد مناسبة للمشتري الفعلي والمستثمر");
      setText("#developer .developer-kpi:nth-of-type(3) strong", "موثوق");
      setText("#developer .developer-kpi:nth-of-type(3) span", "أكثر من 35 مشروعًا بمعدلات طلب قوية");
      setText("#developer .developer-card h3", "نبذة عن Palm Hills Developments");
      setText("#developer .developer-points li:nth-of-type(1) span", "مطور مصري مُدرج بالبورصة بمحفظة تتجاوز 35 مشروعًا.");
      setText("#developer .developer-points li:nth-of-type(2) span", "تأسست في 1997 وتعمل بهويتها الحالية منذ 2005 بقيادة Yasseen Mansour.");
      setText("#developer .developer-points li:nth-of-type(3) span", "محفظة تطوير تتجاوز 34.6 مليون متر مربع بين السكني والتجاري والساحلي.");
      setText("#developer .developer-trust", "مطور موثوق يجمع بين الحجم وخبرة التسليم وقيمة استثمارية طويلة الأجل.");
      setText("label[for='bottom-name']", "الاسم الكامل *");
      setText("label[for='bottom-phone']", "رقم الهاتف *");
      setText("label[for='bottom-project']", "المشروع *");
      setText("label[for='bottom-email']", "البريد الإلكتروني");
      setText("#bottom-project option:first-of-type", "اختر المشروع");
      setText("#contact-form button[type='submit']", "إرسال");
      setText(".modal-panel h3", "اترك بياناتك للحصول على الأسعار وأنظمة السداد");
      setText("label[for='popup-name']", "الاسم الكامل *");
      setText("label[for='popup-phone']", "رقم الهاتف *");
      setText("label[for='popup-email']", "البريد الإلكتروني");
      setText("label[for='popup-project']", "المشروع");
      setText("label[for='popup-message']", "رسالة (اختياري)");
      setAttr("#popup-message", "placeholder", "اكتب ميزانيتك أو المنطقة أو نوع الوحدة المفضل.");
      setText(".modal-panel button[type='submit']", "إرسال الطلب");
    }

    if (page === "palm-hills-compounds") {
      document.title = "Pearls Real Estate - Palm Hills East Compounds";
      setText(".hero h1", "Palm Hills East Compounds");
      setText(".hero p:nth-of-type(1)", "يبدأ المقدم من 1.5% مع تقسيط حتى 12 سنة.");
      setText("#overview .section-title", "بالم هيلز... وجهات متكاملة للحياة والاستثمار");
      setText("#overview p", "استكشف مجموعة من أبرز مشاريع بالم هيلز في شرق وغرب القاهرة والساحل الشمالي، حيث تلتقي المواقع الاستراتيجية بالتصميمات الراقية والخدمات المتكاملة لتقديم قيمة حقيقية للسكن والاستثمار.");
      setText("#card-new-cairo .project-feature", "وحدات كاملة التشطيب متاحة مع خيارات استلام فوري في مراحل مختارة.");
      setText("#card-village-capitale .project-feature", "إطلاق جديد مع خطط سداد مرنة وفرص نمو قوية داخل New Capital.");
    }

    if (page === "palm-hills-west-compounds") {
      document.title = "Pearls Real Estate - Palm Hills West Compounds";
      setText(".hero h1", "Palm Hills West Compounds");
      setText(".hero p:nth-of-type(1)", "مقدم يبدأ من 1.5% فقط, وقسط يصل الى 12 سنه");
      setText("#overview .section-title", "بالم هيلز... وجهات متكاملة للحياة والاستثمار");
      setText("#overview p", "استكشف مجموعة من أبرز مشاريع بالم هيلز في شرق وغرب القاهرة والساحل الشمالي، حيث تلتقي المواقع الاستراتيجية بالتصميمات الراقية والخدمات المتكاملة لتقديم قيمة حقيقية للسكن والاستثمار.");
      setText("#card-px .project-feature", "وحدات كاملة التشطيب مع فرص تسليم مبكر في مراحل مختارة.");
      setText("#card-badya .project-feature", "وحدات كاملة التشطيب مع خطط سداد مرنة وخيارات استلام فوري.");
    }

    if (page === "palm-hills-sahel-compounds") {
      document.title = "Pearls Real Estate - Palm Hills North Coast Compounds";
      setText(".hero h1", "Palm Hills North Coast Compounds");
      setText(".hero p:nth-of-type(1)", "مقدم يبدأ من 2.5% فقط, قسط يصل الى 12 سنه");
      setText(".hero p:nth-of-type(2)", "وحدات كامله التشطيب, وحدات مطله على البحر");
      setText("#overview .section-title", "بالم هيلز... وجهات متكاملة للحياة والاستثمار");
      setText("#overview p", "استكشف مجموعة من أبرز مشاريع بالم هيلز في شرق وغرب القاهرة والساحل الشمالي، حيث تلتقي المواقع الاستراتيجية بالتصميمات الراقية والخدمات المتكاملة لتقديم قيمة حقيقية للسكن والاستثمار.");
      setText("#card-hacienda-raselhekma .badge-row:first-of-type .badge", "إطلاق جديد");
      setText("#card-hacienda-waters .project-feature", "خطط سداد مرنة مع وحدات كاملة التشطيب.");
      setText("#card-hacienda-blue .project-feature", "منازل ساحلية كاملة التشطيب مع خطط سداد مرنة.");
      setText("#card-hacienda-west .project-feature", "خيارات استلام فوري ووحدات كاملة التشطيب في عنوان ساحلي مميز.");
      setText("#card-hacienda-raselhekma .project-feature", "إطلاق جديد بتشطيبات كاملة وتكييفات ومطابخ، مع شاطئ خاص بطول 4.8 كيلومتر، وإطلالات مائية لمعظم الوحدات.");
    }

    if (page === "privacy") {
      document.title = "سياسة الخصوصية - Pearls Real Estate";
      setText("main h1", "سياسة الخصوصية");
      setText("main p:nth-of-type(1)", "توضح سياسة الخصوصية هذه كيفية جمع واستخدام Pearls Real Estate للبيانات الشخصية المقدمة عبر هذا الموقع ونماذج الحملات.");
      setAllText("main h3", ["البيانات التي نجمعها", "كيف نستخدم بياناتك", "التتبع والتحليلات", "مشاركة البيانات", "دقة البيانات والتحديثات", "حقوقك", "التواصل"]);
      setText("main p:nth-of-type(2)", "قد نجمع الاسم ورقم الهاتف والبريد الإلكتروني والمشروع المختار وتفاصيل الاستفسار عند إرسال النماذج أو التواصل معنا.");
      setText("main p:nth-of-type(3)", "تُستخدم بياناتك للرد على الاستفسار ومشاركة الأسعار وأنظمة السداد المطلوبة وتقديم تحديثات المشروعات ذات الصلة. نحن لا نبيع بياناتك الشخصية.");
      setText("main p:nth-of-type(4)", "نستخدم ملفات تعريف الارتباط وأدوات القياس لفهم أداء الموقع وتحسين جودة العملاء المحتملين. وقد تشمل بيانات التتبع زيارات الصفحات ونقرات الأزرار وأحداث النماذج.");
      setText("main p:nth-of-type(5)", "قد نشارك بيانات الاستفسار مع فرق المبيعات المعتمدة وشركاء المشروعات عند الحاجة فقط لتقديم المعلومات والمتابعة.");
      setText("main p:nth-of-type(6)", "تفاصيل المشروع والأسعار وخيارات السداد والتوافر قابلة للتغيير. الشروط النهائية تعتمد دائمًا على وثائق المطور الرسمية وعقود الحجز.");
      setText("main p:nth-of-type(7)", "يمكنك طلب تصحيح أو حذف بياناتك عبر صفحة التواصل.");
      setText("main p:nth-of-type(8)", "لطلبات الخصوصية، يرجى استخدام نموذج التواصل في صفحة التواصل.");
    }

    if (page === "disclaimer") {
      document.title = "إخلاء المسؤولية - Pearls Real Estate";
      setText("main h1", "إخلاء المسؤولية");
      setText("main p:nth-of-type(1)", "المحتوى المعروض في هذا الموقع لأغراض تسويقية ومعلوماتية فقط ولا يُعد عرضًا ملزمًا أو التزامًا تعاقديًا أو استشارة قانونية.");
      setAllText("main h3", ["الأسعار وأنظمة السداد", "التوافر", "معلومات المشروع", "عدم وجود ضمان", "مصادر خارجية"]);
      setText("main p:nth-of-type(2)", "أي إشارات مثل \"تبدأ من\" أو \"مقدم من 5%\" أو \"تقسيط حتى 10 سنوات\" هي معلومات استرشادية وقد تختلف حسب المرحلة ونوع الوحدة وشروط المطور.");
      setText("main p:nth-of-type(3)", "قد يتغير توافر الوحدات دون إشعار مسبق. ولا يتم تأكيد الحجز إلا بعد استكمال الإجراءات الرسمية وتوقيع المستندات.");
      setText("main p:nth-of-type(4)", "الصور والمواد المرئية قد تتضمن تصورات أو أمثلة تمثيلية. والمواصفات النهائية يحددها المطور.");
      setText("main p:nth-of-type(5)", "لا تضمن Pearls Real Estate عوائد استثمارية أو نسب نمو أو عائد إيجاري. ويُنصح بمراجعة المستندات الرسمية والحصول على استشارة مستقلة عند الحاجة.");
      setText("main p:nth-of-type(6)", "قد تأتي بعض تفاصيل المشروعات من المطورين أو الشركاء المعتمدين. ونحرص على الدقة مع احتمالية تحديث البيانات بمرور الوقت.");
    }

    if (page === "contact") {
      document.title = "تواصل معنا - Pearls Real Estate";
      setText("main h1", "تواصل مع Pearls Real Estate");
      setText("main .card p", "اترك بياناتك وسيتواصل معك فريقنا بأحدث الأسعار والتوافر وأنظمة السداد.");
      setText("label[for='contact-name']", "الاسم الكامل *");
      setText("label[for='contact-phone']", "رقم الهاتف *");
      setText("label[for='contact-project']", "المشروع *");
      setText("label[for='contact-email']", "البريد الإلكتروني");
      setText("label[for='contact-message']", "رسالة (اختياري)");
      setAttr("#contact-phone", "placeholder", "اكتب الرقم مع كود الدولة، مثال: +201012345678");
      setAttr("#contact-message", "placeholder", "اكتب تفضيلاتك أو ميزانيتك أو المنطقة المطلوبة.");
      setText("#contact-project option:first-of-type", "اختر المشروع");
      setText("button[type='submit']", "إرسال");
    }

    if (page === "thank-you") {
      document.title = "شكرًا لك - Pearls Real Estate";
      setText("main h1", "شكرًا لك");
      setText("main p:nth-of-type(1)", "تم إرسال طلبك بنجاح.");
      setText("main p:nth-of-type(2)", "سيتواصل فريقنا معك قريبًا بخصوص الأسعار والتوافر وأنظمة السداد.");
      setText("main .btn-primary", "العودة للرئيسية");
      setText("main .btn-secondary", "إرسال طلب جديد");
    }
  }

  function renderLanguage(lang) {
    if (lang === "ar") {
      applyArabicByPage();
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    } else {
      restoreEnglish();
    }
    initWhatsAppLinks();
    updateLanguageControls(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  function createSwitchControl(className) {
    const wrap = document.createElement("div");
    wrap.className = className + " lang-switch";
    wrap.innerHTML = "<button type='button' class='lang-btn' data-lang='en'>EN</button><button type='button' class='lang-btn' data-lang='ar'>عربى</button>";
    wrap.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const selected = btn.getAttribute("data-lang");
        renderLanguage(selected);
      });
    });
    return wrap;
  }

  function updateLanguageControls(lang) {
    document.querySelectorAll(".lang-switch .lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  function initLanguageControls() {
    const headerInner = document.querySelector(".header-inner");
    if (headerInner && !document.querySelector(".lang-switch-desktop")) {
      headerInner.appendChild(createSwitchControl("lang-switch-desktop"));
    }

    if (!document.querySelector(".lang-switch-fab")) {
      const fab = createSwitchControl("lang-switch-fab");
      document.body.appendChild(fab);
    }
  }

  if (window.PEARLS_CONFIG) {
    const merged = window.PEARLS_CONFIG;
    if (merged.whatsappPhone) config.whatsappPhone = merged.whatsappPhone;
    if (merged.callPhone) config.callPhone = merged.callPhone;
    if (typeof merged.mobileStickyEnabled === "boolean") {
      config.mobileStickyEnabled = merged.mobileStickyEnabled;
    }
    if (merged.formio) {
      if (Object.prototype.hasOwnProperty.call(merged.formio, "endpoint")) {
        config.formio.endpoint = merged.formio.endpoint || "";
      }
      if (Object.prototype.hasOwnProperty.call(merged.formio, "popupEndpoint")) {
        config.formio.popupEndpoint = merged.formio.popupEndpoint || "";
      }
      if (Object.prototype.hasOwnProperty.call(merged.formio, "bottomEndpoint")) {
        config.formio.bottomEndpoint = merged.formio.bottomEndpoint || "";
      }
      if (Object.prototype.hasOwnProperty.call(merged.formio, "contactEndpoint")) {
        config.formio.contactEndpoint = merged.formio.contactEndpoint || "";
      }
    }
  }

  function initBurgerMenu() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".main-nav");
    if (!burger || !nav) return null;

    function closeMenu() {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }

    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(nav.classList.contains("open")));
    });

    return {
      isOpen: function () {
        return nav.classList.contains("open");
      },
      close: closeMenu
    };
  }

  function initMobileHeaderScroll(menuApi) {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      if (!isMobile) {
        header.classList.remove("header-hidden");
        lastY = window.scrollY;
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastY;
      if (Math.abs(delta) < 5) return;

      if (menuApi && menuApi.isOpen()) {
        menuApi.close();
      }

      if (currentY <= 24 || delta < 0) {
        header.classList.remove("header-hidden");
      } else {
        header.classList.add("header-hidden");
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener("resize", onScroll);
  }

  function initSmoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  function createWhatsAppHref(projectName) {
    const textValue = "I am interested in prices and payment plans for " + projectName + ".";
    const text = encodeURIComponent(textValue);
    return "https://wa.me/" + config.whatsappPhone + "?text=" + text;
  }

  function initWhatsAppLinks() {
    document.querySelectorAll(".js-whatsapp").forEach(function (link) {
      const projectName = link.getAttribute("data-project") || "your project";
      link.setAttribute("href", createWhatsAppHref(projectName));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function initLeadModal() {
    const modal = document.getElementById("leadModal");
    if (!modal) return;
    const readonlyProjectInput = modal.querySelector("input[name='project']");

    document.querySelectorAll("[data-open-form]").forEach(function (button) {
      button.addEventListener("click", function () {
        const projectName = button.getAttribute("data-project") || "";
        if (readonlyProjectInput) readonlyProjectInput.value = projectName;
        modal.classList.add("open");
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.hasAttribute("data-close-modal")) {
        modal.classList.remove("open");
      }
    });
  }

  function getEndpoint(formType) {
    if (formType === "popup") return config.formio.popupEndpoint || config.formio.endpoint;
    if (formType === "bottom") return config.formio.bottomEndpoint || config.formio.endpoint;
    if (formType === "contact") return config.formio.contactEndpoint || config.formio.endpoint;
    return config.formio.endpoint || "";
  }

  function isValidPhone(phone) {
    return /^\+?[0-9\s\-()]{8,18}$/.test(phone.trim());
  }

  function submitPayload(endpoint, payload) {
    const request = {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ data: payload })
    };

    return fetch(endpoint, request)
      .then(function (response) {
        if (!response.ok) {
          return { accepted: false };
        }

        return response.json()
          .then(function (json) {
            return { accepted: !!(json && json.ok === true) };
          })
          .catch(function () {
            return { accepted: false };
          });
      })
      .catch(function () {
        return {
          accepted: false
        };
      });
  }

  function initForms() {
    document.querySelectorAll(".js-lead-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.dataset.submitting === "1") return;

        const phoneInput = form.querySelector("input[name='phone']");
        const responseBox = form.querySelector(".js-form-response");
        if (responseBox) responseBox.textContent = "";

        if (phoneInput && !isValidPhone(phoneInput.value)) {
          if (responseBox) {
            responseBox.textContent = getCurrentLang() === "ar"
              ? "يرجى إدخال رقم هاتف صحيح مع كود الدولة."
              : "Please enter a valid phone number with country code.";
          }
          phoneInput.focus();
          return;
        }

        const payload = {};
        new FormData(form).forEach(function (value, key) {
          payload[key] = String(value).trim();
        });

        const attribution = getLeadAttribution();
        payload.formType = form.getAttribute("data-form-type") || "unknown";
        payload.sourcePage = getPageKey();
        payload.gclid = attribution.gclid || "";
        payload.firstTouchTime = attribution.firstTouchTime || "";
        payload.firstTouchPage = attribution.firstTouchPage || "";
        payload.sessionId = attribution.sessionId || "";
        payload.submittedAt = new Date().toISOString();

        const endpoint = getEndpoint(form.getAttribute("data-form-type") || "");
        const redirectUrl = form.getAttribute("data-redirect") || "thank-you.html";
        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonLabel = submitButton ? submitButton.textContent : "";

        form.dataset.submitting = "1";
        form.setAttribute("aria-busy", "true");
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = getCurrentLang() === "ar" ? "جارٍ الإرسال..." : "Submitting...";
        }
        if (responseBox) {
          responseBox.textContent = getCurrentLang() === "ar"
            ? "جارٍ إرسال الطلب، يرجى الانتظار..."
            : "Submitting your request, please wait...";
        }

        const finalize = function () {
          window.location.href = redirectUrl;
        };

        const resetSubmittingState = function () {
          form.dataset.submitting = "0";
          form.removeAttribute("aria-busy");
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonLabel;
          }
        };

        if (!endpoint) {
          if (responseBox) {
            responseBox.textContent = getCurrentLang() === "ar"
              ? "لم يتم إعداد رابط استقبال البيانات بعد. يرجى إضافة رابط Apps Script أولًا."
              : "Lead endpoint is not configured yet. Please add the Apps Script endpoint first.";
          }
          resetSubmittingState();
          return;
        }

        submitPayload(endpoint, payload)
          .then(function (result) {
            if (!result.accepted) {
              throw new Error("Submission failed");
            }
            finalize();
          })
          .catch(function () {
            if (responseBox) {
              responseBox.textContent = getCurrentLang() === "ar"
                ? "تعذر إرسال الطلب. حاول مرة أخرى أو تواصل معنا عبر واتساب."
                : "Submission failed. Please try again or contact us on WhatsApp.";
            }
            resetSubmittingState();
          });
      });
    });
  }

  function initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    if (!track) return;
    const slides = Array.from(track.children);
    const dotsContainer = carousel.parentElement.querySelector(".carousel-dots");
    if (!slides.length || !dotsContainer) return;

    let index = 0;

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "carousel-arrow carousel-arrow-prev";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.innerHTML = "<i class='fa-solid fa-chevron-left' aria-hidden='true'></i>";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "carousel-arrow carousel-arrow-next";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.innerHTML = "<i class='fa-solid fa-chevron-right' aria-hidden='true'></i>";

    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);

    dotsContainer.innerHTML = "";
    slides.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to image " + (i + 1));
      dot.addEventListener("click", function () {
        index = i;
        render(true);
      });
      dotsContainer.appendChild(dot);
    });

    function render(smooth) {
      const target = slides[index];
      const left = target ? target.offsetLeft : index * track.clientWidth;
      const behavior = smooth === false ? "auto" : "smooth";

      if (typeof track.scrollTo === "function") {
        track.scrollTo({ left: left, behavior: behavior });
      } else {
        track.scrollLeft = left;
      }

      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function getNearestIndex() {
      let nearest = 0;
      let minDelta = Number.POSITIVE_INFINITY;
      const currentLeft = track.scrollLeft;

      slides.forEach(function (slide, i) {
        const delta = Math.abs(slide.offsetLeft - currentLeft);
        if (delta < minDelta) {
          minDelta = delta;
          nearest = i;
        }
      });

      return nearest;
    }

    prevBtn.addEventListener("click", function () {
      index = getNearestIndex();
      index = (index - 1 + slides.length) % slides.length;
      render(true);
    });

    nextBtn.addEventListener("click", function () {
      index = getNearestIndex();
      index = (index + 1) % slides.length;
      render(true);
    });

    track.addEventListener("scroll", function () {
      const nextIndex = getNearestIndex();
      if (nextIndex !== index) {
        index = Math.max(0, Math.min(slides.length - 1, nextIndex));
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }
    });

    window.addEventListener("resize", function () {
      render(false);
    });

    render(false);
  }

  function initCarousels() {
    document.querySelectorAll(".carousel").forEach(initCarousel);
  }

  function normalizePalmHillsEastHero() {
    if (getPageKey() !== "palm-hills-compounds") return;
    const paragraphs = document.querySelectorAll(".hero .hero-content > p");
    if (paragraphs.length <= 1) return;

    // Keep only the first hero paragraph to avoid mixed-language duplicate lines.
    paragraphs.forEach(function (p, i) {
      if (i > 0) p.remove();
    });
  }

  function injectCookieBanner() {
    if (sessionStorage.getItem("pearlsCookieHidden") === "1") return;
    const banner = document.createElement("div");
    banner.className = "cookie-banner show";
    banner.innerHTML = "<p>This website uses cookies and tracking tools to improve performance and campaign analytics. Read our <a href='privacy.html'>Privacy Policy</a> and <a href='disclaimer.html'>Disclaimer</a>.</p><button class='btn btn-primary js-cookie-close' type='button'>Close</button>";
    document.body.appendChild(banner);

    function closeBanner() {
      banner.classList.remove("show");
      sessionStorage.setItem("pearlsCookieHidden", "1");
      window.setTimeout(function () {
        banner.remove();
      }, 250);
    }

    banner.querySelector(".js-cookie-close").addEventListener("click", closeBanner);
    window.setTimeout(closeBanner, 7000);
  }

  function injectMobileStickyBar() {
    if (!config.mobileStickyEnabled) return;
    if (document.querySelector(".mobile-sticky-bar")) return;
    const bar = document.createElement("div");
    const callHref = "tel:+" + config.callPhone;
    const waHref = "https://wa.me/" + config.whatsappPhone + "?text=" + encodeURIComponent("Hello, I am interested in your available projects.");
    bar.className = "mobile-sticky-bar";
    bar.innerHTML = "<a class='mobile-sticky-btn call' href='" + callHref + "'><i class='fa-solid fa-phone'></i><span>Call</span></a><a class='mobile-sticky-btn whatsapp' href='" + waHref + "' target='_blank' rel='noopener noreferrer'><i class='fa-brands fa-whatsapp'></i><span>WhatsApp</span></a>";
    document.body.appendChild(bar);
    document.body.classList.add("has-mobile-sticky-bar");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLeadAttribution();
    normalizePalmHillsEastHero();
    const menuApi = initBurgerMenu();
    initLanguageControls();
    initMobileHeaderScroll(menuApi);
    initSmoothScroll();
    initWhatsAppLinks();
    initLeadModal();
    initForms();
    initCarousels();
    injectCookieBanner();
    injectMobileStickyBar();
    renderLanguage(localStorage.getItem(LANG_KEY) || "ar");
  });
})();