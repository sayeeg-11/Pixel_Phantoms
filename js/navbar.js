function renderNavbar(basePath = '') {
    const navbarHTML = `
    <nav class="navbar">
        <div class="logo">
            <a href="${basePath}index.html" class="logo-link">
                <img src="${basePath}assets/logo.png" alt="Pixel Phantoms Logo">
                <span>Pixel Phantoms</span>
            </a>
        </div>

        <button class="hamburger" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>

        <ul class="nav-links" id="nav-links">
            <li><a href="${basePath}index.html">Home</a></li>
            <li><a href="${basePath}about.html">About</a></li>
            <li><a href="${basePath}events.html">Events</a></li>
            <li><a href="${basePath}pages/contributors.html">Team</a></li>
            <li><a href="${basePath}pages/login.html">Login</a></li>
            <li><a href="${basePath}contact.html">Contact</a></li>
            <li>
                <div class="theme-toggle">
                    <input type="checkbox" id="theme-switch" class="theme-switch" aria-label="Toggle theme">
                    <label for="theme-switch" class="theme-label">
                        <div class="toggle-thumb"></div>
                        <span class="sun-icon">☀️</span>
                        <span class="moon-icon">🌙</span>
                    </label>
                </div>
            </li>
        </ul>
    </nav>
    `;

    document.getElementById('navbar-placeholder').innerHTML = navbarHTML;

    // Initialize mobile menu functionality
    initMobileMenu();
}

function initMobileMenu() {
    const container = document.getElementById('navbar-placeholder');
    const hamburger = container.querySelector('.hamburger');
    const navLinks = container.querySelector('.nav-links');
    const body = document.body;

    if (!hamburger || !navLinks) return;

    // Function to close mobile menu
    function closeMobileMenu() {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        body.classList.remove('mobile-menu-open');
        
        // Re-enable body scrolling
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
        body.style.height = '';
    }

    // Function to open mobile menu
    function openMobileMenu() {
        navLinks.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        body.classList.add('mobile-menu-open');
        
        // Disable body scrolling when menu is open
        if (window.innerWidth <= 768) {
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.height = '100%';
        }
    }

    // Toggle mobile menu on hamburger click
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close menu when clicking on a link
    container.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            closeMobileMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (navLinks.classList.contains('open') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // CLOSE MENU ON SCROLL - MAIN FIX FOR THE ISSUE
    let scrollTimeout;
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function () {
        if (navLinks.classList.contains('open')) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDiff = Math.abs(scrollTop - lastScrollTop);
            
            // Close menu if user scrolls more than 50 pixels
            if (scrollDiff > 50) {
                closeMobileMenu();
            }
            
            lastScrollTop = scrollTop;
        }
        
        // Debounce scroll events
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            // Additional scroll handling if needed
        }, 100);
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            if (window.innerWidth > 768) {
                // Always close mobile menu when switching to desktop
                closeMobileMenu();
            }
        }, 250);
    });

    // Handle touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function (e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function (e) {
        touchEndY = e.changedTouches[0].screenY;
        const touchDiff = Math.abs(touchEndY - touchStartY);
        
        // Close menu on significant touch swipe
        if (navLinks.classList.contains('open') && touchDiff > 30) {
            closeMobileMenu();
        }
    }, { passive: true });

    // Prevent scroll on mobile menu
    navLinks.addEventListener('touchmove', function (e) {
        if (this.scrollHeight > this.clientHeight) {
            // Allow scrolling within the menu
            e.stopPropagation();
        } else {
            // Prevent scroll when at the top/bottom of menu
            const isAtTop = this.scrollTop === 0;
            const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 1;
            
            if ((isAtTop && e.touches[0].clientY > touchStartY) || 
                (isAtBottom && e.touches[0].clientY < touchStartY)) {
                e.preventDefault();
            }
        }
    }, { passive: false });

    console.log("Mobile menu initialized with scroll handling");
}

// Export function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderNavbar, initMobileMenu };
}