/* =========================================
   PIXEL PHANTOMS | GLOBAL COMMAND CENTER
   Core Logic: GitHub API + CSV Event Data
   ========================================= */

const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const EVENT_DATA_URL = '../data/attendance.csv'; // Path to your CSV

// --- SCORING MATRIX (Inspired by Contributors.js) ---
const SCORING = {
    PR: {
        L3: 500,    // High Complexity
        L2: 300,    // Medium Complexity
        L1: 100,    // Low Complexity
        DEFAULT: 50
    },
    EVENT: {
        ATTENDANCE: 200, // Points per event attended
        HOSTING: 500     // Points for hosting (if in CSV)
    }
};

// --- STATE MANAGEMENT ---
let globalState = {
    contributors: [],
    pullRequests: [],
    attendance: {}, // Map<username, count>
    physics: {
        totalMass: 0,
        avgVelocity: 0
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    init3DInteraction();
});

/* =========================================
   1. DATA AGGREGATION SYSTEM
   ========================================= */
async function initDashboard() {
    const tableBody = document.getElementById('leaderboard-body');
    if(tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="loading-text">INITIALIZING DATA STREAMS...</td></tr>';

    try {
        // Parallel Data Fetching
        const [repoData, prData, csvText] = await Promise.all([
            fetch(API_BASE).then(res => res.json()),
            fetchAllPulls(),
            fetchEventCSV()
        ]);

        // Process CSV
        globalState.attendance = parseAttendanceCSV(csvText);
        
        // Process & Merge Data
        globalState.pullRequests = prData;
        const leaderboard = calculateLeaderboard(prData, globalState.attendance);
        
        // Render UI
        updateGlobalHUD(leaderboard, repoData);
        renderLeaderboardTable(leaderboard);
        renderPhysicsEngine(leaderboard);
        renderVisualizers(leaderboard);

    } catch (error) {
        console.warn("⚠️ System Offline or Rate Limited. engaging_mock_protocol();", error);
        loadMockProtocol();
    }
}

// --- GITHUB API: FETCH ALL PRS (Pagination Handling) ---
async function fetchAllPulls() {
    let pulls = [];
    let page = 1;
    // Limit to 3 pages to prevent API lockout during demo
    while (page <= 3) {
        const res = await fetch(`${API_BASE}/pulls?state=closed&per_page=100&page=${page}`);
        if (!res.ok) break;
        const data = await res.json();
        if (!data.length) break;
        pulls = pulls.concat(data);
        page++;
    }
    return pulls;
}

// --- CSV HANDLER: FETCH & PARSE ---
async function fetchEventCSV() {
    try {
        const res = await fetch(EVENT_DATA_URL);
        if(!res.ok) return ""; // Fail silently if file missing
        return await res.text();
    } catch (e) { return ""; }
}

function parseAttendanceCSV(csvText) {
    const attendanceMap = {};
    if (!csvText) return attendanceMap;

    // Assumes CSV Format: GitHubUsername, EventDate, EventName
    const lines = csvText.split('\n');
    lines.slice(1).forEach(line => { // Skip header
        const parts = line.split(',');
        if (parts.length >= 1) {
            const username = parts[0].trim();
            if (username) {
                attendanceMap[username] = (attendanceMap[username] || 0) + 1;
            }
        }
    });
    return attendanceMap;
}

/* =========================================
   2. SCORING ALGORITHM (THE "GAME" LOGIC)
   ========================================= */
function calculateLeaderboard(pulls, attendanceMap) {
    const userMap = {};

    // 1. Process PRs (Mass & Velocity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    pulls.forEach(pr => {
        if (!pr.merged_at) return; // Only merged PRs count
        
        const user = pr.user.login;
        if (!userMap[user]) initUser(userMap, user, pr.user.avatar_url);

        // -- Mass Calculation (Complexity) --
        let prPoints = SCORING.PR.DEFAULT;
        let massGain = 1; 

        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3')) { prPoints = SCORING.PR.L3; massGain = 3; }
            else if (name.includes('level 2')) { prPoints = SCORING.PR.L2; massGain = 2; }
            else if (name.includes('level 1')) { prPoints = SCORING.PR.L1; massGain = 1; }
        });

        userMap[user].xp += prPoints;
        userMap[user].mass += massGain;
        userMap[user].prCount++;

        // -- Velocity Calculation (Recent Activity) --
        if (new Date(pr.merged_at) > thirtyDaysAgo) {
            userMap[user].velocity += 10; // +10 Speed per recent PR
        }
    });

    // 2. Process Events (Bonus XP)
    Object.keys(attendanceMap).forEach(user => {
        if (!userMap[user]) {
            // User attended event but hasn't coded yet (Potential Recruit)
            // We need an avatar, so we use a default or try to fetch
            initUser(userMap, user, `https://github.com/${user}.png`);
        }
        
        const eventsAttended = attendanceMap[user];
        const eventXP = eventsAttended * SCORING.EVENT.ATTENDANCE;
        
        userMap[user].xp += eventXP;
        userMap[user].events += eventsAttended;
        userMap[user].velocity += (eventsAttended * 5); // Events boost velocity slightly
    });

    // 3. Convert Map to Array & Determine Rank
    const leaderboard = Object.values(userMap).sort((a, b) => b.xp - a.xp);
    
    // Assign Ranks & Classes
    return leaderboard.map((agent, index) => {
        agent.rank = index + 1;
        
        // Determine Class based on Mass (Complexity handled)
        if (agent.mass > 20) agent.class = 'TITAN';
        else if (agent.mass > 10) agent.class = 'STRIKER';
        else agent.class = 'SCOUT';

        // Determine Status based on Velocity
        if (agent.velocity > 50) agent.status = 'OVERDRIVE';
        else if (agent.velocity > 0) agent.status = 'ONLINE';
        else agent.status = 'IDLE';

        return agent;
    });
}

