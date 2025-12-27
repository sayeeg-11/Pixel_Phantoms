document.addEventListener('DOMContentLoaded', () => {
  initPythonRoadmap();
});

function initPythonRoadmap() {
  const container = document.getElementById('roadmap-content');
  if (!container) return;

  const pythonCurriculum = [
    {
      title: 'PHASE_01: Language_Foundations',
      desc: 'Basic syntax & Built-in types.',
      modules: [
        { n: 'Variables', u: 'https://docs.python.org/3/tutorial/introduction.html' },
        { n: 'Strings', u: 'https://realpython.com/python-strings/' },
      ],
    },
    {
      title: 'PHASE_02: Logic_&_Control',
      desc: 'Branching and Iteration.',
      modules: [
        { n: 'Conditionals', u: 'https://docs.python.org/3/tutorial/controlflow.html' },
        { n: 'Loops', u: 'https://realpython.com/python-for-loop/' },
      ],
    },
    {
      title: 'PHASE_03: Data_Structures',
      desc: 'Advanced Collections Handling.',
      modules: [
        { n: 'Lists & Tuples', u: 'https://docs.python.org/3/tutorial/datastructures.html' },
        { n: 'Dictionaries', u: 'https://realpython.com/python-dicts/' },
      ],
    },
    {
      title: 'PHASE_04: Functional_Python',
      desc: 'Modular logic & Scopes.',
      modules: [
        { n: 'Functions', u: 'https://realpython.com/python-functions/' },
        { n: 'Lambdas', u: 'https://realpython.com/python-lambda/' },
      ],
    },
    {
      title: 'PHASE_05: OOP_Architecture',
      desc: 'Classes & Design Patterns.',
      modules: [
        { n: 'Inheritance', u: 'https://docs.python.org/3/tutorial/classes.html' },
        { n: 'Dunder Methods', u: 'https://realpython.com/python-magic-methods/' },
      ],
    },
    {
      title: 'PHASE_06: System_&_Files',
      desc: 'Persistence & Error handling.',
      modules: [
        { n: 'File I/O', u: 'https://www.w3schools.com/python/python_file_handling.asp' },
        { n: 'Exceptions', u: 'https://docs.python.org/3/tutorial/errors.html' },
      ],
    },
    {
      title: 'PHASE_07: Python_Ecosystem',
      desc: 'Essential External Libraries.',
      modules: [
        { n: 'NumPy', u: 'https://numpy.org/doc/' },
        { n: 'Pandas', u: 'https://pandas.pydata.org/' },
      ],
    },
  ];

  container.innerHTML = '';

  pythonCurriculum.forEach((phase, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const node = document.createElement('div');
    node.className = `chapter-node ${side}`;

    node.innerHTML = `
            <div class="node-header">
                <h3>${phase.title}</h3>
                <button class="toggle-btn" onclick="togglePythonModule(this)">+</button>
            </div>
            <div class="chapter-details">
                <p style="color:#666; font-size:0.9rem; margin-bottom:15px;">${phase.desc}</p>
                <div class="module-list">
                    ${phase.modules
                      .map(
                        m => `
                        <a href="${m.u}" target="_blank" class="module-link">
                            <i class="fab fa-python" style="margin-right:10px; color:var(--py-blue);"></i> ${m.n}
                        </a>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
    container.appendChild(node);
  });

  // RUN GSAP AFTER ALL NODES ARE ADDED
  gsap.from('.chapter-node', {
    scrollTrigger: { trigger: '.roadmap-wrapper', start: 'top 80%' },
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
  });
}

function togglePythonModule(btn) {
  const details = btn.parentElement.nextElementSibling;
  btn.classList.toggle('active');
  details.classList.toggle('open');
  btn.innerText = btn.classList.contains('active') ? '×' : '+';
}
