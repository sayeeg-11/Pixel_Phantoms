// GitHub Repository Configuration
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State
let contributorsData = [];
let currentPage = 1;
const itemsPerPage = 3;

// Point System Weights
const POINTS = {
  L3: 11,
  L2: 5,
  L1: 2,
  DEFAULT: 1,
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupModalEvents();
});

// 1. Master Initialization Function
async function initData() {
  try {
    // Fetch Repo Info, Contributors, and Total Commits in parallel
    const [repoRes, contributorsRes, totalCommits] = await Promise.all([
      fetch(API_BASE),
      fetch(`${API_BASE}/contributors?per_page=100`),
      fetchTotalCommits(),
    ]);

    // Handle Errors (Rate Limits or 404s)
    if (repoRes.status === 403 || contributorsRes.status === 403) {
      throw new Error('API Rate Limit Exceeded');
    }
    if (!repoRes.ok || !contributorsRes.ok) {
      throw new Error('Repository not found or network error');
    }

    const repoData = await repoRes.json();
    const rawContributors = await contributorsRes.json();
    const rawPulls = await fetchAllPulls();

    processData(repoData, rawContributors, rawPulls, totalCommits);
    fetchRecentActivity(); // Only fetch real activity if main data worked
  } catch (error) {
    console.warn('⚠️ API Request Failed. Switching to Mock Data Mode.', error);
    loadMockData(); // <--- THIS SAVES THE PAGE FROM CRASHING
  }
}

// ---------------------------------------------------------
// FAILSAFE: MOCK DATA LOADER (Limit Recovery)
// ---------------------------------------------------------
function loadMockData() {
  // 1. Show a banner to indicate Demo Mode
  const grid = document.getElementById('contributors-grid');
  if (grid) {
    grid.insertAdjacentHTML(
      'beforebegin',
      `
            <div style="grid-column: 1/-1; background: rgba(255, 152, 0, 0.15); color: #ff9800; padding: 12px; text-align: center; border-radius: 8px; margin-bottom: 20px; font-weight: bold; border: 1px solid #ff9800;">
                <i class="fas fa-wifi"></i> Demo Mode: Displaying sample data (API Limit Reached or Offline)
            </div>
        `
    );
  }

  // 2. Populate Stats with Dummy Numbers (So cards don't say "Loading...")
  updateGlobalStats(15, 42, 1250, 128, 45, 310);

  // 3. Create Mock Contributors
  contributorsData = [
    {
      login: 'Satoshi_Nakamoto',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=1',
      html_url: '#',
      points: 250,
      prs: 20,
      contributions: 50,
    },
    {
      login: 'Ada_Lovelace',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=2',
      html_url: '#',
      points: 180,
      prs: 15,
      contributions: 40,
    },
    {
      login: 'Alan_Turing',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=3',
      html_url: '#',
      points: 120,
      prs: 10,
      contributions: 30,
    },
    {
      login: 'Grace_Hopper',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=4',
      html_url: '#',
      points: 90,
      prs: 8,
      contributions: 25,
    },
    {
      login: 'Linus_Torvalds',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=5',
      html_url: '#',
      points: 60,
      prs: 5,
      contributions: 15,
    },
    {
      login: 'Margaret_Hamilton',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=6',
      html_url: '#',
      points: 40,
      prs: 3,
      contributions: 10,
    },
    {
      login: 'Tim_Berners_Lee',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=7',
      html_url: '#',
      points: 20,
      prs: 2,
      contributions: 5,
    },
    {
      login: 'Pixel_Admin',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=8',
      html_url: '#',
      points: 10,
      prs: 1,
      contributions: 2,
    },
  ];

  renderContributors(1);

  // 4. Mock Activity Feed
  const activityList = document.getElementById('activity-list');
  if (activityList) {
    activityList.innerHTML = `
           <div class="activity-item">
    <div class="activity-marker bullet"></div>
    <div class="commit-msg"><span style="color: var(--accent-color)">Satoshi</span>: Optimized blockchain algorithm</div>
    <div class="commit-date">2 hours ago</div>
  </div>
  <div class="activity-item">
    <div class="activity-marker bullet"></div>
    <div class="commit-msg"><span style="color: var(--accent-color)">Ada</span>: Fixed layout bug in CSS</div>
    <div class="commit-date">5 hours ago</div>
  </div>
  <div class="activity-item">
    <div class="activity-marker bullet"></div>
    <div class="commit-msg"><span style="color: var(--accent-color)">System</span>: <strong>Deployed Mock Data Protocol</strong></div>
    <div class="commit-date">Just now</div>
  </div>
        `;
  }
}
// ---------------------------------------------------------

