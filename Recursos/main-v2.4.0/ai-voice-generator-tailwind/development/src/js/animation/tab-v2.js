// Trigger reveal animation for an element
const triggerRevealAnimation = (element) => {
  if (!element || typeof gsap === 'undefined') return;

  gsap.killTweensOf(element);
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'linear',
    }
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('[data-tab-content]');
  const activeIndicator = document.querySelector('[data-active-tab-indicator]');
  const tabContents = document.querySelectorAll('[data-tab-contents-container] [data-tab-content]');
  const tabContainer = document.querySelector('[data-tab-items-container]');

  if (!tabButtons.length || !activeIndicator || !tabContents.length) {
    return;
  }

  // Initialize: Find the selected tab button
  let selectedButton = document.querySelector('[data-selected]');
  if (!selectedButton && tabButtons.length > 0) {
    selectedButton = tabButtons[0];
    selectedButton.dataset.selected = '';
  }

  // Set initial position, width, and height of indicator
  const updateIndicator = (button) => {
    const containerRect = tabContainer.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const left = buttonRect.left - containerRect.left;
    const top = buttonRect.top - containerRect.top;
    const width = buttonRect.width;
    const height = buttonRect.height;
    activeIndicator.style.left = `${left}px`;
    activeIndicator.style.top = `${top}px`;
    activeIndicator.style.width = `${width}px`;
    activeIndicator.style.height = `${height}px`;
  };

  // Show the correct content
  const showContent = (contentName) => {
    tabContents.forEach((content) => {
      if (content.dataset.tabContent === contentName) {
        // Remove hidden class and add flex
        content.classList.remove('hidden');
        content.classList.add('flex');
        // Update accessibility attributes
        content.setAttribute('aria-hidden', 'false');

        // Trigger reveal animation
        triggerRevealAnimation(content);
      } else {
        content.classList.add('hidden');
        content.classList.remove('flex');
        // Update accessibility attributes
        content.setAttribute('aria-hidden', 'true');
      }
    });
  };

  // Update button states
  const updateButtonStates = (activeButton) => {
    tabButtons.forEach((button) => {
      if (button === activeButton) {
        button.dataset.selected = '';
        button.setAttribute('aria-selected', 'true');
        button.setAttribute('tabindex', '0');
        button.classList.remove('text-secondary/60');
        button.classList.add('text-white');
      } else {
        delete button.dataset.selected;
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('tabindex', '-1');
        button.classList.remove('text-white');
        button.classList.add('text-secondary/60');
      }
    });
  };

  // Initialize on page load
  if (selectedButton) {
    const contentName = selectedButton.dataset.tabContent;
    updateIndicator(selectedButton);
    showContent(contentName);
    updateButtonStates(selectedButton);
  }

  // Add click handlers to all tab buttons
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const contentName = button.dataset.tabContent;

      // Update indicator position
      updateIndicator(button);

      // Show/hide content
      showContent(contentName);

      // Update button states
      updateButtonStates(button);
    });
  });

  // Handle window resize to recalculate indicator position
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentSelected = document.querySelector('[data-selected]');
      if (currentSelected) {
        updateIndicator(currentSelected);
      }
    }, 150);
  });
});
