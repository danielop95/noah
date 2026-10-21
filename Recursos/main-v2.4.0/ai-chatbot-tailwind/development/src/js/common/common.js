/* =========================
 Common animation utility js across the site 
=========================== */

import { dividerExpand } from '../utils/divider-expand';

const commonAnimation = {
  init() {
    const divider = document.querySelector('.divider');
    const footerDivider = document.querySelector('.footer-divider');
    const scrollExpand = document.querySelector('.scroll-expand');
    const heroLines = document.querySelectorAll('[data-hero-line]');
    const monthCards = document.querySelectorAll('.month-card');
    const monthLinks = document.querySelectorAll('.month-link');

    if (divider) {
      dividerExpand(divider);
    }
    if (footerDivider) {
      dividerExpand(footerDivider);
    }

    if (scrollExpand) {
      // Check if mobile device
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        gsap.set(scrollExpand, { minWidth: 'auto' });
      } else {
        gsap.set(scrollExpand, { minWidth: '500px' });

        ScrollTrigger.create({
          trigger: scrollExpand,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            gsap.to(scrollExpand, {
              minWidth: '950px',
              duration: 0.5,
              ease: 'power2.out',
            });
          },
          onEnterBack: () => {
            gsap.to(scrollExpand, {
              minWidth: '950px',
              duration: 0.5,
              ease: 'power2.out',
            });
          },
          onLeaveBack: () => {
            gsap.to(scrollExpand, {
              minWidth: '500px',
              duration: 0.5,
              ease: 'power2.out',
            });
          },
        });
      }
    }

    if (heroLines.length > 0) {
      heroLines.forEach((line) => {
        gsap.to(line, {
          height: '100%',
          duration: 0.8,
          delay: 0.7,
          ease: 'power2.out',
        });
      });
    }

    if (monthCards.length > 0 && monthLinks.length > 0) {
      let activeCardId = null;
      let rafId = null;

      function updateActiveLink() {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
          let activeCard = null;
          let minDistance = Infinity;
          const viewportTop = window.scrollY || window.pageYOffset;
          const viewportBottom = viewportTop + window.innerHeight;
          const viewportCenter = viewportTop + window.innerHeight * 0.3;

          monthCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cardTop = rect.top + viewportTop;
            const cardBottom = cardTop + rect.height;
            const cardCenter = cardTop + rect.height / 2;

            if (cardTop <= viewportBottom && cardBottom >= viewportTop) {
              const distance = Math.abs(cardCenter - viewportCenter);
              if (distance < minDistance) {
                minDistance = distance;
                activeCard = card;
              }
            }
          });

          const newActiveCardId = activeCard ? activeCard.getAttribute('data-month') : null;

          if (newActiveCardId !== activeCardId) {
            activeCardId = newActiveCardId;

            monthLinks.forEach((link) => {
              const monthId = link.getAttribute('data-month-link');
              if (monthId === activeCardId) {
                link.classList.add('bg-background-12', 'dark:!bg-background-6');
              } else {
                link.classList.remove('bg-background-12', 'dark:!bg-background-6');
              }
            });
          }

          rafId = null;
        });
      }

      monthLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('data-month-link');
          const targetCard = document.getElementById(targetId);

          if (targetCard) {
            const offsetTop = targetCard.offsetTop - 200;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth',
            });
          }
        });
      });

      if ('IntersectionObserver' in window) {
        const observerOptions = {
          root: null,
          rootMargin: '-20% 0px -60% 0px',
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
        };

        const observer = new IntersectionObserver((entries) => {
          updateActiveLink();
        }, observerOptions);

        monthCards.forEach((card) => {
          observer.observe(card);
        });
      } else {
        let scrollTimeout;
        window.addEventListener(
          'scroll',
          function () {
            if (scrollTimeout) {
              clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(updateActiveLink, 10);
          },
          { passive: true }
        );
      }

      updateActiveLink();
    }
  },
};

if (globalThis.window !== undefined) {
  commonAnimation.init();
}