// Helper: Fetch Total Commits
async function fetchTotalCommits() {
  try {
    const res = await fetch(`${API_BASE}/commits?per_page=1`);
    if (!res.ok) return 'N/A';
    const linkHeader = res.headers.get('Link');
    if (linkHeader) {
      const match = linkHeader.match(/[?&]page=(\d+)[^>]*>; rel="last"/);
      if (match) return match[1];
    }
    const data = await res.json();
    return data.length;
  } catch (e) {
    return 'N/A';
  }
}

// Helper: Fetch Pull Requests
async function fetchAllPulls() {
  let pulls = [];
  let page = 1;
  try {
    while (page <= 3) {
      const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
      if (!res.ok) break;
      const data = await res.json();
      if (!data.length) break;
      pulls = pulls.concat(data);
      page++;
    }
  } catch (e) {
    console.warn('PR fetch warning', e);
  }
  return pulls;
}

// Process Data & Calculate Scores
function processData(repoData, contributors, pulls, totalCommits) {
  const leadAvatar = document.getElementById('lead-avatar');
  const statsMap = {};
  let totalProjectPRs = 0;
  let totalProjectPoints = 0;

  pulls.forEach(pr => {
    if (!pr.merged_at) return;
    const user = pr.user.login;
    if (!statsMap[user]) statsMap[user] = { prs: 0, points: 0 };
    statsMap[user].prs++;
    totalProjectPRs++;

    let prPoints = 0;
    let hasLevel = false;
    pr.labels.forEach(label => {
      const name = label.name.toLowerCase();
      if (name.includes('level 3')) {
        prPoints += POINTS.L3;
        hasLevel = true;
      } else if (name.includes('level 2')) {
        prPoints += POINTS.L2;
        hasLevel = true;
      } else if (name.includes('level 1')) {
        prPoints += POINTS.L1;
        hasLevel = true;
      }
    });
    if (!hasLevel) prPoints += POINTS.DEFAULT;
    statsMap[user].points += prPoints;
    totalProjectPoints += prPoints;
  });

  contributorsData = contributors.map(c => {
    const login = c.login;
    const userStats = statsMap[login] || { prs: 0, points: 0 };
    if (login.toLowerCase() === REPO_OWNER.toLowerCase() && leadAvatar) {
      leadAvatar.src = c.avatar_url;
    }
    return { ...c, prs: userStats.prs, points: userStats.points };
  });

  contributorsData = contributorsData
    .filter(c => c.login.toLowerCase() !== REPO_OWNER.toLowerCase() && c.prs > 0)
    .sort((a, b) => b.points - a.points);

  updateGlobalStats(
    contributorsData.length,
    totalProjectPRs,
    totalProjectPoints,
    repoData.stargazers_count,
    repoData.forks_count,
    totalCommits
  );
  renderContributors(1);
}

function updateGlobalStats(count, prs, points, stars, forks, commits) {
  const set = (id, val) => {
    const valueEl = document.getElementById(id);
    if (!valueEl) return;

    const wrapper = valueEl.parentElement;
    const spinner = wrapper ? wrapper.querySelector('.spinner') : null;

    valueEl.textContent = val;

    if (spinner) spinner.style.display = 'none';
    valueEl.style.display = 'inline';
  };

  set('total-contributors', count);
  set('total-prs', prs);
  set('total-points', points);
  set('total-stars', stars);
  set('total-forks', forks);
  set('total-commits', commits);
}

function getLeagueData(points) {
  if (points > 150)
    return { text: 'Gold 🏆', class: 'badge-gold', tier: 'tier-gold', label: 'Gold League' };
  if (points > 75)
    return {
      text: 'Silver 🥈',
      class: 'badge-silver',
      tier: 'tier-silver',
      label: 'Silver League',
    };
  if (points > 30)
    return {
      text: 'Bronze 🥉',
      class: 'badge-bronze',
      tier: 'tier-bronze',
      label: 'Bronze League',
    };
  return {
    text: 'Contributor 🎖️',
    class: 'badge-contributor',
    tier: 'tier-contributor',
    label: 'Contributor',
  };
}


