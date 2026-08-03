const COPY_ICON = `
  <span class="ic ic-copy" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  </span>
  <span class="ic ic-check" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
`;

export function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

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

export function bindCopyButton(btn) {
  if (!btn || btn.dataset.copyBound) return;

  btn.dataset.copyBound = "true";
  btn.addEventListener("click", async () => {
    const target = btn.dataset.copyTarget
      ? document.getElementById(btn.dataset.copyTarget)
      : null;
    const text = (btn.dataset.copyText || target?.textContent || "").trim();
    if (!text) return;

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
}

export function bindCopyButtons(root = document) {
  root.querySelectorAll(".copy-btn").forEach(bindCopyButton);
}

export function createCopyButton({ targetId, copyText: text, ariaLabel } = {}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy-btn";
  if (targetId) btn.dataset.copyTarget = targetId;
  if (text) btn.dataset.copyText = text;
  if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
  btn.innerHTML = COPY_ICON;
  bindCopyButton(btn);
  return btn;
}
