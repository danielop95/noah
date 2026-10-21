import { dividerExpand } from '../utils/divider-expend';

const commonAnimation = {
  init() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    const footerDivider = document.querySelectorAll('.footer-divider');

    const progressContainer = document.querySelector('.progress-container');
    const progressLine = document.querySelectorAll('.progress-line');
    const stepLine = document.querySelectorAll('.step-line');
    const progressBars = document.querySelectorAll(
      '.progress-bar-blue, .progress-bar-black, .progress-bar-lemon, .progress-bar-cyan'
    );

    // ============ progress line ============

    if (footerDivider) {
      dividerExpand(footerDivider);
    }

    // ============ step line ============

    if (stepLine.length > 0) {
      // Set initial state for all step lines
      gsap.set(stepLine, { height: '0px' });

      const firstStepLine = stepLine[0];
      const triggerElement =
        firstStepLine.closest('.step-line-container') ||
        firstStepLine.parentElement ||
        firstStepLine;

      const stepTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: 'top 79%',
          end: 'top 15%',
          toggleActions: 'play none none',
        },
      });

      stepLine.forEach((line, index) => {
        stepTimeline.to(
          line,
          {
            height: '100%',
            duration: 1.4,
            ease: 'power3.out',
          },
          index * 0.7 // Each animation with 0.7s delay duration)
        );
      });
    }
    // ============ progress bars ============
    if (progressBars.length > 0) {
      gsap.set(progressBars, { height: '0px' });

      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.progress-bar-blue',
          start: 'top 88%',
          end: 'bottom 20%',
          toggleActions: 'play none none ',
        },
      });

      progressTimeline
        .to(
          '.progress-bar-blue',
          {
            height: '30%',
            duration: 1.2,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .to(
          '.progress-bar-black',
          {
            height: '65%',
            duration: 1.2,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .to(
          '.progress-bar-lemon',
          {
            height: '45%',
            duration: 1.2,
            ease: 'power2.out',
          },
          '-=0.8'
        )
        .to(
          '.progress-bar-cyan',
          {
            height: '30%',
            duration: 1.2,
            ease: 'power2.out',
          },
          '-=0.9'
        );
    }
    // ============ progress lines ============
    if (progressLine.length > 0) {
      // Set initial state
      gsap.set(progressLine, { width: '0%' });

      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: progressContainer,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none none',
        },
      });

      progressLine.forEach((line, index) => {
        progressTimeline.to(
          line,
          {
            width: '100%',
            duration: 1.2,
            ease: 'power2.inOut',
          },
          index * 1 // Each animation starts after the previous one completes (2 seconds duration)
        );
      });
    }
  },
};

const headerScroll = () => {
  const header = document.querySelector('[data-header-scroll]');
  if (!header) return;

  const updateScrollState = () => {
    header.dataset.hasScrolled = window.scrollY > 100 ? 'true' : 'false';
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
};

const capabilitiesIntegrationList = () => {
  const list1 = document.querySelector('.capabilities-integration-list');
  const list2 = document.querySelector('.capabilities-integration-list-2');
  if (!list1 || !list2) return;

  let maxProgress = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: list1,
      start: 'top 85%',
      end: 'bottom 30%',
      scrub: true,
      onUpdate: (self) => {
        if (self.progress > maxProgress) {
          maxProgress = self.progress;
        }
        tl.progress(maxProgress);
      },
      onLeave: () => {
        maxProgress = 1;
        tl.progress(1);
      },
      onLeaveBack: () => {
        tl.progress(maxProgress);
      },
    },
  });

  tl.from(
    list1,
    {
      opacity: 0.1,
      x: 400,
      y: -70,
      duration: 10,
      delay: 0.5,
      ease: 'sine.Out',
    },
    '+=6'
  ).from(
    list2,
    {
      opacity: 0.1,
      x: 450,
      y: 70,
      duration: 10.5,
      ease: 'sine.Out',
    },
    '-=1.5'
  );
};

const howItsWork = () => {
  const container = document.querySelector('.how-its-work-images-container');
  const images = [
    document.querySelector('.how-its-work-image-1'),
    document.querySelector('.how-its-work-image-2'),
    document.querySelector('.how-its-work-image-3'),
    document.querySelector('.how-its-work-image-4'),
  ];

  if (!container) return;

  const initialPositions = [
    { x: 170, y: 0, rotation: 0 },
    { x: 10, y: 0, rotation: 0 },
    { x: -40, y: 0, rotation: 0 },
    { x: -170, y: 0, rotation: 0 },
  ];

  const finalPositions = [
    { x: 0, y: -12, rotation: -20 },
    { x: 0, y: 0, rotation: 20 },
    { x: 0, y: -28, rotation: -8 },
    { x: 0, y: 0, rotation: 19 },
  ];

  images.forEach((img, index) => {
    gsap.set(img, {
      x: initialPositions[index].x,
      y: initialPositions[index].y,
      rotation: initialPositions[index].rotation,
      transformOrigin: '50% 50%',
    });
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top 80%',
      once: true,
    },
  });

  images.forEach((img, index) => {
    tl.to(
      img,
      {
        x: finalPositions[index].x,
        y: finalPositions[index].y,
        rotation: finalPositions[index].rotation,
        duration: 1.5,
        ease: 'power3.out',
      },
      0
    );
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if (globalThis.window === undefined) return;
  commonAnimation.init();
  headerScroll();
  capabilitiesIntegrationList();
  howItsWork();
});
