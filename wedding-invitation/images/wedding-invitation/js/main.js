import {
  getLang,
  loadLocale,
  applyTranslations,
  updateLangButtons,
  SUPPORTED,
} from "./i18n.js";
import { initEnvelope, ensureWelcomeScreen } from "./envelope.js";
import { initLights } from "./lights.js";
import { initProgramTimeline, rebuildProgram } from "./program-timeline.js";
import { initCountdown } from "./countdown.js";
import { initPalette, rebuildPalette } from "./palette.js";
import { initRestaurant } from "./restaurant.js";

let mainInitialized = false;

async function setLanguage(lang) {
  await loadLocale(lang);
  applyTranslations();
  updateLangButtons(lang);

  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);

  if (mainInitialized) {
    rebuildProgram();
    rebuildPalette();
  }
}

function bindLanguageSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (lang && SUPPORTED.includes(lang)) setLanguage(lang);
    });
  });
}

function initMainContent() {
  if (mainInitialized) return;
  mainInitialized = true;
  try {
    initLights();
    initProgramTimeline();
    initCountdown();
    initPalette();
    initRestaurant();
  } catch (err) {
    console.error("Main content init failed:", err);
  }
}

function showBootHint() {
  const hint = document.getElementById("boot-hint");
  if (hint) hint.hidden = false;
}

function hideBootHint() {
  const hint = document.getElementById("boot-hint");
  if (hint) hint.hidden = true;
}

async function bootstrap() {
  window.__inviteReady = true;
  ensureWelcomeScreen();
  hideBootHint();

  try {
    await setLanguage(getLang());
  } catch (err) {
    console.error("Locale error:", err);
  }

  bindLanguageSwitcher();
  initEnvelope(() => {
    initMainContent();
    window.dispatchEvent(new Event("resize"));
  });
}

ensureWelcomeScreen();

if (window.location.protocol === "file:") {
  showBootHint();
}

bootstrap().catch((err) => {
  console.error("Failed to load invitation:", err);
  showBootHint();
  ensureWelcomeScreen();
  try {
    initEnvelope(() => initMainContent());
  } catch (e) {
    console.error(e);
  }
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    mainInitialized = false;
    ensureWelcomeScreen();
    bootstrap().catch(console.error);
  }
});
