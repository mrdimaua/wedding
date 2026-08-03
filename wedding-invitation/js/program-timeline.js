import { t, getLocale } from "./i18n.js";
import { createCopyButton } from "./copy.js";
import { createMapButton } from "./map-link.js";

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

    if (item.address) {
      const addressRow = document.createElement("div");
      addressRow.className = "program-item__address copy-row";

      const addressId = `program-item-address-${index}`;
      const address = document.createElement("span");
      address.className = "program-item__address-text";
      address.id = addressId;
      address.textContent = item.address;

      const copyBtn = createCopyButton({
        targetId: addressId,
        ariaLabel: t("restaurant.copy"),
      });

      addressRow.append(address, copyBtn);

      const mapBtn = createMapButton({
        query: item.map ?? item.address,
        label: item.address,
        ariaLabel: t("program.navigate"),
      });
      if (mapBtn) addressRow.appendChild(mapBtn);

      text.appendChild(addressRow);
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

function getSmoothFactor() {
  return window.matchMedia("(max-width: 640px)").matches ? 0.085 : 0.13;
}

function getScrollProgress(timeline) {
  const rect = timeline.getBoundingClientRect();
  const range = rect.height;
  if (range <= 0) return 0;

  const vv = window.visualViewport;
  const viewportCenter = vv ? vv.offsetTop + vv.height * 0.5 : window.innerHeight * 0.5;

  return Math.max(0, Math.min(1, (viewportCenter - rect.top) / range));
}

export function initProgramTimeline() {
  buildProgramList();
  const heart = document.getElementById("program-heart");
  const timeline = document.getElementById("program-timeline");
  let pathData = null;
  let pathLength = 0;
  let currentLength = 0;
  let targetLength = 0;
  let glideRaf = null;
  let resizeTimer = null;

  const applyHeartAtLength = (length) => {
    if (!pathData || !heart) return;

    const { pathEl, centerX } = pathData;
    const point = pathEl.getPointAtLength(length);
    // Composited transform only: left/top would force a layout pass every frame.
    heart.style.transform = `translate(-50%, -50%) translate3d(${
      point.x - centerX
    }px, ${point.y}px, 0)`;
  };

  const glide = () => {
    const delta = targetLength - currentLength;

    if (Math.abs(delta) < 0.35) {
      currentLength = targetLength;
    } else {
      currentLength += delta * getSmoothFactor();
    }

    applyHeartAtLength(currentLength);

    if (Math.abs(targetLength - currentLength) >= 0.35) {
      glideRaf = requestAnimationFrame(glide);
    } else {
      glideRaf = null;
    }
  };

  const syncTarget = () => {
    if (!pathData || !heart || !timeline) return;

    pathLength = pathData.pathEl.getTotalLength();
    if (!pathLength) return;

    targetLength = getScrollProgress(timeline) * pathLength;

    if (!glideRaf) {
      glideRaf = requestAnimationFrame(glide);
    }
  };

  const relayout = () => {
    pathData = layoutPath();
    if (!pathData?.pathEl || !timeline) return;

    pathLength = pathData.pathEl.getTotalLength();
    const length = getScrollProgress(timeline) * pathLength;
    currentLength = length;
    targetLength = length;
    applyHeartAtLength(currentLength);
  };

  relayout();
  initScrollReveal();

  window.addEventListener("scroll", syncTarget, { passive: true });
  window.visualViewport?.addEventListener("scroll", syncTarget, { passive: true });
  window.visualViewport?.addEventListener("resize", syncTarget, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 150);
  });

  syncTarget();
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
