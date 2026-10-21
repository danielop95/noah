const animation = {
  init() {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.registerPlugin(ScrollTrigger);

    const integrationPathAnimation = () => {
      // Get all integration SVG  (both v7 and v8 use the same class)
      const svgs = document.querySelectorAll('.integration-path');

      if (svgs.length === 0) {
        return;
      }

      // Process each SVG element
      svgs.forEach((svg) => {
        // Get all groups in this SVG
        const pathGroups = svg.querySelectorAll('g');

        pathGroups.forEach((group, index) => {
          const path = group.querySelector('path');
          if (!path) return;

          // Create a dot
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('r', '2');
          dot.setAttribute('fill', '#09F671');
          dot.setAttribute('opacity', '0.8');

          group.appendChild(dot);

          gsap.to(dot, {
            duration: 4,
            repeat: -1,
            scale: 2.5,
            ease: 'none',
            filter: 'blur(1px)',
            motionPath: {
              path: path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
              start: 0,
              end: 1,
            },
          });
        });
      });
    };

    const integrationFeaturesPill = () => {
      const pills = document.getElementsByClassName('features-integration-pill');
      const paths = [];
      for (const pill of pills) {
        const svgs = pill.getElementsByTagName('svg');
        for (const svg of svgs) {
          const pathEls = svg.getElementsByClassName('connector');
          for (const el of pathEls) {
            paths.push(el);
          }
        }
      }
      if (paths.length === 0) return;

      paths.forEach((path, i) => {
        const len = path.getTotalLength();

        // draw-on
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: i * 0.08,
        });

        // moving glow dot (center-aligned + on top)
        const svg = path.closest('svg');

        // add a tiny glow filter once per SVG (optional)
        if (!svg.getElementById('glow')) {
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
          svg.prepend(defs);
        }

        // Get dot color from data attribute on features-integration-pill
        const pillContainer = path.closest('.features-integration-pill');
        const dotColorAttr = pillContainer?.dataset.dotColor || 'white';
        const dotColor = dotColorAttr === 'black' ? '#000' : '#fff';

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '1.6');
        dot.setAttribute('fill', dotColor);
        dot.setAttribute('opacity', '1');
        dot.setAttribute('filter', 'url(#glow)');
        dot.style.pointerEvents = 'none';

        // append AFTER the path so it paints on top
        svg.appendChild(dot);

        // center the element for motion-path alignment
        gsap.set(dot, { transformBox: 'fill-box', transformOrigin: '50% 50%' });

        gsap.fromTo(
          dot,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 2.2,
            repeat: -1,
            ease: 'none',
            yoyo: false,
            // key part: align the element's CENTER to the path
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
              start: 0,
              end: 1,
            },
            delay: 0.5 + i * 0.15,
          }
        );
      });
    };

    integrationPathAnimation();
    integrationFeaturesPill();
  },
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    animation.init();
    capabilitiesIntegrationList();
  });
} else {
  animation.init();
}
