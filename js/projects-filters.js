// File: js/projects-filters.js
// Smart Filter & Sort Integration

document.addEventListener('DOMContentLoaded', function () {
  initSmartFilters();
  console.log('Smart Project filters initialized');
});

function initSmartFilters() {
  const filterTags = document.querySelectorAll('.filter-tag');
  const catBtns = document.querySelectorAll('.btn-glitch-filter');
  const resetBtn = document.getElementById('reset-filters');
  const sortSelect = document.getElementById('project-sort');

  // Unified state
  window.currentFilters = {
    category: 'all',
    quick: 'all',
    search: '',
    sort: 'newest',
  };

  /**
   * Main function to filter, sort and render
   */
  function applySystemProtocols() {
    if (!window.allProjects || window.allProjects.length === 0) return;

    let results = [...window.allProjects];

    // 1. FILTER
    results = results.filter(project => {
      // Category check
      if (
        window.currentFilters.category !== 'all' &&
        project.category !== window.currentFilters.category
      ) {
        return false;
      }

      // Quick filter tags
      if (window.currentFilters.quick !== 'all') {
        switch (window.currentFilters.quick) {
          case 'beginner':
            if (project.difficulty !== 'beginner') return false;
            break;
          case 'javascript':
            if (
              !project.tech.some(
                t => t.toLowerCase().includes('js') || t.toLowerCase().includes('javascript')
              )
            )
              return false;
            break;
          case 'active':
            if (project.status !== 'active' && project.status !== 'online') return false;
            break;
          case 'new':
            if (!project.new) return false;
            break;
        }
      }

      // Search check
      if (window.currentFilters.search) {
        const term = window.currentFilters.search.toLowerCase();
        const inName = project.name.toLowerCase().includes(term);
        const inDesc = project.description.toLowerCase().includes(term);
        const inTech = project.tech.some(t => t.toLowerCase().includes(term));
        if (!inName && !inDesc && !inTech) return false;
      }

      return true;
    });

    // 2. SORT
    const sortBy = window.currentFilters.sort;
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        break;
      case 'alphabetical':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'reverse-alpha':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    // 3. RENDER
    if (window.renderProjects) {
      window.renderProjects(results);
      updateUIStates(results.length, window.allProjects.length);
    }
  }

  // Event Listeners
  catBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      catBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      window.currentFilters.category = this.getAttribute('data-filter');
      applySystemProtocols();
    });
  });

  filterTags.forEach(tag => {
    tag.addEventListener('click', function () {
      const val = this.getAttribute('data-filter');
      if (this.classList.contains('active') && val === 'all') return;

      filterTags.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      window.currentFilters.quick = val;
      applySystemProtocols();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      window.currentFilters.sort = e.target.value;
      applySystemProtocols();
    });
  }

  const searchInput = document.getElementById('project-search');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        window.currentFilters.search = e.target.value;
        applySystemProtocols();
      }, 300);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.currentFilters = { category: 'all', quick: 'all', search: '', sort: 'newest' };
      catBtns.forEach(b => b.classList.remove('active'));
      document.querySelector('.btn-glitch-filter[data-filter="all"]').classList.add('active');
      filterTags.forEach(t => t.classList.remove('active'));
      document.querySelector('.filter-tag[data-filter="all"]').classList.add('active');
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      applySystemProtocols();
    });
  }

  // UI Helpers
  function updateUIStates(visible, total) {
    const showing = document.getElementById('showing-count');
    const totalEl = document.getElementById('total-count');
    if (showing) showing.textContent = visible;
    if (totalEl) totalEl.textContent = total;

    // No Results message
    const grid = document.getElementById('projects-grid');
    let msg = document.querySelector('.no-results');
    if (visible === 0) {
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'no-results';
        msg.innerHTML = `<h3><i class="fas fa-search"></i> NO_RESULTS_FOUND</h3><p>Try matching different protocols.</p>`;
        grid.appendChild(msg);
      }
    } else if (msg) {
      msg.remove();
    }
  }

  // Export updateFilterCounts for loader
  window.projectFilters = {
    updateFilterCounts: () => {
      // In this data-driven version, counts are updated during render
      // But we can implement a separate counter if needed for the UI tags
      const counts = { all: 0, beginner: 0, javascript: 0, active: 0, new: 0 };
      if (window.allProjects) {
        counts.all = window.allProjects.length;
        window.allProjects.forEach(p => {
          if (p.difficulty === 'beginner') counts.beginner++;
          if (p.tech.some(t => t.toLowerCase().includes('js'))) counts.javascript++;
          if (p.status === 'online' || p.status === 'active') counts.active++;
          if (p.new) counts.new++;
        });
      }
      Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
      });
    },
  };

  // Initial call once data is loaded (polled or triggered)
  document.addEventListener('projectsLoaded', applySystemProtocols);
}
