/**
 * Loading States Manager for Pixel Phantoms
 * Handles loading spinners, progress indicators, and feedback states
 */

class LoadingStates {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonListeners();
        this.setupFormListeners();
        console.log('Loading states initialized');
    }

    /**
     * Show loading state on buttons
     * @param {HTMLElement} button - Button element
     * @param {Object} options - Configuration options
     */
    showButtonLoading(button, options = {}) {
        const defaults = {
            text: 'Loading...',
            spinner: true,
            disable: true,
            preserveOriginal: true,
            duration: null // auto-reset after duration (ms)
        };
        
        const config = { ...defaults, ...options };
        
        // Store original content if not already stored
        if (!button.dataset.originalHtml && config.preserveOriginal) {
            button.dataset.originalHtml = button.innerHTML;
        }
        
        // Create loading HTML
        let loadingHtml = '';
        if (config.spinner) {
            loadingHtml = `<span class="spinner ${button.classList.contains('btn-outline') ? 'spinner-dark' : ''}"></span>`;
        }
        loadingHtml += config.text;
        
        // Apply loading state
        button.innerHTML = loadingHtml;
        button.classList.add('btn-loading');
        
        if (config.disable) {
            button.disabled = true;
        }
        
        // Auto-reset after duration
        if (config.duration) {
            setTimeout(() => {
                this.hideButtonLoading(button);
            }, config.duration);
        }
        
        return button;
    }

    /**
     * Hide loading state on buttons
     * @param {HTMLElement} button - Button element
     */
    hideButtonLoading(button) {
        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
            delete button.dataset.originalHtml;
        }
        
        button.classList.remove('btn-loading');
        button.disabled = false;
        
        return button;
    }

    /**
     * Show success state on buttons
     * @param {HTMLElement} button - Button element
     * @param {String} text - Success text
     * @param {Number} duration - How long to show success (ms)
     */
    showButtonSuccess(button, text = 'Success!', duration = 2000) {
        const originalHtml = button.innerHTML;
        
        button.innerHTML = `<span class="success-checkmark"></span>${text}`;
        button.classList.add('btn-success');
        button.disabled = true;
        
        // Reset after duration
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('btn-success');
            button.disabled = false;
        }, duration);
    }

    /**
     * Show error state on buttons
     * @param {HTMLElement} button - Button element
     * @param {String} text - Error text
     * @param {Number} duration - How long to show error (ms)
     */
    showButtonError(button, text = 'Failed. Try again', duration = 3000) {
        const originalHtml = button.innerHTML;
        
        button.innerHTML = `<span class="error-cross"></span>${text}`;
        button.classList.add('btn-error');
        button.disabled = true;
        
        // Reset after duration
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('btn-error');
            button.disabled = false;
        }, duration);
    }

    /**
     * Show form loading state
     * @param {HTMLElement} form - Form element
     */
    showFormLoading(form) {
        form.classList.add('form-loading');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            this.showButtonLoading(submitBtn, { text: 'Submitting...' });
        }
    }

    /**
     * Hide form loading state
     * @param {HTMLElement} form - Form element
     */
    hideFormLoading(form) {
        form.classList.remove('form-loading');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            this.hideButtonLoading(submitBtn);
        }
    }

    /**
     * Show progress bar
     * @param {String} containerId - ID of progress container
     * @param {Number} progress - Progress percentage (0-100)
     */
    showProgress(containerId, progress = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.style.display = 'block';
        const bar = container.querySelector('.progress-bar') || 
                   (() => {
                       const newBar = document.createElement('div');
                       newBar.className = 'progress-bar';
                       container.appendChild(newBar);
                       return newBar;
                   })();
        
        bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        
        return {
            update: (newProgress) => {
                bar.style.width = `${Math.min(100, Math.max(0, newProgress))}%`;
            },
            hide: () => {
                container.style.display = 'none';
                bar.style.width = '0%';
            }
        };
    }

    /**
     * Setup button click listeners
     */
    setupButtonListeners() {
        // Listen for clicks on all interactive buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-primary, .btn-cyber, .btn-secondary, .btn-submit');
            if (!button) return;
            
            // Skip if button already has loading state
            if (button.classList.contains('btn-loading')) {
                e.preventDefault();
                return;
            }
            
            // Check if button triggers an async action
            if (this.shouldShowLoading(button)) {
                this.handleButtonLoading(button, e);
            }
        });
    }

    /**
     * Determine if button should show loading state
     * @param {HTMLElement} button - Button element
     */
    shouldShowLoading(button) {
        // Check for specific attributes
        if (button.hasAttribute('data-loading')) return true;
        
        // Check for form submission
        if (button.type === 'submit') return true;
        
        // Check for href that might trigger async action
        const href = button.getAttribute('href');
        if (href && (href === '#' || href.includes('javascript:') || href.includes('mailto:'))) {
            return false; // These don't need loading
        }
        
        // Check for AJAX or async actions
        if (button.classList.contains('async-action') || 
            button.classList.contains('ajax-trigger')) {
            return true;
        }
        
        return false;
    }

    /**
     * Handle button loading logic
     * @param {HTMLElement} button - Button element
     * @param {Event} event - Click event
     */
    handleButtonLoading(button, event) {
        // Prevent default for buttons that need async handling
        if (button.getAttribute('href') === '#') {
            event.preventDefault();
        }
        
        // Show loading state
        this.showButtonLoading(button, {
            text: 'Processing...',
            duration: 3000 // Auto-reset after 3 seconds
        });
        
        // Simulate async action (replace with real API calls)
        setTimeout(() => {
            this.hideButtonLoading(button);
            
            // Show success/error randomly for demo
            if (Math.random() > 0.3) {
                this.showButtonSuccess(button, 'Completed!', 1500);
            } else {
                this.showButtonError(button, 'Failed. Retry?', 2000);
            }
        }, 2000);
    }

    /**
     * Setup form submission listeners
     */
    setupFormListeners() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form || !(form instanceof HTMLFormElement)) return;
            
            // Show loading state
            this.showFormLoading(form);
            
            // Handle form submission
            e.preventDefault();
            
            // Simulate API call
            setTimeout(() => {
                this.hideFormLoading(form);
                
                // Show success message
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    this.showButtonSuccess(submitBtn, 'Submitted!', 2000);
                }
                
                // Reset form after success
                setTimeout(() => {
                    form.reset();
                }, 2000);
            }, 2500);
        });
    }

    /**
     * Create skeleton loading for content
     * @param {HTMLElement} container - Container to show skeletons in
     * @param {Number} count - Number of skeleton items
     * @param {String} type - Type of skeleton ('card', 'text', 'list')
     */
    showSkeletonLoading(container, count = 3, type = 'card') {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            
            if (type === 'card') {
                skeleton.innerHTML = `
                    <div class="skeleton-circle" style="float: left; margin-right: 15px;"></div>
                    <div class="skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton-text" style="width: 60%;"></div>
                    <div class="skeleton-text" style="width: 40%;"></div>
                    <div style="clear: both;"></div>
                `;
                skeleton.style.padding = '20px';
                skeleton.style.marginBottom = '15px';
                skeleton.style.borderRadius = '8px';
                skeleton.style.background = 'var(--card-bg)';
            } else if (type === 'text') {
                skeleton.innerHTML = `
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text" style="width: 90%;"></div>
                    <div class="skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton-text" style="width: 70%;"></div>
                `;
            }
            
            container.appendChild(skeleton);
        }
    }

    /**
     * Remove skeleton loading
     * @param {HTMLElement} container - Container with skeletons
     */
    hideSkeletonLoading(container) {
        const skeletons = container.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.loadingStates = new LoadingStates();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingStates;
}