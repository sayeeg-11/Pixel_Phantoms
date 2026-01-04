// =========================================
// QUICK STATS DASHBOARD WIDGET FUNCTIONALITY
// =========================================

class QuickStatsWidget {
    constructor() {
        this.statsData = {
            activeProjects: 0,
            upcomingEvents: 0,
            recentContributions: 0,
            recentActivity: [],
            totalMembers: 0,
            activeMembers: 0,
            completedProjects: 0,
            eventAttendance: 0
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadStats();
        this.startAutoRefresh();
    }
    
    cacheElements() {
        this.elements = {
            widget: document.getElementById('quick-stats-widget'),
            refreshBtn: document.getElementById('refresh-stats'),
            projectsCount: document.getElementById('active-projects-count'),
            eventsCount: document.getElementById('upcoming-events-count'),
            contributionsCount: document.getElementById('recent-contributions-count'),
            activityList: document.getElementById('recent-activity-list'),
            projectsCard: document.getElementById('active-projects-card'),
            eventsCard: document.getElementById('upcoming-events-card'),
            contributionsCard: document.getElementById('recent-contributions-card'),
            membersCount: document.getElementById('total-members-count'),
            activeMembersCount: document.getElementById('active-members-count'),
            completedProjectsCount: document.getElementById('completed-projects-count'),
            eventAttendanceCount: document.getElementById('event-attendance-count')
        };
    }
    
    bindEvents() {
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshStats());
        }
        
        // Add click handlers to stat cards
        if (this.elements.projectsCard) {
            this.elements.projectsCard.addEventListener('click', () => {
                window.location.href = '../pages/projects.html';
            });
        }
        
        if (this.elements.eventsCard) {
            this.elements.eventsCard.addEventListener('click', () => {
                window.location.href = '../pages/events.html';
            });
        }
        