function initUser(map, login, avatar) {
    map[login] = {
        login,
        avatar,
        xp: 0,
        mass: 0,      // Total weight of contributions
        velocity: 0,  // Recent activity metric
        events: 0,
        prCount: 0
    };
}

/* =========================================
   3. RENDERING & UI
   ========================================= */
function updateGlobalHUD(data, repo) {
    const totalXP = data.reduce((sum, u) => sum + u.xp, 0);
    const totalPRs = data.reduce((sum, u) => sum + u.prCount, 0);
    
    animateCount('total-contributors', data.length);
    animateCount('total-prs', totalPRs);
    animateCount('total-stars', repo.stargazers_count || 0); // Using Stars as "Star Power"
    
    // Update Sidebar Ping (Just for effect)
    setInterval(() => {
        const ping = Math.floor(Math.random() * 20) + 10;
        document.getElementById('ping-counter').innerText = `${ping}ms`;
        document.getElementById('ping-counter').style.color = ping > 25 ? '#ff0055' : '#0aff60';
    }, 2000);
}

function renderLeaderboardTable(data) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    data.slice(0, 50).forEach(agent => {
        const row = document.createElement('tr');
        
        // Dynamic Class Color
        let classColor = '#00f3ff';
        if(agent.class === 'TITAN') classColor = '#ff0055'; // Red
        if(agent.class === 'STRIKER') classColor = '#ffd700'; // Gold

        // Velocity Bar Width
        const velPercent = Math.min(agent.velocity, 100);

        row.innerHTML = `
            <td class="rank-cell">#${String(agent.rank).padStart(2,'0')}</td>
            <td class="agent-cell">
                <img src="${agent.avatar}" onerror="this.src='../assets/logo.png'">
                <div>
                    <span class="agent-name">${agent.login}</span>
                    <span class="agent-sub">Events: ${agent.events} | PRs: ${agent.prCount}</span>
                </div>
            </td>
            <td style="color:${classColor}; font-weight:bold;">${agent.class}</td>
            <td class="velocity-cell">
                <div class="v-bar-bg"><div class="v-bar-fill" style="width:${velPercent}%"></div></div>
                <span class="v-val">${agent.velocity} m/s</span>
            </td>
            <td class="xp-cell">${agent.xp.toLocaleString()} XP</td>
            <td><span class="status-badge ${agent.status.toLowerCase()}">${agent.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function renderPhysicsEngine(data) {
    if(!data.length) return;
    const topAgent = data[0];

    // Normalize stats for the physics bars (0-100%)
    // Assuming max velocity around 100 and max Mass around 50 for visuals
    const vPct = Math.min(topAgent.velocity, 100);
    const mPct = Math.min((topAgent.mass / 50) * 100, 100); 
    const fPct = Math.min((topAgent.xp / 10000) * 100, 100); // Impact based on XP cap

    // Update Physics Panel Bars
    const bars = document.querySelectorAll('.physics-stat .bar-fill');
    if(bars.length >= 3) {
        bars[0].style.width = `${vPct}%`; // Velocity
        bars[1].style.width = `${mPct}%`; // Mass
        bars[2].style.width = `${fPct}%`; // Impact
    }
}

function renderVisualizers(data) {
    const container = document.getElementById('chart-bars');
    container.innerHTML = '';
    
    // Create a visualizer based on the top 20 agents' XP
    const slice = data.slice(0, 20);
    slice.forEach((agent, i) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        // Height relative to top agent
        const height = (agent.xp / slice[0].xp) * 100;
        bar.style.height = `${height}%`;
        bar.style.animationDelay = `${i * 0.05}s`;
        
        // Tooltip
        bar.setAttribute('title', `${agent.login}: ${agent.xp}`);
        
        container.appendChild(bar);
    });
}

/* =========================================
   4. 3D INTERACTION (Holographic Cube)
   ========================================= */
function init3DInteraction() {
    const container = document.querySelector('.stage-3d-panel');
    const cube = document.getElementById('cube');

    if (!container || !cube) return;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate Rotation
        const rotateY = ((x - centerX) / centerX) * 45; 
        const rotateX = -((y - centerY) / centerY) * 45;

        // Apply
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        cube.style.transform = `rotateX(-20deg) rotateY(-30deg)`; // Reset
    });
}

/* =========================================
   UTILS & MOCK DATA
   ========================================= */
function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = 0;
    const duration = 2000;
    
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        el.innerHTML = Math.floor(progress * target).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

function loadMockProtocol() {
    const mockData = [
        { login: "Neo_One", avatar_url: "", xp: 15000, velocity: 90, mass: 45, prCount: 15, events: 5, rank: 1, class: "TITAN", status: "OVERDRIVE" },
        { login: "Trinity_Core", avatar_url: "", xp: 12500, velocity: 75, mass: 30, prCount: 12, events: 4, rank: 2, class: "STRIKER", status: "ONLINE" },
        { login: "Morpheus_Dev", avatar_url: "", xp: 9800, velocity: 40, mass: 55, prCount: 20, events: 1, rank: 3, class: "TITAN", status: "ONLINE" },
        { login: "Cipher_Ops", avatar_url: "", xp: 5000, velocity: 10, mass: 12, prCount: 5, events: 8, rank: 4, class: "SCOUT", status: "IDLE" },
    ];
    updateGlobalHUD(mockData, { stargazers_count: 404 });
    renderLeaderboardTable(mockData);
    renderPhysicsEngine(mockData);
    renderVisualizers(mockData);
}