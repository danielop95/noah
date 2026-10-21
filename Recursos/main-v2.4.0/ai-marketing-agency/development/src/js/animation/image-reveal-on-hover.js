/* =========================
Image Reveal On Hover Cursor
=========================== */

const imageRevealOnHover = {
  init() {
    if (typeof gsap === 'undefined') return;

    const containers = document.querySelectorAll('[data-image-reveal]');
    if (containers.length === 0) return;

    containers.forEach((container) => {
      const cursor = container.querySelector('[data-image-reveal-cursor]');
      const mediaContainer = container.querySelector('[data-image-reveal-container]');
      const listEl = container.querySelector('[data-image-reveal-list]');
      const items = container.querySelectorAll('[data-image-reveal-item]');

      // Support both: hidden .medias img (slide-up mode) or legacy data-image-reveal-media
      const mediasEl = container.querySelector('.medias');
      const mediaImgs = mediasEl
        ? mediasEl.querySelectorAll('img')
        : container.querySelectorAll('[data-image-reveal-media]');
      const mediasUrl = [];
      mediaImgs.forEach((img) => mediasUrl.push(img.getAttribute('src')));

      const useSlideUpReveal = mediaContainer && mediasUrl.length > 0 && listEl;

      if (!cursor || items.length === 0) return;
      if (useSlideUpReveal && (!mediaContainer || mediasUrl.length === 0)) return;

      if (cursor.parentElement !== document.body) {
        document.body.appendChild(cursor);
      }

      const followDuration = Number.parseFloat(container.dataset.followDuration) || 0.9;
      const showDuration = Number.parseFloat(container.dataset.showDuration) || 0.65;
      const ease = container.dataset.ease || 'expo';
      const revealDuration = Number.parseFloat(container.dataset.revealDuration) || 0.8;
      const maxRevealChildren = 20;

      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
        x: 0,
        y: 0,
      });

      const setX = gsap.quickTo(cursor, 'x', { duration: followDuration, ease });
      const setY = gsap.quickTo(cursor, 'y', { duration: followDuration, ease });

      const onMove = (e) => {
        setX(e.clientX);
        setY(e.clientY);
      };

      window.addEventListener('pointermove', onMove, { passive: true });

      const tl = gsap.timeline({ paused: true });
      tl.to(cursor, {
        scale: 1,
        opacity: 1,
        duration: showDuration,
        ease: `${ease}.inOut`,
      });

      if (useSlideUpReveal) {
        // List: show cursor on enter, hide and clear on leave
        listEl.addEventListener('mouseenter', () => tl.play());
        listEl.addEventListener('mouseleave', () => {
          tl.reverse();
          while (mediaContainer.firstChild) mediaContainer.firstChild.remove();
        });

        // Row hover: create div+img and animate slide-up reveal
        const createMedia = (index) => {
          const i = Number(index);
          if (Number.isNaN(i) || i < 0 || i >= mediasUrl.length) return;

          const div = document.createElement('div');
          div.style.cssText =
            'position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:inherit;';
          const img = document.createElement('img');
          img.src = mediasUrl[i];
          img.alt = '';
          img.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;';
          div.appendChild(img);
          mediaContainer.appendChild(div);

          gsap.set(div, { yPercent: -100 });
          gsap.set(img, { yPercent: 90 });

          gsap.to([div, img], {
            yPercent: 0,
            duration: revealDuration,
            ease: 'expo.inOut',
          });

          if (mediaContainer.children.length > maxRevealChildren) {
            mediaContainer.children[0].remove();
          }
        };

        items.forEach((item) => {
          const index = item.dataset.index ?? item.getAttribute('data-index') ?? '0';
          item.addEventListener('mouseenter', () => createMedia(index));
        });

        window.addEventListener('blur', () => {
          tl.reverse();
          while (mediaContainer.firstChild) mediaContainer.firstChild.remove();
        });
      } else {
        // Legacy: opacity-based reveal with data-image-reveal-media
        const medias = container.querySelectorAll('[data-image-reveal-media]');
        const deactivateAll = () => medias.forEach((m) => m.setAttribute('data-active', 'false'));
        const activateMedia = (index) => {
          deactivateAll();
          const i = Number(index);
          if (!Number.isNaN(i) && medias[i]) medias[i].setAttribute('data-active', 'true');
        };

        items.forEach((item) => {
          const index = item.dataset.index ?? item.getAttribute('data-index') ?? '0';
          item.addEventListener('mouseenter', () => {
            activateMedia(index);
            tl.play();
          });
          item.addEventListener('mouseleave', () => {
            tl.reverse();
            deactivateAll();
          });
        });

        window.addEventListener('blur', () => {
          tl.reverse();
          deactivateAll();
        });
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  imageRevealOnHover.init();
});
