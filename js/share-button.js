// ====================================================
// SHARE BUTTON - Updated with Scroll Behavior
// ====================================================

// Create and initialize share button
document.addEventListener('DOMContentLoaded', function () {
  // Don't initialize on login page (optional)
  if (window.location.pathname.includes('login.html')) {
    return;
  }

  // Create share button container
  const shareContainer = document.createElement('div');
  shareContainer.className = 'share-button-container';
  shareContainer.id = 'share-button-container';

  // Create main share button
  const shareButton = document.createElement('button');
  shareButton.className = 'share-button-main';
  shareButton.id = 'share-button-main';
  shareButton.setAttribute('aria-label', 'Share this page');
  shareButton.setAttribute('title', 'Share this page');

  // Add share icon
  const shareIcon = document.createElement('i');
  shareIcon.className = 'fas fa-share-alt share-icon';
  shareButton.appendChild(shareIcon);

  // Create share options panel
  const shareOptions = createShareOptionsPanel();

  // Append elements
  shareContainer.appendChild(shareButton);
  shareContainer.appendChild(shareOptions);
  document.body.appendChild(shareContainer);

  // Initialize functionality
  initializeShareButton();

  // Add scroll behavior - UPDATED
  initializeScrollBehavior();

  // Add keyboard shortcut
  initializeKeyboardShortcut();
});

function createShareOptionsPanel() {
  const shareOptions = document.createElement('div');
  shareOptions.className = 'share-options';
  shareOptions.id = 'share-options';

  const pageTitle = document.title || 'Pixel Phantoms';
  const pageUrl = window.location.href;

  shareOptions.innerHTML = `
        <div class="share-options-header">
            <h4>Share this page</h4>
            <button class="close-share-options" aria-label="Close share options">×</button>
        </div>
        
        <div class="copy-link-input">
            <input type="text" value="${pageUrl}" id="share-url-input" readonly>
            <button id="copy-url-btn">Copy</button>
        </div>
        
        <div class="share-options-list">
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}" 
       class="share-option twitter" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-twitter"></i>
        <span>Share on Twitter</span>
    </a>
    
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}" 
       class="share-option linkedin" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-linkedin"></i>
        <span>Share on LinkedIn</span>
    </a>
    
    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' ' + pageUrl)}" 
       class="share-option whatsapp" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-whatsapp"></i>
        <span>Share on WhatsApp</span>
    </a>

    <!-- NEW: Telegram -->
    <a href="https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}" 
       class="share-option telegram" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-telegram"></i>
        <span>Share on Telegram</span>
    </a>

    <!-- NEW: Reddit -->
    <a href="https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}" 
       class="share-option reddit" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-reddit"></i>
        <span>Share on Reddit</span>
    </a>

    <!-- NEW: Discord (fallback invite/share link) -->
    <a href="https://discord.com/channels/@me" 
       class="share-option discord" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-discord"></i>
        <span>Share on Discord</span>
    </a>
    
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" 
       class="share-option facebook" 
       target="_blank"
       rel="noopener noreferrer">
        <i class="fab fa-facebook"></i>
        <span>Share on Facebook</span>
    </a>
    
    <a href="mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent('Check this out: ' + pageUrl)}" 
       class="share-option email">
        <i class="fas fa-envelope"></i>
        <span>Share via Email</span>
    </a>
</div>

    `;

  return shareOptions;
}

/**
 * Initialize share button functionality
 */
