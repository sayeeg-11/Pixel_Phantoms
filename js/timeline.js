// =========================================
// RECENT ACTIVITY TIMELINE FUNCTIONALITY
// =========================================

class ActivityTimeline {
    constructor() {
        this.activities = [];
        this.currentFilter = 'all';
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadActivities();
        this.renderTimeline();
    }
    
    cacheElements() {
        this.elements = {
            container: document.getElementById('timeline-container'),
            loading: document.getElementById('timeline-loading'),
            filters: document.getElementById('timeline-filters'),
            filterTags: document.querySelectorAll('.filter-tag'),
            refreshBtn: document.getElementById('timeline-refresh'),
            addBtn: document.getElementById('timeline-add'),
            allBtn: document.getElementById('timeline-all'),
            modal: document.getElementById('add-activity-modal'),
            form: document.getElementById('activity-form'),
            countAll: document.getElementById('count-all'),
            countProjects: document.getElementById('count-projects'),
            countEvents: document.getElementById('count-events'),
            countContributions: document.getElementById('count-contributions'),
            countAchievements: document.getElementById('count-achievements')
        };
    }
    
    bindEvents() {
        // Filter events
        if (this.elements.filterTags) {
            this.elements.filterTags.forEach(tag => {
                tag.addEventListener('click', (e) => {
                    const filter = e.currentTarget.dataset.filter;
                    this.setFilter(filter);
                });
            });
        }
        
        // Control buttons
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => this.refreshActivities());
        }
        
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        if (this.elements.allBtn) {
            this.elements.allBtn.addEventListener('click', () => this.setFilter('all'));
        }
        
        // Form submission
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewActivity();
            });
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.style.display !== 'none') {
                this.closeAddModal();
            }
        });
    }
    
    loadActivities() {
        // Try to load from localStorage first
        const savedActivities = localStorage.getItem('userActivities');
        
        if (savedActivities) {
            this.activities = JSON.parse(savedActivities);
        } else {
            // Load mock activities if none exist
            this.loadMockActivities();
        }
        
        this.updateCounts();
    }
    
    loadMockActivities() {
        const mockActivities = [
            {
                id: 1,
                type: 'project',
                title: 'Joined Neural Nexus Project',
                description: 'Started contributing to the AI neural network visualization tool. Working on real-time data processing module.',
                date: '2024-01-15',
                timeAgo: '3 days ago',
                points: 250,
                projectName: 'Neural Nexus',
                icon: 'fas fa-rocket'
            },
            {
                id: 2,
                type: 'event',
                title: 'Attended Winter Code Jam 2025',
                description: 'Participated in 48-hour coding marathon. Built a real-time cybersecurity dashboard with team "CyberSentinels".',
                date: '2024-01-12',
                timeAgo: '6 days ago',
                points: 500,
                eventName: 'Winter Code Jam 2025',
                icon: 'fas fa-calendar-check'
            },
            {
                id: 3,
                type: 'contribution',
                title: 'PR Merged: Enhanced Leaderboard UI',
                description: 'Improved the leaderboard visualization with 3D effects and better mobile responsiveness. Added touch-friendly interactions.',
                date: '2024-01-10',
                timeAgo: '1 week ago',
                points: 300,
                prNumber: '#42',
                icon: 'fas fa-code-merge'
            },
            {
                id: 4,
                type: 'achievement',
                title: 'Earned "Bug Hunter" Badge',
                description: 'Successfully identified and fixed 10 critical bugs across different projects. Awarded for exceptional debugging skills.',
                date: '2024-01-05',
                timeAgo: '2 weeks ago',
                points: 1000,
                badgeName: 'Bug Hunter',
                icon: 'fas fa-trophy'
            },
            {
                id: 5,
                type: 'project',
                title: 'Completed Quantum Quest Onboarding',
                description: 'Finished all onboarding modules for the quantum computing simulation platform. Ready to start contributing to core algorithms.',
                date: '2024-01-01',
                timeAgo: '3 weeks ago',
                points: 150,
                projectName: 'Quantum Quest',
                icon: 'fas fa-atom'
            }
        ];
        
        this.activities = mockActivities;
        this.saveActivities();
    }
    
    saveActivities() {
        localStorage.setItem('userActivities', JSON.stringify(this.activities));
    }
    
    updateCounts() {
        if (!this.elements.countAll) return;
        
        const counts = {
            all: this.activities.length,
            project: this.activities.filter(a => a.type === 'project').length,
            event: this.activities.filter(a => a.type === 'event').length,
            contribution: this.activities.filter(a => a.type === 'contribution').length,
            achievement: this.activities.filter(a => a.type === 'achievement').length
        };
        
        this.elements.countAll.textContent = counts.all;
        this.elements.countProjects.textContent = counts.project;
        this.elements.countEvents.textContent = counts.event;
        this.elements.countContributions.textContent = counts.contribution;
        this.elements.countAchievements.textContent = counts.achievement;
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter tag
        if (this.elements.filterTags) {
            this.elements.filterTags.forEach(tag => {
                if (tag.dataset.filter === filter) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
        }
        
        this.renderTimeline();
    }
    
    renderTimeline() {
        if (!this.elements.container) return;
        
        // Hide loading
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
        
        // Clear container
        this.elements.container.innerHTML = '';
        
        // Filter activities
        let filteredActivities = this.activities;
        if (this.currentFilter !== 'all') {
            filteredActivities = this.activities.filter(activity => 
                activity.type === this.currentFilter
            );
        }
        
        // Sort by date (newest first)
        filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Show empty state if no activities
        if (filteredActivities.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Render activities
        filteredActivities.forEach((activity, index) => {
            const timelineItem = this.createTimelineItem(activity, index);
            this.elements.container.appendChild(timelineItem);
        });
    }
    
    createTimelineItem(activity, index) {
        const item = document.createElement('div');
        item.className = `timeline-item ${activity.type}`;
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Format date
        const date = new Date(activity.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Determine badge text and icon
        let badgeText = '';
        let badgeIcon = '';
        
        switch(activity.type) {
            case 'project':
                badgeText = 'Project';
                badgeIcon = 'fas fa-rocket';
                break;
            case 'event':
                badgeText = 'Event';
                badgeIcon = 'fas fa-calendar-alt';
                break;
            case 'contribution':
                badgeText = 'Contribution';
                badgeIcon = 'fas fa-code-branch';
                break;
            case 'achievement':
                badgeText = 'Achievement';
                badgeIcon = 'fas fa-trophy';
                break;
        }
        
        // Create HTML
        item.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-header-content">
                    <span class="activity-type-badge badge-${activity.type}">
                        <i class="${badgeIcon}"></i>
                        ${badgeText}
                    </span>
                    <span class="activity-time">
                        <i class="fas fa-clock"></i>
                        ${activity.timeAgo || formattedDate}
                    </span>
                </div>
                
                <h3 class="activity-title">${activity.title}</h3>
                
                <p class="activity-description">${activity.description}</p>
                
                <div class="activity-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Date:</span>
                        <span class="meta-value">${formattedDate}</span>
                    </div>
                    
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>Points:</span>
                        <span class="meta-value">+${activity.points || 0}</span>
                    </div>
                    
                    ${activity.projectName ? `
                    <div class="meta-item">
                        <i class="fas fa-project-diagram"></i>
                        <span>Project:</span>
                        <span class="meta-value">${activity.projectName}</span>
                    </div>
                    ` : ''}
                    
                    ${activity.eventName ? `
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>Event:</span>
                        <span class="meta-value">${activity.eventName}</span>
                    </div>
                    ` : ''}
                    
                    ${activity.prNumber ? `
                    <div class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        <span>PR:</span>
                        <span class="meta-value">${activity.prNumber}</span>
                    </div>
                    ` : ''}
                    
                    ${activity.badgeName ? `
                    <div class="meta-item">
                        <i class="fas fa-award"></i>
                        <span>Badge:</span>
                        <span class="meta-value">${activity.badgeName}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="activity-actions">
                    <button class="action-btn" onclick="timeline.shareActivity(${activity.id})">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    <button class="action-btn primary" onclick="timeline.viewDetails(${activity.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
        
        return item;
    }
    
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'timeline-empty';
        emptyState.innerHTML = `
            <i class="fas fa-history"></i>
            <h3>No Activities Yet</h3>
            <p>Start your journey by joining projects, attending events, or making contributions to see them appear here!</p>
            <button class="btn-primary" onclick="timeline.showAddModal()">
                <i class="fas fa-plus"></i> Add Your First Activity
            </button>
        `;
        
        this.elements.container.appendChild(emptyState);
    }
    
    showAddModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'flex';
            setTimeout(() => {
                this.elements.modal.classList.add('active');
            }, 10);
        }
    }
    
    closeAddModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('active');
            setTimeout(() => {
                this.elements.modal.style.display = 'none';
                this.elements.form.reset();
            }, 300);
        }
    }
    
    addNewActivity() {
        const form = this.elements.form;
        const title = document.getElementById('activity-title').value;
        const type = document.getElementById('activity-type').value;
        const description = document.getElementById('activity-description').value;
        const date = document.getElementById('activity-date').value || new Date().toISOString().split('T')[0];
        const points = parseInt(document.getElementById('activity-points').value) || 0;
        const context = document.getElementById('activity-context').value;
        
        if (!title) {
            alert('Please enter a title for the activity');
            return;
        }
        
        // Calculate time ago
        const activityDate = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - activityDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = '';
        if (diffDays === 0) timeAgo = 'Today';
        else if (diffDays === 1) timeAgo = 'Yesterday';
        else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
        else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} weeks ago`;
        else timeAgo = `${Math.floor(diffDays / 30)} months ago`;
        
        // Create new activity
        const newActivity = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            date: date,
            timeAgo: timeAgo,
            points: points,
            icon: this.getIconForType(type)
        };
        
        // Add context based on type
        switch(type) {
            case 'project':
                newActivity.projectName = context;
                break;
            case 'event':
                newActivity.eventName = context;
                break;
            case 'contribution':
                newActivity.prNumber = context ? `#${context}` : '';
                break;
            case 'achievement':
                newActivity.badgeName = context;
                break;
        }
        
        // Add to beginning of array
        this.activities.unshift(newActivity);
        
        // Save and update
        this.saveActivities();
        this.updateCounts();
        this.renderTimeline();
        
        // Close modal
        this.closeAddModal();
        
        // Show success message
        this.showSuccess('Activity added successfully!');
    }
    
    getIconForType(type) {
        switch(type) {
            case 'project': return 'fas fa-rocket';
            case 'event': return 'fas fa-calendar-alt';
            case 'contribution': return 'fas fa-code-branch';
            case 'achievement': return 'fas fa-trophy';
            default: return 'fas fa-history';
        }
    }
    
    refreshActivities() {
        // Show loading
        if (this.elements.loading) {
            this.elements.loading.style.display = 'block';
            this.elements.container.innerHTML = '';
        }
        
        // Simulate API call
        setTimeout(() => {
            this.loadActivities();
            this.renderTimeline();
            
            // Show success animation
            this.showSuccess('Timeline refreshed!');
        }, 800);
    }
    
    shareActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const shareText = `Check out my recent activity on Pixel Phantoms: ${activity.title}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Pixel Phantoms Activity',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => this.showSuccess('Link copied to clipboard!'))
                .catch(() => alert('Could not copy to clipboard'));
        }
    }
    
    viewDetails(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 600px;">
                <button class="close-modal" onclick="this.parentElement.parentElement.classList.remove('active'); setTimeout(() => this.parentElement.parentElement.remove(), 300)">&times;</button>
                
                <div class="modal-header">
                    <i class="${activity.icon}" style="font-size: 3rem; color: ${this.getColorForType(activity.type)};"></i>
                    <h2>${activity.title}</h2>
                    <p class="modal-subtitle">${this.getTypeLabel(activity.type)} • ${activity.timeAgo}</p>
                </div>

                <div class="modal-body">
                    <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">${activity.description}</p>
                    
                    <div class="modal-stats-row">
                        <div class="modal-stat">
                            <span class="stat-label">Date</span>
                            <span class="stat-number">${new Date(activity.date).toLocaleDateString()}</span>
                        </div>
                        <div class="modal-stat">
                            <span class="stat-label">Points Earned</span>
                            <span class="stat-number" style="color: var(--neon-green);">+${activity.points}</span>
                        </div>
                    </div>
                    
                    ${activity.projectName ? `
                    <div class="info-card" style="margin-top: 20px;">
                        <h4><i class="fas fa-project-diagram"></i> Project Details</h4>
                        <p><strong>Project:</strong> ${activity.projectName}</p>
                    </div>
                    ` : ''}
                    
                    ${activity.eventName ? `
                    <div class="info-card" style="margin-top: 20px;">
                        <h4><i class="fas fa-calendar"></i> Event Details</h4>
                        <p><strong>Event:</strong> ${activity.eventName}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="modal-actions">
                    <button class="modal-btn secondary-btn" onclick="timeline.shareActivity(${activity.id})">
                        <i class="fas fa-share-alt"></i> Share Activity
                    </button>
                    <button class="modal-btn primary-btn" onclick="this.parentElement.parentElement.parentElement.classList.remove('active'); setTimeout(() => this.parentElement.parentElement.parentElement.remove(), 300)">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    getColorForType(type) {
        switch(type) {
            case 'project': return 'var(--neon-green)';
            case 'event': return 'var(--neon-purple)';
            case 'contribution': return 'var(--neon-cyan)';
            case 'achievement': return 'var(--neon-yellow)';
            default: return 'var(--text-main)';
        }
    }
    
    getTypeLabel(type) {
        switch(type) {
            case 'project': return 'Project Activity';
            case 'event': return 'Event Participation';
            case 'contribution': return 'Code Contribution';
            case 'achievement': return 'Achievement Earned';
            default: return 'Activity';
        }
    }
    
    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--neon-green);
            color: #000;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 5px 20px rgba(10, 255, 96, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global helper functions
function closeAddActivityModal() {
    if (window.timeline) {
        window.timeline.closeAddModal();
    }
}

// Initialize timeline when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the settings page
    if (document.getElementById('timeline-container')) {
        const timeline = new ActivityTimeline();
        
        // Make it available globally
        window.timeline = timeline;
        
        // Add CSS for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});