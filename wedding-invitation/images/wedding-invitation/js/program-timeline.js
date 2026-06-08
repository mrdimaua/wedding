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

  return { pathEl, totalHeight, svg };
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

  const updateHeart = () => {
    if (!pathData || !heart) return;

    const { pathEl } = pathData;
    pathLength = pathEl.getTotalLength();
    if (!pathLength) return;

    const rect = timeline.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;

    const sectionTop = window.scrollY + rect.top;
    const sectionBottom = sectionTop + rect.height;
    const scrollCenter = window.scrollY + viewportCenter;

    const progress = (scrollCenter - sectionTop) / (sectionBottom - sectionTop);
    const clamped = Math.max(0, Math.min(1, progress));
    const length = clamped * pathLength;

    const point = pathEl.getPointAtLength(length);
    const svg = document.getElementById("program-path-svg");
    const svgRect = svg.getBoundingClientRect();

    const x = svgRect.left + point.x;
    const y = svgRect.top + point.y;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateHeart();
      rafId = null;
    });
  };

  const relayout = () => {
    pathData = layoutPath();
    if (pathData?.pathEl) {
      pathLength = pathData.pathEl.getTotalLength();
      updateHeart();
    }
  };

  relayout();
  initScrollReveal();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    relayout();
    onScroll();
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
