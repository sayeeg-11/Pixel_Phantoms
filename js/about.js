/**
 * Pixel Phantoms - About Page Logic
 * Handles accessibility interactions for member cards.
 */

document.addEventListener('DOMContentLoaded', function () {
  const memberCards = document.querySelectorAll('.member-card');

  // Add keyboard support for member cards
  memberCards.forEach(card => {
    card.addEventListener('keydown', function (e) {
      // Allow triggering click with Enter or Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Log interactions with social links (for analytics or debugging)
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('click', function () {
      const label = this.getAttribute('aria-label');
      console.log(`[Interaction] Social link clicked: ${label}`);
    });
  });
});