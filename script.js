(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme */

  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var themeInput = document.getElementById("input");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}

  function applyTheme(theme, animate) {
    if (animate && !reduceMotion) root.classList.add("theme-switching");
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    if (themeInput) themeInput.checked = theme === "light";
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", theme === "light" ? "#f5f5f0" : "#1b1e29");
    if (animate && !reduceMotion) {
      setTimeout(function () { root.classList.remove("theme-switching"); }, 500);
    }
  }

  function initTheme() {
    var theme;
    if (stored === "light" || stored === "dark") {
      theme = stored;
    } else {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    applyTheme(theme, false);
  }

  initTheme();

  if (themeInput) {
    themeInput.addEventListener("change", function () {
      var current = themeInput.checked ? "light" : "dark";
      try { localStorage.setItem("theme", current); } catch (e) {}
      applyTheme(current, true);
    });
  }

  /* ---------------- mobile nav */

  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav__toggle");

  function closeMenu(returnFocus) {
    nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (returnFocus && toggle) toggle.focus();
  }

  function trapFocus(e) {
    if (!nav.classList.contains("is-open")) return;
    var focusable = nav.querySelectorAll('.nav__links a, .switch, .nav__toggle');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = nav.querySelector(".nav__links a");
        if (first) first.focus({ preventScroll: true });
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
    trapFocus(e);
  });

  nav.querySelectorAll(".nav__links a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeMenu(false);
    });
  });

  /* ---------------- scroll reveal */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  /* the reveal replays every time a section scrolls back into view */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-revealed", entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  /* ---------------- scrollspy (active section in nav) */
  var spyIds = ["sobre", "competencias", "trajetoria", "projetos", "contato"];
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  if ("IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          spyLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    spyIds.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spyObserver.observe(sec);
    });
  }

  /* ---------------- timeline collapse/expand */
  var timelineToggle = document.getElementById("timeline-toggle");
  var timelineSteps = Array.prototype.slice.call(document.querySelectorAll(".timeline__step"));
  var VISIBLE_STEPS = 6;

  if (timelineToggle && timelineSteps.length > VISIBLE_STEPS) {
    timelineSteps.forEach(function (step, i) {
      if (i >= VISIBLE_STEPS) step.classList.add("is-collapsed");
    });
    timelineToggle.addEventListener("click", function () {
      var expanded = timelineToggle.getAttribute("aria-expanded") === "true";
      timelineToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      timelineToggle.classList.toggle("is-open", !expanded);
      timelineToggle.querySelector("span").textContent = expanded ? "Mostrar trajetória completa" : "Mostrar menos";
      timelineSteps.forEach(function (step, i) {
        if (i >= VISIBLE_STEPS) step.classList.toggle("is-collapsed", expanded);
      });
    });
  } else if (timelineToggle) {
    timelineToggle.style.display = "none";
  }

  /* ---------------- number reveal (stats) */
  var nums = Array.prototype.slice.call(document.querySelectorAll(".stat__num[data-count]"));

  function renderFinal(el) {
    el.textContent = el.getAttribute("data-count");
  }

  function countUp(el) {
    if (el._animating) return;
    el._animating = true;
    var target = parseInt(el.getAttribute("data-count"), 10);
    var duration = 1200;
    var start = null;

    function frame(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el._animating = false;
      }
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var numObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
        } else {
          entry.target.textContent = "0";
          entry.target._animating = false;
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { numObserver.observe(el); });
  } else {
    nums.forEach(renderFinal);
  }

  /* ---------------- section background parallax */

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var bgSections = Array.prototype.slice.call(document.querySelectorAll(".section--bg"));
  var rafPending = false;

  function parallax() {
    var vh = window.innerHeight;
    bgSections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      var p = (rect.top + rect.height / 2 - vh / 2) / vh;
      sec.style.setProperty("--parallax", p.toFixed(3));
    });
    rafPending = false;
  }

  if (finePointer && bgSections.length) {
    bgSections.forEach(function (sec) { sec.classList.add("has-parallax"); });
    parallax();
    window.addEventListener("scroll", function () {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(parallax);
      }
    }, { passive: true });
  }

  /* ---------------- lazy background images (from data-bg) */
  var lazyBgs = Array.prototype.slice.call(document.querySelectorAll("[data-bg]"));
  function applyBg(el) {
    var url = el.getAttribute("data-bg");
    if (!url) return;
    el.classList.add("bg-loading");
    var img = new Image();
    img.onload = function () {
      el.style.setProperty("--section-img", "url(\"" + url + "\")");
      requestAnimationFrame(function () {
        el.classList.remove("bg-loading");
        el.classList.add("bg-loaded");
      });
    };
    img.src = url;
  }
  if (lazyBgs.length && "IntersectionObserver" in window) {
    var bgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          applyBg(entry.target);
          bgObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "500px 0px" });
    lazyBgs.forEach(function (el) { bgObserver.observe(el); });
  } else {
    lazyBgs.forEach(applyBg);
  }

  /* ---------------- Lusion-style effects */
  /* site owner's choice: this is an animated showcase, so the cursor,
     magnetic and tilt effects run even when the OS requests reduced motion */

  if (finePointer) {
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add("has-cursor");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var cursorRaf = null;
    function cursorLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.setProperty("--x", mx + "px");
      dot.style.setProperty("--y", my + "px");
      ring.style.setProperty("--x", rx + "px");
      ring.style.setProperty("--y", ry + "px");
      cursorRaf = null;
    }
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!cursorRaf) cursorRaf = requestAnimationFrame(cursorLoop);
    }, { passive: true });

    var interactive = "a, button, .projects__card, .nav__inner";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest(interactive)) ring.style.setProperty("--s", "1.7");
    });
    document.addEventListener("pointerout", function (e) {
      if (!e.relatedTarget || !e.relatedTarget.closest(interactive)) ring.style.setProperty("--s", "1");
    });

    var magneticEls = Array.prototype.slice.call(document.querySelectorAll(".btn, .link-arrow, .nav__brand, .footer__brand"));
    magneticEls.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.18;
        el.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

    var tiltCards = Array.prototype.slice.call(document.querySelectorAll(".projects__card"));
    tiltCards.forEach(function (card) {
      var inner = card.querySelector(".projects__card__inner");
      var bg = card.querySelector(".projects__card__bg");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var spotX = (e.clientX - r.left) + "px";
        var spotY = (e.clientY - r.top) + "px";
        if (inner) {
          inner.style.setProperty("--spot-x", spotX);
          inner.style.setProperty("--spot-y", spotY);
        }
      });
    });
  }

  /* ---------------- touch gestures for mobile cards */
  var isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    /* profile card — tap to toggle expanded state */
    var profileCard = document.querySelector(".profile-card");
    if (profileCard) {
      profileCard.addEventListener("touchstart", function (e) {
        if (e.target.closest(".profile-card__social") || e.target.closest(".profile-card__btn")) return;
        profileCard.classList.toggle("is-expanded");
      }, { passive: true });
      /* close profile card when tapping outside */
      document.addEventListener("touchstart", function (e) {
        if (!e.target.closest(".profile-card")) {
          profileCard.classList.remove("is-expanded");
        }
      }, { passive: true });
    }

    /* project cards — tap to toggle spotlight effect */
    var projectCards = Array.prototype.slice.call(document.querySelectorAll(".projects__card"));
    projectCards.forEach(function (card) {
      card.addEventListener("touchstart", function (e) {
        if (e.target.closest(".link-arrow")) return;
        /* close other cards first */
        projectCards.forEach(function (c) { if (c !== card) c.classList.remove("is-touched"); });
        card.classList.toggle("is-touched");
      }, { passive: true });
    });
    /* close project cards when tapping outside */
    document.addEventListener("touchstart", function (e) {
      if (!e.target.closest(".projects__card")) {
        projectCards.forEach(function (c) { c.classList.remove("is-touched"); });
      }
    }, { passive: true });
  }

  /* scroll progress */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.setProperty("--p", (max > 0 ? window.pageYOffset / max : 0).toFixed(4));
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------------- back to top */
  var toTop = document.getElementById("to-top");
  if (toTop) {
    function updateToTop() {
      toTop.classList.toggle("is-visible", window.pageYOffset > 600);
    }
    window.addEventListener("scroll", updateToTop, { passive: true });
    window.addEventListener("resize", updateToTop);
    updateToTop();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      toTop.focus();
    });
  }

  /* ---------------- copy email */
  var copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var text = "juniorgm18@gmail.com";
      var originalText = copyBtn.textContent;
      copyBtn.textContent = "Copiando...";
      copyBtn.disabled = true;
      var done = function () {
        copyBtn.textContent = "E-mail copiado!";
        setTimeout(function () {
          copyBtn.textContent = originalText;
          copyBtn.disabled = false;
        }, 2000);
      };
      var fail = function () {
        copyBtn.textContent = originalText;
        copyBtn.disabled = false;
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text, done, fail);
        });
      } else {
        fallbackCopy(text, done, fail);
      }
    });
  }

  function fallbackCopy(text, callback, failCallback) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      callback();
    } catch (err) {
      console.error("Fallback copy failed:", err);
      if (failCallback) failCallback();
    }
    document.body.removeChild(textarea);
  }

  /* ---------------- button ripple (pointer-relative click burst) */
  if (!reduceMotion) {
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest(".btn");
      if (!btn || btn.disabled) return;
      var r = btn.getBoundingClientRect();
      btn.style.setProperty("--ripple-x", (e.clientX - r.left) + "px");
      btn.style.setProperty("--ripple-y", (e.clientY - r.top) + "px");
      btn.classList.remove("is-rippling");
      void btn.offsetWidth;
      btn.classList.add("is-rippling");
    }, { passive: true });
  }

  /* ---------------- GSAP animations */
  if (typeof gsap !== "undefined" && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* hero entrance — staggered fade + rise (autoAlpha = opacity + visibility) */
    var heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
    heroTl
      .from(".profile-card", { autoAlpha: 0, y: 30, scale: 0.95 }, 0.1)
      .from(".hero__meta", { autoAlpha: 0, y: 20 }, 0.25)
      .from(".hero__display", { autoAlpha: 0, y: 30 }, 0.35)
      .from(".hero__lede", { autoAlpha: 0, y: 20 }, 0.5);

    /* section heads — slide + fade on scroll (use opacity to avoid conflict with data-reveal) */
    gsap.utils.toArray(".section__head").forEach(function (head) {
      gsap.from(head, {
        scrollTrigger: { trigger: head, start: "top 85%", toggleActions: "play none none none" },
        opacity: 0, y: 40, duration: 0.7, ease: "power2.out"
      });
    });

    /* stats — scale up from center */
    gsap.utils.toArray(".stat").forEach(function (stat, i) {
      gsap.from(stat, {
        scrollTrigger: { trigger: stat, start: "top 88%" },
        opacity: 0, y: 30, scale: 0.96, duration: 0.5, delay: i * 0.08, ease: "back.out(1.4)"
      });
    });

    /* project cards — staggered fade */
    gsap.utils.toArray(".projects__card").forEach(function (card, i) {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 90%" },
        opacity: 0, y: 35, duration: 0.55, delay: i * 0.06, ease: "power2.out"
      });
    });

    /* timeline steps — slide from left */
    gsap.utils.toArray(".timeline__step").forEach(function (step, i) {
      gsap.from(step, {
        scrollTrigger: { trigger: step, start: "top 88%" },
        opacity: 0, x: -30, duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: "power2.out"
      });
    });

    /* footer statement — reveal */
    var footerStmt = document.querySelector(".footer__statement");
    if (footerStmt) {
      gsap.from(footerStmt, {
        scrollTrigger: { trigger: footerStmt, start: "top 90%" },
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out"
      });
    }

    /* refresh ScrollTrigger after timeline toggle (layout change) */
    if (timelineToggle) {
      timelineToggle.addEventListener("click", function () {
        setTimeout(function () { ScrollTrigger.refresh(); }, 100);
      });
    }
  }
})();
