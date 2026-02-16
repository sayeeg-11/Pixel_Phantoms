const dot = document.getElementById('cursor-dot');
const outline = document.getElementById('cursor-outline');
const magnets = document.querySelectorAll('a, button, .magnetic, .nav-link');

let mouseX = 0,
  mouseY = 0;
let outlineX = 0,
  outlineY = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Direct position update - NO DELAY
  dot.style.left = `${mouseX}px`;
  dot.style.top = `${mouseY}px`;
});

function animate() {
  // Outline will still have a smooth "lag" for premium feel
  outlineX += (mouseX - outlineX) * 0.15;
  outlineY += (mouseY - outlineY) * 0.15;

  outline.style.left = `${outlineX}px`;
  outline.style.top = `${outlineY}px`;

  requestAnimationFrame(animate);
}
animate();

magnets.forEach(m => {
  m.addEventListener('mousemove', e => {
    const rect = m.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    m.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    dot.classList.add('hover-active');
    outline.classList.add('hover-active');
  });

  m.addEventListener('mouseleave', () => {
    m.style.transform = `translate(0px, 0px)`;
    dot.classList.remove('hover-active');
    outline.classList.remove('hover-active');
  });
});
