// utils/pricing-toggle.js

const PricingToggle = {
  init(root = document) {
    const scopes = root.querySelectorAll('.price-scope');
    scopes.forEach((scope, scopeIdx) => this._initScope(scope, scopeIdx));
  },

  _initScope(scope, scopeIdx) {
    // Find radios meant for pricing (any name, we’ll normalize)
    const radios = Array.from(
      scope.querySelectorAll(
        'input[type="radio"][value="monthly"], input[type="radio"][value="quarterly"], input[type="radio"][value="yearly"]'
      )
    );
    if (!radios.length) return;

    // Make the radio NAME unique per scope to avoid browser grouping conflicts
    const uniqueGroupName = `pricing-toggle-auto-${scopeIdx}`;
    radios.forEach((r) => {
      r.name = uniqueGroupName;
    });

    // Ensure each radio has a unique ID and label[for] points to it (within this scope)
    const usedIds = new Set();
    radios.forEach((r) => {
      const originalId = r.id?.trim() || '';
      let newId = originalId;

      if (!newId || usedIds.has(newId) || document.getElementById(newId) !== r) {
        // generate a safe id based on period + scope index
        const period = this._periodFromIdOrValue(r.id, r.value) || 'p';
        newId = `pricing-${period}-${scopeIdx}-${Math.random().toString(36).slice(2, 7)}`;
        r.id = newId;
      }
      usedIds.add(newId);

      // Update the label that references this radio (ONLY within this scope)
      const label = scope.querySelector(
        `label[for="${CSS.escape(originalId)}"], label[for="${CSS.escape(newId)}"]`
      );
      if (label) label.setAttribute('for', newId);
    });

    // Cards controlled by this scope
    const cards = scope.querySelectorAll('.pricing-card');
    if (!cards.length) return;

    // Detect which periods actually exist (from first card)
    const available = this._availablePeriods(cards);

    // Hide radios/labels for unavailable periods
    radios.forEach((r) => {
      const period = this._periodFromIdOrValue(r.id, r.value);
      const label = scope.querySelector(`label[for="${CSS.escape(r.id)}"]`);
      const isAvailable = !!period && available.includes(period);
      r.style.display = isAvailable ? '' : 'none';
      if (label) label.style.display = isAvailable ? '' : 'none';
    });

    // Bind change handlers (scoped)
    radios.forEach((r) => {
      r.addEventListener('change', (e) => {
        if (e.target.checked) {
          const period = this._periodFromIdOrValue(e.target.id, e.target.value);
          if (period) this._apply(scope, cards, period);
        }
      });
    });

    // Initial state: prefer a checked radio that is available; else first available
    const checked = radios.find(
      (r) => r.checked && available.includes(this._periodFromIdOrValue(r.id, r.value))
    );
    if (checked) {
      this._apply(scope, cards, this._periodFromIdOrValue(checked.id, checked.value));
    } else {
      const first = radios.find((r) =>
        available.includes(this._periodFromIdOrValue(r.id, r.value))
      );
      if (first) {
        first.checked = true;
        this._apply(scope, cards, this._periodFromIdOrValue(first.id, first.value));
      }
    }
  },

  _apply(scope, cards, period) {
    const all = ['monthly', 'quarterly', 'yearly'];
    cards.forEach((card) => {
      all.forEach((p) => {
        const el = card.querySelector(`.${p}`);
        if (!el) return;
        el.classList.toggle('hidden', p !== period);
      });
    });
  },

  _availablePeriods(cards) {
    const first = cards[0];
    if (!first) return [];
    const out = [];
    if (first.querySelector('.monthly')) out.push('monthly');
    if (first.querySelector('.quarterly')) out.push('quarterly');
    if (first.querySelector('.yearly')) out.push('yearly');
    return out;
  },

  _periodFromIdOrValue(id = '', value = '') {
    // Try id first (monthly|quarterly|yearly or versioned like monthly-v1)
    const m =
      (id && id.match(/^(monthly|quarterly|yearly)(?:[-_].+)?$/i)) ||
      (value && value.match(/^(monthly|quarterly|yearly)$/i));
    return m ? m[0].toLowerCase().replace(/[-_].*$/, '') : null;
  },
};
//========================= pricing spotlight footer animation========================
const pricingSpotlightFooter = {
  init() {
    const box = document.querySelector('.pricing-spotlight-footer-box');
    if (!box) return;
    gsap.set(box, {
      transformOrigin: 'top right',
    });
    gsap.from(box, {
      rotation: -17,
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: box,
        start: 'top 80%',
        end: 'bottom 50%',
      },
    });
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  PricingToggle.init();
  pricingSpotlightFooter.init();
});
