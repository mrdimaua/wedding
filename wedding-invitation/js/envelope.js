/** Flap CSS transition duration (ms) — keep in sync with styles.css */
const FLAP_DURATION_MS = 700;
const FLAP_BUFFER_MS = 80;
const LETTER_RISE_MS = 900;
const LETTER_EXPAND_MS = 650;
const LETTER_FULLSCREEN_MS = 700;

function getElements() {
  return {
    btn: document.getElementById("envelope-btn"),
    envelope: document.getElementById("envelope"),
    letter: document.getElementById("envelope-letter"),
    screenEnvelope: document.getElementById("screen-envelope"),
    screenMain: document.getElementById("screen-main"),
    backBtn: document.getElementById("back-to-envelope-btn"),
  };
}

function showBackToEnvelope(show) {
  const { backBtn } = getElements();
  if (!backBtn) return;
  backBtn.hidden = !show;
}

/** Скидає UI після refresh / bfcache — щоб знову був екран з конвертом */
export function ensureWelcomeScreen() {
  const { btn, envelope, letter, screenEnvelope, screenMain } = getElements();
  if (!screenEnvelope || !screenMain) return;

  screenEnvelope.style.display = "";
  screenEnvelope.classList.remove("is-opening", "is-done");

  if (envelope) envelope.classList.remove("is-open", "envelope--letter-out");
  if (letter) {
    letter.classList.remove("is-rising", "is-expanding", "is-fullscreen");
    letter.style.cssText = "";
  }
  if (btn) btn.disabled = false;

  screenMain.classList.add("hidden");
  screenMain.classList.remove("reveal");
  screenMain.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "hidden";
  showBackToEnvelope(false);
}

export function resetToEnvelopeScreen() {
  ensureWelcomeScreen();
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function initEnvelope(onOpenComplete) {
  const { btn, envelope, letter, screenEnvelope, screenMain, backBtn } = getElements();

  if (!btn || !envelope || !letter || !screenEnvelope || !screenMain) return;

  let opened = false;

  const openEnvelope = () => {
    if (opened) return;
    opened = true;
    btn.disabled = true;

    screenEnvelope.classList.add("is-opening");
    envelope.classList.add("is-open");

    const flapDone = FLAP_DURATION_MS + FLAP_BUFFER_MS;

    setTimeout(() => {
      envelope.classList.add("envelope--letter-out");
      letter.classList.add("is-rising");
    }, flapDone);

    setTimeout(() => {
      letter.classList.add("is-expanding");
    }, flapDone + LETTER_RISE_MS);

    setTimeout(() => {
      letter.classList.add("is-fullscreen");
    }, flapDone + LETTER_RISE_MS + LETTER_EXPAND_MS);

    setTimeout(() => {
      screenEnvelope.classList.add("is-done");
      screenMain.classList.remove("hidden");
      screenMain.removeAttribute("aria-hidden");
      screenMain.classList.add("reveal");

      document.body.style.overflow = "";
      showBackToEnvelope(true);
      onOpenComplete?.();

      setTimeout(() => {
        screenEnvelope.style.display = "none";
        envelope.classList.remove("envelope--letter-out");
        letter.classList.remove("is-rising", "is-expanding", "is-fullscreen");
      }, 800);
    }, flapDone + LETTER_RISE_MS + LETTER_EXPAND_MS + LETTER_FULLSCREEN_MS);
  };

  btn.addEventListener("click", openEnvelope);

  backBtn?.addEventListener("click", () => {
    opened = false;
    resetToEnvelopeScreen();
  });

  return { reset: resetToEnvelopeScreen };
}
