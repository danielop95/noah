class ModalAnimation {
  constructor() {
    this.modal = null;
    this.content = null;
    this.isOpen = false;
    this.isAnimating = false;
    this.scrollTriggered = false;

    this.config = {
      scrollThreshold: 800,
      storageKey: 'joinModalDismissed',
      animation: {
        duration: 300,
        closeDelay: 200,
      },
    };
  }

  init() {
    this.bindEvents();
    this.setupScrollTrigger();
  }

  // Event binding
  bindEvents() {
    document.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleClick(e) {
    // Open modal
    const trigger = e.target.closest('.modal-action');
    if (trigger) {
      e.preventDefault();
      this.open(trigger);
      return;
    }

    // Close modal
    const closeBtn = e.target.closest('.modal-close-btn, .close-join-modal');
    const overlay = e.target.classList?.contains('modal-overlay');

    if (closeBtn) {
      this.close(true);
    } else if (overlay && e.target === this.modal) {
      this.close(false);
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close(false);
    }
  }

  // Open modal
  open(trigger) {
    if (this.isAnimating) return;

    const overlay = trigger.closest('.modal-overlay') || document.querySelector('.modal-overlay');
    if (!overlay) return;

    // If modal is open, close it first then open with new video
    if (this.isOpen) {
      this.close(false);
      setTimeout(() => {
        this._openWithVideo(overlay, trigger);
      }, this.config.animation.closeDelay + 50);
      return;
    }

    this._openWithVideo(overlay, trigger);
  }

  _openWithVideo(overlay, trigger) {
    this.modal = overlay;
    this.content = overlay.querySelector('.modal-content');

    // Load video
    const videoUrl = trigger.dataset.videoUrl;
    if (videoUrl) this.loadVideo(videoUrl);

    this.show();
  }

  show() {
    this.isOpen = true;
    this.isAnimating = true;

    document.body.style.overflow = 'hidden';
    this.modal.classList.add('modal-open');
    this.modal.classList.remove('modal-close');
    this.modal.removeAttribute('aria-hidden');

    if (this.modal.tagName === 'DIALOG') {
      this.modal.showModal();
    }

    this.animate('open');
  }

  // Close modal
  close(persist = false) {
    if (!this.isOpen || this.isAnimating) return;

    this.isAnimating = true;
    this.isOpen = false;

    if (persist) {
      this.savePreference();
    }

    this.animate('close', () => {
      document.body.style.overflow = 'auto';
      this.modal.classList.remove('modal-open');
      this.modal.classList.add('modal-close');
      this.modal.setAttribute('aria-hidden', 'true');

      if (this.modal.tagName === 'DIALOG') {
        this.modal.close();
      }

      this.clearVideo();
      this.isAnimating = false;
    });
  }

  // Animation
  animate(type, callback) {
    if (!this.content) {
      this.isAnimating = false;
      callback?.();
      return;
    }

    // Fallback without GSAP
    if (typeof gsap === 'undefined') {
      if (type === 'open') {
        this.content.style.outline = 'none';
        this.content.setAttribute('tabindex', '-1');
        this.content.focus();
      }
      this.isAnimating = false;
      callback?.();
      return;
    }

    // GSAP animation
    gsap.killTweensOf(this.content);

    if (type === 'open') {
      this.content.style.outline = 'none';
      this.content.setAttribute('tabindex', '-1');

      gsap.fromTo(
        this.content,
        { opacity: 0, y: -50 },
        {
          opacity: 1,
          y: 0,
          duration: this.config.animation.duration / 1000,
          ease: 'power3.inOut',
          onComplete: () => {
            this.content.focus();
            this.isAnimating = false;
          },
        }
      );
    } else {
      gsap.to(this.content, {
        opacity: 0,
        y: -50,
        duration: this.config.animation.closeDelay / 1000,
        ease: 'power2.in',
        onComplete: callback,
      });
    }
  }

  // Video handling
  loadVideo(url) {
    const iframe = this.content?.querySelector('iframe');
    if (!iframe) return;

    iframe.src = '';
    requestAnimationFrame(() => {
      iframe.src = url;
    });
  }

  clearVideo() {
    const iframe = this.content?.querySelector('iframe');
    if (iframe) iframe.src = '';
  }

  // Scroll trigger
  setupScrollTrigger() {
    const joinModal = Array.from(document.querySelectorAll('.modal-overlay')).find((m) =>
      m.querySelector('.close-join-modal, #join-modal-title')
    );

    if (!joinModal || this.wasModalDismissed()) return;

    const handleScroll = () => {
      if (this.scrollTriggered) return;

      const scrollY = window.scrollY || document.documentElement.scrollTop;

      if (scrollY >= this.config.scrollThreshold) {
        this.scrollTriggered = true;
        this.modal = joinModal;
        this.content = joinModal.querySelector('.modal-content');
        this.show();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check immediately if already scrolled
    if (document.readyState !== 'loading') {
      handleScroll();
    }
  }

  // Storage
  wasModalDismissed() {
    return localStorage.getItem(this.config.storageKey) === 'true';
  }

  savePreference() {
    try {
      localStorage.setItem(this.config.storageKey, 'true');
    } catch (e) {
      console.warn('Could not save modal preference');
    }
  }

  // Cleanup
  destroy() {
    if (this.isOpen) this.close(false);
    // Event listeners would need to be stored to remove properly
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  const modal = new ModalAnimation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => modal.init(), { once: true });
  } else {
    modal.init();
  }
}
