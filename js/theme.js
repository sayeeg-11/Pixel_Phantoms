(function() {
    // 1. Immediate Execution: Apply saved theme to HTML tag to prevent "White Flash"
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Force background color directly on body to override CSS specificity issues
        if (document.body) {
            document.body.style.backgroundColor = (theme === 'dark') ? '#0d0f14' : '#f5f7fa';
            document.body.classList.toggle('light-mode', theme === 'light');
            document.body.classList.toggle('dark-mode', theme === 'dark');
        }
    };

    // 2. The Initialization: Setup the actual toggle listener
    const initToggle = () => {
        const themeSwitch = document.getElementById('theme-switch');
        const themeLabel = document.querySelector('.theme-label');

        if (!themeSwitch) return;

        // Sync the checkbox UI with saved memory
        themeSwitch.checked = (localStorage.getItem('theme') === 'light');

        themeSwitch.addEventListener('change', function() {
            const newTheme = this.checked ? 'light' : 'dark';
            applyTheme(newTheme);

            // Creative mechanical shake interaction
            if (themeLabel) {
                themeLabel.style.animation = 'none';
                void themeLabel.offsetWidth; // Force browser refresh
                themeLabel.style.animation = 'switchShake 0.4s ease';
            }
            console.log(`System Protocol: ${newTheme.toUpperCase()}_MODE ACTIVE`);
        });
    };

    // 3. The Watcher: Wait for your dynamic navbar to inject the toggle
    const observer = new MutationObserver(() => {
        if (document.getElementById('theme-switch')) {
            initToggle();
            observer.disconnect(); // Stop watching once found
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 4. Inject Shake Animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes switchShake {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(0.9) rotate(5deg); }
            50% { transform: scale(1.1) rotate(-5deg); }
            75% { transform: scale(1.05) rotate(2deg); }
        }
    `;
    document.head.append(style);
})();