gsap.registerPlugin(ScrollTrigger);
const ourImpactReviewCardAnimation = () => {
  const trigger = document.querySelector('.our-impact-section');
  const cards = document.querySelectorAll('.our-impact-review-card');
  if (!cards.length) return;

  const animations = [
    { x: 150, duration: 1.5, delay: 0.1, rotation: 15 },
    { x: 90, duration: 2.2, delay: 0.2, rotation: 5 },
    { x: 0, duration: 2.5, delay: 0.3, rotation: -5 },
  ];

  cards.forEach((card, index) => {
    if (animations[index]) {
      gsap.from(card, {
        ...animations[index],
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trigger,
          start: 'top 95%',
          end: 'bottom 18%',
          scrub: 0.8,
        },
      });
    }
  });
};

const ourImpactImageAnimation = () => {
  const images = document.querySelectorAll('.our-impact-image');
  const trigger = document.querySelector('.our-impact-section');
  if (!images.length) return;

  const animations = [
    { y: -70, duration: 2.3, rotation: -7 },
    { y: 70, duration: 2.3, rotation: 12 },
    { x: 90, duration: 2.3, rotation: 12 },
  ];

  images.forEach((image, index) => {
    if (animations[index]) {
      gsap.from(image, {
        ...animations[index],
        ease: 'power3.out',
        filter: 'blur(5px)',
        scrollTrigger: {
          trigger: trigger,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: 0.8,
          once: true,
        },
      });
    }
  });
};

const empoweringBusinessSvgAnimation = () => {
  const container = document.querySelector('.flow-line-curve-svg-container');
  const paths = document.querySelectorAll('.flow-line-curve-path');
  const circle = document.querySelector('.flow-line-curve-circle');
  if (!container || !paths.length) return;

  // Hide circle initially
  if (circle) {
    gsap.set(circle, { opacity: 0, scale: 0.2 });
  }

  paths.forEach((path, index) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: 'power3.out',
      delay: index * 0.2,
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });
  });

  // circle animation
  if (circle) {
    gsap.to(circle, {
      opacity: 1,
      scale: 1,
      duration: 2.1,
      delay: 1.3,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        once: true,
      },
    });
  }
};

const empoweringBusinessProgressBarAnimation = () => {
  const progressBars = document.querySelectorAll('.empowering-business-progress-bar');
  const trigger = document.querySelector('.empowering-business-progress-container');
  if (!progressBars.length) return;

  progressBars.forEach((bar) => {
    const originalWidth = window.getComputedStyle(bar).width;
    gsap.set(bar, { width: '0px' });

    gsap.to(bar, {
      width: originalWidth,
      duration: 2.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: trigger,
        start: 'top 80%',
        once: true,
      },
    });
  });
};

const ctaV2ImageAnimation = () => {
  const image1 = document.querySelector('.cta-v2-image-1');
  const image2 = document.querySelector('.cta-v2-image-2');
  const image3 = document.querySelector('.cta-v2-image-3');
  const wrapper = document.querySelector('.cta-v2-images-wrapper');

  if (!image1 || !image2 || !image3 || !wrapper) return;

  const offset1 = -140;
  const offset2 = -160;
  const offset3 = -10;

  gsap.set(image1, { x: offset1, y: 50, rotation: -30, opacity: 0.2 });
  gsap.set(image2, { x: offset2, y: -3, rotation: -30, opacity: 0 });
  gsap.set(image3, { x: offset3, y: 150, rotation: -50, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top 90%',
      once: true,
    },
  });

  tl.to(image3, {
    x: 0,
    y: 0,
    rotation: -30,
    opacity: 1,
    duration: 0.7,
    ease: 'power3.out',
  })
    .to(
      image2,
      {
        x: 0,
        y: 0,
        rotation: -15,
        opacity: 1,
        duration: 2,
        ease: 'power3.out',
      },
      '-=0.8'
    )
    .to(
      image1,
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 2,
        ease: 'power3.out',
      },
      '-=1.8'
    );
};

document.addEventListener('DOMContentLoaded', () => {
  ourImpactReviewCardAnimation();
  ourImpactImageAnimation();
  empoweringBusinessSvgAnimation();
  empoweringBusinessProgressBarAnimation();
  ctaV2ImageAnimation();
});
