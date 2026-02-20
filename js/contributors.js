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
    fetchGlobalActivity(); // NEW: Fetch project heatmap
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

  // 4. Global Activity Heatmap (Mock)
  loadMockHeatmap();

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

// =========================================================
// GLOBAL PROJECT ACTIVITY HEATMAP
// =========================================================

/**
 * Fetch Repository-wide commit activity for the heatmap
 */
async function fetchGlobalActivity() {
  const gridContainer = document.getElementById('heatmap-grid');
  const statsLabel = document.getElementById('heatmap-stats');

  try {
    // 1. Fetch Repository-wide weekly commit activity
    let response = await fetch(`${API_BASE}/stats/commit_activity`);

    // GitHub returns 202 if stats aren't cached. We retry once.
    if (response.status === 202) {
      console.log('🔄 Mainframe activity data generating. Retrying calculation...');
      await new Promise(r => setTimeout(r, 1500));
      response = await fetch(`${API_BASE}/stats/commit_activity`);
    }

    if (!response.ok) throw new Error('Primary pulse telemetry failed.');

    const data = await response.json();

    // Check if data is empty or empty array (can happen if repo is small or new)
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Telemetry stream empty. Falling back to participation index.');
    }

    renderHeatmap(data);

    const totalYearly = data.reduce((acc, week) => acc + week.total, 0);
    if (statsLabel)
      statsLabel.textContent = `Collective System Pulse: ${totalYearly} contributions detected in the last solar year.`;
  } catch (error) {
    console.warn('Primary Pulse Failed. Attempting Backup Participation Stream...', error);

    try {
      // BACKUP: Fetch participation stats (last 52 weeks of commit counts)
      // This endpoint is often more reliable than commit_activity for small repos
      const partRes = await fetch(`${API_BASE}/stats/participation`);
      if (!partRes.ok) throw new Error('Backup telemetry failed.');

      const partData = await partRes.json();
      if (!partData.all || !Array.isArray(partData.all))
        throw new Error('Invalid participation data.');

      // Transform participation data with realistic daily distribution
      // GitHub's heatmap aligns weeks to start on Sunday
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find the most recent Sunday (or today if it's Sunday)
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const mostRecentSunday = new Date(today);
      mostRecentSunday.setDate(today.getDate() - dayOfWeek);

      // Calculate the Sunday 51 weeks before (52 weeks total including current)
      const startSunday = new Date(mostRecentSunday);
      startSunday.setDate(mostRecentSunday.getDate() - 51 * 7);

      const transformedData = partData.all.map((count, i) => {
        // Calculate this week's Sunday
        const weekStart = new Date(startSunday);
        weekStart.setDate(startSunday.getDate() + i * 7);
        const weekTimestamp = Math.floor(weekStart.getTime() / 1000);

        // Distribute weekly commits across days with realistic weekday weighting
        const days = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        let remaining = count;

        if (count > 0) {
          // Weight pattern: lower on weekends, higher mid-week (Tue-Thu)
          const weights = [1, 2, 4, 4, 4, 3, 1]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
          const totalWeight = weights.reduce((a, b) => a + b, 0);

          for (let d = 0; d < 7; d++) {
            if (d === 6) {
              // Last day gets remainder to ensure total matches
              days[d] = remaining;
            } else {
              const share = Math.round((weights[d] / totalWeight) * count);
              const actual = Math.min(share, remaining);
              days[d] = actual;
              remaining -= actual;
            }
          }
        }

        return {
          week: weekTimestamp,
          total: count,
          days: days,
        };
      });

      renderHeatmap(transformedData);

      const totalPart = partData.all.reduce((a, b) => a + b, 0);
      if (statsLabel)
        statsLabel.textContent = `Collective System Pulse: ${totalPart} commits detected via Participation Index.`;
    } catch (innerError) {
      console.error('All Telemetry Streams Offline. Activating Simulated Mode.', innerError);
      loadMockHeatmap();
    }
  }
}

/**
 * Render the heatmap grid based on GitHub stats data
 * @param {Array} data - Array of 52 weeks, each with 'total' and 'days'
 */
