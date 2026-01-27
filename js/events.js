/**
 * EVENTS PAGE - Main Script
 * Handles event display, filtering, pagination, registration, and view tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('events-container');
  const paginationContainer = document.getElementById('pagination-controls');

  // Pagination settings
  const EVENTS_PER_PAGE = 6;
  let currentPage = 1;
  let allEventsData = [];

  /* ================================
     VIEW COUNTER MODULE
  ================================ */
  const ViewCounter = (() => {
    const STORAGE_KEY = 'pixelphantoms_event_views';
    const DEBOUNCE_TIME = 3000; // 3 seconds
    const VIEW_INCREMENT_DELAY = 1500; // Count view after 1.5s of card visibility

    let inMemoryViewData = {};
    let localStorageAvailable = true;
    const viewTimers = new Map(); // Track timers for delayed view counting

    /**
     * Get all view data from storage (localStorage or in-memory fallback)
     */
    const getViewData = () => {
      if (!localStorageAvailable) {
        return inMemoryViewData;
      }

      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        console.warn('localStorage unavailable, using in-memory storage');
        localStorageAvailable = false;
        return inMemoryViewData;
      }
    };

    /**
     * Save view data to storage
     */
    const saveViewData = (data) => {
      if (!localStorageAvailable) {
        inMemoryViewData = data;
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Could not save to localStorage, falling back to in-memory storage');
        localStorageAvailable = false;
        inMemoryViewData = data;
      }
    };

    /**
     * Get view count for a specific event
     */
    const getViewCount = (eventId) => {
      const data = getViewData();
      return data[eventId]?.count || 0;
    };

    /**
     * Check if this event was viewed recently (within debounce time)
     */
    const isRecentView = (eventId) => {
      const data = getViewData();
      if (!data[eventId]?.lastView) return false;
      const timeSinceLastView = Date.now() - data[eventId].lastView;
      return timeSinceLastView < DEBOUNCE_TIME;
    };

    /**
     * Increment view count for an event
     */
    const incrementViewCount = (eventId) => {
      if (isRecentView(eventId)) {
        console.log('Event ' + eventId + ' was viewed recently, skipping increment');
        return getViewCount(eventId);
      }

      const data = getViewData();

      if (!data[eventId]) {
        data[eventId] = { count: 0, lastView: null };
      }

      data[eventId].count += 1;
      data[eventId].lastView = Date.now();

      saveViewData(data);
      return data[eventId].count;
    };

    /**
     * Format view count for display (123 → "123", 1234 → "1.2K")
     */
    const formatViewCount = (count) => {
      if (count < 1000) return String(count);
      if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
      return (count / 1000000).toFixed(1) + 'M';
    };

    /**
     * Update the view count display in the UI with animation
     */
    const updateViewDisplay = (eventId, count) => {
      const viewElement = document.querySelector('[data-view-for="' + eventId + '"]');
      if (viewElement) {
        const formattedCount = formatViewCount(count);
        const usesAbbreviation = formattedCount.includes('K') || formattedCount.includes('M');
        const isPlural = usesAbbreviation || count !== 1;
        viewElement.textContent = formattedCount + ' view' + (isPlural ? 's' : '');

        // Add pulse animation
        viewElement.parentElement.classList.add('view-pulse');
        setTimeout(() => {
          viewElement.parentElement.classList.remove('view-pulse');
        }, 500);
      }
    };

    /**
     * Schedule a delayed view count increment (only if user stays on card)
     */
    const scheduleViewIncrement = (eventId, cardElement) => {
      // Clear any existing timer for this event
      if (viewTimers.has(eventId)) {
        clearTimeout(viewTimers.get(eventId));
      }

      // Set new timer
      const timer = setTimeout(() => {
        const newCount = incrementViewCount(eventId);
        updateViewDisplay(eventId, newCount);
        viewTimers.delete(eventId);
      }, VIEW_INCREMENT_DELAY);

      viewTimers.set(eventId, timer);
    };

    /**
     * Cancel scheduled view increment (user left card before delay)
     */
    const cancelViewIncrement = (eventId) => {
      if (viewTimers.has(eventId)) {
        clearTimeout(viewTimers.get(eventId));
        viewTimers.delete(eventId);
      }
    };

    return {
      getViewCount,
      incrementViewCount,
      formatViewCount,
      updateViewDisplay,
      isRecentView,
      scheduleViewIncrement,
      cancelViewIncrement
    };
  })();

  /* ================================
     HELPER FUNCTIONS
  ================================ */

  /**
   * Format date string to readable format
   */
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Normalize date to midnight for comparison
   */
  const normalizeDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  /**
   * Generate stable event ID from event data
   */
  const generateEventId = (event) => {
    const base = (event.title || 'Untitled') + '|' + event.date + '|' + (event.location || '');
    // Simple hash function for consistent IDs
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      const char = base.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'event-' + Math.abs(hash);
  };

  /**
   * Determine event status based on date
   */
  const getEventStatus = (eventDate, today) => {
    if (eventDate < today) return { label: 'Ended', class: 'ended' };
    if (eventDate.getTime() === today.getTime()) return { label: 'Today', class: 'today' };
    return { label: 'Upcoming', class: 'upcoming' };
  };

  /* ================================
     EVENT CARD RENDERING
  ================================ */

  /**
   * Create and return an event card element
   */
  const createEventCard = (event, today) => {
    const eventDate = normalizeDate(event.date);
    const status = getEventStatus(eventDate, today);
    const eventId = generateEventId(event);
    const viewCount = ViewCounter.getViewCount(eventId);
    const formattedViews = ViewCounter.formatViewCount(viewCount);

    const hasValidRegistration =
      event.registrationOpen && 
      event.registrationLink && 
      event.registrationLink.trim() !== '';

    const card = document.createElement('div');
    card.className = 'event-card ' + status.class;
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-event-id', eventId);
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', 'Event: ' + (event.title || 'Untitled Event'));

    const registerButtonHTML = hasValidRegistration && eventDate >= today
      ? '<a href="' + event.registrationLink + '" target="_blank" rel="noopener noreferrer" class="btn-register btn-open-register" aria-label="Register for ' + (event.title || 'Event') + '" data-event-title="' + (event.title || 'Event').replace(/"/g, '&quot;') + '">Register Now</a>'
      : '<button class="btn-register disabled" disabled aria-disabled="true">Registration Closed</button>';

    card.innerHTML = 
      '<div class="event-card-header">' +
        '<h3 class="event-title">' + (event.title || 'Untitled Event') + '</h3>' +
        '<span class="event-status ' + status.class + '" role="status">' + status.label + '</span>' +
      '</div>' +
      '<div class="event-meta">' +
        '<div class="meta-item">' +
          '<i class="fa-solid fa-calendar-days" aria-hidden="true"></i>' +
          '<span>' + formatDate(event.date) + '</span>' +
        '</div>' +
        '<div class="meta-item">' +
          '<i class="fa-solid fa-location-dot" aria-hidden="true"></i>' +
          '<span>' + (event.location || 'To be announced') + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="event-description">' +
        (event.description || 'Event details will be updated soon.') +
      '</p>' +
      '<div class="event-footer">' +
        '<div class="event-register">' +
          registerButtonHTML +
        '</div>' +
        '<div class="event-views" role="status" aria-live="polite">' +
          '<span class="view-icon" aria-hidden="true">👁️</span>' +
          '<span class="view-count" data-view-for="' + eventId + '">' +
            formattedViews + ' view' + (viewCount !== 1 ? 's' : '') +
          '</span>' +
        '</div>' +
      '</div>';

    // Add interaction handlers for view counting
    let isHovering = false;

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      ViewCounter.scheduleViewIncrement(eventId, card);
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      ViewCounter.cancelViewIncrement(eventId);
    });

    card.addEventListener('focus', () => {
      if (!isHovering) {
        ViewCounter.scheduleViewIncrement(eventId, card);
      }
    });

    card.addEventListener('blur', () => {
      if (!isHovering) {
        ViewCounter.cancelViewIncrement(eventId);
      }
    });

    // Immediate count on click
    card.addEventListener('click', (e) => {
      // Don't count if clicking the register button
      if (!e.target.closest('.btn-register')) {
        ViewCounter.cancelViewIncrement(eventId); // Cancel scheduled increment
        const newCount = ViewCounter.incrementViewCount(eventId);
        ViewCounter.updateViewDisplay(eventId, newCount);
      }
    });

    return card;
  };

  /* ================================
     PAGINATION
  ================================ */

  /**
   * Render pagination controls
   */
  const renderPagination = (totalEvents) => {
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = 
      '<button class="pagination-btn" id="prev-page" ' + 
        (currentPage === 1 ? 'disabled' : '') + 
        ' aria-label="Previous page">' +
        '<i class="fas fa-chevron-left"></i> Previous' +
      '</button>' +
      '<span class="page-info" aria-live="polite">' +
        'Page ' + currentPage + ' of ' + totalPages +
      '</span>' +
      '<button class="pagination-btn" id="next-page" ' +
        (currentPage === totalPages ? 'disabled' : '') +
        ' aria-label="Next page">' +
        'Next <i class="fas fa-chevron-right"></i>' +
      '</button>';

    // Add event listeners
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderEventsPage();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderEventsPage();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  };

  /**
   * Render current page of events
   */
  const renderEventsPage = () => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const endIndex = startIndex + EVENTS_PER_PAGE;
    const pageEvents = allEventsData.slice(startIndex, endIndex);

    container.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    pageEvents.forEach(event => {
      const card = createEventCard(event, today);
      container.appendChild(card);
    });

    renderPagination(allEventsData.length);
  };

  /* ================================
     FETCH AND INITIALIZE EVENTS
  ================================ */

  fetch('data/events.json')
    .then(res => {
      if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
      return res.json();
    })
    .then(events => {
      if (!Array.isArray(events) || events.length === 0) {
        container.innerHTML = 
          '<div class="no-events">' +
            '<h3>No upcoming events</h3>' +
            '<p>Please check back later or propose a new event below.</p>' +
          '</div>';
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sort events: upcoming first (ascending), then past (descending)
      const upcomingEvents = events
        .filter(e => normalizeDate(e.date) >= today)
        .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

      const pastEvents = events
        .filter(e => normalizeDate(e.date) < today)
        .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date));

      allEventsData = [...upcomingEvents, ...pastEvents];

      // Start countdown if there's an upcoming event
      if (upcomingEvents.length > 0 && typeof startCountdown === 'function') {
        startCountdown(upcomingEvents[0]);
      }

      // Render first page
      renderEventsPage();
    })
    .catch(error => {
      console.error('Error loading events:', error);
      container.innerHTML = 
        '<div class="no-events error">' +
          '<h3>Error Loading Events</h3>' +
          '<p>Unable to load events. Please try refreshing the page.</p>' +
          '<p><small>' + error.message + '</small></p>' +
        '</div>';
    });

  /* ================================
     REGISTRATION MODAL
  ================================ */

  (function() {
    const modal = document.getElementById('register-modal');
    const modalTitle = document.getElementById('register-event-title');
    const registerForm = document.getElementById('register-form');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const cancelBtn = modal ? modal.querySelector('.modal-cancel') : null;

    if (!modal || !registerForm) return;

    /**
     * Open registration modal
     */
    const openModal = (title) => {
      modalTitle.textContent = title || 'Event';
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus first input
      const firstInput = registerForm.querySelector('input');
      setTimeout(() => {
        if (firstInput) firstInput.focus();
      }, 100);
    };

    /**
     * Close registration modal
     */
    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      registerForm.reset();

      // Clear validation states
      const inputs = registerForm.querySelectorAll('input');
      inputs.forEach(input => {
        const inputGroup = input.closest('.input-group');
        if (inputGroup) {
          inputGroup.classList.remove('valid', 'invalid');
        }
      });
    };

    // Event delegation for dynamic register buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-open-register');
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.eventTitle);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });

    /**
     * Input validation with visual feedback
     */
    const inputs = registerForm ? registerForm.querySelectorAll('input') : [];
    inputs.forEach(input => {
      const inputGroup = input.closest('.input-group');

      const validate = () => {
        if (input.value.trim() !== '') {
          if (input.checkValidity()) {
            if (inputGroup) {
              inputGroup.classList.remove('invalid');
              inputGroup.classList.add('valid');
            }
          } else {
            if (inputGroup) {
              inputGroup.classList.remove('valid');
              inputGroup.classList.add('invalid');
            }
          }
        } else {
          if (inputGroup) {
            inputGroup.classList.remove('valid', 'invalid');
          }
        }
      };

      input.addEventListener('input', validate);
      input.addEventListener('blur', validate);

      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        if (inputGroup) {
          inputGroup.classList.add('invalid');
        }
      });
    });

    /**
     * Form submission handler
     */
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        inputs.forEach(input => {
          const inputGroup = input.closest('.input-group');
          if (!input.checkValidity()) {
            if (inputGroup) {
              inputGroup.classList.add('invalid');
            }
            isValid = false;
          } else {
            if (inputGroup) {
              inputGroup.classList.add('valid');
            }
          }
        });

        if (!isValid) {
          // Focus first invalid input
          const firstInvalid = registerForm.querySelector('.input-group.invalid input');
          if (firstInvalid) {
            firstInvalid.focus();
          }
          return;
        }

        // Show success message
        showToast('✓ Successfully registered! Check your email for confirmation.', 'success');

        // Close modal and reset
        setTimeout(() => {
          closeModal();
        }, 1000);
      });
    }
  })();

  /* ================================
     TOAST NOTIFICATION
  ================================ */

  /**
   * Show toast notification
   */
  const showToast = (message, type) => {
    type = type || 'info';
    let toast = document.getElementById('toast-notification');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = type; // 'success', 'error', 'info'
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // Expose showToast globally for other scripts
  window.showToast = showToast;
});