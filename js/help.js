// js/help.js
document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. HERO ANIMATIONS ---
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

  tl.to('.help-hero h1', { opacity: 1, y: 0 })
    .to('.help-hero p', { opacity: 1, y: 0 }, '-=0.6')
    .to('.search-wrapper', { opacity: 1, scale: 1 }, '-=0.6');

  // --- 2. HELP GRID STAGGER ---
  gsap.to('.help-card', {
    scrollTrigger: {
      trigger: '.help-grid',
      start: 'top 80%', // Start when top of grid hits 80% of viewport height
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2, // Stagger each card by 0.2s
    ease: 'power2.out',
  });

  // --- 3. HORIZONTAL SCROLL LOGIC (FIXED) ---
  const container = document.querySelector('.horizontal-container');

  // Calculate the total scrollable width: Total Width - Viewport Width
  // This gives us exactly how many pixels we need to move left to see the end.
  function getScrollAmount() {
    let racesWidth = container.scrollWidth;
    return -(racesWidth - window.innerWidth);
  }

  const tween = gsap.to(container, {
    x: getScrollAmount,
    ease: 'none',
  });

  ScrollTrigger.create({
    trigger: '.team-scroll-wrapper',
    start: 'top top',
    end: () => `+=${getScrollAmount() * -1}`, // Scroll duration equals the width of travel
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true, // Recalculate on resize
    // markers: true // Uncomment for debugging
  });

  // --- 4. PARALLAX CARD ANIMATION INSIDE SCROLL ---
  // Animate cards slightly as they move to give a "pop" effect
  const cards = gsap.utils.toArray('.team-desc-card');
  cards.forEach(card => {
    gsap.to(card, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: card,
        containerAnimation: tween, // Important: Link to horizontal scroll
        start: 'left center',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // --- 5. CTA SECTION REVEAL ---
  gsap.to('.cta-content', {
    scrollTrigger: {
      trigger: '.help-cta',
      start: 'top 75%',
    },
    opacity: 1,
    y: 0,
    duration: 1,
  });

  // --- SEARCH BAR INTERACTION ---
  const searchInput = document.querySelector('.help-search');
  searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.transform = 'scale(1.02)';
  });
  searchInput.addEventListener('blur', () => {
    searchInput.parentElement.style.transform = 'scale(1)';
  });
});