function renderHeatmap(data) {
  const grid = document.getElementById('heatmap-grid');
  const monthContainer = document.getElementById('heatmap-months');
  if (!grid) return;
  grid.innerHTML = '';
  if (monthContainer) monthContainer.innerHTML = '';

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let columnIndex = 0;
  const seenMonths = new Set(); // Track to avoid duplicates

  // Build grid and calculate month positions
  data.forEach((week, weekIndex) => {
    const column = document.createElement('div');
    column.className = 'heatmap-column';
    let hasValidCells = false;

    // Get the Sunday that starts this week
    const weekStartDate = new Date(week.week * 1000);
    const monthKey = `${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}`;
    const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'short' });

    // Place month label when we see a new month (avoid duplicates)
    if (!seenMonths.has(monthKey) && monthContainer) {
      const monthLabel = document.createElement('span');
      monthLabel.className = 'heatmap-month-label';
      monthLabel.style.position = 'absolute';
      // CORRECT CALCULATION: 14px cell + 4px gap = 18px per column
      monthLabel.style.left = `${columnIndex * 18}px`;
      monthLabel.textContent = monthName;
      monthContainer.appendChild(monthLabel);

      seenMonths.add(monthKey);
      console.log(
        `📌 "${monthName}" at column ${columnIndex} (${columnIndex * 18}px) for ${weekStartDate.toDateString()}`
      );
    }

    week.days.forEach((count, dayIndex) => {
      const cellDate = new Date(weekStartDate);
      cellDate.setDate(weekStartDate.getDate() + dayIndex);

      // Skip future dates
      if (cellDate > today) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'heatmap-cell level-0 future-cell';
        emptyCell.style.opacity = '0.2';
        column.appendChild(emptyCell);
        return;
      }

      hasValidCells = true;
      const cell = document.createElement('div');

      // Activity level calculation
      let level = 0;
      if (count > 0 && count <= 3) level = 1;
      else if (count > 3 && count <= 6) level = 2;
      else if (count > 6 && count <= 9) level = 3;
      else if (count > 9) level = 4;

      cell.className = `heatmap-cell level-${level}`;

      const dateStr = cellDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      cell.setAttribute(
        'data-tooltip',
        `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${dateStr}`
      );
      cell.setAttribute('data-date', cellDate.toISOString().split('T')[0]);

      column.appendChild(cell);
    });

    if (hasValidCells) {
      grid.appendChild(column);
      columnIndex++;
    }
  });

  // Debug: Log the date range and positioning
  if (data.length > 0) {
    const firstWeek = new Date(data[0].week * 1000);
    const lastWeek = new Date(data[data.length - 1].week * 1000);
    console.log(`📅 Heatmap spans: ${firstWeek.toDateString()} to ${lastWeek.toDateString()}`);
    console.log(`📊 Total columns: ${columnIndex}, Grid width should be: ${columnIndex * 18}px`);
  }

  // Set month container width to match grid (no auto-scroll)
  if (monthContainer && grid) {
    monthContainer.style.width = `${columnIndex * 18}px`;
  }
}

/**
 * Fallback: Load a simulated heatmap for Demo Mode
 */
function loadMockHeatmap() {
  const mockData = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  console.log('🎯 Mock Heatmap - Today is:', today.toDateString());

  // Find the most recent Sunday (GitHub weeks start on Sunday)
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const mostRecentSunday = new Date(today);
  mostRecentSunday.setDate(today.getDate() - dayOfWeek);
  mostRecentSunday.setHours(0, 0, 0, 0);

  console.log('🎯 Most recent Sunday:', mostRecentSunday.toDateString());

  // Create 52 weeks of semi-random activity, starting 51 weeks ago
  for (let i = 51; i >= 0; i--) {
    const weekStart = new Date(mostRecentSunday);
    weekStart.setDate(mostRecentSunday.getDate() - i * 7);
    const weekTimestamp = Math.floor(weekStart.getTime() / 1000);

    const days = [];
    let weeklyTotal = 0;

    console.log(
      `Week ${52 - i}: ${weekStart.toDateString()} (${weekStart.getMonth() + 1}/${weekStart.getDate()})`
    );

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + d);

      // Don't generate activity for future dates
      if (currentDate > today) {
        days.push(0);
        continue;
      }

      // Simulate higher activity on weekdays, lower on weekends
      const isWeekend = d === 0 || d === 6; // Sunday or Saturday
      let count;

      if (isWeekend) {
        count = Math.floor(Math.random() * 4); // 0-3 for weekends
      } else {
        count = Math.floor(Math.random() * 10); // 0-9 for weekdays
      }

      // Add occasional "burst days" of high activity
      if (Math.random() > 0.92) count += Math.floor(Math.random() * 15) + 5;

      // Add some completely quiet days
      if (Math.random() > 0.85) count = 0;

      days.push(count);
      weeklyTotal += count;
    }

    mockData.push({
      week: weekTimestamp,
      total: weeklyTotal,
      days: days,
    });
  }

  console.log('🎯 Mock data generated:', {
    totalWeeks: mockData.length,
    firstWeek: new Date(mockData[0].week * 1000).toDateString(),
    lastWeek: new Date(mockData[mockData.length - 1].week * 1000).toDateString(),
    sampleWeek: mockData[20] ? new Date(mockData[20].week * 1000).toDateString() : 'N/A',
  });

  renderHeatmap(mockData);

  const totalContributions = mockData.reduce((sum, week) => sum + week.total, 0);
  const statsLabel = document.getElementById('heatmap-stats');
  if (statsLabel) {
    statsLabel.textContent = `Collective System Pulse: ~${totalContributions} contributions detected in the last solar year (Simulated).`;
  }
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
  } catch (error) {
    console.log('Activity feed unavailable');
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
      html_url: userData.html_url || `https://github.com/${username}`,
    };

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: stats,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Fetched fresh stats for ${username}:`, stats);
    return stats;
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
      updated_at: repo.updated_at,
    }));

    // Cache the result
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: repoData,
        timestamp: Date.now(),
      })
    );

    return repoData;
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
    fetchRecentRepos(username),
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
      repoList.innerHTML = repos
        .map(
          repo => `
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
            `
        )
        .join('');
    }
  } else if (reposContainer) {
    const repoList = reposContainer.querySelector('.repo-list');
    if (repoList) {
      repoList.innerHTML = `
                <div class="repo-empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No public archives found</p>
                    <span>This agent hasn't shared any public repositories yet.</span>
                </div>
            `;
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
        tooltips: true,
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
