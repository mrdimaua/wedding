const NAV_ICON = `
  <span class="ic" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  </span>
`;

function isAppleDevice() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports itself as a Mac, so touch support tells them apart
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

const COORDS = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

export function buildMapUrl(query, label) {
  const match = String(query).trim().match(COORDS);
  const pin = match ? `${match[1]},${match[2]}` : null;

  // Both are universal links: the OS hands them to the native app when installed
  if (isAppleDevice()) {
    // Apple Maps drops a pin only via `ll`; `q` alone would run a plain text search
    const params = pin
      ? `ll=${pin}&q=${encodeURIComponent(label || pin)}`
      : `q=${encodeURIComponent(query)}`;
    return `https://maps.apple.com/?${params}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${pin ?? encodeURIComponent(query)}`;
}

export function createMapButton({ query, label, ariaLabel } = {}) {
  if (!query) return null;

  const link = document.createElement("a");
  link.className = "copy-btn map-btn";
  link.href = buildMapUrl(query, label);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (ariaLabel) link.setAttribute("aria-label", ariaLabel);
  link.innerHTML = NAV_ICON;
  return link;
}
