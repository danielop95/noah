class ModalAnimation {
  constructor() {
    this.modalAction = null;
    this.modalOverlay = null;
    this.modalCloseBtn = null;
    this.modalContent = null;
    this.isModalOpen = false;
    this.hasTriggeredByScroll = false;
    this.previouslyFocusedElement = null;

    this.animationConfig = {
      open: {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      },
      close: {
        opacity: 0,
        y: -50,
        duration: 0.2,
        ease: 'power2.in',
      },
    };
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.bindScrollTrigger();
  }

  cacheElements() {
    this.modalAction = document.querySelector('.modal-action');
    this.modalOverlay = document.querySelector('.modal-overlay');
    this.modalCloseBtn =
      document.querySelector('.modal-close-btn') || document.querySelector('.close-join-modal');
    this.modalContent = document.querySelector('.modal-content');
  }

  bindEvents() {
    this.modalAction?.addEventListener('click', () => this.openModal());

    if (this.modalCloseBtn && !this.modalCloseBtn.hasAttribute('data-events-bound')) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal(true));
      this.modalCloseBtn.setAttribute('data-events-bound', 'true');
    }

    if (this.modalOverlay && !this.modalOverlay.hasAttribute('data-events-bound')) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal(false);
        }
      });
      this.modalOverlay.setAttribute('data-events-bound', 'true');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal(false);
      }
    });
  }

  bindScrollTrigger() {
    // Only bind scroll trigger for join modal - find it specifically
    const findJoinModal = () => {
      return Array.from(document.querySelectorAll('.modal-overlay')).find(
        (overlay) =>
          overlay.querySelector('.close-join-modal') || overlay.querySelector('#join-modal-title')
      );
    };

    // Check if join modal exists
    const joinModalOverlay = findJoinModal();
    if (!joinModalOverlay) return;

    const dismissed = window.localStorage.getItem('joinModalDismissed') === 'true';
    if (dismissed) return;

    const tryTrigger = () => {
      if (this.hasTriggeredByScroll) return;

      // Always find the join modal specifically (don't rely on cached elements)
      const currentJoinModalOverlay = findJoinModal();
      if (!currentJoinModalOverlay) return;

      const joinModalContent = currentJoinModalOverlay.querySelector('.modal-content');
      if (!joinModalContent) return;

      const scrollPosition =
        window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (scrollPosition >= 800) {
        this.hasTriggeredByScroll = true;
        // Set the join modal elements before opening
        this.modalOverlay = currentJoinModalOverlay;
        this.modalContent = joinModalContent;
        this.modalCloseBtn =
          currentJoinModalOverlay.querySelector('.close-join-modal') ||
          currentJoinModalOverlay.querySelector('.modal-close-btn');

        // Bind events if they weren't bound initially (in case join modal wasn't found at init)
        if (this.modalOverlay && !this.modalOverlay.hasAttribute('data-events-bound')) {
          this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
              this.closeModal(false);
            }
          });
          this.modalOverlay.setAttribute('data-events-bound', 'true');
        }
        if (this.modalCloseBtn && !this.modalCloseBtn.hasAttribute('data-events-bound')) {
          this.modalCloseBtn.addEventListener('click', () => this.closeModal(true));
          this.modalCloseBtn.setAttribute('data-events-bound', 'true');
        }

        this.openModal();
        window.removeEventListener('scroll', tryTrigger);
      }
    };

    window.addEventListener('scroll', tryTrigger, { passive: true });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      tryTrigger();
    } else {
      document.addEventListener('DOMContentLoaded', tryTrigger, { once: true });
    }
  }

  async closeModal(persist = false) {
    if (!this.isModalOpen || !this.modalOverlay) return;

    this.isModalOpen = false;
    document.body.style.overflow = 'auto';

    if (persist) {
      try {
        window.localStorage.setItem('joinModalDismissed', 'true');
      } catch (_) {}
    }

    try {
      if (this.modalContent) {
        await gsap.to(this.modalContent, {
          ...this.animationConfig.close,
          onComplete: () => {
            this.modalOverlay.classList.remove('modal-open');
            this.modalOverlay.classList.add('modal-close');
            this.modalOverlay.setAttribute('aria-hidden', 'true');
          },
        });
      } else {
        this.modalOverlay.classList.remove('modal-open');
        this.modalOverlay.classList.add('modal-close');
        this.modalOverlay.setAttribute('aria-hidden', 'true');
      }
    } catch (error) {
      console.error('Error closing modal:', error);
    }

    if (
      this.previouslyFocusedElement &&
      typeof this.previouslyFocusedElement.focus === 'function'
    ) {
      this.previouslyFocusedElement.focus();
    }
  }

  openModal() {
    if (this.isModalOpen || !this.modalOverlay) return;

    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';

    this.modalOverlay.classList.remove('modal-close');
    this.modalOverlay.classList.add('modal-open');
    this.modalOverlay.setAttribute('aria-hidden', 'false');

    if (this.modalContent) {
      gsap.set(this.modalContent, {
        opacity: 0,
        y: -50,
      });

      gsap.to(this.modalContent, this.animationConfig.open);
      this.previouslyFocusedElement = document.activeElement;
      this.modalContent.style.outline = 'none';
      this.modalContent.style.boxShadow = 'none';
      this.modalContent.setAttribute('tabindex', '-1');
      this.modalContent.focus();
    }
  }
}

const modalAnimation = new ModalAnimation();

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      modalAnimation.init();
    });
  } else {
    modalAnimation.init();
  }
}
