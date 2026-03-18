/* ── NAV ── */
const SIZE = 170;
const TRI = [
  [0, 0],
  [SIZE, 0],
  [SIZE, SIZE],
];
const SQ = [
  [0, 0],
  [SIZE, 0],
  [SIZE, SIZE],
  [0, SIZE],
];
const navSvg = document.getElementById("nav-svg");
const navPoly = document.getElementById("nav-poly");
const navLinks = document.getElementById("nav-links");
const navWrap = document.getElementById("nav-wrap");
let isOpen = false,
  isNavVisible = false,
  animating = false;

function setPts(pts) {
  navPoly.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
}

/* ── NAV INTRO ── */
setTimeout(() => {
  openNav();
  setTimeout(closeNav, 2000);
}, 500);

navPoly.addEventListener("mouseenter", () => {
  if (!animating && !isOpen) openNav();
});
navWrap.addEventListener("mouseleave", () => {
  if (!animating && isOpen) closeNav();
});
navWrap.addEventListener("click", () => {
  if (!animating && !isOpen) openNav();
  if (!animating && isOpen) closeNav();
});
document
  .querySelectorAll("#nav-links a")
  .forEach((a) => a.addEventListener("click", () => closeNav()));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) closeNav();
});

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;

function morph(from, to, ms, fn, done) {
  const a = [...from],
    b = [...to];
  while (a.length < b.length) a.push([...a[a.length - 1]]);
  while (b.length < a.length) b.push([...b[b.length - 1]]);
  const t0 = performance.now();
  animating = true;
  function tick(now) {
    const raw = Math.min((now - t0) / ms, 1),
      e = fn(raw);
    setPts(
      a.map((p, i) => [
        p[0] + (b[i][0] - p[0]) * e,
        p[1] + (b[i][1] - p[1]) * e,
      ])
    );
    if (raw < 1) requestAnimationFrame(tick);
    else {
      animating = false;
      if (done) done();
    }
  }
  requestAnimationFrame(tick);
}

function openNav() {
  isOpen = true;
  navWrap.style.pointerEvents = "auto";
  morph(TRI, SQ, 550, easeOut, () => navLinks.classList.add("show"));
}
function closeNav() {
  isOpen = false;
  animating = true;
  navLinks.classList.remove("show");
  setTimeout(
    () =>
      morph(SQ, TRI, 400, easeIn, () => {
        navWrap.style.pointerEvents = "";
      }),
    180
  );
}

/* ── CAREER ARC PATH ── */
const DASH = 2000;
const arcSection = document.querySelector(".arc-section");
const allPaths = document.querySelectorAll(".path-main, .path-shadow");

function updatePath() {
  const rect = arcSection.getBoundingClientRect();
  const winH = window.innerHeight,
    secH = arcSection.offsetHeight;
  const progress = Math.min(
    1,
    Math.max(0, Math.max(0, winH - rect.top) / (secH + winH))
  );
  const offset = DASH * (1 - progress);
  allPaths.forEach((p) => {
    p.style.strokeDasharray = DASH;
    p.style.strokeDashoffset = offset;
  });
}
window.addEventListener("scroll", updatePath, { passive: true });
updatePath();

/* ── ARC FADE-IN ── */
const nodes = [0, 1, 2, 3].map((i) => document.getElementById("node-" + i));
const arcObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      const idx = parseInt(entry.target.dataset.index);
      if (!isNaN(idx) && nodes[idx])
        setTimeout(() => nodes[idx].classList.add("visible"), 200);
    });
  },
  { threshold: 0.25 }
);
document
  .querySelectorAll(".arc-stop, .arc-role")
  .forEach((el) => arcObserver.observe(el));

/* ── SECTION HEADER ANIMATION ── */
document.querySelectorAll(".section-header").forEach((header) => {
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        header.classList.add("animated");
        obs.disconnect();
      }
    },
    { threshold: 0.5 }
  );
  obs.observe(header);
});

/* ── KOICHA DRAG REVEAL ── */
const stage = document.getElementById("koicha-stage");
const card = document.getElementById("koicha-card");
const screenshots = document.getElementById("koicha-screenshots");
const dragHint = document.getElementById("drag-hint");
const dots = document.querySelectorAll(".koicha-dot");

const CARD_WIDTH = 499;
const MAX_DRAG = CARD_WIDTH - 80;
const SCREENSHOT_W = 615;

let isDragging = false;
let startX = 0;
let currentX = 0;
let cardOffset = 0;
let hasInteracted = false;
let activeScreenshot = 0;

function setCardOffset(offset) {
  const clamped = Math.max(-MAX_DRAG, Math.min(0, offset));
  cardOffset = clamped;
  card.style.transform = `translateX(${clamped}px)`;

  const ratio = Math.abs(clamped) / MAX_DRAG;
  screenshots.style.transform = `translateX(${clamped * 0.6}px)`;

  const idx = Math.min(2, Math.floor(ratio * 3));
  if (idx !== activeScreenshot) {
    activeScreenshot = idx;
    updateDots(idx);
  }
}

function updateDots(idx) {
  dots.forEach((d, i) => d.classList.toggle("active", i === idx));
}

// Mouse events
card.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX - cardOffset;
  stage.style.cursor = "grabbing";
  if (!hasInteracted) {
    hasInteracted = true;
    dragHint.classList.add("hidden");
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  setCardOffset(e.clientX - startX);
});

window.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  stage.style.cursor = "grab";
  if (cardOffset < -MAX_DRAG / 2) {
    snapTo(-MAX_DRAG);
  } else {
    snapTo(0);
  }
});

// Touch events
card.addEventListener(
  "touchstart",
  (e) => {
    isDragging = true;
    startX = e.touches[0].clientX - cardOffset;
    if (!hasInteracted) {
      hasInteracted = true;
      dragHint.classList.add("hidden");
    }
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    setCardOffset(e.touches[0].clientX - startX);
  },
  { passive: true }
);

window.addEventListener("touchend", () => {
  if (!isDragging) return;
  isDragging = false;
  if (cardOffset < -MAX_DRAG / 2) snapTo(-MAX_DRAG);
  else snapTo(0);
});

function snapTo(target) {
  const start = cardOffset;
  const diff = target - start;
  const t0 = performance.now();
  const dur = 300;
  function snap(now) {
    const t = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    setCardOffset(start + diff * e);
    if (t < 1) requestAnimationFrame(snap);
  }
  requestAnimationFrame(snap);
}

// Dot click navigation
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const idx = parseInt(dot.dataset.idx);
    const target = -(idx / 2) * MAX_DRAG;
    snapTo(target);
  });
});

// Stage height
stage.style.height = "420px";
