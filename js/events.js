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
    const modal = document.getElementById('register-modal');
    const modalTitle = document.getElementById('register-event-title');
    const registerForm = document.getElementById('register-form');
    const closeBtn = modal && modal.querySelector('.modal-close');
    const cancelBtn = modal && modal.querySelector('.modal-cancel');

    function openRegisterModal(title) {
      if (!modal) return;
      modalTitle.textContent = title || 'Event';
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeRegisterModal() {
      if (!modal) return;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('.btn-open-register');
      if (btn) {
        e.preventDefault();
        openRegisterModal(btn.dataset.eventTitle || 'Event');
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
  })();
});
