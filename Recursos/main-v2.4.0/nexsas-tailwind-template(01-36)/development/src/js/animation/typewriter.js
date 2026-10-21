/* =========================
Typewriter Animation
=========================== */

const typewriterAnimation = {
  init() {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const typewriterElement = document.querySelector('.typewriter-text');
    const container = document.querySelector('.typewriter-text-container');

    if (!typewriterElement || !container) {
      return;
    }

    // Split text into characters
    const split = new SplitText(typewriterElement, {
      type: 'chars',
      tag: 'span',
    });

    // Hide all characters initially
    gsap.set(split.chars, { opacity: 0 });

    // Create timeline with scroll trigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });

    // Animate characters one by one
    const typingDuration = 3;
    const charDelay = typingDuration / split.chars.length;

    split.chars.forEach((char, index) => {
      tl.to(char, { opacity: 1, duration: 0.01 }, index * charDelay);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  typewriterAnimation.init();
});
