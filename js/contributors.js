// GitHub Repository Configuration
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State for Pagination
let allContributors = [];
let currentPage = 1;
const itemsPerPage = 8;

document.addEventListener('DOMContentLoaded', () => {
    fetchRepoStats();
    fetchContributors();
    fetchRecentActivity();
});

// 1. Fetch Basic Repo Stats
async function fetchRepoStats() {
    try {
        const response = await fetch(API_BASE);
        const data = await response.json();

        document.getElementById('total-stars').textContent = data.stargazers_count;
        document.getElementById('total-forks').textContent = data.forks_count;
    } catch (error) {
        console.error('Error fetching repo stats:', error);
    }
}

// 2. Fetch Contributors & Identify Lead
async function fetchContributors() {
    try {
        const response = await fetch(`${API_BASE}/contributors?per_page=100`);
        allContributors = await response.json();
        
        const leadAvatar = document.getElementById('lead-avatar');
        const leadName = document.getElementById('lead-name');
        
        // Update Total Contributors Count
        document.getElementById('total-contributors').textContent = allContributors.length;

        // Calculate Total Commits & Find Lead
        let totalCommits = 0;
        allContributors.forEach(contributor => {
            totalCommits += contributor.contributions;
            
            // Update Lead Image if match found
            if(contributor.login.toLowerCase() === REPO_OWNER.toLowerCase()) {
                leadAvatar.src = contributor.avatar_url;
                // Optional: Update name if you had an API for user details, 
                // otherwise it stays hardcoded as 'Sayee Gosavi' in HTML
            }
        });

        document.getElementById('total-commits').textContent = totalCommits;

        // Initialize Pagination View
        renderContributors(1);

    } catch (error) {
        console.error('Error fetching contributors:', error);
        document.getElementById('contributors-grid').innerHTML = '<p>Failed to load contributors.</p>';
    }
}

// Helper: Get Badge based on commits
function getBadge(commits) {
    if (commits >= 50) {
        return { text: 'Gold 🏆', class: 'badge-gold' };
    } else if (commits >= 21) {
        return { text: 'Silver 🥈', class: 'badge-silver' };
    } else if (commits >= 10) {
        return { text: 'Bronze 🥉', class: 'badge-bronze' };
    } else {
        return { text: 'Contributor !!', class: 'badge-contributor' };
    }
}

// 3. Render Pagination
function renderContributors(page) {
    const grid = document.getElementById('contributors-grid');
    grid.innerHTML = '';

    // Pagination Logic
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allContributors.slice(start, end);

    paginatedItems.forEach(contributor => {
        const badgeData = getBadge(contributor.contributions);

        const card = document.createElement('div');
        card.className = 'contributor-card';
        card.innerHTML = `
            <img src="${contributor.avatar_url}" alt="${contributor.login}">
            <a href="${contributor.html_url}" target="_blank" class="cont-name">${contributor.login}</a>
            <span class="cont-commits-badge ${badgeData.class}">
                ${badgeData.text} (${contributor.contributions})
            </span>
        `;
        grid.appendChild(card);
    });

    renderPaginationControls(page);
}

function renderPaginationControls(page) {
    const container = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(allContributors.length / itemsPerPage);

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

// Global function for HTML onclick access
window.changePage = function(newPage) {
    currentPage = newPage;
    renderContributors(newPage);
};


// 4. Fetch Recent Commit Activity
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