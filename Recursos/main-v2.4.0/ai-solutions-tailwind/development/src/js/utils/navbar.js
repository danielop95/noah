const navbarReveal = {
  init() {
    const navbar = document.querySelector('.ai-voice-generator-navbar');
    if (!navbar) return;

    const targetWidth = navbar.offsetWidth;

    gsap.set(navbar, {
      width: 0,

      opacity: 0,
      overflow: 'hidden',
    });

    gsap.to(navbar, {
      width: targetWidth,
      opacity: 1,
      duration: 0.9,
      ease: 'sine.in',
      delay: 0.3,
      onComplete: () => {
        navbar.style.width = '';
        navbar.style.maxWidth = '';
        navbar.style.overflow = '';
      },
    });
  },
};

document.addEventListener('DOMContentLoaded', () => navbarReveal.init());
