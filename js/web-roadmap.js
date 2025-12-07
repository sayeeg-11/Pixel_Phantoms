document.addEventListener('DOMContentLoaded', () => {
    loadRoadmap();
});

async function loadRoadmap() {
    const container = document.getElementById('roadmap-content');
    
    try {
        const response = await fetch('../data/roadmaps.json');
        if (!response.ok) throw new Error('Failed to fetch roadmap data');
        
        const data = await response.json();
        const phases = data.web.phases;

        container.innerHTML = ''; // Clear loading state

        let globalModuleIndex = 0; // To track left/right alternation across phases

        phases.forEach(phase => {
            // 1. Create Phase Section
            const phaseBlock = document.createElement('div');
            phaseBlock.className = 'phase-block';

            // 2. Create Header (e.g., PHASE 01)
            const header = document.createElement('div');
            header.className = 'phase-header';
            header.innerText = phase.title;
            phaseBlock.appendChild(header);

            // 3. Create Container for Modules
            const modulesContainer = document.createElement('div');
            modulesContainer.className = 'modules-container';

            // 4. Create Modules
            phase.modules.forEach(mod => {
                const link = document.createElement('a');
                link.className = `module-node ${globalModuleIndex % 2 === 0 ? 'left' : 'right'}`;
                link.href = mod.link;
                link.target = "_blank";
                
                // Inherit locked status from phase if needed, or default to unlocked for UI
                // For this demo, we use the phase status to color the nodes
                if (phase.status === 'locked') {
                    link.setAttribute('data-status', 'locked');
                } else {
                    link.setAttribute('data-status', 'unlocked');
                }

                link.innerHTML = `
                    <h4>${mod.title}</h4>
                    <p>${mod.desc}</p>
                `;

                modulesContainer.appendChild(link);
                globalModuleIndex++;
            });

            phaseBlock.appendChild(modulesContainer);
            container.appendChild(phaseBlock);
        });

        // Initialize GSAP Animations
        animateRoadmap();

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div style="text-align:center; color:red;">[ERROR] ROADMAP_DATA_CORRUPTED</div>`;
    }
}

function animateRoadmap() {
    gsap.registerPlugin(ScrollTrigger);

    // Animate Spine
    gsap.from('.roadmap-spine', {
        height: 0,
        duration: 2,
        ease: 'power1.inOut'
    });

    // Animate Phase Headers
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

    // Animate Module Nodes
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