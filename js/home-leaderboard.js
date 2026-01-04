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
    EVENT: {
        ATTENDANCE: 50  // Points per event attended
    }
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

// Enhanced data validation utilities
const DataValidator = {
    isValidPullRequest: (pr) => {
        return pr && typeof pr === 'object' && pr.user && pr.user.login && pr.merged_at;
    },

    isValidUser: (user) => {
        return user && typeof user === 'string' && user.trim().length > 0;
    },

    isValidLabels: (labels) => {
        return Array.isArray(labels) && labels.every(label => label && label.name);
    },

    isValidDate: (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    isValidCSVData: (csvText) => {
        return typeof csvText === 'string' && csvText.trim().length > 0;
    },

    isValidAttendanceRecord: (record) => {
        return record && record.username && record.eventName && record.date;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLeaderboard();
});

async function initLeaderboard() {
    const container = document.getElementById('lb-rows');
    if (!container) return;

    // Show loading state
    container.innerHTML = `<div style="padding:20px; text-align:center;">Scanning database...</div>`;

    try {
        // Fetch data with enhanced error handling
        const [pulls, eventCSV] = await Promise.allSettled([
            fetchAllPulls(),
            fetchEventCSV()
        ]).then(results => {
            const pullsResult = results[0];
            const eventResult = results[1];
            
            // Handle individual promise results
            const pulls = pullsResult.status === 'fulfilled' ? pullsResult.value : [];
            const eventCSV = eventResult.status === 'fulfilled' ? eventResult.value : "";
            
            return [pulls, eventCSV];
        });

        const attendanceMap = parseAttendanceCSV(eventCSV);
        const scores = calculateLeaderboard(pulls, attendanceMap);
        const topContributors = getTopContributors(scores);

        // Cache successful data with timestamp
        const cacheData = {
            data: topContributors,
            timestamp: Date.now()
        };
        localStorage.setItem('leaderboardData', JSON.stringify(cacheData));

        renderLeaderboard(topContributors);
    } catch (error) {
        console.error("Leaderboard Sync Failed:", error);

        // Try to load from cache with timestamp validation
        const cachedData = localStorage.getItem('leaderboardData');
        if (cachedData) {
            try {
                const parsedCache = JSON.parse(cachedData);
                const cacheAge = Date.now() - parsedCache.timestamp;
                const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours

                if (cacheAge < maxCacheAge) {
                    renderLeaderboard(parsedCache.data, true); // true indicates cached data
                } else {
                    renderErrorUI(container, new Error('Cached data is too old'));
                }
            } catch (parseError) {
                console.error("Failed to parse cached leaderboard data:", parseError);
                renderErrorUI(container, error);
            }
        } else {
            renderErrorUI(container, error);
        }
    }
}

function renderErrorUI(container, error) {
    let errorMessage = "Data unavailable";
    let retryText = "Retry";

    if (error.message && (error.message.includes('403') || error.message.includes('rate limit'))) {
        errorMessage = "GitHub API rate limit exceeded. Please try again later.";
        retryText = "Retry Later";
    } else if (error.message && error.message.includes('404')) {
        errorMessage = "Repository not found or access denied.";
    } else if (!navigator.onLine) {
        errorMessage = "No internet connection.";
    } else {
        errorMessage = "An error occurred while loading data.";
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
    const maxPages = 5; // Increase max pages to fetch more data

    while (page <= maxPages) {
        try {
            const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
            if (!res.ok) {
                if (res.status === 403) {
                    // GitHub API rate limit reached
                    throw new Error(`HTTP ${res.status}: GitHub API rate limit exceeded`);
                }
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid response format from GitHub API');
            }
            if (!data.length) break;
            pulls = pulls.concat(data);
            page++;
        } catch (e) {
            console.warn(`Failed to fetch page ${page} of pull requests:`, e.message);
            // Continue to next page instead of failing completely
            page++;
        }
    }

    // Validate and filter pulls
    return pulls.filter(pr => DataValidator.isValidPullRequest(pr));
}

// Enhanced function to fetch event attendance data with error handling
async function fetchEventCSV() {
    try {
        const res = await fetch(EVENT_DATA_URL);
        if (!res.ok) {
            console.warn(`Failed to fetch event CSV: ${res.status} ${res.statusText}`);
            return "";
        }
        const csvText = await res.text();
        if (!DataValidator.isValidCSVData(csvText)) {
            console.warn('Fetched CSV data is empty or invalid');
            return "";
        }
        return csvText;
    } catch (e) {
        console.warn('Error fetching event CSV:', e.message);
        return "";
    }
}

// Enhanced function to parse attendance CSV with better error handling
function parseAttendanceCSV(csvText) {
    const attendanceMap = {};
    
    if (!csvText) return attendanceMap;

    try {
        const lines = csvText.split('\n');
        if (lines.length < 2) {
            console.warn('CSV data has insufficient lines');
            return attendanceMap;
        }

        // Skip header line and process each line with validation
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            // Use improved CSV parsing that handles quoted fields
            const parts = parseCSVLine(line);
            if (parts.length < 3) {
                console.warn(`Skipping invalid CSV line: ${line}`);
                continue;
            }

            const username = parts[0].trim();
            const date = parts[1].trim();
            const eventName = parts[2].trim();

            // Validate record before adding to map
            if (!username || !date || !eventName) {
                console.warn(`Skipping incomplete CSV record: ${line}`);
                continue;
            }

            if (!DataValidator.isValidDate(date)) {
                console.warn(`Invalid date in CSV record: ${date}`);
                continue;
            }

            const record = { username, date, eventName };
            if (!DataValidator.isValidAttendanceRecord(record)) {
                console.warn(`Invalid attendance record:`, record);
                continue;
            }

            // Track User Attendance - count unique events per user
            if (!attendanceMap[username]) {
                attendanceMap[username] = [];
            }
            // Only add unique events per user
            if (!attendanceMap[username].includes(eventName)) {
                attendanceMap[username].push(eventName);
            }
        }

        console.log(`Parsed attendance data for ${Object.keys(attendanceMap).length} users`);
        return attendanceMap;
    } catch (e) {
        console.error('Error parsing attendance CSV:', e);
        return attendanceMap;
    }
}

// Improved CSV line parser that handles quoted fields and commas within fields
function parseCSVLine(line) {
    const parts = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = i < line.length - 1 ? line[i + 1] : '';
        
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes && nextChar !== '"') {
            inQuotes = false;
        } else if (char === '"' && inQuotes && nextChar === '"') {
            // Handle escaped quotes ("" within quoted field)
            current += '"';
            i++; // Skip the next quote
        } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
        i++;
    }
    parts.push(current.trim());
    return parts;
}

