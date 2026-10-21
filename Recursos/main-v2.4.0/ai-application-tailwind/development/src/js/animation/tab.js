/* =========================
Tab animation js 
=========================== */

let currentIndex = 0;
let initialized = false;

function init() {
  if (initialized) return;

  const tabBarBtns = document.querySelectorAll('[data-tab-button]');
  const mobileTabBtns = document.querySelectorAll('[data-mobile-tab-button]');
  const tabContent = document.querySelectorAll('[data-tab-content]');
  const activeTabBar = document.querySelector('[data-active-tab-bar]');

  // Check if elements exist
  if ((!tabBarBtns.length && !mobileTabBtns.length) || !tabContent.length) {
    return;
  }

  // Setup desktop tabs
  if (tabBarBtns.length) {
    tabBarBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => switchTab(index));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTab(index);
        }
      });
    });
    switchTab(0);
  }

  // Setup mobile tabs
  if (mobileTabBtns.length) {
    mobileTabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => switchMobileTab(index));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchMobileTab(index);
        }
      });
    });
    switchMobileTab(0);
  }

  // Handle resize for active tab bar
  if (activeTabBar && tabBarBtns.length) {
    window.addEventListener('resize', () => {
      if (tabBarBtns[currentIndex]) {
        updateActiveTabBar(tabBarBtns[currentIndex], activeTabBar);
      }
    });
  }

  initialized = true;
}

function switchTab(index) {
  const tabBarBtns = document.querySelectorAll('[data-tab-button]');
  const tabContent = document.querySelectorAll('[data-tab-content]');
  const activeTabBar = document.querySelector('[data-active-tab-bar]');

  if (index < 0 || index >= tabBarBtns.length) return;

  currentIndex = index;

  // Update button states
  tabBarBtns.forEach((btn, i) => {
    btn.dataset.state = i === index ? 'selected' : '';
    btn.setAttribute('aria-selected', i === index);
  });

  // Update active tab bar position
  if (activeTabBar) {
    updateActiveTabBar(tabBarBtns[index], activeTabBar);
  }

  // Switch content
  switchContent(index, tabContent);
}

function switchMobileTab(index) {
  const mobileTabBtns = document.querySelectorAll('[data-mobile-tab-button]');
  const tabContent = document.querySelectorAll('[data-tab-content]');

  if (index < 0 || index >= mobileTabBtns.length) return;

  currentIndex = index;

  // Update mobile button states
  mobileTabBtns.forEach((btn, i) => {
    if (i === index) {
      btn.dataset.mobileActive = 'true';
    } else {
      delete btn.dataset.mobileActive;
    }
    btn.setAttribute('aria-selected', i === index);
  });

  // Switch content
  switchContent(index, tabContent);
}

function updateActiveTabBar(activeButton, activeTabBar) {
  if (!activeTabBar || !activeButton) return;

  const tabBar = activeTabBar.closest('[data-tab-bar]');
  if (!tabBar) return;

  const left = activeButton.getBoundingClientRect().left - tabBar.getBoundingClientRect().left;
  const width = activeButton.offsetWidth;

  activeTabBar.style.left = `${left}px`;
  activeTabBar.style.width = `${width}px`;
}

function switchContent(targetIndex, tabContent) {
  tabContent.forEach((content, index) => {
    if (targetIndex === index) {
      content.style.display = 'block';
      content.setAttribute('aria-hidden', 'false');

      // Animate with GSAP if available
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          content,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'power2.out' }
        );
      }

      // Reset accordion state when tab becomes visible
      requestAnimationFrame(() => {
        const accordion = content.querySelector('.accordion');
        if (accordion && globalThis.accordionAnimation) {
          globalThis.accordionAnimation.initAccordionGroup(accordion);
        }
      });
    } else {
      content.style.display = 'none';
      content.setAttribute('aria-hidden', 'true');
    }
  });
}

// Auto-initialize when DOM is ready
if (globalThis.window !== undefined) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { init, switchMobileTab, switchTab };
export function initTab() {
  init();
}
