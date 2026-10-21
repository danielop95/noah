import { dividerExpand } from './divider-expend';

const commonAnimation = {
  init() {
    const footerDivider = document.querySelector('.footer-divider');

    gsap.registerPlugin(ScrollTrigger);

    const imagesLoadingReveal = document.querySelectorAll('.image-loading-reveal img');

    const blogCards = document.querySelectorAll('.blog-card');
    const partnerShipCards = document.querySelectorAll('.partner-ship-card');

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
            duration: 0.8,
            scrollTrigger: {
              trigger: triggerEl,
              start: 'top 96%',
              end: 'bottom 58%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }
    // ============ blog card width transition ============

    if (blogCards.length > 0) {
      blogCards[0].classList.add('active-card');
      blogCards.forEach((card) => {
        card.addEventListener('mouseenter', function () {
          blogCards.forEach((c) => c.classList.remove('active-card'));

          this.classList.add('active-card');
        });
      });
    }
    // ============ partner ship card width transition ============
    if (partnerShipCards.length > 0) {
      partnerShipCards.forEach((card) => {
        card.addEventListener('mouseenter', function () {
          partnerShipCards.forEach((c) => c.classList.remove('active-partner-ship-card'));
          this.classList.add('active-partner-ship-card');
        });
      });
    }

    // footer divider expand animation
    if (footerDivider) {
      dividerExpand(footerDivider);
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

// footer border expand animation

if (typeof window !== 'undefined') {
  commonAnimation.init();
  updateFooterYear();
}
