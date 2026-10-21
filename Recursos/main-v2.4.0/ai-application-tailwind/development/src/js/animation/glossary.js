const glossaryAnimation = {
  init() {
    const glossaryFiltersButtons = document.querySelectorAll(
      '.glossary-filters-buttons-container button'
    );

    const glossaryCards = document.querySelectorAll('.glossary-card');

    if (glossaryFiltersButtons.length > 0 && glossaryCards.length > 0) {
      //initial state
      glossaryCards.forEach((card) => {
        card.style.display = 'none';
      });
      let selectedButton = glossaryFiltersButtons[0];
      selectedButton.dataset.selected = 'true';
      let selectedLetter = 'a';

      const animateCards = (card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 60,
            filter: 'blur(16px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            delay: 0.3 + index * 0.1,
            duration: 0.6,
            ease: 'power2.out',
          }
        );
      };

      const filterCards = (letter) => {
        const visibleCards = [];

        // filter the cards based on the letter
        glossaryCards.forEach((card) => {
          if (letter && card.dataset.letter.toLowerCase() === letter.toLowerCase()) {
            card.style.display = 'flex';
            visibleCards.push(card);
          } else {
            card.style.display = 'none';
            // Reset animation state for hidden cards
            if (typeof gsap !== 'undefined') {
              gsap.set(card, { clearProps: 'transform,opacity,filter' });
            }
          }
        });

        // animate the visible cards with stagger
        visibleCards.forEach((card, index) => {
          animateCards(card, index);
        });
      };

      //default call
      filterCards(selectedLetter);

      glossaryFiltersButtons.forEach((button, index) => {
        // make the data state false for rest of the buttons
        if (index > 0) {
          button.dataset.selected = 'false';
        }

        button.addEventListener('click', () => {
          const buttonLetter = button.textContent.trim().toLowerCase();
          if (button === selectedButton) {
            button.dataset.selected = 'false';
            selectedButton = null;
            selectedLetter = null;
            // show all cards if the selected button is clicked again
            glossaryCards.forEach((card, index) => {
              card.style.display = 'flex';
              animateCards(card, index);
            });
          } else {
            // make the previous selected button data state false
            if (selectedButton) {
              selectedButton.dataset.selected = 'false';
            }
            button.dataset.selected = 'true';
            selectedButton = button;
            selectedLetter = buttonLetter;
            filterCards(selectedLetter);
          }
        });
      });
    }
  },
};

window.addEventListener('DOMContentLoaded', () => {
  glossaryAnimation.init();
});
