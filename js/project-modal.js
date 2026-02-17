/**
 * Project Modal Logic
 * Handles opening, closing, and data population for project detail modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const modalClose = modal.querySelector('.modal-close');
  const modalBody = modal.querySelector('.modal-body');
  const projectCards = document.querySelectorAll('.project-card');

  // Open Modal
  projectCards.forEach(card => {
    card.addEventListener('click', e => {
      // Don't open if clicking on a link inside the card
      if (e.target.closest('a')) return;

      const name = card.querySelector('h3').textContent;
      const description =
        card.getAttribute('data-full-desc') || card.querySelector('p').textContent;
      const tech = Array.from(card.querySelectorAll('.tech-stack-terminal span')).map(
        s => s.textContent
      );
      const liveUrl = card.getAttribute('data-live-url');
      const githubUrl = card.querySelector('.icon-link:not(.disabled)')?.getAttribute('href');
      const image = card.querySelector('img').src;

      populateModal({ name, description, tech, liveUrl, githubUrl, image });
      openModal();
    });
  });

  // Close Modal
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Esc key close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function populateModal(data) {
    modal.querySelector('.modal-title').textContent = data.name;
    modal.querySelector('.modal-description').textContent = data.description;
    modal.querySelector('.modal-image').src = data.image;

    // Populate tech stack
    const techContainer = modal.querySelector('.modal-tech-stack');
    techContainer.innerHTML = '';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      techContainer.appendChild(span);
    });

    // Set action buttons
    const liveBtn = modal.querySelector('.btn-live');
    if (data.liveUrl && data.liveUrl !== '#') {
      liveBtn.href = data.liveUrl;
      liveBtn.style.display = 'inline-flex';
    } else {
      liveBtn.style.display = 'none';
    }

    const githubBtn = modal.querySelector('.btn-github');
    if (data.githubUrl) {
      githubBtn.href = data.githubUrl;
      githubBtn.style.display = 'inline-flex';
    } else {
      githubBtn.style.display = 'none';
    }
  }

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // GSAP Animation
    gsap.fromTo(
      modal.querySelector('.modal-content'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );

    gsap.to(modal, { opacity: 1, duration: 0.3 });
  }

  function closeModal() {
    gsap.to(modal.querySelector('.modal-content'), {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      },
    });

    gsap.to(modal, { opacity: 0, duration: 0.3 });
  }
});
