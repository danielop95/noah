gsap.registerPlugin(ScrollTrigger);
const ourImpactReviewCardAnimation = () => {
  const trigger = document.querySelector(".our-impact-section");
  const cards = document.querySelectorAll(".our-impact-review-card");
  if (!cards.length) return;
  const animations = [
    { x: 150, duration: 1.5, delay: 0.1, rotation: 15 },
    { x: 90, duration: 2.2, delay: 0.2, rotation: 5 },
    { x: 0, duration: 2.5, delay: 0.3, rotation: -5 }
  ];
  cards.forEach((card, index) => {
    if (animations[index]) {
      gsap.from(card, {
        ...animations[index],
        ease: "power3.out",
        scrollTrigger: {
          trigger,
          start: "top 95%",
          end: "bottom 18%",
          scrub: 0.8
        }
      });
    }
  });
};
const ourImpactImageAnimation = () => {
  const images = document.querySelectorAll(".our-impact-image");
  const trigger = document.querySelector(".our-impact-section");
  if (!images.length) return;
  const animations = [
    { y: -70, duration: 2.3, rotation: -7 },
    { y: 70, duration: 2.3, rotation: 12 },
    { x: 90, duration: 2.3, rotation: 12 }
  ];
  images.forEach((image, index) => {
    if (animations[index]) {
      gsap.from(image, {
        ...animations[index],
        ease: "power3.out",
        filter: "blur(5px)",
        scrollTrigger: {
          trigger,
          start: "top 80%",
          end: "bottom 30%",
          scrub: 0.8,
          once: true
        }
      });
    }
  });
};
const empoweringBusinessSvgAnimation = () => {
  const container = document.querySelector(".flow-line-curve-svg-container");
  const paths = document.querySelectorAll(".flow-line-curve-path");
  const circle = document.querySelector(".flow-line-curve-circle");
  if (!container || !paths.length) return;
  if (circle) {
    gsap.set(circle, { opacity: 0, scale: 0.2 });
  }
  paths.forEach((path, index) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: "power3.out",
      delay: index * 0.2,
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        once: true
      }
    });
  });
  if (circle) {
    gsap.to(circle, {
      opacity: 1,
      scale: 1,
      duration: 2.1,
      delay: 1.3,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        once: true
      }
    });
  }
};
const empoweringBusinessProgressBarAnimation = () => {
  const progressBars = document.querySelectorAll(".empowering-business-progress-bar");
  const trigger = document.querySelector(".empowering-business-progress-container");
  if (!progressBars.length) return;
  progressBars.forEach((bar) => {
    const originalWidth = window.getComputedStyle(bar).width;
    gsap.set(bar, { width: "0px" });
    gsap.to(bar, {
      width: originalWidth,
      duration: 2.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger,
        start: "top 80%",
        once: true
      }
    });
  });
};
const ctaV2ImageAnimation = () => {
  const image1 = document.querySelector(".cta-v2-image-1");
  const image2 = document.querySelector(".cta-v2-image-2");
  const image3 = document.querySelector(".cta-v2-image-3");
  const wrapper = document.querySelector(".cta-v2-images-wrapper");
  if (!image1 || !image2 || !image3 || !wrapper) return;
  const offset1 = -140;
  const offset2 = -160;
  const offset3 = -10;
  gsap.set(image1, { x: offset1, y: 50, rotation: -30, opacity: 0.2 });
  gsap.set(image2, { x: offset2, y: -3, rotation: -30, opacity: 0 });
  gsap.set(image3, { x: offset3, y: 150, rotation: -50, opacity: 0 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top 90%",
      once: true
    }
  });
  tl.to(image3, {
    x: 0,
    y: 0,
    rotation: -30,
    opacity: 1,
    duration: 0.7,
    ease: "power3.out"
  }).to(
    image2,
    {
      x: 0,
      y: 0,
      rotation: -15,
      opacity: 1,
      duration: 2,
      ease: "power3.out"
    },
    "-=0.8"
  ).to(
    image1,
    {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 2,
      ease: "power3.out"
    },
    "-=1.8"
  );
};
document.addEventListener("DOMContentLoaded", () => {
  ourImpactReviewCardAnimation();
  ourImpactImageAnimation();
  empoweringBusinessSvgAnimation();
  empoweringBusinessProgressBarAnimation();
  ctaV2ImageAnimation();
});
const headerAnimation = {
  headerOne() {
    const header = document.querySelector(".header-one");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("scroll-header");
        } else {
          header.classList.remove("scroll-header");
        }
      });
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  headerAnimation.headerOne();
});
document.addEventListener("DOMContentLoaded", function() {
  if (typeof InfiniteMarquee === "undefined") {
    console.error("InfiniteMarquee is not loaded.");
    return;
  }
  const animation2 = {
    infiniteLeft() {
      if (document.querySelector(".logos-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-marquee-container",
          speed: 55e3,
          smoothEdges: true,
          direction: "left",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "top",
            speed: 5e4
          },
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    infiniteRight() {
      if (document.querySelector(".logos-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-right-marquee-container",
          speed: 55e3,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "right",
            speed: 5e4
          },
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    initHover() {
      if (document.querySelector(".cards-marquee-container")) {
        new InfiniteMarquee({
          element: ".cards-marquee-container",
          speed: 14e4,
          smoothEdges: true,
          direction: "left",
          gap: "32px",
          pauseOnHover: true,
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    initHoverRight() {
      if (document.querySelector(".cards-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".cards-right-marquee-container",
          speed: 14e4,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          pauseOnHover: true,
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    infiniteTop() {
      if (document.querySelector(".top-marquee-container")) {
        new InfiniteMarquee({
          element: ".top-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "top",
          gap: "32px",
          pauseOnHover: true,
          duplicateCount: 0,
          mobileSettings: {
            direction: "top",
            speed: 5e4
          },
          on: {
            beforeInit: () => {
            },
            afterInit: () => {
            }
          }
        });
      }
    },
    infiniteBottom() {
      if (document.querySelector(".bottom-marquee-container")) {
        new InfiniteMarquee({
          element: ".bottom-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "bottom",
          pauseOnHover: true,
          gap: "32px",
          duplicateCount: 0,
          mobileSettings: {
            direction: "bottom",
            speed: 5e4
          },
          on: {
            beforeInit: () => {
            },
            afterInit: () => {
            }
          }
        });
      }
    }
  };
  animation2.infiniteLeft();
  animation2.infiniteRight();
  animation2.initHover();
  animation2.initHoverRight();
  animation2.infiniteTop();
  animation2.infiniteBottom();
});
class MobileMenuAccordion {
  constructor(options = {}) {
    this.defaultOpenMenu = options.defaultOpenMenu || "company";
    this.toggleButtons = null;
    this.submenus = null;
    this.arrows = null;
    this.init();
  }
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }
  bindEvents() {
    this.toggleButtons = document.querySelectorAll(".mobile-menu-toggle[data-menu]");
    if (this.toggleButtons.length === 0) {
      return;
    }
    this.submenus = document.querySelectorAll(".mobile-submenu[data-submenu]");
    this.arrows = document.querySelectorAll(".mobile-menu-toggle .menu-arrow");
    this.setDefaultState();
    this.toggleButtons.forEach((button2) => {
      button2.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menuId = button2.getAttribute("data-menu");
        this.toggleMenu(menuId);
      });
    });
  }
  setDefaultState() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
    });
    this.arrows.forEach((arrow) => {
      arrow.classList.remove("rotate-90");
    });
    if (this.defaultOpenMenu) {
      const defaultSubmenu = document.querySelector(
        `.mobile-submenu[data-submenu="${this.defaultOpenMenu}"]`
      );
      const defaultButton = document.querySelector(
        `.mobile-menu-toggle[data-menu="${this.defaultOpenMenu}"]`
      );
      const defaultArrow = defaultButton == null ? void 0 : defaultButton.querySelector(".menu-arrow");
      if (defaultSubmenu) {
        defaultSubmenu.classList.remove("hidden");
        defaultSubmenu.classList.add("block");
      }
      if (defaultArrow) {
        defaultArrow.classList.add("rotate-90");
      }
    }
  }
  toggleMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (!submenu || !button2) {
      return;
    }
    const isCurrentlyOpen = submenu.classList.contains("block") && !submenu.classList.contains("hidden");
    this.closeAllMenus();
    if (isCurrentlyOpen) {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
      if (arrow) {
        arrow.classList.remove("rotate-90");
      }
    } else {
      submenu.classList.remove("hidden");
      submenu.classList.add("block");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
    }
  }
  closeAllMenus() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
    });
    this.arrows.forEach((arrow) => {
      arrow.classList.remove("rotate-90");
    });
  }
  openMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (submenu && button2) {
      this.closeAllMenus();
      submenu.classList.remove("hidden");
      submenu.classList.add("block");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
    }
  }
  closeMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (submenu && button2) {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
      if (arrow) {
        arrow.classList.remove("rotate-90");
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
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuExists = document.querySelector(".mobile-menu-toggle[data-menu]");
  if (mobileMenuExists) {
    window.mobileMenuAccordion = new MobileMenuAccordion({
      defaultOpenMenu: "company"
    });
  }
});
class NavigationMenu {
  constructor() {
    this.activeMenu = null;
    this.menuTimeout = null;
    this.isMouseInHeader = false;
    this.isMouseInMenu = false;
    this.init();
  }
  init() {
    this.bindEvents();
    this.markCurrentPage();
  }
  /** Mark nav item active when its link or its dropdown menu links match the current page */
  markCurrentPage() {
    const nav = document.querySelector("header nav");
    if (!nav) return;
    const page = window.location.pathname.split("/").pop() || "index.html";
    const getPageFromHref = (href) => (href || "").replace(/^\.\//, "").split("#")[0].split("?")[0];
    nav.querySelectorAll(".nav-link-item").forEach((item) => {
      const link = item.querySelector(".nav-link");
      const menuId = item.getAttribute("data-menu");
      let isActive = false;
      if (link) {
        const href = getPageFromHref(link.getAttribute("href"));
        if (href && href !== "#" && href === page) isActive = true;
      }
      if (!isActive && menuId) {
        const menu = document.getElementById(menuId);
        if (menu) {
          const hasMatch = Array.from(menu.querySelectorAll("a[href]")).some((a) => {
            const h = getPageFromHref(a.getAttribute("href"));
            return h && h !== "#" && h === page;
          });
          if (hasMatch) isActive = true;
        }
      }
      item.classList.toggle("current-page", isActive);
    });
  }
  bindEvents() {
    const navItems = document.querySelectorAll(".nav-item[data-menu]");
    navItems.forEach((item) => {
      const menuId = item.getAttribute("data-menu");
      const menu = document.getElementById(menuId);
      if (!menu) return;
      item.addEventListener("mouseenter", (e) => {
        this.showMenu(item, menu);
      });
      item.addEventListener("mouseleave", (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !menu.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });
      menu.addEventListener("mouseenter", (e) => {
        this.cancelHideMenu();
        this.showMenu(item, menu);
      });
      menu.addEventListener("mouseleave", (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !item.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (!target.closest(".nav-item") && !target.closest(".mega-menu, .dropdown-menu")) {
          this.hideAllMenus();
        }
      }
    });
    const header = document.querySelector("header");
    if (header) {
      header.addEventListener("mouseenter", () => {
        this.isMouseInHeader = true;
        this.cancelHideMenu();
      });
      header.addEventListener("mouseleave", (e) => {
        this.isMouseInHeader = false;
        const relatedTarget = e.relatedTarget;
        const isMovingToMenu = relatedTarget && (relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu"));
        if (!isMovingToMenu) {
          this.scheduleHideMenu();
        }
      });
    }
    document.addEventListener(
      "mouseenter",
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === "function") {
          if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
            this.isMouseInMenu = true;
            this.cancelHideMenu();
          }
        }
      },
      true
    );
    document.addEventListener(
      "mouseleave",
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === "function") {
          if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
            this.isMouseInMenu = false;
            const relatedTarget = e.relatedTarget;
            const isMovingToHeader = relatedTarget && typeof relatedTarget.closest === "function" && (relatedTarget.closest("header") || relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu") || relatedTarget.closest(".mega-menu-bridge") || relatedTarget.closest(".dropdown-menu-bridge"));
            if (!isMovingToHeader) {
              this.scheduleHideMenu();
            }
          }
        }
      },
      true
    );
    document.addEventListener("mouseleave", () => {
      this.hideAllMenus();
    });
  }
  showMenu(navItem, menu) {
    this.cancelHideMenu();
    this.hideAllMenus();
    this.activeMenu = menu;
    navItem.classList.add("active");
    menu.classList.add("active");
    navItem.classList.add("menu-active");
    const bridge = navItem.querySelector(".mega-menu-bridge, .dropdown-menu-bridge");
    if (bridge) {
      bridge.style.opacity = "1";
      bridge.style.pointerEvents = "auto";
    }
    this.dispatchMenuEvent("menu:show", { navItem, menu });
  }
  hideMenu(menu) {
    if (!menu) return;
    const navItem = document.querySelector(`[data-menu="${menu.id}"]`);
    menu.classList.remove("active");
    if (navItem) {
      navItem.classList.remove("active", "menu-active");
      const bridge = navItem.querySelector(".mega-menu-bridge, .dropdown-menu-bridge");
      if (bridge) {
        bridge.style.opacity = "0";
        bridge.style.pointerEvents = "none";
      }
    }
    if (this.activeMenu === menu) {
      this.activeMenu = null;
    }
    this.dispatchMenuEvent("menu:hide", { navItem, menu });
  }
  hideAllMenus() {
    const allMenus = document.querySelectorAll(".mega-menu, .dropdown-menu");
    const allNavItems = document.querySelectorAll(".nav-item[data-menu]");
    allMenus.forEach((menu) => this.hideMenu(menu));
    allNavItems.forEach((item) => {
      item.classList.remove("active", "menu-active");
    });
    this.activeMenu = null;
  }
  scheduleHideMenu() {
    this.cancelHideMenu();
    this.menuTimeout = setTimeout(() => {
      if (!this.isMouseInHeader && !this.isMouseInMenu) {
        this.hideAllMenus();
      }
    }, 200);
  }
  cancelHideMenu() {
    if (this.menuTimeout) {
      clearTimeout(this.menuTimeout);
      this.menuTimeout = null;
    }
  }
  dispatchMenuEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  // Public methods for external control
  showMenuById(menuId) {
    const navItem = document.querySelector(`[data-menu="${menuId}"]`);
    const menu = document.getElementById(menuId);
    if (navItem && menu) {
      this.showMenu(navItem, menu);
    }
  }
  hideMenuById(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
      this.hideMenu(menu);
    }
  }
  toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu && menu.classList.contains("active")) {
      this.hideMenu(menu);
    } else {
      this.showMenuById(menuId);
    }
  }
  // Debug method to check current state
  getDebugInfo() {
    return {
      activeMenu: this.activeMenu ? this.activeMenu.id : null,
      isMouseInHeader: this.isMouseInHeader,
      isMouseInMenu: this.isMouseInMenu,
      hasTimeout: !!this.menuTimeout
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  window.navigationMenu = new NavigationMenu();
});
const sidebarAnimation = {
  elements: null,
  init() {
    try {
      this.cacheElements();
      this.bindEvents();
    } catch (error) {
      console.error("Sidebar animation initialization failed:", error);
    }
  },
  cacheElements() {
    this.elements = {
      navHamburger: document.querySelector(".nav-hamburger"),
      navHamburgerClose: document.querySelector(".nav-hamburger-close"),
      sidebar: document.querySelector(".sidebar"),
      subMenu: document.querySelectorAll(".sub-menu")
    };
  },
  bindEvents() {
    const { navHamburger, navHamburgerClose, subMenu } = this.elements;
    if (navHamburger) {
      navHamburger.addEventListener("click", () => {
        this.elements.sidebar.classList.add("show-sidebar");
        console.log("clicked");
        document.body.classList.add("overflow-hidden");
      });
    }
    if (navHamburgerClose) {
      navHamburgerClose.addEventListener("click", () => {
        this.elements.sidebar.classList.remove("show-sidebar");
        document.body.classList.remove("overflow-hidden");
      });
    }
    subMenu.forEach((menu) => {
      menu.addEventListener("click", () => {
        menu.classList.toggle("active-menu");
        menu.nextElementSibling.classList.toggle("hidden");
        menu.children[1].classList.toggle("rotate-90");
        subMenu.forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.nextElementSibling.classList.add("hidden");
            otherMenu.children[1].classList.remove("rotate-90");
            otherMenu.classList.remove("active-menu");
          }
        });
      });
    });
  }
};
if (typeof window !== "undefined") {
  sidebarAnimation.init();
}
const swiperAnimation = {
  instances: {},
  init() {
    if (typeof Swiper === "undefined") {
      return;
    }
    new Swiper(".ai-marketing-agency-about-swiper", {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 3e3,
        disableOnInteraction: true
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      },
      navigation: {
        nextEl: ".ai-kw-generator-testimonial-next",
        prevEl: ".ai-kw-generator-testimonial-prev"
      },
      on: {
        init: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
            activeSlide.style.opacity = "1";
            activeSlide.style.filter = "blur(0)";
          }
        },
        slideChange: function() {
          const slides = this.slides;
          slides.forEach((slide) => {
            slide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            slide.style.transform = "scale(0.8)";
            slide.style.opacity = "0.3";
            slide.style.filter = "blur(3px)";
          });
        },
        slideChangeTransitionStart: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
            activeSlide.style.opacity = "1";
            activeSlide.style.filter = "blur(0)";
          }
        }
      }
    });
    new Swiper(".ai-kw-generator-testimonial-swiper", {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 3e3,
        disableOnInteraction: true
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      },
      navigation: {
        nextEl: ".ai-kw-generator-testimonial-next",
        prevEl: ".ai-kw-generator-testimonial-prev"
      },
      on: {
        init: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
            activeSlide.style.opacity = "1";
            activeSlide.style.filter = "blur(0)";
          }
        },
        slideChange: function() {
          const slides = this.slides;
          slides.forEach((slide) => {
            slide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            slide.style.transform = "scale(0.8)";
            slide.style.opacity = "0.3";
            slide.style.filter = "blur(3px)";
          });
        },
        slideChangeTransitionStart: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
            activeSlide.style.opacity = "1";
            activeSlide.style.filter = "blur(0)";
          }
        }
      }
    });
    this.instances.aiCreativeStudioTestimonial = new Swiper(
      ".ai-creative-studio-testimonial-swiper",
      {
        initialSlide: 2,
        speed: 2e3,
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        allowTouchMove: true,
        autoplay: {
          delay: 3e3,
          disableOnInteraction: true
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 0
          }
        },
        navigation: {
          nextEl: ".ai-creative-studio-testimonial-next",
          prevEl: ".ai-creative-studio-testimonial-prev"
        },
        on: {
          init: function() {
            const slides = this.slides;
            const activeIndex = this.activeIndex;
            const slidesPerView = Math.ceil(this.params.slidesPerView);
            slides.forEach((slide, index) => {
              slide.style.transition = "opacity 0.4s ease-out, filter 0.4s ease-out";
              let offset = index - activeIndex;
              if (offset < 0) offset += slides.length;
              if (offset >= 0 && offset < slidesPerView) {
                slide.style.opacity = "1";
                slide.style.filter = "blur(0px)";
              } else {
                slide.style.opacity = "0.5";
                slide.style.filter = "blur(2px)";
              }
            });
          },
          slideChangeTransitionStart: function() {
            const slides = this.slides;
            const activeIndex = this.activeIndex;
            const slidesPerView = Math.ceil(this.params.slidesPerView);
            slides.forEach((slide, index) => {
              slide.style.transition = "opacity 0.4s ease-out, filter 0.4s ease-out";
              let offset = index - activeIndex;
              if (offset < 0) offset += slides.length;
              if (offset >= 0 && offset < slidesPerView) {
                slide.style.opacity = "1";
                slide.style.filter = "blur(0px)";
              } else {
                slide.style.opacity = "0.5";
                slide.style.filter = "blur(2px)";
              }
            });
          }
        }
      }
    );
    this.instances.scienceLabTestimonial = new Swiper(".science-lab-testimonial-swiper", {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      loop: true,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 2e3,
        disableOnInteraction: true
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        980: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1140: {
          slidesPerView: 3
          // spaceBetween: 280,
        }
      },
      navigation: {
        nextEl: ".science-lab-testimonial-next",
        prevEl: ".science-lab-testimonial-prev"
      },
      on: {
        init: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
            activeSlide.style.opacity = "1";
            activeSlide.style.filter = "blur(0)";
          }
        },
        slideChange: function() {
          const slides = this.slides;
          slides.forEach((slide) => {
            slide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            slide.style.transform = "scale(0.8)";
          });
        },
        slideChangeTransitionStart: function() {
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            activeSlide.style.transform = "scale(1)";
          }
        }
      }
    });
    const TRANSITION = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    const AUTOPLAY_DELAY = 3e3;
    const getImageSize = (isActive) => {
      const width = window.innerWidth;
      if (width < 480) {
        return isActive ? "size-20" : "size-14";
      } else if (width < 768) {
        return isActive ? "size-40" : "size-24";
      } else {
        return isActive ? "size-52" : "size-30";
      }
    };
    const setSlideStyle = (slide, isActive) => {
      const img = slide.querySelector(".ai-voice-generator-testimonial-image");
      Object.assign(slide.style, {
        transition: TRANSITION,
        transform: isActive ? "scale(1)" : "scale(0.8) ",
        opacity: isActive ? "1" : "0.3",
        filter: isActive ? "blur(0)" : "blur(2px)"
      });
      if (img) {
        img.style.transition = TRANSITION;
        img.classList.remove(
          "size-14",
          "size-19",
          "size-20",
          "size-24",
          "size-30",
          "size-40",
          "size-52"
        );
        img.classList.add(getImageSize(isActive));
      }
    };
    const animateText = (item, fromY, toY = "0", opacity = "1") => {
      item.style.transition = "none";
      item.style.transform = `translateY(${fromY})`;
      item.style.opacity = "0";
      void item.offsetHeight;
      item.style.transition = TRANSITION + ", opacity 0.8s";
      item.style.transform = `translateY(${toY})`;
      item.style.opacity = opacity;
    };
    this.instances.aiVoiceGeneratorTestimonial = new Swiper(
      ".ai-voice-generator-testimonial-swiper",
      {
        initialSlide: 2,
        centeredSlides: true,
        speed: 1700,
        allowTouchMove: false,
        autoplay: { delay: AUTOPLAY_DELAY, disableOnInteraction: false },
        slidesPerView: 5,
        breakpoints: {
          480: { slidesPerView: 3, spaceBetween: -15 },
          768: { slidesPerView: 5, spaceBetween: -70 }
        },
        on: {
          init: function() {
            this.slides.forEach((slide, i) => setSlideStyle(slide, i === this.activeIndex));
            updateTestimonialText(this.activeIndex, "next");
            updateTestimonialPagination(this.activeIndex);
          },
          resize: function() {
            this.slides.forEach((slide, i) => setSlideStyle(slide, i === this.activeIndex));
          },
          slideChange: function() {
            this.slides.forEach((slide) => setSlideStyle(slide, false));
          },
          slideChangeTransitionStart: function() {
            setSlideStyle(this.slides[this.activeIndex], true);
            const direction = this.previousIndex < this.activeIndex ? "next" : "prev";
            updateTestimonialText(this.activeIndex, direction);
            updateTestimonialPagination(this.activeIndex);
          },
          autoplayStop: pauseTestimonialPaginationProgress,
          autoplayResume: function() {
            updateTestimonialPagination(this.activeIndex);
          }
        }
      }
    );
    function updateTestimonialPagination(activeIndex) {
      document.querySelectorAll(".ai-voice-generator-testimonial-pagination-bullet").forEach((bullet, i) => {
        const isActive = i === activeIndex;
        bullet.classList.toggle(
          "ai-voice-generator-testimonial-pagination-bullet-active",
          isActive
        );
        if (isActive) {
          bullet.style.setProperty("--progress-width", "0%");
          void bullet.offsetWidth;
          requestAnimationFrame(
            () => requestAnimationFrame(() => bullet.style.setProperty("--progress-width", "100%"))
          );
        } else {
          bullet.style.removeProperty("--progress-width");
        }
      });
    }
    function pauseTestimonialPaginationProgress() {
      document.querySelectorAll(".ai-voice-generator-testimonial-pagination-bullet-active").forEach((bullet) => {
        const currentWidth = window.getComputedStyle(bullet, "::before").width;
        bullet.style.setProperty("--progress-width", currentWidth);
      });
    }
    document.querySelectorAll(".ai-voice-generator-testimonial-pagination-bullet").forEach((bullet) => {
      bullet.addEventListener("click", function() {
        const slideIndex = parseInt(this.getAttribute("data-slide-index"));
        if (!isNaN(slideIndex)) this.instances.aiVoiceGeneratorTestimonial.slideTo(slideIndex);
      });
    });
    function updateTestimonialText(activeIndex, direction = "next") {
      const textItems = document.querySelectorAll(".ai-voice-generator-testimonial-text-item");
      if (!textItems.length) return;
      const isNext = direction === "next";
      textItems.forEach((item, i) => {
        if (i === activeIndex) {
          animateText(item, isNext ? "100%" : "-100%");
        } else {
          const shouldSlideUp = isNext ? i < activeIndex : i > activeIndex;
          animateText(item, "0", shouldSlideUp ? "-100%" : "100%", "0");
        }
      });
    }
    this.instances.aiCreativeStudioBlog = new Swiper(".ai-creative-studio-blog-swiper", {
      initialSlide: 1,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 1400,
      loop: true,
      autoplay: {
        delay: 3e3,
        disableOnInteraction: true
      },
      allowTouchMove: true,
      effect: "creative",
      creativeEffect: {
        prev: {
          translate: ["-130%", 0, -400],
          opacity: 0
        },
        next: {
          translate: ["130%", 0, -400],
          opacity: 0
        }
      },
      pagination: {
        el: ".ai-creative-studio-blog-pagination",
        clickable: true,
        bulletClass: "ai-creative-studio-blog-pagination-bullet",
        bulletActiveClass: "ai-creative-studio-blog-pagination-bullet-active"
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  swiperAnimation.init();
});
const button = {
  init() {
    const buttonWrappers = document.querySelectorAll(".button-split-text-wrapper");
    const duration = 0.4;
    const stagger = 625e-5;
    buttonWrappers.forEach((buttonWrapper) => {
      const upperText = buttonWrapper.querySelector(".button-split-upper-text");
      const lowerText = buttonWrapper.querySelector(".button-split-lower-text");
      if (!upperText || !lowerText) return;
      const upperSplit = new SplitText(upperText, {
        type: "chars",
        tag: "span"
      });
      const lowerSplit = new SplitText(lowerText, {
        type: "chars",
        tag: "span"
      });
      gsap.set(upperSplit.chars, {
        opacity: 1,
        display: "inline-block"
      });
      gsap.set(lowerSplit.chars, {
        opacity: 0,
        display: "inline-block"
      });
      const hoverInTl = gsap.timeline({ paused: true });
      hoverInTl.to(upperSplit.chars, {
        y: "-100%",
        duration,
        opacity: 0,
        ease: "power2.inOut",
        stagger
      }).to(
        lowerSplit.chars,
        {
          y: "-100%",
          duration,
          opacity: 1,
          stagger,
          ease: "power2.inOut"
        },
        "<"
        // Start at the same time as upper text animation
      );
      buttonWrapper.addEventListener("mouseenter", () => {
        hoverInTl.play();
      });
      buttonWrapper.addEventListener("mouseleave", () => {
        hoverInTl.reverse();
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  button.init();
});
function dividerExpand(divider) {
  gsap.to(divider, {
    scrollTrigger: {
      trigger: divider,
      start: "top 100%",
      end: "top 50%",
      toggleActions: "play none none none"
    },
    width: "50%",
    duration: 1,
    delay: 0.7,
    ease: "power2.out"
  });
}
const commonAnimation = {
  init() {
    gsap.registerPlugin(ScrollTrigger);
    const footerDivider = document.querySelectorAll(".footer-divider");
    const imagesLoadingReveal = document.querySelectorAll(".image-loading-reveal img");
    if (footerDivider) {
      dividerExpand(footerDivider);
    }
    if (imagesLoadingReveal.length > 0) {
      imagesLoadingReveal.forEach((img) => {
        const triggerEl = img.closest(".image-loading-reveal") || img;
        gsap.set(img, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          opacity: 0,
          scale: 0.9
        });
        gsap.fromTo(
          img,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            opacity: 0,
            scale: 0.9
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            opacity: 1,
            scale: 1,
            ease: "back.in",
            duration: 0.9,
            scrollTrigger: {
              trigger: triggerEl,
              start: "top 94%",
              end: "bottom 58%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }
  }
};
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll("[data-footer-year]");
  if (footerYearElements.length > 0) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};
if (typeof window !== "undefined") {
  commonAnimation.init();
  updateFooterYear();
}
const glowingCardsAnimation = {
  init() {
    const wrappers = document.querySelectorAll(".glowing-cards");
    wrappers.forEach((wrapper) => {
      const cards = wrapper.querySelectorAll(".glowing-card, .glowing-card-v2");
      let isMouseInside = false;
      wrapper.addEventListener("mouseenter", (event) => {
        isMouseInside = true;
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          card.style.setProperty("--xPos", `${x}px`);
          card.style.setProperty("--yPos", `${y}px`);
        });
      });
      wrapper.addEventListener("mousemove", (event) => {
        if (!isMouseInside) return;
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          card.style.setProperty("--xPos", `${x}px`);
          card.style.setProperty("--yPos", `${y}px`);
        });
      });
      wrapper.addEventListener("mouseleave", () => {
        isMouseInside = false;
      });
    });
  }
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    glowingCardsAnimation.init();
  });
} else {
  glowingCardsAnimation.init();
}
const animation$1 = {
  init() {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.registerPlugin(ScrollTrigger);
    const integrationFeaturesPill = () => {
      const paths = document.querySelectorAll(".features-integration-pill svg path.connector");
      if (!paths.length) return;
      paths.forEach((path, i) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: i * 0.08
        });
        const svg = path.closest("svg");
        if (!svg.querySelector("defs #glow")) {
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
          svg.prepend(defs);
        }
        const pillContainer = path.closest(".features-integration-pill");
        const dotColorAttr = (pillContainer == null ? void 0 : pillContainer.getAttribute("data-dot-color")) || "white";
        const dotColor = dotColorAttr === "black" ? "#000" : "#fff";
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("r", "1.6");
        dot.setAttribute("fill", dotColor);
        dot.setAttribute("opacity", "1");
        dot.setAttribute("filter", "url(#glow)");
        dot.style.pointerEvents = "none";
        svg.appendChild(dot);
        gsap.set(dot, { transformBox: "fill-box", transformOrigin: "50% 50%" });
        gsap.fromTo(
          dot,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 2.2,
            repeat: -1,
            ease: "none",
            yoyo: false,
            // key part: align the element's CENTER to the path
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
              start: 0,
              end: 1
            },
            delay: 0.5 + i * 0.15
          }
        );
      });
    };
    integrationFeaturesPill();
  }
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    animation$1.init();
  });
} else {
  animation$1.init();
}
class AccordionManager {
  constructor(options = {}) {
    this.options = {
      // Default options
      allowMultiple: false,
      animationDuration: 300,
      easing: "ease-in-out",
      autoClose: true,
      keyboardNavigation: true,
      ...options
    };
    this.accordions = /* @__PURE__ */ new Map();
    this.init();
  }
  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.initializeAllAccordions();
    });
  }
  initializeAllAccordions() {
    const containers = document.querySelectorAll(".accordion");
    containers.forEach((container, index) => {
      this.createAccordion(container, index);
    });
    this.ensureSingleActiveItem();
    this.addStaggerToAccordionItems();
  }
  createAccordion(container, id) {
    const items = container.querySelectorAll(".accordion-item");
    if (!items.length) return;
    container.setAttribute("itemscope", "");
    container.setAttribute("itemtype", "https://schema.org/FAQPage");
    container.setAttribute("role", "tablist");
    container.setAttribute("aria-label", "Frequently Asked Questions");
    const accordion = {
      id,
      container,
      items: /* @__PURE__ */ new Map(),
      activeItems: /* @__PURE__ */ new Set(),
      isAnimating: false
    };
    items.forEach((item, itemIndex) => {
      this.initializeAccordionItem(accordion, item, itemIndex);
    });
    if (this.options.keyboardNavigation) {
      this.setupKeyboardNavigation(accordion);
    }
    this.accordions.set(id, accordion);
  }
  initializeAccordionItem(accordion, item, itemIndex) {
    const button2 = item.querySelector(".accordion-action");
    const content = item.querySelector(".accordion-content");
    if (!button2 || !content) return;
    this.addSEOAndAccessibilityAttributes(accordion, item, button2, content, itemIndex);
    const iconWrapper = item.querySelector(".accordion-action span");
    const svgIcon = item.querySelector(".accordion-action svg");
    const plusIcon = item.querySelector(".accordion-plus-icon");
    let icon = null;
    let iconType = "none";
    if (svgIcon) {
      icon = svgIcon;
      iconType = "svg";
    } else if (plusIcon) {
      icon = plusIcon;
      iconType = "div";
    } else if (iconWrapper == null ? void 0 : iconWrapper.querySelector("svg")) {
      icon = iconWrapper.querySelector("svg");
      iconType = "svg-in-span";
    }
    const itemData = {
      item,
      button: button2,
      content,
      icon,
      iconType,
      isOpen: false,
      isAnimating: false,
      itemIndex
    };
    this.setInitialState(itemData);
    button2.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleItem(accordion, itemData);
    });
    accordion.items.set(itemIndex, itemData);
  }
  setInitialState(itemData) {
    const { item, button: button2, content } = itemData;
    const isInitiallyOpen = item.classList.contains("default-open");
    if (isInitiallyOpen) {
      this.openItem(itemData, false);
      const accordion = this.findAccordionByItem(item);
      if (accordion) {
        accordion.activeItems.add(itemData.itemIndex);
      }
      this.applyBackgroundColor(itemData, "open");
    } else {
      this.closeItem(itemData, false);
      this.applyBackgroundColor(itemData, "closed");
    }
  }
  toggleItem(accordion, itemData) {
    if (accordion.isAnimating || itemData.isAnimating) return;
    if (itemData.isOpen) {
      this.closeItem(itemData);
      accordion.activeItems.delete(itemData.itemIndex);
    } else {
      if (!this.options.allowMultiple) {
        this.closeAllItems(accordion);
      }
      this.openItem(itemData);
      accordion.activeItems.add(itemData.itemIndex);
    }
  }
  openItem(itemData, animate = true) {
    const { item, button: button2, content, icon, iconType } = itemData;
    if (itemData.isAnimating) return;
    itemData.isAnimating = true;
    itemData.isOpen = true;
    content.style.overflow = "hidden";
    content.style.transition = `height ${this.options.animationDuration}ms ${this.options.easing}, opacity ${this.options.animationDuration}ms ${this.options.easing}`;
    if (animate) {
      content.style.height = "auto";
      const targetHeight = content.scrollHeight;
      content.style.height = "0px";
      content.style.opacity = "0";
      content.offsetHeight;
      this.prepareContentForAnimation(content, "in");
      this.animateContentIn(content);
      requestAnimationFrame(() => {
        content.style.height = `${targetHeight}px`;
        content.style.opacity = "1";
      });
      const handleTransitionEnd = (e) => {
        if (e.propertyName === "height") {
          content.style.height = "auto";
          content.removeEventListener("transitionend", handleTransitionEnd);
          itemData.isAnimating = false;
        }
      };
      content.addEventListener("transitionend", handleTransitionEnd);
    } else {
      content.style.height = "auto";
      content.style.opacity = "1";
      itemData.isAnimating = false;
      this.prepareContentForAnimation(content, "in");
      this.animateContentIn(content);
    }
    this.updateIcon(itemData, "open");
    button2.setAttribute("aria-expanded", "true");
    content.setAttribute("aria-hidden", "false");
    item.setAttribute("aria-expanded", "true");
    item.setAttribute("aria-selected", "true");
    item.classList.add("active");
    this.applyBackgroundColor(itemData, "open");
  }
  closeItem(itemData, animate = true) {
    const { item, button: button2, content, icon, iconType } = itemData;
    if (itemData.isAnimating) return;
    itemData.isAnimating = true;
    itemData.isOpen = false;
    content.style.overflow = "hidden";
    content.style.transition = `height ${this.options.animationDuration}ms ${this.options.easing}, opacity ${this.options.animationDuration}ms ${this.options.easing}`;
    if (animate) {
      this.prepareContentForAnimation(content, "out");
      this.animateContentOut(content);
      const currentHeight = content.scrollHeight;
      content.style.height = `${currentHeight}px`;
      content.offsetHeight;
      setTimeout(() => {
        requestAnimationFrame(() => {
          content.style.height = "0px";
          content.style.opacity = "0";
        });
      }, 100);
      const handleTransitionEnd = (e) => {
        if (e.propertyName === "height") {
          content.removeEventListener("transitionend", handleTransitionEnd);
          itemData.isAnimating = false;
          this.cleanupSplitText(content);
        }
      };
      content.addEventListener("transitionend", handleTransitionEnd);
    } else {
      content.style.height = "0px";
      content.style.opacity = "0";
      itemData.isAnimating = false;
      this.cleanupSplitText(content);
    }
    this.updateIcon(itemData, "closed");
    button2.setAttribute("aria-expanded", "false");
    content.setAttribute("aria-hidden", "true");
    item.setAttribute("aria-expanded", "false");
    item.setAttribute("aria-selected", "false");
    item.classList.remove("active");
    this.applyBackgroundColor(itemData, "closed");
  }
  closeAllItems(accordion) {
    accordion.items.forEach((itemData) => {
      if (itemData.isOpen) {
        this.cleanupSplitText(itemData.content);
        this.closeItem(itemData);
        accordion.activeItems.delete(itemData.itemIndex);
      }
    });
  }
  findAccordionByItem(item) {
    for (const accordion of this.accordions.values()) {
      for (const itemData of accordion.items.values()) {
        if (itemData.item === item) {
          return accordion;
        }
      }
    }
    return null;
  }
  ensureSingleActiveItem() {
    this.accordions.forEach((accordion) => {
      const activeItems = Array.from(accordion.items.values()).filter(
        (itemData) => itemData.item.classList.contains("default-open")
      );
      if (activeItems.length > 1) {
        activeItems.slice(1).forEach((itemData) => {
          itemData.item.classList.remove("default-open");
          this.closeItem(itemData, false);
          accordion.activeItems.delete(itemData.itemIndex);
        });
      }
      if (activeItems.length === 0) {
        accordion.items.forEach((itemData) => {
          if (itemData.isOpen) {
            this.closeItem(itemData, false);
            accordion.activeItems.delete(itemData.itemIndex);
          }
        });
      }
    });
  }
  updateIcon(itemData, state) {
    const { icon, iconType } = itemData;
    if (!icon) return;
    if (iconType === "svg" || iconType === "svg-in-span") {
      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(icon);
        gsap.to(icon, {
          rotation: state === "open" ? 180 : 0,
          duration: this.options.animationDuration / 1e3,
          ease: state === "open" ? "power3.out" : "power3.in"
        });
      } else {
        icon.style.transform = state === "open" ? "rotate(180deg)" : "rotate(0deg)";
        icon.style.transition = `transform ${this.options.animationDuration}ms ${this.options.easing}`;
      }
    } else if (iconType === "div") {
      if (state === "open") {
        itemData.item.classList.add("active");
      } else {
        itemData.item.classList.remove("active");
      }
    }
  }
  applyBackgroundColor(itemData, state) {
    const { item } = itemData;
    const bgColor = item.getAttribute("data-active-bg-color");
    if (!bgColor) return;
    item.style.transition = `background-color ${this.options.animationDuration}ms ${this.options.easing}`;
    if (state === "open") {
      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(item);
        gsap.to(item, {
          backgroundColor: bgColor,
          duration: this.options.animationDuration / 1e3,
          ease: "power2.out"
        });
      } else {
        item.style.backgroundColor = bgColor;
      }
    } else {
      if (typeof gsap !== "undefined") {
        gsap.killTweensOf(item);
        gsap.to(item, {
          backgroundColor: "transparent",
          duration: this.options.animationDuration / 1e3,
          ease: "power2.in"
        });
      } else {
        item.style.backgroundColor = "transparent";
      }
    }
  }
  animateContentIn(content) {
    if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
      return;
    }
    const textElements = content.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6");
    if (!textElements.length) return;
    const accordionDuration = this.options.animationDuration / 1e3;
    const textDuration = Math.max(0.6, accordionDuration * 0.8);
    textElements.forEach((element, index) => {
      if (element._splitTextInstance) {
        element._splitTextInstance.revert();
        element._splitTextInstance = null;
      }
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "all" });
      if (element.tagName === "P" && element.textContent.trim()) {
        const splitText = new SplitText(element, { type: "lines" });
        const lines = splitText.lines;
        element._splitTextInstance = splitText;
        gsap.set(lines, {
          opacity: 0,
          y: 30,
          rotationX: -90
        });
        gsap.to(lines, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: textDuration,
          ease: "power2.out",
          stagger: 0.08,
          delay: index * 0.05
        });
      } else {
        gsap.set(element, { opacity: 0, y: 20 });
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: textDuration * 0.8,
          ease: "power2.out",
          delay: index * 0.03
        });
      }
    });
  }
  animateContentOut(content) {
    if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
      return;
    }
    const textElements = content.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6");
    if (!textElements.length) return;
    const accordionDuration = this.options.animationDuration / 1e3;
    const textDuration = Math.max(0.3, accordionDuration * 0.6);
    textElements.forEach((element, index) => {
      gsap.killTweensOf(element);
      if (element.tagName === "P" && element.textContent.trim()) {
        const splitText = new SplitText(element, { type: "lines" });
        const lines = splitText.lines;
        element._splitTextInstance = splitText;
        gsap.to(lines, {
          opacity: 0,
          y: -20,
          rotationX: 90,
          duration: textDuration,
          ease: "power2.in",
          stagger: 0.03,
          delay: index * 0.02
        });
      } else {
        gsap.to(element, {
          opacity: 0,
          y: -15,
          duration: textDuration * 0.8,
          ease: "power2.in",
          delay: index * 0.02
        });
      }
    });
  }
  cleanupSplitText(content) {
    if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
      return;
    }
    const textElements = content.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6");
    textElements.forEach((element) => {
      gsap.killTweensOf(element);
      if (element._splitTextInstance) {
        element._splitTextInstance.revert();
        element._splitTextInstance = null;
      }
      gsap.set(element, { clearProps: "all" });
    });
  }
  // Prevent animation conflicts by ensuring clean state
  prepareContentForAnimation(content, direction = "in") {
    if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
      return;
    }
    const textElements = content.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6");
    textElements.forEach((element) => {
      gsap.killTweensOf(element);
      if (element._splitTextInstance) {
        element._splitTextInstance.revert();
        element._splitTextInstance = null;
      }
      gsap.set(element, {
        clearProps: "all",
        opacity: direction === "in" ? 0 : 1
      });
    });
  }
  addSEOAndAccessibilityAttributes(accordion, item, button2, content, itemIndex) {
    item.setAttribute("itemscope", "");
    item.setAttribute("itemprop", "mainEntity");
    item.setAttribute("itemtype", "https://schema.org/Question");
    item.setAttribute("role", "tab");
    item.setAttribute("tabindex", "0");
    const isInitiallyOpen = item.classList.contains("default-open");
    item.setAttribute("aria-expanded", isInitiallyOpen ? "true" : "false");
    item.setAttribute("aria-selected", isInitiallyOpen ? "true" : "false");
    const questionId = `faq-question-${accordion.id}-${itemIndex}`;
    const answerId = `faq-answer-${accordion.id}-${itemIndex}`;
    button2.setAttribute("id", questionId);
    button2.setAttribute("aria-controls", answerId);
    button2.setAttribute("aria-expanded", isInitiallyOpen ? "true" : "false");
    content.setAttribute("id", answerId);
    content.setAttribute("role", "tabpanel");
    content.setAttribute("aria-labelledby", questionId);
    content.setAttribute("aria-hidden", isInitiallyOpen ? "false" : "true");
    content.setAttribute("itemscope", "");
    content.setAttribute("itemprop", "acceptedAnswer");
    content.setAttribute("itemtype", "https://schema.org/Answer");
    button2.setAttribute("itemprop", "name");
    const answerText = content.querySelector("p");
    if (answerText) {
      answerText.setAttribute("itemprop", "text");
    }
    const plusIcon = item.querySelector(".accordion-plus-icon");
    if (plusIcon) {
      plusIcon.setAttribute("aria-hidden", "true");
    }
  }
  setupKeyboardNavigation(accordion) {
    accordion.container.addEventListener("keydown", (e) => {
      if (!e.target.closest(".accordion-action")) return;
      const items = Array.from(accordion.items.values());
      const currentIndex = items.findIndex((item) => item.button === e.target);
      if (currentIndex === -1) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].button.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex].button.focus();
          break;
        case "Home":
          e.preventDefault();
          items[0].button.focus();
          break;
        case "End":
          e.preventDefault();
          items[items.length - 1].button.focus();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          this.toggleItem(accordion, items[currentIndex]);
          break;
      }
    });
  }
  addStaggerToAccordionItems() {
    const accordionContainers = document.querySelectorAll(".accordion");
    accordionContainers.forEach((container) => {
      const items = container.querySelectorAll(".accordion-item");
      if (!items.length) return;
      items.forEach((item, index) => {
        const staggerDelay = index * 0.1;
        item.setAttribute("data-opai-animate", "");
        item.setAttribute("data-delay", staggerDelay.toString());
        item.setAttribute("data-accordion-stagger", "true");
      });
    });
  }
  // Public API methods
  openItemById(accordionId, itemIndex) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;
    const itemData = accordion.items.get(itemIndex);
    if (!itemData) return;
    this.toggleItem(accordion, itemData);
  }
  closeItemById(accordionId, itemIndex) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;
    const itemData = accordion.items.get(itemIndex);
    if (!itemData || !itemData.isOpen) return;
    this.toggleItem(accordion, itemData);
  }
  openAllItems(accordionId) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;
    accordion.items.forEach((itemData) => {
      if (!itemData.isOpen) {
        this.openItem(itemData);
        accordion.activeItems.add(itemData.itemIndex);
      }
    });
  }
  closeAllItemsById(accordionId) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;
    this.closeAllItems(accordion);
  }
  destroy(accordionId) {
    const accordion = this.accordions.get(accordionId);
    if (!accordion) return;
    accordion.items.forEach((itemData) => {
      const { button: button2, content } = itemData;
      button2.removeEventListener("click", this.toggleItem);
      this.cleanupSplitText(content);
    });
    this.accordions.delete(accordionId);
  }
  destroyAll() {
    this.accordions.forEach((accordion, id) => {
      this.destroy(id);
    });
  }
}
const accordionManager = new AccordionManager({
  allowMultiple: false,
  animationDuration: 300,
  easing: "ease-in-out",
  autoClose: true,
  keyboardNavigation: true
});
window.AccordionManager = AccordionManager;
window.accordionManager = accordionManager;
const avatar = {
  init() {
    const avatars = document.querySelectorAll("[data-opai-avatar]");
    avatars.forEach((avatar2) => {
      const delay = avatar2.getAttribute("data-avatar-delay") ? parseFloat(avatar2.getAttribute("data-avatar-delay")) : 0;
      const direction = avatar2.getAttribute("data-avatar-direction") ? avatar2.getAttribute("data-avatar-direction") : "left";
      const scale = avatar2.getAttribute("data-avatar-scale") ? parseFloat(avatar2.getAttribute("data-avatar-scale")) : 0;
      const offset = avatar2.getAttribute("data-avatar-offset") ? parseFloat(avatar2.getAttribute("data-avatar-offset")) : 0;
      const animationProps = {
        duration: 1.5,
        opacity: 0,
        scale,
        filter: "blur(5px)",
        delay,
        ease: "elastic.out(1, 0.7)",
        scrollTrigger: {
          trigger: avatar2,
          start: "top 90%",
          end: "bottom 20%"
        }
      };
      switch (direction) {
        case "left":
          animationProps.x = -offset;
          break;
        case "right":
          animationProps.x = offset;
          break;
        case "down":
          animationProps.y = offset;
          break;
        case "up":
        default:
          animationProps.y = -offset;
          break;
      }
      gsap.from(avatar2, animationProps);
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  avatar.init();
});
const borderExpand = {
  init() {
    const lengthElements = document.querySelectorAll("[data-opai-border-expand]");
    lengthElements.forEach((element) => {
      const ElementFinalWidth = element.offsetWidth;
      const delay = element.getAttribute("data-delay") ? parseFloat(element.getAttribute("data-delay")) : 0;
      const top = element.getAttribute("data-top") ? element.getAttribute("data-top") : "top 100%";
      const markerId = element.getAttribute("data-marker-id") ? element.getAttribute("data-marker-id") : false;
      const duration = element.getAttribute("data-duration") ? parseFloat(element.getAttribute("data-duration")) : 0.6;
      gsap.set(element, {
        width: 0
      });
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: top,
          end: "top 100%",
          toggleActions: "play none none none",
          markers: markerId ? true : false,
          id: markerId && markerId
        },
        width: ElementFinalWidth,
        duration,
        ease: "power3.out",
        delay
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  borderExpand.init();
});
document.addEventListener("DOMContentLoaded", function() {
  const numberObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const number = parseInt(element.getAttribute("data-number"));
          const speed = parseInt(element.getAttribute("data-speed")) || 800;
          const interval = parseInt(element.getAttribute("data-interval")) || 150;
          const rooms = parseInt(element.getAttribute("data-rooms")) || 2;
          const dataSpace = element.getAttribute("data-height-space");
          if (!element.classList.contains("animated")) {
            element.classList.add("animated");
            NumberAnimation(element, {
              number,
              speed,
              interval,
              rooms,
              dataSpace,
              // Pass the data-space attribute
              fontStyle: {
                "font-size": "inherit",
                color: "inherit"
              }
            });
          }
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px 0px -50px 0px"
    }
  );
  const numberElements = document.querySelectorAll("[data-counter]");
  numberElements.forEach((element) => {
    numberObserver.observe(element);
  });
});
const footerTextShuffle = {
  init() {
    const elements = document.querySelectorAll(".footer-title, .footer-title-2");
    if (!elements.length) return;
    elements.forEach((element) => {
      var _a;
      element.style.whiteSpace = "nowrap";
      const spanElement = element.querySelector("span");
      const textNode = spanElement || element;
      const originalText = ((_a = textNode.textContent) == null ? void 0 : _a.trim()) || "Nexsas";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const duration = 2e3;
      let startTime = null;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const revealed = Math.floor(progress * originalText.length);
        const animatedText = originalText.split("").map((char, i) => {
          if (char === " ") return " ";
          return i < revealed ? originalText[i] : chars[Math.floor(Math.random() * 26)];
        }).join("");
        if (spanElement) {
          spanElement.textContent = animatedText;
        } else {
          element.textContent = animatedText;
        }
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (spanElement) {
            spanElement.textContent = originalText;
          } else {
            element.textContent = originalText;
          }
        }
      };
      const shuffle = () => {
        startTime = null;
        requestAnimationFrame(animate);
      };
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: element,
          start: "top 100%",
          onEnter: shuffle,
          once: true
        });
      } else {
        shuffle();
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => footerTextShuffle.init());
class ModalAnimation {
  constructor() {
    this.modal = null;
    this.content = null;
    this.isOpen = false;
    this.isAnimating = false;
    this.scrollTriggered = false;
    this.config = {
      scrollThreshold: 800,
      storageKey: "joinModalDismissed",
      animation: {
        duration: 300,
        closeDelay: 200
      }
    };
  }
  init() {
    this.bindEvents();
    this.setupScrollTrigger();
  }
  // Event binding
  bindEvents() {
    document.addEventListener("click", (e) => this.handleClick(e));
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
  }
  handleClick(e) {
    var _a;
    const trigger = e.target.closest(".modal-action");
    if (trigger) {
      e.preventDefault();
      this.open(trigger);
      return;
    }
    const closeBtn = e.target.closest(".modal-close-btn, .close-join-modal");
    const overlay = (_a = e.target.classList) == null ? void 0 : _a.contains("modal-overlay");
    if (closeBtn) {
      this.close(true);
    } else if (overlay && e.target === this.modal) {
      this.close(false);
    }
  }
  handleKeydown(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.close(false);
    }
  }
  // Open modal
  open(trigger) {
    if (this.isAnimating) return;
    const overlay = trigger.closest(".modal-overlay") || document.querySelector(".modal-overlay");
    if (!overlay) return;
    if (this.isOpen) {
      this.close(false);
      setTimeout(() => {
        this._openWithVideo(overlay, trigger);
      }, this.config.animation.closeDelay + 50);
      return;
    }
    this._openWithVideo(overlay, trigger);
  }
  _openWithVideo(overlay, trigger) {
    this.modal = overlay;
    this.content = overlay.querySelector(".modal-content");
    const videoUrl = trigger.dataset.videoUrl;
    if (videoUrl) this.loadVideo(videoUrl);
    this.show();
  }
  show() {
    this.isOpen = true;
    this.isAnimating = true;
    document.body.style.overflow = "hidden";
    this.modal.classList.add("modal-open");
    this.modal.classList.remove("modal-close");
    this.modal.removeAttribute("aria-hidden");
    if (this.modal.tagName === "DIALOG") {
      this.modal.showModal();
    }
    this.animate("open");
  }
  // Close modal
  close(persist = false) {
    if (!this.isOpen || this.isAnimating) return;
    this.isAnimating = true;
    this.isOpen = false;
    if (persist) {
      this.savePreference();
    }
    this.animate("close", () => {
      document.body.style.overflow = "auto";
      this.modal.classList.remove("modal-open");
      this.modal.classList.add("modal-close");
      this.modal.setAttribute("aria-hidden", "true");
      if (this.modal.tagName === "DIALOG") {
        this.modal.close();
      }
      this.clearVideo();
      this.isAnimating = false;
    });
  }
  // Animation
  animate(type, callback) {
    if (!this.content) {
      this.isAnimating = false;
      callback == null ? void 0 : callback();
      return;
    }
    if (typeof gsap === "undefined") {
      if (type === "open") {
        this.content.style.outline = "none";
        this.content.setAttribute("tabindex", "-1");
        this.content.focus();
      }
      this.isAnimating = false;
      callback == null ? void 0 : callback();
      return;
    }
    gsap.killTweensOf(this.content);
    if (type === "open") {
      this.content.style.outline = "none";
      this.content.setAttribute("tabindex", "-1");
      gsap.fromTo(
        this.content,
        { opacity: 0, y: -50 },
        {
          opacity: 1,
          y: 0,
          duration: this.config.animation.duration / 1e3,
          ease: "power3.inOut",
          onComplete: () => {
            this.content.focus();
            this.isAnimating = false;
          }
        }
      );
    } else {
      gsap.to(this.content, {
        opacity: 0,
        y: -50,
        duration: this.config.animation.closeDelay / 1e3,
        ease: "power2.in",
        onComplete: callback
      });
    }
  }
  // Video handling
  loadVideo(url) {
    var _a;
    const iframe = (_a = this.content) == null ? void 0 : _a.querySelector("iframe");
    if (!iframe) return;
    iframe.src = "";
    requestAnimationFrame(() => {
      iframe.src = url;
    });
  }
  clearVideo() {
    var _a;
    const iframe = (_a = this.content) == null ? void 0 : _a.querySelector("iframe");
    if (iframe) iframe.src = "";
  }
  // Scroll trigger
  setupScrollTrigger() {
    const joinModal = Array.from(document.querySelectorAll(".modal-overlay")).find(
      (m) => m.querySelector(".close-join-modal, #join-modal-title")
    );
    if (!joinModal || this.wasModalDismissed()) return;
    const handleScroll = () => {
      if (this.scrollTriggered) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY >= this.config.scrollThreshold) {
        this.scrollTriggered = true;
        this.modal = joinModal;
        this.content = joinModal.querySelector(".modal-content");
        this.show();
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (document.readyState !== "loading") {
      handleScroll();
    }
  }
  // Storage
  wasModalDismissed() {
    return localStorage.getItem(this.config.storageKey) === "true";
  }
  savePreference() {
    try {
      localStorage.setItem(this.config.storageKey, "true");
    } catch (e) {
      console.warn("Could not save modal preference");
    }
  }
  // Cleanup
  destroy() {
    if (this.isOpen) this.close(false);
  }
}
if (typeof window !== "undefined") {
  const modal = new ModalAnimation();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => modal.init(), { once: true });
  } else {
    modal.init();
  }
}
const navbarReveal = {
  init() {
    const navbar = document.querySelector(".ai-voice-generator-navbar");
    if (!navbar) return;
    const targetWidth = navbar.offsetWidth;
    gsap.set(navbar, {
      width: 0,
      opacity: 0,
      overflow: "hidden"
    });
    gsap.to(navbar, {
      width: targetWidth,
      opacity: 1,
      duration: 0.9,
      ease: "sine.in",
      delay: 0.3,
      onComplete: () => {
        navbar.style.width = "";
        navbar.style.maxWidth = "";
        navbar.style.overflow = "";
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => navbarReveal.init());
const priceSwitcher = {
  init() {
    document.querySelectorAll(".price-scope").forEach((scope) => this.initScope(scope));
  },
  initScope(scope) {
    const toggle = scope.querySelector(".price-switcher-input");
    if (!toggle) return;
    const monthlyPrices = scope.querySelectorAll(".price-month");
    const yearlyPrices = scope.querySelectorAll(".price-year");
    const monthlyLabels = scope.querySelectorAll(".price-label-monthly");
    const yearlyLabels = scope.querySelectorAll(".price-label-yearly");
    this.apply(scope, toggle.checked, { monthlyPrices, yearlyPrices, monthlyLabels, yearlyLabels });
    toggle.addEventListener("change", () => {
      this.apply(scope, toggle.checked, {
        monthlyPrices,
        yearlyPrices,
        monthlyLabels,
        yearlyLabels
      });
    });
  },
  apply(scope, isYearly, groups) {
    const { monthlyPrices, yearlyPrices, monthlyLabels, yearlyLabels } = groups;
    monthlyPrices.forEach((el) => el.classList.toggle("hidden", isYearly));
    yearlyPrices.forEach((el) => el.classList.toggle("hidden", !isYearly));
    monthlyLabels.forEach((el) => el.classList.toggle("hidden", isYearly));
    yearlyLabels.forEach((el) => el.classList.toggle("hidden", !isYearly));
  }
};
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => priceSwitcher.init());
}
const PricingToggle = {
  init(root = document) {
    const scopes = root.querySelectorAll(".price-scope");
    scopes.forEach((scope, scopeIdx) => this._initScope(scope, scopeIdx));
  },
  _initScope(scope, scopeIdx) {
    const radios = Array.from(
      scope.querySelectorAll(
        'input[type="radio"][value="monthly"], input[type="radio"][value="quarterly"], input[type="radio"][value="yearly"]'
      )
    );
    if (!radios.length) return;
    const uniqueGroupName = `pricing-toggle-auto-${scopeIdx}`;
    radios.forEach((r) => {
      r.name = uniqueGroupName;
    });
    const usedIds = /* @__PURE__ */ new Set();
    radios.forEach((r) => {
      var _a;
      const originalId = ((_a = r.id) == null ? void 0 : _a.trim()) || "";
      let newId = originalId;
      if (!newId || usedIds.has(newId) || document.getElementById(newId) !== r) {
        const period = this._periodFromIdOrValue(r.id, r.value) || "p";
        newId = `pricing-${period}-${scopeIdx}-${Math.random().toString(36).slice(2, 7)}`;
        r.id = newId;
      }
      usedIds.add(newId);
      const label = scope.querySelector(
        `label[for="${CSS.escape(originalId)}"], label[for="${CSS.escape(newId)}"]`
      );
      if (label) label.setAttribute("for", newId);
    });
    const cards = scope.querySelectorAll(".pricing-card");
    if (!cards.length) return;
    const available = this._availablePeriods(cards);
    radios.forEach((r) => {
      const period = this._periodFromIdOrValue(r.id, r.value);
      const label = scope.querySelector(`label[for="${CSS.escape(r.id)}"]`);
      const isAvailable = !!period && available.includes(period);
      r.style.display = isAvailable ? "" : "none";
      if (label) label.style.display = isAvailable ? "" : "none";
    });
    radios.forEach((r) => {
      r.addEventListener("change", (e) => {
        if (e.target.checked) {
          const period = this._periodFromIdOrValue(e.target.id, e.target.value);
          if (period) this._apply(scope, cards, period);
        }
      });
    });
    const checked = radios.find(
      (r) => r.checked && available.includes(this._periodFromIdOrValue(r.id, r.value))
    );
    if (checked) {
      this._apply(scope, cards, this._periodFromIdOrValue(checked.id, checked.value));
    } else {
      const first = radios.find(
        (r) => available.includes(this._periodFromIdOrValue(r.id, r.value))
      );
      if (first) {
        first.checked = true;
        this._apply(scope, cards, this._periodFromIdOrValue(first.id, first.value));
      }
    }
  },
  _apply(scope, cards, period) {
    const all = ["monthly", "quarterly", "yearly"];
    cards.forEach((card) => {
      all.forEach((p) => {
        const el = card.querySelector(`.${p}`);
        if (!el) return;
        el.classList.toggle("hidden", p !== period);
      });
    });
  },
  _availablePeriods(cards) {
    const first = cards[0];
    if (!first) return [];
    const out = [];
    if (first.querySelector(".monthly")) out.push("monthly");
    if (first.querySelector(".quarterly")) out.push("quarterly");
    if (first.querySelector(".yearly")) out.push("yearly");
    return out;
  },
  _periodFromIdOrValue(id = "", value = "") {
    const m = id && id.match(/^(monthly|quarterly|yearly)(?:[-_].+)?$/i) || value && value.match(/^(monthly|quarterly|yearly)$/i);
    return m ? m[0].toLowerCase().replace(/[-_].*$/, "") : null;
  }
};
const pricingSpotlightFooter = {
  init() {
    const box = document.querySelector(".pricing-spotlight-footer-box");
    if (!box) return;
    gsap.set(box, {
      transformOrigin: "top right"
    });
    gsap.from(box, {
      rotation: -17,
      duration: 1.2,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: box,
        start: "top 80%",
        end: "bottom 50%"
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  PricingToggle.init();
  pricingSpotlightFooter.init();
});
const progressiveBlurEffect = {
  init() {
    const blurElements = document.querySelectorAll("[data-progressive-blur-effect]");
    blurElements.forEach((element) => {
      const intensity = element.dataset.intensity ? Number.parseFloat(element.dataset.intensity) : 50;
      const position = element.dataset.position ? element.dataset.position : "top";
      const className = element.dataset.class ? element.dataset.class : "";
      const intensityFactor = intensity / 50;
      const blurLayers = [
        { blur: `${1 * intensityFactor}px`, maskStart: 0, maskEnd: 25, zIndex: 1 },
        { blur: `${3 * intensityFactor}px`, maskStart: 25, maskEnd: 75, zIndex: 2 },
        { blur: `${6 * intensityFactor}px`, maskStart: 75, maskEnd: 100, zIndex: 3 }
      ];
      const positionStyles = {
        bottom: { bottom: "0", left: "0", right: "0", top: "auto" },
        top: { top: "0", left: "0", right: "0", bottom: "auto" },
        left: { left: "0", top: "0", bottom: "0", right: "auto" },
        right: { right: "0", top: "0", bottom: "0", left: "auto" }
      };
      const gradientDirection = {
        bottom: "to bottom",
        top: "to top",
        left: "to left",
        right: "to right"
      };
      Object.assign(
        element.style,
        {
          position: "absolute",
          zIndex: "10",
          pointerEvents: "auto"
        },
        positionStyles[position]
      );
      if (className) {
        className.split(" ").forEach((cls) => {
          if (cls.trim()) {
            element.classList.add(cls.trim());
          }
        });
      }
      blurLayers.forEach((layer, index) => {
        const layerElement = document.createElement("div");
        const maskImage = `linear-gradient(${gradientDirection[position]}, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`;
        Object.assign(layerElement.style, {
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          pointerEvents: "none",
          zIndex: String(layer.zIndex),
          backdropFilter: `blur(${layer.blur})`,
          WebkitBackdropFilter: `blur(${layer.blur})`,
          maskImage,
          WebkitMaskImage: maskImage
        });
        element.appendChild(layerElement);
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  progressiveBlurEffect.init();
});
const animation = {
  init() {
    const elements = document.querySelectorAll("[data-opai-animate]");
    const Springer = window.Springer.default;
    elements.forEach((elem) => {
      const duration = elem.getAttribute("data-duration") ? parseFloat(elem.getAttribute("data-duration")) : 0.6;
      const blur = elem.getAttribute("data-blur") ? parseFloat(elem.getAttribute("data-blur")) : 0;
      const delay = elem.getAttribute("data-delay") ? parseFloat(elem.getAttribute("data-delay")) : 0;
      const offset = elem.getAttribute("data-offset") ? parseFloat(elem.getAttribute("data-offset")) : 60;
      const instant = elem.hasAttribute("data-instant") && elem.getAttribute("data-instant") !== "false";
      const start = elem.getAttribute("data-start") || "top 90%";
      const end = elem.getAttribute("data-end") || "top 50%";
      const direction = elem.getAttribute("data-direction") || "down";
      const useSpring = elem.hasAttribute("data-spring");
      const spring = useSpring ? Springer(0.2, 0.8) : null;
      const rotation = elem.getAttribute("data-rotation") ? parseFloat(elem.getAttribute("data-rotation")) : 0;
      const scale = elem.getAttribute("data-scale") ? parseFloat(elem.getAttribute("data-scale")) : 1;
      const animationType = elem.getAttribute("data-animation-type") || "from";
      elem.style.opacity = "1";
      elem.style.filter = `blur(${blur}px)`;
      let animationProps;
      if (animationType === "to") {
        animationProps = {
          opacity: 1,
          filter: "blur(0)",
          duration,
          delay,
          ease: useSpring ? spring : "power2.out",
          scale
        };
        if (rotation !== 0) {
          animationProps.rotation = rotation;
        }
      } else {
        animationProps = {
          opacity: 0,
          filter: "blur(16px)",
          duration,
          delay,
          ease: useSpring ? spring : "power2.out"
        };
        if (rotation !== 0) {
          animationProps.rotation = rotation;
        }
      }
      if (!instant) {
        animationProps.scrollTrigger = {
          trigger: elem,
          start,
          end,
          scrub: false
        };
      }
      switch (direction) {
        case "left":
          animationProps.x = -offset;
          break;
        case "right":
          animationProps.x = offset;
          break;
        case "down":
          animationProps.y = offset;
          break;
        case "up":
        default:
          animationProps.y = -offset;
          break;
      }
      if (animationType === "to") {
        gsap.to(elem, animationProps);
      } else {
        gsap.from(elem, animationProps);
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  animation.init();
});
let lenis;
const smoothScrolling = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768 || "ontouchstart" in window;
  if (!isMobile) {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((time) => {
      lenis.raf(time * 1e3);
    });
    gsap.ticker.lagSmoothing(0);
  }
};
const resetTocItems = (sidebarList) => {
  const allListItems = sidebarList.querySelectorAll("li");
  allListItems.forEach((item) => {
    const icon = item.querySelector("span:last-child");
    const text = item.querySelector("span:first-child, a span");
    if (icon) icon.classList.add("invisible");
    if (text) {
      text.classList.remove("font-medium", "text-secondary", "dark:text-accent");
      text.classList.add("font-normal", "text-secondary/60", "dark:text-accent/60");
    }
  });
};
const activateTocItem = (item) => {
  const icon = item.querySelector("span:last-child");
  const text = item.querySelector("span:first-child, a span");
  if (icon) icon.classList.remove("invisible");
  if (text) {
    text.classList.remove("font-normal", "text-secondary/60", "dark:text-accent/60");
    text.classList.add("font-medium", "text-secondary", "dark:text-accent");
  }
};
const handleTocItemClick = (clickedItem, sidebarList) => {
  resetTocItems(sidebarList);
  activateTocItem(clickedItem);
};
const lenisSmoothScrollLinks = () => {
  const lenisTargetElements = document.querySelectorAll(".lenis-scroll-to");
  const sidebarList = document.querySelector(".table-of-contents .table-of-list");
  lenisTargetElements.forEach((ele) => {
    ele.addEventListener("click", function(e) {
      e.preventDefault();
      const target = ele.getAttribute("href");
      if (sidebarList) {
        const clickedItem = ele.closest("li");
        if (clickedItem) {
          handleTocItemClick(clickedItem, sidebarList);
        }
      }
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -100,
            duration: 1.7,
            easing: (t) => 1 - Math.pow(1 - t, 3)
          });
        } else {
          const targetElement = document.querySelector(target);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
            setTimeout(() => {
              window.scrollBy(0, -100);
            }, 100);
          }
        }
      }
    });
  });
};
const handleTocListClicks = () => {
  const sidebarList = document.querySelector(".table-of-contents .table-of-list");
  if (!sidebarList) return;
  const listItems = sidebarList.querySelectorAll("li");
  listItems.forEach((item) => {
    if (item.querySelector(".lenis-scroll-to")) {
      return;
    }
    item.addEventListener("click", function() {
      handleTocItemClick(item, sidebarList);
    });
  });
};
document.addEventListener("DOMContentLoaded", () => {
  smoothScrolling();
  lenisSmoothScrollLinks();
  handleTocListClicks();
});
const splitTextReveal = {
  init() {
    document.querySelectorAll("[data-opai-split-text]").forEach((elem) => {
      const lineDelay = parseFloat(elem.getAttribute("data-line-delay") || "0.15");
      const duration = parseFloat(elem.getAttribute("data-line-duration") || "0.9");
      const offsetY = parseFloat(elem.getAttribute("data-line-offset-y") || "100");
      const instant = elem.hasAttribute("data-line-instant") && elem.getAttribute("data-line-instant") !== "false";
      const start = elem.getAttribute("data-line-start") || "top 90%";
      const delay = parseFloat(elem.getAttribute("data-delay") || "0.1");
      const splitText = new SplitText(elem, { type: "lines", tag: "span" });
      const lineSpans = splitText.lines;
      if (!(lineSpans == null ? void 0 : lineSpans.length)) return;
      elem.style.opacity = 1;
      lineSpans.forEach((line) => {
        var _a;
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "overflow: hidden; display: block;";
        (_a = line.parentNode) == null ? void 0 : _a.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
      gsap.fromTo(
        lineSpans,
        { y: offsetY, opacity: 0, display: "block" },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power2.inOut",
          stagger: lineDelay,
          scrollTrigger: instant ? null : {
            trigger: elem,
            start,
            once: true
          }
        }
      );
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  splitTextReveal.init();
});
const tabSlider = {
  // Default configuration
  defaults: {
    animationDuration: 0.3,
    animationEase: "power2.out",
    activeTabBgColor: "var(--color-background-7)",
    activeTabTextColor: "var(--color-background-13)",
    inactiveTabTextColor: "rgba(255, 255, 255, 0.6)"
  },
  init() {
    const wrappers = document.querySelectorAll(".tab-slider-wrapper");
    wrappers.forEach((wrapper) => {
      this.initWrapper(wrapper);
    });
  },
  initWrapper(wrapper) {
    const config = this.getConfig(wrapper);
    const activeTab = wrapper.querySelector(".active-tab");
    const inputs = wrapper.querySelectorAll('input[type="radio"]');
    const labels = wrapper.querySelectorAll("label[for]");
    wrapper.querySelector("fieldset");
    if (!activeTab || !inputs.length || !labels.length) {
      console.warn("Tab slider: Missing required elements");
      return;
    }
    this.setInitialState(wrapper, activeTab, config);
    this.addEventListeners(wrapper, inputs, labels, activeTab, config);
    wrapper._tabSliderConfig = config;
  },
  getConfig(wrapper) {
    return {
      animationDuration: parseFloat(wrapper.dataset.animationDuration) || this.defaults.animationDuration,
      animationEase: wrapper.dataset.animationEase || this.defaults.animationEase,
      activeTabBgColor: wrapper.dataset.activeTabBgColor || this.defaults.activeTabBgColor,
      activeTabTextColor: wrapper.dataset.activeTabTextColor || this.defaults.activeTabTextColor,
      inactiveTabTextColor: wrapper.dataset.inactiveTabTextColor || this.defaults.inactiveTabTextColor,
      activeTabId: wrapper.dataset.activeTabId || ""
    };
  },
  setInitialState(wrapper, activeTab, config) {
    activeTab.style.backgroundColor = config.activeTabBgColor;
    activeTab.style.color = config.activeTabTextColor;
    const checkedInput = wrapper.querySelector('input[type="radio"]:checked');
    if (checkedInput) {
      this.animateToTab(wrapper, checkedInput, activeTab, config, false);
    }
  },
  addEventListeners(wrapper, inputs, labels, activeTab, config) {
    inputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.animateToTab(wrapper, e.target, activeTab, config, true);
        }
      });
    });
    labels.forEach((label) => {
      label.addEventListener("click", (e) => {
        const input = wrapper.querySelector(`input[id="${label.getAttribute("for")}"]`);
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event("change"));
        }
      });
    });
  },
  animateToTab(wrapper, targetInput, activeTab, config, animate = true) {
    const targetLabel = wrapper.querySelector(`label[for="${targetInput.id}"]`);
    if (!targetLabel) return;
    wrapper.getBoundingClientRect();
    const labelRect = targetLabel.getBoundingClientRect();
    const fieldset = wrapper.querySelector("fieldset");
    const fieldsetRect = fieldset.getBoundingClientRect();
    const translateX = labelRect.left - fieldsetRect.left;
    const translateY = labelRect.top - fieldsetRect.top;
    const width = labelRect.width;
    const height = labelRect.height;
    wrapper.dataset.activeTabId = targetInput.id;
    if (animate && window.gsap) {
      gsap.to(activeTab, {
        width,
        height,
        x: translateX,
        y: translateY,
        duration: config.animationDuration,
        ease: config.animationEase
      });
      this.updateTabColors(wrapper, targetInput, config);
    } else {
      activeTab.style.width = `${width}px`;
      activeTab.style.height = `${height}px`;
      activeTab.style.transform = `translate(${translateX}px, ${translateY}px)`;
      this.updateTabColors(wrapper, targetInput, config);
    }
  },
  updateTabColors(wrapper, activeInput, config) {
    const labels = wrapper.querySelectorAll("label[for]");
    labels.forEach((label) => {
      const input = wrapper.querySelector(`input[id="${label.getAttribute("for")}"]`);
      if (input === activeInput) {
        gsap.to(label, {
          color: config.activeTabTextColor,
          duration: 0.15,
          // Very fast but smooth
          ease: "power2.out"
        });
      } else {
        gsap.to(label, {
          color: "",
          // Empty string removes inline color, allowing CSS to control
          duration: 0.15,
          // Very fast but smooth
          ease: "power2.out"
        });
      }
    });
  },
  // Public method to programmatically switch tabs
  switchToTab(wrapper, tabId) {
    const input = wrapper.querySelector(`input[id="${tabId}"]`);
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event("change"));
    }
  },
  // Public method to get current active tab
  getActiveTab(wrapper) {
    var _a;
    return (_a = wrapper.querySelector('input[type="radio"]:checked')) == null ? void 0 : _a.id;
  },
  // Public method to destroy instance
  destroy(wrapper) {
    const inputs = wrapper.querySelectorAll('input[type="radio"]');
    const labels = wrapper.querySelectorAll("label[for]");
    inputs.forEach((input) => {
      input.removeEventListener("change", this.handleInputChange);
    });
    labels.forEach((label) => {
      label.removeEventListener("click", this.handleLabelClick);
    });
    delete wrapper._tabSliderConfig;
  }
};
document.addEventListener("DOMContentLoaded", () => {
  tabSlider.init();
});
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.classList && node.classList.contains("tab-slider-wrapper")) {
          tabSlider.initWrapper(node);
        }
        const tabSliders = node.querySelectorAll && node.querySelectorAll(".tab-slider-wrapper");
        if (tabSliders) {
          tabSliders.forEach((wrapper) => tabSlider.initWrapper(wrapper));
        }
      }
    });
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
window.tabSlider = tabSlider;
