/* utils/price-switcher.js */

const priceSwitcher = {
  init() {
    document.querySelectorAll('.price-scope').forEach((scope) => this.initScope(scope));
  },

  initScope(scope) {
    const toggle = scope.querySelector('.price-switcher-input');
    if (!toggle) return;

    const monthlyPrices = scope.querySelectorAll('.price-month');
    const yearlyPrices = scope.querySelectorAll('.price-year');
    const monthlyLabels = scope.querySelectorAll('.price-label-monthly');
    const yearlyLabels = scope.querySelectorAll('.price-label-yearly');

    // set initial state
    this.apply(scope, toggle.checked, { monthlyPrices, yearlyPrices, monthlyLabels, yearlyLabels });

    toggle.addEventListener('change', () => {
      this.apply(scope, toggle.checked, {
        monthlyPrices,
        yearlyPrices,
        monthlyLabels,
        yearlyLabels,
      });
    });
  },

  apply(scope, isYearly, groups) {
    const { monthlyPrices, yearlyPrices, monthlyLabels, yearlyLabels } = groups;

    monthlyPrices.forEach((el) => el.classList.toggle('hidden', isYearly));
    yearlyPrices.forEach((el) => el.classList.toggle('hidden', !isYearly));

    monthlyLabels.forEach((el) => el.classList.toggle('hidden', isYearly));
    yearlyLabels.forEach((el) => el.classList.toggle('hidden', !isYearly));
  },
};

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => priceSwitcher.init());
}

export default priceSwitcher;
