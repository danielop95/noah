const accordionAnimation = {
  accordionGroups: /* @__PURE__ */ new Map(),
  initializedGroups: /* @__PURE__ */ new Set(),
  init(accordionContainer = null) {
    if (accordionContainer) {
      this.initAccordionGroup(accordionContainer);
      return;
    }
    document.querySelectorAll(".accordion").forEach((accordion) => {
      const style = globalThis.window.getComputedStyle(accordion);
      if (style.display !== "none" && style.visibility !== "hidden") {
        this.initAccordionGroup(accordion);
      }
    });
  },
  initAccordionGroup(accordion) {
    if (this.initializedGroups.has(accordion)) {
      this.ensureCorrectState(accordion);
      return;
    }
    const accordionItems = accordion.querySelectorAll(".accordion-item");
    if (!accordionItems.length) return;
    const groupData = {
      accordion,
      accordionItems,
      activeItem: null,
      itemElements: /* @__PURE__ */ new Map()
    };
    accordionItems.forEach((item) => {
      const elements = {
        action: item.querySelector(".accordion-action"),
        content: item.querySelector(".accordion-content"),
        plusIconSpans: item.querySelectorAll(".accordion-plus-icon span"),
        accordionArrow: item.querySelector(".accordion-arrow svg"),
        accordionArrowSpan: item.querySelector(".accordion-arrow")
      };
      groupData.itemElements.set(item, elements);
      if (item.classList.contains("active-accordion")) {
        elements.content.classList.remove("hidden");
        elements.content.style.height = "auto";
        groupData.activeItem = item;
        this.setOpenState(item, elements);
      } else {
        elements.content.classList.add("hidden");
        elements.content.style.height = "0px";
        elements.content.style.opacity = "0";
        this.setClosedState(item, elements);
      }
      if (elements.action) {
        elements.action.addEventListener("click", (e) => {
          e.preventDefault();
          if (groupData.activeItem && groupData.activeItem !== item) {
            this.closeAccordion(
              groupData.activeItem,
              groupData.itemElements.get(groupData.activeItem)
            );
          }
          if (groupData.activeItem === item) {
            this.closeAccordion(item, elements);
            groupData.activeItem = null;
          } else {
            this.openAccordion(item, elements);
            groupData.activeItem = item;
          }
        });
      }
    });
    this.accordionGroups.set(accordion, groupData);
    this.initializedGroups.add(accordion);
    this.initAnimation(accordionItems);
  },
  setOpenState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;
    item.dataset.state = "true";
    action.dataset.state = "true";
    content.dataset.state = "true";
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].style.transform = "rotate(90deg)";
      plusIconSpans[1].dataset.state = "true";
    }
    if (accordionArrow) {
      accordionArrow.style.transform = "rotate(180deg)";
      accordionArrow.dataset.state = "true";
    }
    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = "true";
    }
  },
  ensureCorrectState(accordion) {
    const groupData = this.accordionGroups.get(accordion);
    if (!groupData) return;
    if (typeof gsap !== "undefined") {
      groupData.accordionItems.forEach((item) => {
        const elements = groupData.itemElements.get(item);
        if (!elements) return;
        gsap.killTweensOf(elements.content);
        if (elements.accordionArrow) gsap.killTweensOf(elements.accordionArrow);
        if (elements.plusIconSpans.length > 0 && elements.plusIconSpans[1]) {
          gsap.killTweensOf(elements.plusIconSpans[1]);
        }
      });
    }
    groupData.activeItem = null;
    groupData.accordionItems.forEach((item) => {
      const elements = groupData.itemElements.get(item);
      if (!elements) return;
      if (item.classList.contains("active-accordion")) {
        elements.content.classList.remove("hidden");
        elements.content.style.height = "auto";
        elements.content.style.opacity = "1";
        groupData.activeItem = item;
        this.setOpenState(item, elements);
      } else {
        elements.content.classList.add("hidden");
        elements.content.style.height = "0px";
        elements.content.style.opacity = "0";
        this.setClosedState(item, elements);
        if (elements.accordionArrow) elements.accordionArrow.style.transform = "rotate(0deg)";
        if (elements.plusIconSpans.length > 0 && elements.plusIconSpans[1]) {
          elements.plusIconSpans[1].style.transform = "rotate(0deg)";
        }
      }
    });
  },
  setClosedState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;
    item.dataset.state = "false";
    action.dataset.state = "false";
    content.dataset.state = "false";
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].dataset.state = "false";
    }
    if (accordionArrow) {
      accordionArrow.dataset.state = "false";
    }
    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = "false";
    }
  },
  initAnimation(accordionItems) {
    if (!accordionItems) return;
    accordionItems.forEach((item, index) => {
      gsap.set(item, {
        opacity: 0,
        y: 50,
        filter: "blur(20px)",
        overflow: "hidden"
      });
      gsap.fromTo(
        item,
        {
          opacity: 0,
          y: 50,
          filter: "blur(20px)"
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            end: "top 50%",
            scrub: false,
            once: true
          }
        }
      );
    });
  },
  openAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;
    item.dataset.state = "true";
    action.dataset.state = "true";
    content.dataset.state = "true";
    content.classList.remove("hidden");
    content.style.height = "auto";
    const contentHeight = content.scrollHeight;
    content.style.height = "0px";
    gsap.to(content, {
      height: contentHeight,
      opacity: 1,
      duration: 0.3
    });
    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 90,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          plusIconSpans[1].dataset.state = "true";
        }
      });
    }
    if (accordionArrow) {
      accordionArrow.dataset.state = "true";
      gsap.to(accordionArrow, {
        rotation: -180,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = "true";
    }
  },
  closeAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;
    item.dataset.state = "false";
    action.dataset.state = "false";
    content.style.height = "auto";
    const contentHeight = content.scrollHeight;
    content.style.height = contentHeight + "px";
    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        content.classList.add("hidden");
        content.style.height = "0px";
        content.dataset.state = "false";
      }
    });
    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          plusIconSpans[1].dataset.state = "false";
        }
      });
    }
    if (accordionArrow) {
      accordionArrow.dataset.state = "false";
      gsap.to(accordionArrow, {
        rotation: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = "false";
    }
  }
};
if (globalThis.document !== void 0) {
  globalThis.accordionAnimation = accordionAnimation;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      accordionAnimation.init();
    });
  } else {
    accordionAnimation.init();
  }
}
const currentFilters = {
  industry: "all",
  product: "all",
  service: "all",
  solution: "all"
};
function closeDropdown(button, dropdown) {
  if (!dropdown) return;
  dropdown.classList.remove("active");
  dropdown.style.opacity = "0";
  dropdown.style.pointerEvents = "none";
  const chevronIcon = button == null ? void 0 : button.querySelector("svg");
  if (chevronIcon) {
    chevronIcon.style.transform = "rotate(0deg)";
  }
}
function openDropdown(button, dropdown) {
  if (!dropdown) return;
  dropdown.classList.add("active");
  dropdown.style.opacity = "1";
  dropdown.style.pointerEvents = "auto";
  const chevronIcon = button == null ? void 0 : button.querySelector("svg");
  if (chevronIcon) {
    chevronIcon.style.transform = "rotate(180deg)";
  }
}
function closeAllDropdownsExcept(excludeDropdown) {
  const allButtons = document.querySelectorAll(".dropdown-button");
  allButtons.forEach((button) => {
    const dropdown = button.parentElement.querySelector(".customer-dropdown-menu");
    if (dropdown && dropdown !== excludeDropdown) {
      closeDropdown(button, dropdown);
    }
  });
}
function countStoriesByFilter(filterType, filterValue) {
  const allCards = document.querySelectorAll(".story-card");
  if (filterValue === "all") {
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
function updateDropdownCounts() {
  const allDropdownItems = document.querySelectorAll("[data-value][data-filter-type]");
  allDropdownItems.forEach((item) => {
    const filterType = item.getAttribute("data-filter-type");
    const filterValue = item.getAttribute("data-value");
    if (filterType && filterValue) {
      const count = countStoriesByFilter(filterType, filterValue);
      const countSpan = item.querySelectorAll("span")[1];
      if (countSpan) {
        countSpan.textContent = count;
      }
    }
  });
}
function animateVisibleCards() {
  const visibleCards = document.querySelectorAll(
    '.story-card[style*="display: block"], .story-card:not([style*="display: none"])'
  );
  visibleCards.forEach((card, index) => {
    if (!card.hasAttribute("data-ns-animate")) return;
    const duration = card.getAttribute("data-duration") ? parseFloat(card.getAttribute("data-duration")) : 0.6;
    const offset = card.getAttribute("data-offset") ? parseFloat(card.getAttribute("data-offset")) : 60;
    const direction = card.getAttribute("data-direction") || "down";
    const animationProps = {
      opacity: 0,
      filter: "blur(16px)",
      duration,
      delay: index * 0.1
    };
    if (direction === "down") {
      animationProps.y = offset;
    }
    gsap.from(card, animationProps);
  });
}
function filterStories() {
  const allCards = document.querySelectorAll(".story-card");
  const allFiltersAreDefault = currentFilters.industry === "all" && currentFilters.product === "all" && currentFilters.service === "all" && currentFilters.solution === "all";
  if (allFiltersAreDefault) {
    allCards.forEach((card) => {
      card.style.display = "block";
    });
    animateVisibleCards();
    return;
  }
  allCards.forEach((card) => {
    var _a;
    const industryMatch = currentFilters.industry !== "all" && ((_a = card.getAttribute("data-industry")) == null ? void 0 : _a.toLowerCase()) === currentFilters.industry.toLowerCase();
    const productMatch = currentFilters.product !== "all" && card.getAttribute("data-product") === currentFilters.product;
    const serviceMatch = currentFilters.service !== "all" && card.getAttribute("data-service") === currentFilters.service;
    const solutionMatch = currentFilters.solution !== "all" && card.getAttribute("data-solution") === currentFilters.solution;
    if (industryMatch || productMatch || serviceMatch || solutionMatch) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
  animateVisibleCards();
}
const dropdownButtons = document.querySelectorAll(".dropdown-button");
dropdownButtons.forEach((button) => {
  const dropdown = button.parentElement.querySelector(".customer-dropdown-menu");
  const dropdownItems = dropdown == null ? void 0 : dropdown.querySelectorAll("[data-value]");
  if (!button || !dropdown) return;
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains("active")) {
      closeDropdown(button, dropdown);
    } else {
      closeAllDropdownsExcept(dropdown);
      openDropdown(button, dropdown);
    }
  });
  if (dropdownItems) {
    dropdownItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedText = item.querySelector("span").textContent;
        const filterType = item.getAttribute("data-filter-type");
        const filterValue = item.getAttribute("data-value");
        const buttonText = button.querySelector("span");
        if (buttonText) {
          buttonText.textContent = selectedText;
        }
        if (filterType && filterValue) {
          currentFilters.industry = "all";
          currentFilters.product = "all";
          currentFilters.service = "all";
          currentFilters.solution = "all";
          currentFilters[filterType] = filterValue;
          const allButtons = document.querySelectorAll(".dropdown-button");
          allButtons.forEach((btn) => {
            const btnName = btn.getAttribute("name");
            if (btnName !== filterType) {
              const btnText = btn.querySelector("span");
              if (btnText) {
                if (btnName === "industry") btnText.textContent = "All Industries";
                else if (btnName === "product") btnText.textContent = "All Products";
                else if (btnName === "service") btnText.textContent = "All Services";
                else if (btnName === "solution") btnText.textContent = "All Solutions";
              }
            }
          });
          const allDropdowns = document.querySelectorAll(".customer-dropdown-menu");
          allDropdowns.forEach((dd) => {
            const ddItems = dd.querySelectorAll("[data-value]");
            ddItems.forEach((ddItem) => {
              const itemFilterType = ddItem.getAttribute("data-filter-type");
              const itemValue = ddItem.getAttribute("data-value");
              ddItem.classList.remove("bg-white", "dark:bg-background-8");
              if (itemFilterType !== filterType && itemValue === "all") {
                ddItem.classList.add("bg-white", "dark:bg-background-8");
              }
            });
          });
        }
        dropdownItems.forEach((i) => {
          i.classList.remove("bg-white", "dark:bg-background-8");
        });
        item.classList.add("bg-white", "dark:bg-background-8");
        closeDropdown(button, dropdown);
        filterStories();
      });
    });
  }
});
document.addEventListener("click", (e) => {
  let clickedInsideAnyDropdown = false;
  const allButtons = document.querySelectorAll(".dropdown-button");
  allButtons.forEach((button) => {
    const dropdown = button.parentElement.querySelector(".customer-dropdown-menu");
    if (button && (button.contains(e.target) || (dropdown == null ? void 0 : dropdown.contains(e.target)))) {
      clickedInsideAnyDropdown = true;
    }
  });
  if (!clickedInsideAnyDropdown) {
    allButtons.forEach((button) => {
      const dropdown = button.parentElement.querySelector(".customer-dropdown-menu");
      if (button && dropdown) {
        closeDropdown(button, dropdown);
      }
    });
  }
});
updateDropdownCounts();
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
  },
  headerTwo() {
    const header = document.querySelector(".header-two");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 150) {
          header.style.transition = "all 0.5s ease-in-out";
          header.style.top = "20px";
          header.classList.add("header-two-scroll");
        } else {
          header.classList.remove("header-two-scroll");
          header.style.top = "50px";
        }
      });
    }
  },
  headerThree() {
    const header = document.querySelector(".header-three");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("header-three-scroll");
        } else {
          header.classList.remove("header-three-scroll");
        }
      });
    }
  },
  headerFour() {
    const header = document.querySelector(".header-four");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("header-four-scroll");
        } else {
          header.classList.remove("header-four-scroll");
        }
      });
    }
  },
  headerFive() {
    const header = document.querySelector(".header-five");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 25) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("header-five-scroll");
        } else {
          header.classList.remove("header-five-scroll");
        }
      });
    }
  },
  headerSix() {
    const header = document.querySelector(".header-six");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("header-six-scroll");
        } else {
          header.classList.remove("header-six-scroll");
        }
      });
    }
  },
  aiVoiceHeader() {
    const header = document.querySelector(".ai-voice-header");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("scroll-ai-voice-header");
        } else {
          header.classList.remove("scroll-ai-voice-header");
        }
      });
    }
  },
  financialManagementPlatformHeader() {
    const header = document.querySelector(".financial-management-platform-header");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("financial-management-platform-header-scroll");
        } else {
          header.classList.remove("financial-management-platform-header-scroll");
        }
      });
    }
  }
};
if (typeof window !== "undefined") {
  headerAnimation.headerOne();
  headerAnimation.headerTwo();
  headerAnimation.headerThree();
  headerAnimation.headerFour();
  headerAnimation.headerFive();
  headerAnimation.headerSix();
  headerAnimation.aiVoiceHeader();
  headerAnimation.financialManagementPlatformHeader();
}
document.addEventListener("DOMContentLoaded", function() {
  if (typeof InfiniteMarquee === "undefined") {
    return;
  }
  const animation = {
    infiniteLeft() {
      if (document.querySelector(".logos-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "left",
          gap: "32px",
          duplicateCount: 1,
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
    infiniteRight() {
      if (document.querySelector(".logos-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-right-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "right",
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
    infiniteIconRight() {
      if (document.querySelector(".icon-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".icon-right-marquee-container",
          speed: 2e3,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "right",
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
            beforeInit: () => {
            },
            afterInit: () => {
            }
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
            beforeInit: () => {
            },
            afterInit: () => {
            }
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
    },
    initTopNavMarquee() {
      if (document.querySelector(".top-nav-marquee")) {
        new InfiniteMarquee({
          element: ".top-nav-marquee",
          speed: 7e4,
          smoothEdges: true,
          pauseOnHover: true,
          direction: "left",
          gap: "16px",
          duplicateCount: 2,
          mobileSettings: {
            direction: "left",
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
  animation.infiniteLeft();
  animation.infiniteRight();
  animation.initHover();
  animation.initHoverRight();
  animation.infiniteTop();
  animation.infiniteBottom();
  animation.infiniteIconRight();
  animation.initTopNavMarquee();
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
let currentIndex = 0;
let initialized = false;
function init() {
  if (initialized) return;
  const tabBarBtns = document.querySelectorAll("[data-tab-button]");
  const mobileTabBtns = document.querySelectorAll("[data-mobile-tab-button]");
  const tabContent = document.querySelectorAll("[data-tab-content]");
  const activeTabBar = document.querySelector("[data-active-tab-bar]");
  if (!tabBarBtns.length && !mobileTabBtns.length || !tabContent.length) {
    return;
  }
  if (tabBarBtns.length) {
    tabBarBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => switchTab(index));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          switchTab(index);
        }
      });
    });
    switchTab(0);
  }
  if (mobileTabBtns.length) {
    mobileTabBtns.forEach((btn, index) => {
      btn.addEventListener("click", () => switchMobileTab(index));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          switchMobileTab(index);
        }
      });
    });
    switchMobileTab(0);
  }
  if (activeTabBar && tabBarBtns.length) {
    window.addEventListener("resize", () => {
      if (tabBarBtns[currentIndex]) {
        updateActiveTabBar(tabBarBtns[currentIndex], activeTabBar);
      }
    });
  }
  initialized = true;
}
function switchTab(index) {
  const tabBarBtns = document.querySelectorAll("[data-tab-button]");
  const tabContent = document.querySelectorAll("[data-tab-content]");
  const activeTabBar = document.querySelector("[data-active-tab-bar]");
  if (index < 0 || index >= tabBarBtns.length) return;
  currentIndex = index;
  tabBarBtns.forEach((btn, i) => {
    btn.dataset.state = i === index ? "selected" : "";
    btn.setAttribute("aria-selected", i === index);
  });
  if (activeTabBar) {
    updateActiveTabBar(tabBarBtns[index], activeTabBar);
  }
  switchContent(index, tabContent);
}
function switchMobileTab(index) {
  const mobileTabBtns = document.querySelectorAll("[data-mobile-tab-button]");
  const tabContent = document.querySelectorAll("[data-tab-content]");
  if (index < 0 || index >= mobileTabBtns.length) return;
  currentIndex = index;
  mobileTabBtns.forEach((btn, i) => {
    if (i === index) {
      btn.dataset.mobileActive = "true";
    } else {
      delete btn.dataset.mobileActive;
    }
    btn.setAttribute("aria-selected", i === index);
  });
  switchContent(index, tabContent);
}
function updateActiveTabBar(activeButton, activeTabBar) {
  if (!activeTabBar || !activeButton) return;
  const tabBar = activeTabBar.closest("[data-tab-bar]");
  if (!tabBar) return;
  const left = activeButton.getBoundingClientRect().left - tabBar.getBoundingClientRect().left;
  const width = activeButton.offsetWidth;
  activeTabBar.style.left = `${left}px`;
  activeTabBar.style.width = `${width}px`;
}
function switchContent(targetIndex, tabContent) {
  tabContent.forEach((content, index) => {
    if (targetIndex === index) {
      content.style.display = "block";
      content.setAttribute("aria-hidden", "false");
      if (typeof gsap !== "undefined") {
        gsap.fromTo(
          content,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.05, ease: "power2.out" }
        );
      }
      requestAnimationFrame(() => {
        const accordion = content.querySelector(".accordion");
        if (accordion && globalThis.accordionAnimation) {
          globalThis.accordionAnimation.initAccordionGroup(accordion);
        }
      });
    } else {
      content.style.display = "none";
      content.setAttribute("aria-hidden", "true");
    }
  });
}
if (globalThis.window !== void 0) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
let tabFilterInitialized = false;
const tabFilter = {
  init() {
    if (tabFilterInitialized) return;
    const tabBarBtns = document.querySelectorAll("[data-tab-button]");
    const activeTabBar = document.querySelector("[data-active-tab-bar]");
    const mobileTabBtns = document.querySelectorAll("[data-mobile-tab-button]");
    const articles = document.querySelectorAll("[data-filter-item]");
    if (!tabBarBtns.length && !mobileTabBtns.length || !articles.length) {
      return;
    }
    let currentIndex2 = 0;
    const getButtonCategory = (btn) => {
      const text = btn.textContent.trim().toLowerCase();
      return text === "ai software" ? "ai software" : text;
    };
    const updateTabBar = (button) => {
      if (!activeTabBar || !button) return;
      const tabBar = activeTabBar.closest("[data-tab-bar]");
      if (!tabBar) return;
      const left = button.getBoundingClientRect().left - tabBar.getBoundingClientRect().left;
      activeTabBar.style.left = `${left}px`;
      activeTabBar.style.width = `${button.offsetWidth}px`;
    };
    const filterArticles = (category) => {
      const filtered = [];
      const hidden = [];
      articles.forEach((container) => {
        var _a;
        const containerCategory = ((_a = container.dataset.filterCategory) == null ? void 0 : _a.toLowerCase()) || "";
        const show = category === "all" || containerCategory === category;
        if (show) {
          filtered.push(container);
        } else {
          hidden.push(container);
        }
      });
      return { filtered, hidden };
    };
    const animateFilter = async (filtered, hidden) => {
      const allContainers = [...filtered, ...hidden];
      const canAnimate = typeof gsap !== "undefined" && gsap && typeof gsap.to === "function";
      if (!canAnimate) {
        hidden.forEach((container) => {
          container.style.display = "none";
          container.setAttribute("aria-hidden", "true");
        });
        filtered.forEach((container) => {
          container.style.display = "block";
          container.setAttribute("aria-hidden", "false");
          container.style.opacity = "1";
          container.style.transform = "none";
          container.style.filter = "none";
        });
        return;
      }
      const fadeOutTweens = allContainers.map(
        (container) => gsap.to(container, {
          opacity: 0,
          scale: 0.95,
          filter: "blur(4px)",
          duration: 0.3,
          ease: "power2.inOut"
        })
      );
      await Promise.all(fadeOutTweens.map((tween) => tween.then()));
      hidden.forEach((container) => {
        container.style.display = "none";
        container.setAttribute("aria-hidden", "true");
      });
      filtered.forEach((container) => {
        container.style.display = "block";
        container.setAttribute("aria-hidden", "false");
        container.style.opacity = "0";
        container.style.transform = "scale(0.95)";
        container.style.filter = "blur(4px)";
      });
      const fadeInTweens = filtered.map(
        (container, index) => gsap.to(container, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          delay: index * 0.1,
          ease: "power2.out"
        })
      );
      await Promise.all(fadeInTweens.map((tween) => tween.then()));
    };
    const switchFilter = async (index, buttons) => {
      if (index < 0 || index >= buttons.length) return;
      currentIndex2 = index;
      const category = getButtonCategory(buttons[index]);
      if ("tabButton" in buttons[0].dataset) {
        buttons.forEach((btn, i) => {
          btn.dataset.state = i === index ? "selected" : "";
        });
        updateTabBar(buttons[index]);
      }
      if ("mobileTabButton" in buttons[0].dataset) {
        buttons.forEach((btn, i) => {
          if (i === index) {
            btn.dataset.mobileActive = "true";
          } else {
            delete btn.dataset.mobileActive;
          }
        });
      }
      const { filtered, hidden } = filterArticles(category);
      await animateFilter(filtered, hidden);
      const filterEvent = new CustomEvent("blogFiltered", {
        detail: {
          category,
          filteredCount: filtered.length,
          totalCount: articles.length
        }
      });
      document.dispatchEvent(filterEvent);
    };
    if (tabBarBtns.length) {
      tabBarBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => switchFilter(index, tabBarBtns));
      });
      switchFilter(0, tabBarBtns);
      setTimeout(() => updateTabBar(tabBarBtns[0]), 0);
    }
    if (mobileTabBtns.length) {
      mobileTabBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => switchFilter(index, mobileTabBtns));
      });
      switchFilter(0, mobileTabBtns);
    }
    if (activeTabBar && tabBarBtns.length) {
      globalThis.window.addEventListener("resize", () => {
        if (tabBarBtns[currentIndex2]) {
          updateTabBar(tabBarBtns[currentIndex2]);
        }
      });
    }
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
    if (!document.querySelector("#tab-filter-styles")) {
      const style = document.createElement("style");
      style.id = "tab-filter-styles";
      style.textContent = filterCSS;
      document.head.appendChild(style);
    }
    tabFilterInitialized = true;
  }
};
if (globalThis.window) {
  const init2 = () => {
    if ((document.querySelector("[data-tab-button]") || document.querySelector("[data-mobile-tab-button]")) && !tabFilterInitialized) {
      tabFilter.init();
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init2);
  } else {
    init2();
  }
}
function dividerExpand(divider) {
  gsap.to(divider, {
    scrollTrigger: {
      trigger: divider,
      start: "top 100%",
      end: "top 50%",
      scrub: false,
      toggleActions: "play none none none"
    },
    width: "100%",
    duration: 1,
    delay: 0.7,
    ease: "power2.out"
  });
}
const commonAnimation = {
  init() {
    const divider = document.querySelector(".divider");
    const footerDivider = document.querySelector(".footer-divider");
    const scrollExpand = document.querySelector(".scroll-expand");
    const heroLines = document.querySelectorAll("[data-hero-line]");
    const monthCards = document.querySelectorAll(".month-card");
    const monthLinks = document.querySelectorAll(".month-link");
    if (divider) {
      dividerExpand(divider);
    }
    if (footerDivider) {
      dividerExpand(footerDivider);
    }
    if (scrollExpand) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        gsap.set(scrollExpand, { minWidth: "auto" });
      } else {
        gsap.set(scrollExpand, { minWidth: "500px" });
        ScrollTrigger.create({
          trigger: scrollExpand,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => {
            gsap.to(scrollExpand, {
              minWidth: "950px",
              duration: 0.5,
              ease: "power2.out"
            });
          },
          onEnterBack: () => {
            gsap.to(scrollExpand, {
              minWidth: "950px",
              duration: 0.5,
              ease: "power2.out"
            });
          },
          onLeaveBack: () => {
            gsap.to(scrollExpand, {
              minWidth: "500px",
              duration: 0.5,
              ease: "power2.out"
            });
          }
        });
      }
    }
    if (heroLines.length > 0) {
      heroLines.forEach((line) => {
        gsap.to(line, {
          height: "100%",
          duration: 0.8,
          delay: 0.7,
          ease: "power2.out"
        });
      });
    }
    if (monthCards.length > 0 && monthLinks.length > 0) {
      let updateActiveLink2 = function() {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          let activeCard = null;
          let minDistance = Infinity;
          const viewportTop = window.scrollY || window.pageYOffset;
          const viewportBottom = viewportTop + window.innerHeight;
          const viewportCenter = viewportTop + window.innerHeight * 0.3;
          monthCards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cardTop = rect.top + viewportTop;
            const cardBottom = cardTop + rect.height;
            const cardCenter = cardTop + rect.height / 2;
            if (cardTop <= viewportBottom && cardBottom >= viewportTop) {
              const distance = Math.abs(cardCenter - viewportCenter);
              if (distance < minDistance) {
                minDistance = distance;
                activeCard = card;
              }
            }
          });
          const newActiveCardId = activeCard ? activeCard.getAttribute("data-month") : null;
          if (newActiveCardId !== activeCardId) {
            activeCardId = newActiveCardId;
            monthLinks.forEach((link) => {
              const monthId = link.getAttribute("data-month-link");
              if (monthId === activeCardId) {
                link.classList.add("bg-background-12", "dark:!bg-background-6");
              } else {
                link.classList.remove("bg-background-12", "dark:!bg-background-6");
              }
            });
          }
          rafId = null;
        });
      };
      var updateActiveLink = updateActiveLink2;
      let activeCardId = null;
      let rafId = null;
      monthLinks.forEach((link) => {
        link.addEventListener("click", function(e) {
          e.preventDefault();
          const targetId = this.getAttribute("data-month-link");
          const targetCard = document.getElementById(targetId);
          if (targetCard) {
            const offsetTop = targetCard.offsetTop - 200;
            window.scrollTo({
              top: offsetTop,
              behavior: "smooth"
            });
          }
        });
      });
      if ("IntersectionObserver" in window) {
        const observerOptions = {
          root: null,
          rootMargin: "-20% 0px -60% 0px",
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1]
        };
        const observer = new IntersectionObserver((entries) => {
          updateActiveLink2();
        }, observerOptions);
        monthCards.forEach((card) => {
          observer.observe(card);
        });
      } else {
        let scrollTimeout;
        window.addEventListener(
          "scroll",
          function() {
            if (scrollTimeout) {
              clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(updateActiveLink2, 10);
          },
          { passive: true }
        );
      }
      updateActiveLink2();
    }
  }
};
if (globalThis.window !== void 0) {
  commonAnimation.init();
}
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
    this.toggleButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menuId = button.getAttribute("data-menu");
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
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button == null ? void 0 : button.querySelector(".menu-arrow");
    if (!submenu || !button) {
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
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button == null ? void 0 : button.querySelector(".menu-arrow");
    if (submenu && button) {
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
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button == null ? void 0 : button.querySelector(".menu-arrow");
    if (submenu && button) {
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
const parallaxEffect = {
  init() {
    const scene = document.getElementById("scene");
    if (scene != null) {
      initializeParallaxEffect();
    }
    function initializeParallaxEffect() {
      if (!scene) return;
      freezeParallaxElements(scene);
      if (document.readyState === "complete") {
        startParallaxAfterLoad();
      } else {
        window.addEventListener("load", startParallaxAfterLoad);
      }
    }
    function freezeParallaxElements(scene2) {
      const parallaxElements = scene2.querySelectorAll(".parallax-effect");
      parallaxElements.forEach((element) => {
        element.style.willChange = "transform";
        element.style.transform = "translate3d(0px, 0px, 0)";
        element.style.transition = "none";
        element.classList.add("parallax-frozen");
      });
    }
    function startParallaxAfterLoad() {
      waitForImagesToLoad(scene, () => {
        setTimeout(() => {
          unfreezeAndStartParallax(scene);
        }, 300);
      });
    }
    function unfreezeAndStartParallax(scene2) {
      const parallaxElements = scene2.querySelectorAll(".parallax-effect");
      parallaxElements.forEach((element) => {
        element.classList.remove("parallax-frozen");
        element.style.transition = "transform 0.3s ease-out";
      });
      setupParallaxAnimation(scene2);
    }
    function waitForImagesToLoad(scene2, onComplete) {
      scene2.querySelectorAll(".parallax-effect");
      const parallaxImages = scene2.querySelectorAll(".parallax-effect img");
      if (parallaxImages.length === 0) {
        onComplete();
        return;
      }
      let loadedCount = 0;
      const totalImages = parallaxImages.length;
      const checkCompletion = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          onComplete();
        }
      };
      parallaxImages.forEach((img) => {
        if (img.complete) {
          checkCompletion();
        } else {
          img.addEventListener("load", checkCompletion);
          img.addEventListener("error", checkCompletion);
        }
      });
    }
    function setupParallaxAnimation(scene2) {
      const parallaxElements = scene2.querySelectorAll(".parallax-effect");
      const elementConfigs = createElementConfigs(parallaxElements);
      let isAnimating = false;
      let mouseX = scene2.offsetWidth / 2;
      let mouseY = scene2.offsetHeight / 2;
      initializeElements(elementConfigs);
      updateParallaxPositions(elementConfigs, mouseX, mouseY, scene2);
      const throttledMouseHandler = createThrottledHandler((event) => {
        mouseX = event.pageX;
        mouseY = event.pageY;
        if (!isAnimating) {
          requestAnimationFrame(() => {
            updateParallaxPositions(elementConfigs, mouseX, mouseY, scene2);
            isAnimating = false;
          });
          isAnimating = true;
        }
      });
      scene2.addEventListener("mousemove", throttledMouseHandler, {
        passive: true
      });
      setupPerformanceOptimization(scene2, elementConfigs);
    }
    function createElementConfigs(elements) {
      return Array.from(elements).map((element) => ({
        element,
        depth: parseFloat(element.getAttribute("data-parallax-value")) || 1,
        directionX: parseFloat(element.getAttribute("data-data-parallax-x")) || 1,
        directionY: parseFloat(element.getAttribute("data-data-parallax-y")) || 1,
        movementScale: 25
        // Reduced from 30 for smoother movement
      }));
    }
    function initializeElements(elementConfigs) {
      elementConfigs.forEach(({ element }) => {
        element.style.willChange = "transform";
        element.style.transform = "translateZ(0)";
      });
    }
    function updateParallaxPositions(elementConfigs, mouseX, mouseY, scene2) {
      const centerX = scene2.offsetWidth / 2;
      const centerY = scene2.offsetHeight / 2;
      const relativeX = (mouseX - centerX) / centerX;
      const relativeY = (mouseY - centerY) / centerY;
      elementConfigs.forEach(({ element, depth, directionX, directionY, movementScale }) => {
        if (!element.classList.contains("parallax-frozen")) {
          const moveX = relativeX * depth * directionX * movementScale;
          const moveY = relativeY * depth * directionY * movementScale;
          element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }
      });
    }
    function createThrottledHandler(handler) {
      let timeoutId = null;
      return (event) => {
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
          handler(event);
          timeoutId = null;
        }, 16);
      };
    }
    function setupPerformanceOptimization(scene2, elementConfigs) {
      let resetTimeout;
      scene2.addEventListener("mouseleave", () => {
        clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
          elementConfigs.forEach(({ element }) => {
            element.style.willChange = "auto";
          });
        }, 1e3);
      });
    }
  }
};
if (typeof window !== "undefined") {
  parallaxEffect.init();
}
const priceSwitcher = {
  // Store DOM elements
  elements: null,
  // Initialize the price switcher
  init() {
    try {
      this.getElements();
      this.addEventListeners();
      this.updatePrices();
    } catch (error) {
      console.error("Price switcher initialization failed:", error);
    }
  },
  // Get all the DOM elements we need
  getElements() {
    this.elements = {
      toggle: document.getElementById("priceCheck"),
      monthlyPrices: document.getElementsByClassName("price-month"),
      yearlyPrices: document.getElementsByClassName("price-year")
    };
  },
  // Update which prices are shown based on toggle state
  updatePrices() {
    const { toggle, monthlyPrices, yearlyPrices } = this.elements;
    if (!toggle) return;
    for (let i = 0; i < monthlyPrices.length; i++) {
      const monthly = monthlyPrices[i];
      const yearly = yearlyPrices[i];
      if (toggle.checked) {
        monthly.style.display = "none";
        yearly.style.display = "block";
      } else {
        monthly.style.display = "block";
        yearly.style.display = "none";
      }
    }
  },
  // Add click event to the toggle
  addEventListeners() {
    const { toggle } = this.elements;
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      this.updatePrices();
    });
  }
};
if (typeof window !== "undefined") {
  priceSwitcher.init();
}
const initRevealElements = () => {
  const elements = document.querySelectorAll("[data-ns-animate]");
  const Springer = window.Springer.default;
  elements.forEach((elem) => {
    const duration = elem.getAttribute("data-duration") ? parseFloat(elem.getAttribute("data-duration")) : 0.6;
    const delay = elem.getAttribute("data-delay") ? parseFloat(elem.getAttribute("data-delay")) : 0;
    const offset = elem.getAttribute("data-offset") ? parseFloat(elem.getAttribute("data-offset")) : 60;
    const instant = elem.hasAttribute("data-instant") && elem.getAttribute("data-instant") !== "false";
    const start = elem.getAttribute("data-start") || "top 90%";
    const end = elem.getAttribute("data-end") || "top 50%";
    const direction = elem.getAttribute("data-direction") || "down";
    const useSpring = elem.hasAttribute("data-spring");
    const spring = useSpring ? Springer(0.2, 0.8) : null;
    const rotation = elem.getAttribute("data-rotation") ? parseFloat(elem.getAttribute("data-rotation")) : 0;
    const animationType = elem.getAttribute("data-animation-type") || "from";
    elem.style.opacity = "1";
    elem.style.filter = "blur(0)";
    let animationProps;
    if (animationType === "to") {
      animationProps = {
        opacity: 1,
        filter: "blur(0)",
        duration,
        delay,
        ease: useSpring ? spring : "power2.out"
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
};
document.addEventListener("DOMContentLoaded", () => {
  initRevealElements();
});
let lenis;
const smoothScrolling = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768 || "ontouchstart" in window;
  if (!isMobile) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true
    });
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((time) => {
      lenis.raf(time * 1e3);
    });
    gsap.ticker.lagSmoothing(0);
  }
  window.lenis = lenis;
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
const forceThemeSwitcher = {
  init() {
    const html = document.documentElement;
    const forced = html.dataset.forceTheme;
    if (forced) {
      html.classList.remove("dark", "light");
      html.classList.add(forced);
      return;
    }
    const stored = localStorage.getItem("color-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    html.classList.remove("dark", "light");
    html.classList.add(theme);
  }
};
if (typeof window !== "undefined") {
  forceThemeSwitcher.init();
}
const leaflet = {
  init() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      return;
    }
    const leafletMap = L.map("map").setView([39.8283, -98.5795], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 3
    }).addTo(leafletMap);
    window.addEventListener("resize", () => {
      leafletMap.invalidateSize();
    });
    leafletMap.zoomControl.setPosition("bottomright");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  leaflet.init();
});
const themeSwitcher = {
  elements: null,
  animationConfig: { duration: 0.6, delay: 0.2, ease: "power2.out" },
  get isForcedPage() {
    return !!document.documentElement.dataset.forceTheme;
  },
  get forcedTheme() {
    return document.documentElement.dataset.forceTheme || null;
  },
  init() {
    try {
      this.cacheElements();
      this.setInitialTheme();
      this.bindEvents();
    } catch (error) {
      console.error("Theme switcher initialization failed:", error);
    }
  },
  cacheElements() {
    this.elements = {
      darkIcon: document.getElementById("dark-theme-icon"),
      lightIcon: document.getElementById("light-theme-icon"),
      toggleBtn: document.getElementById("theme-toggle"),
      html: document.documentElement
    };
  },
  setInitialTheme() {
    if (this.isForcedPage) {
      this.setTheme(this.forcedTheme, { persist: false });
      if (this.elements.toggleBtn) this.elements.toggleBtn.style.display = "none";
      return;
    }
    const storedTheme = localStorage.getItem("color-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme || (prefersDark ? "dark" : "light");
    this.setTheme(theme, { persist: false });
  },
  bindEvents() {
    const { toggleBtn } = this.elements;
    if (!toggleBtn || this.isForcedPage) return;
    toggleBtn.addEventListener("click", () => {
      const isDark = this.elements.html.classList.contains("dark");
      this.setTheme(isDark ? "light" : "dark", { persist: true });
    });
  },
  setTheme(theme, { persist = true } = {}) {
    if (!["dark", "light"].includes(theme)) return;
    const { html } = this.elements;
    html.classList.remove("dark", "light");
    html.classList.add(theme);
    if (persist && !this.isForcedPage) {
      localStorage.setItem("color-theme", theme);
    }
    this.updateIcons(theme === "dark");
  },
  updateIcons(isDark) {
    const { darkIcon, lightIcon } = this.elements;
    if (!darkIcon || !lightIcon) return;
    const showIcon = isDark ? darkIcon : lightIcon;
    const hideIcon = isDark ? lightIcon : darkIcon;
    hideIcon.classList.add("hidden");
    showIcon.classList.remove("hidden");
    gsap.fromTo(
      showIcon,
      { x: 100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: this.animationConfig.duration,
        delay: this.animationConfig.delay,
        ease: this.animationConfig.ease
      }
    );
  }
};
if (typeof window !== "undefined") {
  themeSwitcher.init();
}
