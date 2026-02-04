/**
 * CPDSA Resources Panel Toggle
 * Manages the display of competitive programming and data structures resources
 */

document.addEventListener('DOMContentLoaded', function () {
  const resourcesToggleBtn = document.getElementById('resources-toggle-btn');
  const closeResourcesBtn = document.getElementById('close-resources-btn');
  const resourcesPanel = document.getElementById('cpdsa-resources');

  if (!resourcesToggleBtn || !resourcesPanel) {
    console.warn('Resources panel elements not found');
    return;
  }

  /**
   * Toggle resources panel visibility
   */
  function toggleResourcesPanel() {
    const isHidden = resourcesPanel.hasAttribute('hidden');

    if (isHidden) {
      // Show panel
      resourcesPanel.removeAttribute('hidden');
      resourcesToggleBtn.classList.add('active');
      resourcesToggleBtn.setAttribute('aria-expanded', 'true');

      // Add animation class
      resourcesPanel.classList.add('show');

      // Focus management for accessibility
      closeResourcesBtn.focus();
    } else {
      // Hide panel
      resourcesPanel.setAttribute('hidden', '');
      resourcesToggleBtn.classList.remove('active');
      resourcesToggleBtn.setAttribute('aria-expanded', 'false');

      // Remove animation class
      resourcesPanel.classList.remove('show');

      // Return focus to toggle button
      resourcesToggleBtn.focus();
    }
  }

  /**
   * Close resources panel
   */
  function closeResourcesPanel() {
    if (!resourcesPanel.hasAttribute('hidden')) {
      resourcesToggleBtn.classList.remove('active');
      resourcesToggleBtn.setAttribute('aria-expanded', 'false');
      resourcesPanel.setAttribute('hidden', '');
      resourcesPanel.classList.remove('show');
      resourcesToggleBtn.focus();
    }
  }

  // Event listeners
  resourcesToggleBtn.addEventListener('click', toggleResourcesPanel);
  closeResourcesBtn.addEventListener('click', closeResourcesPanel);

  // Close panel when pressing Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !resourcesPanel.hasAttribute('hidden')) {
      closeResourcesPanel();
    }
  });

  // Close panel when clicking outside
  document.addEventListener('click', function (event) {
    const isFocusArea = document.querySelector('.focus-areas');
    const isClickInResources = resourcesPanel.contains(event.target);
    const isClickOnToggle = resourcesToggleBtn.contains(event.target);

    if (!isClickInResources && !isClickOnToggle && !resourcesPanel.hasAttribute('hidden')) {
      // Only close if click is outside the entire focus areas section
      if (isFocusArea && !isFocusArea.contains(event.target)) {
        closeResourcesPanel();
      }
    }
  });

  // Add smooth scroll to resources when opened
  resourcesToggleBtn.addEventListener('click', function () {
    setTimeout(() => {
      if (!resourcesPanel.hasAttribute('hidden')) {
        resourcesPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  });

  // Track resource link clicks for analytics (optional)
  const resourceLinks = document.querySelectorAll('.resource-link');
  resourceLinks.forEach(link => {
    link.addEventListener('click', function () {
      const resourceName = this.querySelector('span')?.textContent || 'Unknown';
      console.log('Resource accessed:', resourceName);
      // You can add analytics tracking here if needed
    });
  });
});
