// Global state to store items
window.allProjects = [];

async function initProjectLoader() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Show skeletons immediately
  showSkeletons(grid, 6);

  try {
    const response = await fetch('../data/projects.json');
    if (!response.ok) throw new Error('Failed to fetch project data');
    const projects = await response.json();

    // Store globally for filtering/sorting
    window.allProjects = projects;

    // Initial render (default sort: newest)
    sortAndRender('newest');

    // 4. Re-initialize other modules that depend on the cards
    initializeDependentModules();

    console.log(`[SmartLoader] Successfully loaded ${projects.length} projects.`);

    // Listen for sort changes
    const sortSelect = document.getElementById('project-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        sortAndRender(e.target.value);
      });
    }
  } catch (error) {
    console.error('[SmartLoader] Error:', error);
    grid.innerHTML = `<div class="error-msg">Failed to load projects. System link offline.</div>`;
  }
}

/**
 * Renders skeleton placeholders
 */
function showSkeletons(container, count) {
  let skeletonHtml = '';
  for (let i = 0; i < count; i++) {
    skeletonHtml += `
      <div class="project-skeleton">
        <div class="skeleton-image skeleton-shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-id skeleton-shimmer"></div>
          <div class="skeleton-title skeleton-shimmer"></div>
          <div class="skeleton-desc skeleton-shimmer"></div>
          <div class="skeleton-desc short skeleton-shimmer"></div>
          <div class="skeleton-tag-group">
            <div class="skeleton-tag skeleton-shimmer"></div>
            <div class="skeleton-tag skeleton-shimmer"></div>
            <div class="skeleton-tag skeleton-shimmer"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-link skeleton-shimmer"></div>
            <div class="skeleton-icon skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = skeletonHtml;
}

/**
 * Sorts project data and renders cards
 */
function sortAndRender(sortBy) {
  const projects = [...window.allProjects];

  switch (sortBy) {
    case 'newest':
      projects.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      break;
    case 'oldest':
      projects.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      break;
    case 'alphabetical':
      projects.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'reverse-alpha':
      projects.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderProjects(projects);
}

/**
 * Renders a list of projects to the grid
 */
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';
  projects.forEach(project => {
    const card = createProjectCard(project);
    grid.appendChild(card);
  });

  // Re-run animations if they exist
  if (window.animateCards) window.animateCards();

  // Update counts in case filtering is active
  if (window.projectFilters && window.projectFilters.updateFilterCounts) {
    window.projectFilters.updateFilterCounts();
  }
}

/**
 * Creates an HTML article element for a project card
 */
function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'cyber-card project-card';
  article.setAttribute('data-category', project.category);
  article.setAttribute('data-difficulty', project.difficulty);
  // Improved tech tag logic: join them for better search/filter
  article.setAttribute('data-tech', project.tech.join(' ').toLowerCase());
  article.setAttribute('data-status', project.status);
  article.setAttribute('data-new', project.new);
  article.setAttribute('data-date', project.date || '');
  article.setAttribute('data-full-desc', project.full_desc);
  article.setAttribute('data-live-url', project.live_url);
  article.setAttribute('data-tilt', '');

  const techStackHtml = project.tech.map(t => `<span class="tech-tag">[${t}]</span>`).join('');

  let statusClass = 'online';
  if (project.status === 'processing') statusClass = 'processing';
  if (project.status === 'warning') statusClass = 'warning';

  article.innerHTML = `
    <div class="card-border-top"></div>
    <div class="card-image-wrapper">
      <img src="${project.image}" alt="${project.name}" loading="lazy" />
      <div class="glitch-overlay"></div>
      <div class="scan-line"></div>
    </div>
    <div class="difficulty-badge difficulty-${project.difficulty}">${project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}</div>
    <div class="card-content">
      <div class="card-header">
        <span class="project-id">${project.id}</span>
        <span class="status-dot ${statusClass}"></span>
      </div>
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <div class="tech-stack-terminal">
        ${techStackHtml}
      </div>
      <div class="card-actions">
        <span class="btn-terminal">VIEW_DETAILS ></span>
        <a href="${project.github_url || '#'}" class="icon-link ${project.github_url ? '' : 'disabled'}" ${project.github_url ? 'target="_blank"' : 'tabindex="-1"'}>
          <i class="fab fa-github"></i>
        </a>
      </div>
    </div>
  `;

  return article;
}

/**
 * Re-initializes modules like GSAP animations, filters, and modals
 */
function initializeDependentModules() {
  if (window.animateCards) {
    window.animateCards();
  }

  if (window.projectFilters && window.projectFilters.updateFilterCounts) {
    window.projectFilters.updateFilterCounts();
  }

  if (window.initProjectModals) {
    window.initProjectModals();
  } else {
    document.dispatchEvent(new Event('projectsLoaded'));
  }

  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.project-card'));
  }
}

// Export functions to window
window.renderProjects = renderProjects;
window.sortAndRender = sortAndRender;

// Start loading
document.addEventListener('DOMContentLoaded', initProjectLoader);