// 3. Rectified Rendering (Forces "Elite" Layout)
function renderContributors(page) {
  const grid = document.getElementById('contributors-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = contributorsData.slice(start, end);

  if (paginatedItems.length === 0) {
    grid.innerHTML = '<p class="text-center">No active contributors found yet.</p>';
    return;
  }

  paginatedItems.forEach((contributor, index) => {
    const globalRank = start + index + 1;
    const league = getLeagueData(contributor.points);
    const card = document.createElement('article');

    // RECTIFIED: card structure matches Elite CSS
    card.className = `contributor-card ${league.tier}`;
    card.setAttribute('data-github', contributor.login);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
          <img src="${contributor.avatar_url}" alt="Avatar of ${contributor.login}" loading="lazy">
          <h3 class="cont-name">${contributor.login}</h3>
          <span class="cont-commits-badge ${league.class}">
              PRs: ${contributor.prs} | Pts: ${contributor.points}
          </span>
          
          <div class="github-stats">
            <div class="stat-item">
              <span class="stat-icon">📦</span>
              <span class="stat-value" data-stat="repos">...</span>
              <span class="stat-label">Repos</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👥</span>
              <span class="stat-value" data-stat="followers">...</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔗</span>
              <span class="stat-value" data-stat="following">...</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
          
          <div class="contribution-section">
            <div class="github-calendar" data-username="${contributor.login}">
              <span class="loading-text">Fetching activity...</span>
            </div>
          </div>
          
          <div class="recent-repos">
            <h4>Recent Projects</h4>
            <div class="repo-list"><span class="loading-text">Loading repos...</span></div>
          </div>
      `;

    card.addEventListener('click', () => openModal(contributor, league, globalRank));
    grid.appendChild(card);
  });

  renderPaginationControls(page);

  // Trigger integrations for the new page of cards
  setTimeout(() => {
    initGitHubIntegrations();
  }, 150);
}

// 4. Rectified Pagination (Increases page count display)
function renderPaginationControls(page) {
  const container = document.getElementById('pagination-controls');
  const totalPages = Math.ceil(contributorsData.length / itemsPerPage);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
      <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
          <i class="fas fa-chevron-left"></i> Prev
      </button>
      <span class="page-info">Page ${page} of ${totalPages}</span>
      <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
          Next <i class="fas fa-chevron-right"></i>
      </button>
  `;
}

window.changePage = function (newPage) {
  currentPage = newPage;
  renderContributors(newPage);

  // RECTIFIED: Smooth scroll back to top of grid so user sees the new cards immediately
  const gridTop = document.getElementById('top-contributors').offsetTop - 100;
  window.scrollTo({ top: gridTop, behavior: 'smooth' });
};
// Modal Logic
function setupModalEvents() {
  const modal = document.getElementById('contributor-modal');
  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn)
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeModal();
    });
  if (modal)
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
  });
}

function openModal(contributor, league, rank) {
  const modal = document.getElementById('contributor-modal');
  const modalContainer = modal.querySelector('.modal-container');
  document.getElementById('modal-avatar').src = contributor.avatar_url;
  document.getElementById('modal-name').textContent = contributor.login;
  document.getElementById('modal-id').textContent = `ID: ${contributor.id || 'N/A'}`;
  document.getElementById('modal-rank').textContent = `#${rank}`;
  document.getElementById('modal-score').textContent = contributor.points;
  document.getElementById('modal-prs').textContent = contributor.prs;
  document.getElementById('modal-commits').textContent = contributor.contributions || 0;
  document.getElementById('modal-league-badge').textContent = league.label;

  // Check for links in mock mode
  const prLink =
    contributor.html_url && contributor.html_url !== '#'
      ? `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls?q=is%3Apr+author%3A${contributor.login}`
      : '#';

  document.getElementById('modal-pr-link').href = prLink;
  document.getElementById('modal-profile-link').href = contributor.html_url || '#';

  modalContainer.className = 'modal-container';
  modalContainer.classList.add(league.tier);
  modal.classList.add('active');
}

window.closeModal = function () {
  const modal = document.getElementById('contributor-modal');
  if (modal) modal.classList.remove('active');
};

