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
    const aiMarketingAgencyAboutSwiper = new Swiper('.ai-marketing-agency-about-swiper', {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 3000,
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
      navigation: {
        nextEl: '.ai-kw-generator-testimonial-next',
        prevEl: '.ai-kw-generator-testimonial-prev',
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

    // =========================== AI Kw Generator Testimonial Swiper ===========================
    const aiKwGeneratorTestimonialSwiper = new Swiper('.ai-kw-generator-testimonial-swiper', {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: true,
      },

      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 0,
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
      navigation: {
        nextEl: '.ai-kw-generator-testimonial-next',
        prevEl: '.ai-kw-generator-testimonial-prev',
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

    // =========================== AI Creative Studio Testimonial Swiper ===========================
    this.instances.aiCreativeStudioTestimonial = new Swiper(
      '.ai-creative-studio-testimonial-swiper',
      {
        initialSlide: 2,
        speed: 2000,
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        allowTouchMove: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: true,
        },

        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
        },
        navigation: {
          nextEl: '.ai-creative-studio-testimonial-next',
          prevEl: '.ai-creative-studio-testimonial-prev',
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
      }
    );

    this.instances.scienceLabTestimonial = new Swiper('.science-lab-testimonial-swiper', {
      initialSlide: 3,
      centeredSlides: true,
      spaceBetween: 0,
      loop: true,
      speed: 1400,
      allowTouchMove: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: true,
      },

      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        980: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1140: {
          slidesPerView: 3,
          // spaceBetween: 280,
        },
      },
      navigation: {
        nextEl: '.science-lab-testimonial-next',
        prevEl: '.science-lab-testimonial-prev',
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
          });
        },
        slideChangeTransitionStart: function () {
          // Animate active slide immediately when transition starts
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            activeSlide.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            activeSlide.style.transform = 'scale(1)';
          }
        },
      },
    });

    // =========================== AI Voice Generator Testimonial Swiper ===========================
    const TRANSITION = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const AUTOPLAY_DELAY = 3000;

    // Helper: Get responsive image size based on screen width
    const getImageSize = (isActive) => {
      const width = window.innerWidth;
      if (width < 480) {
        // Mobile: smaller sizes
        return isActive ? 'size-20' : 'size-14';
      } else if (width < 768) {
        // Tablet: medium sizes
        return isActive ? 'size-40' : 'size-24';
      } else {
        // Desktop: original sizes
        return isActive ? 'size-52' : 'size-30';
      }
    };

    // Helper: Apply styles to slide
    const setSlideStyle = (slide, isActive) => {
      const img = slide.querySelector('.ai-voice-generator-testimonial-image');
      Object.assign(slide.style, {
        transition: TRANSITION,
        transform: isActive ? 'scale(1)' : 'scale(0.8) ',
        opacity: isActive ? '1' : '0.3',
        filter: isActive ? 'blur(0)' : 'blur(2px)',
      });
      if (img) {
        img.style.transition = TRANSITION;
        img.classList.remove(
          'size-14',
          'size-19',
          'size-20',
          'size-24',
          'size-30',
          'size-40',
          'size-52'
        );
        img.classList.add(getImageSize(isActive));
      }
    };

    // Helper: Animate text
    const animateText = (item, fromY, toY = '0', opacity = '1') => {
      item.style.transition = 'none';
      item.style.transform = `translateY(${fromY})`;
      item.style.opacity = '0';
      void item.offsetHeight;
      item.style.transition = TRANSITION + ', opacity 0.8s';
      item.style.transform = `translateY(${toY})`;
      item.style.opacity = opacity;
    };

    this.instances.aiVoiceGeneratorTestimonial = new Swiper(
      '.ai-voice-generator-testimonial-swiper',
      {
        initialSlide: 2,
        centeredSlides: true,
        speed: 1700,
        allowTouchMove: false,
        autoplay: { delay: AUTOPLAY_DELAY, disableOnInteraction: false },
        slidesPerView: 5,
        breakpoints: {
          480: { slidesPerView: 3, spaceBetween: -15 },
          768: { slidesPerView: 5, spaceBetween: -70 },
        },
        on: {
          init: function () {
            this.slides.forEach((slide, i) => setSlideStyle(slide, i === this.activeIndex));
            updateTestimonialText(this.activeIndex, 'next');
            updateTestimonialPagination(this.activeIndex);
          },
          resize: function () {
            // Update image sizes on resize
            this.slides.forEach((slide, i) => setSlideStyle(slide, i === this.activeIndex));
          },
          slideChange: function () {
            this.slides.forEach((slide) => setSlideStyle(slide, false));
          },
          slideChangeTransitionStart: function () {
            setSlideStyle(this.slides[this.activeIndex], true);
            const direction = this.previousIndex < this.activeIndex ? 'next' : 'prev';
            updateTestimonialText(this.activeIndex, direction);
            updateTestimonialPagination(this.activeIndex);
          },
          autoplayStop: pauseTestimonialPaginationProgress,
          autoplayResume: function () {
            updateTestimonialPagination(this.activeIndex);
          },
        },
      }
    );

    function updateTestimonialPagination(activeIndex) {
      document
        .querySelectorAll('.ai-voice-generator-testimonial-pagination-bullet')
        .forEach((bullet, i) => {
          const isActive = i === activeIndex;
          bullet.classList.toggle(
            'ai-voice-generator-testimonial-pagination-bullet-active',
            isActive
          );
          if (isActive) {
            bullet.style.setProperty('--progress-width', '0%');
            void bullet.offsetWidth;
            requestAnimationFrame(() =>
              requestAnimationFrame(() => bullet.style.setProperty('--progress-width', '100%'))
            );
          } else {
            bullet.style.removeProperty('--progress-width');
          }
        });
    }

    function pauseTestimonialPaginationProgress() {
      document
        .querySelectorAll('.ai-voice-generator-testimonial-pagination-bullet-active')
        .forEach((bullet) => {
          const currentWidth = window.getComputedStyle(bullet, '::before').width;
          bullet.style.setProperty('--progress-width', currentWidth);
        });
    }

    document
      .querySelectorAll('.ai-voice-generator-testimonial-pagination-bullet')
      .forEach((bullet) => {
        bullet.addEventListener('click', function () {
          const slideIndex = parseInt(this.getAttribute('data-slide-index'));
          if (!isNaN(slideIndex)) this.instances.aiVoiceGeneratorTestimonial.slideTo(slideIndex);
        });
      });

    function updateTestimonialText(activeIndex, direction = 'next') {
      const textItems = document.querySelectorAll('.ai-voice-generator-testimonial-text-item');
      if (!textItems.length) return;

      const isNext = direction === 'next';
      textItems.forEach((item, i) => {
        if (i === activeIndex) {
          animateText(item, isNext ? '100%' : '-100%');
        } else {
          const shouldSlideUp = isNext ? i < activeIndex : i > activeIndex;
          animateText(item, '0', shouldSlideUp ? '-100%' : '100%', '0');
        }
      });
    }

    // =========================== AI Creative Studio Blog Swiper ===========================
    this.instances.aiCreativeStudioBlog = new Swiper('.ai-creative-studio-blog-swiper', {
      initialSlide: 1,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 1400,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: true,
      },
      allowTouchMove: true,
      effect: 'creative',
      creativeEffect: {
        prev: {
          translate: ['-130%', 0, -400],
          opacity: 0,
        },
        next: {
          translate: ['130%', 0, -400],
          opacity: 0,
        },
      },
      pagination: {
        el: '.ai-creative-studio-blog-pagination',
        clickable: true,
        bulletClass: 'ai-creative-studio-blog-pagination-bullet',
        bulletActiveClass: 'ai-creative-studio-blog-pagination-bullet-active',
      },
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  swiperAnimation.init();
});
