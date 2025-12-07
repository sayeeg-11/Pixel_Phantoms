// File: js/script.js
// Global JavaScript for Pixel Phantoms

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll-to-top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--accent-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(0, 170, 255, 0.3);
    `;
    
    document.body.appendChild(scrollToTopBtn);

    // Show/hide scroll-to-top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.transform = 'translateY(0)';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.transform = 'translateY(20px)';
        }
    });

    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Enhanced mobile menu close on outside click
    document.addEventListener('click', function(e) {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        
        if (navLinks && navLinks.classList.contains('open') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            navLinks.classList.remove('open');
            if (hamburger) {
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('mobile-menu-open');
        }
    });

    // Initialize code copy functionality for all code blocks
    initializeCodeCopyButtons();

    // Initialize loading states
    initializeLoadingStates();

    // Demo: Add loading to specific buttons
    setupDemoLoadingButtons();

    // Remove old loading state handlers to avoid duplicates
    removeOldLoadingHandlers();

    console.log('Pixel Phantoms global scripts loaded');
});

/**
 * Remove old loading state handlers to prevent duplicate functionality
 */
function removeOldLoadingHandlers() {
    // Remove old button click handlers from the original code
    const oldButtons = document.querySelectorAll('.btn-primary, .btn-cyber');
    oldButtons.forEach(button => {
        // Clone the button to remove all event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
}

/**
 * Initialize loading states functionality
 */
function initializeLoadingStates() {
    // Check if loadingStates.js is loaded
    if (typeof window.loadingStates === 'undefined') {
        console.warn('Loading states not initialized. Make sure loading-states.js is loaded.');
        return;
    }

    // Add loading to login buttons
    document.querySelectorAll('.login-btn, .btn-login').forEach(btn => {
        btn.addEventListener('click', function(e) {
            window.loadingStates.showButtonLoading(this, {
                text: 'Signing in...',
                duration: 2000
            });
        });
    });

    // Add loading to form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (this.classList.contains('no-loading')) return;
            
            window.loadingStates.showFormLoading(this);
            
            // Simulate API call
            setTimeout(() => {
                window.loadingStates.hideFormLoading(this);
                
                // Show success
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    window.loadingStates.showButtonSuccess(submitBtn, 'Submitted!', 2000);
                }
            }, 2500);
            
            e.preventDefault();
        });
    });

    // Add loading to leaderboard refresh
    document.querySelectorAll('.refresh-leaderboard, .btn-refresh').forEach(btn => {
        btn.addEventListener('click', function() {
            window.loadingStates.showButtonLoading(this, {
                text: 'Refreshing...',
                duration: 1500
            });
            
            // Show skeleton loading
            const leaderboardContainer = document.querySelector('.lb-rows-container');
            if (leaderboardContainer) {
                window.loadingStates.showSkeletonLoading(leaderboardContainer, 5, 'card');
                
                setTimeout(() => {
                    window.loadingStates.hideSkeletonLoading(leaderboardContainer);
                    window.loadingStates.showButtonSuccess(this, 'Updated!', 1000);
                }, 1500);
            }
        });
    });

    // Add loading to project filters
    document.querySelectorAll('.btn-glitch-filter, .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            window.loadingStates.showButtonLoading(this, {
                text: 'Filtering...',
                duration: 1000
            });
            
            // Simulate filter loading
            const projectGrid = document.querySelector('.projects-grid');
            if (projectGrid) {
                projectGrid.style.opacity = '0.5';
                projectGrid.style.transition = 'opacity 0.3s';
                
                setTimeout(() => {
                    projectGrid.style.opacity = '1';
                }, 1000);
            }
        });
    });
}

/**
 * Setup demo loading buttons for testing
 */
function setupDemoLoadingButtons() {
    // Add demo buttons to various pages
    if (document.querySelector('.btn-cyber-demo') || document.querySelector('.loading-demo')) return;
    
    // Create demo section if not exists
    const demoSection = document.createElement('div');
    demoSection.className = 'loading-demo';
    demoSection.style.cssText = `
        padding: 20px;
        margin: 30px auto;
        max-width: 800px;
        background: var(--card-bg);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        text-align: center;
    `;
    
    demoSection.innerHTML = `
        <h3 style="margin-top: 0; color: var(--accent-color);">Loading States Demo</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Test different loading states:</p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary demo-loading" data-type="success">Success Demo</button>
            <button class="btn-secondary demo-loading" data-type="error">Error Demo</button>
            <button class="btn-cyber demo-loading" data-type="loading">Loading Spinner</button>
            <button class="btn-outline demo-loading" data-type="progress">Progress Bar</button>
        </div>
        <div id="progress-demo" class="progress-container" style="margin-top: 20px;"></div>
    `;
    
    // Insert demo section before footer
    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.parentNode.insertBefore(demoSection, footer);
    }
    
    // Add demo button listeners
    document.querySelectorAll('.demo-loading').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            switch(type) {
                case 'success':
                    if (window.loadingStates) {
                        window.loadingStates.showButtonSuccess(this, 'Action Successful!', 2000);
                    } else {
                        this.innerHTML = '<span class="success-checkmark"></span>Success!';
                        this.classList.add('btn-success');
                        setTimeout(() => {
                            this.innerHTML = 'Success Demo';
                            this.classList.remove('btn-success');
                        }, 2000);
                    }
                    break;
                    
                case 'error':
                    if (window.loadingStates) {
                        window.loadingStates.showButtonError(this, 'Something went wrong', 2500);
                    } else {
                        this.innerHTML = '<span class="error-cross"></span>Error!';
                        this.classList.add('btn-error');
                        setTimeout(() => {
                            this.innerHTML = 'Error Demo';
                            this.classList.remove('btn-error');
                        }, 2500);
                    }
                    break;
                    
                case 'loading':
                    if (window.loadingStates) {
                        window.loadingStates.showButtonLoading(this, {
                            text: 'Processing...',
                            duration: 3000
                        });
                        
                        setTimeout(() => {
                            window.loadingStates.hideButtonLoading(this);
                            window.loadingStates.showButtonSuccess(this, 'Done!', 1500);
                        }, 3000);
                    } else {
                        this.innerHTML = '<span class="spinner"></span>Loading...';
                        this.classList.add('btn-loading');
                        setTimeout(() => {
                            this.innerHTML = 'Loading Spinner';
                            this.classList.remove('btn-loading');
                        }, 3000);
                    }
                    break;
                    
                case 'progress':
                    const progress = window.loadingStates ? 
                        window.loadingStates.showProgress('progress-demo') :
                        showProgressFallback('progress-demo');
                    
                    if (progress) {
                        let current = 0;
                        const interval = setInterval(() => {
                            current += 10;
                            if (window.loadingStates) {
                                progress.update(current);
                            } else {
                                updateProgressFallback('progress-demo', current);
                            }
                            
                            if (current >= 100) {
                                clearInterval(interval);
                                setTimeout(() => {
                                    if (window.loadingStates) {
                                        progress.hide();
                                    } else {
                                        hideProgressFallback('progress-demo');
                                    }
                                    if (window.loadingStates) {
                                        window.loadingStates.showButtonSuccess(this, 'Upload Complete!', 1500);
                                    }
                                }, 500);
                            }
                        }, 200);
                    }
                    break;
            }
        });
    });
}

/**
 * Initialize code copy buttons for all code blocks
 */
function initializeCodeCopyButtons() {
    // Find all code blocks that should have copy functionality
    document.querySelectorAll('pre code').forEach(codeBlock => {
        // Get or create the container
        let preElement = codeBlock.parentElement;
        if (preElement.tagName !== 'PRE') {
            // Wrap code block in pre if not already
            const wrapper = document.createElement('pre');
            codeBlock.parentNode.insertBefore(wrapper, codeBlock);
            wrapper.appendChild(codeBlock);
            preElement = wrapper;
        }
        
        // Check if copy button already exists
        if (preElement.querySelector('.copy-code-btn')) {
            return;
        }
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '📋';
        copyButton.title = 'Copy code';
        copyButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s, background 0.3s;
            z-index: 10;
        `;
        
        // Add hover effects
        copyButton.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.background = 'var(--accent-color)';
            this.style.color = 'white';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
            this.style.background = 'var(--card-bg)';
            this.style.color = 'var(--text-color)';
        });
        
        // Add copy functionality
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent || '';
            copyCodeToClipboard(code, this);
        });
        
        // Position the pre element relative for absolute positioning
        preElement.style.position = 'relative';
        preElement.style.paddingTop = '40px'; // Make room for the button
        
        // Add the copy button
        preElement.appendChild(copyButton);
    });
}

