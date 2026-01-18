// Feedback Modal Logic
// This script creates and shows a feedback form modal at the center of the screen when the feedback toggle is clicked.

document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('feedback-toggle');
  if (!toggleBtn) return;

  // Create modal container
  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.style.position = 'fixed';
    modal.style.top = '65%';
    modal.style.left = '10%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.background = 'var(--card-bg, #222)';
    modal.style.color = 'var(--text-primary, #fff)';
    modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.45)';
    modal.style.borderRadius = '12px';
    modal.style.padding = '24px 32px';
    modal.style.zIndex = '9999';
    modal.style.display = 'none';
    modal.style.width = '350px';
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 20px;">Send Feedback</h3>
        <button id="feedback-modal-close" style="background: none; border: none; font-size: 24px; color: #fff; cursor: pointer;">✕</button>
      </div>
      <form id="feedback-modal-form">
        <label>Your Name</label>
        <input type="text" name="username" required style="width: 100%; margin-bottom: 8px; padding: 8px; border-radius: 6px; border: 1px solid #444; background: var(--card-bg, #222); color: var(--text-primary, #fff);" />
        <label>Your Email</label>
        <input type="email" name="email" required style="width: 100%; margin-bottom: 8px; padding: 8px; border-radius: 6px; border: 1px solid #444; background: var(--card-bg, #222); color: var(--text-primary, #fff);" />
        <label>Your Suggestion</label>
        <textarea name="message" required style="width: 100%; margin-bottom: 8px; padding: 8px; border-radius: 6px; border: 1px solid #444; background: var(--card-bg, #222); color: var(--text-primary, #fff);"></textarea>
        <div style="margin: 10px 0; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 14px;">Rating</span>
          <div id="modal-star-rating">
            <button type="button" class="star" style="background: none; border: none; font-size: 22px; color: #888; cursor: pointer;">★</button>
            <button type="button" class="star" style="background: none; border: none; font-size: 22px; color: #888; cursor: pointer;">★</button>
            <button type="button" class="star" style="background: none; border: none; font-size: 22px; color: #888; cursor: pointer;">★</button>
            <button type="button" class="star" style="background: none; border: none; font-size: 22px; color: #888; cursor: pointer;">★</button>
            <button type="button" class="star" style="background: none; border: none; font-size: 22px; color: #888; cursor: pointer;">★</button>
          </div>
        </div>
        <div style="margin-top: 12px;">
          <button type="submit" style="padding: 8px 16px; border-radius: 8px; background: #0088cc; color: #fff; border: none; cursor: pointer;">Submit</button>
        </div>
        <p id="feedback-modal-status" style="margin-top: 8px; font-size: 13px; color: #ffd166;"></p>
      </form>
    `;
    document.body.appendChild(modal);
  }

  // Show modal on toggle click
  toggleBtn.addEventListener('click', function () {
    modal.style.display = 'block';
  });

  // Close modal
  modal.querySelector('#feedback-modal-close').addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Star rating logic
  const stars = modal.querySelectorAll('#modal-star-rating .star');
  let rating = 0;
  stars.forEach((star, idx) => {
    star.addEventListener('click', function () {
      rating = idx + 1;
      stars.forEach(s => (s.style.color = '#888'));
      for (let i = 0; i <= idx; i++) {
        stars[i].style.color = '#ffd166';
      }
    });
  });

  // Form submit logic
  const form = modal.querySelector('#feedback-modal-form');
  const statusBox = modal.querySelector('#feedback-modal-status');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.username.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (name.length < 2) {
      statusBox.textContent = 'Please enter your name (min 2 characters).';
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      statusBox.textContent = 'Please enter a valid email address.';
      return;
    }
    if (message.length < 10) {
      statusBox.textContent = 'Please write a suggestion (min 10 characters).';
      return;
    }
    statusBox.textContent = 'Thank you for your feedback!';
    setTimeout(() => {
      modal.style.display = 'none';
      statusBox.textContent = '';
      form.reset();
      stars.forEach(s => (s.style.color = '#888'));
      rating = 0;
    }, 1500);
  });
});
