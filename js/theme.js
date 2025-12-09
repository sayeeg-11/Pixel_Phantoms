// Theme management with localStorage persistence
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('theme-switch');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply the saved theme
    htmlElement.setAttribute('data-theme', savedTheme);
    
    // Set the toggle state based on saved theme
    if (savedTheme === 'light') {
        themeSwitch.checked = true;
    }
    
    // Theme toggle functionality
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
    

});