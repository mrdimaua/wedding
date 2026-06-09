const BASE = "images/dimalena/";
const PREFIX = "photo";
const MAX_PHOTOS = 10;
const MAX_VISIBLE = 3;
const EXTS = ["jpeg", "jpg", "png", "webp", "svg"];

// Зсуви/нахили для кожного "шару" стопки (видимо максимум 3)
const DEPTHS = [
  { x: 0, y: 0, rot: -2, scale: 1 },
  { x: 18, y: 14, rot: 4.5, scale: 0.965 },
  { x: -16, y: 26, rot: -6.5, scale: 0.93 },
];

let initialized = false;

function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function findPhoto(i) {
  for (const ext of EXTS) {
    const url = `${BASE}${PREFIX}${i}.${ext}`;
    // eslint-disable-next-line no-await-in-loop
    if (await imageExists(url)) return url;
  }
  return null;
}

async function detectPhotos() {
  const urls = [];
  for (let i = 1; i <= MAX_PHOTOS; i++) {
    // eslint-disable-next-line no-await-in-loop
    const url = await findPhoto(i);
    if (!url) break;
    urls.push(url);
  }
  return urls;
}

function preloadFirst(urls) {
  if (!urls.length) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = urls[0];
  });
}

function showState(state) {
  const loader = document.getElementById("photo-deck-loader");
  const deck = document.getElementById("photo-deck");
  if (loader) loader.hidden = state !== "loader";
  if (deck) deck.hidden = state !== "deck";
}

function buildDeck(urls) {
  const deck = document.getElementById("photo-deck");
  const hint = document.getElementById("photo-deck-hint");
  if (!deck) return;

  if (!urls.length) {
    showState("none");
    if (hint) hint.hidden = true;
    return;
  }

  deck.innerHTML = "";

  const cards = urls.map((url, idx) => {
    const fig = document.createElement("figure");
    fig.className = "photo-card";
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Дмитро & Елена ${idx + 1}`;
    img.draggable = false;
    img.loading = idx === 0 ? "eager" : "lazy";
    fig.appendChild(img);
    deck.appendChild(fig);
    return fig;
  });

  const visible = Math.min(MAX_VISIBLE, cards.length);
  let order = cards.slice();

  function render() {
    order.forEach((card, depth) => {
      const d = DEPTHS[Math.min(depth, DEPTHS.length - 1)];
      card.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${d.scale})`;
      card.style.zIndex = String(order.length - depth);
      card.style.opacity = depth < visible ? "1" : "0";
      card.classList.toggle("is-top", depth === 0);
    });
  }

  function advance() {
    if (order.length < 2) return;
    order.push(order.shift());
    render();
  }

  const multiple = cards.length > 1;
  deck.classList.toggle("is-interactive", multiple);

  if (multiple) {
    deck.addEventListener("click", advance);
    deck.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    });
  } else {
    deck.removeAttribute("role");
    deck.removeAttribute("tabindex");
  }

  if (hint) hint.hidden = !multiple;

  render();
  showState("deck");
}

export function initPhotoStack() {
  if (initialized) return;
  initialized = true;

  showState("loader");
  detectPhotos()
    .then(async (urls) => {
      await preloadFirst(urls);
      buildDeck(urls);
    })
    .catch((err) => {
      console.error("Photo deck error:", err);
      showState("none");
      const hint = document.getElementById("photo-deck-hint");
      if (hint) hint.hidden = true;
    });
}
