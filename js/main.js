

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
});