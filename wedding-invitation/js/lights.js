/**
 * Гірлянда (Christmas lights) — анімації та параллакс.
 * Використовує GSAP (підключений через CDN в <head>).
 * Якщо GSAP недоступний — лампочки лишаються статичними (без помилок).
 */

let initialized = false;

export function initLights() {
  if (initialized) return;

  const overlay = document.getElementById("garland-overlay");
  if (!overlay) return;

  const gsap = window.gsap;
  if (!gsap) {
    console.warn("GSAP не завантажено — гірлянда буде статичною.");
    initialized = true;
    return;
  }

  initialized = true;

  // Поважаємо налаштування "зменшити рух" — без анімацій (продуктивність/доступність)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // 1. Похитування кожної лампочки
  const bulbs = document.querySelectorAll(".bulb-item");
  bulbs.forEach((bulb) => {
    gsap.set(bulb, {
      transformOrigin: "50% 0%",
      rotation: gsap.utils.random(-6, 6),
      force3D: true,
    });

    const delay = parseFloat(bulb.getAttribute("data-delay")) || 0;
    const dur = gsap.utils.random(4, 7.5);
    const rot = gsap.utils.random(10, 16);

    gsap.to(bulb, {
      rotation: gsap.utils.random(-rot, rot),
      duration: dur,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay,
      overwrite: "auto",
    });
  });

  // 2. Легке "дихання" нитки
  document.querySelectorAll(".wire-group").forEach((wire) => {
    gsap.to(wire, {
      y: gsap.utils.random(-3, 3),
      duration: gsap.utils.random(5, 9),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      force3D: true,
    });
  });

  // 3. Параллакс від руху миші — лише для десктопа (на тачі марно і грузить)
  if (coarsePointer) return;

  let mouseX = 0;
  let mouseY = 0;
  let rafPending = false;

  const applyParallax = () => {
    const xPos = mouseX - 0.5;
    const yPos = mouseY - 0.5;

    gsap.to(".layer-front", {
      x: xPos * 38,
      y: yPos * 18,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });

    gsap.to(".layer-back", {
      x: xPos * 5,
      y: yPos * 2,
      duration: 1.8,
      ease: "power2.out",
      overwrite: "auto",
    });

    rafPending = false;
  };

  document.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(applyParallax);
      }
    },
    { passive: true }
  );
}
