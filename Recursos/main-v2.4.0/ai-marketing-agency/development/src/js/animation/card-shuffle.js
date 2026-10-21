const cardShuffle = {
  init() {
    gsap.registerPlugin(Flip);

    const categoriesBtn = gsap.utils.toArray('[data-flip-id]');
    const flipCardItems = gsap.utils.toArray('[data-flip-item]');

    const cardContainer = document.querySelector('[data-cards-container]');

    function setActiveButton(activeBtn) {
      categoriesBtn.forEach((btn) => btn.removeAttribute('data-state'));
      if (activeBtn) activeBtn.setAttribute('data-state', 'selected');
    }

    function updateFilters() {
      const clickedBtn = this;
      const categoryId = clickedBtn?.dataset?.flipId || 'all';

      const currentContainerHeight = cardContainer ? cardContainer.offsetHeight : 0;

      const state = Flip.getState(flipCardItems);

      if (cardContainer) {
        cardContainer.style.height = `${currentContainerHeight}px`;
      }

      flipCardItems.forEach((item) => {
        const itemCategory = item.dataset.flipCategory;
        const match = categoryId === 'all' || itemCategory === categoryId;
        item.style.display = match ? 'block' : 'none';
      });

      Flip.from(state, {
        duration: 0.8,
        scale: true,
        absolute: true,
        ease: 'power1.inOut',
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.1 }
          ),
        onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.98, duration: 0.3 }),
        onComplete: () => {
          if (cardContainer) cardContainer.style.height = '';
          // Recalculate ScrollTrigger positions so sections below
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        },
      });

      setActiveButton(clickedBtn);
    }

    categoriesBtn.forEach((btn) => btn.addEventListener('click', updateFilters));

    const allBtn = document.querySelector('[data-flip-id="all"]');
    if (allBtn) setActiveButton(allBtn);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  cardShuffle.init();
});