// 6. Recent Activity (Real fetch)
async function fetchRecentActivity() {
  try {
    const response = await fetch(`${API_BASE}/commits?per_page=10`);
    if (!response.ok) return;
    const commits = await response.json();
    const activityList = document.getElementById('activity-list');
    if (activityList) {
      activityList.innerHTML = '';
      commits.forEach(item => {
        const date = new Date(item.commit.author.date).toLocaleDateString();
        const row = document.createElement('div');
        row.className = 'activity-item';
        row.innerHTML = `
                    <div class="activity-marker"></div>
                    <div class="commit-msg"><span style="color: var(--accent-color)">${item.commit.author.name}</span>: ${item.commit.message}</div>
                    <div class="commit-date">${date}</div>
                `;
        activityList.appendChild(row);
      });
    }
  } catch (error) { console.log('Activity feed unavailable'); }
}

// =================================================================
// GITHUB STATS INTEGRATION
// =================================================================

/**
 * Fetch GitHub Stats for a User
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - User stats or cached data
 */
async function fetchGitHubStats(username) {
  console.log(`📊 Fetching GitHub stats for: ${username}`);

  // Check cache first (24-hour expiration)
  const cacheKey = `github_stats_${username}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

      if (age < CACHE_DURATION) {
        console.log(`✅ Using cached stats for ${username}`);
        return data;
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }
  }

  // Fetch fresh data from GitHub API
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);

    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      console.warn(`⚠️ GitHub API rate limit hit. Remaining: ${rateLimitRemaining}`);

      // Return cached data even if expired
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
      throw new Error('Rate limit exceeded and no cache available');
    }

    // User not found
    if (response.status === 404) {
      console.warn(`❌ GitHub user not found: ${username}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const userData = await response.json();

    // Extract relevant data
    const stats = {
      public_repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      avatar_url: userData.avatar_url || '',
      bio: userData.bio || '',
      name: userData.name || username,
      html_url: userData.html_url || `https://github.com/${username}`
    };

    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify({
      data: stats,
      timestamp: Date.now()
    }));

    console.log(`✅ Fetched fresh stats for ${username}:`, stats);
    return stats;

  } catch (error) {
    console.error(`Error fetching stats for ${username}:`, error);

    // Try to return cached data as fallback
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        console.log(`⚠️ Returning expired cache for ${username}`);
        return data;
      } catch (e) {
        // Cache is corrupted
      }
    }

    return null;
  }
}

/**
 * Fetch Recent Repositories for a User
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} - Array of recent repos
 */
async function fetchRecentRepos(username) {
  // Check cache first
  const cacheKey = `github_repos_${username}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

      if (age < CACHE_DURATION) {
        return data;
      }
    } catch (e) {
      console.warn('Repo cache parse error:', e);
    }
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=3`
    );

    // Handle rate limiting
    if (response.status === 403) {
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
      return [];
    }

    if (!response.ok) {
      return [];
    }

    const repos = await response.json();

    // Extract relevant repo data
    const repoData = repos.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description',
      stars: repo.stargazers_count || 0,
      language: repo.language || 'Unknown',
      html_url: repo.html_url,
      updated_at: repo.updated_at
    }));

    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify({
      data: repoData,
      timestamp: Date.now()
    }));

    return repoData;

  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);

    // Try to return cached data as fallback
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        return data;
      } catch (e) {
        // Cache is corrupted
      }
    }

    return [];
  }
}

/**
 * Display GitHub Stats in a Contributor Card
 * @param {HTMLElement} card - The contributor card element
 * @param {string} username - GitHub username
 */
