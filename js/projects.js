document.addEventListener('DOMContentLoaded', () => {
  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Initial Reveal Animation
  animateCards();

  // Setup Filter Logic
  initFilters();

  // Setup Wobble Toggle
  initWobbleToggle();

  // Initialize System Console (Dynamic Data Fetching)
  initSystemConsole();
});

function animateCards() {
  gsap.fromTo(
    '.project-card',
    {
      y: 50,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(5px)',
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'all', // Clear styles to allow hover effects
    }
  );
}

function initFilters() {
  const buttons = document.querySelectorAll('.btn-glitch-filter');
  const cards = document.querySelectorAll('.project-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Update Active State
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 2. Get Filter Value
      const filterValue = btn.getAttribute('data-filter');

      // 3. Glitch/Filter Animation Logic
      const timeline = gsap.timeline();

      // Step A: "Despawn" all cards briefly with a flash effect
      timeline.to(cards, {
        duration: 0.2,
        opacity: 0,
        scale: 0.95,
        filter: 'brightness(2) blur(10px)',
        ease: 'power1.in',
        onComplete: () => {
          // Step B: Toggle visibility
          cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (filterValue === 'all' || filterValue === cardCategory) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        },
      });

      // Step C: "Respawn" visible cards
      timeline.to(cards, {
        duration: 0.4,
        opacity: 1,
        scale: 1,
        filter: 'brightness(1) blur(0px)',
        ease: 'back.out(1.7)',
        stagger: {
          amount: 0.2,
          from: 'random', // Random spawn order for hacker feel
        },
        clearProps: 'filter, opacity, scale',
      });
    });
  });
}

function initWobbleToggle() {
  const toggle = document.getElementById('wobble-toggle');
  const card = document.getElementById('wocs-card');

  if (toggle && card) {
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        card.classList.add('wobbling');
      } else {
        card.classList.remove('wobbling');
      }
    });
  }
}
const PROJECT_DATA = [
  {
      "id": 1,
      "title": "Neural Nexus",
      "status": "active",
      "description": "AI-powered neural network visualization tool",
      "tech": ["Python", "TensorFlow", "React"]
  },
  {
      "id": 2,
      "title": "Quantum Quest",
      "status": "active", 
      "description": "Quantum computing simulation platform",
      "tech": ["JavaScript", "Three.js", "Node.js"]
  },
  {
      "id": 3,
      "title": "Cyber Sentinel",
      "status": "active",
      "description": "Real-time cybersecurity monitoring system",
      "tech": ["Python", "Django", "Redis"]
  },
  {
      "id": 4,
      "title": "Data Flow",
      "status": "active",
      "description": "Interactive data pipeline visualization",
      "tech": ["React", "D3.js", "Express"]
  },
  {
      "id": 5,
      "title": "Code Canvas",
      "status": "active",
      "description": "Visual programming environment",
      "tech": ["TypeScript", "Vue.js", "WebGL"]
  },
  {
      "id": 6,
      "title": "Pixel Portal",
      "status": "active",
      "description": "Community collaboration platform",
      "tech": ["Next.js", "MongoDB", "Socket.io"]
  },
  {
      "id": 7,
      "title": "VR Vision",
      "status": "active",
      "description": "Virtual reality development framework",
      "tech": ["Unity", "C#", "Blender"]
  },
  {
      "id": 8,
      "title": "Block Beacon",
      "status": "active",
      "description": "Blockchain transaction tracker",
      "tech": ["Solidity", "Ethereum", "React"]
  }
];
/**
 * Dynamic System Console
 * Fetches data from projects.json and updates the terminal box
 */
