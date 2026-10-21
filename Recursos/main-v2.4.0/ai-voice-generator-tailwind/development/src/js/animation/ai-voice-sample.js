const aiVoiceSampleAnimation = {
  init() {
    const voiceSampleItems = document.querySelectorAll('.voice-sample-item');
    const audioPath = './audio/ai-voice-generator-voice-sample.mp3';

    voiceSampleItems.forEach((item) => {
      const audio = new Audio(audioPath);
      item.audio = audio;
      item.waveformTimelines = []; // Store GSAP timelines for this item

      // Initialize waveform animation
      aiVoiceSampleAnimation.initWaveform(item);

      // When audio ends, reset to initial state
      audio.addEventListener('ended', () => {
        toggleAnimation(item, false);
      });

      // Handle play/pause on click
      item.querySelector('.voice-sample-play-button').addEventListener('click', () => {
        const isPlaying = item.classList.contains('voice-sample-item-active');

        if (isPlaying) {
          // Pause
          audio.pause();
          audio.currentTime = 0;
          toggleAnimation(item, false);
        } else {
          // Play
          stopAllOthers(item);
          audio.play().catch((error) => console.error('Error playing audio:', error));
          toggleAnimation(item, true);
        }
      });
    });

    const toggleAnimation = (item, isPlaying) => {
      const content = item.querySelector('.voice-sample-item-content');
      const svg = item.querySelector('.voice-sample-svg');
      const playIcon = item.querySelector('.play-icon');
      const pauseIcon = item.querySelector('.pause-icon');

      if (isPlaying) {
        item.classList.add('voice-sample-item-active');
        // Start waveform animation
        aiVoiceSampleAnimation.startWaveform(item);
      } else {
        item.classList.remove('voice-sample-item-active');
        // Stop waveform animation
        aiVoiceSampleAnimation.stopWaveform(item);
      }

      gsap.to(content, { y: isPlaying ? -100 : 0, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(svg, { y: isPlaying ? -36 : 0, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(playIcon, { y: isPlaying ? -35 : -9, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(pauseIcon, { y: isPlaying ? 0 : 25, duration: 0.5, ease: 'power2.inOut' });
    };

    // Stop all other playing items
    const stopAllOthers = (currentItem) => {
      voiceSampleItems.forEach((item) => {
        if (item !== currentItem && item.audio && !item.audio.paused) {
          item.audio.pause();
          item.audio.currentTime = 0;
          toggleAnimation(item, false);
        }
      });
    };
  },

  initWaveform(item) {
    const svgContainer = item.querySelector('.voice-sample-waveform');

    if (!svgContainer) {
      return;
    }

    const voiceBars = svgContainer.querySelectorAll('.voice-bar');

    if (voiceBars.length === 0) {
      return;
    }

    const originalWidths = Array.from(voiceBars).map((rect) => {
      const width = Number.parseFloat(rect.getAttribute('width')) || 0;
      return width;
    });

    // Store original widths and bars for this item
    item.waveformBars = voiceBars;
    item.waveformOriginalWidths = originalWidths;
  },

  startWaveform(item) {
    if (!item.waveformBars || !item.waveformOriginalWidths) {
      return;
    }

    const voiceBars = item.waveformBars;
    const originalWidths = item.waveformOriginalWidths;
    const timelines = [];

    voiceBars.forEach((singleBar, index) => {
      const originalWidth = originalWidths[index];

      // Skip if original width is 0 or very small
      if (originalWidth <= 1) {
        return;
      }

      const isHighBar = singleBar.dataset.barType === 'high';

      const minHeight = isHighBar
        ? originalWidth * 0.2 // High bars start at 20% of original
        : originalWidth * 0.1; // Low bars start at 10% of original

      const maxHeight = originalWidth; // Never exceed original height

      // Create wave effect with staggered delays
      // Use sine wave pattern for more natural voice-like flow
      const position = index / voiceBars.length; // 0 to 1
      const sineOffset = Math.sin(position * Math.PI * 4) * 0.1; // Wave pattern
      const baseDelay = index * 0.012; // Stagger based on position
      const delay = baseDelay + sineOffset;

      // Duration varies to create natural rhythm - faster for high bars
      const duration = isHighBar
        ? 0.4 + Math.random() * 0.25 // High bars: 0.4-0.65s (faster)
        : 0.6 + Math.random() * 0.3; // Low bars: 0.6-0.9s (slower)

      // Set initial width to a random value between min and max for variety
      const initialHeight = minHeight + (maxHeight - minHeight) * (0.3 + Math.random() * 0.2);
      gsap.set(singleBar, {
        attr: { width: initialHeight },
      });

      const tl = gsap.timeline({
        repeat: -1,
        delay: delay,
      });

      tl.to(singleBar, {
        attr: { width: maxHeight },
        duration: duration,
        ease: 'sine.inOut',
      }).to(singleBar, {
        attr: { width: minHeight },
        duration: duration,
        ease: 'linear',
      });

      timelines.push(tl);
    });

    // Store timelines for this item
    item.waveformTimelines = timelines;
  },

  stopWaveform(item) {
    if (!item.waveformTimelines) {
      return;
    }

    // Kill all timelines and reset bars to original widths
    item.waveformTimelines.forEach((tl) => {
      tl.kill();
    });

    // Reset all bars to their original widths
    if (item.waveformBars && item.waveformOriginalWidths) {
      item.waveformBars.forEach((bar, index) => {
        const originalWidth = item.waveformOriginalWidths[index];
        gsap.set(bar, {
          attr: { width: originalWidth },
        });
      });
    }

    item.waveformTimelines = [];
  },
};

if (globalThis.window !== undefined) {
  aiVoiceSampleAnimation.init();
}
