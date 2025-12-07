// Enhanced Leaderboard Features for Home Page Integration

// Achievement tracking for home page preview
const HOME_ACHIEVEMENTS = [
    { id: 'early_bird', name: 'Early Bird', description: 'Joined in the first week', icon: 'fas fa-sun' },
    { id: 'streak_master', name: 'Streak Master', description: 'Contributed for 7 days straight', icon: 'fas fa-fire' },
    { id: 'community_champion', name: 'Community Champion', description: 'Helped 5 other contributors', icon: 'fas fa-hands-helping' }
];

// Enhanced rendering for home page leaderboard
function renderHomeLeaderboard(contributors) {
    const container = document.getElementById('lb-rows');
    if (!container) return;
    
    container.innerHTML = ''; // Clear loader

    if (contributors.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center;">No active agents found. Be the first!</div>`;
        return;
    }

    contributors.forEach((contributor, index) => {
        const rank = index + 1;
        
        const row = document.createElement('div');
        row.className = `lb-row rank-${rank}`;
        
        // Add activity indicator based on recent contributions
        const activityIndicator = contributor.prCount > 3 ? '🔥' : (contributor.events > 2 ? '⭐' : '');
        
        row.innerHTML = `
            <div class="lb-rank">
                <div class="lb-rank-badge">${rank}</div>
            </div>
            <div class="lb-user-info">
                <span class="lb-username">@${contributor.login} ${activityIndicator}</span>
                <span class="lb-league-tag" style="color: ${getLeagueColor(contributor.xp)}">${getClassLabel(contributor.class)}</span>
                <span class="lb-stats">${contributor.prCount} PRs • ${contributor.events} Events</span>
            </div>
            <div class="lb-xp-val">
                ${contributor.xp.toLocaleString()} XP
            </div>
        `;
        
        // Add click event to open detailed modal
        row.addEventListener('click', () => {
            openHomeModal(contributor);
        });
        
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
    
    // Add footer with info about the scoring system
    const footer = document.createElement('div');
    footer.className = 'lb-footer-enhanced';
    footer.innerHTML = `
        <div class="lb-scoring-info">
            <span class="scoring-item">PR Levels: L1=200pt, L2=500pt, L3=1100pt</span>
            <span class="scoring-item">Events: 250pt each</span>
        </div>
    `;
    container.appendChild(footer);
}

function getLeagueColor(xp) {
    if (xp >= 15000) return '#FFD700'; // Gold
    if (xp >= 7500) return '#C0C0C0';  // Silver
    if (xp >= 3000) return '#CD7F32';  // Bronze
    return '#00aaff'; // Rookie
}

function getClassLabel(className) {
    const classLabels = {
        'TITAN': 'Titan Class',
        'STRIKER': 'Striker Class',
        'SCOUT': 'Scout Class',
        'ROOKIE': 'Rookie Class'
    };
    return classLabels[className] || className;
}

// Modal for home page leaderboard
function openHomeModal(contributor) {
    // Create modal overlay if it doesn't exist
    let modal = document.getElementById('home-contributor-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'home-contributor-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <button class="close-modal">&times;</button>
                
                <div class="modal-header">
                    <img id="home-modal-avatar" src="" alt="Contributor">
                    <h2 id="home-modal-name">Username</h2>
                    <p id="home-modal-id" class="modal-subtitle">ID: --</p>
                    <div id="home-modal-league-badge" class="modal-league-tag"></div>
                </div>

                <div class="modal-stats-row">
                    <div class="modal-stat">
                        <span class="stat-label">Rank</span>
                        <span class="stat-number" id="home-modal-rank">#0</span>
                    </div>
                    <div class="modal-stat">
                        <span class="stat-label">Points</span>
                        <span class="stat-number" id="home-modal-score">0</span>
                    </div>
                    <div class="modal-stat">
                        <span class="stat-label">PRs</span>
                        <span class="stat-number" id="home-modal-prs">0</span>
                    </div>
                    <div class="modal-stat">
                        <span class="stat-label">Events</span>
                        <span class="stat-number" id="home-modal-events">0</span>
                    </div>
                </div>

                <div class="modal-progress-section">
                    <h3>Level Progress</h3>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="home-progress-fill"></div>
                        </div>
                        <p id="home-progress-text">Level Progress: 0%</p>
                    </div>
                </div>

                <div class="modal-achievements-section">
                    <h3>Recent Achievements</h3>
                    <div class="modal-achievements-grid" id="home-modal-achievements">
                        <!-- Achievements will be populated by JS -->
                    </div>
                </div>

                <div class="modal-actions">
                    <a href="pages/leaderboard.html" class="modal-btn primary-btn">
                        <i class="fas fa-chart-bar"></i> View Full Dashboard
                    </a>
                    <a href="#" id="home-modal-profile-link" target="_blank" class="modal-btn secondary-btn">
                        <i class="fab fa-github"></i> GitHub Profile
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', closeHomeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeHomeModal();
        });
    }
    
    // Populate modal with contributor data
    document.getElementById('home-modal-avatar').src = contributor.avatar || 'assets/logo.png';
    document.getElementById('home-modal-name').textContent = contributor.login;
    document.getElementById('home-modal-id').textContent = `ID: ${contributor.id || 'N/A'}`; 
    document.getElementById('home-modal-rank').textContent = `#${contributor.rank || '--'}`;
    document.getElementById('home-modal-score').textContent = contributor.xp || 0;
    document.getElementById('home-modal-prs').textContent = contributor.prCount || 0;
    document.getElementById('home-modal-events').textContent = contributor.events || 0;
    document.getElementById('home-modal-league-badge').textContent = getClassLabel(contributor.class) || 'Contributor';
    
    // Progress bar
    const levelProgress = (contributor.xp % 1000) / 10; // Simple progress calculation
    document.getElementById('home-progress-fill').style.width = `${levelProgress}%`;
    document.getElementById('home-progress-text').textContent = `Level Progress: ${Math.round(levelProgress)}%`;
    
    // Profile link
    document.getElementById('home-modal-profile-link').href = contributor.html_url || '#';
    
    // Show achievements
    renderHomeAchievements(contributor.achievements || {});
    
    // Show modal
    modal.classList.add('active');
}

