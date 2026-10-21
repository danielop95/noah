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
    this.setActiveLinkState();

    this.toggleButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuId = button.dataset.menu;
        this.toggleMenu(menuId);
      });
    });
  }

  /**
   * Set data-clicked="true" on the mobile menu link that matches the current page.
   * Applies to all sidebar links (Company, Collaborate, Resources, People & Culture).
   */
  setActiveLinkState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const currentPath = globalThis.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    const links = sidebar.querySelectorAll('a[href]');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      try {
        const linkPath = new URL(href, globalThis.location.href).pathname;
        const linkPage = linkPath.split('/').pop() || 'index.html';

        if (linkPage === currentPage) {
          link.dataset.clicked = 'true';
        } else {
          delete link.dataset.clicked;
        }
      } catch (err) {
        // Invalid href (e.g. malformed or non-URL); skip this link
        console.log(err);
      }
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
    globalThis.mobileMenuAccordion = new MobileMenuAccordion({
      defaultOpenMenu: 'company',
    });
  }
});
