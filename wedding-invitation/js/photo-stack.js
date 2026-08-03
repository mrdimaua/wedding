const BASE = "images/dimalena/";
const PREFIX = "photo";
const MAX_PHOTOS = 24;
const PROBE_CHUNK = 6;
const VISIBLE_STACK = 4;
const EXTS = ["jpeg", "jpg", "png", "webp", "svg"];

// Фіксовані зсуви для 4 видимих шарів стопки
const STACK_DEPTHS = [
  { x: 0, y: 0, rot: -2, scale: 1 },
  { x: 18, y: 14, rot: 4.5, scale: 0.965 },
  { x: -16, y: 26, rot: -6.5, scale: 0.93 },
  { x: 12, y: 34, rot: 4, scale: 0.91 },
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

// Пробуємо пачками: паралельно (швидко), але зупиняємось на першій дірці —
// інакше сканування до MAX_PHOTOS давало десятки марних 404 на кожному відкритті.
async function detectPhotos() {
  const urls = [];

  for (let start = 1; start <= MAX_PHOTOS; start += PROBE_CHUNK) {
    const size = Math.min(PROBE_CHUNK, MAX_PHOTOS - start + 1);
    // eslint-disable-next-line no-await-in-loop
    const batch = await Promise.all(
      Array.from({ length: size }, (_, k) => findPhoto(start + k))
    );

    const gap = batch.indexOf(null);
    if (gap === -1) {
      urls.push(...batch);
      continue;
    }

    urls.push(...batch.slice(0, gap));
    break;
  }

  return urls;
}

function preloadOne(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  });
}

async function preloadPhotos(urls) {
  if (!urls.length) return;

  const priority = urls.slice(0, VISIBLE_STACK);
  await Promise.all(priority.map(preloadOne));

  // Решту тягнемо по одній, щоб фонове довантаження не забирало канал
  // у того, що користувач бачить прямо зараз.
  void urls.slice(VISIBLE_STACK).reduce(
    (chain, url) => chain.then(() => preloadOne(url)),
    Promise.resolve()
  );
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
    img.loading = idx < VISIBLE_STACK ? "eager" : "lazy";
    fig.appendChild(img);
    deck.appendChild(fig);
    return fig;
  });

  const visibleCount = Math.min(VISIBLE_STACK, cards.length);
  let order = cards.slice();

  deck.style.paddingBottom = `${Math.max(0, (visibleCount - 1) * 5)}px`;

  function render() {
    order.forEach((card, depth) => {
      if (depth < visibleCount) {
        const d = STACK_DEPTHS[depth];
        card.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${d.scale})`;
        card.style.zIndex = String(visibleCount - depth);
        card.style.opacity = "1";
        card.style.visibility = "visible";
        card.classList.toggle("is-top", depth === 0);
      } else {
        card.style.opacity = "0";
        card.style.visibility = "hidden";
        card.style.zIndex = "0";
        card.classList.remove("is-top");
      }
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
      await preloadPhotos(urls);
      buildDeck(urls);
    })
    .catch((err) => {
      console.error("Photo deck error:", err);
      showState("none");
      const hint = document.getElementById("photo-deck-hint");
      if (hint) hint.hidden = true;
    });
}
