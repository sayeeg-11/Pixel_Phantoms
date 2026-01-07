document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('events-container');

  if (!container) {
    console.error('Events container not found');
    return;
  }

  fetch('data/events.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(events => {
      if (!events || events.length === 0) {
        container.innerHTML = `
      <div class="no-events">
        <h3>No upcoming events</h3>
        <p>Please check back soon or propose a new event.</p>
      </div>
    `;
        return;
      }

      const upcomingEvents = events
        .filter(e => new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (upcomingEvents.length > 0) {
        startCountdown(upcomingEvents[0]);
      }

      container.innerHTML = '';

      events.forEach(event => {
        const hasValidRegistration =
          event.registrationOpen && event.registrationLink && event.registrationLink.trim() !== '';

        const card = document.createElement('div');
        card.className = 'event-card';

        card.innerHTML = `
  <div class="event-header">
    <h3>${event.title}</h3>
  </div>

  <div class="event-meta">
    <p><strong>Date:</strong> ${event.date}</p>
    <p><strong>Location:</strong> ${event.location}</p>
    <p><strong>Status:</strong> ${event.status}</p>
  </div>

  <p class="event-desc">${event.description}</p>

  <div class="event-register">
    ${
      hasValidRegistration
        ? `<button class="btn-register btn-open-register" data-event-title="${(event.title || 'Event').replace(/"/g, '&quot;')}">Register</button>`
        : `<button class="btn-register disabled" disabled>
              Registration Closed
           </button>`
    }
  </div>
  /* ---------- Helpers ---------- */
  const formatDate = dateStr => {
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

  const normalizeDate = dateStr => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0); // Normalize to midnight
    return d;
  };

  /* ---------- Fetch Events ---------- */
  fetch('data/events.json')
    .then(res => res.json())
    .then(events => {
      if (!Array.isArray(events) || events.length === 0) {
        container.innerHTML = `
          <div class="no-events">
            <h3>No upcoming events</h3>
            <p>Please check back later or propose a new event.</p>
          </div>
        `;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Separate upcoming and past events
      const upcomingEvents = events
        .filter(e => normalizeDate(e.date) >= today)
        .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

      const pastEvents = events
        .filter(e => normalizeDate(e.date) < today)
        .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date)); // newest first

      // Show countdown for the next upcoming event
      if (upcomingEvents.length > 0 && typeof startCountdown === 'function') {
        startCountdown(upcomingEvents[0]);
      }

      container.innerHTML = '';

      // Combine upcoming first, then past events
      const allEvents = [...upcomingEvents, ...pastEvents];

      /* ---------- Render Event Cards ---------- */
      allEvents.forEach(event => {
        const hasValidRegistration =
          event.registrationOpen && event.registrationLink && event.registrationLink.trim() !== '';

        const eventDate = normalizeDate(event.date);

        // Determine status
        let computedStatus = 'Upcoming';
        if (eventDate < today) computedStatus = 'Ended';
        else if (eventDate.getTime() === today.getTime()) computedStatus = 'Today';

        const statusClass = computedStatus.toLowerCase(); // upcoming, today, ended

        const card = document.createElement('article');
        card.className = `event-card ${statusClass}`;
        card.setAttribute('tabindex', '0');

        card.innerHTML = `
          <div class="event-card-header">
            <h3 class="event-title">${event.title || 'Untitled Event'}</h3>
            <span class="event-status ${statusClass}">
              ${computedStatus}
            </span>
          </div>

          <div class="event-meta">
            <div class="meta-item">
              <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
              <span>${formatDate(event.date)}</span>
            </div>
            <div class="meta-item">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <span>${event.location || 'To be announced'}</span>
            </div>
            ${
              event.organizer
                ? `<div class="meta-item">
                     <i class="fa-solid fa-user" aria-hidden="true"></i>
                     <span>${event.organizer}</span>
                   </div>`
                : ''
            }
          </div>

          <p class="event-description">
            ${event.description || 'Event details will be updated soon.'}
          </p>

          <div class="event-register">
            ${
              hasValidRegistration && eventDate >= today
                ? `<a href="${event.registrationLink}" target="_blank" 
                     class="btn-register btn-open-register"
                     aria-label="Register for ${event.title || 'Event'}"
                     data-event-title="${(event.title || 'Event').replace(/"/g, '&quot;')}">
                     Register Now
                   </a>`
                : `<button class="btn-register disabled" disabled aria-disabled="true">
                     Registration Closed
                   </button>`
            }
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading events:', error);
      const errorMessage = error.message.includes('HTTP')
        ? 'Failed to load events. Please check your connection.'
        : 'No events data available.';
      if (container) {
        container.innerHTML = `<div class="no-events"><h3>Error</h3><p>${errorMessage}</p></div>`;
      }
    });

  // --- Registration modal behavior ---
  (function () {
    .catch(err => {
      console.error('Error loading events:', err);
      container.innerHTML = `
        <div class="no-events error">
          <h3>Something went wrong</h3>
          <p>Unable to load events. Please try again later.</p>
        </div>
      `;
    });

  /* ---------- Registration Modal Logic ---------- */
  (() => {
    const modal = document.getElementById('register-modal');
    const modalTitle = document.getElementById('register-event-title');
    const registerForm = document.getElementById('register-form');
    const closeBtn = modal?.querySelector('.modal-close');
    const cancelBtn = modal?.querySelector('.modal-cancel');

    function openRegisterModal(title) {
    const openModal = title => {
      if (!modal) return;
      modalTitle.textContent = title || 'Event';
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    function closeRegisterModal() {
    const closeModal = () => {
      if (!modal) return;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('.btn-open-register');
      const btn = e.target.closest('.btn-open-register');
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.eventTitle);
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeRegisterModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeRegisterModal);

    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeRegisterModal();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', e => {
        e.preventDefault();
        // Basic client-side validation already done via required attributes
        // TODO: send data to server if needed
        alert('Registered');
        registerForm.reset();
        closeRegisterModal();
      });
    }
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    registerForm?.addEventListener('submit', e => {
      e.preventDefault();
      alert('Successfully registered!');
      registerForm.reset();
      closeModal();
    });
  })();
});