        if (this.elements.contributionsCard) {
            this.elements.contributionsCard.addEventListener('click', () => {
                window.open('https://github.com/sayeeg-11/Pixel_Phantoms', '_blank');
            });
        }
    }
    
    async loadStats() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Load projects data
            const projectsResponse = await fetch('../data/projects.json');
            if (!projectsResponse.ok) throw new Error(`Projects fetch failed: ${projectsResponse.status}`);
            const projectsData = await projectsResponse.json();
            if (!Array.isArray(projectsData)) throw new Error('Invalid projects data format');
            
            // Count active projects
            this.statsData.activeProjects = projectsData.filter(project => project.status === 'active').length || 0;
            this.statsData.completedProjects = projectsData.filter(project => project.status === 'completed').length || 0;
            
            // Load events data
            const eventsResponse = await fetch('../data/events.json');
            if (!eventsResponse.ok) throw new Error(`Events fetch failed: ${eventsResponse.status}`);
            const eventsData = await eventsResponse.json();
            if (!Array.isArray(eventsData)) throw new Error('Invalid events data format');
            
            // Count upcoming events (filter by date)
            const today = new Date();
            this.statsData.upcomingEvents = eventsData.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today;
            }).length || 0;
            
            // Load members data
            await this.loadMembersData();
            
            // Load recent contributions from localStorage or mock data
            this.loadRecentContributions();
            
            // Load recent activity
            this.loadRecentActivity();
            
            // Load event attendance data
            await this.loadEventAttendance();
            
            // Update UI
            this.updateStatsDisplay();
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error loading stats:', error);
            this.loadMockData();
        }
    }
    
    async loadMembersData() {
        try {
            // Attempt to fetch members data from a potential API or JSON file
            const membersResponse = await fetch('../data/members.json');
            if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                if (Array.isArray(membersData)) {
                    this.statsData.totalMembers = membersData.length;
                    // Count active members (those with recent activity)
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    this.statsData.activeMembers = membersData.filter(member => {
                        if (member.lastActive) {
                            const lastActiveDate = new Date(member.lastActive);
                            return lastActiveDate >= thirtyDaysAgo;
                        }
                        return false;
                    }).length;
                } else {
                    // Fallback to mock data if structure is unexpected
                    this.statsData.totalMembers = 150;
                    this.statsData.activeMembers = 65;
                }
            } else {
                // Fallback to mock data if fetch fails
                this.statsData.totalMembers = 150;
                this.statsData.activeMembers = 65;
            }
        } catch (error) {
            console.warn('Error loading members data:', error);
            // Fallback to mock data
            this.statsData.totalMembers = 150;
            this.statsData.activeMembers = 65;
        }
    }
    
    async loadEventAttendance() {
        try {
            // Fetch attendance data from CSV
            const attendanceResponse = await fetch('../data/attendance.csv');
            if (!attendanceResponse.ok) throw new Error(`Attendance fetch failed: ${attendanceResponse.status}`);
            const csvText = await attendanceResponse.text();
            
            // Parse CSV data
            const attendanceMap = this.parseAttendanceCSV(csvText);
            this.statsData.eventAttendance = Object.keys(attendanceMap).length || 0;
        } catch (error) {
            console.warn('Error loading event attendance:', error);
            // Fallback to mock data
            this.statsData.eventAttendance = 85;
        }
    }
    
    parseAttendanceCSV(csvText) {
        const attendanceMap = {};
        if (!csvText) return attendanceMap;

        try {
            const lines = csvText.split('\n');
            // Skip header line
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue; // Skip empty lines
                
                // Handle potential CSV parsing issues with quoted fields
                const parts = this.parseCSVLine(line);
                if (parts.length >= 3) {
                    const username = parts[0].trim();
                    if (username) {
                        // Track User Attendance - count unique events per user
                        if (!attendanceMap[username]) {
                            attendanceMap[username] = [];
                        }
                        const eventName = parts[2].trim();
                        if (!attendanceMap[username].includes(eventName)) {
                            attendanceMap[username].push(eventName);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing attendance CSV:', error);
            // Return empty map if parsing fails
            return {};
        }

        return attendanceMap;
    }
    
    // Improved CSV line parser that handles quoted fields
    parseCSVLine(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
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
    
    loadRecentContributions() {
        // Try to get from localStorage first
        const storedContributions = localStorage.getItem('recentContributions');
        const storedLastUpdated = localStorage.getItem('recentContributionsLastUpdated');
        const now = new Date();
        const lastUpdated = storedLastUpdated ? new Date(storedLastUpdated) : null;
        const hoursSinceUpdate = lastUpdated ? (now - lastUpdated) / (1000 * 60 * 60) : 24;
        
        if (storedContributions && hoursSinceUpdate < 24) {
            // Use cached data if updated in the last 24 hours
            this.statsData.recentContributions = parseInt(storedContributions) || 0;
        } else {
            // Generate mock data based on current time
            const hour = new Date().getHours();
            // More contributions during "active hours"
            this.statsData.recentContributions = hour >= 9 && hour <= 17 ? 
                Math.floor(Math.random() * 15) + 10 : 
                Math.floor(Math.random() * 8) + 2;
            
            // Store for consistency
            localStorage.setItem('recentContributions', this.statsData.recentContributions.toString());
            localStorage.setItem('recentContributionsLastUpdated', now.toISOString());
        }
    }
    
    loadRecentActivity() {
        // Try to get real activity from localStorage
        const realActivity = JSON.parse(localStorage.getItem('userActivity') || '[]');
        if (realActivity.length > 0) {
            this.statsData.recentActivity = realActivity.slice(0, 4);
            return;
        }
        
        // Mock recent activity data if no real data exists
        this.statsData.recentActivity = [
            {
                type: 'contribution',
                message: 'New PR merged: Enhanced leaderboard visualization',
                time: '2 hours ago',
                icon: 'fas fa-code-branch'
            },
            {
                type: 'event',
                message: 'Winter Code Jam 2025 registrations opened',
                time: '5 hours ago',
                icon: 'fas fa-calendar-plus'
            },
            {
                type: 'project',
                message: 'Project "Neural Nexus" marked as active',
                time: '1 day ago',
                icon: 'fas fa-rocket'
            },
            {
                type: 'achievement',
                message: 'User "coder42" earned "Bug Hunter" badge',
                time: '2 days ago',
                icon: 'fas fa-trophy'
            }
        ];
    }
    
    loadMockData() {
        // Fallback mock data
        this.statsData = {
            activeProjects: 8,
            upcomingEvents: 3,
            recentContributions: 24,
            totalMembers: 150,
            activeMembers: 65,
            completedProjects: 5,
            eventAttendance: 85,
            recentActivity: [
                {
                    type: 'system',
                    message: 'Using cached data - network connection issue',
                    time: 'Just now',
                    icon: 'fas fa-exclamation-triangle'
                },
                {
                    type: 'contribution',
                    message: 'PR #42: Fixed mobile responsive issues',
                    time: '1 hour ago',
                    icon: 'fas fa-code'
                }
            ]
        };
        
        this.updateStatsDisplay();
        this.hideLoadingState();
    }
    
    updateStatsDisplay() {
        // Update counts with animation
        this.animateNumber(this.elements.projectsCount, this.statsData.activeProjects);
        this.animateNumber(this.elements.eventsCount, this.statsData.upcomingEvents);
        this.animateNumber(this.elements.contributionsCount, this.statsData.recentContributions);
        this.animateNumber(this.elements.membersCount, this.statsData.totalMembers);
        this.animateNumber(this.elements.activeMembersCount, this.statsData.activeMembers);
        this.animateNumber(this.elements.completedProjectsCount, this.statsData.completedProjects);
        this.animateNumber(this.elements.eventAttendanceCount, this.statsData.eventAttendance);
        
        // Update recent activity
        this.updateActivityList();
    }
    
    animateNumber(element, targetValue) {
        if (!element) return;
        
        const current = parseInt(element.textContent) || 0;
        const increment = targetValue > current ? 1 : -1;
        let currentValue = current;
        const stepTime = Math.abs(targetValue - current) > 100 ? 10 : 20; // Faster for larger numbers
        
        const interval = setInterval(() => {
            currentValue += increment;
            element.textContent = currentValue;
            
            if ((increment > 0 && currentValue >= targetValue) || (increment < 0 && currentValue <= targetValue)) {
                clearInterval(interval);
                element.textContent = targetValue;
            }
        }, stepTime);
    }
    
    updateActivityList() {
        if (!this.elements.activityList) return;
        
        this.elements.activityList.innerHTML = '';
        
        if (this.statsData.recentActivity.length === 0) {
            this.elements.activityList.innerHTML = `
                <li class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>No recent activity to display</p>
                        <span class="activity-time">Check back later</span>
                    </div>
                </li>
            `;
            return;
        }
        
        this.statsData.recentActivity.forEach(activity => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            
            // Add click handler based on activity type
            if (activity.type === 'event') {
                activityItem.style.cursor = 'pointer';
                activityItem.addEventListener('click', () => {
                    window.location.href = '../pages/events.html';
                });
            }
            
            this.elements.activityList.appendChild(activityItem);
        });
    }
    
    showLoadingState() {
        if (!this.elements.widget) return;
        
        this.elements.widget.classList.add('loading-shimmer');
        if (this.elements.refreshBtn) {
            const icon = this.elements.refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('spinning');
            }
            this.elements.refreshBtn.disabled = true;
        }
        
        // Add pulsing animation to cards
        [this.elements.projectsCard, this.elements.eventsCard, this.elements.contributionsCard]
            .forEach(card => {
                if (card) card.classList.add('empty');
            });
    }
    
    hideLoadingState() {
        if (!this.elements.widget) return;
        
        this.elements.widget.classList.remove('loading-shimmer');
        if (this.elements.refreshBtn) {
            const icon = this.elements.refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('spinning');
            }
            this.elements.refreshBtn.disabled = false;
        }
        
        // Remove pulsing animation
        [this.elements.projectsCard, this.elements.eventsCard, this.elements.contributionsCard]
            .forEach(card => {
                if (card) card.classList.remove('empty');
            });
    }
    
    async refreshStats() {
        // Add a new activity entry
        const newActivity = {
            type: 'system',
            message: 'Stats manually refreshed',
            time: 'Just now',
            icon: 'fas fa-sync-alt'
        };
        
        this.statsData.recentActivity.unshift(newActivity);
        if (this.statsData.recentActivity.length > 5) {
            this.statsData.recentActivity = this.statsData.recentActivity.slice(0, 5);
        }
        
        // Save to localStorage
        localStorage.setItem('userActivity', JSON.stringify(this.statsData.recentActivity));
        
        // Reload stats
        await this.loadStats();
        
        // Show success animation
        this.showSuccessAnimation();
    }
    
    showSuccessAnimation() {
        if (!this.elements.widget) return;
        
        // Add success flash
        this.elements.widget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
        setTimeout(() => {
            this.elements.widget.style.boxShadow = '';
        }, 1000);
    }
    
    startAutoRefresh() {
        // Auto-refresh every 10 minutes
        setInterval(() => {
            this.refreshStats();
        }, 10 * 60 * 1000);
    }
    
    // Public method to add new activity
    logActivity(type, message, icon = 'fas fa-info-circle') {
        const newActivity = {
            type,
            message,
            time: 'Just now',
            icon
        };
        
        this.statsData.recentActivity.unshift(newActivity);
        if (this.statsData.recentActivity.length > 5) {
            this.statsData.recentActivity = this.statsData.recentActivity.slice(0, 5);
        }
        
        // Update display
        this.updateActivityList();
        
        // Save to localStorage
        localStorage.setItem('userActivity', JSON.stringify(this.statsData.recentActivity));
    }
}

// Initialize the widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the leaderboard page
    if (document.getElementById('quick-stats-widget')) {
        const quickStatsWidget = new QuickStatsWidget();
        
        // Make it available globally for other scripts
        window.quickStatsWidget = quickStatsWidget;
        
        // Log initial load
        quickStatsWidget.logActivity('system', 'Quick Stats Dashboard initialized', 'fas fa-tachometer-alt');
    }
});