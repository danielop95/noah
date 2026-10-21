/* =========================
 Tab Item Filter js 
=========================== */

let tabFilterInitialized = false;

const tabFilter = {
  init() {
    if (tabFilterInitialized) return;

    const tabBarBtns = document.querySelectorAll('[data-tab-button]');
    const activeTabBar = document.querySelector('[data-active-tab-bar]');
    const mobileTabBtns = document.querySelectorAll('[data-mobile-tab-button]');
    const articles = document.querySelectorAll('[data-filter-item]');

    if ((!tabBarBtns.length && !mobileTabBtns.length) || !articles.length) {
      return;
    }

    let currentIndex = 0;

    // Get category from button text
    const getButtonCategory = (btn) => {
      const text = btn.textContent.trim().toLowerCase();
      return text === 'ai software' ? 'ai software' : text;
    };

    // Update active tab bar position
    const updateTabBar = (button) => {
      if (!activeTabBar || !button) return;
      const tabBar = activeTabBar.closest('[data-tab-bar]');
      if (!tabBar) return;

      const left = button.getBoundingClientRect().left - tabBar.getBoundingClientRect().left;
      activeTabBar.style.left = `${left}px`;
      activeTabBar.style.width = `${button.offsetWidth}px`;
    };

    // Filter and categorize articles
    const filterArticles = (category) => {
      const filtered = [];
      const hidden = [];

      articles.forEach((container) => {
        const containerCategory = container.dataset.filterCategory?.toLowerCase() || '';
        const show = category === 'all' || containerCategory === category;

        if (show) {
          filtered.push(container);
        } else {
          hidden.push(container);
        }
      });

      return { filtered, hidden };
    };

    // Animate filter transition with GSAP
    const animateFilter = async (filtered, hidden) => {
      const allContainers = [...filtered, ...hidden];
      const canAnimate = typeof gsap !== 'undefined' && gsap && typeof gsap.to === 'function';

      if (!canAnimate) {
        // Fallback: toggle visibility without animations
        hidden.forEach((container) => {
          container.style.display = 'none';
          container.setAttribute('aria-hidden', 'true');
        });

        filtered.forEach((container) => {
          container.style.display = 'block';
          container.setAttribute('aria-hidden', 'false');
          container.style.opacity = '1';
          container.style.transform = 'none';
          container.style.filter = 'none';
        });
        return;
      }

      // First fade out all articles using GSAP
      const fadeOutTweens = allContainers.map((container) =>
        gsap.to(container, {
          opacity: 0,
          scale: 0.95,
          filter: 'blur(4px)',
          duration: 0.3,
          ease: 'power2.inOut',
        })
      );

      // Wait for fade out to complete
      await Promise.all(fadeOutTweens.map((tween) => tween.then()));

      // Hide articles that don't match filter
      hidden.forEach((container) => {
        container.style.display = 'none';
        container.setAttribute('aria-hidden', 'true');
      });

      // Show filtered articles
      filtered.forEach((container) => {
        container.style.display = 'block';
        container.setAttribute('aria-hidden', 'false');
        // Reset transform and opacity for animation
        container.style.opacity = '0';
        container.style.transform = 'scale(0.95)';
        container.style.filter = 'blur(4px)';
      });

      // Animate filtered articles with staggered fade-in using GSAP
      const fadeInTweens = filtered.map((container, index) =>
        gsap.to(container, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
        })
      );

      // Wait for fade in to complete
      await Promise.all(fadeInTweens.map((tween) => tween.then()));
    };

    // Switch filter with animation
    const switchFilter = async (index, buttons) => {
      if (index < 0 || index >= buttons.length) return;

      currentIndex = index;
      const category = getButtonCategory(buttons[index]);

      // Update desktop buttons
      if ('tabButton' in buttons[0].dataset) {
        buttons.forEach((btn, i) => {
          btn.dataset.state = i === index ? 'selected' : '';
        });
        updateTabBar(buttons[index]);
      }

      // Update mobile buttons
      if ('mobileTabButton' in buttons[0].dataset) {
        buttons.forEach((btn, i) => {
          if (i === index) {
            btn.dataset.mobileActive = 'true';
          } else {
            delete btn.dataset.mobileActive;
          }
        });
      }

      // Apply filter with animation
      const { filtered, hidden } = filterArticles(category);
      await animateFilter(filtered, hidden);

      // Dispatch custom event for analytics or other integrations
      const filterEvent = new CustomEvent('blogFiltered', {
        detail: {
          category: category,
          filteredCount: filtered.length,
          totalCount: articles.length,
        },
      });
      document.dispatchEvent(filterEvent);
    };

    // Setup desktop buttons
    if (tabBarBtns.length) {
      tabBarBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => switchFilter(index, tabBarBtns));
      });
      switchFilter(0, tabBarBtns);
      setTimeout(() => updateTabBar(tabBarBtns[0]), 0);
    }

    // Setup mobile buttons
    if (mobileTabBtns.length) {
      mobileTabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => switchFilter(index, mobileTabBtns));
      });
      switchFilter(0, mobileTabBtns);
    }

    // Handle resize
    if (activeTabBar && tabBarBtns.length) {
      globalThis.window.addEventListener('resize', () => {
        if (tabBarBtns[currentIndex]) {
          updateTabBar(tabBarBtns[currentIndex]);
        }
      });
    }

    // Add CSS for smooth transitions
    const filterCSS = `
      [data-filter-item] {
        will-change: opacity, transform, filter;
        transform-origin: center;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      [data-filter-item][aria-hidden="true"] {
        opacity: 0;
        transform: scale(0.95);
        filter: blur(4px);
        pointer-events: none;
      }
      
      [data-filter-item][aria-hidden="false"] {
        opacity: 1;
        transform: scale(1);
        filter: blur(0px);
        pointer-events: auto;
      }
      
      /* Smooth transitions for tab bar */
      [data-tab-button] {
        transition: color 0.3s ease, background-color 0.3s ease;
      }
      
      /* Mobile filter button styles */
      [data-mobile-tab-button] {
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
      }
      
      [data-mobile-tab-button]:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      /* Active tab bar transition */
      [data-active-tab-bar] {
        transition: left 0.3s ease, width 0.3s ease;
      }
      
      /* Reduce motion for users who prefer it */
      @media (prefers-reduced-motion: reduce) {
        [data-filter-item],
        [data-mobile-tab-button],
        [data-active-tab-bar] {
          transition: none;
          transform: none !important;
        }
      }
    `;

    // Inject CSS
    if (!document.querySelector('#tab-filter-styles')) {
      const style = document.createElement('style');
      style.id = 'tab-filter-styles';
      style.textContent = filterCSS;
      document.head.appendChild(style);
    }

    tabFilterInitialized = true;
  },
};

// Auto-initialize
if (globalThis.window) {
  const init = () => {
    if (
      (document.querySelector('[data-tab-button]') ||
        document.querySelector('[data-mobile-tab-button]')) &&
      !tabFilterInitialized
    ) {
      tabFilter.init();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { tabFilter };
export function initTabFilter() {
  tabFilter.init();
}
