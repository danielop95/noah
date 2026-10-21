/**
 * Update the footer year text content to the current year.
 */
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll('[data-footer-year]');

  if (footerYearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};

document.addEventListener('DOMContentLoaded', () => updateFooterYear());
