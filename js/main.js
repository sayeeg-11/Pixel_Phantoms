document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderNavbar === 'function') renderNavbar(window.basePath || '');
  if (typeof renderFooter === 'function') renderFooter(window.basePath || '');

  AOS.init({
    duration: 1000,
    easing: 'ease-out',
    once: true,
    offset: 100,
  });
});
