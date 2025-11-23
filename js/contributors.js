// GitHub Repository Configuration
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State
let contributorsData = []; // Holds merged data (profile + stats)
let currentPage = 1;
const itemsPerPage = 8;

// Point System Weights
const POINTS = {
    L3: 11,
    L2: 5,
    L1: 2,
    DEFAULT: 1 // Score for PRs without level tags
};

document.addEventListener('DOMContentLoaded', () => {
    initData();
    fetchRecentActivity();
});

// 1. Master Initialization Function
async function initData() {
    try {
        // Fetch Contributors (for profiles) and PRs (for stats) in parallel
        const [contributorsRes, pullsRes] = await Promise.all([
            fetch(`${API_BASE}/contributors?per_page=100`),
            fetch(`${API_BASE}/pulls?state=all&per_page=100`) // Fetches last 100 PRs
        ]);

        const rawContributors = await contributorsRes.json();
        const rawPulls = await pullsRes.json();

        processData(rawContributors, rawPulls);

    } catch (error) {
        console.error('Error initializing data:', error);
        document.getElementById('contributors-grid').innerHTML = '<p>Failed to load data.</p>';
    }
}

// 2. Process & Merge Data
function processData(contributors, pulls) {
    const leadAvatar = document.getElementById('lead-avatar');
    const statsMap = {};

    // A. Calculate Points from PRs
    let totalProjectPRs = 0;
    let totalProjectPoints = 0;

    pulls.forEach(pr => {
        const user = pr.user.login;
        
        // Initialize user stats if not exists
        if (!statsMap[user]) {
            statsMap[user] = { prs: 0, points: 0, l3: 0, l2: 0, l1: 0 };
        }

        // Increment PR Count
        statsMap[user].prs++;
        totalProjectPRs++;

        // Calculate Points based on Labels
        let prPoints = 0;
        let hasLevel = false;

        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3') || name.includes('level-3')) {
                prPoints += POINTS.L3;
                statsMap[user].l3++;
                hasLevel = true;
            } else if (name.includes('level 2') || name.includes('level-2')) {
                prPoints += POINTS.L2;
                statsMap[user].l2++;
                hasLevel = true;
            } else if (name.includes('level 1') || name.includes('level-1')) {
                prPoints += POINTS.L1;
                statsMap[user].l1++;
                hasLevel = true;
            }
        });

        // Default points if no level tag found
        if (!hasLevel) prPoints += POINTS.DEFAULT;

        statsMap[user].points += prPoints;
        totalProjectPoints += prPoints;
    });

    // B. Merge with Contributor Profile Data
    contributorsData = contributors.map(c => {
        const login = c.login;
        // Get stats from map or default to 0
        const userStats = statsMap[login] || { prs: 0, points: 0, l3: 0, l2: 0, l1: 0 };

        // Check for Lead
        if (login.toLowerCase() === REPO_OWNER.toLowerCase()) {
            if (leadAvatar) leadAvatar.src = c.avatar_url;
        }

        return {
            ...c,
            ...userStats // Merges prs, points, l3, l2, l1 into the object
        };
    });

    // C. Filter Lead & Sort by POINTS (Rank Logic)
    contributorsData = contributorsData
        .filter(c => c.login.toLowerCase() !== REPO_OWNER.toLowerCase())
        .sort((a, b) => b.points - a.points); // Descending Sort by Points

    // D. Update DOM Stats
    updateGlobalStats(contributors.length, totalProjectPRs, totalProjectPoints);

    // E. Render Grid
    renderContributors(1);
}

function updateGlobalStats(count, prs, points) {
    document.getElementById('total-contributors').textContent = count;
    document.getElementById('total-prs').textContent = prs;
    document.getElementById('total-points').textContent = points;
    // Note: Total Commits requires a separate header fetch or calculation, 
    // leaving previous placeholder or removing it if preferred.
    document.getElementById('total-commits').textContent = "50+"; // Placeholder or fetch logic
}

// 3. Get League/Badge Data
function getLeagueData(points) {
    if (points > 150) {
        return { text: 'Gold 🏆', class: 'badge-gold', tier: 'tier-gold', label: 'Gold League' };
    } else if (points > 75) {
        return { text: 'Silver 🥈', class: 'badge-silver', tier: 'tier-silver', label: 'Silver League' };
    } else if (points > 30) {
        return { text: 'Bronze 🥉', class: 'badge-bronze', tier: 'tier-bronze', label: 'Bronze League' };
    } else {
        return { text: 'Contributor 🚀', class: 'badge-contributor', tier: 'tier-contributor', label: 'Contributor' };
    }
}

// 4. Render Grid
function renderContributors(page) {
    const grid = document.getElementById('contributors-grid');
    grid.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = contributorsData.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = '<p>No contributors found.</p>';
        return;
    }

    paginatedItems.forEach((contributor, index) => {
        const globalRank = start + index + 1;
        const league = getLeagueData(contributor.points);

        const card = document.createElement('div');
        card.className = `contributor-card ${league.tier}`;
        card.onclick = () => openModal(contributor, league, globalRank);

        // Note: Showing "PR: X" on card as requested
        card.innerHTML = `
            <img src="${contributor.avatar_url}" alt="${contributor.login}">
            <span class="cont-name">${contributor.login}</span>
            <span class="cont-commits-badge ${league.class}">
                PRs: ${contributor.prs}
            </span>
        `;
        grid.appendChild(card);
    });

    renderPaginationControls(page);
}

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

window.changePage = function(newPage) {
    currentPage = newPage;
    renderContributors(newPage);
};

// 5. Modal Logic with Detailed Calculation
function openModal(contributor, league, rank) {
    const modal = document.getElementById('contributor-modal');
    
    document.getElementById('modal-avatar').src = contributor.avatar_url;
    document.getElementById('modal-name').textContent = contributor.login;
    // Using GitHub ID or just custom Rank ID
    document.getElementById('modal-id').textContent = `ID: ${contributor.id}`; 
    
    document.getElementById('modal-rank').textContent = `#${rank}`;
    document.getElementById('modal-score').textContent = contributor.points;
    document.getElementById('modal-league').textContent = league.label.split(' ')[0]; // "Gold"

    // Dynamic Links
    const prLink = `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls?q=is%3Apr+author%3A${contributor.login}`;
    document.getElementById('modal-pr-link').href = prLink;
    document.getElementById('modal-profile-link').href = contributor.html_url;

    // OPTIONAL: Show Point Breakdown in Console or add tooltip logic here
    // console.log(`Points for ${contributor.login}: (L3*${contributor.l3}) + (L2*${contributor.l2}) + (L1*${contributor.l1})`);

    modal.classList.add('active');
}

window.closeModal = function() {
    document.getElementById('contributor-modal').classList.remove('active');
}

document.getElementById('contributor-modal').addEventListener('click', (e) => {
    if(e.target.id === 'contributor-modal') closeModal();
});

// 6. Recent Activity (Commits)
async function fetchRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/commits?per_page=10`);
        const commits = await response.json();
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';

        commits.forEach(item => {
            const date = new Date(item.commit.author.date).toLocaleDateString();
            const message = item.commit.message;
            const author = item.commit.author.name;

            const row = document.createElement('div');
            row.className = 'activity-item';
            row.innerHTML = `
                <div class="activity-marker"></div>
                <div class="commit-msg">
                    <span style="color: var(--accent-color)">${author}</span>: ${message}
                </div>
                <div class="commit-date">${date}</div>
            `;
            activityList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
    }
}