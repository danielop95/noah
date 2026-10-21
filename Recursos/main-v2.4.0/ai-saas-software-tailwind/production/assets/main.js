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
    const progressContainer = document.querySelector(".progress-container");
    const progressLine = document.querySelectorAll(".progress-line");
    const stepLine = document.querySelectorAll(".step-line");
    const progressBars = document.querySelectorAll(
      ".progress-bar-blue, .progress-bar-black, .progress-bar-lemon, .progress-bar-cyan"
    );
    if (footerDivider) {
      dividerExpand(footerDivider);
    }
    if (stepLine.length > 0) {
      gsap.set(stepLine, { height: "0px" });
      const firstStepLine = stepLine[0];
      const triggerElement = firstStepLine.closest(".step-line-container") || firstStepLine.parentElement || firstStepLine;
      const stepTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "top 79%",
          end: "top 15%",
          toggleActions: "play none none"
        }
      });
      stepLine.forEach((line, index) => {
        stepTimeline.to(
          line,
          {
            height: "100%",
            duration: 1.4,
            ease: "power3.out"
          },
          index * 0.7
          // Each animation with 0.7s delay duration)
        );
      });
    }
    if (progressBars.length > 0) {
      gsap.set(progressBars, { height: "0px" });
      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".progress-bar-blue",
          start: "top 88%",
          end: "bottom 20%",
          toggleActions: "play none none "
        }
      });
      progressTimeline.to(
        ".progress-bar-blue",
        {
          height: "30%",
          duration: 1.2,
          ease: "power2.out"
        },
        "-=0.3"
      ).to(
        ".progress-bar-black",
        {
          height: "65%",
          duration: 1.2,
          ease: "power2.out"
        },
        "-=0.3"
      ).to(
        ".progress-bar-lemon",
        {
          height: "45%",
          duration: 1.2,
          ease: "power2.out"
        },
        "-=0.8"
      ).to(
        ".progress-bar-cyan",
        {
          height: "30%",
          duration: 1.2,
          ease: "power2.out"
        },
        "-=0.9"
      );
    }
    if (progressLine.length > 0) {
      gsap.set(progressLine, { width: "0%" });
      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: progressContainer,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none"
        }
      });
      progressLine.forEach((line, index) => {
        progressTimeline.to(
          line,
          {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut"
          },
          index * 1
          // Each animation starts after the previous one completes (2 seconds duration)
        );
      });
    }
  }
};
const headerScroll = () => {
  const header = document.querySelector("[data-header-scroll]");
  if (!header) return;
  const updateScrollState = () => {
    header.dataset.hasScrolled = window.scrollY > 100 ? "true" : "false";
  };
  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();
};
const capabilitiesIntegrationList$1 = () => {
  const list1 = document.querySelector(".capabilities-integration-list");
  const list2 = document.querySelector(".capabilities-integration-list-2");
  if (!list1 || !list2) return;
  let maxProgress = 0;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: list1,
      start: "top 85%",
      end: "bottom 30%",
      scrub: true,
      onUpdate: (self) => {
        if (self.progress > maxProgress) {
          maxProgress = self.progress;
        }
        tl.progress(maxProgress);
      },
      onLeave: () => {
        maxProgress = 1;
        tl.progress(1);
      },
      onLeaveBack: () => {
        tl.progress(maxProgress);
      }
    }
  });
  tl.from(
    list1,
    {
      opacity: 0.1,
      x: 400,
      y: -70,
      duration: 10,
      delay: 0.5,
      ease: "sine.Out"
    },
    "+=6"
  ).from(
    list2,
    {
      opacity: 0.1,
      x: 450,
      y: 70,
      duration: 10.5,
      ease: "sine.Out"
    },
    "-=1.5"
  );
};
const howItsWork = () => {
  const container = document.querySelector(".how-its-work-images-container");
  const images = [
    document.querySelector(".how-its-work-image-1"),
    document.querySelector(".how-its-work-image-2"),
    document.querySelector(".how-its-work-image-3"),
    document.querySelector(".how-its-work-image-4")
  ];
  if (!container) return;
  const initialPositions = [
    { x: 170, y: 0, rotation: 0 },
    { x: 10, y: 0, rotation: 0 },
    { x: -40, y: 0, rotation: 0 },
    { x: -170, y: 0, rotation: 0 }
  ];
  const finalPositions = [
    { x: 0, y: -12, rotation: -20 },
    { x: 0, y: 0, rotation: 20 },
    { x: 0, y: -28, rotation: -8 },
    { x: 0, y: 0, rotation: 19 }
  ];
  images.forEach((img, index) => {
    gsap.set(img, {
      x: initialPositions[index].x,
      y: initialPositions[index].y,
      rotation: initialPositions[index].rotation,
      transformOrigin: "50% 50%"
    });
  });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 80%",
      once: true
    }
  });
  images.forEach((img, index) => {
    tl.to(
      img,
      {
        x: finalPositions[index].x,
        y: finalPositions[index].y,
        rotation: finalPositions[index].rotation,
        duration: 1.5,
        ease: "power3.out"
      },
      0
    );
  });
};
document.addEventListener("DOMContentLoaded", () => {
  if (globalThis.window === void 0) return;
  commonAnimation.init();
  headerScroll();
  capabilitiesIntegrationList$1();
  howItsWork();
});
const CtaAnimation = {
  initFancySlider() {
    const slider = document.getElementById("fancy-slider");
    if (slider) {
      let updateSlides2 = function() {
        slides.forEach((slide, i) => {
          const offset = (i - index + slides.length) % slides.length;
          slide.style.zIndex = 0;
          slide.style.border = "4px solid";
          slide.style.borderRadius = "8px";
          slide.style.borderColor = "var(--color-background-1)";
          slide.style.filter = "blur(4px)";
          slide.style.transform = "scale(0.7) translateX(0) rotate(0deg)";
          slide.style.width = "180px";
          slide.style.height = "180px";
          if (offset === 0) {
            slide.style.zIndex = 10;
            slide.style.filter = "blur(0)";
            slide.style.transform = "scale(1) translateX(0) rotate(0)";
            slide.style.border = "4px solid";
            slide.style.boxShadow = "0 0 40px #000";
            slide.style.borderColor = "white";
            slide.style.borderRadius = "11px";
            slide.style.width = "200px";
            slide.style.height = "200px";
          } else if (offset === 1 || offset === slides.length - 1) {
            slide.style.zIndex = 5;
            slide.style.transform = `scale(1) translateX(${offset === 1 ? 185 : -185}px) translateY(40px) rotate(${offset === 1 ? "20deg" : "-20deg"})`;
          } else {
            slide.style.zIndex = 1;
            slide.style.transform = `scale(0.87) translateX(${offset === 2 ? 350 : -350}px) translateY(140px) rotate(${offset === 2 ? "50deg" : "-50deg"}) opacity(0)`;
          }
        });
      }, nextSlide2 = function() {
        index = (index + 1) % slides.length;
        updateSlides2();
      };
      var updateSlides = updateSlides2, nextSlide = nextSlide2;
      const slides = slider.querySelectorAll("figure");
      let index = 0;
      updateSlides2();
      setInterval(nextSlide2, 2500);
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  CtaAnimation.initFancySlider();
});
const animation$1 = {
  init() {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.registerPlugin(ScrollTrigger);
    const integrationPathAnimation = () => {
      const svgs = document.querySelectorAll(".integration-path");
      if (svgs.length === 0) {
        return;
      }
      svgs.forEach((svg) => {
        const pathGroups = svg.querySelectorAll("g");
        pathGroups.forEach((group, index) => {
          const path = group.querySelector("path");
          if (!path) return;
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("r", "2");
          dot.setAttribute("fill", "#09F671");
          dot.setAttribute("opacity", "0.8");
          group.appendChild(dot);
          gsap.to(dot, {
            duration: 4,
            repeat: -1,
            scale: 2.5,
            ease: "none",
            filter: "blur(1px)",
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
              start: 0,
              end: 1
            }
          });
        });
      });
    };
    const integrationFeaturesPill = () => {
      const pills = document.getElementsByClassName("features-integration-pill");
      const paths = [];
      for (const pill of pills) {
        const svgs = pill.getElementsByTagName("svg");
        for (const svg of svgs) {
          const pathEls = svg.getElementsByClassName("connector");
          for (const el of pathEls) {
            paths.push(el);
          }
        }
      }
      if (paths.length === 0) return;
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
        if (!svg.getElementById("glow")) {
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
          svg.prepend(defs);
        }
        const pillContainer = path.closest(".features-integration-pill");
        const dotColorAttr = (pillContainer == null ? void 0 : pillContainer.dataset.dotColor) || "white";
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
    integrationPathAnimation();
    integrationFeaturesPill();
  }
};
const capabilitiesIntegrationList = () => {
  const list1 = document.querySelector(".capabilities-integration-list");
  const list2 = document.querySelector(".capabilities-integration-list-2");
  if (!list1 || !list2) return;
  let maxProgress = 0;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: list1,
      start: "top 85%",
      end: "bottom 30%",
      scrub: true,
      onUpdate: (self) => {
        if (self.progress > maxProgress) {
          maxProgress = self.progress;
        }
        tl.progress(maxProgress);
      },
      onLeave: () => {
        maxProgress = 1;
        tl.progress(1);
      },
      onLeaveBack: () => {
        tl.progress(maxProgress);
      }
    }
  });
  tl.from(
    list1,
    {
      opacity: 0.1,
      x: 400,
      y: -70,
      duration: 10,
      delay: 0.5,
      ease: "sine.Out"
    },
    "+=6"
  ).from(
    list2,
    {
      opacity: 0.1,
      x: 450,
      y: 70,
      duration: 10.5,
      ease: "sine.Out"
    },
    "-=1.5"
  );
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    animation$1.init();
    capabilitiesIntegrationList();
  });
} else {
  animation$1.init();
}
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
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll("[data-footer-year]");
  if (footerYearElements.length > 0) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};
document.addEventListener("DOMContentLoaded", () => updateFooterYear());
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
    this.setActiveLinkState();
    this.toggleButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
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
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const currentPath = globalThis.location.pathname;
    const currentPage = currentPath.split("/").pop() || "index.html";
    const links = sidebar.querySelectorAll("a[href]");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      try {
        const linkPath = new URL(href, globalThis.location.href).pathname;
        const linkPage = linkPath.split("/").pop() || "index.html";
        if (linkPage === currentPage) {
          link.dataset.clicked = "true";
        } else {
          delete link.dataset.clicked;
        }
      } catch (err) {
        console.log(err);
      }
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
    globalThis.mobileMenuAccordion = new MobileMenuAccordion({
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
const swiperAnimation = {
  instances: {},
  init() {
    if (typeof Swiper === "undefined") {
      return;
    }
    this.instances.articleBlog = new Swiper(".article-blog-swiper", {
      initialSlide: 1,
      speed: 1e3,
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      allowTouchMove: true,
      autoplay: {
        delay: 3e3,
        disableOnInteraction: true
      },
      navigation: {
        nextEl: ".article-blog-next",
        prevEl: ".article-blog-prev"
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
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  swiperAnimation.init();
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
