// --- Keyboard Shortcuts System ---
console.log("keyboard-shortcuts.js loaded");

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.pressedKeys = new Map();
    this.longPressDelay = 500; // 500ms for long press
    this.isInputFocused = false;
    this.helpModalOpen = false;
    
    this.init();
  }

  init() {
    this.registerShortcuts();
    this.bindEvents();
    this.createHelpModal();
  }

  registerShortcuts() {
    // Navigation shortcuts
    this.shortcuts.set('h', {
      action: () => this.navigateTo('/', 'Home'),
      description: 'Navigate to Home'
    });
    
    this.shortcuts.set('e', {
      action: () => this.navigateTo('/events.html', 'Events'),
      description: 'Navigate to Events'
    });
    
    this.shortcuts.set('p', {
      action: () => this.navigateTo('/pages/projects.html', 'Projects'),
      description: 'Navigate to Projects'
    });
    
    this.shortcuts.set('a', {
      action: () => this.navigateTo('/about.html', 'About'),
      description: 'Navigate to About'
    });
    
    this.shortcuts.set('c', {
      action: () => this.navigateTo('/contact.html', 'Contact'),
      description: 'Navigate to Contact'
    });
    
    this.shortcuts.set('j', {
      action: () => this.navigateTo('/pages/join-us.html', 'Join Us'),
      description: 'Navigate to Join Us'
    });
    
    // Action shortcuts
    this.shortcuts.set('l', {
      action: () => this.scrollToLeaderboard(),
      description: 'Scroll to Leaderboard section'
    });
    
    this.shortcuts.set('t', {
      action: () => this.toggleTheme(),
      description: 'Toggle Theme (Dark/Light)'
    });
    
    this.shortcuts.set('f', {
      action: () => this.toggleFeedback(),
      description: 'Open/Close Feedback Widget'
    });
    
    // Help shortcuts
    this.shortcuts.set('?', {
      action: () => this.toggleHelpModal(),
      description: 'Show/Hide Help Modal'
    });
    
    this.shortcuts.set('/', {
      action: () => this.toggleHelpModal(),
      description: 'Show/Hide Help Modal'
    });
    
    // Close modal shortcut
    this.shortcuts.set('escape', {
      action: () => this.closeModals(),
      description: 'Close any open modal/panel'
    });
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Track input focus
    document.addEventListener('focusin', (e) => {
      this.isInputFocused = this.isInputElement(e.target);
    });
    
    document.addEventListener('focusout', () => {
      this.isInputFocused = false;
    });
    
    // Debug: Log all key presses to help troubleshoot
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' || e.key === '/' || e.key === 'Escape') {
        console.log(`🔍 Debug - Raw key event: key="${e.key}", code="${e.code}", shiftKey=${e.shiftKey}`);
      }
    });
  }

  handleKeyDown(e) {
    // Skip if typing in input fields
    if (this.isInputFocused) {
      console.log('⏭️ Skipping shortcut - input field focused');
      return;
    }
    
    let key = e.key.toLowerCase();
    
    // Handle special case for ? key (Shift + /)
    if (e.key === '?') {
      key = '?';
    }
    
    // Debug logging
    if (this.shortcuts.has(key) || key === 'escape') {
      console.log(`🔑 Key pressed: ${e.key} -> ${key} (registered: ${this.shortcuts.has(key)})`);
    }
    
    // Handle escape immediately (no long press needed)
    if (key === 'escape') {
      this.shortcuts.get('escape').action();
      return;
    }
    
    // Handle ? and / immediately (no long press needed for help)
    if (key === '?' || key === '/') {
      e.preventDefault();
      this.executeShortcut(key);
      return;
    }
    
    // Skip if not a registered shortcut
    if (!this.shortcuts.has(key)) return;
    
    // Prevent default for our shortcuts
    e.preventDefault();
    
    // Start long press timer if not already pressed
    if (!this.pressedKeys.has(key)) {
      console.log(`⏱️ Starting long press timer for: ${key}`);
      const timer = setTimeout(() => {
        console.log(`✅ Long press activated for: ${key}`);
        this.executeShortcut(key);
        this.pressedKeys.delete(key);
      }, this.longPressDelay);
      
      this.pressedKeys.set(key, timer);
    }
  }

  handleKeyUp(e) {
    let key = e.key.toLowerCase();
    
    // Handle special case for ? key (Shift + /)
    if (e.key === '?') {
      key = '?';
    }
    
    // Clear long press timer if key is released early
    if (this.pressedKeys.has(key)) {
      clearTimeout(this.pressedKeys.get(key));
      this.pressedKeys.delete(key);
    }
  }

  executeShortcut(key) {
    console.log(`🎯 executeShortcut called with key: "${key}"`);
    const shortcut = this.shortcuts.get(key);
    console.log('🔍 Shortcut found:', !!shortcut, shortcut?.description);
    
    if (shortcut) {
      console.log(`🚀 Executing shortcut: ${shortcut.description}`);
      shortcut.action();
      this.showShortcutFeedback(key, shortcut.description);
    } else {
      console.log(`❌ No shortcut found for key: "${key}"`);
    }
  }

  navigateTo(url, pageName) {
    // Handle relative URLs
    const currentPath = window.location.pathname;
    let targetUrl = url;
    
    // Adjust URL based on current location
    if (currentPath.includes('/pages/')) {
      if (url.startsWith('/pages/')) {
        targetUrl = url.replace('/pages/', '');
      } else if (url === '/') {
        targetUrl = '../index.html';
      } else {
        targetUrl = '..' + url;
      }
    } else {
      if (url.startsWith('/pages/')) {
        targetUrl = url.substring(1); // Remove leading slash
      } else if (url !== '/') {
        targetUrl = url.substring(1); // Remove leading slash
      } else {
        targetUrl = 'index.html';
      }
    }
    
    window.location.href = targetUrl;
  }

  scrollToLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) {
      leaderboard.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.showShortcutFeedback('l', 'Leaderboard not found on this page');
    }
  }

  toggleTheme() {
    // Look for existing theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle') || 
                       document.querySelector('[data-theme-toggle]') ||
                       document.querySelector('#theme-toggle');
    
    if (themeToggle) {
      themeToggle.click();
    } else {
      // Fallback theme toggle
      document.body.classList.toggle('light-theme');
      this.showShortcutFeedback('t', 'Theme toggled');
    }
  }

  toggleFeedback() {
    const feedbackToggle = document.getElementById('feedback-toggle');
    if (feedbackToggle) {
      feedbackToggle.click();
    } else {
      this.showShortcutFeedback('f', 'Feedback widget not found');
    }
  }

  toggleHelpModal() {
    console.log('🔧 toggleHelpModal called, current state:', this.helpModalOpen);
    const modal = document.getElementById('shortcuts-help-modal');
    console.log('📋 Modal element found:', !!modal);
    
    if (this.helpModalOpen) {
      modal.style.display = 'none';
      this.helpModalOpen = false;
      console.log('❌ Help modal closed');
    } else {
      modal.style.display = 'flex';
      this.helpModalOpen = true;
      console.log('✅ Help modal opened');
    }
  }

  closeModals() {
    // Close help modal
    if (this.helpModalOpen) {
      this.toggleHelpModal();
    }
    
    // Close feedback widget
    const feedbackWidget = document.getElementById('feedback-widget');
    if (feedbackWidget && feedbackWidget.classList.contains('open')) {
      feedbackWidget.classList.remove('open');
    }
    
    // Close any other modals with common classes
    const modals = document.querySelectorAll('.modal.open, .popup.open, .overlay.open');
    modals.forEach(modal => {
      modal.classList.remove('open');
    });
  }

  createHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'shortcuts-help-modal';
    modal.className = 'shortcuts-modal';
    
    modal.innerHTML = `
      <div class="shortcuts-modal-content">
        <div class="shortcuts-header">
          <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
          <button class="shortcuts-close" onclick="keyboardShortcuts.toggleHelpModal()">✕</button>
        </div>
        <div class="shortcuts-body">
          <p class="shortcuts-note">Hold down the key for 0.5 seconds to activate</p>
          <div class="shortcuts-grid">
            ${this.generateShortcutsHTML()}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.toggleHelpModal();
      }
    });
  }

  generateShortcutsHTML() {
    let html = '';
    this.shortcuts.forEach((shortcut, key) => {
      const displayKey = key === 'escape' ? 'Esc' : key.toUpperCase();
      html += `
        <div class="shortcut-item">
          <kbd class="shortcut-key">${displayKey}</kbd>
          <span class="shortcut-desc">${shortcut.description}</span>
        </div>
      `;
    });
    return html;
  }

  showShortcutFeedback(key, message) {
    // Create or update feedback toast
    let toast = document.getElementById('shortcut-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shortcut-toast';
      toast.className = 'shortcut-toast';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    // Auto hide after 2 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  isInputElement(element) {
    const inputTypes = ['input', 'textarea', 'select'];
    const editableTypes = ['text', 'email', 'password', 'search', 'url', 'tel'];
    
    if (inputTypes.includes(element.tagName.toLowerCase())) {
      // For input elements, check if they're text-based
      if (element.tagName.toLowerCase() === 'input') {
        return editableTypes.includes(element.type.toLowerCase());
      }
      return true;
    }
    
    // Check for contenteditable
    return element.contentEditable === 'true';
  }
}

// Initialize keyboard shortcuts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing keyboard shortcuts...');
  window.keyboardShortcuts = new KeyboardShortcuts();
  console.log('✅ Keyboard shortcuts initialized successfully');
  
  // Debug: Test if shortcuts are working
  setTimeout(() => {
    if (window.keyboardShortcuts && window.keyboardShortcuts.shortcuts.size > 0) {
      console.log(`📋 ${window.keyboardShortcuts.shortcuts.size} keyboard shortcuts registered`);
      console.log('💡 Press ? or / to see all shortcuts, or hold H/E/P/A/C/J/L/T/F for 0.5s');
    } else {
      console.error('❌ Keyboard shortcuts failed to initialize');
    }
  }, 1000);
});