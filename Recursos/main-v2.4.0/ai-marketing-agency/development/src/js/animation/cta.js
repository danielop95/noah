const CtaContentImageAnimation = {
  init() {
    const contentImage = document.querySelector('.cta-content-image');
    const contentImage2 = document.querySelector('.cta-content-image-2');
    if (!contentImage || !contentImage2) return;

    gsap.from(contentImage, {
      duration: 1.7,
      delay: 0.3,
      scaleX: 0,
      width: 0,
      transformOrigin: 'left center',
      autoAlpha: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: contentImage,
        start: 'top 85%',
        end: 'bottom 20%',
        once: true,
      },
    });

    gsap.from(contentImage2, {
      y: 120,
      duration: 1.3,
      delay: 0.2,
      scale: 0,
      opacity: 0,
      rotation: 40,
      transformOrigin: 'center center',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: contentImage,
        start: 'top 85%',
        end: 'bottom 20%',
        once: true,
      },
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  CtaContentImageAnimation.init();
});
