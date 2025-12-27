document.addEventListener('DOMContentLoaded', () => {
  initReactRoadmap();
});

function initReactRoadmap() {
  const container = document.getElementById('roadmap-content');
  if (!container) return;

  const reactCurriculum = [
    {
      title: 'PHASE_01: React_Fundamentals',
      desc: 'Core concepts, Components, and Props.',
      modules: [
        { n: 'Writing JSX', u: 'https://react.dev/learn/writing-markup-with-jsx' },
        { n: 'Passing Props', u: 'https://react.dev/learn/passing-props-to-a-component' },
      ],
    },
    {
      title: 'PHASE_02: Hooks_&_State',
      desc: 'Managing reactivity with useState and useEffect.',
      modules: [
        { n: 'useState Guide', u: 'https://react.dev/reference/react/useState' },
        { n: 'Lifecycle Effects', u: 'https://react.dev/reference/react/useEffect' },
      ],
    },
    {
      title: 'PHASE_03: Interactivity_&_Forms',
      desc: 'Events handling and data input management.',
      modules: [
        { n: 'Handling Events', u: 'https://react.dev/learn/responding-to-events' },
        { n: 'Controlled Inputs', u: 'https://react.dev/learn/sharing-state-between-components' },
      ],
    },
    {
      title: 'PHASE_04: Performance_&_Optimization',
      desc: 'Memoization and advanced hook patterns.',
      modules: [
        { n: 'useMemo & useCallback', u: 'https://react.dev/reference/react/useMemo' },
        { n: 'useRef & Context', u: 'https://react.dev/reference/react/useContext' },
      ],
    },
    {
      title: 'PHASE_05: Navigation_Protocol',
      desc: 'Client-side routing and SPA architecture.',
      modules: [
        { n: 'React Router Docs', u: 'https://reactrouter.com/' },
        {
          n: 'Protected Routes',
          u: 'https://www.freecodecamp.org/news/how-to-create-protected-routes-in-react/',
        },
      ],
    },
    {
      title: 'PHASE_06: Global_State_Systems',
      desc: 'Managing large-scale data flow.',
      modules: [
        { n: 'Zustand (Modern)', u: 'https://docs.pmnd.rs/zustand/' },
        { n: 'Redux Toolkit (Legacy/Corp)', u: 'https://redux-toolkit.js.org/' },
      ],
    },
    {
      title: 'PHASE_07: Fullstack_Ecosystem',
      desc: 'SSR, SSG, and Data Fetching libraries.',
      modules: [
        { n: 'Next.js Framework', u: 'https://nextjs.org/docs' },
        { n: 'React Query', u: 'https://tanstack.com/query/' },
      ],
    },
  ];

  container.innerHTML = '';

  reactCurriculum.forEach((phase, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const node = document.createElement('div');
    node.className = `chapter-node ${side}`;

    node.innerHTML = `
            <div class="node-header">
                <h3>${phase.title}</h3>
                <button class="toggle-btn" onclick="toggleReactModule(this)">+</button>
            </div>
            <div class="chapter-details">
                <p style="color:#666; font-size:0.9rem; margin-bottom:15px;">${phase.desc}</p>
                <div class="module-list">
                    ${phase.modules
                      .map(
                        m => `
                        <a href="${m.u}" target="_blank" class="module-link">
                            <i class="fab fa-react" style="margin-right:10px; color:var(--react-cyan);"></i> ${m.n}
                        </a>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
    container.appendChild(node);
  });

  // Initialize Animations
  gsap.from('.chapter-node', {
    scrollTrigger: { trigger: '.roadmap-wrapper', start: 'top 80%' },
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
  });
}

function toggleReactModule(btn) {
  const details = btn.parentElement.nextElementSibling;
  btn.classList.toggle('active');
  details.classList.toggle('open');
  btn.innerText = btn.classList.contains('active') ? '×' : '+';
}
