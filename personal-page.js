/* Lilac Diary — interactions */
(function () {
  const body = document.body;

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.querySelector(".nav");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (nav) nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    body.classList.remove("menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- NOW rotator ---------- */
  const nowText = document.getElementById("nowText");
  const phrases = [
    "Playing with variable serif faces and tight grids.",
    "Drafting the first issue of a personal press.",
    "Reading about small-web, writing about tools.",
    "Rewriting the about page for the third time."
  ];
  if (nowText) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % phrases.length;
      nowText.style.opacity = "0";
      nowText.style.transform = "translateY(6px)";
      setTimeout(() => {
        nowText.textContent = phrases[i];
        nowText.style.opacity = "1";
        nowText.style.transform = "translateY(0)";
      }, 320);
    }, 4500);
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i * 18, 240)}ms`; });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-in"));
  }

  /* ---------- Scrollspy: highlight nav link of current section ---------- */
  const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    const byId = {};
    navLinks.forEach(a => { byId[a.getAttribute("href").slice(1)] = a; });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const link = byId[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          navLinks.forEach(a => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(byId).forEach(id => {
      const sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- Hero parallax ----------
     Targets the img (not .mascot) so the container's :hover rotate and
     .reveal transition keep working; rAF-throttled. */
  const mascotImg = document.querySelector(".mascot img");
  const title = document.querySelector(".hero__title");
  const isCoarse = matchMedia("(hover: none), (max-width: 900px)").matches;
  if (!isCoarse) {
    let cx = 0, cy = 0, ticking = false;
    window.addEventListener("mousemove", (e) => {
      cx = e.clientX / innerWidth - 0.5;
      cy = e.clientY / innerHeight - 0.5;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (mascotImg) mascotImg.style.transform = `translate(${cx * 14}px, ${cy * 10}px)`;
        if (title)     title.style.transform     = `translate(${cx * -8}px, ${cy * -5}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Busuanzi counter (lazy: only near contact) ---------- */
  const contact = document.getElementById("contact");
  if (contact) {
    let bszLoaded = false;
    const loadBsz = () => {
      if (bszLoaded) return;
      bszLoaded = true;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
      document.body.appendChild(s);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { loadBsz(); io.disconnect(); }
      }, { rootMargin: "600px" });
      io.observe(contact);
    } else {
      loadBsz();
    }
  }

  /* ---------- Gallery lightbox ---------- */
  const gal = document.querySelector(".gal");
  if (gal) {
    const ov = document.createElement("div");
    ov.className = "lightbox";
    ov.innerHTML = "<img alt=\"\" />";
    document.body.appendChild(ov);
    const ovImg = ov.querySelector("img");
    gal.addEventListener("click", (e) => {
      const img = e.target.closest(".gal__ph img");
      if (!img) return;
      ovImg.src = img.currentSrc || img.src;
      ov.classList.add("is-open");
    });
    ov.addEventListener("click", () => ov.classList.remove("is-open"));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") ov.classList.remove("is-open");
    });
  }

  /* ---------- Twikoo guestbook (lazy: load near viewport) ---------- */
  const gb = document.getElementById("guestbook");
  if (gb) {
    let loaded = false;
    const loadTwikoo = () => {
      if (loaded) return;
      loaded = true;
      const s = document.createElement("script");
      s.src = "assets/vendor/twikoo.all.min.js";
      s.onload = () => {
        window.twikoo && twikoo.init({
          envId: "https://toby-twikoo.vercel.app",
          el: "#twikoo",
          lang: "en"
        });
      };
      document.body.appendChild(s);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { loadTwikoo(); io.disconnect(); }
      }, { rootMargin: "400px" });
      io.observe(gb);
    } else {
      ["scroll", "click", "touchstart"].forEach((ev) => {
        window.addEventListener(ev, loadTwikoo, { once: true, passive: true });
      });
    }
  }
})();
