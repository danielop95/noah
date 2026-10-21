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
const cardShuffle = {
  init() {
    gsap.registerPlugin(Flip);
    const categoriesBtn = gsap.utils.toArray("[data-flip-id]");
    const flipCardItems = gsap.utils.toArray("[data-flip-item]");
    const cardContainer = document.querySelector("[data-cards-container]");
    function setActiveButton(activeBtn) {
      categoriesBtn.forEach((btn) => btn.removeAttribute("data-state"));
      if (activeBtn) activeBtn.setAttribute("data-state", "selected");
    }
    function updateFilters() {
      var _a;
      const clickedBtn = this;
      const categoryId = ((_a = clickedBtn == null ? void 0 : clickedBtn.dataset) == null ? void 0 : _a.flipId) || "all";
      const currentContainerHeight = cardContainer ? cardContainer.offsetHeight : 0;
      const state = Flip.getState(flipCardItems);
      if (cardContainer) {
        cardContainer.style.height = `${currentContainerHeight}px`;
      }
      flipCardItems.forEach((item) => {
        const itemCategory = item.dataset.flipCategory;
        const match = categoryId === "all" || itemCategory === categoryId;
        item.style.display = match ? "block" : "none";
      });
      Flip.from(state, {
        duration: 0.8,
        scale: true,
        absolute: true,
        ease: "power1.inOut",
        onEnter: (elements) => gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.1 }
        ),
        onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.98, duration: 0.3 }),
        onComplete: () => {
          if (cardContainer) cardContainer.style.height = "";
          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }
        }
      });
      setActiveButton(clickedBtn);
    }
    categoriesBtn.forEach((btn) => btn.addEventListener("click", updateFilters));
    const allBtn = document.querySelector('[data-flip-id="all"]');
    if (allBtn) setActiveButton(allBtn);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  cardShuffle.init();
});
function dividerExpand(divider) {
  gsap.to(divider, {
    scrollTrigger: {
      trigger: divider,
      start: "top 100%",
      end: "top 50%",
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
    const footerDivider = document.querySelector(".footer-divider");
    gsap.registerPlugin(ScrollTrigger);
    const imagesLoadingReveal = document.querySelectorAll(".image-loading-reveal img");
    const blogCards = document.querySelectorAll(".blog-card");
    const partnerShipCards = document.querySelectorAll(".partner-ship-card");
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
            duration: 0.8,
            scrollTrigger: {
              trigger: triggerEl,
              start: "top 96%",
              end: "bottom 58%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }
    if (blogCards.length > 0) {
      blogCards[0].classList.add("active-card");
      blogCards.forEach((card) => {
        card.addEventListener("mouseenter", function() {
          blogCards.forEach((c) => c.classList.remove("active-card"));
          this.classList.add("active-card");
        });
      });
    }
    if (partnerShipCards.length > 0) {
      partnerShipCards.forEach((card) => {
        card.addEventListener("mouseenter", function() {
          partnerShipCards.forEach((c) => c.classList.remove("active-partner-ship-card"));
          this.classList.add("active-partner-ship-card");
        });
      });
    }
    if (footerDivider) {
      dividerExpand(footerDivider);
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
const CtaContentImageAnimation = {
  init() {
    const contentImage = document.querySelector(".cta-content-image");
    const contentImage2 = document.querySelector(".cta-content-image-2");
    if (!contentImage || !contentImage2) return;
    gsap.from(contentImage, {
      duration: 1.7,
      delay: 0.3,
      scaleX: 0,
      width: 0,
      transformOrigin: "left center",
      autoAlpha: 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: contentImage,
        start: "top 85%",
        end: "bottom 20%",
        once: true
      }
    });
    gsap.from(contentImage2, {
      y: 120,
      duration: 1.3,
      delay: 0.2,
      scale: 0,
      opacity: 0,
      rotation: 40,
      transformOrigin: "center center",
      ease: "power2.out",
      scrollTrigger: {
        trigger: contentImage,
        start: "top 85%",
        end: "bottom 20%",
        once: true
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  CtaContentImageAnimation.init();
});
const footerTextShuffle = {
  init() {
    const elements = document.querySelectorAll(".footer-title");
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
document.addEventListener("DOMContentLoaded", function() {
  if (typeof gsap === "undefined") {
    console.error("GSAP is not loaded.");
    return;
  }
  gsap.registerPlugin(MotionPathPlugin);
  const gradientAnimation = {
    init() {
      const paths = [
        "curve-path-1",
        "curve-path-2",
        "curve-path-3",
        "curve-path-4",
        "curve-path-5",
        "curve-path-6",
        "curve-path-7",
        "curve-path-8"
      ];
      paths.forEach((pathId, index) => {
        const path = document.getElementById(pathId);
        function interpolateColor(color1, color2, factor) {
          const r1 = parseInt(color1.slice(1, 3), 16);
          const g1 = parseInt(color1.slice(3, 5), 16);
          const b1 = parseInt(color1.slice(5, 7), 16);
          const r2 = parseInt(color2.slice(1, 3), 16);
          const g2 = parseInt(color2.slice(3, 5), 16);
          const b2 = parseInt(color2.slice(5, 7), 16);
          const r = Math.round(r1 + (r2 - r1) * factor);
          const g = Math.round(g1 + (g2 - g1) * factor);
          const b = Math.round(b1 + (b2 - b1) * factor);
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        }
        if (index === 0) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-1-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 1) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-2-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 2) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-3-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 3) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-4-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 4) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-5-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 5) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-6-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 6) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-7-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        } else if (index === 7) {
          const duration = gsap.utils.random(3, 6);
          const delay = gsap.utils.random(0, 2);
          for (let i = 1; i <= 60; i++) {
            const rect = document.getElementById(`rect-8-${i}`);
            if (path && rect) {
              const factor = (i - 1) / 59;
              const gradientColor = interpolateColor("#FFFFFF", "#1E212A", factor);
              rect.setAttribute("fill", gradientColor);
              gsap.to(rect, {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false
                },
                duration,
                // Same duration for all
                ease: "power1.inOut",
                repeat: -1,
                delay: delay + i * 2e-3
                // Slight stagger to create continuous line
              });
            }
          }
        }
      });
    },
    // Method to pause all animations
    pause() {
      gsap.globalTimeline.pause();
    },
    // Method to resume all animations
    resume() {
      gsap.globalTimeline.resume();
    },
    // Method to restart all animations
    restart() {
      gsap.globalTimeline.restart();
    }
  };
  gradientAnimation.init();
  window.gradientAnimation = gradientAnimation;
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
const imageRevealOnHover = {
  init() {
    if (typeof gsap === "undefined") return;
    const containers = document.querySelectorAll("[data-image-reveal]");
    if (containers.length === 0) return;
    containers.forEach((container) => {
      const cursor = container.querySelector("[data-image-reveal-cursor]");
      const mediaContainer = container.querySelector("[data-image-reveal-container]");
      const listEl = container.querySelector("[data-image-reveal-list]");
      const items = container.querySelectorAll("[data-image-reveal-item]");
      const mediasEl = container.querySelector(".medias");
      const mediaImgs = mediasEl ? mediasEl.querySelectorAll("img") : container.querySelectorAll("[data-image-reveal-media]");
      const mediasUrl = [];
      mediaImgs.forEach((img) => mediasUrl.push(img.getAttribute("src")));
      const useSlideUpReveal = mediaContainer && mediasUrl.length > 0 && listEl;
      if (!cursor || items.length === 0) return;
      if (useSlideUpReveal && (!mediaContainer || mediasUrl.length === 0)) return;
      if (cursor.parentElement !== document.body) {
        document.body.appendChild(cursor);
      }
      const followDuration = Number.parseFloat(container.dataset.followDuration) || 0.9;
      const showDuration = Number.parseFloat(container.dataset.showDuration) || 0.65;
      const ease = container.dataset.ease || "expo";
      const revealDuration = Number.parseFloat(container.dataset.revealDuration) || 0.8;
      const maxRevealChildren = 20;
      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
        x: 0,
        y: 0
      });
      const setX = gsap.quickTo(cursor, "x", { duration: followDuration, ease });
      const setY = gsap.quickTo(cursor, "y", { duration: followDuration, ease });
      const onMove = (e) => {
        setX(e.clientX);
        setY(e.clientY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      const tl = gsap.timeline({ paused: true });
      tl.to(cursor, {
        scale: 1,
        opacity: 1,
        duration: showDuration,
        ease: `${ease}.inOut`
      });
      if (useSlideUpReveal) {
        listEl.addEventListener("mouseenter", () => tl.play());
        listEl.addEventListener("mouseleave", () => {
          tl.reverse();
          while (mediaContainer.firstChild) mediaContainer.firstChild.remove();
        });
        const createMedia = (index) => {
          const i = Number(index);
          if (Number.isNaN(i) || i < 0 || i >= mediasUrl.length) return;
          const div = document.createElement("div");
          div.style.cssText = "position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:inherit;";
          const img = document.createElement("img");
          img.src = mediasUrl[i];
          img.alt = "";
          img.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;";
          div.appendChild(img);
          mediaContainer.appendChild(div);
          gsap.set(div, { yPercent: -100 });
          gsap.set(img, { yPercent: 90 });
          gsap.to([div, img], {
            yPercent: 0,
            duration: revealDuration,
            ease: "expo.inOut"
          });
          if (mediaContainer.children.length > maxRevealChildren) {
            mediaContainer.children[0].remove();
          }
        };
        items.forEach((item) => {
          const index = item.dataset.index ?? item.getAttribute("data-index") ?? "0";
          item.addEventListener("mouseenter", () => createMedia(index));
        });
        window.addEventListener("blur", () => {
          tl.reverse();
          while (mediaContainer.firstChild) mediaContainer.firstChild.remove();
        });
      } else {
        const medias = container.querySelectorAll("[data-image-reveal-media]");
        const deactivateAll = () => medias.forEach((m) => m.setAttribute("data-active", "false"));
        const activateMedia = (index) => {
          deactivateAll();
          const i = Number(index);
          if (!Number.isNaN(i) && medias[i]) medias[i].setAttribute("data-active", "true");
        };
        items.forEach((item) => {
          const index = item.dataset.index ?? item.getAttribute("data-index") ?? "0";
          item.addEventListener("mouseenter", () => {
            activateMedia(index);
            tl.play();
          });
          item.addEventListener("mouseleave", () => {
            tl.reverse();
            deactivateAll();
          });
        });
        window.addEventListener("blur", () => {
          tl.reverse();
          deactivateAll();
        });
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  imageRevealOnHover.init();
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
const stairsCardsAnimation = {
  init() {
    const containers = document.querySelectorAll("[data-stairs-wrapper]");
    if (containers.length === 0) return;
    containers.forEach((container) => {
      const cardSelector = container.getAttribute("data-stairs-wrapper");
      const cards = container.querySelectorAll(cardSelector);
      const baseOffset = container.getAttribute("data-base-offset") ? parseFloat(container.getAttribute("data-base-offset")) : 150;
      const stepOffset = container.getAttribute("data-step-offset") ? parseFloat(container.getAttribute("data-step-offset")) : 22;
      const duration = container.getAttribute("data-duration") ? parseFloat(container.getAttribute("data-duration")) : 1;
      const stagger = container.getAttribute("data-stagger") ? parseFloat(container.getAttribute("data-stagger")) : 0.1;
      const start = container.getAttribute("data-start") || "top 80%";
      const end = container.getAttribute("data-end") || "top 10%";
      const useScrub = container.hasAttribute("data-scrub") && container.getAttribute("data-scrub") !== "false";
      const once = container.hasAttribute("data-once") && container.getAttribute("data-once") !== "false";
      cards.forEach((card, index) => {
        const offsetY = baseOffset + index * stepOffset;
        gsap.set(card, {
          y: offsetY
        });
      });
      const animationProps = {
        y: 0,
        duration,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: container,
          start,
          end,
          once
        }
      };
      if (useScrub) {
        animationProps.scrollTrigger.scrub = true;
      }
      gsap.to(cards, animationProps);
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  stairsCardsAnimation.init();
});
function initAccordions({ selector = ".accordion", allowMultiple = false, keyboard = true } = {}) {
  const accordions = document.querySelectorAll(selector);
  accordions.forEach((accordion, accIndex) => {
    const items = Array.from(accordion.querySelectorAll(".accordion-item"));
    if (!accordion.getAttribute("aria-label")) {
      accordion.setAttribute("aria-label", "Accordion");
    }
    function updateState(item) {
      const state = item.getAttribute("data-state") || "closed";
      const action = item.querySelector(".accordion-action");
      const icon = item.querySelector(".accordion-icon");
      if (action) action.setAttribute("data-state", state);
      if (icon) icon.setAttribute("data-state", state);
    }
    items.forEach((item, i) => {
      const accordionAction = item.querySelector(".accordion-action");
      const accordionContent = item.querySelector(".accordion-content");
      if (!accordionAction || !accordionContent) return;
      const qId = `acc-q-${accIndex}-${i}`;
      const aId = `acc-a-${accIndex}-${i}`;
      accordionAction.id || (accordionAction.id = qId);
      accordionContent.id || (accordionContent.id = aId);
      accordionAction.setAttribute("aria-controls", accordionContent.id);
      accordionContent.setAttribute("role", "region");
      accordionContent.setAttribute("aria-labelledby", accordionAction.id);
      accordionContent.style.overflow = "hidden";
      accordionContent.style.transition = "height 300ms ease-in-out, opacity 300ms ease-in-out";
      const shouldOpen = item.getAttribute("data-default-open") === "true";
      if (shouldOpen) openItem(item, accordionAction, accordionContent, false);
      else closeItem(item, accordionAction, accordionContent, false);
      updateState(item);
    });
    if (!allowMultiple) {
      const openDefaults = items.filter((it) => it.getAttribute("data-default-open") === "true");
      openDefaults.slice(1).forEach((it) => {
        const btn = it.querySelector(".accordion-action");
        const c = it.querySelector(".accordion-content");
        if (btn && c) closeItem(it, btn, c, false);
        it.removeAttribute("data-default-open");
        updateState(it);
      });
    }
    accordion.addEventListener("click", (e) => {
      const btn = e.target.closest(".accordion-action");
      if (!btn || !accordion.contains(btn)) return;
      e.preventDefault();
      const item = btn.closest(".accordion-item");
      if (!item) return;
      const accordionContent = item.querySelector(".accordion-content");
      if (!accordionContent) return;
      const isOpen = item.getAttribute("data-state") === "open";
      if (isOpen) {
        closeItem(item, btn, accordionContent, true);
        updateState(item);
        return;
      }
      if (!allowMultiple) {
        items.forEach((it) => {
          if (it === item) return;
          if (it.getAttribute("data-state") === "open") {
            const b = it.querySelector(".accordion-action");
            const c = it.querySelector(".accordion-content");
            if (b && c) closeItem(it, b, c, true);
            updateState(it);
          }
        });
      }
      openItem(item, btn, accordionContent, true);
      updateState(item);
    });
    if (keyboard) {
      accordion.addEventListener("keydown", (e) => {
        const btn = e.target.closest(".accordion-action");
        if (!btn) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    }
  });
  function canSplit() {
    return typeof gsap !== "undefined" && typeof SplitText !== "undefined";
  }
  function revertSplit(accordionContent) {
    accordionContent.querySelectorAll("p").forEach((el) => {
      if (el._split) {
        try {
          el._split.revert();
        } catch {
        }
        el._split = null;
      }
      if (canSplit()) gsap.set(el, { clearProps: "all" });
    });
  }
  function animateSplitIn(accordionContent) {
    if (!canSplit()) return;
    accordionContent.querySelectorAll("p").forEach((el, i) => {
      if (!el.textContent.trim()) return;
      if (el._split) el._split.revert();
      gsap.killTweensOf(el);
      el._split = new SplitText(el, { type: "lines" });
      gsap.set(el._split.lines, {
        opacity: 0,
        y: 24,
        rotationX: -90
      });
      gsap.to(el._split.lines, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        delay: i * 0.05
      });
    });
  }
  function animateSplitOut(accordionContent) {
    if (!canSplit()) return;
    accordionContent.querySelectorAll("p").forEach((el, i) => {
      if (!el.textContent.trim()) return;
      if (!el._split) el._split = new SplitText(el, { type: "lines" });
      gsap.to(el._split.lines, {
        opacity: 0,
        y: -16,
        rotationX: 90,
        duration: 0.35,
        ease: "power2.in",
        stagger: 0.03,
        delay: i * 0.02
      });
    });
  }
  function openItem(item, btn, accordionContent, animate) {
    item.setAttribute("data-state", "open");
    btn.setAttribute("aria-expanded", "true");
    accordionContent.setAttribute("aria-hidden", "false");
    if (!animate) {
      accordionContent.style.height = "auto";
      accordionContent.style.opacity = "1";
      animateSplitIn(accordionContent);
      return;
    }
    revertSplit(accordionContent);
    accordionContent.style.height = "0px";
    accordionContent.style.opacity = "0";
    accordionContent.offsetHeight;
    const target = accordionContent.scrollHeight;
    animateSplitIn(accordionContent);
    requestAnimationFrame(() => {
      accordionContent.style.height = `${target}px`;
      accordionContent.style.opacity = "1";
    });
    accordionContent.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName === "height") {
          accordionContent.style.height = "auto";
        }
      },
      { once: true }
    );
  }
  function closeItem(item, btn, accordionContent, animate) {
    item.setAttribute("data-state", "closed");
    btn.setAttribute("aria-expanded", "false");
    accordionContent.setAttribute("aria-hidden", "true");
    if (!animate) {
      accordionContent.style.height = "0px";
      accordionContent.style.opacity = "0";
      revertSplit(accordionContent);
      return;
    }
    animateSplitOut(accordionContent);
    const current = accordionContent.scrollHeight;
    accordionContent.style.height = `${current}px`;
    accordionContent.style.opacity = "1";
    accordionContent.offsetHeight;
    setTimeout(() => {
      requestAnimationFrame(() => {
        accordionContent.style.height = "0px";
        accordionContent.style.opacity = "0";
      });
    }, 80);
    accordionContent.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName === "height") {
          revertSplit(accordionContent);
        }
      },
      { once: true }
    );
  }
}
document.addEventListener("DOMContentLoaded", () => {
  initAccordions({
    allowMultiple: false,
    keyboard: true
  });
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
const swiperAnimation = {
  instances: {},
  init() {
    if (typeof Swiper === "undefined") {
      return;
    }
    new Swiper(".sliding-swiper", {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      loop: true,
      allowTouchMove: true,
      autoplay: {
        delay: 2e3,
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
  }
};
document.addEventListener("DOMContentLoaded", () => {
  swiperAnimation.init();
});
