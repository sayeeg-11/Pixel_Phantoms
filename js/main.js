

document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderNavbar === 'function') renderNavbar(window.basePath || '');
    if (typeof renderFooter === 'function') renderFooter(window.basePath || '');

    AOS.init({
        duration: 1000,
        easing: 'ease-out',
        once: true,
        offset: 100
    });

    // Initialize page transitions (non-blocking; safe fallback when script is absent)
    if (typeof PageTransitions !== 'undefined') {
        try {
            PageTransitions.init({
                duration: 300,
                type: 'fade-slide',
                scrollToTop: true,
                showLoadingIndicator: true,
                loadingThreshold: 500
            });
            console.info('[main.js] PageTransitions initialized');
        } catch (e) {
            console.warn('[main.js] Failed to initialize PageTransitions:', e);
        }
    }
    const loader = document.getElementById("global-loader");

  const showLoader = () => {
    if (loader) loader.classList.remove("hidden");
  };

  const hideLoader = () => {
    if (loader) loader.classList.add("hidden");
  };

  // hide loader after full load
  window.addEventListener("load", hideLoader);

  // show loader when clicking internal links
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#")) return; // ignore anchors
      if (href.startsWith("http") || href.startsWith("mailto:")) return; // ignore external
      if (href.startsWith("tel:")) return;

      showLoader();
    });
  });

});
