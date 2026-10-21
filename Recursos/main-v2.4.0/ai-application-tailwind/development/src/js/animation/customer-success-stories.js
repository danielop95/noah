/* ========================================
   Customer Success Stories - Filter & Animation
   ======================================= */

const currentFilters = {
  industry: 'all',
  product: 'all',
  service: 'all',
  solution: 'all',
};

/* ========================================
   DROPDOWN FUNCTIONS
   ======================================== */

function closeDropdown(button, dropdown) {
  if (!dropdown) return;

  dropdown.classList.remove('active');
  dropdown.style.opacity = '0';
  dropdown.style.pointerEvents = 'none';

  const chevronIcon = button?.querySelector('svg');
  if (chevronIcon) {
    chevronIcon.style.transform = 'rotate(0deg)';
  }
}

function openDropdown(button, dropdown) {
  if (!dropdown) return;

  dropdown.classList.add('active');
  dropdown.style.opacity = '1';
  dropdown.style.pointerEvents = 'auto';

  const chevronIcon = button?.querySelector('svg');
  if (chevronIcon) {
    chevronIcon.style.transform = 'rotate(180deg)';
  }
}

function closeAllDropdownsExcept(excludeDropdown) {
  const allButtons = document.querySelectorAll('.dropdown-button');
  allButtons.forEach((button) => {
    const dropdown = button.parentElement.querySelector('.customer-dropdown-menu');
    if (dropdown && dropdown !== excludeDropdown) {
      closeDropdown(button, dropdown);
    }
  });
}

/* ========================================
   FILTER & COUNT FUNCTIONS
   ======================================== */

// Count how many cards match a specific filter
function countStoriesByFilter(filterType, filterValue) {
  const allCards = document.querySelectorAll('.story-card');

  if (filterValue === 'all') {
    return allCards.length;
  }

  let count = 0;
  allCards.forEach((card) => {
    const cardValue = card.getAttribute(`data-${filterType}`);
    if (cardValue && cardValue.toLowerCase() === filterValue.toLowerCase()) {
      count++;
    }
  });

  return count;
}

// Update the numbers in dropdown items
function updateDropdownCounts() {
  const allDropdownItems = document.querySelectorAll('[data-value][data-filter-type]');

  allDropdownItems.forEach((item) => {
    const filterType = item.getAttribute('data-filter-type');
    const filterValue = item.getAttribute('data-value');

    if (filterType && filterValue) {
      const count = countStoriesByFilter(filterType, filterValue);
      const countSpan = item.querySelectorAll('span')[1];
      if (countSpan) {
        countSpan.textContent = count;
      }
    }
  });
}

/* ========================================
   ANIMATION FUNCTION
   ======================================== */

function animateVisibleCards() {
  const visibleCards = document.querySelectorAll(
    '.story-card[style*="display: block"], .story-card:not([style*="display: none"])'
  );

  visibleCards.forEach((card, index) => {
    if (!card.hasAttribute('data-ns-animate')) return;

    const duration = card.getAttribute('data-duration')
      ? parseFloat(card.getAttribute('data-duration'))
      : 0.6;
    const offset = card.getAttribute('data-offset')
      ? parseFloat(card.getAttribute('data-offset'))
      : 60;
    const direction = card.getAttribute('data-direction') || 'down';

    const animationProps = {
      opacity: 0,
      filter: 'blur(16px)',
      duration: duration,
      delay: index * 0.1,
    };

    // Add movement based on direction
    if (direction === 'down') {
      animationProps.y = offset;
    }

    gsap.from(card, animationProps);
  });
}

/* ========================================
   MAIN FILTER FUNCTION
   ======================================== */

