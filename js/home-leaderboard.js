const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const EVENT_DATA_URL = './data/attendance.csv';

// Enhanced Scoring System with XP values
const SCORING = {
    PR: {
        L3: 11,    // High Complexity
        L2: 5,     // Medium Complexity
        L1: 2,     // Low Complexity
        DEFAULT: 1 // Standard PR
    },
    
};

// Event attendance points
const EVENT_POINTS = 250;

// League Definitions for Logic
const LEAGUES = {
    GOLD: { threshold: 15000, name: 'Gold Class', color: '#FFD700' },
    SILVER: { threshold: 7500, name: 'Silver Class', color: '#C0C0C0' },
    BRONZE: { threshold: 3000, name: 'Bronze Class', color: '#CD7F32' },
    ROOKIE: { threshold: 0, name: 'Rookie Agent', color: '#00aaff' }
};

// Enhanced achievements for home page
const HOME_ACHIEVEMENTS = [
    { id: 'first_pr', name: 'First PR', description: 'Submitted your first pull request', icon: 'fas fa-code-branch' },
    { id: 'ten_prs', name: 'PR Master', description: 'Submitted 10 pull requests', icon: 'fas fa-code' },
    { id: 'high_complexity', name: 'Complex Solver', description: 'Submitted a Level 3 PR', icon: 'fas fa-brain' },
    { id: 'team_player', name: 'Team Player', description: 'Participated in 3 events', icon: 'fas fa-users' }
];

document.addEventListener('DOMContentLoaded', () => {
    initLeaderboard();
});

async function initLeaderboard() {
    const container = document.getElementById('lb-rows');
    if (!container) return;

    // Show loading state
    container.innerHTML = `<div style="padding:20px; text-align:center;">Scanning database...</div>`;

    try {
        const pulls = await fetchAllPulls();
        const scores = calculateScores(pulls);
        const topContributors = getTopContributors(scores);

        // Cache successful data
        localStorage.setItem('leaderboardData', JSON.stringify(topContributors));

        renderLeaderboard(topContributors);
    } catch (error) {
        console.error("Leaderboard Sync Failed:", error);

        // Try to load from cache
        const cachedData = localStorage.getItem('leaderboardData');
        if (cachedData) {
            const cachedContributors = JSON.parse(cachedData);
            renderLeaderboard(cachedContributors, true); // true indicates cached data
        } else {
            renderErrorUI(container, error);
        }
    }
}

function renderErrorUI(container, error) {
    let errorMessage = "Data unavailable";
    let retryText = "Retry";

    if (error.message.includes('403') || error.message.includes('rate limit')) {
        errorMessage = "GitHub API rate limit exceeded. Please try again later.";
        retryText = "Retry Later";
    } else if (error.message.includes('404')) {
        errorMessage = "Repository not found or access denied.";
    } else if (!navigator.onLine) {
        errorMessage = "No internet connection.";
    }

    container.innerHTML = `
        <div style="padding:20px; text-align:center; color:#ff5f56;">
            <div>${errorMessage}</div>
            <button id="retry-btn" style="margin-top:10px; padding:5px 10px; background:#00aaff; color:#000; border:none; cursor:pointer;">${retryText}</button>
        </div>
    `;

    // Add retry functionality
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            initLeaderboard();
        });
    }
}

async function fetchAllPulls() {
    let pulls = [];
    let page = 1;
    while (page <= 3) {
        try {
            const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            if (!data.length) break;
            pulls = pulls.concat(data);
            page++;
        } catch (e) {
            throw new Error(`Failed to fetch pull requests: ${e.message}`);
        }
    }
    return pulls;
}

// New function to fetch event attendance data
async function fetchEventCSV() {
    try {
        const res = await fetch(EVENT_DATA_URL);
        if(!res.ok) return ""; 
        return await res.text();
    } catch (e) { return ""; }
}

// New function to parse attendance CSV
function parseAttendanceCSV(csvText) {
    const attendanceMap = {};
    
    if (!csvText) return attendanceMap;

    const lines = csvText.split('\n');
    
    lines.slice(1).forEach(line => { // Skip header
        // CSV Format: GitHubUsername,Date,EventName
        const parts = line.split(',');
        if (parts.length >= 3) {
            const username = parts[0].trim();
            
            if (username) {
                // Track User Attendance
                attendanceMap[username] = (attendanceMap[username] || 0) + 1;
            }
        }
    });

    return attendanceMap;
}

