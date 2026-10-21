const avatar = {
  init() {
    const avatars = document.querySelectorAll('[data-opai-avatar]');
    avatars.forEach((avatar) => {
      const delay = avatar.getAttribute('data-avatar-delay')
        ? parseFloat(avatar.getAttribute('data-avatar-delay'))
        : 0;
      const direction = avatar.getAttribute('data-avatar-direction')
        ? avatar.getAttribute('data-avatar-direction')
        : 'left';
      const scale = avatar.getAttribute('data-avatar-scale')
        ? parseFloat(avatar.getAttribute('data-avatar-scale'))
        : 0;
      const offset = avatar.getAttribute('data-avatar-offset')
        ? parseFloat(avatar.getAttribute('data-avatar-offset'))
        : 0;

      const animationProps = {
        duration: 1.5,
        opacity: 0,
        scale: scale,
        filter: 'blur(5px)',
        delay,
        ease: 'elastic.out(1, 0.7)',
        scrollTrigger: {
          trigger: avatar,
          start: 'top 90%',
          end: 'bottom 20%',
        },
      };

      // Set animation direction  data-avatar-direction
      switch (direction) {
        case 'left':
          animationProps.x = -offset;
          break;
        case 'right':
          animationProps.x = offset;
          break;
        case 'down':
          animationProps.y = offset;
          break;
        case 'up':
        default:
          animationProps.y = -offset;
          break;
      }

      gsap.from(avatar, animationProps);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  avatar.init();
});
