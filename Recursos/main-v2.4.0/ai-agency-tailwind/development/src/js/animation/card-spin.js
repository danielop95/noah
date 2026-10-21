const roundAnimation = {
  init() {
    const item = document.querySelector('.financial-management-platform-hero-spin');
    if (!item) return;

    let lastScrollTop = 0; //to detect the scroll direction
    let scrollTimeout;
    let currentTween;
    let lastDirection = 'down'; // Track last direction to persist after scroll stops

    const startRotation = (direction, duration) => {
      currentTween?.kill();
      currentTween = gsap.to(item, {
        rotate: direction === 'up' ? '-=360' : '+=360',
        duration: duration,
        ease: 'linear',
        transformOrigin: 'center center',
        repeat: -1,
      });
    };

    window.addEventListener('scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      let direction = null;

      if (st > lastScrollTop) direction = 'down';
      else if (st < lastScrollTop) direction = 'up';

      if (direction) {
        lastDirection = direction; // Store the direction
        // Kill previous tween but keep current rotation
        startRotation(direction, 12); // faster while scrolling
      }

      lastScrollTop = Math.max(st, 0);

      // When scroll stops → slow down but keep direction
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Use lastDirection instead of direction to persist after scroll stops
        startRotation(lastDirection, 60);
      }, 150);
    });

    // Initial rotation
    startRotation('down', 50);
  },
};

globalThis.addEventListener('DOMContentLoaded', () => {
  roundAnimation.init();
});
