// split text type char
const button = {
  init() {
    const buttonWrappers = document.querySelectorAll('.button-split-text-wrapper');

    const duration = 0.4;
    const stagger = 0.00625;

    buttonWrappers.forEach((buttonWrapper) => {
      const upperText = buttonWrapper.querySelector('.button-split-upper-text');
      const lowerText = buttonWrapper.querySelector('.button-split-lower-text');

      if (!upperText || !lowerText) return;

      const upperSplit = new SplitText(upperText, {
        type: 'chars',
        tag: 'span',
      });
      const lowerSplit = new SplitText(lowerText, {
        type: 'chars',
        tag: 'span',
      });

      // Set initial state for upper text (visible)
      gsap.set(upperSplit.chars, {
        opacity: 1,
        display: 'inline-block',
      });

      // Set initial state for lower text (hidden below)
      gsap.set(lowerSplit.chars, {
        opacity: 0,
        display: 'inline-block',
      });

      // Create hover in animation (flip effect)
      const hoverInTl = gsap.timeline({ paused: true });
      hoverInTl
        .to(upperSplit.chars, {
          y: '-100%',
          duration: duration,
          opacity: 0,
          ease: 'power2.inOut',
          stagger: stagger,
        })
        .to(
          lowerSplit.chars,
          {
            y: '-100%',
            duration: duration,
            opacity: 1,
            stagger: stagger,
            ease: 'power2.inOut',
          },
          '<' // Start at the same time as upper text animation
        );

      buttonWrapper.addEventListener('mouseenter', () => {
        hoverInTl.play();
      });

      buttonWrapper.addEventListener('mouseleave', () => {
        hoverInTl.reverse();
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  button.init();
});