function initializeShareButton() {
  const shareButton = document.getElementById('share-button-main');
  const shareOptions = document.getElementById('share-options');
  const closeButton = document.querySelector('.close-share-options');
  const copyUrlBtn = document.getElementById('copy-url-btn');
  const shareUrlInput = document.getElementById('share-url-input');

  if (!shareButton || !shareOptions) return;

  // Toggle share options
  shareButton.addEventListener('click', function (e) {
    e.stopPropagation();
    shareOptions.classList.toggle('active');

    if (shareOptions.classList.contains('active')) {
      // Update URL in case page changed
      const shareUrlInput = document.getElementById('share-url-input');
      if (shareUrlInput) {
        shareUrlInput.value = window.location.href;
      }
    }
  });

  // Close share options when clicking close button
  if (closeButton) {
    closeButton.addEventListener('click', function (e) {
      e.stopPropagation();
      shareOptions.classList.remove('active');
    });
  }

  // Copy URL functionality
  if (copyUrlBtn && shareUrlInput) {
    copyUrlBtn.addEventListener('click', function () {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999); // For mobile

      try {
        navigator.clipboard
          .writeText(shareUrlInput.value)
          .then(() => {
            showShareNotification('Link copied to clipboard!', 'success');
            copyUrlBtn.textContent = 'Copied!';
            copyUrlBtn.style.background = '#00ff88';

            setTimeout(() => {
              copyUrlBtn.textContent = 'Copy';
              copyUrlBtn.style.background = '';
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            document.execCommand('copy');
            showShareNotification('Link copied!', 'success');
          });
      } catch (err) {
        console.error('Clipboard error:', err);
        showShareNotification('Failed to copy link', 'error');
      }
    });
  }

  // Close share options when clicking outside
  document.addEventListener('click', function (e) {
    if (!shareOptions.contains(e.target) && !shareButton.contains(e.target)) {
      shareOptions.classList.remove('active');
    }
  });

  // Handle share option clicks (for analytics or tracking)
  document.querySelectorAll('.share-option').forEach(option => {
    option.addEventListener('click', function (e) {
      const platform = this.classList.contains('twitter')
        ? 'Twitter'
        : this.classList.contains('linkedin')
          ? 'LinkedIn'
          : this.classList.contains('whatsapp')
            ? 'WhatsApp'
            : this.classList.contains('facebook')
              ? 'Facebook'
              : 'Email';

      // You could add analytics here
      console.log(`Shared via ${platform}`);

      // Close options after clicking (except for email which opens mail client)
      if (!this.classList.contains('email')) {
        shareOptions.classList.remove('active');
      }

      // Optional: Track in localStorage
      trackShareEvent(platform);
    });
  });

  // Handle input click to select all
  if (shareUrlInput) {
    shareUrlInput.addEventListener('click', function () {
      this.select();
    });
  }
}

/**
 * UPDATED: Initialize scroll behavior with coordination
 */
function initializeScrollBehavior() {
  const shareContainer = document.getElementById('share-button-container');
  const backToTop = document.getElementById('back-to-top');
  const feedbackWidget = document.getElementById('feedback-widget');

  if (!shareContainer) return;

  const scrollThreshold = 300; // Show back-to-top after 300px scroll
  let lastScrollTop = 0;
  let ticking = false;

  function updateScrollState() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      // User has scrolled down - Rearrange buttons
      shareContainer.classList.add('scrolled');
      if (backToTop) backToTop.classList.add('visible');
      if (feedbackWidget) feedbackWidget.classList.add('scrolled');

      // Remove hide on scroll down behavior
      shareContainer.style.transform = '';
      shareContainer.style.opacity = '';
    } else {
      // User is at top - Reset to original positions
      shareContainer.classList.remove('scrolled');
      if (backToTop) backToTop.classList.remove('visible');
      if (feedbackWidget) feedbackWidget.classList.remove('scrolled');

      shareContainer.style.transform = '';
      shareContainer.style.opacity = '';
    }

    lastScrollTop = scrollTop;
    ticking = false;
  }

  // Throttle scroll events for better performance
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  });

  // Initial check
  updateScrollState();
}

function initializeKeyboardShortcut() {
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Shift + S to open share options
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();

      const shareButton = document.getElementById('share-button-main');
      const shareOptions = document.getElementById('share-options');

      if (shareButton && shareOptions) {
        shareOptions.classList.add('active');
        showShareNotification('Share panel opened (Ctrl+Shift+S)', 'success');
      }
    }

    // Escape to close share options
    if (e.key === 'Escape') {
      const shareOptions = document.getElementById('share-options');
      if (shareOptions && shareOptions.classList.contains('active')) {
        shareOptions.classList.remove('active');
      }
    }
  });
}

function showShareNotification(message, type = 'success') {
  // Remove existing notification
  const existingNotification = document.querySelector('.share-notification');
  if (existingNotification) {
    existingNotification.classList.add('hidden');
    setTimeout(() => {
      if (existingNotification.parentNode) {
        existingNotification.remove();
      }
    }, 400);
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = `share-notification ${type}`;

  const icon = type === 'success' ? '✓' : '✗';
  const title = type === 'success' ? 'Success' : 'Error';

  notification.innerHTML = `
        <i>${icon}</i>
        <div class="share-notification-content">
            <h5>${title}</h5>
            <p>${message}</p>
        </div>
        <button class="close-notification" aria-label="Close notification">×</button>
    `;

  document.body.appendChild(notification);

  // Add close functionality
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      notification.classList.add('hidden');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    });
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('hidden');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }
  }, 4000);
}

function trackShareEvent(platform) {
  try {
    const shareData = JSON.parse(localStorage.getItem('pixelPhantoms_shares') || '[]');
    shareData.push({
      platform: platform,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 shares
    if (shareData.length > 50) {
      shareData.shift();
    }

    localStorage.setItem('pixelPhantoms_shares', JSON.stringify(shareData));
  } catch (err) {
    console.error('Failed to track share:', err);
  }
}

function getShareStats() {
  try {
    const shareData = JSON.parse(localStorage.getItem('pixelPhantoms_shares') || '[]');
    const stats = {
      total: shareData.length,
      byPlatform: {},
      recent: shareData.slice(-5).reverse(),
    };

    // Count by platform
    shareData.forEach(share => {
      stats.byPlatform[share.platform] = (stats.byPlatform[share.platform] || 0) + 1;
    });

    return stats;
  } catch (err) {
    console.error('Failed to get share stats:', err);
    return { total: 0, byPlatform: {}, recent: [] };
  }
}

// Export functions for global access
window.shareButton = {
  showNotification: showShareNotification,
  getStats: getShareStats,
  trackEvent: trackShareEvent,
};
