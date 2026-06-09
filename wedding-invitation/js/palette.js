import { getLocale } from "./i18n.js";

function buildSwatches() {
  const list = document.getElementById("palette-swatches");
  if (!list) return;

  const colors = getLocale()?.palette?.colors ?? [];
  list.innerHTML = "";

  colors.forEach((color) => {
    const li = document.createElement("li");
    li.className = "palette-swatch";
    li.style.setProperty("--swatch", color.hex);
    if (color.name) {
      li.setAttribute("aria-label", color.name);
    }
    list.appendChild(li);
  });
}

export function initPalette() {
  buildSwatches();
}

export function rebuildPalette() {
  buildSwatches();
}
