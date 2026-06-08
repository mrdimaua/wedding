const SUPPORTED = ["ua", "en", "ro"];
const STORAGE_KEY = "wedding-invite-lang";

/** Вбудований fallback — працює навіть якщо fetch не вдався (file://, офлайн) */
const FALLBACK_LOCALE = {
  meta: { title: "Запрошення — Дмитро & Елена" },
  lang: { ua: "UA", en: "EN", ro: "RO" },
  screen1: {
    invitation_arrived: "Вам надійшло запрошення",
    tap_envelope: "Натисніть на конверт",
  },
  screen2: {
    groom_name: "Дмитро",
    bride_name: "Елена",
    and: "♥",
    wedding_date: "8 серпня 2026",
  },
  invitation: {
    title: "Дорогі друзі та рідні!",
    body: "Із величезною радістю запрошуємо вас розділити з нами один із найважливіших днів нашого життя. Цей день буде наповнений любов’ю, сміхом і безліччю спогадів — і ми дуже хочемо, щоб ви були поруч. Будь ласка, підтвердіть свою присутність та слідкуйте за оновленнями на цьому сайті — тут з’являтимуться всі деталі щодо програми, локації та дрес-коду.",
  },
  program: {
    title: "Програма",
    items: [
      {
        time: "12:00",
        title: "Зустріч нареченого та нареченої",
        desc: "Збір гостей, зворушлива зустріч молодих, знайомимося, налаштовуємось на свято",
      },
      {
        time: "14:00",
        title: "Церемонія",
        desc: "Приготуйте хусточки для зворушливого моменту",
      },
      {
        time: "16:00",
        title: "Прибуття до ресторану",
        desc: "Спілкуємось на велкам зоні, займаємо місця, готуємося смачно їсти",
      },
      {
        time: "17:00",
        title: "Початок паті",
        desc: "Нас чекають веселощі, чудовий ведучий, конкурси та гарний настрій",
      },
      {
        time: "20:00",
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
      { name: "Припилена троянда", hex: "#CE7A8E" },
      { name: "Червоний", hex: "#C1352F" },
      { name: "Бордовий", hex: "#7A1F38" },
      { name: "Теракота", hex: "#C76B3F" },
      { name: "Золотий", hex: "#E3B23C" },
      { name: "Шавлія", hex: "#93A07A" },
    ],
  },
  restaurant: {
    title: "Ресторан",
    name: "Castel Transilvania",
    coordinates: "47.641581, 23.590641",
    copy: "Копіювати",
    copied: "Скопійовано",
  },
  location: {
    title: "Локація",
    address: "Castel Transilvania",
  },
  footer: {
    initials: "Д & О",
    follow: "слідкуйте за вебсайтом, новини та інформація будуть оновлюватись",
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
