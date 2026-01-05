document.addEventListener('DOMContentLoaded', () => {
  initDate();
  // Use the optimized scroll reveal function
  initScrollReveal();
});

// =======================================================
// 1. Set Current Date dynamically (Optimized)
// =======================================================
function initDate() {
  // 1. Minor Optimization: Combine element retrieval and check
  const dateElement = document.getElementById('current-date');

  if (dateElement) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Cleaned up slightly by creating the date object inline
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// =======================================================
// 2. Scroll Reveal Animation (Optimized with Throttling)
// =======================================================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  // Pre-calculate windowHeight outside the scroll loop
  const windowHeight = window.innerHeight;
  const elementVisible = 100;

  // Throttling variables
  const THROTTLE_DELAY = 150; // Execute at most every 150ms
  let isThrottled = false;

  // Core logic: checks and applies the 'active' class
  const revealOnScroll = () => {
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;

      // Optimization: Only check/add if the element hasn't been revealed yet
      if (!reveal.classList.contains('active') && elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };

  // Throttled function that limits how often revealOnScroll can be called
  const throttledScroll = () => {
    if (!isThrottled) {
      isThrottled = true;

      // 2. Performance Improvement: Use requestAnimationFrame for smoother rendering
      window.requestAnimationFrame(() => {
        revealOnScroll();

        // Reset the throttle flag after the delay
        setTimeout(() => {
          isThrottled = false;
        }, THROTTLE_DELAY);
      });
    }
  };

  // Initial check (non-throttled)
  revealOnScroll();

  // Listen to scroll using the throttled function
  window.addEventListener('scroll', throttledScroll);

  // Listen to resize to update windowHeight and re-check reveals
  window.addEventListener('resize', throttledScroll);
}
