// abhishekkumar177/pixel_phantoms/Pixel_Phantoms-main/js/theme.js

document.addEventListener('DOMContentLoaded', function () {
  const themeSwitch = document.getElementById('theme-switch');
  const bodyElement = document.body;

  // 1. Check for saved preference or system default
  const savedTheme = localStorage.getItem('theme') || 'dark';

  // 2. Apply theme to body for full-page effect
  applyTheme(savedTheme);

  // 3. Sync the toggle switch UI
  if (themeSwitch) {
    themeSwitch.checked = savedTheme === 'light';

    themeSwitch.addEventListener('change', function () {
      const newTheme = this.checked ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      bodyElement.classList.add('light-mode');
      bodyElement.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      bodyElement.classList.add('dark-mode');
      bodyElement.classList.remove('light-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
});
