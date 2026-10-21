/* =========================
 Force Theme Switcher utility js  
=========================== */

const forceThemeSwitcher = {
  init() {
    const html = document.documentElement;
    const forced = html.dataset.forceTheme;

    if (forced) {
      html.classList.remove('dark', 'light');
      html.classList.add(forced);
      return;
    }

    const stored = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');

    html.classList.remove('dark', 'light');
    html.classList.add(theme);
  },
};

if (typeof window !== 'undefined') {
  forceThemeSwitcher.init();
}
