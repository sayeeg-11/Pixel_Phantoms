// --- Feedback Widget Logic ---

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('feedback-widget');
  const toggleBtn = document.getElementById('feedback-toggle');
  const panel = document.getElementById('feedback-panel');
  const closeBtn = document.getElementById('feedback-close');
  const stars = document.querySelectorAll('#star-rating .star');
  const form = document.getElementById('feedback-form');
  const statusBox = document.getElementById('feedback-status');

  let rating = 0;

  // Toggle popup
  toggleBtn.addEventListener('click', () => {
    widget.classList.toggle('open');
  });

  closeBtn.addEventListener('click', () => {
    widget.classList.remove('open');
  });

  // Handle star rating
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      rating = index + 1;

      stars.forEach(s => s.classList.remove('selected'));
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add('selected');
      }
    });
  });

  // Submit feedback
  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
      name: form.username.value,
      email: form.email.value,
      message: form.message.value,
      rating,
    };

    console.log('Feedback Submitted :', data);

    statusBox.innerText = 'Thank you for your feedback ❤️';

    form.reset();
    rating = 0;
    stars.forEach(s => s.classList.remove('selected'));

    setTimeout(() => {
      statusBox.innerText = '';
      widget.classList.remove('open');
    }, 1200);
  });
});
