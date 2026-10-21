const tabSlider = {
  // Default configuration
  defaults: {
    animationDuration: 0.3,
    animationEase: 'power2.out',
    activeTabBgColor: 'var(--color-background-7)',
    activeTabTextColor: 'var(--color-background-13)',
    inactiveTabTextColor: 'rgba(255, 255, 255, 0.6)',
  },

  init() {
    const wrappers = document.querySelectorAll('.tab-slider-wrapper');

    wrappers.forEach((wrapper) => {
      this.initWrapper(wrapper);
    });
  },

  initWrapper(wrapper) {
    // Get configuration from data attributes
    const config = this.getConfig(wrapper);

    // Get elements
    const activeTab = wrapper.querySelector('.active-tab');
    const inputs = wrapper.querySelectorAll('input[type="radio"]');
    const labels = wrapper.querySelectorAll('label[for]');
    const fieldset = wrapper.querySelector('fieldset');

    if (!activeTab || !inputs.length || !labels.length) {
      console.warn('Tab slider: Missing required elements');
      return;
    }

    // Set initial state
    this.setInitialState(wrapper, activeTab, config);

    // Add event listeners
    this.addEventListeners(wrapper, inputs, labels, activeTab, config);

    // Store reference for cleanup
    wrapper._tabSliderConfig = config;
  },

  getConfig(wrapper) {
    return {
      animationDuration:
        parseFloat(wrapper.dataset.animationDuration) || this.defaults.animationDuration,
      animationEase: wrapper.dataset.animationEase || this.defaults.animationEase,
      activeTabBgColor: wrapper.dataset.activeTabBgColor || this.defaults.activeTabBgColor,
      activeTabTextColor: wrapper.dataset.activeTabTextColor || this.defaults.activeTabTextColor,
      inactiveTabTextColor:
        wrapper.dataset.inactiveTabTextColor || this.defaults.inactiveTabTextColor,
      activeTabId: wrapper.dataset.activeTabId || '',
    };
  },

  setInitialState(wrapper, activeTab, config) {
    // Set initial styles
    activeTab.style.backgroundColor = config.activeTabBgColor;
    activeTab.style.color = config.activeTabTextColor;

    // Find the initially checked tab
    const checkedInput = wrapper.querySelector('input[type="radio"]:checked');
    if (checkedInput) {
      this.animateToTab(wrapper, checkedInput, activeTab, config, false);
    }
  },

  addEventListeners(wrapper, inputs, labels, activeTab, config) {
    inputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.animateToTab(wrapper, e.target, activeTab, config, true);
        }
      });
    });

    // Add click handlers to labels for better UX
    labels.forEach((label) => {
      label.addEventListener('click', (e) => {
        const input = wrapper.querySelector(`input[id="${label.getAttribute('for')}"]`);
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  },

  animateToTab(wrapper, targetInput, activeTab, config, animate = true) {
    const targetLabel = wrapper.querySelector(`label[for="${targetInput.id}"]`);
    if (!targetLabel) return;

    // Get dimensions
    const wrapperRect = wrapper.getBoundingClientRect();
    const labelRect = targetLabel.getBoundingClientRect();
    const fieldset = wrapper.querySelector('fieldset');
    const fieldsetRect = fieldset.getBoundingClientRect();

    // Calculate position relative to the fieldset (accounting for padding)
    const translateX = labelRect.left - fieldsetRect.left;
    const translateY = labelRect.top - fieldsetRect.top;
    const width = labelRect.width;
    const height = labelRect.height;

    // Update active tab ID
    wrapper.dataset.activeTabId = targetInput.id;

    if (animate && window.gsap) {
      // Animate background and colors simultaneously for better visual effect
      gsap.to(activeTab, {
        width: width,
        height: height,
        x: translateX,
        y: translateY,
        duration: config.animationDuration,
        ease: config.animationEase,
      });

      // Start color animation immediately, not after background completes
      this.updateTabColors(wrapper, targetInput, config);
    } else {
      // Set immediately (for initial state)
      activeTab.style.width = `${width}px`;
      activeTab.style.height = `${height}px`;
      activeTab.style.transform = `translate(${translateX}px, ${translateY}px)`;
      this.updateTabColors(wrapper, targetInput, config);
    }
  },

  updateTabColors(wrapper, activeInput, config) {
    const labels = wrapper.querySelectorAll('label[for]');

    labels.forEach((label) => {
      const input = wrapper.querySelector(`input[id="${label.getAttribute('for')}"]`);

      if (input === activeInput) {
        // Active tab styling - smooth buttery color transition
        gsap.to(label, {
          color: config.activeTabTextColor,
          duration: 0.15, // Very fast but smooth
          ease: 'power2.out',
        });
      } else {
        // Inactive tab styling - remove inline color to let CSS take over
        gsap.to(label, {
          color: '', // Empty string removes inline color, allowing CSS to control
          duration: 0.15, // Very fast but smooth
          ease: 'power2.out',
        });
      }
    });
  },

  // Public method to programmatically switch tabs
  switchToTab(wrapper, tabId) {
    const input = wrapper.querySelector(`input[id="${tabId}"]`);
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    }
  },

  // Public method to get current active tab
  getActiveTab(wrapper) {
    return wrapper.querySelector('input[type="radio"]:checked')?.id;
  },

  // Public method to destroy instance
  destroy(wrapper) {
    const inputs = wrapper.querySelectorAll('input[type="radio"]');
    const labels = wrapper.querySelectorAll('label[for]');

    inputs.forEach((input) => {
      input.removeEventListener('change', this.handleInputChange);
    });

    labels.forEach((label) => {
      label.removeEventListener('click', this.handleLabelClick);
    });

    delete wrapper._tabSliderConfig;
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  tabSlider.init();
});

// Re-initialize on dynamic content changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Element node
        if (node.classList && node.classList.contains('tab-slider-wrapper')) {
          tabSlider.initWrapper(node);
        }
        // Check for tab sliders in added nodes
        const tabSliders = node.querySelectorAll && node.querySelectorAll('.tab-slider-wrapper');
        if (tabSliders) {
          tabSliders.forEach((wrapper) => tabSlider.initWrapper(wrapper));
        }
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Export for use in other modules
window.tabSlider = tabSlider;
