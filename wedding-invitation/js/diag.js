/**
 * ТИМЧАСОВИЙ діагностичний модуль. У роботі сайту не бере участі:
 * ніде не імпортується, запускається лише вручну з консолі.
 * Після того, як знайдемо причину фризів — файл можна видалити.
 *
 * Запуск: import('/js/diag.js')
 */

const FRAMES = 70;
const REPEATS = 2;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Скільки кадрів браузер видає без будь-якої роботи — стеля середовища. */
async function measureIdle() {
  const gaps = [];
  let last = performance.now();
  await new Promise((done) => {
    const tick = () => {
      const now = performance.now();
      gaps.push(now - last);
      last = now;
      if (gaps.length < 60) requestAnimationFrame(tick);
      else done();
    };
    requestAnimationFrame(tick);
  });
  const s = gaps.slice(5).sort((a, b) => a - b);
  return +s[Math.floor(s.length / 2)].toFixed(1);
}

/** Медіана часу кадру під час прокрутки сторінки вгору-вниз. */
async function measureScroll() {
  const maxY = document.body.scrollHeight - window.innerHeight;
  window.scrollTo({ top: 200, behavior: "instant" });
  await sleep(350);

  const gaps = [];
  let last = performance.now();
  let y = 200;
  let dir = 1;

  await new Promise((done) => {
    const tick = () => {
      const now = performance.now();
      gaps.push(now - last);
      last = now;
      y += dir * 16;
      if (y > maxY - 200) dir = -1;
      if (y < 200) dir = 1;
      window.scrollTo({ top: y, behavior: "instant" });
      if (gaps.length < FRAMES) requestAnimationFrame(tick);
      else done();
    };
    requestAnimationFrame(tick);
  });

  const s = gaps.slice(5).sort((a, b) => a - b);
  return +s[Math.floor(s.length / 2)].toFixed(1);
}

/** Вимикачі — кожен повертає функцію, що вертає все як було. */
function cssOff(css) {
  return () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  };
}

function hide(selector) {
  return () => {
    const els = [...document.querySelectorAll(selector)];
    const prev = els.map((e) => e.style.display);
    els.forEach((e) => {
      e.style.display = "none";
    });
    return () => els.forEach((e, i) => {
      e.style.display = prev[i];
    });
  };
}

const NO_SHADOWS = cssOff("*,*::before,*::after{box-shadow:none!important;}");
const NO_PROMOTION = cssOff("*{will-change:auto!important;}");
const NO_BLUR = cssOff(".lang-switcher{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}");
const NO_FILTERS = cssOff("*{filter:none!important;}");
const NO_IMAGES = cssOff("img{visibility:hidden!important;}");
const NO_GRADIENTS = cssOff("*{background-image:none!important;}");

const CONFIGS = [
  ["базовий стан", () => () => {}],
  ["без box-shadow", NO_SHADOWS],
  ["без will-change (35 шарів)", NO_PROMOTION],
  ["без backdrop-filter", NO_BLUR],
  ["без filter/drop-shadow", NO_FILTERS],
  ["без градієнтів", NO_GRADIENTS],
  ["без картинок", NO_IMAGES],
  ["без частинок", hide("[data-ambient-host]")],
  ["без гірлянди", hide("#garland-overlay")],
  ["без фото-віджета", hide(".photo-deck-wrap")],
];

async function run() {
  const main = document.getElementById("screen-main");
  const envelope = document.getElementById("screen-envelope");
  if (main?.classList.contains("hidden")) {
    main.classList.remove("hidden");
    if (envelope) envelope.style.display = "none";
    document.body.style.overflow = "";
    window.dispatchEvent(new Event("resize"));
    await sleep(2200);
  }

  const idle = await measureIdle();
  console.log(
    `%cСтеля браузера без роботи: ${idle} мс/кадр (${(1000 / idle).toFixed(0)} fps)`,
    "font-size:14px;color:#c45c6a"
  );
  if (idle > 25) {
    console.warn(
      "Увага: браузер і так видає мало кадрів навіть без навантаження — " +
        "результати нижче будуть недостовірні. Закрийте DevTools в окреме вікно або інші важкі вкладки."
    );
  }

  const rows = [];
  for (const [label, makeToggle] of CONFIGS) {
    const samples = [];
    for (let i = 0; i < REPEATS; i++) {
      const restore = makeToggle();
      await sleep(250);
      samples.push(await measureScroll());
      restore();
      await sleep(250);
    }
    const best = Math.min(...samples);
    rows.push({ "що вимкнено": label, "мс/кадр": best, fps: +(1000 / best).toFixed(1) });
    console.log(`  ${label}: ${best} мс`);
  }

  const base = rows[0]["мс/кадр"];
  rows.forEach((r) => {
    r["виграш, мс"] = +(base - r["мс/кадр"]).toFixed(1);
  });

  const ranked = rows.slice(1).sort((a, b) => b["виграш, мс"] - a["виграш, мс"]);
  console.table([rows[0], ...ranked]);

  const text = [
    `стеля без роботи: ${idle} мс`,
    `базовий стан:     ${base} мс`,
    "",
    ...ranked.map(
      (r) => `${String(r["виграш, мс"]).padStart(6)} мс виграш  —  ${r["що вимкнено"]}`
    ),
  ].join("\n");

  console.log(text);
  // copy() існує лише в контексті консолі, не в модулі — тому віддаємо результат назовні
  window.__diagResult = text;
  console.log(
    "%c▶ Тепер виконайте в консолі:  copy(__diagResult)  — і вставте в чат",
    "color:green;font-size:14px"
  );
  return text;
}

run();

export default run;
