import { t, getLocale } from "./i18n.js";

function buildProgramList() {
  const list = document.getElementById("program-list");
  if (!list) return;

  const locale = getLocale();
  const items = locale?.program?.items ?? [];
  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = `program-item program-item--${index % 2 === 0 ? "right" : "left"}`;
    li.dataset.index = String(index);

    const time = document.createElement("span");
    time.className = "program-item__time";
    time.textContent = item.time;

    const spacer = document.createElement("span");
    spacer.className = "program-item__spacer";
    spacer.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "program-item__text";

    const heading = document.createElement("h3");
    heading.className = "program-item__title";
    heading.textContent = item.title ?? item.text ?? "";
    text.appendChild(heading);

    if (item.desc) {
      const desc = document.createElement("p");
      desc.className = "program-item__desc";
      desc.textContent = item.desc;
      text.appendChild(desc);
    }

    li.append(time, spacer, text);
    list.appendChild(li);
  });
}

function buildZigzagPath(itemCount, height, centerX, amplitude) {
  const segment = height / Math.max(itemCount, 1);
  let d = `M ${centerX} 0`;
  for (let i = 0; i < itemCount; i++) {
    const yMid = segment * i + segment * 0.5;
    const yEnd = segment * (i + 1);
    const x = i % 2 === 0 ? centerX - amplitude : centerX + amplitude;
    d += ` Q ${x} ${yMid} ${centerX} ${yEnd}`;
  }
  return d;
}

function layoutPath() {
  const timeline = document.getElementById("program-timeline");
  const pathEl = document.getElementById("program-path");
  const svg = document.getElementById("program-path-svg");
  const items = document.querySelectorAll(".program-item");

  if (!timeline || !pathEl || !svg || !items.length) return null;

  const lastItem = items[items.length - 1];
  const totalHeight = lastItem.offsetTop + lastItem.offsetHeight + 20;
  timeline.style.minHeight = `${totalHeight}px`;

  const mobile = window.matchMedia("(max-width: 640px)").matches;
  const svgWidth = mobile ? 112 : 240;
  const centerX = svgWidth / 2;
  const amplitude = mobile ? 28 : 56;

  svg.setAttribute("width", String(svgWidth));
  svg.setAttribute("height", String(totalHeight));
  svg.style.height = `${totalHeight}px`;

  const d = buildZigzagPath(items.length, totalHeight, centerX, amplitude);
  pathEl.setAttribute("d", d);

  return { pathEl, totalHeight, svg, centerX, svgWidth };
}

let revealObserver = null;

function initScrollReveal() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { root: null, rootMargin: "-10% 0px -25% 0px", threshold: 0.15 }
  );

  document.querySelectorAll(".program-item__text").forEach((el) => {
    revealObserver.observe(el);
  });
}

export function initProgramTimeline() {
  buildProgramList();
  const heart = document.getElementById("program-heart");
  const timeline = document.getElementById("program-timeline");
  let pathData = null;
  let pathLength = 0;
  let rafId = null;
  let lastLength = -1;
  let resizeTimer = null;

  const updateHeart = () => {
    if (!pathData || !heart || !timeline) return;

    const { pathEl, centerX } = pathData;
    pathLength = pathEl.getTotalLength();
    if (!pathLength) return;

    const rect = timeline.getBoundingClientRect();
    const range = rect.height;
    if (range <= 0) return;

    // Лише viewport-координати — стабільніше на iOS zoom / overscroll
    const vv = window.visualViewport;
    const viewportCenter = vv ? vv.offsetTop + vv.height * 0.5 : window.innerHeight * 0.5;

    let progress = (viewportCenter - rect.top) / range;
    progress = Math.max(0, Math.min(1, progress));

    // На краях фіксуємо — менше смикання при дальшому скролі
    if (progress <= 0.002) progress = 0;
    if (progress >= 0.998) progress = 1;

    const length = progress * pathLength;

    // На краях не оновлюємо DOM без потреби
    if (
      (progress === 0 || progress === 1) &&
      lastLength >= 0 &&
      Math.abs(length - lastLength) < 0.5
    ) {
      return;
    }
    lastLength = length;

    const point = pathEl.getPointAtLength(length);
    heart.style.left = `calc(50% + ${point.x - centerX}px)`;
    heart.style.top = `${point.y}px`;
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateHeart();
      rafId = null;
    });
  };

  const relayout = () => {
    lastLength = -1;
    pathData = layoutPath();
    if (pathData?.pathEl) {
      pathLength = pathData.pathEl.getTotalLength();
      updateHeart();
    }
  };

  relayout();
  initScrollReveal();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.visualViewport?.addEventListener("scroll", onScroll, { passive: true });
  window.visualViewport?.addEventListener("resize", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 150);
  });

  updateHeart();
}

export function rebuildProgram() {
  buildProgramList();
  const timeline = document.getElementById("program-timeline");
  if (timeline) {
    layoutPath();
    document.querySelectorAll(".program-item__text").forEach((el) => {
      el.classList.remove("is-visible");
    });
    initScrollReveal();
  }
}
