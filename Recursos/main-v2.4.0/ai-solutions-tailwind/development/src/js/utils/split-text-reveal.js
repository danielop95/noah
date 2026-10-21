const splitTextReveal = {
  init() {
    document.querySelectorAll('[data-opai-split-text]').forEach((elem) => {
      const lineDelay = parseFloat(elem.getAttribute('data-line-delay') || '0.15');
      const duration = parseFloat(elem.getAttribute('data-line-duration') || '0.9');
      const offsetY = parseFloat(elem.getAttribute('data-line-offset-y') || '100');
      const instant =
        elem.hasAttribute('data-line-instant') &&
        elem.getAttribute('data-line-instant') !== 'false';
      const start = elem.getAttribute('data-line-start') || 'top 90%';
      const delay = parseFloat(elem.getAttribute('data-delay') || '0.1');

      const splitText = new SplitText(elem, { type: 'lines', tag: 'span' });
      const lineSpans = splitText.lines;
      if (!lineSpans?.length) return;

      elem.style.opacity = 1;

      lineSpans.forEach((line) => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'overflow: hidden; display: block;';
        line.parentNode?.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });

      gsap.fromTo(
        lineSpans,
        { y: offsetY, opacity: 0, display: 'block' },
        {
          y: 0,
          opacity: 1,

          duration: duration,
          delay: delay,
          ease: 'power2.inOut',
          stagger: lineDelay,
          scrollTrigger: instant
            ? null
            : {
                trigger: elem,
                start: start,
                once: true,
              },
        }
      );
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  splitTextReveal.init();
});
