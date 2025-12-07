// Enhanced Skip to Content functionality
document.addEventListener('DOMContentLoaded', function() {
    const skipLink = document.getElementById('skip-link');
    const mainContent = document.querySelector(skipLink.getAttribute('href'));
    
    if (skipLink && mainContent) {
        // Add click handler for smooth focus
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Focus on main content
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus({preventScroll: true});
            
            // Smooth scroll to main content
            mainContent.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Remove tabindex after focus (to avoid focus ring on mouse clicks)
            setTimeout(() => {
                mainContent.removeAttribute('tabindex');
            }, 1000);
        });
        
        // Add keyboard event listeners for better UX
        document.addEventListener('keydown', function(e) {
            // Tab key to show skip link
            if (e.key === 'Tab' && !e.shiftKey) {
                skipLink.classList.add('visible');
            }
        });
        
        // Hide skip link when not in use
        document.addEventListener('click', function(e) {
            if (e.target !== skipLink && !skipLink.contains(e.target)) {
                skipLink.classList.remove('visible');
            }
        });
    }
    
    // Improved focus management for screen readers
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in modals if they exist
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                const focusableModalElements = modal.querySelectorAll(focusableElements);
                const firstElement = focusableModalElements[0];
                const lastElement = focusableModalElements[focusableModalElements.length - 1];
                
                if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            }
        }
    });
});

// Helper function to announce changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}