document.addEventListener('DOMContentLoaded', () => {
  initSystemDesignRoadmap();
});

function initSystemDesignRoadmap() {
  const container = document.getElementById('roadmap-content');
  if (!container) return;

  const sysCurriculum = [
    {
      title: 'PHASE_01: Network_Foundations',
      desc: 'DNS, Load Balancing, and API Gateways.',
      modules: [
        { n: 'How DNS Works', u: 'https://aws.amazon.com/route53/what-is-dns/' },
        {
          n: 'Load Balancing Types',
          u: 'https://www.nginx.com/resources/glossary/load-balancing/',
        },
      ],
    },
    {
      title: 'PHASE_02: Database_Architecture',
      desc: 'Relational vs NoSQL and Replication.',
      modules: [
        { n: 'SQL vs NoSQL', u: 'https://www.mongodb.com/nosql-explained/nosql-vs-sql' },
        {
          n: 'DB Sharding',
          u: 'https://www.digitalocean.com/community/tutorials/understanding-database-sharding',
        },
      ],
    },
    {
      title: 'PHASE_03: Caching_Strategies',
      desc: 'CDN, Redis, and Cache Eviction.',
      modules: [
        { n: 'Caching In-Depth', u: 'https://aws.amazon.com/caching/' },
        { n: 'Redis Use Cases', u: 'https://redis.io/solutions/' },
      ],
    },
    {
      title: 'PHASE_04: Communication_Protocols',
      desc: 'REST, GraphQL, gRPC, and WebSockets.',
      modules: [
        { n: 'REST vs GraphQL', u: 'https://blog.postman.com/rest-vs-graphql/' },
        { n: 'Message Queues (Kafka)', u: 'https://kafka.apache.org/intro' },
      ],
    },
    {
      title: 'PHASE_05: Scalability_Patterns',
      desc: 'Vertical vs Horizontal Scaling and Availability.',
      modules: [
        {
          n: 'High Availability',
          u: 'https://www.digitalocean.com/community/tutorials/what-is-high-availability',
        },
        { n: 'CAP Theorem', u: 'https://www.ibm.com/topics/cap-theorem' },
      ],
    },
    {
      title: 'PHASE_06: Microservices_&_Containers',
      desc: 'Docker, Kubernetes, and Service Mesh.',
      modules: [
        { n: 'Microservices Pattern', u: 'https://microservices.io/' },
        { n: 'Docker Fundamentals', u: 'https://docs.docker.com/get-started/' },
      ],
    },
    {
      title: 'PHASE_07: Reliability_&_Monitoring',
      desc: 'Logging, Tracing, and Rate Limiting.',
      modules: [
        {
          n: 'Rate Limiting Algorithms',
          u: 'https://konghq.com/blog/how-to-design-a-scalable-rate-limiting-algorithm/',
        },
        { n: 'Distributed Tracing', u: 'https://opentelemetry.io/docs/concepts/signals/traces/' },
      ],
    },
  ];

  container.innerHTML = '';

  sysCurriculum.forEach((phase, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const node = document.createElement('div');
    node.className = `chapter-node ${side}`;

    node.innerHTML = `
            <div class="node-header">
                <h3>${phase.title}</h3>
                <button class="toggle-btn" onclick="toggleSysModule(this)">+</button>
            </div>
            <div class="chapter-details">
                <p style="color:#666; font-size:0.9rem; margin-bottom:15px;">${phase.desc}</p>
                <div class="module-list">
                    ${phase.modules
                      .map(
                        m => `
                        <a href="${m.u}" target="_blank" class="module-link">
                            <i class="fas fa-network-wired" style="margin-right:10px; color:var(--sys-purple);"></i> ${m.n}
                        </a>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
    container.appendChild(node);
  });

  gsap.from('.chapter-node', {
    scrollTrigger: { trigger: '.roadmap-wrapper', start: 'top 80%' },
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
  });
}

function toggleSysModule(btn) {
  const details = btn.parentElement.nextElementSibling;
  btn.classList.toggle('active');
  details.classList.toggle('open');
  btn.innerText = btn.classList.contains('active') ? '×' : '+';
}
