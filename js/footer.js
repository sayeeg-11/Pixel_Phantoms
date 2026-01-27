// File: js/footer.js
// Renders the footer and wires newsletter feedback

function renderFooter(basePath = '') {
  const placeholder = document.getElementById('footer-placeholder');

  if (!placeholder) {
    console.warn('Footer placeholder not found');
    return;
  }

  const footerHTML = `
    <footer class="site-footer dynamic-electronic">
      <noscript class="no-js-note">Animations are disabled because JavaScript is turned off.</noscript>
      <div class="signal-grid" aria-hidden="true">
        <div class="signal-line horizontal"></div>
        <div class="signal-line vertical"></div>
        <div class="bolt-emitter left"></div>
        <div class="bolt-emitter right"></div>
      </div>

      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo glitch-hover">
              <img src="${basePath}assets/logo.png" alt="Pixel Phantoms Logo">
              <span class="brand-name neon-text">Pixel Phantoms</span>
            </div>
            <p class="footer-description">
              A community of passionate developers,<br>
              designers, and creators building amazing<br>
              digital experiences.
            </p>
            <div class="social-links dynamic-signals">
              <a href="https://github.com/sayeeg-11/Pixel_Phantoms" class="social-link" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>
              <a href="https://www.instagram.com/pixelphantoms_" class="social-link" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
              <a href="https://discord.com/" class="social-link" target="_blank" rel="noopener"><i class="fab fa-discord"></i></a>
              <a href="https://www.linkedin.com/company/pixel-phantoms/" class="social-link" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>

          <div class="footer-links-grid">
            <div class="link-group">
              <h3 class="link-group-title">Explore</h3>
              <ul class="link-list">
                <li><a href="${basePath}index.html">Home</a></li>
                <li><a href="${basePath}about.html">About Us</a></li>
                <li><a href="${basePath}pages/contributors.html">Our Team</a></li>
                <li><a href="${basePath}events.html">Events</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h3 class="link-group-title">Community</h3>
              <ul class="link-list">
                <li><a href="${basePath}pages/community.html">Community</a></li>
                <li><a href="${basePath}pages/projects.html">Projects</a></li>
                <li><a href="${basePath}pages/leaderboard.html">Leaderboard</a></li>
                <li><a href="${basePath}pages/join-us.html">Join Us</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h3 class="link-group-title">Support</h3>
              <ul class="link-list">
                <li><a href="${basePath}contact.html">Contact</a></li>
                <li><a href="${basePath}pages/help.html">Help Center</a></li>
                <li><a href="${basePath}pages/contribution-guide.html" target="_blank">Contributor Guide</a></li>
                <li><a href="${basePath}pages/code-of-conduct.html" target="_blank">Code of Conduct</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-newsletter">
            <h3 class="newsletter-title">Stay Updated</h3>
            <p class="newsletter-description">Subscribe to our newsletter for the latest updates.</p>
            <form class="newsletter-form">
              <div class="input-group">
                <input type="email" class="newsletter-input" placeholder="Enter your email" required>
                <button type="submit" class="newsletter-btn"><i class="fas fa-paper-plane"></i></button>
              </div>
            </form>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">
              © 2026 Pixel Phantoms. All rights reserved.
            </p>
            <div class="footer-bottom-links">
              <a href="${basePath}pages/privacy.html" class="bottom-link">Privacy</a> | 
              <a href="${basePath}pages/terms.html" class="bottom-link">Terms</a> | 
              <a href="${basePath}pages/tutorials.html" class="bottom-link">Tutorials</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;

  placeholder.innerHTML = footerHTML;
}
