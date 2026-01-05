/**
 * PROFILE PAGE SCRIPT - PIXEL PHANTOMS
 * Handles user profile display, authentication, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== AUTHENTICATION CHECK =====
  // Redirect to login if user is not authenticated
  function checkAuthentication() {
    const sessionCodename = localStorage.getItem('session_codename');

    if (!sessionCodename) {
      // User not logged in, redirect to login page
      window.location.href = '../pages/login.html';
      return false;
    }

    return sessionCodename;
  }

  const currentUser = checkAuthentication();
  if (!currentUser) return;

  // ===== DOM ELEMENTS =====
  const profileName = document.getElementById('profile-name');
  const profileRole = document.getElementById('profile-role');
  const profileCodename = document.getElementById('profile-codename');
  const profileAvatar = document.getElementById('profile-avatar');
  const statusBadge = document.getElementById('status-badge');

  // Details
  const detailCodename = document.getElementById('detail-codename');
  const detailEmail = document.getElementById('detail-email');
  const detailRole = document.getElementById('detail-role');
  const detailJoined = document.getElementById('detail-joined');
  const detailActive = document.getElementById('detail-active');

  // Activity Stats
  const eventsCount = document.getElementById('events-count');
  const contributionsCount = document.getElementById('contributions-count');
  const projectsCount = document.getElementById('projects-count');
  const achievementsCount = document.getElementById('achievements-count');

  // Buttons
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Activity Timeline
  const activityTimeline = document.getElementById('activity-timeline');
  const achievementsGrid = document.getElementById('achievements-grid');

  // ===== USER DATA =====
  // Get user data from localStorage
  function getUserData() {
    const accounts = JSON.parse(localStorage.getItem('user_accounts')) || [];
    const userData = accounts.find(acc => acc.codename === currentUser.toLowerCase().trim());

    if (!userData) {
      // If user data not found, create basic profile
      return {
        codename: currentUser,
        email: 'agent@pixelphantoms.com',
        role: 'CONTRIBUTOR',
        joined: new Date().toLocaleDateString(),
        status: 'ONLINE',
      };
    }

    return {
      codename: userData.codename,
      email: userData.email || 'agent@pixelphantoms.com',
      role: userData.role || 'CONTRIBUTOR',
      joined: userData.joined || new Date().toLocaleDateString(),
      status: 'ONLINE',
    };
  }

  // Get user activity data (simulated - replace with actual API call)
  function getUserActivity() {
    // Check if activity data exists in localStorage
    const activityKey = `activity_${currentUser}`;
    let activity = JSON.parse(localStorage.getItem(activityKey));

    if (!activity) {
      // Create initial activity data
      activity = {
        events: Math.floor(Math.random() * 10),
        contributions: Math.floor(Math.random() * 20),
        projects: Math.floor(Math.random() * 5),
        achievements: Math.floor(Math.random() * 8),
      };
      localStorage.setItem(activityKey, JSON.stringify(activity));
    }

    return activity;
  }

  // ===== POPULATE PROFILE =====
  function populateProfile() {
    const user = getUserData();
    const activity = getUserActivity();

    // Header
    profileName.textContent = user.codename.toUpperCase();
    profileCodename.textContent = `@${user.codename}`;

    // Set avatar initial
    const initial = user.codename.charAt(0).toUpperCase();
    profileAvatar.innerHTML = `<span style="font-size: 3rem; font-weight: 800;">${initial}</span>`;

    // Details
    detailCodename.textContent = user.codename;
    detailEmail.textContent = user.email;
    detailRole.textContent = user.role;
    detailJoined.textContent = user.joined;
    detailActive.textContent = 'Just now';

    // Activity Stats with animation
    animateCounter(eventsCount, activity.events);
    animateCounter(contributionsCount, activity.contributions);
    animateCounter(projectsCount, activity.projects);
    animateCounter(achievementsCount, activity.achievements);

    // Update status badge
    statusBadge.classList.add('online');

    // Load achievements
    loadAchievements(activity.achievements);

    // Load activity timeline
    loadActivityTimeline();
  }

  // Animate counter
  function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 20);
  }

  // ===== ACHIEVEMENTS =====
  function loadAchievements(unlockedCount) {
    const achievements = [
      { icon: 'fa-user-check', name: 'First Login', unlocked: unlockedCount >= 1 },
      { icon: 'fa-calendar-check', name: 'Event Attendee', unlocked: unlockedCount >= 2 },
      { icon: 'fa-code', name: 'Code Contributor', unlocked: unlockedCount >= 3 },
      { icon: 'fa-star', name: 'Community Star', unlocked: unlockedCount >= 4 },
      { icon: 'fa-fire', name: 'On Fire', unlocked: unlockedCount >= 5 },
      { icon: 'fa-trophy', name: 'Champion', unlocked: unlockedCount >= 6 },
      { icon: 'fa-crown', name: 'Legend', unlocked: unlockedCount >= 7 },
      { icon: 'fa-rocket', name: 'Master', unlocked: unlockedCount >= 8 },
    ];

    achievementsGrid.innerHTML = achievements
      .map(
        ach => `
            <div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}" 
                 title="${ach.name}">
                <i class="fas ${ach.unlocked ? ach.icon : 'fa-lock'}"></i>
                <span>${ach.name}</span>
            </div>
        `
      )
      .join('');
  }

  // ===== ACTIVITY TIMELINE =====
  function loadActivityTimeline() {
    const activities = [
      { text: 'Logged in successfully', time: 'Just now' },
      { text: 'Profile viewed', time: '1 minute ago' },
      { text: 'Joined Pixel Phantoms', time: new Date().toLocaleDateString() },
    ];

    // Add random activities
    const randomActivities = [
      'Attended a workshop',
      'Contributed to a project',
      'Joined an event',
      'Made a code commit',
      'Completed a challenge',
    ];

    const additionalCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < additionalCount; i++) {
      const randomActivity = randomActivities[Math.floor(Math.random() * randomActivities.length)];
      activities.splice(1, 0, {
        text: randomActivity,
        time: `${Math.floor(Math.random() * 7) + 1} days ago`,
      });
    }

    activityTimeline.innerHTML = activities
      .map(
        activity => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <p class="timeline-text">${activity.text}</p>
                    <span class="timeline-time">${activity.time}</span>
                </div>
            </div>
        `
      )
      .join('');
  }

  // ===== EDIT PROFILE =====
  editProfileBtn.addEventListener('click', () => {
    // Show edit modal or redirect to edit page
    alert(
      'Edit Profile feature coming soon!\n\nIn the full version, you will be able to:\n• Update your avatar\n• Change your display name\n• Update email\n• Manage preferences'
    );

    // You can implement a modal or redirect to edit page
    // window.location.href = '../pages/edit-profile.html';
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear session
      localStorage.removeItem('session_codename');

      // Show logout animation
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.5s';

      setTimeout(() => {
        window.location.href = '../pages/login.html';
      }, 500);
    }
  });

  // ===== CYBER RAIN BACKGROUND =====
  function initCyberRain() {
    const canvas = document.getElementById('cyber-rain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana =
      'アァカサタナハマヤラワガザダバパピビヂゾブヅエェケセテネヘメレヱゲゼデベペオォコソトノホモヨロヲゴゾドボポ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + 'px "JetBrains Mono"';

      for (let i = 0; i < drops.length; i++) {
        const text = katakana[Math.floor(Math.random() * katakana.length)];
        const colorCode = Math.random() < 0.1 ? '#00ff88' : '#00aaff';
        ctx.fillStyle = colorCode;

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops.length = Math.floor(canvas.width / fontSize);
      for (let i = 0; i < drops.length; i++) {
        if (drops[i] === undefined) drops[i] = 0;
      }
    });

    setInterval(draw, 33);
  }

  // ===== UPDATE LAST ACTIVE TIME =====
  function updateLastActive() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    detailActive.textContent = `Just now (${timeString})`;
  }

  // Update every minute
  setInterval(updateLastActive, 60000);

  // ===== INITIALIZE =====
  populateProfile();
  initCyberRain();

  // Add fade-in animation
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s';
  }, 100);

  console.log(
    '%c🎮 PIXEL PHANTOMS - Profile Loaded',
    'color: #00aaff; font-size: 16px; font-weight: bold;'
  );
  console.log('%c👤 Agent: ' + currentUser, 'color: #00ff88; font-size: 14px;');
});
