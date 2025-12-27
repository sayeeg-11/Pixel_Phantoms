// File: js/projects-filters.js
// Quick Filters for Projects Page

document.addEventListener('DOMContentLoaded', function () {
  // Initialize quick filters
  initQuickFilters();

  // Initialize search functionality
  initSearch();

  // Initialize mobile filters
  initMobileFilters();

  // Update filter counts
  updateFilterCounts();

  console.log('Project filters initialized');
});

/**
 * Initialize Quick Filters
 */
function initQuickFilters() {
  const filterTags = document.querySelectorAll('.filter-tag');
  const projectCards = document.querySelectorAll('.project-card');
  const resetBtn = document.getElementById('reset-filters');
  const mobileToggle = document.getElementById('mobile-filter-toggle');

  // Track active filters
  let activeFilters = {
    category: 'all',
    quick: 'all',
    search: '',
    difficulty: null,
    tech: null,
    status: null,
  };

  // Function to filter projects
  function filterProjects() {
    let visibleCount = 0;
    const projectCards = document.querySelectorAll('.project-card');
    const totalCount = projectCards.length;

    projectCards.forEach(card => {
      // Use specific classes to avoid grabbing the wrong HTML content
      const category = card.getAttribute('data-category');
      const difficulty = card.getAttribute('data-difficulty');
      const tech = card.getAttribute('data-tech');
      const status = card.getAttribute('data-status');
      const isNew = card.getAttribute('data-new') === 'true';

      // Target text ONLY from the actual project headers and descriptions
      const titleEl = card.querySelector('h3');
      const descEl = card.querySelector('.card-content > p'); // Specific child selector

      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const description = descEl ? descEl.textContent.toLowerCase() : '';

      let showCard = true;

      // Category Filter
      if (activeFilters.category !== 'all' && category !== activeFilters.category) {
        showCard = false;
      }

      // Quick Filter
      if (activeFilters.quick !== 'all') {
        switch (activeFilters.quick) {
          case 'beginner':
            if (difficulty !== 'beginner') showCard = false;
            break;
          case 'javascript':
            if (tech !== 'javascript') showCard = false;
            break;
          case 'active':
            if (status !== 'active') showCard = false;
            break;
          case 'new':
            if (!isNew) showCard = false;
            break;
        }
      }

      // Search Filter - only checks relevant text
      if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase();
        if (!title.includes(searchTerm) && !description.includes(searchTerm)) {
          showCard = false;
        }
      }

      // Show/hide card
      if (showCard) {
        visibleCount++;
        gsap.to(card, { duration: 0.3, opacity: 1, scale: 1, display: 'flex' });
      } else {
        gsap.to(card, { duration: 0.3, opacity: 0, scale: 0.9, display: 'none' });
      }
    });

    updateResultsCounter(visibleCount, totalCount);
    showNoResultsMessage(visibleCount);
  }

  // Category filter buttons
  document.querySelectorAll('.btn-glitch-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.btn-glitch-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update active filter
      activeFilters.category = this.getAttribute('data-filter');

      // Animate the button
      gsap.to(this, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      // Filter projects
      filterProjects();

      // Update URL for sharing
      updateURLHash();
    });
  });

  // Quick filter tags
  filterTags.forEach(tag => {
    tag.addEventListener('click', function () {
      // Don't allow clicking active "all" filter
      if (this.classList.contains('active') && this.getAttribute('data-filter') === 'all') {
        return;
      }

      const filterValue = this.getAttribute('data-filter');

      // Handle "all" filter - reset all quick filters
      if (filterValue === 'all') {
        filterTags.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        activeFilters.quick = 'all';
      } else {
        // Toggle the clicked filter
        const isActive = this.classList.contains('active');

        if (isActive) {
          this.classList.remove('active');
          // If no quick filters active, set to "all"
          const anyActive = Array.from(filterTags).some(
            t => t.classList.contains('active') && t.getAttribute('data-filter') !== 'all'
          );
          if (!anyActive) {
            document.querySelector('.filter-tag[data-filter="all"]').classList.add('active');
            activeFilters.quick = 'all';
          }
        } else {
          // Remove "all" filter if another is selected
          document.querySelector('.filter-tag[data-filter="all"]').classList.remove('active');
          this.classList.add('active');
          activeFilters.quick = filterValue;
        }
      }

      // Animate the tag
      gsap.to(this, {
        scale: 0.9,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
      });

      // Filter projects
      filterProjects();

      // Update URL for sharing
      updateURLHash();
    });
  });

  // Reset filters button
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      // Reset all filters
      activeFilters = {
        category: 'all',
        quick: 'all',
        search: '',
        difficulty: null,
        tech: null,
        status: null,
      };

      // Reset UI
      document.querySelectorAll('.btn-glitch-filter').forEach(b => b.classList.remove('active'));
      document.querySelector('.btn-glitch-filter[data-filter="all"]').classList.add('active');

      filterTags.forEach(t => t.classList.remove('active'));
      document.querySelector('.filter-tag[data-filter="all"]').classList.add('active');

      // Clear search
      const searchInput = document.getElementById('project-search');
      if (searchInput) searchInput.value = '';

      // Reset mobile filter
      const mobileSelect = document.getElementById('mobile-filter-select');
      if (mobileSelect) mobileSelect.value = 'all';

      // Animate reset
      gsap.to(this, {
        rotation: 360,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Filter projects
      filterProjects();

      // Update URL
      window.location.hash = '';
    });
  }

  // Mobile filter toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      const filterContainer = document.querySelector('.quick-filter-tags');
      if (filterContainer) {
        filterContainer.classList.toggle('active');
        this.innerHTML = filterContainer.classList.contains('active')
          ? '<i class="fas fa-times"></i> Hide Filters'
          : '<i class="fas fa-filter"></i> Show More Filters';
      }
    });
  }

  // Update results counter
  function updateResultsCounter(visible, total) {
    const showingCount = document.getElementById('showing-count');
    const totalCount = document.getElementById('total-count');

    if (showingCount) showingCount.textContent = visible;
    if (totalCount) totalCount.textContent = total;
  }

  // Show no results message
  function showNoResultsMessage(visibleCount) {
    const grid = document.querySelector('.projects-grid');
    let noResults = document.querySelector('.no-results');

    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No Projects Found</h3>
                    <p>Try adjusting your filters or search terms to find what you're looking for.</p>
                `;

        // Add with animation
        gsap.fromTo(
          noResults,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );

        grid.appendChild(noResults);
      }
    } else if (noResults) {
      // Remove with animation
      gsap.to(noResults, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (noResults && noResults.parentNode) {
            noResults.parentNode.removeChild(noResults);
          }
        },
      });
    }
  }

  // Update URL hash for sharing filtered views
  function updateURLHash() {
    const hashParts = [];

    if (activeFilters.category !== 'all') {
      hashParts.push(`category=${activeFilters.category}`);
    }

    if (activeFilters.quick !== 'all') {
      hashParts.push(`filter=${activeFilters.quick}`);
    }

    if (activeFilters.search) {
      hashParts.push(`search=${encodeURIComponent(activeFilters.search)}`);
    }

    window.location.hash = hashParts.join('&');
  }

  // Parse URL hash on load
  function parseURLHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);

    // Set category filter
    const category = params.get('category');
    if (category) {
      const categoryBtn = document.querySelector(`.btn-glitch-filter[data-filter="${category}"]`);
      if (categoryBtn) {
        categoryBtn.click();
      }
    }

    // Set quick filter
    const filter = params.get('filter');
    if (filter) {
      const filterTag = document.querySelector(`.filter-tag[data-filter="${filter}"]`);
      if (filterTag) {
        filterTag.click();
      }
    }

    // Set search
    const search = params.get('search');
    if (search) {
      const searchInput = document.getElementById('project-search');
      if (searchInput) {
        searchInput.value = decodeURIComponent(search);
        activeFilters.search = decodeURIComponent(search);
        filterProjects();
      }
    }
  }

  // Call parseURLHash after initialization
  setTimeout(parseURLHash, 100);
}

/**
 * Initialize Search Functionality
 */
function initSearch() {
  const searchInput = document.getElementById('project-search');
  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const searchTerm = this.value.trim();
      const activeFilters = window.projectFilters || {};
      activeFilters.search = searchTerm;
      window.projectFilters = activeFilters;

      // Trigger filter update
      const event = new CustomEvent('filterUpdate', { detail: activeFilters });
      document.dispatchEvent(event);

      // Show/hide search icon
      const searchIcon = this.nextElementSibling;
      if (searchIcon && searchIcon.tagName === 'I') {
        if (searchTerm) {
          searchIcon.className = 'fas fa-times';
          searchIcon.style.cursor = 'pointer';

          // Add clear functionality
          searchIcon.onclick = function () {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          };
        } else {
          searchIcon.className = 'fas fa-search';
          searchIcon.style.cursor = 'default';
          searchIcon.onclick = null;
        }
      }
    }, 300);
  });

  // Listen for filter updates
  document.addEventListener('filterUpdate', function (e) {
    // This will be handled by the main filter function
  });
}

/**
 * Initialize Mobile Filters
 */
function initMobileFilters() {
  const mobileSelect = document.getElementById('mobile-filter-select');
  if (!mobileSelect) return;

  mobileSelect.addEventListener('change', function () {
    const value = this.value;

    // Map mobile values to filter types
    switch (value) {
      case 'all':
        // Trigger reset
        document.querySelector('.filter-tag[data-filter="all"]').click();
        document.querySelector('.btn-glitch-filter[data-filter="all"]').click();
        break;

      case 'beginner':
      case 'javascript':
      case 'active':
      case 'new':
        // Trigger quick filter
        document.querySelector(`.filter-tag[data-filter="${value}"]`).click();
        break;

      case 'web':
      case 'ai':
      case 'app':
      case 'hardware':
        // Trigger category filter
        document.querySelector(`.btn-glitch-filter[data-filter="${value}"]`).click();
        break;
    }

    // Close mobile filter dropdown if open
    const filterContainer = document.querySelector('.quick-filter-tags');
    if (filterContainer && filterContainer.classList.contains('active')) {
      filterContainer.classList.remove('active');
      const toggleBtn = document.getElementById('mobile-filter-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Show More Filters';
      }
    }
  });
}

/**
 * Update Filter Counts
 */
function updateFilterCounts() {
  const projectCards = document.querySelectorAll('.project-card');

  // Initialize counts
  const counts = {
    all: projectCards.length,
    beginner: 0,
    javascript: 0,
    active: 0,
    new: 0,
  };

  // Count projects for each filter
  projectCards.forEach(card => {
    if (card.getAttribute('data-difficulty') === 'beginner') counts.beginner++;
    if (card.getAttribute('data-tech') === 'javascript') counts.javascript++;
    if (card.getAttribute('data-status') === 'active') counts.active++;
    if (card.getAttribute('data-new') === 'true') counts.new++;
  });

  // Update count displays
  Object.keys(counts).forEach(key => {
    const countElement = document.getElementById(`count-${key}`);
    if (countElement) {
      countElement.textContent = counts[key];
    }
  });
}

// Export functions for use in other scripts
window.projectFilters = {
  initQuickFilters,
  initSearch,
  initMobileFilters,
  updateFilterCounts,
};
