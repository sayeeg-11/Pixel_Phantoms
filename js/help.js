// js/help.js
document.addEventListener('DOMContentLoaded', () => {
  
  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. HERO ANIMATIONS ---
  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
  
  tl.to(".help-hero h1", { opacity: 1, y: 0 })
    .to(".help-hero p", { opacity: 1, y: 0 }, "-=0.6")
    .to(".search-wrapper", { opacity: 1, scale: 1 }, "-=0.6");

  // --- 2. HELP GRID STAGGER ---
  gsap.to(".help-card", {
    scrollTrigger: {
      trigger: ".help-grid",
      start: "top 80%",
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
  });

  gsap.to(".team-intro", {
    scrollTrigger: {
      trigger: ".team-section",
      start: "top 70%",
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out"
  });

  gsap.to(".team-card", {
    scrollTrigger: {
      trigger: ".team-grid",
      start: "top 80%",
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.3,
    ease: "power2.out"
  });

  gsap.to(".cta-content", {
    scrollTrigger: {
      trigger: ".help-cta",
      start: "top 75%"
    },
    opacity: 1,
    y: 0,
    duration: 1
  });

  const searchInput = document.querySelector('.help-search');
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      searchInput.parentElement.style.transform = "scale(1.02)";
    });
    searchInput.addEventListener('blur', () => {
      searchInput.parentElement.style.transform = "scale(1)";
    });
  }

  const teamCards = document.querySelectorAll('.team-card');
  
  teamCards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '1';
    });
  });

  function setupSearch() {
    const searchInput = document.querySelector('.help-search');
    const helpCards = document.querySelectorAll('.help-card');
    const teamCards = document.querySelectorAll('.team-card');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      helpCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        
        card.style.display = isVisible ? 'block' : 'none';
        
        if (isVisible) {
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.3
          });
        } else {
          gsap.to(card, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3
          });
        }
      });
      
      teamCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const role = card.querySelector('.role-badge').textContent.toLowerCase();
        const description = card.querySelector('.team-desc').textContent.toLowerCase();
        const isVisible = name.includes(searchTerm) || 
                         role.includes(searchTerm) || 
                         description.includes(searchTerm);
        
        card.style.display = isVisible ? 'flex' : 'none';
        
        if (isVisible) {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.3
          });
        } else {
          gsap.to(card, {
            opacity: 0,
            y: 20,
            duration: 0.3
          });
        }
      });
    });
  }
  
  setupSearch();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        ticking = false;
      });
      ticking = true;
    }
  });

  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    const style = document.createElement('style');
    style.textContent = `
      .touch-device .team-card:hover,
      .touch-device .help-card:hover {
        transform: none !important;
      }
      
      .touch-device .team-card:active,
      .touch-device .help-card:active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
    `;
    document.head.appendChild(style);
  }
});