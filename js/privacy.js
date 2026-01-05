document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initTypeWriter();
  initScrollReveal();
});

// 1. Dynamic Typing Effect for Title
function initTypeWriter() {
  const titleElement = document.getElementById('dynamic-title');
  const textToType = 'Privacy_Policy !!'; // Tech-themed typing text
  let index = 0;

  // Add cursor span
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  titleElement.parentNode.insertBefore(cursor, titleElement.nextSibling);

  function type() {
    if (index < textToType.length) {
      titleElement.innerHTML += textToType.charAt(index);
      index++;
      setTimeout(type, 100); // Typing speed
    } else {
      // Optional: Stop blinking cursor after typing is done
      // cursor.style.display = 'none';
    }
  }

  // Start typing after a slight delay
  setTimeout(type, 500);
}

// 2. GSAP Scroll Animations
function initScrollReveal() {
  // Animate Policy Text Sections (Slide Up)
  gsap.utils.toArray('.reveal-text').forEach((section, i) => {
    gsap.to(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  // Animate Sidebar Stamps (Slide In from Right)
  gsap.utils.toArray('.reveal-stamps').forEach((box, i) => {
    gsap.to(box, {
      scrollTrigger: {
        trigger: box,
        start: 'top 90%',
      },
      x: 0,
      opacity: 1,
      duration: 1,
      delay: i * 0.2,
      ease: 'back.out(1.7)',
    });
  });
}
