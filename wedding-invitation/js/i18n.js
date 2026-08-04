const SUPPORTED = ["ua", "en", "ro"];
const STORAGE_KEY = "wedding-invite-lang";

/** Вбудований fallback — працює навіть якщо fetch не вдався (file://, офлайн) */
const FALLBACK_LOCALE = {
  meta: { title: "Запрошення — Дмитро & Елена" },
  lang: { ua: "UA", en: "EN", ro: "RO" },
  screen1: {
    invitation_arrived: "Вам надійшло запрошення!",
    tap_envelope: "Натисніть на конверт!",
    updated: "Оновлено",
  },
  screen2: {
    groom_name: "Дмитро",
    bride_name: "Елена",
    and: "♥",
    wedding_date: "8 серпня 2026",
    photos_hint: "Натисніть на фото, щоб погортати",
  },
  invitation: {
    title: "Дорогі друзі та рідні!",
    body: "Із величезною радістю запрошуємо вашу родину розділити з нами один із найважливіших і найщасливіших днів нашого життя — день нашого весілля!\n\nНам буде дуже приємно бачити вас поруч у цей особливий момент. Ми мріємо провести його в колі рідних і близьких людей, разом поділитися радістю, теплими емоціями, щирими посмішками та створити спогади, які залишаться з нами на довгі роки.\n\nЦей день буде наповнений любов'ю, щастям, сміхом і душевною атмосферою, і ми дуже хочемо, щоб ви стали його частиною. Ваша присутність стане для нас найціннішим подарунком і зробить це свято ще особливішим.\n\nЗ нетерпінням чекаємо на зустріч і можливість розділити цей прекрасний день разом\u00a0із\u00a0вами!",
  },
  chat: {
    title: "Чат нашого весілля",
    body: "Ми створили спільний чат у Telegram — там будуть усі свіжі новини про свято. Заходьте, щоб поставити будь-яке питання чи дізнатися актуальну інформацію.\n\nА під час торжества скидайте туди свої фотографії та відео — так ми зберемо разом усі найтепліші кадри цього дня.",
    cta: "Приєднатися до чату",
  },
  program: {
    title: "Програма",
    navigate: "Відкрити в навігаторі",
    items: [
      {
        time: "12:00",
        title: "Зустріч нареченого та нареченої",
        desc: "Зворушлива зустріч молодих та викуп нареченої. Знайомимося, налаштовуємось на свято. Зверніть увагу: у цьому місці обмежені паркувальні місця.",
        address: "Strada George Coșbuc 1",
      },
      {
        time: "14:00",
        title: "Церемонія",
        desc: "Урочиста церемонія просто неба — на чудовому лавандовому полі. Приготуйте хусточки для зворушливого моменту, а далі на нас чекають напої, смачні страви, музика, гарний настрій і багато красивих локацій для фото.",
        address: "Str. Lavandei 16, Groși",
        map: "47.60643, 23.61903",
      },
      {
        time: "16:30",
        title: "Прибуття до ресторану",
        desc: "Спілкуємось на велкам зоні з шампанським. Для вас буде підготовлений план розсадки гостей за столами — знаходимо свої місця та готуємося смачно їсти.",
        address: "Castel Transilvania",
        map: "47.637445, 23.595838",
      },
      {
        time: "17:00",
        title: "Початок паті",
        desc: "Нас чекають веселощі, чудовий ведучий, конкурси та гарний настрій, а також смачна їжа та безлімітні напої.",
      },
      {
        time: "22:00",
        title: "Торт",
        desc: "Сподіваємось і знаємо, що у вас ще будуть сили для святкового торта та подальших танців",
      },
    ],
  },
  countdown: {
    title: "До урочистості залишилось",
    days: "днів",
    hours: "годин",
    minutes: "хвилин",
    seconds: "секунд",
  },
  palette: {
    title: "Стиль та колір весілля",
    description:
      "Ми не хочемо обмежувати вас у виборі святкового вбрання, але для підказки можете орієнтуватися на такі тони:",
    colors: [
      { name: "Білий", hex: "#F6F1E9" },
      { name: "Рожевий", hex: "#F0B8C4" },
      { name: "Червоний", hex: "#C1352F" },
      { name: "Бордовий", hex: "#7A1F38" },
      { name: "Теракота", hex: "#C76B3F" },
      { name: "Золотий", hex: "#E3B23C" },
      { name: "Шавлія", hex: "#93A07A" },
      { name: "Пилувато-блакитний", hex: "#7D91A8" },
    ],
  },
  restaurant: {
    title: "Ресторан",
    name: "Castel Transilvania",
    coordinates: "47.637445, 23.595838",
    copy: "Копіювати",
    copied: "Скопійовано",
  },
  footer: {
    title: "До уваги гостей з дітьми",
    body: "На локації церемонії ми огородили частину території зеленою сіткою. Просимо простежити, щоб діти не заходили за неї та не торкалися самої сітки.\n\nУ ресторані під час першого танцю молодят по підлозі буде йти холодний дим. Будь ласка, потримайте діток біля себе, щоб вони не вибігали в центр залу під час танцю.\n\nЩиро дякуємо за розуміння. Любимо вас!",
    see_you: "До скорої зустрічі",
    back_to_envelope: "Повернутися до запрошення",
  },
  images: {
    photo1: "images/photo1.jpg",
    photo2: "images/photo2.jpg",
  },
};

