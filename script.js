const qs  = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

const FORMSPREE_URL = "https://formspree.io/f/xlgkrqzq";

const steps = [0, 1, 2, 3].map(n => qs(`#step-${n}`));

const showStep = (n) => {
  steps.forEach(s => s.classList.add("hidden"));
  steps[n].classList.remove("hidden");
};

// ---- Step 0 ----
const yesBtn = qs(".yes-btn");
const noBtn  = qs(".no-btn");

yesBtn.addEventListener("click", () => showStep(1));

const handleNoMouseOver = () => {
  noBtn.style.position = "fixed";
  noBtn.style.margin   = "0";
  const { width, height } = noBtn.getBoundingClientRect();
  noBtn.style.left = `${Math.floor(Math.random() * (window.innerWidth  - width))}px`;
  noBtn.style.top  = `${Math.floor(Math.random() * (window.innerHeight - height))}px`;
};

noBtn.addEventListener("mouseover", handleNoMouseOver);

// ---- Step 1 → 2 ----
const dateInput = qs("#dateInput");
const timeInput = qs("#timeInput");

qs("#toStep2Btn").addEventListener("click", () => {
  if (!dateInput.value) {
    dateInput.classList.add("error");
    dateInput.focus();
    return;
  }
  showStep(2);
});

dateInput.addEventListener("input", () => dateInput.classList.remove("error"));

// ---- Step 2 → 3 ----
const customWishes = qs("#customWishes");
const selected = new Set();

qsa(".activity-card").forEach(card => {
  card.addEventListener("click", () => {
    const a = card.dataset.activity;
    selected.has(a) ? selected.delete(a) : selected.add(a);
    card.classList.toggle("selected");
  });
});

qs("#toStep3Btn").addEventListener("click", () => {
  if (selected.size === 0) return;

  const date    = new Date(dateInput.value + "T12:00:00");
  const dateStr = date.toLocaleDateString("ru-RU", {
    weekday: "long", month: "long", day: "numeric",
  });

  const timeStr = timeInput.value ? ` в ${timeInput.value}` : "";

  const activitiesStr = [...selected].join(", ");
  const fullDate      = dateStr + timeStr;
  const wishes        = customWishes.value.trim();

  qs("#confirmSubtitle").textContent = timeStr
    ? `${timeInput.value} — зафиксировано и заскринено. назад дороги нет.`
    : "зафиксировано и заскринено. назад дороги нет.";
  qs("#confirmWhen").textContent       = fullDate;
  qs("#confirmActivities").textContent = activitiesStr;

  const wishesRow = qs("#confirmWishesRow");
  if (wishes) {
    qs("#confirmWishes").textContent = wishes;
    wishesRow.classList.remove("hidden");
  } else {
    wishesRow.classList.add("hidden");
  }

  fetch(FORMSPREE_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body:    JSON.stringify({ date: fullDate, activities: activitiesStr, wishes: wishes || "—" }),
  }).catch(() => {});

  showStep(3);
});

// ---- Step 3: Copy ----
qs("#copyBtn").addEventListener("click", () => {
  const wishes = qs("#confirmWishes").textContent;
  const wishesLine = wishes ? `\nТакже: ${wishes}` : "";
  const text = `Это свидание! 🎉\nКогда: ${qs("#confirmWhen").textContent}\nАктивности: ${qs("#confirmActivities").textContent}${wishesLine}`;
  navigator.clipboard.writeText(text).then(() => {
    qs("#copyFeedback").classList.remove("hidden");
    qs("#copyBtn").textContent = "✓ скопировано!";
  });
});
