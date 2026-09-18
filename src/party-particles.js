// ==============================================
// GENTLE PETAL & STAR PARTICLES
// Romantic flutter animation on note creation & checklist check
// ==============================================

export function spawnCozyParticles(sourceElement = null) {
  const container = document.getElementById("particleContainer") || document.body;
  const particles = ["🌸", "🌼", "🌻", "🍃", "✨", "⭐", "🦋"];
  const count = 18;

  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 3;

  if (sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "cozy-particle";
    el.textContent = particles[Math.floor(Math.random() * particles.length)];
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.fontSize = `${16 + Math.random() * 12}px`;
    el.style.userSelect = "none";
    container.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 140;
    const destX = startX + Math.cos(angle) * distance;
    const destY = startY + Math.sin(angle) * distance + 40;

    if (window.anime) {
      window.anime({
        targets: el,
        left: destX,
        top: [startY, destY],
        opacity: [1, 0],
        scale: [0.6, 1.2, 0.4],
        rotate: () => Math.random() * 360 - 180,
        duration: 1200 + Math.random() * 600,
        easing: "easeOutCubic",
        complete: () => {
          el.remove();
        },
      });
    } else {
      setTimeout(() => el.remove(), 1000);
    }
  }
}
