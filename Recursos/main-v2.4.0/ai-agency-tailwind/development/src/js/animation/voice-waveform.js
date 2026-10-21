/* =========================
Voice Waveform Animation
=========================== */
const voiceWaveform = {
  init() {
    const svgContainer = document.querySelector('#voice-waveform');

    if (!svgContainer) {
      return;
    }

    const voiceBars = svgContainer.querySelectorAll('.voice-bar');

    if (voiceBars.length === 0) {
      return;
    }

    const originalWidths = Array.from(voiceBars).map((rect) => {
      const width = Number.parseFloat(rect.getAttribute('width')) || 0;
      return width;
    });

    voiceBars.forEach((singleBar, index) => {
      const originalWidth = originalWidths[index];

      // Skip if original width is 0 or very small
      if (originalWidth <= 1) {
        return;
      }

      // Determine if this is a "high" bar (white) or "low" bar (semi-transparent)
      // Low bars have fill-opacity attribute, high bars don't
      const isHighBar = !singleBar.hasAttribute('fill-opacity');

      const minHeight = isHighBar
        ? originalWidth * 0.2 // High bars start at 20% of original
        : originalWidth * 0.1; // Low bars start at 10% of original

      const maxHeight = originalWidth; // Never exceed original height

      // Create wave effect with staggered delays
      // Use sine wave pattern for more natural voice-like flow
      const position = index / voiceBars.length; // 0 to 1
      const sineOffset = Math.sin(position * Math.PI * 4) * 0.1; // Wave pattern
      const baseDelay = index * 0.012; // Stagger based on position
      const delay = baseDelay + sineOffset;

      // Duration varies to create natural rhythm - faster for high bars
      const duration = isHighBar
        ? 0.4 + Math.random() * 0.25 // High bars: 0.4-0.65s (faster)
        : 0.6 + Math.random() * 0.3; // Low bars: 0.6-0.9s (slower)

      // Set initial width to a random value between min and max for variety
      const initialHeight = minHeight + (maxHeight - minHeight) * (0.3 + Math.random() * 0.2);
      gsap.set(singleBar, {
        attr: { width: initialHeight },
      });

      const tl = gsap.timeline({
        repeat: -1,
        delay: delay,
      });

      tl.to(singleBar, {
        attr: { width: maxHeight },
        duration: duration,
        ease: 'sine.inOut',
      }).to(singleBar, {
        attr: { width: minHeight },
        duration: duration,
        ease: 'linear',
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', function () {
  // Check if GSAP is available
  if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded.');
    return;
  }

  voiceWaveform.init();
});
