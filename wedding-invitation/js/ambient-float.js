const ICONS = {
  heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.2-4.6-9.6-8.4C.6 9.8 2.2 6 5.6 5.2c2-.5 3.8.4 4.9 2 1.1-1.6 2.9-2.5 4.9-2 3.4.8 5 4.6 3.2 7.4C19.2 16.4 12 21 12 21z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.2 5.4 5.8.5-4.4 3.8 1.4 5.7L12 15.8 7 17.8l1.4-5.7-4.4-3.8 5.8-.5L12 2.4z"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  ring: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="14" r="4.5"/><circle cx="15" cy="14" r="4.5"/></svg>`,
  petal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-2 4-6 5.5-6 9.5a6 6 0 0 0 12 0C18 8.5 14 7 12 3z"/></svg>`,
  ribbon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4 4 8v4l4-2 4 2V8l-4-4zm8 0 4 4v4l-4-2-4 2V8l4-4zM12 10v10"/></svg>`,
};

const KINDS = [
  "heart",
  "heart",
  "star",
  "star",
  "sparkle",
  "sparkle",
  "ring",
  "petal",
  "petal",
  "ribbon",
];

const COLORS = [
  "#c4a07a",
  "#b89268",
  "#a67c6a",
  "#d4b48a",
  "#9a8575",
  "#c9956e",
  "#d4a5a0",
  "#c9b896",
  "#b8a090",
];

const MOBILE = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
const MAX_ACTIVE = MOBILE ? 14 : 18;
const SPAWN_MIN_MS = MOBILE ? 700 : 800;
const SPAWN_MAX_MS = MOBILE ? 1600 : 1800;

let timer = null;
let active = 0;
let initialized = false;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isHostVisible(host) {
  const screen = host.parentElement;
  if (!screen) return false;
  if (screen.classList.contains("hidden")) return false;
  return getComputedStyle(screen).display !== "none";
}

function getVisibleHosts() {
  return [...document.querySelectorAll("[data-ambient-host]")].filter(isHostVisible);
}

function clearHost(host) {
  const removed = host.childElementCount;
  host.replaceChildren();
  active = Math.max(0, active - removed);
}

function pruneHiddenHosts() {
  document.querySelectorAll("[data-ambient-host]").forEach((host) => {
    if (!isHostVisible(host) && host.childElementCount > 0) {
      clearHost(host);
    }
  });
}

function spawnParticle() {
  pruneHiddenHosts();

  const hosts = getVisibleHosts();
  if (!hosts.length || active >= MAX_ACTIVE) return;

  const host = pick(hosts);
  const kind = pick(KINDS);
  const isRibbon = kind === "ribbon";
  const sizeBoost = MOBILE ? 1.15 : 1;
  const size = (isRibbon ? rand(14, 20) : rand(12, 20)) * sizeBoost;
  const duration = rand(2.8, 5);
  const peak = rand(0.42, 0.72);
  const left = rand(3, 97);
  const top = rand(5, 92);
  const driftX = rand(-28, 28);
  const driftY = rand(-48, -14);
  const spin = rand(-20, 20);

  const el = document.createElement("span");
  el.className = `ambient-particle ambient-particle--${kind}`;
  el.innerHTML = ICONS[kind];
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;

  el.style.left = `${left}%`;
  el.style.top = `${top}%`;
  el.style.color = pick(COLORS);

  active += 1;
  host.appendChild(el);

  const cleanup = () => {
    el.remove();
    active = Math.max(0, active - 1);
  };

  const ms = duration * 1000;
  const endTransform = `translate3d(${driftX}px, ${driftY}px, 0) scale(1.05) rotate(${spin}deg)`;

  if (typeof el.animate === "function") {
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0, 10px, 0) scale(0.5) rotate(0deg)" },
        { opacity: peak, transform: "translate3d(0, 4px, 0) scale(0.9) rotate(0deg)", offset: 0.12 },
        { opacity: peak, transform: `translate3d(${driftX * 0.45}px, ${driftY * 0.45}px, 0) scale(1) rotate(${spin * 0.45}deg)`, offset: 0.75 },
        { opacity: 0, transform: endTransform },
      ],
      { duration: ms, easing: "ease-in-out", fill: "forwards" }
    ).finished.then(cleanup).catch(cleanup);
  } else {
    el.style.opacity = String(peak);
    el.style.transform = endTransform;
    setTimeout(cleanup, ms + 200);
  }
}

function scheduleSpawn() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const count = Math.random() > 0.55 ? 2 : 1;
    for (let i = 0; i < count; i += 1) spawnParticle();
    scheduleSpawn();
  }, rand(SPAWN_MIN_MS, SPAWN_MAX_MS));
}

function stop() {
  clearTimeout(timer);
  timer = null;
  document.querySelectorAll("[data-ambient-host]").forEach((host) => host.replaceChildren());
  active = 0;
}

export function initAmbientFloat() {
  if (initialized) return;
  initialized = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!getVisibleHosts().length) return;

  for (let i = 0; i < 8; i += 1) {
    setTimeout(spawnParticle, i * 250);
  }
  scheduleSpawn();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
    } else if (!timer) {
      scheduleSpawn();
    }
  });
}

export function refreshAmbientFloat() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (!initialized) {
    initAmbientFloat();
    return;
  }

  pruneHiddenHosts();

  for (let i = 0; i < 6; i += 1) {
    setTimeout(spawnParticle, i * 180);
  }

  if (!timer) scheduleSpawn();
}

export function resetAmbientFloat() {
  stop();
  initialized = false;
}
