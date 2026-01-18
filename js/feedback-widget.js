// --- Feedback Widget Logic ---
console.log("feedback-widget.js loaded");

const widget = document.getElementById('feedback-widget');
const toggleBtn = document.getElementById('feedback-toggle');
const panel = document.getElementById('feedback-panel');
const closeBtn = document.getElementById('feedback-close');
const stars = document.querySelectorAll('#star-rating .star');
const form = document.getElementById('feedback-form');
const statusBox = document.getElementById('feedback-status');

let rating = 0;

// Function to adjust panel position to stay within viewport
function adjustPanelPosition() {
  if (!panel) return;
  
  const widgetRect = widget.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  // Reset positioning
  panel.style.left = '';
  panel.style.right = '';
  
  // Check if we're on mobile (widget is on the left)
  if (widgetRect.left < viewportWidth / 2) {
    // Widget is on the left side, open panel to the right
    panel.style.left = '0';
    panel.style.right = 'auto';
    panel.style.transformOrigin = 'bottom left';
  } else {
    // Widget is on the right side, open panel to the left
    panel.style.left = 'auto';
    panel.style.right = '0';
    panel.style.transformOrigin = 'bottom right';
  }
}

// Toggle popup
toggleBtn.addEventListener('click', () => {
  widget.classList.toggle('open');
  
  // Adjust position when opening
  if (widget.classList.contains('open')) {
    adjustPanelPosition();
  }
});

closeBtn.addEventListener('click', () => {
  widget.classList.remove('open');
});

// Handle window resize
window.addEventListener('resize', () => {
  if (widget.classList.contains('open')) {
    adjustPanelPosition();
  }
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
    
  const name = form.username.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
    
      // Validation
  if (name.length < 2) {
    statusBox.innerText = 'Please enter your name (min 2 characters).';
    return;
  }
    
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    statusBox.innerText = 'Please enter a valid email address.';
    return;
  }
    
  if (message.length < 10) {
    statusBox.innerText = 'Please write a suggestion (min 10 characters).';
    return;
  }
    
  if (rating === 0) {
    statusBox.innerText = 'Please select a rating (1–5 stars).';
    return;
  }
    
  const data = { name, email, message, rating };
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
