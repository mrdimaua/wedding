const FLIP_DURATION_MS = 950;
const FLIP_BUFFER_MS = 80;
const ZOOM_DURATION_MS = 1100;
const ZOOM_BUFFER_MS = 60;

function getElements() {
  return {
    btn: document.getElementById("envelope-btn"),
    envelope: document.getElementById("envelope"),
    card: document.getElementById("envelope-card"),
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

function resetEnvelopeAnimation() {
  const { btn, envelope, card, letter } = getElements();

  if (envelope) {
    envelope.classList.remove("is-opening", "is-open", "is-unfolded");
    envelope.style.cssText = "";
  }

  if (card) {
    card.classList.remove("is-flipped", "is-expanding", "is-fullscreen");
    card.style.cssText = "";
  }

  if (letter) {
    letter.classList.remove("is-rising", "is-expanding", "is-fullscreen");
    letter.style.cssText = "";
  }

  if (btn) btn.disabled = false;
}

function resetEnvelopeState() {
  const { screenEnvelope } = getElements();

  screenEnvelope?.classList.remove("is-opening", "is-done");
  if (screenEnvelope) screenEnvelope.style.display = "";

  resetEnvelopeAnimation();
}

export function ensureWelcomeScreen() {
  const { screenMain } = getElements();
  if (!screenMain) return;

  resetEnvelopeState();

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
  const { btn, envelope, card, screenEnvelope, screenMain, backBtn } = getElements();

  if (!btn || !envelope || !card || !screenEnvelope || !screenMain) return;

  let opened = false;

  const startZoom = () => {
    const rect = card.getBoundingClientRect();
    const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height);

    card.style.setProperty("--zoom-scale", scale.toFixed(4));
    card.classList.add("is-expanding");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add("is-fullscreen");
      });
    });
  };

  const openEnvelope = () => {
    if (opened) return;
    opened = true;
    btn.disabled = true;

    screenEnvelope.classList.add("is-opening");
    envelope.classList.add("is-opening", "is-open", "is-unfolded");
    card.classList.add("is-flipped");

    const zoomStart = FLIP_DURATION_MS + FLIP_BUFFER_MS;
    const zoomDone = zoomStart + ZOOM_DURATION_MS + ZOOM_BUFFER_MS;

    setTimeout(startZoom, zoomStart);

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
        resetEnvelopeAnimation();
      }, 700);
    }, zoomDone);
  };

  btn.addEventListener("click", openEnvelope);

  backBtn?.addEventListener("click", () => {
    opened = false;
    resetToEnvelopeScreen();
  });

  return { reset: resetToEnvelopeScreen };
}
