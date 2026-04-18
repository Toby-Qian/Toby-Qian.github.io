const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const body = document.body;
const year = document.getElementById("year");
const filters = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");
const typingText = document.getElementById("typingText");
const contactForm = document.getElementById("contactForm");
const formResponse = document.getElementById("formResponse");
const copyEmailBtn = document.getElementById("copyEmailBtn");

const rotatePhrases = [
  "This is Toby Qian's online space for projects, ideas, and experiments.",
  "A clean personal website built to grow over time.",
  "Ready for future additions like a blog, guestbook, or richer interaction."
];

const savedTheme = localStorage.getItem("personal-site-theme");

function applyTheme(theme) {
  if (theme === "light") {
    body.setAttribute("data-theme", "light");
    themeLabel.textContent = "Day";
  } else {
    body.removeAttribute("data-theme");
    themeLabel.textContent = "Night";
  }
}

function cycleTypingText() {
  let phraseIndex = 0;

  setInterval(() => {
    phraseIndex = (phraseIndex + 1) % rotatePhrases.length;
    typingText.textContent = rotatePhrases[phraseIndex];
  }, 3200);
}

themeToggle.addEventListener("click", () => {
  const nextTheme = body.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  localStorage.setItem("personal-site-theme", nextTheme);
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const shouldShow = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const visitorName = document.getElementById("visitorName").value.trim();
  const visitorMessage = document.getElementById("visitorMessage").value.trim();

  if (!visitorName || !visitorMessage) {
    formResponse.textContent = "先填写名字和内容，这里会模拟一次前端互动反馈。";
    return;
  }

  formResponse.textContent = `收到一条来自 ${visitorName} 的消息：${visitorMessage}`;
  contactForm.reset();
});

copyEmailBtn.addEventListener("click", async () => {
  const email = copyEmailBtn.dataset.email;

  try {
    await navigator.clipboard.writeText(email);
    formResponse.textContent = "邮箱已经复制到剪贴板了。";
  } catch (error) {
    formResponse.textContent = `复制失败，你也可以手动发送到 ${email}`;
  }
});

applyTheme(savedTheme || "dark");
year.textContent = new Date().getFullYear();
cycleTypingText();
