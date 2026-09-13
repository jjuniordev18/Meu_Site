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
  var revealObserver = null;

  /* the reveal replays every time a section scrolls back into view */
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-revealed", entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  function observeReveal(el) {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("is-revealed");
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

  /* ---------------- projects collapse/expand */
  var projectsToggle = document.getElementById("projects-toggle");
  var VISIBLE_PROJECTS = 6;
  var projectsExpanded = false;

  function getProjCards() {
    return Array.prototype.slice.call(document.querySelectorAll("#projects-grid .projects__card"));
  }

  function syncProjectsCollapse() {
    if (!projectsToggle) return;
    var cards = getProjCards();
    projectsToggle.setAttribute("aria-expanded", projectsExpanded ? "true" : "false");
    projectsToggle.classList.toggle("is-open", projectsExpanded);
    var label = projectsToggle.querySelector("span");
    if (label) label.textContent = projectsExpanded ? "Mostrar menos" : "Mostrar mais projetos";
    if (cards.length <= VISIBLE_PROJECTS) {
      projectsToggle.style.display = "none";
      return;
    }
    projectsToggle.style.display = "";
    cards.forEach(function (card, i) {
      card.classList.toggle("is-collapsed", !projectsExpanded && i >= VISIBLE_PROJECTS);
    });
  }

  syncProjectsCollapse();

  if (projectsToggle) {
    projectsToggle.addEventListener("click", function () {
      projectsExpanded = !projectsExpanded;
      syncProjectsCollapse();
      setTimeout(function () {
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 120);
    });
  }

  /* ---------------- dynamic GitHub projects (progressive enhancement) */
  var GH_USER = "jjuniordev18";
  var MAX_DYNAMIC_PROJECTS = 6;

  function escHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function wireDynamicCard(card) {
    observeReveal(card);
    if (finePointer) {
      var inner = card.querySelector(".projects__card__inner");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        if (inner) {
          inner.style.setProperty("--spot-x", (e.clientX - r.left) + "px");
          inner.style.setProperty("--spot-y", (e.clientY - r.top) + "px");
        }
      });
    }
    if (isTouchDevice) {
      card.addEventListener("touchstart", function (e) {
        if (e.target.closest(".link-arrow")) return;
        getProjCards().forEach(function (c) { if (c !== card) c.classList.remove("is-touched"); });
        card.classList.toggle("is-touched");
      }, { passive: true });
    }
  }

  function loadExtraProjects() {
    var grid = document.getElementById("projects-grid");
    if (!grid || !window.fetch) return;
    var known = {};
    grid.querySelectorAll(".projects__name").forEach(function (n) {
      known[n.textContent.trim().toLowerCase()] = true;
    });
    var url = "https://api.github.com/users/" + GH_USER + "/repos?sort=updated&per_page=60&type=all";
    fetch(url)
      .then(function (res) { if (!res.ok) throw new Error("github " + res.status); return res.json(); })
      .then(function (repos) {
        var added = 0;
        repos.forEach(function (repo) {
          if (added >= MAX_DYNAMIC_PROJECTS) return;
          if (!repo || repo.fork || !repo.description) return;
          var name = repo.name || "";
          if (name === "Meu_Site" || known[name.toLowerCase()]) return;
          known[name.toLowerCase()] = true;
          var li = document.createElement("li");
          li.className = "projects__card";
          li.setAttribute("data-reveal", "fade");
          var lang = repo.language ? escHtml(repo.language) : "GitHub";
          li.innerHTML =
            '<span class="projects__card__bg"></span>' +
            '<span class="projects__card__inner">' +
            '<p class="projects__lang">' + lang + '</p>' +
            '<h3 class="projects__name">' + escHtml(name) + '</h3>' +
            '<p class="projects__desc">' + escHtml(repo.description) + '</p>' +
            '<a class="link-arrow" href="' + escHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">GitHub <span class="link-arrow__glyph" aria-hidden="true">↗</span></a>' +
            '</span>';
          grid.appendChild(li);
          wireDynamicCard(li);
          added++;
        });
        if (added > 0) syncProjectsCollapse();
      })
      .catch(function () { /* static fallback: curated cards stay as-is */ });
  }

  var scheduleIdle = window.requestIdleCallback || function (fn) { setTimeout(fn, 1500); };
  if (document.readyState === "complete") {
    scheduleIdle(loadExtraProjects, { timeout: 4000 });
  } else {
    window.addEventListener("load", function () {
      scheduleIdle(loadExtraProjects, { timeout: 4000 });
    });
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
  var avifSupport = false;
  var AVIF_PROBE = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAD5bWV0YQAAAAAAAAAvaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAFBpY3R1cmVIYW5kbGVyAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAASEAAAATAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGppcHJwAAAAS2lwY28AAAAUaXNwZQAAAAAAAAABAAAAAQAAABBwaXhpAAAAAAMICAgAAAAMYXYxQ4EADAAAAAATY29scm5jbHgAAgACAAIAAAAAF2lwbWEAAAAAAAAAAQABBAECgwQAAAAbbWRhdAoFGAAGwCAyChyAAABYAABABMA=";

  function detectAvif(cb) {
    var img = new Image();
    var settled = false;
    var timer = setTimeout(function () { finish(false); }, 2000);
    function finish(ok) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      avifSupport = ok;
      cb(ok);
    }
    img.onload = function () { finish(true); };
    img.onerror = function () { finish(false); };
    img.src = AVIF_PROBE;
  }

  function applyBg(el) {
    var avif = el.getAttribute("data-bg");
    var webp = el.getAttribute("data-bg-webp");
    if (!avif) return;
    var url = avifSupport ? avif : (webp || avif);
    el.classList.add("bg-loading");
    var img = new Image();
    img.onload = function () {
      el.style.setProperty("--section-img", "url(\"" + url + "\")");
      requestAnimationFrame(function () {
        el.classList.remove("bg-loading");
        el.classList.add("bg-loaded");
      });
    };
    img.onerror = function () {
      if (webp && url !== webp) {
        el.style.setProperty("--section-img", "url(\"" + webp + "\")");
        requestAnimationFrame(function () {
          el.classList.remove("bg-loading");
          el.classList.add("bg-loaded");
        });
      }
    };
    img.src = url;
  }

  detectAvif(function () {
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
  });

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
        getProjCards().forEach(function (c) { c.classList.remove("is-touched"); });
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