function initSystemConsole() {
  const consoleBox = document.querySelector('.terminal-box');
  if (!consoleBox) return;

  // Fetch the project data
  // Note: Path is relative to the HTML file (pages/projects.html -> data/projects.json)
 
  // Use the static data directly instead of fetching
  const totalProjects = PROJECT_DATA.length;
  const activeProjects = PROJECT_DATA.filter(p => p.status === 'active').length;
      // Define the sequence of messages based on real data
      const messages = [
        { text: '> Accessing secure vault...', delay: 0 },
        { text: '> Decrypting project files...', delay: 800 },
        { text: `> Database Check: Found ${totalProjects} Archives.`, delay: 1600 },
        {
          text: `> Access Granted. ${activeProjects} Active Modules Online.`,
          delay: 2400,
          className: 'success',
        },
        // NEW LINES ADDED BELOW
        { text: '> Establishing secure data uplink...', delay: 3200 },
        {
          text: '> System integrity verified. Visualization engaged.',
          delay: 4000,
          className: 'success',
        },
      ];

      // Clear any initial static text
      consoleBox.innerHTML = '';

      // Play the animation sequence
  messages.forEach(msg => {
    setTimeout(() => {
      const p = document.createElement('p');
      p.className = `console-text ${msg.className || ''}`;
      p.textContent = msg.text;
      consoleBox.appendChild(p);
    }, msg.delay);
  });
}
// =========================================
// INTEGRATE QUICK FILTERS WITH EXISTING GSAP ANIMATIONS
// =========================================

// Override the initFilters function to work with quick filters
const originalInitFilters = window.initFilters;

window.initFilters = function () {
  // Load the quick filters script
  if (typeof window.projectFilters === 'undefined') {
    console.warn('Quick filters not loaded. Loading now...');

    // Create script element and load it
    const script = document.createElement('script');
    script.src = 'js/projects-filters.js';
    script.onload = function () {
      console.log('Quick filters loaded successfully');
      window.projectFilters.initQuickFilters();
      window.projectFilters.initSearch();
      window.projectFilters.initMobileFilters();
      window.projectFilters.updateFilterCounts();
    };
    document.head.appendChild(script);
  } else {
    // Quick filters already loaded, just initialize them
    window.projectFilters.initQuickFilters();
    window.projectFilters.initSearch();
    window.projectFilters.initMobileFilters();
    window.projectFilters.updateFilterCounts();
  }

  // Also run the original filter initialization
  if (originalInitFilters) {
    originalInitFilters();
  }
};

// Override the animateCards function to include filter counts
const originalAnimateCards = window.animateCards;

window.animateCards = function () {
  if (originalAnimateCards) {
    originalAnimateCards();
  }

  // Update filter counts after animation
  setTimeout(() => {
    if (window.projectFilters && window.projectFilters.updateFilterCounts) {
      window.projectFilters.updateFilterCounts();
    }
  }, 1000);
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize GSAP ScrollTrigger
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Run animations
  if (window.animateCards) {
    window.animateCards();
  }

  // Setup Wobble Toggle
  if (window.initWobbleToggle) {
    window.initWobbleToggle();
  }

  // Setup Filters (including quick filters)
  if (window.initFilters) {
    window.initFilters();
  }

  console.log('Projects page fully initialized with quick filters');
});

// Extend the filter system to work with favorites
document.addEventListener('DOMContentLoaded', function () {
  // Override filter function to include favorites
  const originalFilterFunction = window.initFilters;

  window.initFilters = function () {
    // Call original function
    if (originalFilterFunction) originalFilterFunction();

    // Initialize favorites integration
    initFavoritesIntegration();
  };

  function initFavoritesIntegration() {
    // Wait for favorites manager to initialize
    setTimeout(() => {
      if (window.FavoritesManager) {
        // Update filter counts to include favorites
        updateFilterCountsWithFavorites();

        // Add favorites to mobile filter
        addFavoritesToMobileFilter();
      }
    }, 1000);
  }

  function updateFilterCountsWithFavorites() {
    const favoritesCount = document.getElementById('count-favorites');
    if (favoritesCount) {
      const count = window.FavoritesManager.getFavorites().length;
      favoritesCount.textContent = count;
    }
  }

  function addFavoritesToMobileFilter() {
    const mobileSelect = document.getElementById('mobile-filter-select');
    if (mobileSelect) {
      // Check if favorites option already exists
      let hasFavorites = false;
      Array.from(mobileSelect.options).forEach(option => {
        if (option.value === 'favorites') hasFavorites = true;
      });

      // Add favorites option if not exists
      if (!hasFavorites) {
        const option = document.createElement('option');
        option.value = 'favorites';
        option.textContent = 'My Favorites';
        mobileSelect.appendChild(option);
      }

      // Update change handler
      mobileSelect.addEventListener('change', function () {
        if (this.value === 'favorites') {
          window.FavoritesManager.filterFavorites();
        }
      });
    }
  }
});
