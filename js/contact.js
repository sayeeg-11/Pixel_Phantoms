/* ================= THEME TOGGLE ================= */
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;
const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};
applyTheme(localStorage.getItem('theme') || 'dark');
themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ================= MAIN DOM CONTENT LOADED ================= */
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------ CONTACT FORM VALIDATION & SUBMISSION ------------------ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const feedbackMsg = document.getElementById('form-feedback');
    const submitBtn = contactForm.querySelector('.btn-submit-modern');

    if (submitBtn) {
      const originalBtnHTML = submitBtn.innerHTML;

      // Inputs
      const inputs = {
        name: document.getElementById('contact-name'),
        email: document.getElementById('contact-email'),
        message: document.getElementById('contact-message'),
      };

      const errors = {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        message: document.getElementById('message-error'),
      };

      const charCount = document.getElementById('char-count');
      const charCounter = document.querySelector('.char-counter');

      const rules = {
        name: {
          min: 2,
          max: 50,
          pattern: /^[a-zA-Z\s'-]+$/,
          messages: {
            required: 'Name is required',
            invalid: 'Only letters, spaces, hyphens, and apostrophes allowed',
          },
        },
        email: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          messages: {
            required: 'Email is required',
            invalid: 'Enter a valid email address',
          },
        },
        message: {
          min: 10,
          max: 500,
          messages: {
            required: 'Message is required',
            invalid: 'Message must be at least 10 characters',
          },
        },
      };

      /* ------------------ Utilities ------------------ */
      const sanitize = value =>
        value
          .trim()
          .replace(
            /[<>"'&]/g,
            char => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' })[char]
          );

      const showError = (input, errorEl, msg) => {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
        input.classList.add('invalid');
        input.classList.remove('valid');
      };

      const clearError = (input, errorEl) => {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        input.classList.remove('invalid');
        input.classList.add('valid');
      };

      /* ------------------ Validation ------------------ */
      function validate(input, rule, errorEl) {
        const value = sanitize(input.value);

        if (!value) {
          showError(input, errorEl, rule.messages.required);
          return false;
        }

        if (rule.min && value.length < rule.min) {
          showError(input, errorEl, rule.messages.invalid);
          return false;
        }

        if (rule.max && value.length > rule.max) {
          input.value = value.slice(0, rule.max);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          showError(input, errorEl, rule.messages.invalid);
          return false;
        }

        clearError(input, errorEl);
        return true;
      }

      /* ------------------ Character Counter ------------------ */
      function updateCharCounter() {
        const length = inputs.message.value.length;
        const max = rules.message.max;

        charCount.textContent = length;
        charCounter.classList.remove('warning', 'error');

        if (length > max * 0.8) {
          charCounter.classList.add('warning');
        }
        if (length >= max) {
          charCounter.classList.add('error');
        }
      }

      inputs.message.setAttribute('maxlength', rules.message.max);
      updateCharCounter();

      /* ------------------ Event Listeners ------------------ */
      inputs.name.addEventListener('blur', () => validate(inputs.name, rules.name, errors.name));

      inputs.name.addEventListener('input', () => {
        if (inputs.name.classList.contains('invalid')) {
          validate(inputs.name, rules.name, errors.name);
        }
      });

      inputs.email.addEventListener('blur', () => validate(inputs.email, rules.email, errors.email));

      inputs.email.addEventListener('input', () => {
        if (inputs.email.classList.contains('invalid')) {
          validate(inputs.email, rules.email, errors.email);
        }
      });

      inputs.message.addEventListener('input', () => {
        updateCharCounter();
        if (inputs.message.classList.contains('invalid')) {
          validate(inputs.message, rules.message, errors.message);
        }
      });

      inputs.message.addEventListener('blur', () =>
        validate(inputs.message, rules.message, errors.message)
      );

      /* ------------------ Submit with honeypot & rate-limiting ------------------ */
      const RATE_LIMIT_KEY = 'pp_contact_last_submit';
      const RATE_LIMIT_SECONDS = 5;
      let countdownInterval = null;

      function showFeedback(msg, type = '', animate = '') {
        feedbackMsg.textContent = msg;
        feedbackMsg.className = `feedback-message ${type}`.trim();
        if (animate) {
          feedbackMsg.classList.add(animate);
          setTimeout(() => feedbackMsg.classList.remove(animate), 600);
        }
      }

      function startCountdown(seconds) {
        clearInterval(countdownInterval);
        let remaining = seconds;

        showFeedback(
          `⚠️ Please wait ${remaining} seconds before submitting again`,
          'error',
          'animate-slide'
        );

        countdownInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            showFeedback('', '');
            return;
          }
          showFeedback(
            `⚠️ Please wait ${remaining} seconds before submitting again`,
            'error',
            'animate-slide'
          );
        }, 1000);
      }

      contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        // Honeypot check
        const honeypot = document.querySelector('input[data-honeypot="true"]');
        if (honeypot && honeypot.value.trim() !== '') {
          showFeedback('❌ Spam detected. Please try again.', 'error', 'animate-error');
          contactForm.classList.add('shake');
          setTimeout(() => contactForm.classList.remove('shake'), 600);
          return;
        }

        // Rate limiting
        const now = Date.now();
        const lastTs = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
        const elapsed = Math.floor((now - lastTs) / 1000);
        if (lastTs && elapsed < RATE_LIMIT_SECONDS) {
          startCountdown(RATE_LIMIT_SECONDS - elapsed);
          return;
        }

        // Validate fields
        const isValid =
          validate(inputs.name, rules.name, errors.name) &&
          validate(inputs.email, rules.email, errors.email) &&
          validate(inputs.message, rules.message, errors.message);

        if (!isValid) {
          showFeedback('❌ Please fix the errors above before submitting.', 'error', 'animate-error');
          return;
        }

        // Show loading state on button
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="btn-text"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';

        try {
          // Get rating value
          const selectedRating = document.querySelector('input[name="experience"]:checked');
          
          // Collect form data
          const formData = {
            name: sanitize(inputs.name.value),
            email: sanitize(inputs.email.value),
            message: sanitize(inputs.message.value),
            rating: selectedRating ? selectedRating.value : 'Not provided',
            timestamp: new Date().toISOString(),
            submittedAt: new Date().toLocaleString(),
          };

          // Print form details to console
          console.log('='.repeat(60));
          console.log('📧 CONTACT FORM SUBMISSION');
          console.log('='.repeat(60));
          console.log('👤 Name:', formData.name);
          console.log('📧 Email:', formData.email);
          console.log('💬 Message:', formData.message);
          console.log('⭐ Rating:', formData.rating);
          console.log('🕒 Submitted at:', formData.submittedAt);
          console.log('📅 ISO Timestamp:', formData.timestamp);
          console.log('='.repeat(60));
          console.table(formData);

          // Simulate sending delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          showFeedback(
            '✅ Message sent successfully! Check the console for details.',
            'success',
            'animate-success'
          );

          contactForm.reset();
          updateCharCounter();
          Object.values(inputs).forEach(i => i.classList.remove('valid', 'invalid'));
          localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
          
          // Reset beam animation speed
          const beam = document.querySelector('.beam-container');
          if (beam) beam.style.animationDuration = '4s';
        } catch (err) {
          console.error('❌ Contact form error:', err);
          showFeedback('❌ Failed to send message. Please try again later.', 'error', 'animate-error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      });
    }
  }

  /* ------------------ HERO TEXT WAVE ANIMATION ------------------ */
  const textElement = document.getElementById('wave-text');
  if (textElement) {
    const content = textElement.textContent.trim();
    textElement.textContent = '';

    [...content].forEach(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.classList.add('wave-letter');
      textElement.appendChild(span);
    });
  }

  /* ------------------ EMOJI RATING LOGIC ------------------ */
  const beam = document.querySelector('.beam-container');
  let lastChecked = null;

  document.querySelectorAll('input[name="experience"]').forEach(radio => {
    // Beam speed reaction on change
    radio.addEventListener('change', (e) => {
      if (beam) {
        const speed = 5.5 - e.target.value;
        beam.style.animationDuration = `${speed}s`;
      }
    });

    // Toggle/deselect logic
    radio.addEventListener('click', (e) => {
      if (lastChecked === radio) {
        radio.checked = false;
        lastChecked = null;
        if (beam) beam.style.animationDuration = '4s';
      } else {
        lastChecked = radio;
      }
    });
  });

  /* ------------------ FAQ ACCORDION FUNCTIONALITY ------------------ */
  const faqItems = document.querySelectorAll('.faq-item-new');
  const searchInput = document.getElementById('faq-search');
  const clearBtn = document.getElementById('faq-clear');
  const categoryBtns = document.querySelectorAll('.faq-category-btn');
  const noResults = document.getElementById('faq-no-results');

  if (faqItems.length > 0) {
    // Accordion functionality
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle current item
        if (!isActive) {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm) {
          clearBtn.classList.add('active');
        } else {
          clearBtn.classList.remove('active');
        }

        let visibleCount = 0;

        faqItems.forEach((item) => {
          const questionText = item
            .querySelector('.faq-question-text span')
            .textContent.toLowerCase();
          const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();

          if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
            item.classList.remove('hidden');
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        if (noResults) {
          noResults.classList.toggle('active', visibleCount === 0 && searchTerm !== '');
        }
      });
    }

    // Clear search
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        this.classList.remove('active');
        faqItems.forEach((item) => item.classList.remove('hidden'));
        if (noResults) noResults.classList.remove('active');
        // Reset to "All Questions" category
        categoryBtns.forEach((btn) => btn.classList.remove('active'));
        if (categoryBtns[0]) categoryBtns[0].classList.add('active');
      });
    }

    // Category filter
    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        const category = this.dataset.category;

        // Update active button
        categoryBtns.forEach((b) => b.classList.remove('active'));
        this.classList.add('active');

        // Clear search
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.classList.remove('active');

        // Filter items
        let visibleCount = 0;
        faqItems.forEach((item) => {
          if (category === 'all' || item.dataset.category === category) {
            item.classList.remove('hidden');
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        if (noResults) {
          noResults.classList.toggle('active', visibleCount === 0);
        }
      });
    });
  }
});