/** Шляхи для підстановки фото (JPEG за замовчуванням) */
function buildImageCandidates(primaryPath) {
  const paths = [];
  const push = (p) => {
    if (p && !paths.includes(p)) paths.push(p);
  };

  push(primaryPath);

  if (/\.jpe?g$/i.test(primaryPath)) {
    push(primaryPath.replace(/\.jpe?g$/i, ".jpeg"));
    push(primaryPath.replace(/\.jpe?g$/i, ".svg"));
  } else if (/\.svg$/i.test(primaryPath)) {
    push(primaryPath.replace(/\.svg$/i, ".jpg"));
    push(primaryPath.replace(/\.svg$/i, ".jpeg"));
  } else if (!/\.\w+$/i.test(primaryPath)) {
    push(`${primaryPath}.jpg`);
    push(`${primaryPath}.jpeg`);
    push(`${primaryPath}.svg`);
  }

  return paths;
}

function applyImageSrc(img, primaryPath, altLabel) {
  const candidates = buildImageCandidates(primaryPath);
  let index = 0;

  img.alt = altLabel || "";
  img.onerror = () => {
    index += 1;
    if (index < candidates.length) {
      img.src = candidates[index];
    } else {
      img.onerror = null;
    }
  };

  img.src = candidates[0] || primaryPath;
}

let currentLocale = null;

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

export function getLang() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("lang");
  if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  return "ua";
}

function setCurrentLocale(data, lang) {
  currentLocale = data;
  document.documentElement.lang = lang === "ua" ? "uk" : lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* private mode */
  }
}

export async function loadLocale(lang) {
  if (window.location.protocol === "file:") {
    setCurrentLocale(JSON.parse(JSON.stringify(FALLBACK_LOCALE)), lang);
    return currentLocale;
  }

  try {
    const response = await fetch(`locales/${lang}.json`);
    if (!response.ok) throw new Error(`Locale not found: ${lang}`);
    setCurrentLocale(await response.json(), lang);
    return currentLocale;
  } catch (err) {
    console.warn("Locale fetch failed, using embedded fallback:", err);
    setCurrentLocale(JSON.parse(JSON.stringify(FALLBACK_LOCALE)), lang);
    return currentLocale;
  }
}

export function t(key) {
  if (!currentLocale) return "";
  const value = getNested(currentLocale, key);
  return value ?? "";
}

export function getLocale() {
  return currentLocale;
}

export function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key);
    if (typeof value === "string" && value) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-src]").forEach((el) => {
    const key = el.getAttribute("data-i18n-src");
    const value = t(key);
    if (typeof value === "string" && value) {
      applyImageSrc(el, value, key.split(".").pop() || "");
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const value = t(key);
    if (typeof value === "string" && value) el.setAttribute("aria-label", value);
  });

  const title = t("meta.title");
  if (title) document.title = title;
}

export function updateLangButtons(activeLang) {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === activeLang);
  });
}

export { SUPPORTED };
