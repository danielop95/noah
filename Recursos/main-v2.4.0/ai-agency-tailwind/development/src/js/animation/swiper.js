/* =========================
Swiper sliders js 
=========================== */

function initReviewsSwiper() {
  const reviewsSwiper = new Swiper('.reviews-swiper', {
    slidesPerView: 1,
    padding: 10,
    spaceBetween: 70,
    loop: true,
    centeredSlides: true,
    speed: 1500,
    effect: 'slide',
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.reviews-next',
      prevEl: '.reviews-prev',
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 15,
        centeredSlides: true,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 32,
        centeredSlides: true,
      },
    },
    on: {
      slideChange: function () {
        // Add smooth transition class to all slides
        const slides = this.slides;
        slides.forEach((slide, index) => {
          if (index === this.activeIndex) {
            slide.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          } else {
            slide.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          }
        });
      },
      slideChangeTransitionStart: function () {
        // Reset animations when transition starts
        const activeSlide = this.slides[this.activeIndex];
        if (activeSlide) {
          const elements = activeSlide.querySelectorAll(
            '.review-text, .review-name, .review-title, .avatar-ring'
          );
          elements.forEach((el) => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = null;
          });
        }
      },
    },
  });

  // single card reviews swiper
  const singleCardReviewsSwiper = new Swiper('.single-card-reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    centeredSlides: true,
    speed: 1100,
    allowTouchMove: false,

    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
    },

    navigation: {
      nextEl: '.single-card-reviews-next',
      prevEl: '.single-card-reviews-prev',
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

  // reviews fade in swiper
  const reviewsFadeInSwiper = new Swiper('.reviews-fade-in-swiper', {
    // modules: [Navigation, Pagination, Autoplay, EffectFade],
    slidesPerView: 1,
    spaceBetween: 70,
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    speed: 1000,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      nextEl: '.reviews-fade-in-next',
      prevEl: '.reviews-fade-in-prev',
    },
    pagination: {
      el: '.reviews-fade-in-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    on: {
      init: function () {
        // Add custom CSS for enhanced fade effect
        const style = document.createElement('style');
        style.textContent = `
              .reviews-fade-in-swiper .swiper-slide {
                transition: opacity 0.8s ease-out, transform 0.8s ease-out, filter 0.8s ease-out;
                opacity: 0;
                transform: scale(0.6);
                filter: blur(7px);
              }
              .reviews-fade-in-swiper .swiper-slide-active {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
              }
              .reviews-fade-in-swiper .swiper-slide-prev,
              .reviews-fade-in-swiper .swiper-slide-next {
                opacity: 0;
                transform: scale(0.6);
                filter: blur(7px);
              }
              .reviews-fade-in-swiper .swiper-slide .review-text,
              .reviews-fade-in-swiper .swiper-slide .review-name,
              .reviews-fade-in-swiper .swiper-slide .review-title,
              .reviews-fade-in-swiper .swiper-slide .avatar-ring {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.4s ease-out, transform 0.4s ease-out;
              }
              .reviews-fade-in-swiper .swiper-slide-active .review-text,
              .reviews-fade-in-swiper .swiper-slide-active .review-name,
              .reviews-fade-in-swiper .swiper-slide-active .review-title,
              .reviews-fade-in-swiper .swiper-slide-active .avatar-ring {
                opacity: 1;
                transform: translateY(0);
              }
            `;
        document.head.appendChild(style);
      },
      slideChangeTransitionStart: function () {
        // Clear all animations and reset content immediately
        const slides = this.slides;
        slides.forEach((slide) => {
          const elements = slide.querySelectorAll(
            '.review-text, .review-name, .review-title, .avatar-ring'
          );
          elements.forEach((el) => {
            el.style.animation = 'none';
            el.style.transition = 'none';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
          });
        });
      },
      slideChangeTransitionEnd: function () {
        // Animate content after slide transition is complete
        const activeSlide = this.slides[this.activeIndex];
        if (activeSlide) {
          const elements = activeSlide.querySelectorAll(
            '.review-text, .review-name, .review-title, .avatar-ring'
          );

          // Reset transition property
          elements.forEach((el) => {
            el.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
          });

          // Stagger the animations
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      },
    },
  });

  // Add custom keyframes for enhanced animations
  const customStyles = document.createElement('style');
  customStyles.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(customStyles);

  // blog article swiper
  const blogArticleSwiper = new Swiper('.blog-article-swiper', {
    slidesPerView: 1,
    spaceBetween: 40,
    loop: true,
    effect: 'slide',
    speed: 1000,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.pagination-bullets',
      clickable: true,
      type: 'bullets',
    },

    on: {
      slideChange: function () {
        // Add smooth transition class to all slides
        const slides = this.slides;
        slides.forEach((slide, index) => {
          if (index === this.activeIndex) {
            slide.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          } else {
            slide.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          }
        });
      },
    },
  });

  // social proof swiper
  const socialProofSwiper = new Swiper('.social-proof-swiper', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    centeredSlides: true,
    speed: 1100,
    allowTouchMove: false,

    autoplay: {
      delay: 3000,
      disableOnInteraction: true,
    },

    navigation: {
      nextEl: '.social-proof-next',
      prevEl: '.social-proof-prev',
    },

    on: {
      init: function () {
        // Set up avatar click handlers
        setupSocialProofAvatars(this);
        // Update active avatar state
        updateActiveAvatar(this.realIndex);
      },
      slideChange: function () {
        // Update active avatar based on real index
        updateActiveAvatar(this.realIndex);
      },
    },
  });

  // Setup avatar click handlers for social proof swiper
  function setupSocialProofAvatars(swiperInstance) {
    const avatars = document.querySelectorAll('.social-proof-avatar');

    avatars.forEach((avatar) => {
      avatar.addEventListener('click', function () {
        const slideIndex = parseInt(this.getAttribute('data-slide-index'));

        // If clicking the same active slide, don't do anything
        if (swiperInstance.realIndex === slideIndex) {
          return;
        }

        // Stop autoplay temporarily
        if (swiperInstance.autoplay.running) {
          swiperInstance.autoplay.stop();
        }

        // Navigate to the slide
        swiperInstance.slideToLoop(slideIndex);

        // Restart autoplay after a delay
        setTimeout(() => {
          if (swiperInstance.params.autoplay && !swiperInstance.autoplay.running) {
            swiperInstance.autoplay.start();
          }
        }, swiperInstance.params.speed);
      });
    });
  }

  // Update active avatar state
  function updateActiveAvatar(activeIndex) {
    const avatars = document.querySelectorAll('.social-proof-avatar');

    avatars.forEach((avatar, index) => {
      if (index === activeIndex) {
        avatar.classList.add('active');
      } else {
        avatar.classList.remove('active');
      }
    });
  }

  // blog article swiper
  const aiVoiceGeneratorBlogSwiper = new Swiper('.ai-voice-generator-blog-swiper', {
    slidesPerView: 1,
    spaceBetween: 40,
    loop: true,
    effect: 'slide',
    speed: 1000,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.ai-voice-generator-blog-pagination-bullets',
      clickable: true,
      type: 'bullets',
    },

    on: {
      slideChange: function () {
        // Add smooth transition class to all slides
        const slides = this.slides;
        slides.forEach((slide, index) => {
          if (index === this.activeIndex) {
            slide.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          } else {
            slide.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          }
        });
      },
    },
  });

  const financialManagementPlatformSwiper = new Swiper('.financial-management-platform-swiper', {
    breakpoints: {
      425: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
      1290: {
        slidesPerView: 4,
      },
    },
    spaceBetween: 4,
    initialSlide: 4,
    loop: true,
    loopAdditionalSlides: 2,
    speed: 1100,
    allowTouchMove: true,

    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },

    pagination: {
      el: '.financial-management-platform-pagination',
      clickable: true,
      type: 'bullets',
      dynamicBullets: false,
    },

    on: {
      init: function () {
        const slides = this.slides;
        const activeIndex = this.activeIndex;
        const slidesPerView = 4;

        slides.forEach((slide, index) => {
          slide.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';

          let offset = index - activeIndex;
          if (offset < 0) offset += slides.length;

          if (offset >= 0 && offset < slidesPerView) {
            slide.style.opacity = '1';
            slide.style.filter = 'blur(0px)';
          } else {
            slide.style.opacity = '0.3';
            slide.style.filter = 'blur(30px)';
          }
        });
      },
      slideChangeTransitionStart: function () {
        const slides = this.slides;
        const activeIndex = this.activeIndex;
        const slidesPerView = 4;

        slides.forEach((slide, index) => {
          slide.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';

          let offset = index - activeIndex;
          if (offset < 0) offset += slides.length;

          if (offset >= 0 && offset < slidesPerView) {
            slide.style.opacity = '1';
            slide.style.filter = 'blur(0px)';
          } else {
            slide.style.opacity = '0.3';
            slide.style.filter = 'blur(30px)';
          }
        });
      },
    },
  });

  return {
    reviewsSwiper,
    singleCardReviewsSwiper,
    reviewsFadeInSwiper,
    blogArticleSwiper,
    socialProofSwiper,
    financialManagementPlatformSwiper,
  };
}

initReviewsSwiper();
