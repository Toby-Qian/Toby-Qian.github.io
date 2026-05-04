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

  /* ---------- Cursor follower ---------- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
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

  /* ---------- Hero parallax ---------- */
  const mascot = document.querySelector(".mascot");
  const title = document.querySelector(".hero__title");
  const isCoarse = matchMedia("(hover: none), (max-width: 900px)").matches;
  if (!isCoarse) {
    window.addEventListener("mousemove", (e) => {
      const cx = e.clientX / innerWidth - 0.5;
      const cy = e.clientY / innerHeight - 0.5;
      if (mascot) mascot.style.transform = `translate(${cx * 14}px, ${cy * 10}px)`;
      if (title)  title.style.transform  = `translate(${cx * -8}px, ${cy * -5}px)`;
    }, { passive: true });
  }
})();