function renderHomeAchievements(achievements) {
    const container = document.getElementById('home-modal-achievements');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!achievements || Object.keys(achievements).length === 0) {
        container.innerHTML = '<p class="no-achievements">No achievements yet. Keep contributing!</p>';
        return;
    }
    
    // Show up to 4 achievements
    const achievementKeys = Object.keys(achievements).slice(0, 4);
    
    achievementKeys.forEach(achId => {
        if (achievements[achId]) {
            const achievement = HOME_ACHIEVEMENTS.find(a => a.id === achId);
            if (achievement) {
                const achElement = document.createElement('div');
                achElement.className = 'modal-achievement';
                achElement.innerHTML = `
                    <i class="${achievement.icon}"></i>
                    <div>
                        <h5>${achievement.name}</h5>
                        <p>${achievement.description}</p>
                    </div>
                `;
                container.appendChild(achElement);
            }
        }
    });
}

function closeHomeModal() {
    const modal = document.getElementById('home-contributor-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Add keyboard support for closing modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeHomeModal();
        // Also close main leaderboard modal if it exists
        const mainModal = document.getElementById('contributor-modal');
        if (mainModal && mainModal.classList.contains('active')) {
            mainModal.classList.remove('active');
        }
    }
});

// =========================================
// INTEGRATION WITH QUICK STATS WIDGET
// =========================================

// Function to update stats when contributions happen
function updateQuickStatsOnContribution(type, details) {
    if (window.quickStatsWidget) {
        let message = '';
        let icon = 'fas fa-code-branch';
        
        switch(type) {
            case 'pr_merged':
                message = `PR merged: ${details.title || 'New contribution'}`;
                icon = 'fas fa-code-merge';
                break;
            case 'event_attended':
                message = `Attended event: ${details.name || 'Community event'}`;
                icon = 'fas fa-calendar-check';
                break;
            case 'project_created':
                message = `New project created: ${details.name || 'Project'}`;
                icon = 'fas fa-plus-circle';
                break;
            default:
                message = 'New community activity';
        }
        
        window.quickStatsWidget.logActivity('contribution', message, icon);
        
        // Update recent contributions count
        const currentContributions = parseInt(localStorage.getItem('recentContributions') || '0');
        localStorage.setItem('recentContributions', (currentContributions + 1).toString());
    }
}

// Listen for contribution events (you can call this from other parts of your app)
document.addEventListener('contributionMade', (event) => {
    if (event.detail && event.detail.type) {
        updateQuickStatsOnContribution(event.detail.type, event.detail);
    }
});

// Example: Simulate a contribution event (you can remove this in production)
setTimeout(() => {
    const contributionEvent = new CustomEvent('contributionMade', {
        detail: {
            type: 'pr_merged',
            title: 'Fixed mobile navbar issue',
            user: 'contributor123'
        }
    });
    document.dispatchEvent(contributionEvent);
}, 5000);