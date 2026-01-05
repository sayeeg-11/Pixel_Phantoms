const FavoritesManager = {
  // Storage key for favorites
  STORAGE_KEY: 'pixel_phantoms_favorites',

  // Initialize the favorites system
  init: function () {
    console.log('Initializing Favorites Manager...');

    // Load favorites from localStorage
    this.loadFavorites();

    // Initialize bookmark buttons
    this.initBookmarkButtons();

    // Initialize favorites filter
    this.initFavoritesFilter();

    // Initialize empty state
    this.updateEmptyState();

    console.log('Favorites Manager initialized successfully');
  },

  // Load favorites from localStorage
  loadFavorites: function () {
    try {
      const savedFavorites = localStorage.getItem(this.STORAGE_KEY);
      this.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
    return this.favorites;
  },

  // Save favorites to localStorage
  saveFavorites: function () {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },

  // Add project to favorites
  addFavorite: function (projectId, projectData = null) {
    if (!this.favorites.includes(projectId)) {
      this.favorites.push(projectId);
      this.saveFavorites();

      // Save project data if provided
      if (projectData) {
        this.saveProjectData(projectId, projectData);
      }

      // Update UI
      this.updateBookmarkButton(projectId, true);
      this.updateEmptyState();

      console.log(`Added project ${projectId} to favorites`);
      this.showNotification('Project added to favorites!', 'success');

      return true;
    }
    return false;
  },

  // Remove project from favorites
  removeFavorite: function (projectId) {
    const index = this.favorites.indexOf(projectId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.saveFavorites();

      // Update UI
      this.updateBookmarkButton(projectId, false);
      this.updateEmptyState();

      console.log(`Removed project ${projectId} from favorites`);
      this.showNotification('Project removed from favorites', 'info');

      return true;
    }
    return false;
  },

  // Toggle favorite status
  toggleFavorite: function (projectId, projectData = null) {
    if (this.isFavorite(projectId)) {
      return this.removeFavorite(projectId);
    } else {
      return this.addFavorite(projectId, projectData);
    }
  },

  // Check if project is favorite
  isFavorite: function (projectId) {
    return this.favorites.includes(projectId);
  },

  // Get all favorite projects
  getFavorites: function () {
    return this.favorites;
  },

  // Save project data for reference
  saveProjectData: function (projectId, projectData) {
    const key = `pixel_phantoms_project_${projectId}`;
    try {
      localStorage.setItem(key, JSON.stringify(projectData));
    } catch (error) {
      console.error(`Error saving project data for ${projectId}:`, error);
    }
  },

  // Get project data
  getProjectData: function (projectId) {
    const key = `pixel_phantoms_project_${projectId}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading project data for ${projectId}:`, error);
      return null;
    }
  },

  // Initialize bookmark buttons on project cards
  initBookmarkButtons: function () {
    // Add bookmark buttons to existing cards
    const projectCards = document.querySelectorAll('.cyber-card.project-card');

    projectCards.forEach(card => {
      const projectId =
        card.getAttribute('data-project-id') ||
        card.querySelector('.project-id')?.textContent?.replace('#', '') ||
        'project-' + Math.random().toString(36).substr(2, 9);

      // Set data attribute if not present
      if (!card.getAttribute('data-project-id')) {
        card.setAttribute('data-project-id', projectId);
      }

      // Create bookmark button if not exists
      if (!card.querySelector('.project-bookmark-btn')) {
        const bookmarkBtn = document.createElement('div');
        bookmarkBtn.className = 'project-bookmark-btn';
        bookmarkBtn.setAttribute('data-project-id', projectId);
        bookmarkBtn.setAttribute('role', 'button');
        bookmarkBtn.setAttribute('aria-label', 'Bookmark project');
        bookmarkBtn.setAttribute('tabindex', '0');

        const icon = document.createElement('i');
        icon.className = 'bookmark-icon fas fa-heart';
        bookmarkBtn.appendChild(icon);

        // Insert bookmark button
        const imageWrapper = card.querySelector('.card-image-wrapper');
        if (imageWrapper) {
          imageWrapper.appendChild(bookmarkBtn);
        } else {
          card.insertBefore(bookmarkBtn, card.firstChild);
        }

        // Add favorite badge if already favorited
        if (this.isFavorite(projectId)) {
          bookmarkBtn.classList.add('active');
          this.addFavoriteBadge(card);
        }

        // Add click event
        bookmarkBtn.addEventListener('click', e => {
          e.stopPropagation();
          this.handleBookmarkClick(projectId, bookmarkBtn, card);
        });

        // Add keyboard support
        bookmarkBtn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleBookmarkClick(projectId, bookmarkBtn, card);
          }
        });
      }
    });
  },

  // Handle bookmark button click
  handleBookmarkClick: function (projectId, button, card) {
    // Add loading animation
    button.classList.add('bookmarking');

    // Get project data
    const projectData = {
      id: projectId,
      title: card.querySelector('h3')?.textContent || 'Unknown Project',
      description: card.querySelector('p')?.textContent || '',
      tech: Array.from(card.querySelectorAll('.tech-stack-terminal span')).map(
        span => span.textContent
      ),
      difficulty: card.getAttribute('data-difficulty') || 'intermediate',
      category: card.getAttribute('data-category') || 'web',
      status: card.getAttribute('data-status') || 'active',
      timestamp: new Date().toISOString(),
    };

    // Toggle favorite
    const wasAdded = this.toggleFavorite(projectId, projectData);

    // Update badge
    if (wasAdded) {
      this.addFavoriteBadge(card);
    } else {
      this.removeFavoriteBadge(card);
    }

    // Remove loading animation
    setTimeout(() => {
      button.classList.remove('bookmarking');
    }, 600);
  },

  // Update bookmark button state
  updateBookmarkButton: function (projectId, isFavorite) {
    const bookmarkBtn = document.querySelector(
      `.project-bookmark-btn[data-project-id="${projectId}"]`
    );
    if (bookmarkBtn) {
      if (isFavorite) {
        bookmarkBtn.classList.add('active');
      } else {
        bookmarkBtn.classList.remove('active');
      }
    }
  },

  // Add favorite badge to card
  addFavoriteBadge: function (card) {
    if (!card.querySelector('.favorite-badge')) {
      const badge = document.createElement('div');
      badge.className = 'favorite-badge';
      badge.innerHTML = '<i class="fas fa-heart"></i> FAVORITE';

      const imageWrapper = card.querySelector('.card-image-wrapper');
      if (imageWrapper) {
        imageWrapper.appendChild(badge);
      }
    }
  },

  // Remove favorite badge from card
  removeFavoriteBadge: function (card) {
    const badge = card.querySelector('.favorite-badge');
    if (badge) {
      badge.remove();
    }
  },

  // Initialize favorites filter
  initFavoritesFilter: function () {
    // Add favorites filter to quick filters
    const quickFilters = document.getElementById('quick-filters');
    if (quickFilters && !quickFilters.querySelector('.filter-tag.favorites')) {
      const favoritesFilter = document.createElement('span');
      favoritesFilter.className = 'filter-tag favorites';
      favoritesFilter.setAttribute('data-filter', 'favorites');
      favoritesFilter.innerHTML = `
                <i class="fas fa-heart"></i> My Favorites
                <span class="count" id="count-favorites">${this.favorites.length}</span>
            `;

      quickFilters.appendChild(favoritesFilter);

      // Add click event
      favoritesFilter.addEventListener('click', () => {
        this.filterFavorites();
      });
    }

    // Add favorites section to projects page
    this.createFavoritesSection();
  },

  // Create favorites section
  createFavoritesSection: function () {
    const projectsGrid = document.getElementById('projects-grid');
    const container = projectsGrid?.closest('.container');

    if (container && !container.querySelector('.favorites-section')) {
      const favoritesSection = document.createElement('section');
      favoritesSection.className = 'favorites-section';
      favoritesSection.innerHTML = `
                <div class="favorites-header">
                    <h2><i class="fas fa-heart"></i> MY FAVORITE PROJECTS</h2>
                    <button class="btn-sm" id="clear-favorites">
                        <i class="fas fa-trash-alt"></i> Clear All
                    </button>
                </div>
                <div class="empty-favorites" id="empty-favorites-state">
                    <i class="fas fa-heart-broken"></i>
                    <p>You haven't favorited any projects yet.</p>
                    <p>Click the <i class="fas fa-heart"></i> icon on any project card to add it here!</p>
                    <a href="#" class="btn-primary" onclick="document.querySelector('.filter-tag[data-filter=\\'all\\']')?.click()">
                        Browse All Projects
                    </a>
                </div>
                <div class="projects-grid" id="favorites-grid" style="display: none;"></div>
            `;

      container.insertBefore(favoritesSection, projectsGrid);

      // Add clear favorites functionality
      const clearBtn = document.getElementById('clear-favorites');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to remove all favorites?')) {
            this.clearAllFavorites();
          }
        });
      }
    }
  },

  // Filter to show only favorites
  filterFavorites: function () {
    const allCards = document.querySelectorAll('.cyber-card.project-card');
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-favorites-state');
    const favoritesSection = document.querySelector('.favorites-section');

    if (this.favorites.length === 0) {
      // Show empty state
      if (emptyState) emptyState.style.display = 'block';
      if (favoritesGrid) favoritesGrid.style.display = 'none';

      // Show notification
      this.showNotification('No favorite projects yet. Add some!', 'info');
      return;
    }

    // Hide all cards
    allCards.forEach(card => {
      card.style.display = 'none';
    });

    // Show only favorite cards
    this.favorites.forEach(projectId => {
      const card = document.querySelector(
        `.cyber-card.project-card[data-project-id="${projectId}"]`
      );
      if (card) {
        card.style.display = 'flex';

        // Add to favorites grid if not already there
        if (favoritesGrid && !favoritesGrid.contains(card)) {
          favoritesGrid.appendChild(card.cloneNode(true));
        }
      }
    });

    // Show favorites section
    if (favoritesGrid) {
      favoritesGrid.style.display = 'grid';
      emptyState.style.display = 'none';
    }

    // Update active filter state
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.classList.remove('active');
    });
    document.querySelector('.filter-tag.favorites')?.classList.add('active');

    // Scroll to favorites section
    if (favoritesSection) {
      favoritesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Clear all favorites
  clearAllFavorites: function () {
    if (this.favorites.length === 0) {
      this.showNotification('No favorites to clear', 'info');
      return;
    }

    // Remove from storage
    this.favorites = [];
    this.saveFavorites();

    // Update all bookmark buttons
    document.querySelectorAll('.project-bookmark-btn.active').forEach(btn => {
      btn.classList.remove('active');
    });

    // Remove all favorite badges
    document.querySelectorAll('.favorite-badge').forEach(badge => {
      badge.remove();
    });

    // Update UI
    this.updateEmptyState();
    this.updateFavoritesCount();

    this.showNotification('All favorites cleared', 'success');
  },

  // Update empty state visibility
  updateEmptyState: function () {
    const emptyState = document.getElementById('empty-favorites-state');
    const favoritesGrid = document.getElementById('favorites-grid');

    if (emptyState && favoritesGrid) {
      if (this.favorites.length === 0) {
        emptyState.style.display = 'block';
        favoritesGrid.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        favoritesGrid.style.display = 'grid';
      }
    }
  },

  // Update favorites count in filter
  updateFavoritesCount: function () {
    const countElement = document.getElementById('count-favorites');
    if (countElement) {
      countElement.textContent = this.favorites.length;
    }
  },

  // Show notification
  showNotification: function (message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `favorite-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 170, 255, 0.9)'};
            color: #000;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  },

  // Export favorites (for backup)
  exportFavorites: function () {
    const data = {
      favorites: this.favorites,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-phantoms-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('Favorites exported successfully', 'success');
  },

  // Import favorites (from backup)
  importFavorites: function (file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.favorites && Array.isArray(data.favorites)) {
          this.favorites = data.favorites;
          this.saveFavorites();
          this.initBookmarkButtons();
          this.updateEmptyState();
          this.updateFavoritesCount();
          this.showNotification('Favorites imported successfully!', 'success');
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing favorites:', error);
        this.showNotification('Error importing favorites. Invalid file.', 'error');
      }
    };
    reader.readAsText(file);
  },
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initialize favorites manager
  FavoritesManager.init();

  // Make it available globally
  window.FavoritesManager = FavoritesManager;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        
        .favorite-notification.error {
            background: rgba(255, 0, 85, 0.9) !important;
            color: white !important;
        }
    `;
  document.head.appendChild(style);

  console.log('Favorites system ready!');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FavoritesManager;
}
