const BASE = "images/dimalena/";
const PREFIX = "photo";
const MAX_PHOTOS = 10;
const EXTS = ["jpeg", "jpg", "png", "webp", "svg"];

// Зсуви для кожного шару стопки — стільки, скільки фото в папці
function buildDepths(count) {
  if (count <= 0) return [];
  const spread = count <= 4 ? 1 : 4 / count;
  const depths = [{ x: 0, y: 0, rot: -2, scale: 1 }];

  for (let i = 1; i < count; i++) {
    const side = i % 2 === 1 ? 1 : -1;
    depths.push({
      x: side * (14 + (i - 1) * 3) * spread,
      y: i * 8 * spread,
      rot: side * (4 + (i - 1) * 1.5) * spread,
      scale: Math.max(0.8, 1 - i * 0.012),
    });
  }
  return depths;
}

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

  const depths = buildDepths(cards.length);
  let order = cards.slice();

  // Місце під виступаючі кути нижніх карток
  deck.style.paddingBottom = `${Math.max(0, (cards.length - 1) * 5)}px`;

  function render() {
    order.forEach((card, depth) => {
      const d = depths[Math.min(depth, depths.length - 1)];
      card.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${d.scale})`;
      card.style.zIndex = String(order.length - depth);
      card.style.opacity = "1";
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
