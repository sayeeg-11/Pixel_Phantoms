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

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const feedbackMsg = document.getElementById('form-feedback');
    const submitBtn = contactForm.querySelector('.btn-submit');

    if (!submitBtn) return;

    const originalBtnText = submitBtn.innerHTML;

    // Inputs
    const inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        message: document.getElementById('message')
    };

    const errors = {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        message: document.getElementById('message-error')
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
                invalid: 'Only letters, spaces, hyphens, and apostrophes allowed'
            }
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            messages: {
                required: 'Email is required',
                invalid: 'Enter a valid email address'
            }
        },
        message: {
            min: 10,
            max: 500,
            messages: {
                required: 'Message is required',
                invalid: 'Message must be at least 10 characters'
            }
        }
    };

    /* ------------------ Utilities ------------------ */

    const sanitize = value =>
        value.trim().replace(/[<>"'&]/g, char =>
            ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[char])
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
        charCounter.classList.toggle('warning', length > max * 0.8);
        charCounter.classList.toggle('error', length >= max);
    }

    inputs.message.setAttribute('maxlength', rules.message.max);
    updateCharCounter();

    /* ------------------ Event Listeners ------------------ */

    inputs.name.addEventListener('blur', () =>
        validate(inputs.name, rules.name, errors.name)
    );

    inputs.email.addEventListener('blur', () =>
        validate(inputs.email, rules.email, errors.email)
    );

    inputs.message.addEventListener('input', updateCharCounter);
    inputs.message.addEventListener('blur', () =>
        validate(inputs.message, rules.message, errors.message)
    );

    /* ------------------ Submit with honeypot & rate-limiting ------------------ */

    const RATE_LIMIT_KEY = 'pp_contact_last_submit';
    const RATE_LIMIT_SECONDS = 5; // Prevent submissions within 5 seconds
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

        showFeedback(`⚠️ Please wait ${remaining} seconds before submitting again`, 'error', 'animate-slide');

        countdownInterval = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                showFeedback('', '');
                return;
            }
            showFeedback(`⚠️ Please wait ${remaining} seconds before submitting again`, 'error', 'animate-slide');
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
            showFeedback('❌ All fields are required and must be valid.', 'error', 'animate-error');
            return;
        }

        // Show loading state on button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin spinner"></i> Sending...';
        submitBtn.classList.add('loading');

        try {
            // Simulated send (replace with real request if backend available)
            await new Promise(resolve => setTimeout(resolve, 1500));

            showFeedback("✅ Message sent successfully! We'll get back to you soon.", 'success', 'animate-success');

            contactForm.reset();
            updateCharCounter();

            Object.values(inputs).forEach(i => i.classList.remove('valid', 'invalid'));

            // store last submit timestamp
            localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
        } catch (err) {
            showFeedback('❌ Failed to send message. Please try again later.', 'error', 'animate-error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.classList.remove('loading');
        }
    });
});
