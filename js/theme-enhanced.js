// Sunset calculation utility
const ThemeUtils = {
    
    isAfterSunset: function() {
        const now = new Date();
        const hours = now.getHours();
        
        const month = now.getMonth() + 1; // 1-12
        let sunsetHour;
        
        if (month >= 11 || month <= 2) { // Winter
            sunsetHour = 17.5; // 5:30 PM
        } else if (month >= 6 && month <= 8) { // Summer
            sunsetHour = 19.5; // 7:30 PM
        } else { // Spring/Fall
            sunsetHour = 18.5; // 6:30 PM
        }
        
        return hours >= sunsetHour;
    },
    
    isNightTime: function() {
        return this.isAfterSunset();
    },
    
    getTimezoneOffset: function() {
        return new Date().getTimezoneOffset() / 60;
    },
    
    saveThemePreference: function(theme, isAuto = false) {
        const preference = {
            theme: theme,
            isAuto: isAuto,
            timestamp: new Date().toISOString(),
            userOverride: !isAuto
        };
        localStorage.setItem('theme-preference', JSON.stringify(preference));
        console.log(`Theme preference saved: ${theme} (auto: ${isAuto})`);
    },
    
    loadThemePreference: function() {
        try {
            const saved = localStorage.getItem('theme-preference');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading theme preference:', error);
            return null;
        }
    },
    
    isPreferenceExpired: function(preference, hours = 1) {
        if (!preference || !preference.timestamp) return true;
        
        const savedTime = new Date(preference.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        return hoursDiff > hours;
    }
};

// Main Theme Manager
class ThemeManager {
    constructor() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.htmlElement = document.documentElement;
        this.isAutoMode = false;
        this.userHasOverridden = false;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Load saved preference
        const savedPreference = ThemeUtils.loadThemePreference();
        
        // Determine initial theme
        let initialTheme;
        
        if (savedPreference && !ThemeUtils.isPreferenceExpired(savedPreference, 4)) {
            // Use saved preference if not too old
            initialTheme = savedPreference.theme;
            this.isAutoMode = savedPreference.isAuto;
            this.userHasOverridden = savedPreference.userOverride || false;
            console.log(`Loaded saved theme: ${initialTheme} (auto: ${this.isAutoMode})`);
        } else if (ThemeUtils.isNightTime() && !this.userHasOverridden) {
            // Auto-switch to dark mode at night
            initialTheme = 'dark';
            this.isAutoMode = true;
            ThemeUtils.saveThemePreference('dark', true);
            console.log('Auto-switched to dark mode (night time)');
        } else {
            // Use system preference or default to dark
            initialTheme = prefersDark ? 'dark' : 'light';
            this.isAutoMode = false;
            console.log(`Using system preference: ${initialTheme}`);
        }
        
        // Apply initial theme
        this.applyTheme(initialTheme, false);
        
        // Set toggle state
        if (initialTheme === 'light') {
            this.themeSwitch.checked = true;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup periodic check for time-based switching
        this.setupAutoCheck();
        
        // Show theme status indicator
        this.showThemeStatus();
    }
    
    applyTheme(theme, savePreference = true) {
        this.htmlElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        if (savePreference) {
            ThemeUtils.saveThemePreference(theme, this.isAutoMode);
        }
    }
    
    updateMetaThemeColor(theme) {
        // Update theme-color meta tag for mobile browsers
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        if (theme === 'dark') {
            metaThemeColor.content = '#0d0f14'; // Dark theme background
        } else {
            metaThemeColor.content = '#f5f7fa'; // Light theme background
        }
    }
    
    setupEventListeners() {
        // Theme toggle click
        this.themeSwitch.addEventListener('change', (e) => {
            this.userHasOverridden = true;
            this.isAutoMode = false;
            
            if (e.target.checked) {
                this.applyTheme('light');
                console.log('User manually switched to light mode');
            } else {
                this.applyTheme('dark');
                console.log('User manually switched to dark mode');
            }
            
            this.showThemeStatus();
        });
        
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.userHasOverridden && this.isAutoMode) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme, true);
                this.themeSwitch.checked = newTheme === 'light';
                console.log(`System preference changed to: ${newTheme}`);
            }
        });
        
        // Add keyboard shortcut (Alt+T)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    toggleTheme() {
        this.userHasOverridden = true;
        this.isAutoMode = false;
        
        const currentTheme = this.htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.applyTheme(newTheme);
        this.themeSwitch.checked = newTheme === 'light';
        
        // Visual feedback
        this.showToggleFeedback(newTheme);
        
        console.log(`Keyboard shortcut toggled theme to: ${newTheme}`);
    }
    
    setupAutoCheck() {
        // Check every 30 minutes for time-based switching
        setInterval(() => {
            if (!this.userHasOverridden) {
                const shouldBeDark = ThemeUtils.isNightTime();
                const currentTheme = this.htmlElement.getAttribute('data-theme');
                
                if (shouldBeDark && currentTheme === 'light') {
                    this.isAutoMode = true;
                    this.applyTheme('dark', true);
                    this.themeSwitch.checked = false;
                    console.log('Auto-switched to dark mode (periodic check)');
                    this.showThemeStatus();
                } else if (!shouldBeDark && currentTheme === 'dark' && this.isAutoMode) {
                    // Only switch back to light if it was auto-switched
                    this.applyTheme('light', true);
                    this.themeSwitch.checked = true;
                    console.log('Auto-switched to light mode (periodic check)');
                    this.showThemeStatus();
                }
            }
        }, 30 * 60 * 1000); // 30 minutes
    }
    
    showThemeStatus() {
        // Remove existing status if any
        const existingStatus = document.querySelector('.theme-status-indicator');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        const currentTheme = this.htmlElement.getAttribute('data-theme');
        const statusText = this.isAutoMode ? 'Auto' : 'Manual';
        const statusColor = this.isAutoMode ? '#00ff88' : '#ffa500';
        
        // Create status indicator
        const statusDiv = document.createElement('div');
        statusDiv.className = 'theme-status-indicator';
        statusDiv.innerHTML = `
            <span class="theme-status-dot" style="background: ${statusColor}"></span>
            <span class="theme-status-text">${currentTheme.toUpperCase()} (${statusText})</span>
        `;
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 9999;
            opacity: 0.9;
            backdrop-filter: blur(10px);
            animation: slideInLeft 0.3s ease;
        `;
        
        const statusDot = statusDiv.querySelector('.theme-status-dot');
        statusDot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            animation: pulse 2s infinite;
        `;
        
        document.body.appendChild(statusDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (statusDiv.parentNode) {
                        statusDiv.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    showToggleFeedback(theme) {
        // Create visual feedback element
        const feedback = document.createElement('div');
        feedback.className = 'theme-toggle-feedback';
        feedback.textContent = theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: var(--card-bg);
            color: var(--text-primary);
            padding: 16px 24px;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            border: 2px solid var(--accent-color);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        
        document.body.appendChild(feedback);
        
        // Animate in
        requestAnimationFrame(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(1)';
            feedback.style.opacity = '1';
        });
        
        // Remove after animation
        setTimeout(() => {
            feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
            feedback.style.opacity = '0';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 300);
        }, 1000);
    }
    
    resetToAuto() {
        this.userHasOverridden = false;
        this.isAutoMode = true;
        
        if (ThemeUtils.isNightTime()) {
            this.applyTheme('dark', true);
            this.themeSwitch.checked = false;
        } else {
            this.applyTheme('light', true);
            this.themeSwitch.checked = true;
        }
        
        this.showThemeStatus();
        console.log('Reset to auto theme mode');
    }
    
    getThemeInfo() {
        return {
            currentTheme: this.htmlElement.getAttribute('data-theme'),
            isAutoMode: this.isAutoMode,
            userHasOverridden: this.userHasOverridden,
            isNightTime: ThemeUtils.isNightTime(),
            timezoneOffset: ThemeUtils.getTimezoneOffset(),
            preference: ThemeUtils.loadThemePreference()
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if theme switch exists
    if (document.getElementById('theme-switch')) {
        window.themeManager = new ThemeManager();
        console.log('Enhanced theme manager initialized');
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Theme toggle debug panel (only in development) */
            .theme-debug-panel {
                position: fixed;
                bottom: 80px;
                left: 20px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                padding: 12px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 0.7rem;
                color: var(--text-primary);
                max-width: 300px;
                z-index: 9998;
                display: none;
            }
            
            .theme-debug-panel.show {
                display: block;
                animation: slideInLeft 0.3s ease;
            }
            
            .theme-debug-toggle {
                position: fixed;
                bottom: 80px;
                left: 20px;
                width: 30px;
                height: 30px;
                background: var(--accent-color);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 12px;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
        
        // Add debug toggle button (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const debugToggle = document.createElement('button');
            debugToggle.className = 'theme-debug-toggle';
            debugToggle.textContent = 'T';
            debugToggle.title = 'Toggle theme debug panel';
            debugToggle.addEventListener('click', () => {
                const panel = document.querySelector('.theme-debug-panel');
                if (panel) {
                    panel.classList.toggle('show');
                } else {
                    showDebugPanel();
                }
            });
            document.body.appendChild(debugToggle);
        }
        
        function showDebugPanel() {
            const info = window.themeManager.getThemeInfo();
            const panel = document.createElement('div');
            panel.className = 'theme-debug-panel show';
            panel.innerHTML = `
                <h4 style="margin: 0 0 8px 0; color: var(--accent-color);">Theme Debug Info</h4>
                <div style="display: grid; gap: 4px;">
                    <div><strong>Current:</strong> ${info.currentTheme}</div>
                    <div><strong>Mode:</strong> ${info.isAutoMode ? 'Auto' : 'Manual'}</div>
                    <div><strong>Override:</strong> ${info.userHasOverridden ? 'Yes' : 'No'}</div>
                    <div><strong>Night Time:</strong> ${info.isNightTime ? 'Yes' : 'No'}</div>
                    <div><strong>Timezone:</strong> UTC${info.timezoneOffset > 0 ? '-' : '+'}${Math.abs(info.timezoneOffset)}</div>
                    <div style="margin-top: 8px;">
                        <button onclick="window.themeManager.resetToAuto()" style="padding: 4px 8px; font-size: 0.7rem;">Reset to Auto</button>
                        <button onclick="window.themeManager.toggleTheme()" style="padding: 4px 8px; font-size: 0.7rem; margin-left: 4px;">Toggle Theme</button>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
        }
    } else {
        console.warn('Theme switch element not found. Enhanced theme manager not initialized.');
    }
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, ThemeUtils };
}