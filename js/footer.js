// js/footer.js

function renderFooter(basePath = '') {
    const footerHTML = `
    <div class="footer-container">
        <div class="footer-content">
            <div class="footer-brand">
                 <div class="footer-logo">
                    <img src="${basePath}assets/logo.png" alt="Pixel Phantoms Logo">
                    <span class="brand-name">Pixel Phantoms</span>
                </div>
                <p class="footer-description">
                    A community of passionate developers, designers, and creators building amazing digital experiences.
                </p>
                <div class="social-links">
                    <a href="https://github.com/sayeeg-11/Pixel_Phantoms" target="_blank" class="social-link" aria-label="GitHub"><i class="fab fa-github"></i></a>
                    <a href="https://www.linkedin.com/company/pixel-phantoms/" target="_blank" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                    <a href="https://x.com/phantoms_pixel" target="_blank" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="https://discord.com/channels/1049667734025289729/1440205974806986844" target="_blank" class="social-link" aria-label="Discord"><i class="fab fa-discord"></i></a>
                </div>
            </div>

            <div class="footer-links">
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
                        <li><a href="${basePath}pages/leaderboard.html">Leaderboard</a></li> <li><a href="${basePath}pages/community.html">Community</a></li>
                        <li><a href="${basePath}pages/projects.html">Projects</a></li>
                        <li><a href="${basePath}pages/gallery.html">Gallery</a></li>
                        <li><a href="${basePath}pages/join-us.html">Join Us</a></li>
                    </ul>
                </div>

                <div class="link-group">
                    <h3 class="link-group-title">Support</h3>
                    <ul class="link-list">
                        <li><a href="${basePath}contact.html">Contact</a></li>
                        <li><a href="${basePath}pages/help.html">Help Center</a></li>
                        <li><a href="${basePath}pages/privacy.html">Privacy Policy</a></li>
                        <li><a href="${basePath}pages/terms.html">Terms of Service</a></li>
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
                <p class="copyright">&copy; 2025 Pixel Phantoms. All rights reserved.</p>
                <div class="footer-bottom-links">
                    <a href="#" class="bottom-link">Privacy</a> | <a href="#" class="bottom-link">Terms</a> | <a href="#" class="bottom-link">Sitemap</a>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById('footer-placeholder').innerHTML = footerHTML;
}