/* ---------------- GSAP animations (lazy-loaded for hover-capable devices) */

function loadGsap() {
  if (typeof gsap !== "undefined" && !reduceMotion) {
    initGsapAnimations();
    return;
  }
  if (typeof gsap === "undefined" && !reduceMotion && finePointer) {
    var gsapScript = document.createElement("script");
    var scrollTriggerScript = document.createElement("script");
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    scrollTriggerScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
    gsapScript.onload = function () {
      scrollTriggerScript.onload = initGsapAnimations;
      document.head.appendChild(scrollTriggerScript);
    };
    document.head.appendChild(gsapScript);
  }
}

function initGsapAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    /* hero entrance — staggered fade + rise (autoAlpha = opacity + visibility) */
    var heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
    heroTl
      .from(".profile-card", { autoAlpha: 0, y: 30, scale: 0.95 }, 0.1)
      .from(".hero__display", { autoAlpha: 0, y: 30 }, 0.35)
      .from(".hero__lede", { autoAlpha: 0, y: 20 }, 0.5);

    /* section heads — slide + fade on scroll.
       The CSS [data-reveal] rule hides these elements until they enter the
       viewport, so gsap.from() would capture opacity:0 as its end value and the
       element would stay invisible forever. fromTo + clearProps guarantee an
       explicit end state and release inline styles when done, so the CSS reveal
       and :hover states take over again. */
    gsap.utils.toArray(".section__head").forEach(function (head) {
      gsap.fromTo(head,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out", clearProps: "opacity,transform",
          scrollTrigger: { trigger: head, start: "top 85%", toggleActions: "play none none none" }
        });
    });

    /* stats — scale up from center */
    gsap.utils.toArray(".stat").forEach(function (stat, i) {
      gsap.fromTo(stat,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.08, ease: "back.out(1.4)",
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: stat, start: "top 88%" }
        });
    });

    /* project cards — staggered fade */
    gsap.utils.toArray(".projects__card").forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 35 },
        {
          opacity: 1, y: 0, duration: 0.55, delay: i * 0.06, ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: card, start: "top 90%" }
        });
    });

    /* timeline steps — slide from left */
    gsap.utils.toArray(".timeline__step").forEach(function (step, i) {
      gsap.fromTo(step,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: step, start: "top 88%" }
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

loadGsap();
})();