/**
 * Copy code to clipboard with success notification
 * @param {string} codeText - The code text to copy
 * @param {HTMLElement} buttonElement - The button that was clicked (optional)
 */
function copyCodeToClipboard(codeText, buttonElement = null) {
    navigator.clipboard.writeText(codeText.trim())
        .then(() => {
            // Update button text temporarily
            if (buttonElement) {
                const originalHTML = buttonElement.innerHTML;
                buttonElement.innerHTML = '✓ Copied!';
                buttonElement.style.background = '#00ff88';
                buttonElement.style.color = '#000';
                buttonElement.style.opacity = '1';
                
                setTimeout(() => {
                    buttonElement.innerHTML = originalHTML;
                    buttonElement.style.background = '';
                    buttonElement.style.color = '';
                    buttonElement.style.opacity = '0.7';
                }, 2000);
            }
            
            // Show success notification
            showCopyNotification('Code copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showCopyNotification('Failed to copy code', 'error');
            
            // Fallback for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = codeText.trim();
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (buttonElement) {
                    buttonElement.innerHTML = '✓ Copied!';
                    setTimeout(() => {
                        buttonElement.innerHTML = '📋';
                    }, 2000);
                }
                showCopyNotification('Code copied (fallback)!', 'success');
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                showCopyNotification('Copy failed. Please select and copy manually.', 'error');
            }
        });
}

/**
 * Show a copy notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showCopyNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `copy-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : '#ff4444'};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s forwards;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: 'Courier New', monospace;
        font-size: 14px;
    `;
    
    // Add keyframe animations
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(notification);
    
    // Remove after animation completes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
        if (styleSheet.parentNode) {
            styleSheet.remove();
        }
    }, 2000);
}

// Fallback functions if loadingStates.js not loaded
function showProgressFallback(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    container.style.display = 'block';
    container.innerHTML = '<div class="progress-bar" style="width: 0%; height: 20px; background: var(--accent-color); border-radius: 4px; transition: width 0.3s;"></div>';
    
    return {
        update: (progress) => {
            const bar = container.querySelector('.progress-bar');
            if (bar) bar.style.width = `${progress}%`;
        },
        hide: () => {
            container.style.display = 'none';
        }
    };
}

function updateProgressFallback(containerId, progress) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const bar = container.querySelector('.progress-bar');
    if (bar) bar.style.width = `${progress}%`;
}

function hideProgressFallback(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';
}