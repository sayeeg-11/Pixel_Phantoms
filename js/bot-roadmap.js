document.addEventListener('DOMContentLoaded', () => {
    loadRoadmap();
    initBotStatus();
});

async function loadRoadmap() {
    const container = document.getElementById('roadmap-content');
    
    try {
        const response = await fetch('../data/roadmaps.json');
        if (!response.ok) throw new Error('Failed to fetch roadmap data');
        
        const data = await response.json();
        const phases = data.bot.phases; // Accessing the 'bot' key

        container.innerHTML = ''; 

        let globalModuleIndex = 0; 

        phases.forEach(phase => {
            const phaseBlock = document.createElement('div');
            phaseBlock.className = 'phase-block';

            const header = document.createElement('div');
            header.className = 'phase-header';
            header.innerText = phase.title;
            phaseBlock.appendChild(header);

            const modulesContainer = document.createElement('div');
            modulesContainer.className = 'modules-container';

            phase.modules.forEach(mod => {
                const link = document.createElement('a');
                link.className = `module-node ${globalModuleIndex % 2 === 0 ? 'left' : 'right'}`;
                link.href = mod.link;
                link.target = "_blank";
                
                if (phase.status === 'locked') {
                    link.setAttribute('data-status', 'locked');
                } else {
                    link.setAttribute('data-status', 'unlocked');
                }

                const iconClass = mod.icon || 'fa-solid fa-robot';

                link.innerHTML = `
                    <div class="node-icon-wrapper">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="node-text-wrapper">
                        <h4>${mod.title}</h4>
                        <p>${mod.desc}</p>
                    </div>
                `;

                modulesContainer.appendChild(link);
                globalModuleIndex++;
            });

            phaseBlock.appendChild(modulesContainer);
            container.appendChild(phaseBlock);
        });

        animateRoadmap();

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div style="text-align:center; color:red;">[ERROR] BOT_NETWORK_UNREACHABLE</div>`;
    }
}

function animateRoadmap() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.roadmap-spine', {
        height: 0,
        duration: 2,
        ease: 'power1.inOut'
    });

    gsap.utils.toArray('.phase-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 80%"
            },
            y: 50,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    });

    gsap.utils.toArray('.module-node').forEach(node => {
        gsap.from(node, {
            scrollTrigger: {
                trigger: node,
                start: "top 85%"
            },
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}

// Simulates the Live Bot Status check in the header
function initBotStatus() {
    const statusEl = document.getElementById('bot-status');
    const pingEl = document.getElementById('bot-ping');
    
    // Simulate initial delay
    setTimeout(() => {
        // 90% chance online
        const isOnline = Math.random() > 0.1;
        const latency = Math.floor(Math.random() * (120 - 20) + 20);
        
        if (isOnline) {
            statusEl.innerText = "ONLINE";
            statusEl.className = "status-value online";
            pingEl.innerText = `${latency} ms`;
        } else {
            statusEl.innerText = "OFFLINE";
            statusEl.className = "status-value offline";
            pingEl.innerText = "TIMEOUT";
        }
    }, 1200);
}