async function displayGitHubStats(card, username) {
  if (!username) {
    console.warn('⚠️ No username provided for card');
    return;
  }

  console.log(`🎯 Displaying stats for: ${username}`);

  // Show loading state
  const statsContainer = card.querySelector('.github-stats');
  const reposContainer = card.querySelector('.recent-repos');

  if (statsContainer) {
    statsContainer.innerHTML = `
            <div class="stat-item skeleton">
                <span class="stat-icon">📦</span>
                <span class="stat-value">...</span>
                <span class="stat-label">Repos</span>
            </div>
            <div class="stat-item skeleton">
                <span class="stat-icon">👥</span>
                <span class="stat-value">...</span>
                <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item skeleton">
                <span class="stat-icon">🔗</span>
                <span class="stat-value">...</span>
                <span class="stat-label">Following</span>
            </div>
        `;
  }

  // Fetch stats and repos in parallel
  const [stats, repos] = await Promise.all([
    fetchGitHubStats(username),
    fetchRecentRepos(username)
  ]);

  // Display stats
  if (stats && statsContainer) {
    console.log(`✅ Displaying stats for ${username}:`, stats);
    statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-icon">📦</span>
                <span class="stat-value" data-stat="repos">${stats.public_repos}</span>
                <span class="stat-label">Repos</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-value" data-stat="followers">${stats.followers}</span>
                <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">🔗</span>
                <span class="stat-value" data-stat="following">${stats.following}</span>
                <span class="stat-label">Following</span>
            </div>
        `;
  } else if (statsContainer) {
    statsContainer.innerHTML = `
            <div class="stat-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Stats not available</span>
            </div>
        `;
  }

  // Display recent repos
  if (repos && repos.length > 0 && reposContainer) {
    const repoList = reposContainer.querySelector('.repo-list');
    if (repoList) {
      repoList.innerHTML = repos.map(repo => `
                <div class="repo-item">
                    <div class="repo-info">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                            <strong>${repo.name}</strong>
                        </a>
                        <p>${repo.description.substring(0, 60)}${repo.description.length > 60 ? '...' : ''}</p>
                    </div>
                    <div class="repo-meta">
                        <span class="repo-language">${repo.language}</span>
                        <span class="repo-stars">⭐ ${repo.stars}</span>
                    </div>
                </div>
            `).join('');
    }
  } else if (reposContainer) {
    const repoList = reposContainer.querySelector('.repo-list');
    if (repoList) {
      repoList.innerHTML = '<p class="no-repos">No recent projects</p>';
    }
  }
}

/**
 * Initialize GitHub Contribution Calendar
 * Uses github-calendar library
 */
function initializeGitHubCalendars() {
  console.log('📅 Initializing GitHub calendars...');

  // Check if library is loaded
  if (typeof GitHubCalendar === 'undefined') {
    console.warn('⚠️ github-calendar library not loaded yet, retrying in 500ms...');
    setTimeout(initializeGitHubCalendars, 500);
    return;
  }


  // Find all calendar containers
  const calendarElements = document.querySelectorAll('.github-calendar[data-username]');
  console.log(`Found ${calendarElements.length} calendar elements`);

  calendarElements.forEach((calendarEl, index) => {
    const username = calendarEl.getAttribute('data-username');

    if (!username) {
      console.warn(`Calendar ${index} has no username`);
      return;
    }

    console.log(`📅 Loading calendar for: ${username}`);

    try {
      // Clear loading text
      calendarEl.innerHTML = '';

      GitHubCalendar(calendarEl, username, {
        responsive: true,
        summary_text: '',
        global_stats: false,
        tooltips: true
      });
      console.log(`✅ Loaded contribution calendar for ${username}`);
    } catch (error) {
      console.error(`❌ Failed to load calendar for ${username}:`, error);
      calendarEl.innerHTML = '<p class="calendar-error">Contributions unavailable</p>';
    }
  });
}

/**
 * Initialize all GitHub integrations on page load
 */
function initGitHubIntegrations() {
  console.log('🚀 Starting GitHub integrations...');

  // Get all contributor cards with GitHub usernames
  const contributorCards = document.querySelectorAll('.contributor-card[data-github]');
  console.log(`Found ${contributorCards.length} contributor cards with data-github attribute`);

  if (contributorCards.length === 0) {
    console.warn('⚠️ No contributor cards found! Cards might not be rendered yet.');
    return;
  }

  contributorCards.forEach((card, index) => {
    const username = card.getAttribute('data-github');
    if (username) {
      console.log(`Processing card ${index + 1}: ${username}`);
      displayGitHubStats(card, username);
    } else {
      console.warn(`Card ${index + 1} has no data-github attribute`);
    }
  });

  // Initialize calendars after a delay to ensure library is loaded
  setTimeout(() => {
    initializeGitHubCalendars();
  }, 1000);

  // Also initialize for project lead card
  const leadCard = document.querySelector('.project-lead-card[data-github]');
  if (leadCard) {
    const leadUsername = leadCard.getAttribute('data-github');
    console.log(`🎯 Found project lead card: ${leadUsername}`);
    displayGitHubStats(leadCard, leadUsername);
  }
}

// Note: initGitHubIntegrations is now called from renderContributors()
// This ensures it runs AFTER the cards are rendered