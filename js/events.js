document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('events-container');

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
    d.setHours(0, 0, 0, 0);
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

      const upcomingEvents = events
        .filter(e => normalizeDate(e.date) >= today)
        .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

      const pastEvents = events
        .filter(e => normalizeDate(e.date) < today)
        .sort((a, b) => normalizeDate(b.date) - normalizeDate(a.date));

      if (upcomingEvents.length > 0 && typeof startCountdown === 'function') {
        startCountdown(upcomingEvents[0]);
      }

      container.innerHTML = '';
      const allEvents = [...upcomingEvents, ...pastEvents];

      allEvents.forEach(event => {
        const hasValidRegistration =
          event.registrationOpen && event.registrationLink && event.registrationLink.trim() !== '';

        const eventDate = normalizeDate(event.date);

        let computedStatus = 'Upcoming';
        if (eventDate < today) computedStatus = 'Ended';
        else if (eventDate.getTime() === today.getTime()) computedStatus = 'Today';

        const statusClass = computedStatus.toLowerCase();

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
              <i class="fa-solid fa-calendar-days"></i>
              <span>${formatDate(event.date)}</span>
            </div>
            <div class="meta-item">
              <i class="fa-solid fa-location-dot"></i>
              <span>${event.location || 'To be announced'}</span>
            </div>
          </div>

          <p class="event-description">
            ${event.description || 'Event details will be updated soon.'}
          </p>

          <div class="event-register">
            ${
              hasValidRegistration && eventDate >= today
                ? `<a href="${event.registrationLink}" target="_blank"
                     class="btn-register btn-open-register"
                     data-event-title="${(event.title || 'Event').replace(/"/g, '&quot;')}">
                     Register Now
                   </a>`
                : `<button class="btn-register disabled" disabled>
                     Registration Closed
                   </button>`
            }
          </div>
        `;

        container.appendChild(card);
      });
    });

  /* ---------- Registration Modal Logic ---------- */
  (() => {
    const modal = document.getElementById('register-modal');
    const modalTitle = document.getElementById('register-event-title');
    const registerForm = document.getElementById('register-form');
    const closeBtn = modal?.querySelector('.modal-close');
    const cancelBtn = modal?.querySelector('.modal-cancel');

    const openModal = title => {
      modalTitle.textContent = title || 'Event';
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-open-register');
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.eventTitle);
      }
    });

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });

    // Add input validation feedback
    const inputs = registerForm?.querySelectorAll('input');
    inputs?.forEach(input => {
      const validate = () => {
        if (input.value.trim() !== '') {
          if (input.checkValidity()) {
            input.classList.remove('invalid');
            input.classList.add('valid');
          } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
          }
        } else {
          input.classList.remove('valid', 'invalid');
        }
      };

      input.addEventListener('input', validate);
      input.addEventListener('blur', validate);
      
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.classList.add('invalid');
      });
    });

    registerForm?.addEventListener('submit', e => {
      e.preventDefault();

      const inputs = registerForm?.querySelectorAll('input');
      let isValid = true;
      inputs?.forEach(input => {
        if (!input.checkValidity()) {
          input.classList.add('invalid');
          isValid = false;
        } else {
          input.classList.add('valid');
        }
      });

      if (!isValid) return;

      alert('Successfully registered!');
      registerForm.reset();
      inputs?.forEach(input => input.classList.remove('valid', 'invalid'));
      closeModal();
    });
  })();
});
