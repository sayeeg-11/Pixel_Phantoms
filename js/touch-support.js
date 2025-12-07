// File: js/touch-support.js
// Enhanced touch support for leaderboard and interactive elements

document.addEventListener('DOMContentLoaded', function() {
    // Detect touch device
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    
    // Add touch device class to body for CSS targeting
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    
    // Enhanced touch support for leaderboard rows
    function enhanceLeaderboardTouch() {
        const leaderboardRows = document.querySelectorAll('.lb-row, .hud-table tr');
        
        leaderboardRows.forEach(row => {
            // Remove hover effects on touch devices
            if (isTouchDevice) {
                row.classList.add('touch-enabled');
            }
            
            // Add touch feedback
            let touchStartX = 0;
            let touchStartY = 0;
            let touchMoved = false;
            
            row.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchMoved = false;
                
                // Add active class immediately
                this.classList.add('touch-active');
                e.preventDefault();
            }, { passive: false });
            
            row.addEventListener('touchmove', function(e) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                // Check if user is scrolling vs tapping
                if (Math.abs(touchX - touchStartX) > 10 || Math.abs(touchY - touchStartY) > 10) {
                    touchMoved = true;
                    this.classList.remove('touch-active');
                }
            });
            
            row.addEventListener('touchend', function(e) {
                if (!touchMoved) {
                    // Trigger click for tap
                    this.click();
                    
                    // Visual feedback
                    this.classList.add('touch-feedback');
                    setTimeout(() => {
                        this.classList.remove('touch-feedback');
                    }, 300);
                }
                
                this.classList.remove('touch-active');
                e.preventDefault();
            });
            
            // Prevent long-press context menu on mobile
            row.addEventListener('contextmenu', function(e) {
                if (isTouchDevice) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    }
    
    // Enhance cards for touch
    function enhanceCardsTouch() {
        const cards = document.querySelectorAll('.seminar-card, .league-card, .track-card, .achievement-card');
        
        cards.forEach(card => {
            if (isTouchDevice) {
                card.style.cursor = 'pointer';
            }
            
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Initialize when leaderboard is loaded
    function initTouchSupport() {
        // Wait a bit for dynamic content
        setTimeout(() => {
            enhanceLeaderboardTouch();
            enhanceCardsTouch();
        }, 1000);
        
        // Also run when leaderboard updates
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    enhanceLeaderboardTouch();
                    enhanceCardsTouch();
                }
            });
        });
        
        // Observe leaderboard container
        const lbContainer = document.querySelector('.lb-rows-container') || 
                           document.querySelector('.table-wrapper');
        if (lbContainer) {
            observer.observe(lbContainer, { childList: true, subtree: true });
        }
    }
    
    // Run initialization
    initTouchSupport();
    
    // Also enhance buttons for touch
    const buttons = document.querySelectorAll('.btn-cyber, .btn-primary, .btn-secondary, .btn-hollow');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'scale(0.98)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '';
            this.style.transform = '';
        });
    });
    
    console.log('Touch support enhanced for mobile devices');
});