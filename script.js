(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme */

  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}

  function applyTheme(theme, animate) {
    if (animate && !reduceMotion) root.classList.add("theme-switching");
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    if (themeBtn) themeBtn.setAttribute("aria-pressed", theme === "light");
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

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", current); } catch (e) {}
      applyTheme(current, true);
    });
  }

  /* ---------------- mobile nav */

  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav__toggle");

  function closeMenu(returnFocus) {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var first = nav.querySelector(".nav__links a");
      if (first) first.focus({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
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
    var target = parseInt(el.getAttribute("data-count"), 10);
    var duration = 1200;
    var start = null;

    function frame(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) countUp(entry.target);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { observer.observe(el); });
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
  if (lazyBgs.length && "IntersectionObserver" in window) {
    var bgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.setProperty("--section-img", "url(\"" + entry.target.getAttribute("data-bg") + "\")");
          bgObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "500px 0px" });
    lazyBgs.forEach(function (el) { bgObserver.observe(el); });
  } else {
    lazyBgs.forEach(function (el) {
      el.style.setProperty("--section-img", "url(\"" + el.getAttribute("data-bg") + "\")");
    });
  }

  /* ---------------- hero network cursor drift */

  var netG = document.querySelector(".hero__network g");
  var hero = document.querySelector(".hero");
  if (netG && hero && finePointer) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      netG.style.setProperty("--drift-x", (nx * 10).toFixed(1) + "px");
      netG.style.setProperty("--drift-y", (ny * 8).toFixed(1) + "px");
    });
    hero.addEventListener("pointerleave", function () {
      netG.style.setProperty("--drift-x", "0px");
      netG.style.setProperty("--drift-y", "0px");
    });
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
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
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
    copyBtn.addEventListener("click", function () {
      var text = "juniorgm18@gmail.com";
      var done = function () {
        copyBtn.classList.add("is-copied");
        copyBtn.setAttribute("aria-label", "E-mail copiado");
        setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          copyBtn.setAttribute("aria-label", "Copiar e-mail");
        }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }
})();
