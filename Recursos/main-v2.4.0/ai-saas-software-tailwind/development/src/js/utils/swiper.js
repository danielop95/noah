/* =========================
Swiper sliders js 
=========================== */

const swiperAnimation = {
  instances: {},
  init() {
    if (typeof Swiper === 'undefined') {
      return;
    }

    // =========================== AI Creative Studio Testimonial Swiper ===========================
    this.instances.articleBlog = new Swiper('.article-blog-swiper', {
      initialSlide: 1,
      speed: 1000,
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      allowTouchMove: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: true,
      },

      navigation: {
        nextEl: '.article-blog-next',
        prevEl: '.article-blog-prev',
      },
      on: {
        init: function () {
          const slides = this.slides;
          const activeIndex = this.activeIndex;
          const slidesPerView = Math.ceil(this.params.slidesPerView);

          slides.forEach((slide, index) => {
            slide.style.transition = 'opacity 0.4s ease-out, filter 0.4s ease-out';

            let offset = index - activeIndex;
            if (offset < 0) offset += slides.length;

            if (offset >= 0 && offset < slidesPerView) {
              slide.style.opacity = '1';
              slide.style.filter = 'blur(0px)';
            } else {
              slide.style.opacity = '0.5';
              slide.style.filter = 'blur(2px)';
            }
          });
        },
        slideChangeTransitionStart: function () {
          const slides = this.slides;
          const activeIndex = this.activeIndex;
          const slidesPerView = Math.ceil(this.params.slidesPerView);

          slides.forEach((slide, index) => {
            slide.style.transition = 'opacity 0.4s ease-out, filter 0.4s ease-out';

            let offset = index - activeIndex;
            if (offset < 0) offset += slides.length;

            if (offset >= 0 && offset < slidesPerView) {
              slide.style.opacity = '1';
              slide.style.filter = 'blur(0px)';
            } else {
              slide.style.opacity = '0.5';
              slide.style.filter = 'blur(2px)';
            }
          });
        },
      },
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  swiperAnimation.init();
});
