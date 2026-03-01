/* ============================
   MAIN.JS - GLOBAL SCRIPTS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================
     GLOBAL LOADER
     ============================ */
  const loader = document.getElementById('global-loader');

  const showLoader = () => {
    if (loader) loader.classList.remove('hidden');
  };

  const hideLoader = () => {
    if (loader) loader.classList.add('hidden');
  };

  // Hide loader after page fully loads
  window.addEventListener('load', hideLoader);

  /* ============================
     SERVICE WORKER REGISTRATION
     ============================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Improved path handling for subdirectories (e.g. GitHub Pages)
      const swPath = window.location.pathname.includes('/Pixel_Phantoms/')
        ? '/Pixel_Phantoms/sw.js'
        : '/sw.js';

      navigator.serviceWorker
        .register(swPath)
        .then(registration => {
          console.log('SW registered: ', registration.scope);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // ✅ Initialize SPA Router
  if (window.PageTransitions) {
    PageTransitions.init();
  }
});
