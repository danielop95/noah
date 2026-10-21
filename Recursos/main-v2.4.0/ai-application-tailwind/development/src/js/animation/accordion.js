/* =========================
 Accordion animation js 
=========================== */

const accordionAnimation = {
  accordionGroups: new Map(),
  initializedGroups: new Set(),

  init(accordionContainer = null) {
    if (accordionContainer) {
      this.initAccordionGroup(accordionContainer);
      return;
    }

    // Initialize all visible accordion groups
    document.querySelectorAll('.accordion').forEach((accordion) => {
      const style = globalThis.window.getComputedStyle(accordion);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        this.initAccordionGroup(accordion);
      }
    });
  },

  initAccordionGroup(accordion) {
    // If already initialized, just ensure state is correct
    if (this.initializedGroups.has(accordion)) {
      this.ensureCorrectState(accordion);
      return;
    }

    const accordionItems = accordion.querySelectorAll('.accordion-item');
    if (!accordionItems.length) return;

    const groupData = {
      accordion: accordion,
      accordionItems: accordionItems,
      activeItem: null,
      itemElements: new Map(),
    };

    // Fetch all elements for each accordion item
    accordionItems.forEach((item) => {
      const elements = {
        action: item.querySelector('.accordion-action'),
        content: item.querySelector('.accordion-content'),
        plusIconSpans: item.querySelectorAll('.accordion-plus-icon span'),
        accordionArrow: item.querySelector('.accordion-arrow svg'),
        accordionArrowSpan: item.querySelector('.accordion-arrow'),
      };
      groupData.itemElements.set(item, elements);

      // Initialize state based on active-accordion class
      if (item.classList.contains('active-accordion')) {
        elements.content.classList.remove('hidden');
        elements.content.style.height = 'auto';
        groupData.activeItem = item;
        this.setOpenState(item, elements);
      } else {
        // Ensure closed accordions are properly hidden
        elements.content.classList.add('hidden');
        elements.content.style.height = '0px';
        elements.content.style.opacity = '0';
        this.setClosedState(item, elements);
      }

      // Add click event listener
      if (elements.action) {
        elements.action.addEventListener('click', (e) => {
          e.preventDefault();

          if (groupData.activeItem && groupData.activeItem !== item) {
            this.closeAccordion(
              groupData.activeItem,
              groupData.itemElements.get(groupData.activeItem)
            );
          }

          if (groupData.activeItem === item) {
            this.closeAccordion(item, elements);
            groupData.activeItem = null;
          } else {
            this.openAccordion(item, elements);
            groupData.activeItem = item;
          }
        });
      }
    });

    this.accordionGroups.set(accordion, groupData);
    this.initializedGroups.add(accordion);
    this.initAnimation(accordionItems);
  },

  setOpenState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'true';
    action.dataset.state = 'true';
    content.dataset.state = 'true';

    // Set icon states for default open item
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].style.transform = 'rotate(90deg)';
      plusIconSpans[1].dataset.state = 'true';
    }

    if (accordionArrow) {
      accordionArrow.style.transform = 'rotate(180deg)';
      accordionArrow.dataset.state = 'true';
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'true';
    }
  },

  ensureCorrectState(accordion) {
    const groupData = this.accordionGroups.get(accordion);
    if (!groupData) return;

    // Kill any ongoing GSAP animations
    if (typeof gsap !== 'undefined') {
      groupData.accordionItems.forEach((item) => {
        const elements = groupData.itemElements.get(item);
        if (!elements) return;
        gsap.killTweensOf(elements.content);
        if (elements.accordionArrow) gsap.killTweensOf(elements.accordionArrow);
        if (elements.plusIconSpans.length > 0 && elements.plusIconSpans[1]) {
          gsap.killTweensOf(elements.plusIconSpans[1]);
        }
      });
    }

    // Reset all accordions to their initial state
    groupData.activeItem = null;
    groupData.accordionItems.forEach((item) => {
      const elements = groupData.itemElements.get(item);
      if (!elements) return;

      if (item.classList.contains('active-accordion')) {
        elements.content.classList.remove('hidden');
        elements.content.style.height = 'auto';
        elements.content.style.opacity = '1';
        groupData.activeItem = item;
        this.setOpenState(item, elements);
      } else {
        elements.content.classList.add('hidden');
        elements.content.style.height = '0px';
        elements.content.style.opacity = '0';
        this.setClosedState(item, elements);
        // Reset icon transforms
        if (elements.accordionArrow) elements.accordionArrow.style.transform = 'rotate(0deg)';
        if (elements.plusIconSpans.length > 0 && elements.plusIconSpans[1]) {
          elements.plusIconSpans[1].style.transform = 'rotate(0deg)';
        }
      }
    });
  },

  setClosedState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'false';
    action.dataset.state = 'false';
    content.dataset.state = 'false';

    // Set icon states for closed item
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].dataset.state = 'false';
    }

    if (accordionArrow) {
      accordionArrow.dataset.state = 'false';
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'false';
    }
  },

  initAnimation(accordionItems) {
    if (!accordionItems) return;

    accordionItems.forEach((item, index) => {
      // Set initial state
      gsap.set(item, {
        opacity: 0,
        y: 50,
        filter: 'blur(20px)',
        overflow: 'hidden',
      });

      // Create scroll trigger animation
      gsap.fromTo(
        item,
        {
          opacity: 0,
          y: 50,
          filter: 'blur(20px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end: 'top 50%',
            scrub: false,
            once: true,
          },
        }
      );
    });
  },

  openAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'true';
    action.dataset.state = 'true';
    content.dataset.state = 'true';
    content.classList.remove('hidden');
    content.style.height = 'auto';
    const contentHeight = content.scrollHeight;
    content.style.height = '0px';

    gsap.to(content, {
      height: contentHeight,
      opacity: 1,
      duration: 0.3,
    });

    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 90,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          plusIconSpans[1].dataset.state = 'true';
        },
      });
    }

    if (accordionArrow) {
      accordionArrow.dataset.state = 'true';
      gsap.to(accordionArrow, {
        rotation: -180,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'true';
    }
  },

  closeAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'false';
    action.dataset.state = 'false';

    content.style.height = 'auto';
    const contentHeight = content.scrollHeight;

    content.style.height = contentHeight + 'px';

    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        content.classList.add('hidden');
        content.style.height = '0px';
        content.dataset.state = 'false';
      },
    });

    // Animate minus icon back to plus (if exists)
    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          plusIconSpans[1].dataset.state = 'false';
        },
      });
    }

    // Animate accordion arrow back (if exists)
    if (accordionArrow) {
      accordionArrow.dataset.state = 'false';
      gsap.to(accordionArrow, {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'false';
    }
  },
};

if (globalThis.document !== undefined) {
  // Make accordionAnimation globally available
  globalThis.accordionAnimation = accordionAnimation;

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      accordionAnimation.init();
    });
  } else {
    accordionAnimation.init();
  }
}

// Export for use in other modules
export { accordionAnimation };
