// Scroll Progress Bar Logic
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const documentHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (documentHeight <= 0) return;

  const scrollPercent = (scrollTop / documentHeight) * 100;

  const progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    progressBar.style.width = scrollPercent + '%';
  }
});
