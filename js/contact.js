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

    /* ------------------ Submit ------------------ */

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        const isValid =
            validate(inputs.name, rules.name, errors.name) &&
            validate(inputs.email, rules.email, errors.email) &&
            validate(inputs.message, rules.message, errors.message);

        if (!isValid) {
            feedbackMsg.textContent = '❌ Please fix the errors above.';
            feedbackMsg.className = 'feedback-message error';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            feedbackMsg.textContent = '✅ Message sent successfully!';
            feedbackMsg.className = 'feedback-message success';

            contactForm.reset();
            updateCharCounter();

            Object.values(inputs).forEach(i =>
                i.classList.remove('valid', 'invalid')
            );
        } catch {
            feedbackMsg.textContent = '❌ Something went wrong. Try again.';
            feedbackMsg.className = 'feedback-message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});
