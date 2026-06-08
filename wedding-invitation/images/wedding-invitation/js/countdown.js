const TARGET_ISO = "2026-08-08T12:00:00+03:00";

export function initCountdown() {
  const target = new Date(TARGET_ISO).getTime();

  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;

    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  };

  tick();
  setInterval(tick, 1000);
}
