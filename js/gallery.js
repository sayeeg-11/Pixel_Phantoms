document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initLightbox();
    initSmoothScroll();
});

/* 1. SCROLL REVEAL ANIMATION */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load
}

/* 2. LIGHTBOX FUNCTIONALITY */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-lightbox');
    
    // Get all gallery images
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            lightbox.style.display = "flex"; // Flex to center
            lightbox.style.flexDirection = "column";
            lightbox.style.justifyContent = "center";
            
            lightboxImg.src = img.src;
            captionText.innerHTML = img.alt || 'Gallery Image';
            
            // Disable body scroll
            document.body.style.overflow = 'hidden';
        });
    });

    // Close functions
    const closeLightbox = () => {
        lightbox.style.display = "none";
        document.body.style.overflow = 'auto'; // Re-enable scroll
    }

    closeBtn.addEventListener('click', closeLightbox);

    // Close on clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display !== 'none') {
            closeLightbox();
        }
    });
}

/* 3. SMOOTH SCROLL FOR NAV */
function initSmoothScroll() {
    document.querySelectorAll('.gallery-nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Update active class
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Scroll
            if (targetSection) {
                // Offset for sticky nav
                const offset = 130; 
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetSection.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}