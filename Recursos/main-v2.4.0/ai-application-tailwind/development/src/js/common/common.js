/* =========================
 Common animation utility js across the site 
=========================== */

import { dividerExpand } from '../utils/divider-expand';

const commonAnimation = {
  init() {
    const divider = document.querySelector('.divider');
    const footerDivider = document.querySelector('.footer-divider');
    const progressContainer = document.querySelector('.progress-container');
    const progressLine = document.querySelectorAll('.progress-line');
    const scrollExpand = document.querySelector('.scroll-expand');
    const stepLine = document.querySelectorAll('.step-line');
    const splitTextTeamTitle = document.querySelector('.split-text-team-title');
    const heroPerspective = document.querySelector('.hero-perspective');
    const heroLines = document.querySelectorAll('[data-hero-line]');
    const featureCard1 = document.querySelector('.feature-card-1');
    const featureCard2 = document.querySelector('.feature-card-2');
    const featureCard3 = document.querySelector('.feature-card-3');
    const monthCards = document.querySelectorAll('.month-card');
    const monthLinks = document.querySelectorAll('.month-link');

    if (divider) {
      dividerExpand(divider);
    }
    if (footerDivider) {
      dividerExpand(footerDivider);
    }
    if (progressLine.length > 0) {
      // Set initial state
      gsap.set(progressLine, { width: '0%' });

      // Create timeline for sequential animation
      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: progressContainer,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate each progress line sequentially
      progressLine.forEach((line, index) => {
        progressTimeline.to(
          line,
          {
            width: '100%',
            duration: 2,
            ease: 'power2.inOut',
          },
          index * 2 // Each animation starts after the previous one completes (2 seconds duration)
        );
      });
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
    if (stepLine.length > 0) {
      gsap.set(stepLine, { height: '0px' });

      stepLine.forEach((line, index) => {
        gsap.to(line, {
          height: '380px',
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 75%',
            end: 'top 15%',
            toggleActions: 'play none none reverse',
            // Add a small stagger delay for sequential feel
            onEnter: () => {
              gsap.delayedCall(index * 0.15, () => {
                gsap.to(line, {
                  height: '380px',
                  duration: 1.5,
                  ease: 'power3.out',
                });
              });
            },
          },
        });
      });
    }
    if (splitTextTeamTitle) {
      gsap.registerPlugin(SplitText);
      const splitType = splitTextTeamTitle.getAttribute('data-split-type') || 'chars';

      let split = SplitText.create('.split-text-team-title', { type: splitType });

      gsap.from(split[splitType], {
        scrollTrigger: {
          trigger: splitTextTeamTitle,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
        },
        opacity: 0.1,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
      });
    }
    if (heroPerspective) {
      // Set initial styles
      gsap.set(heroPerspective, {
        opacity: 0,
        filter: 'blur(20px)',
        transform: 'perspective(1200px) scale(0.896871) rotateX(14.4381deg)',
      });

      // Animate when in view
      ScrollTrigger.create({
        trigger: heroPerspective,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(heroPerspective, {
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'perspective(1200px) scale(1) rotateX(0deg)',
            duration: 0.8,
            delay: 0.7,
            ease: 'power2.out',
          });
        },
      });
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
    if (featureCard1) {
      gsap.from(featureCard1, {
        x: 100,
        rotation: 0,
        duration: 0.8,
        delay: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featureCard1,
          start: 'top 90%',
          end: 'bottom 20%',
          scrub: 2,
        },
      });
    }
    if (featureCard2) {
      gsap.from(featureCard2, {
        rotation: 10,
        duration: 0.8,
        delay: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featureCard1,
          start: 'top 90%',
          end: 'bottom 20%',
          scrub: 2,
        },
      });
    }
    if (featureCard3) {
      gsap.from(featureCard3, {
        x: -100,
        rotation: 0,
        duration: 0.8,
        delay: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featureCard1,
          start: 'top 90%',
          end: 'bottom 20%',
          scrub: 2,
        },
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

    // Step cards intersection observer
    const stepCards = document.querySelectorAll('.step-card');
    const stepNumbers = document.querySelectorAll('.step-number');

    if (stepCards.length > 0 && stepNumbers.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '-400px 0px -50% 0px',
        threshold: [0, 0.1, 0.5, 1],
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepNumber = entry.target.getAttribute('data-step');
            const correspondingNumber = document.querySelector(
              `.step-number[data-step-number="${stepNumber}"]`
            );

            // Remove active state from all numbers
            stepNumbers.forEach((num) => {
              num.classList.remove('bg-ns-linen', 'text-accent');
              num.classList.add('bg-ns-ivory', 'text-secondary/40');
            });

            // Add active state to corresponding number
            if (correspondingNumber) {
              correspondingNumber.classList.remove('bg-ns-ivory', 'text-secondary/40');
              correspondingNumber.classList.add('bg-ns-linen', 'text-accent');
            }
          }
        });
      }, observerOptions);

      stepCards.forEach((card) => {
        observer.observe(card);
      });

      // Add click handlers to step number buttons for scrolling
      stepNumbers.forEach((button) => {
        button.addEventListener('click', function () {
          const stepNumber = this.getAttribute('data-step-number');
          const targetCard = document.getElementById(`step-${stepNumber}`);

          if (targetCard) {
            // Check if Lenis is available (for smooth scrolling)
            if (window.lenis) {
              window.lenis.scrollTo(`#step-${stepNumber}`, {
                offset: -156, // Account for sticky header offset
                duration: 1.5,
                easing: (t) => 1 - Math.pow(1 - t, 3),
              });
            } else {
              // Fallback for when Lenis is not available (mobile devices)
              const targetPosition =
                targetCard.getBoundingClientRect().top + window.pageYOffset - 156;
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth',
              });
            }
          }
        });
      });
    }
  },

  // Month cards and links handler for ai-voice-generator-changelog (uses bg-ns-ivory for active)
  initAiVoiceGeneratorChangelog() {
    const monthCards = document.querySelectorAll('.ai-voice-month-card');
    const monthLinks = document.querySelectorAll('.ai-voice-month-link');

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
          const viewportTop = globalThis.window.scrollY || globalThis.window.pageYOffset;
          const viewportBottom = viewportTop + globalThis.window.innerHeight;
          const viewportCenter = viewportTop + globalThis.window.innerHeight * 0.3;

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

          const newActiveCardId = activeCard ? activeCard.dataset.month : null;

          if (newActiveCardId !== activeCardId) {
            activeCardId = newActiveCardId;

            monthLinks.forEach((link) => {
              const monthId = link.dataset.monthLink;
              if (monthId === activeCardId) {
                link.classList.add('bg-ns-ivory');
              } else {
                link.classList.remove('bg-ns-ivory');
              }
            });
          }

          rafId = null;
        });
      }

      monthLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.dataset.monthLink;
          const targetCard = document.getElementById(targetId);

          if (targetCard) {
            const offsetTop = targetCard.offsetTop - 200;
            globalThis.window.scrollTo({
              top: offsetTop,
              behavior: 'smooth',
            });
          }
        });
      });

      if ('IntersectionObserver' in globalThis.window) {
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
        globalThis.window.addEventListener(
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

  // Auto-initialize ai-voice-generator changelog if elements exist
  const initChangelog = () => {
    if (
      document.querySelector('.ai-voice-month-card') &&
      document.querySelector('.ai-voice-month-link')
    ) {
      commonAnimation.initAiVoiceGeneratorChangelog();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChangelog);
  } else {
    initChangelog();
  }
}
