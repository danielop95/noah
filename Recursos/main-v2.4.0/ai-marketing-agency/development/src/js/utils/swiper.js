/* =========================
Swiper sliders js 
=========================== */

const swiperAnimation = {
  instances: {},
  init() {
    if (typeof Swiper === 'undefined') {
      return;
    }

    // =========================== AI Marketing Agency About Swiper ===========================
    const slidingSwiper = new Swiper('.sliding-swiper', {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      loop: true,
      allowTouchMove: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: true,
      },

      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0,
          centeredSlides: true,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 0,
        },
      },

      on: {
        init: function () {
          // Initialize first slide immediately
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            activeSlide.style.transform = 'scale(1)';
            activeSlide.style.opacity = '1';
            activeSlide.style.filter = 'blur(0)';
          }
        },
        slideChange: function () {
          // Reset all slides immediately
          const slides = this.slides;
          slides.forEach((slide) => {
            slide.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            slide.style.transform = 'scale(0.8)';
            slide.style.opacity = '0.3';
            slide.style.filter = 'blur(3px)';
          });
        },
        slideChangeTransitionStart: function () {
          // Animate active slide immediately when transition starts
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            activeSlide.style.transform = 'scale(1)';
            activeSlide.style.opacity = '1';
            activeSlide.style.filter = 'blur(0)';
          }
        },
      },
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  swiperAnimation.init();
});
