(function () {
  const widget = document.getElementById('feedback-widget');
  if (!widget) return;
  const toggle = document.getElementById('feedback-toggle');
  const panel = document.getElementById('feedback-panel');
  const closeBtn = panel.querySelector('.ff-close');
  const dismissBtn = document.getElementById('ff-dismiss');
  const form = document.getElementById('feedback-form');
  const statusEl = document.getElementById('ff-status');
  const stars = document.querySelectorAll('#star-rating .star');
  const SUBMITTED_KEY = 'pixelph_feedback_submitted_v1';
  const DISMISS_KEY = 'pixelph_feedback_dismissed_v1';

  if (localStorage.getItem(DISMISS_KEY) === 'true') {
    widget.style.display = 'none';
  }

  const submitBtn = form.querySelector('button[type="submit"]');

  // On page load, check if feedback already submitted
  if (localStorage.getItem(SUBMITTED_KEY) === 'true') {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Completed ✓';
  }

  function openWidget() {
    widget.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.focus();
    document.addEventListener('keydown', onDocumentKeyDown);
  }
  function closeWidget() {
    widget.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
    document.removeEventListener('keydown', onDocumentKeyDown);
  }
  function onDocumentKeyDown(e) {
    if (e.key === 'Escape') closeWidget();
  }

  toggle.addEventListener('click', () => {
    if (widget.classList.contains('open')) closeWidget();
    else openWidget();
  });
  closeBtn.addEventListener('click', closeWidget);

  dismissBtn.addEventListener('click', () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    widget.style.display = 'none';
  });

  let selectedRating = 0;
  stars.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.value, 10);
      updateStars(selectedRating);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectedRating = parseInt(btn.dataset.value, 10);
        updateStars(selectedRating);
      }
    });
  });

  function updateStars(value) {
    stars.forEach(s => {
      const v = parseInt(s.dataset.value, 10);
      if (v <= value) {
        s.classList.add('selected');
        s.setAttribute('aria-checked', 'true');
      } else {
        s.classList.remove('selected');
        s.setAttribute('aria-checked', 'false');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (localStorage.getItem(SUBMITTED_KEY) === 'true') {
    statusEl.hidden = false;
    statusEl.style.color = 'var(--accent-color)';
    statusEl.textContent = 'You have already submitted feedback.';
    return;
  }

  statusEl.hidden = true;

  const name = document.getElementById('fb-name').value.trim();
  const email = document.getElementById('fb-email').value.trim();
  const message = document.getElementById('fb-message').value.trim();

  if (!message) {
    statusEl.hidden = false;
    statusEl.textContent = 'Please include a message describing your feedback.';
    statusEl.style.color = 'var(--accent-color)';
    return;
  }

  const payload = {
    name: name || null,
    email: email || null,
    message,
    rating: selectedRating || null,
    url: window.location.href,
    ua: navigator.userAgent,
    ts: new Date().toISOString()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Network response not ok');

    localStorage.setItem(SUBMITTED_KEY, 'true');
    submitBtn.textContent = 'Completed ✓';
    submitBtn.disabled = true;

    alert('Feedback submitted');

    closeWidget();

    // Reset form fields and stars, but DO NOT change submit button state
    form.reset();
    updateStars(0);
    selectedRating = 0;

  } catch (err) {
    console.error('Feedback send failed', err);
    statusEl.hidden = false;
    statusEl.style.color = '#ff7b7b';
    statusEl.textContent = 'Could not send feedback right now. Try again later.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});

  document.addEventListener('click', function (e) {
    if (!widget.contains(e.target) && widget.classList.contains('open')) closeWidget();
  });

})();
