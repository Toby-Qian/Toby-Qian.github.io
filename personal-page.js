/* Personal Press — interactions */
(function () {
  const body = document.body;
  const tweaksPanel = document.getElementById("tweaksPanel");
  const tweaksClose = document.getElementById("tweaksClose");

  // ---------- Apply saved tweaks ----------
  const tw = Object.assign({
    typeset: "quiet",
    accent: "amber",
    paper: "cream",
    grain: "on",
    cursor: "on"
  }, window.__TWEAKS__ || {});

  const accents = {
    amber:  ["#c46d2b", "#9a4331"],
    ink:    ["#141210", "#000000"],
    ruby:   ["#a3283a", "#6e1323"],
    olive:  ["#5a6a3a", "#3d4824"],
    cobalt: ["#2a4a8a", "#15306a"]
  };

  function applyTweaks(t) {
    body.setAttribute("data-typeset", t.typeset);
    body.setAttribute("data-paper", t.paper);
    body.setAttribute("data-grain", t.grain);
    body.setAttribute("data-cursor", t.cursor);
    const a = accents[t.accent] || accents.amber;
    body.style.setProperty("--accent", a[0]);
    body.style.setProperty("--accent-2", a[1]);
    // update segmented controls
    document.querySelectorAll(".tw-seg").forEach(seg => {
      const key = seg.dataset.key;
      seg.querySelectorAll("button").forEach(b => {
        b.classList.toggle("is-on", b.dataset.val === t[key]);
      });
    });
  }
  applyTweaks(tw);

  // ---------- Edit mode / Tweaks protocol ----------
  window.addEventListener("message", (e) => {
    const d = e.data || {};
    if (d.type === "__activate_edit_mode") {
      tweaksPanel.hidden = false;
    } else if (d.type === "__deactivate_edit_mode") {
      tweaksPanel.hidden = true;
    }
  });
  try {
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  } catch (e) { /* noop */ }

  if (tweaksClose) tweaksClose.addEventListener("click", () => { tweaksPanel.hidden = true; });

  document.querySelectorAll(".tw-seg").forEach(seg => {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-val]");
      if (!btn) return;
      const key = seg.dataset.key;
      const val = btn.dataset.val;
      tw[key] = val;
      applyTweaks(tw);
      try {
        window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: val } }, "*");
      } catch (err) { /* noop */ }
    });
  });

  // ---------- Mobile menu ----------
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector(".nav");
  function closeMenu() {
    body.classList.remove("menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (nav) {
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  }

  // ---------- Time + today ----------
  const timeText = document.getElementById("timeText");
  const todayText = document.getElementById("todayText");
  const yearEl = document.getElementById("year");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    const d = new Date();
    const hh = pad(d.getHours()), mm = pad(d.getMinutes());
    if (timeText) timeText.textContent = `SHA · ${hh}:${mm}`;
  }
  tick(); setInterval(tick, 30 * 1000);
  if (todayText) {
    const d = new Date();
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    todayText.textContent = `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
  }
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Rotating NOW text ----------
  const nowText = document.getElementById("nowText");
  const nowPhrases = [
    "Drafting the first issue of a personal press.",
    "Rewriting the about page for the third time.",
    "Playing with variable serif faces and tight grids.",
    "Reading about small-web, writing about tools."
  ];
  if (nowText) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % nowPhrases.length;
      nowText.style.opacity = "0";
      nowText.style.transform = "translateY(6px)";
      setTimeout(() => {
        nowText.textContent = nowPhrases[i];
        nowText.style.transition = "opacity .4s, transform .4s";
        nowText.style.opacity = "1";
        nowText.style.transform = "translateY(0)";
      }, 240);
    }, 4200);
  }

  // ---------- Hero char stagger ----------
  document.querySelectorAll(".hero__title .char").forEach((c, i) => {
    c.style.animationDelay = `${80 + i * 35}ms`;
  });

  // ---------- Cursor follower ----------
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
  }, { passive: true });

  function frame() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
    requestAnimationFrame(frame);
  }
  frame();

  document.querySelectorAll("[data-hoverable], a, button").forEach(el => {
    el.addEventListener("mouseenter", () => body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => body.classList.remove("cursor-hover"));
  });

  // ---------- Reveal on scroll ----------
  const revealers = [
    ".hero__side > *",
    ".section-title",
    ".about__aside > *",
    ".about__col > *",
    ".about__facts .fact",
    ".stack__group",
    ".stack__pullquote",
    ".work-card",
    ".t-item",
    ".entry",
    ".c-row",
    ".colophon",
    ".footer__row",
    ".footer__big"
  ];
  const revealEls = document.querySelectorAll(revealers.join(", "));
  revealEls.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 30, 280)}ms`;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  revealEls.forEach(el => io.observe(el));

  // ---------- Parallax (mouse) on hero ----------
  const heroSide = document.querySelector(".hero__side");
  const heroTitle = document.querySelector(".hero__title");
  const stamp = document.querySelector(".hero__stamp");
  const asterisk = document.querySelector(".hero__asterisk");

  const isCoarse = matchMedia("(hover: none), (max-width: 720px)").matches;
  if (!isCoarse) {
    window.addEventListener("mousemove", (e) => {
      const cx = (e.clientX / innerWidth - 0.5);
      const cy = (e.clientY / innerHeight - 0.5);
      if (heroTitle) heroTitle.style.transform = `translate(${cx * -8}px, ${cy * -5}px)`;
      if (heroSide)  heroSide.style.transform  = `translate(${cx * 10}px, ${cy * 6}px)`;
      if (stamp)     stamp.style.transform     = `translate(${cx * 16}px, ${cy * 10}px)`;
      if (asterisk)  asterisk.style.transform  = `translate(${cx * 22}px, ${cy * 12}px) rotate(${cx * 20}deg)`;
    }, { passive: true });
  }

  // ---------- Parallax on scroll (marquee + footer big text) ----------
  const marquee = document.querySelector(".marquee__track");
  const footerBig = document.querySelector(".footer__big");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (footerBig) footerBig.style.transform = `translateX(${-y * 0.06}px)`;
  }, { passive: true });

  // ---------- Filters ----------
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".work-card");
  filters.forEach(f => f.addEventListener("click", () => {
    filters.forEach(x => x.classList.remove("is-active"));
    f.classList.add("is-active");
    const sel = f.dataset.filter;
    cards.forEach(c => {
      const ok = sel === "all" || c.dataset.category === sel;
      c.classList.toggle("is-hidden", !ok);
    });
  }));

  // ---------- Copy email ----------
  const copyBtn = document.getElementById("copyEmailBtn");
  const emailText = document.getElementById("emailText");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        const prev = emailText.textContent;
        emailText.textContent = `copied — ${email}`;
        setTimeout(() => { emailText.textContent = prev; }, 2400);
      } catch {
        emailText.textContent = email;
      }
    });
  }
})();