// Show/hide cards based on selected filter and animate them
function filterStories() {
  const allCards = document.querySelectorAll('.story-card');
  const allFiltersAreDefault =
    currentFilters.industry === 'all' &&
    currentFilters.product === 'all' &&
    currentFilters.service === 'all' &&
    currentFilters.solution === 'all';

  // If no filter is selected, show all cards
  if (allFiltersAreDefault) {
    allCards.forEach((card) => {
      card.style.display = 'block';
    });
    animateVisibleCards();
    return;
  }

  // Filter cards based on active filter (OR logic)
  allCards.forEach((card) => {
    const industryMatch =
      currentFilters.industry !== 'all' &&
      card.getAttribute('data-industry')?.toLowerCase() === currentFilters.industry.toLowerCase();

    const productMatch =
      currentFilters.product !== 'all' &&
      card.getAttribute('data-product') === currentFilters.product;

    const serviceMatch =
      currentFilters.service !== 'all' &&
      card.getAttribute('data-service') === currentFilters.service;

    const solutionMatch =
      currentFilters.solution !== 'all' &&
      card.getAttribute('data-solution') === currentFilters.solution;

    // Show card if it matches any active filter
    if (industryMatch || productMatch || serviceMatch || solutionMatch) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  animateVisibleCards();
}

/* ========================================
   EVENT LISTENERS
   ======================================== */
const dropdownButtons = document.querySelectorAll('.dropdown-button');

dropdownButtons.forEach((button) => {
  const dropdown = button.parentElement.querySelector('.customer-dropdown-menu');
  const dropdownItems = dropdown?.querySelectorAll('[data-value]');

  if (!button || !dropdown) return;

  // Toggle dropdown on button click
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    if (dropdown.classList.contains('active')) {
      closeDropdown(button, dropdown);
    } else {
      closeAllDropdownsExcept(dropdown);
      openDropdown(button, dropdown);
    }
  });

  // Handle dropdown item selection
  if (dropdownItems) {
    dropdownItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();

        const selectedText = item.querySelector('span').textContent;
        const filterType = item.getAttribute('data-filter-type');
        const filterValue = item.getAttribute('data-value');

        // Update button text with selected value
        const buttonText = button.querySelector('span');
        if (buttonText) {
          buttonText.textContent = selectedText;
        }

        if (filterType && filterValue) {
          // Reset all filters and set only the selected one
          currentFilters.industry = 'all';
          currentFilters.product = 'all';
          currentFilters.service = 'all';
          currentFilters.solution = 'all';
          currentFilters[filterType] = filterValue;

          // Reset all other dropdown buttons to default "All X" text
          const allButtons = document.querySelectorAll('.dropdown-button');
          allButtons.forEach((btn) => {
            const btnName = btn.getAttribute('name');
            if (btnName !== filterType) {
              const btnText = btn.querySelector('span');
              if (btnText) {
                if (btnName === 'industry') btnText.textContent = 'All Industries';
                else if (btnName === 'product') btnText.textContent = 'All Products';
                else if (btnName === 'service') btnText.textContent = 'All Services';
                else if (btnName === 'solution') btnText.textContent = 'All Solutions';
              }
            }
          });

          // Reset active states in all other dropdowns
          const allDropdowns = document.querySelectorAll('.customer-dropdown-menu');
          allDropdowns.forEach((dd) => {
            const ddItems = dd.querySelectorAll('[data-value]');
            ddItems.forEach((ddItem) => {
              const itemFilterType = ddItem.getAttribute('data-filter-type');
              const itemValue = ddItem.getAttribute('data-value');

              ddItem.classList.remove('bg-white', 'dark:bg-background-8');

              // Mark "all" items as active in other dropdowns
              if (itemFilterType !== filterType && itemValue === 'all') {
                ddItem.classList.add('bg-white', 'dark:bg-background-8');
              }
            });
          });
        }

        // Highlight selected item
        dropdownItems.forEach((i) => {
          i.classList.remove('bg-white', 'dark:bg-background-8');
        });
        item.classList.add('bg-white', 'dark:bg-background-8');

        closeDropdown(button, dropdown);
        filterStories();
      });
    });
  }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  let clickedInsideAnyDropdown = false;

  const allButtons = document.querySelectorAll('.dropdown-button');
  allButtons.forEach((button) => {
    const dropdown = button.parentElement.querySelector('.customer-dropdown-menu');
    if (button && (button.contains(e.target) || dropdown?.contains(e.target))) {
      clickedInsideAnyDropdown = true;
    }
  });

  if (!clickedInsideAnyDropdown) {
    allButtons.forEach((button) => {
      const dropdown = button.parentElement.querySelector('.customer-dropdown-menu');
      if (button && dropdown) {
        closeDropdown(button, dropdown);
      }
    });
  }
});

updateDropdownCounts();
