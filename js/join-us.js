document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // --- 1. HERO TEXT TYPING EFFECT ---
  const heroText =
    'Initiating handshake protocol...\n> Identifying user location...\n> Access granted: GUEST LEVEL 1\n> Welcome to Pixel Phantoms.';

  gsap.to('#hero-terminal-text', {
    text: {
      value: heroText,
      delimiter: '',
    },
    duration: 4,
    ease: 'none',
    onComplete: () => {
      document.querySelector('.typing-cursor').style.animation = 'blink 1s infinite';
    },
  });

  // --- 2. STATUS BAR REVEAL ---
  gsap.to('.mission-status-bar', {
    opacity: 1,
    y: -10,
    duration: 1,
    delay: 3.5,
    ease: 'power2.out',
  });

  // --- 3. STEP CARDS STAGGER ANIMATION ---
  gsap.utils.toArray('.step-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: i * 0.2,
      ease: 'back.out(1.7)',
    });
  });

  // --- 4. DYNAMIC LIVE TERMINAL ---
  const terminalBody = document.getElementById('live-terminal-body');
  const processNames = ['AUTH', 'KERNEL', 'NET', 'SECURE', 'MEMBER'];
  const messages = [
    'New node connection established from 192.168.x.x',
    'Verifying encrypted signature...',
    'Handshake successful. Token generated.',
    'Updating local repository cache...',
    "User 'Phantom_01' joined the server.",
    'Deploying assets to production.',
    'Security scan complete: 0 threats found.',
    'Optimizing neural network weights...',
    'Packet received: 2048 bytes.',
    'System optimal. Ready for input.',
  ];

  function addLog() {
    if (!terminalBody) return;

    const now = new Date();
    const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    const proc = processNames[Math.floor(Math.random() * processNames.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const row = document.createElement('div');
    row.className = 'log-line';

    const isSuccess =
      msg.includes('successful') || msg.includes('optimal') || msg.includes('complete');
    const msgClass = isSuccess ? 'log-msg success' : 'log-msg';

    row.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-proc">${proc}:</span>
            <span class="${msgClass}">${msg}</span>
        `;

    terminalBody.appendChild(row);

    // Animate entry
    gsap.to(row, { opacity: 1, duration: 0.3 });

    // Auto Scroll
    terminalBody.scrollTop = terminalBody.scrollHeight;

    // Limit history
    if (terminalBody.children.length > 15) {
      terminalBody.removeChild(terminalBody.firstChild);
    }

    // Randomize next log time
    setTimeout(addLog, Math.random() * 2000 + 500);
  }

  // Start the log loop
  addLog();

  // --- 5. CUSTOM CURSOR (Desktop Only) ---
  const cursor = document.getElementById('cursor-highlight');
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
    });
  }
});
