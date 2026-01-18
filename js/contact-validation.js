document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const messageInput = document.getElementById("contact-message");

  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const messageError = document.getElementById("message-error");

  const feedback = document.getElementById("form-feedback");
  const charCount = document.getElementById("char-count");
  const submitBtn = form.querySelector("button[type='submit']");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(el, msg) {
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    setError(nameError, "");
    setError(emailError, "");
    setError(messageError, "");
    if (feedback) feedback.textContent = "";
  }

  function validate() {
    clearErrors();
    let ok = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name) {
      setError(nameError, "Name is required.");
      ok = false;
    } else if (name.length < 2) {
      setError(nameError, "Name must be at least 2 characters.");
      ok = false;
    }

    if (!email) {
      setError(emailError, "Email is required.");
      ok = false;
    } else if (!emailRegex.test(email)) {
      setError(emailError, "Please enter a valid email address.");
      ok = false;
    }

    if (!message) {
      setError(messageError, "Message is required.");
      ok = false;
    } else if (message.length < 10) {
      setError(messageError, "Message must be at least 10 characters.");
      ok = false;
    }

    return ok;
  }

  function updateSubmitState() {
    const ok =
      nameInput.value.trim().length >= 2 &&
      emailRegex.test(emailInput.value.trim()) &&
      messageInput.value.trim().length >= 10;

    if (submitBtn) submitBtn.disabled = !ok;
  }

  // live character counter
  if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  // live validation
  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      validate();
      updateSubmitState();
    });
  });

  // block invalid submit
  form.addEventListener("submit", (e) => {
    const ok = validate();
    if (!ok) {
      e.preventDefault();
      if (feedback) feedback.textContent = "Please fix the errors before submitting.";
    }
  });

  // initial state
  updateSubmitState();
});
