(function () {
  const config = {
    whatsappPhone: "201000000000",
    callPhone: "201000000000",
    formio: {
      popupEndpoint: "",
      bottomEndpoint: "",
      contactEndpoint: ""
    }
  };

  if (window.PEARLS_CONFIG) {
    const merged = window.PEARLS_CONFIG;
    if (merged.whatsappPhone) config.whatsappPhone = merged.whatsappPhone;
    if (merged.callPhone) config.callPhone = merged.callPhone;
    if (merged.formio) {
      config.formio.popupEndpoint = merged.formio.popupEndpoint || "";
      config.formio.bottomEndpoint = merged.formio.bottomEndpoint || "";
      config.formio.contactEndpoint = merged.formio.contactEndpoint || "";
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
    const text = encodeURIComponent("I am interested in prices and payment plans for " + projectName + ".");
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
    if (formType === "popup") return config.formio.popupEndpoint;
    if (formType === "bottom") return config.formio.bottomEndpoint;
    if (formType === "contact") return config.formio.contactEndpoint;
    return "";
  }

  function isValidPhone(phone) {
    return /^\+?[0-9\s\-()]{8,18}$/.test(phone.trim());
  }

  function submitPayload(endpoint, payload) {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload })
    });
  }

  function initForms() {
    document.querySelectorAll(".js-lead-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const phoneInput = form.querySelector("input[name='phone']");
        const responseBox = form.querySelector(".js-form-response");
        if (responseBox) responseBox.textContent = "";

        if (phoneInput && !isValidPhone(phoneInput.value)) {
          if (responseBox) responseBox.textContent = "Please enter a valid phone number with country code.";
          phoneInput.focus();
          return;
        }

        const payload = {};
        new FormData(form).forEach(function (value, key) {
          payload[key] = String(value).trim();
        });

        const endpoint = getEndpoint(form.getAttribute("data-form-type") || "");
        const redirectUrl = form.getAttribute("data-redirect") || "thank-you.html";
        const submitButton = form.querySelector("button[type='submit']");
        if (submitButton) submitButton.disabled = true;

        const finalize = function () {
          window.location.href = redirectUrl;
        };

        if (!endpoint) {
          setTimeout(finalize, 500);
          return;
        }

        submitPayload(endpoint, payload)
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Submission failed");
            }
            finalize();
          })
          .catch(function () {
            if (responseBox) responseBox.textContent = "Submission failed. Please try again or contact us on WhatsApp.";
            if (submitButton) submitButton.disabled = false;
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
    let timer = null;

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
      track.scrollTo({
        left: index * track.clientWidth,
        behavior: smooth === false ? "auto" : "smooth"
      });
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        index = (index + 1) % slides.length;
        render();
      }, 3500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    track.addEventListener("scroll", function () {
      const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
      if (nextIndex !== index) {
        index = Math.max(0, Math.min(slides.length - 1, nextIndex));
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }
    });
    start();
  }

  function initCarousels() {
    document.querySelectorAll(".carousel").forEach(initCarousel);
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
    const menuApi = initBurgerMenu();
    initMobileHeaderScroll(menuApi);
    initSmoothScroll();
    initWhatsAppLinks();
    initLeadModal();
    initForms();
    initCarousels();
    injectCookieBanner();
    injectMobileStickyBar();
  });
})();