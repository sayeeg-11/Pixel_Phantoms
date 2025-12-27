/**
 * Custom Cursor Effect - Site-wide Implementation
 * Provides a smooth glowing cursor follow effect on desktop devices
 *
 * Features:
 * - Auto-initializes on DOMContentLoaded
 * - Auto-creates cursor element if missing
 * - Works without GSAP (uses native requestAnimationFrame)
 * - Respects touch devices (auto-hides)
 * - Performance optimized with RAF
 * - Singleton pattern (prevents duplicates)
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.cursorEffectInitialized) {
    return;
  }
  window.cursorEffectInitialized = true;

  /**
   * Initialize cursor effect on page load
   */
  function initCursorEffect() {
    // Only run on desktop devices with fine pointer (mouse)
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    // Check if we're on a mobile viewport
    if (window.innerWidth <= 768) {
      return;
    }

    // Get or create cursor element
    let cursor = document.getElementById('cursor-highlight');

    if (!cursor) {
      // Auto-create cursor element if it doesn't exist
      cursor = document.createElement('div');
      cursor.id = 'cursor-highlight';
      document.body.appendChild(cursor);
    }

    // Current cursor position
    let mouseX = 0;
    let mouseY = 0;

    // Current cursor element position
    let cursorX = 0;
    let cursorY = 0;

    // Animation speed (lower = smoother but slower)
    const speed = 0.15;

    /**
     * Update mouse position on mousemove
     */
    function updateMousePosition(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    /**
     * Animate cursor to follow mouse smoothly
     */
    function animateCursor() {
      // Calculate distance to move
      const distX = mouseX - cursorX;
      const distY = mouseY - cursorY;

      // Apply easing
      cursorX += distX * speed;
      cursorY += distY * speed;

      // Update cursor position
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

      // Continue animation loop
      requestAnimationFrame(animateCursor);
    }

    // Start listening to mouse movement
    document.addEventListener('mousemove', updateMousePosition, { passive: true });

    // Start animation loop
    requestAnimationFrame(animateCursor);

    // Handle window resize (hide on mobile if resized)
    let resizeTimeout;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (window.innerWidth <= 768) {
            cursor.style.display = 'none';
          } else if (window.matchMedia('(pointer: fine)').matches) {
            cursor.style.display = 'block';
          }
        }, 150);
      },
      { passive: true }
    );

    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cursor.style.opacity = '0';
      } else {
        cursor.style.opacity = '';
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorEffect);
  } else {
    // DOM already loaded
    initCursorEffect();
  }
})();
