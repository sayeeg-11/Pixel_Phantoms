/**
 * Provides smooth scrolling to top and bottom of page
 * with smart visibility logic and accessibility support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Create scroll to top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.className = 'scroll-button';
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.setAttribute('aria-label', 'Scroll to top');
  backToTopBtn.setAttribute('title', 'Scroll to top');
  document.body.appendChild(backToTopBtn);

  // Create scroll to bottom button
  const scrollToBottomBtn = document.createElement('button');
  scrollToBottomBtn.id = 'scroll-to-bottom';
  scrollToBottomBtn.className = 'scroll-button';
  scrollToBottomBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
  scrollToBottomBtn.setAttribute('aria-label', 'Scroll to bottom');
  scrollToBottomBtn.setAttribute('title', 'Scroll to bottom');
  document.body.appendChild(scrollToBottomBtn);

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isAtTop() {
    return window.scrollY < 200;
  }

  function isAtBottom() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    return scrollHeight - scrollTop - clientHeight < 200;
  }

  function isPageScrollable() {
    return document.documentElement.scrollHeight > window.innerHeight + 100;
  }

  function toggleButtonVisibility() {
    // Don't show buttons if page is not scrollable
    if (!isPageScrollable()) {
      backToTopBtn.classList.remove('visible');
      scrollToBottomBtn.classList.remove('visible');
      return;
    }

    // Smart visibility logic
    if (isAtTop()) {
      // At top: hide top button, show bottom button
      backToTopBtn.classList.remove('visible');
      scrollToBottomBtn.classList.add('visible');
    } else if (isAtBottom()) {
      // At bottom: show top button, hide bottom button
      backToTopBtn.classList.add('visible');
      scrollToBottomBtn.classList.remove('visible');
    } else {
      // In middle: show both buttons
      backToTopBtn.classList.add('visible');
      scrollToBottomBtn.classList.add('visible');
    }
  }

  function scrollToTop() {
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Scroll to bottom of page
   */
  function scrollToBottom() {
    const scrollHeight = document.documentElement.scrollHeight;
    const targetPosition = scrollHeight - window.innerHeight;

    if (prefersReducedMotion) {
      window.scrollTo(0, targetPosition);
    } else {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  }

  // Initial check
  toggleButtonVisibility();

  // Listen for scroll events (with throttling for performance)
  let scrollTimeout;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(() => {
        toggleButtonVisibility();
      });
    },
    { passive: true }
  );

  // Listen for resize events (page height might change)
  let resizeTimeout;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        toggleButtonVisibility();
      }, 150);
    },
    { passive: true }
  );

  // Button click handlers
  backToTopBtn.addEventListener('click', scrollToTop);
  scrollToBottomBtn.addEventListener('click', scrollToBottom);

  // Keyboard support - additional Enter/Space key handling
  [backToTopBtn, scrollToBottomBtn].forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Handle dynamic content changes (e.g., lazy loading)
  // Observe DOM changes that might affect page height
  const observer = new MutationObserver(() => {
    toggleButtonVisibility();
  });

  // Start observing the document with configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Listen for orientation changes on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(toggleButtonVisibility, 200);
  });
});
