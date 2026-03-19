// NAV
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

// NAV INTRO
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
// for mobile
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

// CAREER ARC PATH
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

// ARC FADE IN
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
  .querySelectorAll(".arc-stop-title, .arc-stop, .arc-role")
  .forEach((el) => arcObserver.observe(el));

// SECTION HEADER ANIMATION
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

// KOICHA SCREENSHOT NAV
const koichaScreenshots = document.querySelectorAll(".koicha-screenshot");
const koichaPrev = document.getElementById("koicha-prev");
const koichaNext = document.getElementById("koicha-next");
let koichaIdx = 0;

function showScreenshot(idx) {
  koichaScreenshots[koichaIdx].classList.remove("active");
  koichaIdx = idx;
  koichaScreenshots[koichaIdx].classList.add("active");
  koichaPrev.disabled = koichaIdx === 0;
  koichaNext.disabled = koichaIdx === koichaScreenshots.length - 1;
}

koichaPrev.addEventListener("click", () => showScreenshot(koichaIdx - 1));
koichaNext.addEventListener("click", () => showScreenshot(koichaIdx + 1));
showScreenshot(0);
