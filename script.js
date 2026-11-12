(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Footer year */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Nav: scrolled state + progress bar */
  var nav = $("#nav");
  var progress = $("#progress");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-scrolled", y > 24);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = $("#burger");
  var menu = $("#menu");
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* Active link on scroll */
  var links = $$("[data-link]");
  var sections = $$("[data-section]");
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.toggle("is-active", l.dataset.link === e.target.id); });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { spy.observe(s); });

  /* Reveal on scroll with small stagger inside groups */
  var groups = ".exp, .edu-stack, .skills, .svc-main, .svc-grid, .gallery, .socials";
  $$(groups).forEach(function (g) {
    $$(".reveal", g).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.09) + "s"); });
  });
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    $$(".count").forEach(function (c) {
      var to = parseInt(c.dataset.to, 10) || 0;
      if (reduce) { c.textContent = to; return; }
      var start = null, dur = 1400;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        c.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        if (e.target.classList.contains("exp-card")) runCounters();
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  /* Service cards: light follows the cursor */
  $$(".svc").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Hero: cursor glow */
  var hero = $("#home");
  var glow = $("#glow");
  var mouse = { x: -9999, y: -9999, on: false };
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.on = true;
    glow.style.left = mouse.x + "px";
    glow.style.top = mouse.y + "px";
    hero.classList.add("is-hover");
  });
  hero.addEventListener("pointerleave", function () {
    mouse.on = false;
    hero.classList.remove("is-hover");
  });

  /* Hero: network of nodes (fits a network engineering student) */
  var canvas = $("#net");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], W = 0, H = 0, raf = 0, visible = true;

  function size() {
    var r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(28, Math.min(80, Math.round((W * H) / 17000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.8
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var link = 135;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
      }
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          ctx.strokeStyle = "rgba(201,204,209," + (0.16 * (1 - d / link)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      if (mouse.on) {
        var mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
        if (md < 190) {
          ctx.strokeStyle = "rgba(244,245,247," + (0.5 * (1 - md / 190)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(244,245,247,0.75)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  function loop() {
    if (visible) draw();
    raf = requestAnimationFrame(loop);
  }
  size();
  if (reduce) { draw(); } else { loop(); }
  var resizeT;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { size(); if (reduce) draw(); }, 150);
  });
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);

  /* Portfolio lightbox */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbClose = $("#lbClose");
  var lastFocus = null;
  function openLb(src, title, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = alt || title; lbCap.textContent = title;
    lb.classList.add("is-open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLb() {
    lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".work").forEach(function (w) {
    w.addEventListener("click", function () {
      openLb(w.dataset.full, w.dataset.title, $("img", w).alt);
    });
  });
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("is-open")) closeLb(); });

  /* Copy email */
  var copy = $("#copy"), toast = $("#toast"), toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove("is-show"); }, 2200);
  }
  copy.addEventListener("click", function () {
    var email = "harishczar@gmail.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { showToast("Email address copied"); },
        function () { showToast(email); });
    } else {
      showToast(email);
    }
  });
})();
