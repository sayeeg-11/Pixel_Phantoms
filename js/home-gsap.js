document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. HERO & TEXT SCRAMBLE ---
  const consoleLines = document.querySelectorAll('.console-text');
  const tl = gsap.timeline();

  tl.from('.hero-glitch', { duration: 1, opacity: 0, y: 20, ease: 'power2.out' });

  consoleLines.forEach(line => {
    const originalText = line.innerText;
    line.innerText = '';
    tl.to(
      line,
      {
        opacity: 1,
        duration: 0.5,
        onStart: () => {
          let i = 0;
          const typeInterval = setInterval(() => {
            line.innerText = originalText.substring(0, i + 1);
            i++;
            if (i >= originalText.length) clearInterval(typeInterval);
          }, 20);
        },
      },
      '-=0.1'
    );
  });
  tl.to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.5 });

  // --- 2. CUSTOM CURSOR ---
  const cursor = document.getElementById('cursor-highlight');
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
    });
  }

  // --- 3. HACKATHON TILT ---
  const tiltCard = document.querySelector('.hack-main-card');
  if (tiltCard) {
    tiltCard.addEventListener('mousemove', e => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = x / rect.width;
      const yPct = y / rect.height;
      gsap.to(tiltCard, {
        rotationY: (xPct - 0.5) * 10,
        rotationX: (0.5 - yPct) * 10,
        transformPerspective: 1000,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
    tiltCard.addEventListener('mouseleave', () => {
      gsap.to(tiltCard, { rotationY: 0, rotationX: 0, duration: 0.5, ease: 'power2.out' });
    });
  }

  // --- 4. SEMINAR CARDS REVEAL ---
  gsap.fromTo(
    '.reveal-card',
    { y: 50, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.cyber-seminars',
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.8,
      ease: 'back.out(1.7)',
    }
  );

  // --- 5. SKILL TREE NODES REVEAL (FIXED) ---
  // Used fromTo to force visibility state
  gsap.fromTo(
    '.reveal-node',
    { scale: 0.5, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.skill-tree-section',
        start: 'top 90%', // Trigger earlier
      },
      scale: 1,
      opacity: 1,
      stagger: 0.15,
      duration: 0.6,
      ease: 'back.out(1.7)',
    }
  );

  // --- 6. LEADERBOARD SLIDE-IN ---
  gsap.fromTo(
    '.lb-row',
    { x: -50, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.leaderboard-preview',
        start: 'top 90%',
      },
      x: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
    }
  );

  // --- 7. TERMINAL LOGS ---
  gsap.fromTo(
    '.log-entry',
    { x: -20, opacity: 0 },
    {
      scrollTrigger: { trigger: '.terminal-window', start: 'top 90%' },
      x: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 0.5,
    }
  );
});
