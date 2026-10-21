const buttonV3 = {
  init(root = document) {
    const buttonWrappers = root.querySelectorAll('[data-button-v3]');

    buttonWrappers.forEach((buttonWrapper) => {
      if (buttonWrapper.dataset.v3Bound) return;
      buttonWrapper.dataset.v3Bound = 'true';

      const iconWrapper = buttonWrapper.querySelector('[data-button-v3-icon]');
      const buttonText = buttonWrapper.querySelector('[data-button-v3-text]');
      if (!iconWrapper || !buttonText) return;

      const calculateDistance = () => {
        const wrapperWidth = Math.ceil(buttonWrapper.clientWidth);

        const iconWidth = iconWrapper.clientWidth;

        const iconTranslateXDistance = wrapperWidth - (iconWidth + 9);
        const textTranslateXDistance = iconWidth;

        return { iconTranslateXDistance, textTranslateXDistance };
      };

      const onEnter = () => {
        const { iconTranslateXDistance, textTranslateXDistance } = calculateDistance();
        iconWrapper.style.transform = `translateX(${iconTranslateXDistance}px)`;
        buttonText.style.transform = `translateX(-${textTranslateXDistance}px)`;
      };

      const onLeave = () => {
        iconWrapper.style.transform = 'translateX(0)';
        buttonText.style.transform = 'translateX(0)';
      };

      buttonWrapper.addEventListener('mouseenter', onEnter);
      buttonWrapper.addEventListener('mouseleave', onLeave);
    });
  },
};

globalThis.addEventListener('DOMContentLoaded', () => {
  buttonV3.init();
});
