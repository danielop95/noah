function initAccordions({ selector = '.accordion', allowMultiple = false, keyboard = true } = {}) {
  const accordions = document.querySelectorAll(selector);

  accordions.forEach((accordion, accIndex) => {
    const items = Array.from(accordion.querySelectorAll('.accordion-item'));

    if (!accordion.getAttribute('aria-label')) {
      accordion.setAttribute('aria-label', 'Accordion');
    }

    /* ---------------- State sync helper ---------------- */

    function updateState(item) {
      const state = item.getAttribute('data-state') || 'closed';

      const action = item.querySelector('.accordion-action');
      const icon = item.querySelector('.accordion-icon');

      if (action) action.setAttribute('data-state', state);
      if (icon) icon.setAttribute('data-state', state);
    }

    /* ---------------- Setup ---------------- */

    items.forEach((item, i) => {
      const accordionAction = item.querySelector('.accordion-action');
      const accordionContent = item.querySelector('.accordion-content');
      if (!accordionAction || !accordionContent) return;

      // Accessibility IDs
      const qId = `acc-q-${accIndex}-${i}`;
      const aId = `acc-a-${accIndex}-${i}`;
      accordionAction.id ||= qId;
      accordionContent.id ||= aId;

      accordionAction.setAttribute('aria-controls', accordionContent.id);
      accordionContent.setAttribute('role', 'region');
      accordionContent.setAttribute('aria-labelledby', accordionAction.id);

      // Animation styles
      accordionContent.style.overflow = 'hidden';
      accordionContent.style.transition = 'height 300ms ease-in-out, opacity 300ms ease-in-out';

      // Initial state
      const shouldOpen = item.getAttribute('data-default-open') === 'true';

      if (shouldOpen) openItem(item, accordionAction, accordionContent, false);
      else closeItem(item, accordionAction, accordionContent, false);

      updateState(item);
    });

    // Enforce single-open mode
    if (!allowMultiple) {
      const openDefaults = items.filter((it) => it.getAttribute('data-default-open') === 'true');

      openDefaults.slice(1).forEach((it) => {
        const btn = it.querySelector('.accordion-action');
        const c = it.querySelector('.accordion-content');
        if (btn && c) closeItem(it, btn, c, false);
        it.removeAttribute('data-default-open');
        updateState(it);
      });
    }

    /* ---------------- Click handling ---------------- */

    accordion.addEventListener('click', (e) => {
      const btn = e.target.closest('.accordion-action');
      if (!btn || !accordion.contains(btn)) return;

      e.preventDefault();

      const item = btn.closest('.accordion-item');
      if (!item) return;

      const accordionContent = item.querySelector('.accordion-content');
      if (!accordionContent) return;

      const isOpen = item.getAttribute('data-state') === 'open';

      if (isOpen) {
        closeItem(item, btn, accordionContent, true);
        updateState(item);
        return;
      }

      if (!allowMultiple) {
        items.forEach((it) => {
          if (it === item) return;
          if (it.getAttribute('data-state') === 'open') {
            const b = it.querySelector('.accordion-action');
            const c = it.querySelector('.accordion-content');
            if (b && c) closeItem(it, b, c, true);
            updateState(it);
          }
        });
      }

      openItem(item, btn, accordionContent, true);
      updateState(item);
    });

    /* ---------------- Keyboard support ---------------- */

    if (keyboard) {
      accordion.addEventListener('keydown', (e) => {
        const btn = e.target.closest('.accordion-action');
        if (!btn) return;

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    }
  });

  /* ---------------- SplitText helpers ---------------- */

  function canSplit() {
    return typeof gsap !== 'undefined' && typeof SplitText !== 'undefined';
  }

  function revertSplit(accordionContent) {
    accordionContent.querySelectorAll('p').forEach((el) => {
      if (el._split) {
        try {
          el._split.revert();
        } catch {}
        el._split = null;
      }
      if (canSplit()) gsap.set(el, { clearProps: 'all' });
    });
  }

  function animateSplitIn(accordionContent) {
    if (!canSplit()) return;

    accordionContent.querySelectorAll('p').forEach((el, i) => {
      if (!el.textContent.trim()) return;

      if (el._split) el._split.revert();
      gsap.killTweensOf(el);

      el._split = new SplitText(el, { type: 'lines' });

      gsap.set(el._split.lines, {
        opacity: 0,
        y: 24,
        rotationX: -90,
      });

      gsap.to(el._split.lines, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        delay: i * 0.05,
      });
    });
  }

  function animateSplitOut(accordionContent) {
    if (!canSplit()) return;

    accordionContent.querySelectorAll('p').forEach((el, i) => {
      if (!el.textContent.trim()) return;

      if (!el._split) el._split = new SplitText(el, { type: 'lines' });

      gsap.to(el._split.lines, {
        opacity: 0,
        y: -16,
        rotationX: 90,
        duration: 0.35,
        ease: 'power2.in',
        stagger: 0.03,
        delay: i * 0.02,
      });
    });
  }

  /* ---------------- Open / Close ---------------- */

  function openItem(item, btn, accordionContent, animate) {
    item.setAttribute('data-state', 'open');
    btn.setAttribute('aria-expanded', 'true');
    accordionContent.setAttribute('aria-hidden', 'false');

    if (!animate) {
      accordionContent.style.height = 'auto';
      accordionContent.style.opacity = '1';
      animateSplitIn(accordionContent);
      return;
    }

    revertSplit(accordionContent);

    accordionContent.style.height = '0px';
    accordionContent.style.opacity = '0';
    accordionContent.offsetHeight;

    const target = accordionContent.scrollHeight;

    animateSplitIn(accordionContent);

    requestAnimationFrame(() => {
      accordionContent.style.height = `${target}px`;
      accordionContent.style.opacity = '1';
    });

    accordionContent.addEventListener(
      'transitionend',
      (e) => {
        if (e.propertyName === 'height') {
          accordionContent.style.height = 'auto';
        }
      },
      { once: true }
    );
  }

  function closeItem(item, btn, accordionContent, animate) {
    item.setAttribute('data-state', 'closed');
    btn.setAttribute('aria-expanded', 'false');
    accordionContent.setAttribute('aria-hidden', 'true');

    if (!animate) {
      accordionContent.style.height = '0px';
      accordionContent.style.opacity = '0';
      revertSplit(accordionContent);
      return;
    }

    animateSplitOut(accordionContent);

    const current = accordionContent.scrollHeight;
    accordionContent.style.height = `${current}px`;
    accordionContent.style.opacity = '1';
    accordionContent.offsetHeight;

    setTimeout(() => {
      requestAnimationFrame(() => {
        accordionContent.style.height = '0px';
        accordionContent.style.opacity = '0';
      });
    }, 80);

    accordionContent.addEventListener(
      'transitionend',
      (e) => {
        if (e.propertyName === 'height') {
          revertSplit(accordionContent);
        }
      },
      { once: true }
    );
  }
}

/* ---------------- Usage ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  initAccordions({
    allowMultiple: false,
    keyboard: true,
  });
});