// Enhanced leaderboard calculation incorporating both PRs and events
function calculateLeaderboard(pulls, attendanceMap) {
    const userMap = {};

    // Process Pull Requests
    pulls.forEach(pr => {
        if (!pr.merged_at) return; // Only merged PRs count
        
        const user = pr.user.login;
        if (user.toLowerCase() === REPO_OWNER.toLowerCase()) return; // Exclude owner from ranking

        if (!userMap[user]) {
            userMap[user] = {
                login: user,
                xp: 0,
                prCount: 0,
                events: 0
            };
        }

        // Award XP based on PR labels
        let prPoints = SCORING.PR.DEFAULT;
        let hasLevel = false;
        let hasHighComplexity = false;

        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3')) { prPoints = SCORING.PR.L3; hasLevel = true; }
            else if (name.includes('level 2')) { prPoints = SCORING.PR.L2; hasLevel = true; }
            else if (name.includes('level 1')) { prPoints = SCORING.PR.L1; hasLevel = true; }
        });

        userMap[user].xp += prPoints;
        userMap[user].prCount++;
    });

    // Process Event Attendance
    Object.keys(attendanceMap).forEach(user => {
        // If user attended events but has no PRs, initialize them
        if (!userMap[user]) {
            userMap[user] = {
                login: user,
                xp: 0,
                prCount: 0,
                events: 0
            };
        }
        
        const eventsAttended = attendanceMap[user];
        const eventXP = eventsAttended * SCORING.EVENT.ATTENDANCE;
        
        userMap[user].xp += eventXP;
        userMap[user].events += eventsAttended;
    });

    return Object.values(userMap);
}

function getTopContributors(leaderboard) {
    return leaderboard
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 5); // Show Top 5 on Homepage
}

function getLeagueInfo(xp) {
    if (xp >= LEAGUES.GOLD.threshold) return LEAGUES.GOLD;
    if (xp >= LEAGUES.SILVER.threshold) return LEAGUES.SILVER;
    if (xp >= LEAGUES.BRONZE.threshold) return LEAGUES.BRONZE;
    return LEAGUES.ROOKIE;
}

function renderLeaderboard(contributors, isCached = false) {
    const container = document.getElementById('lb-rows');
    if (!container) return;

    container.innerHTML = ''; // Clear loader

    if (contributors.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center;">No active agents found. Be the first!</div>`;
        return;
    }

    // Add cached data indicator if applicable
    if (isCached) {
        const cachedIndicator = document.createElement('div');
        cachedIndicator.style.cssText = 'padding:5px; text-align:center; font-size:12px; color:#888; margin-bottom:10px;';
        cachedIndicator.textContent = 'Showing cached data - Last updated data unavailable';
        container.appendChild(cachedIndicator);
    }

    contributors.forEach((contributor, index) => {
        const rank = index + 1;
        const league = getLeagueInfo(contributor.xp);

        const row = document.createElement('div');
        row.className = `lb-row rank-${rank}`;

        row.innerHTML = `
            <div class="lb-rank">
                <div class="lb-rank-badge">${rank}</div>
            </div>
            <div class="lb-user-info">
                <span class="lb-username">@${contributor.login}</span>
                <span class="lb-stats">PRs: ${contributor.prCount} | Events: ${contributor.events}</span>
                <span class="lb-league-tag" style="color: ${league.color}">${league.name}</span>
                <span class="lb-stats">${contributor.prCount} PRs • ${contributor.eventsAttended} Events</span>
            </div>
            <div class="lb-xp-val">
                ${contributor.xp.toLocaleString()} XP
            </div>
        `;

        container.appendChild(row);

        // Add subtle entrance animation
        row.style.opacity = 0;
        row.style.transform = "translateY(10px)";
        setTimeout(() => {
            row.style.transition = "all 0.5s ease";
            row.style.opacity = 1;
            row.style.transform = "translateY(0)";
        }, index * 100);
    });
}
