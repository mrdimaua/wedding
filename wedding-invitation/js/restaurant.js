const BASE = "images/restaurant/";
const MAX_PHOTOS = 10;
const EXTS = ["jpg", "jpeg", "png", "webp", "svg"];
const AUTOPLAY_MS = 5000;

let initialized = false;

/* ---------- Копіювання ---------- */

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback для старих браузерів / file://
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function initCopyButtons() {
  document.querySelectorAll(".copy-btn[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target) return;
      const text = (target.textContent || "").trim();

      try {
        await copyText(text);
      } catch {
        return;
      }

      btn.classList.add("is-copied");

      clearTimeout(btn._copyTimer);
      btn._copyTimer = setTimeout(() => {
        btn.classList.remove("is-copied");
      }, 1500);
    });
  });
}

/* ---------- Визначення фото в папці ---------- */

function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function findPhotoForIndex(i) {
  for (const ext of EXTS) {
    const url = `${BASE}${i}.${ext}`;
    // eslint-disable-next-line no-await-in-loop
    if (await imageExists(url)) return url;
  }
  return null;
}

async function detectPhotos() {
  const urls = [];
  for (let i = 1; i <= MAX_PHOTOS; i++) {
    // eslint-disable-next-line no-await-in-loop
    const url = await findPhotoForIndex(i);
    if (!url) break;
    urls.push(url);
  }
  return urls;
}

/* ---------- Карусель ---------- */

// Показуємо РІВНО один елемент: "loader" | "carousel" | "none"
function showState(state) {
  const loader = document.getElementById("restaurant-loader");
  const carousel = document.getElementById("restaurant-carousel");
  if (loader) loader.hidden = state !== "loader";
  if (carousel) carousel.hidden = state !== "carousel";
}

function preloadFirst(urls) {
  // Чекаємо завантаження першого фото, щоб не показувати порожній слайд
  if (!urls.length) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = urls[0];
  });
}

function buildCarousel(urls) {
  const carousel = document.getElementById("restaurant-carousel");
  const track = document.getElementById("carousel-track");
  const dotsWrap = document.getElementById("carousel-dots");
  if (!carousel || !track || !dotsWrap) return;

  if (!urls.length) {
    showState("none");
    return;
  }

  showState("carousel");
  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  urls.forEach((url, idx) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Castel Transilvania ${idx + 1}`;
    img.loading = idx === 0 ? "eager" : "lazy";
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `${idx + 1}`);
    dot.addEventListener("click", () => goTo(idx));
    dotsWrap.appendChild(dot);
  });

  const single = urls.length === 1;
  carousel.classList.toggle("single", single);

  let current = 0;
  let autoTimer = null;
  const total = urls.length;

  function render() {
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("is-active", i === current);
    });
  }

  function goTo(i) {
    current = (i + total) % total;
    render();
    restartAuto();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function restartAuto() {
    if (single || reduceMotion) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTOPLAY_MS);
  }

  carousel.querySelector(".carousel-prev")?.addEventListener("click", prev);
  carousel.querySelector(".carousel-next")?.addEventListener("click", next);

  carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
  carousel.addEventListener("mouseleave", restartAuto);

  // Свайп на тачі
  let startX = 0;
  let dragging = false;
  const viewport = carousel.querySelector(".carousel-viewport");
  viewport?.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      dragging = true;
      clearInterval(autoTimer);
    },
    { passive: true }
  );
  viewport?.addEventListener(
    "touchend",
    (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next();
        else prev();
      }
      restartAuto();
    },
    { passive: true }
  );

  render();
  restartAuto();
}

export function initRestaurant() {
  if (initialized) return;
  initialized = true;

  initCopyButtons();

  showState("loader");
  detectPhotos()
    .then(async (urls) => {
      await preloadFirst(urls);
      buildCarousel(urls);
    })
    .catch((err) => {
      console.error("Restaurant carousel error:", err);
      showState("none");
    });
}