// Enhanced leaderboard calculation incorporating both PRs and events with validation
function calculateLeaderboard(pulls, attendanceMap) {
    const userMap = {};

    // Process Pull Requests with validation
    pulls.forEach(pr => {
        if (!pr.merged_at) return; // Only merged PRs count
        
        const user = pr.user.login;
        if (!DataValidator.isValidUser(user)) {
            console.warn(`Invalid user in PR:`, pr);
            return;
        }

        if (user.toLowerCase() === REPO_OWNER.toLowerCase()) return; // Exclude owner from ranking

        if (!userMap[user]) {
            userMap[user] = {
                login: user,
                xp: 0,
                prCount: 0,
                events: 0,
                firstContribution: pr.created_at
            };
        }

        // Award XP based on PR labels with validation
        let prPoints = SCORING.PR.DEFAULT;
        let hasLevel = false;
        let hasHighComplexity = false;

        if (DataValidator.isValidLabels(pr.labels)) {
            pr.labels.forEach(label => {
                const name = label.name.toLowerCase();
                if (name.includes('level 3') || name.includes('level-3')) { 
                    prPoints = SCORING.PR.L3; 
                    hasLevel = true; 
                    hasHighComplexity = true;
                }
                else if (name.includes('level 2') || name.includes('level-2')) { 
                    prPoints = SCORING.PR.L2; 
                    hasLevel = true; 
                }
                else if (name.includes('level 1')) { 
                    prPoints = SCORING.PR.L1; 
                    hasLevel = true; 
                }
            });
        }

        userMap[user].xp += prPoints;
        userMap[user].prCount++;
    });

    // Process Event Attendance with validation
    Object.keys(attendanceMap).forEach(user => {
        if (!DataValidator.isValidUser(user)) {
            console.warn(`Invalid user in attendance data: ${user}`);
            return;
        }

        // If user attended events but has no PRs, initialize them
        if (!userMap[user]) {
            userMap[user] = {
                login: user,
                xp: 0,
                prCount: 0,
                events: 0,
                firstContribution: new Date().toISOString()
            };
        }
        
        const eventsAttended = Array.isArray(attendanceMap[user]) ? attendanceMap[user].length : 0;
        const eventXP = eventsAttended * SCORING.EVENT.ATTENDANCE;
        
        userMap[user].xp += eventXP;
        userMap[user].events = eventsAttended;
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
                <span class="lb-stats">${contributor.prCount} PRs • ${contributor.events} Events</span>
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