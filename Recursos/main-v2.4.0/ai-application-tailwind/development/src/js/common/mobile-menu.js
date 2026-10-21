class MobileMenuAccordion {
  constructor(options = {}) {
    this.defaultOpenMenu = options.defaultOpenMenu || 'company';
    this.toggleButtons = null;
    this.submenus = null;
    this.arrows = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.toggleButtons = document.querySelectorAll('.mobile-menu-toggle[data-menu]');

    if (this.toggleButtons.length === 0) {
      return;
    }

    this.submenus = document.querySelectorAll('.mobile-submenu[data-submenu]');
    this.arrows = document.querySelectorAll('.mobile-menu-toggle .menu-arrow');

    this.setDefaultState();

    this.toggleButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuId = button.getAttribute('data-menu');
        this.toggleMenu(menuId);
      });
    });
  }

  setDefaultState() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
    });

    this.arrows.forEach((arrow) => {
      arrow.classList.remove('rotate-90');
    });

    if (this.defaultOpenMenu) {
      const defaultSubmenu = document.querySelector(
        `.mobile-submenu[data-submenu="${this.defaultOpenMenu}"]`
      );
      const defaultButton = document.querySelector(
        `.mobile-menu-toggle[data-menu="${this.defaultOpenMenu}"]`
      );
      const defaultArrow = defaultButton?.querySelector('.menu-arrow');

      if (defaultSubmenu) {
        defaultSubmenu.classList.remove('hidden');
        defaultSubmenu.classList.add('block');
      }

      if (defaultArrow) {
        defaultArrow.classList.add('rotate-90');
      }
    }
  }

  toggleMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (!submenu || !button) {
      return;
    }

    const isCurrentlyOpen =
      submenu.classList.contains('block') && !submenu.classList.contains('hidden');

    this.closeAllMenus();

    if (isCurrentlyOpen) {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
      if (arrow) {
        arrow.classList.remove('rotate-90');
      }
    } else {
      submenu.classList.remove('hidden');
      submenu.classList.add('block');
      if (arrow) {
        arrow.classList.add('rotate-90');
      }
    }
  }

  closeAllMenus() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
    });

    this.arrows.forEach((arrow) => {
      arrow.classList.remove('rotate-90');
    });
  }

  openMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (submenu && button) {
      this.closeAllMenus();

      submenu.classList.remove('hidden');
      submenu.classList.add('block');
      if (arrow) {
        arrow.classList.add('rotate-90');
      }
    }
  }

  closeMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (submenu && button) {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
      if (arrow) {
        arrow.classList.remove('rotate-90');
      }
    }
  }

  reinit() {
    this.bindEvents();
  }

  setDefaultOpenMenu(menuId) {
    this.defaultOpenMenu = menuId;
    this.setDefaultState();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuExists = document.querySelector('.mobile-menu-toggle[data-menu]');

  if (mobileMenuExists) {
    window.mobileMenuAccordion = new MobileMenuAccordion({
      defaultOpenMenu: 'company',
    });
  }
});
