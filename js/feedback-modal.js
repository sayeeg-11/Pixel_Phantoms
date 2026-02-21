// Feedback Modal Logic
// This script creates and shows a feedback form modal

document.addEventListener('DOMContentLoaded', function () {

  // ===== Inject Star Animation Styles =====
  if (!document.getElementById('feedback-star-animations')) {
    const style = document.createElement('style');
    style.id = 'feedback-star-animations';
    style.innerHTML = `
      #modal-star-rating .star {
        transition: transform 0.2s ease, 
                    color 0.2s ease, 
                    text-shadow 0.2s ease;
      }

      #modal-star-rating .star:hover,
      #modal-star-rating .star:focus {
        transform: scale(1.25);
        text-shadow: 0 0 8px #ffd166, 0 0 16px rgba(255,209,102,0.6);
      }

      #modal-star-rating .star.selected {
        color: #ffd166 !important;
        text-shadow: 0 0 10px #ffd166, 0 0 20px rgba(255,209,102,0.6);
        transform: scale(1.2);
      }

      #modal-star-rating .star.bounce {
        animation: starBounce 0.35s ease;
      }

      @keyframes starBounce {
        0%   { transform: scale(1); }
        30%  { transform: scale(1.4); }
        60%  { transform: scale(0.9); }
        100% { transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }

  const toggleBtn = document.getElementById('feedback-toggle');
  if (!toggleBtn) return;

  // ===== Overlay =====
  let overlay = document.getElementById('feedback-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'feedback-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.55)';
    overlay.style.zIndex = '9998';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }

  // ===== Modal =====
  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';

    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.width = '90%';
    modal.style.maxWidth = '350px';
    modal.style.background = 'var(--card-bg, #fff)';
    modal.style.color = 'var(--text-primary, #222)';
    modal.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
    modal.style.borderRadius = '14px';
    modal.style.padding = '24px 32px';
    modal.style.zIndex = '9999';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:20px;">Send Feedback</h3>

        <!-- FIXED CLOSE BUTTON -->
        <button id="feedback-modal-close"
          style="
            background: rgba(0,0,0,0.08);
            color: #222;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display:flex;
            align-items:center;
            justify-content:center;
            transition: all 0.2s ease;
          ">
          ✕
        </button>
      </div>

      <form id="feedback-modal-form">
        <label>Your Name</label>
        <input type="text" name="username" required
          style="width:100%; margin-bottom:8px; padding:8px; border-radius:6px; border:1px solid #ccc;" />

        <label>Your Email</label>
        <input type="email" name="email" required
          style="width:100%; margin-bottom:8px; padding:8px; border-radius:6px; border:1px solid #ccc;" />

        <label>Your Suggestion</label>
        <textarea name="message" required
          style="width:100%; resize:vertical; margin-bottom:8px; padding:8px; border-radius:6px; border:1px solid #ccc;"></textarea>

        <div style="margin:10px 0; display:flex; align-items:center; gap:10px;">
          <span style="font-size:14px;">Rating</span>
          <div id="modal-star-rating">
            ${'<button type="button" class="star" style="background:none;border:none;font-size:22px;color:#888;cursor:pointer;">★</button>'.repeat(5)}
          </div>
        </div>

        <div style="margin-top:12px;">
          <button type="submit"
            style="padding:8px 16px; border-radius:8px; background:#0088cc; color:#fff; border:none; cursor:pointer;">
            Submit
          </button>
        </div>

        <p id="feedback-modal-status"
          style="margin-top:8px; font-size:13px; color:#ffd166;"></p>
      </form>
    `;

    document.body.appendChild(modal);
  }

  const closeBtn = modal.querySelector('#feedback-modal-close');

  // ===== Fix Dark Mode Color Dynamically =====
  function applyCloseBtnTheme() {
    if (document.body.classList.contains('dark-mode') ||
        document.body.classList.contains('hacker-theme')) {
      closeBtn.style.color = '#fff';
      closeBtn.style.background = 'rgba(255,255,255,0.12)';
    } else {
      closeBtn.style.color = '#222';
      closeBtn.style.background = 'rgba(0,0,0,0.08)';
    }
  }

  applyCloseBtnTheme();

  // ===== Hover Animation =====
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#0088cc';
    closeBtn.style.color = '#fff';
    closeBtn.style.transform = 'rotate(90deg)';
  });

  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.transform = 'rotate(0deg)';
    applyCloseBtnTheme();
  });

  // ===== Open Modal =====
  toggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    overlay.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });

  // ===== Star Rating Logic =====
  const stars = modal.querySelectorAll('#modal-star-rating .star');
  let rating = 0;

  stars.forEach((star, idx) => {
    star.setAttribute('tabindex', '0');

    function selectStar() {
      rating = idx + 1;
      stars.forEach(s => s.classList.remove('selected', 'bounce'));
      for (let i = 0; i <= idx; i++) {
        stars[i].classList.add('selected', 'bounce');
      }
      setTimeout(() => {
        stars.forEach(s => s.classList.remove('bounce'));
      }, 350);
    }

    star.addEventListener('click', selectStar);

    star.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectStar();
      }
    });
  });

  // ===== Form Submit =====
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
      closeModal();
      statusBox.textContent = '';
      form.reset();
      stars.forEach(s => (s.style.color = '#888'));
      rating = 0;
    }, 1500);
  });

});