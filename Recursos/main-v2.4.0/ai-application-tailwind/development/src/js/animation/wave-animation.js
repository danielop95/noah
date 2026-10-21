/* =========================
Wave Animation
=========================== */

document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined') {
    return;
  }

  const waveSvg = document.getElementById('voice-wave-svg');
  if (!waveSvg) {
    return;
  }

  const wavePaths = waveSvg.querySelectorAll('.wave-path');
  if (wavePaths.length === 0) {
    return;
  }

  wavePaths.forEach((path, index) => {
    const amplitude = 4 + index * 0.5; // Different wave heights
    const duration = 1.2 + index * 0.1; // Slightly different speeds
    const delay = index * 0.15;

    // Create continuous wave motion: up and down
    gsap.to(path, {
      y: -amplitude,
      duration: duration,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: delay,
    });
  });
});
