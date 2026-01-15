function renderNavbar(basePath = '') {
  const navbarHTML = `
    <nav class="navbar">
      <div class="logo">
        <a href="${basePath}index.html" class="logo-link">
          <img src="${basePath}assets/logo.png" alt="Pixel Phantoms Logo">
          <span>Pixel Phantoms</span>
        </a>
      </div>

      <button
        class="hamburger"
        aria-label="Toggle navigation"
        aria-expanded="false"
        aria-controls="nav-links"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <ul class="nav-links" id="nav-links">
        <li><a href="${basePath}index.html">Home</a></li>
        <li><a href="${basePath}about.html">About</a></li>
        <li><a href="${basePath}events.html">Events</a></li>

        <!-- ✅ NEW FEATURE -->
        <li>
          <a href="${basePath}frontend/pages/learning-tracks.html">
            Learning Tracks
          </a>
        </li>

        <li><a href="${basePath}pages/contributors.html">Team</a></li>
        <li><a href="${basePath}pages/login.html">Login</a></li>
        <li><a href="${basePath}contact.html">Contact</a></li>

        <li>
          <div class="theme-toggle">
            <input
              type="checkbox"
              id="theme-switch"
              class="theme-switch"
              aria-label="Toggle theme"
            >
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

  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  placeholder.innerHTML = navbarHTML;

  // Initialize mobile menu
  initMobileMenu();

  // Highlight active nav item
  setActiveNavItem();
}

/* --------------------------------------------------
   Highlight active navigation link
-------------------------------------------------- */
function setActiveNavItem() {
  const currentPage =
    window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');

    const linkPage = link.getAttribute('href')?.split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
}

/* --------------------------------------------------
   Mobile Menu Logic (Stable + Scroll Safe)
-------------------------------------------------- */
function initMobileMenu() {
  const container = document.getElementById('navbar-placeholder');
  if (!container) return;

  const hamburger = container.querySelector('.hamburger');
  const navLinks = container.querySelector('.nav-links');
  const body = document.body;

  if (!hamburger || !navLinks) return;

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    body.classList.remove('mobile-menu-open');
    body.style.overflow = '';
    body.style.position = '';
  }

  function openMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    body.classList.add('mobile-menu-open');

    if (window.innerWidth <= 768) {
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
    }
  }

  hamburger.addEventListener('click', e => {
    e.stopPropagation();
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  console.log('Navbar initialized successfully');
}

/* --------------------------------------------------
   Export (for future scalability / testing)
-------------------------------------------------- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderNavbar, initMobileMenu };
}
