import { dividerExpand } from '../utils/divider-expend';

const commonAnimation = {
  init() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    const footerDivider = document.querySelectorAll('.footer-divider');
    const imagesLoadingReveal = document.querySelectorAll('.image-loading-reveal img');

    // ============ progress line ============

    if (footerDivider) {
      dividerExpand(footerDivider);
    }

    // ============ image loading reveal ============
    if (imagesLoadingReveal.length > 0) {
      imagesLoadingReveal.forEach((img) => {
        const triggerEl = img.closest('.image-loading-reveal') || img;

        gsap.set(img, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          opacity: 0,
          scale: 0.9,
        });

        gsap.fromTo(
          img,
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            opacity: 0,
            scale: 0.9,
          },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            opacity: 1,
            scale: 1,
            ease: 'back.in',
            duration: 0.9,
            scrollTrigger: {
              trigger: triggerEl,
              start: 'top 94%',
              end: 'bottom 58%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }
  },
};

// Footer Year  text content function
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll('[data-footer-year]');

  if (footerYearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};

if (typeof window !== 'undefined') {
  commonAnimation.init();
  updateFooterYear();
}
