document.addEventListener('DOMContentLoaded', () => {
  loadRoadmap();
});

// =======================================================
// FEATURE 1: Local Storage Completion Tracking Utilities
// =======================================================

// Retrieves the set of completed module IDs from localStorage
function getCompletedModules(roadmapKey) {
  try {
    const completed = localStorage.getItem(`completedModules_${roadmapKey}`);
    return completed ? new Set(JSON.parse(completed)) : new Set();
  } catch (e) {
    console.error('Could not load completion data from localStorage:', e);
    return new Set();
  }
}

// Saves the set of completed module IDs to localStorage
function saveCompletedModules(completedSet, roadmapKey) {
  try {
    localStorage.setItem(
      `completedModules_${roadmapKey}`,
      JSON.stringify(Array.from(completedSet))
    );
  } catch (e) {
    console.error('Could not save completion data to localStorage:', e);
  }
}

// =======================================================
// MAIN ROADMAP LOADING FUNCTION
// =======================================================

async function loadRoadmap() {
  const container = document.getElementById('roadmap-content');

  const ROADMAP_KEY = 'ai'; // Define the roadmap key once
  const completedModules = getCompletedModules(ROADMAP_KEY); // Load progress

  try {
    const response = await fetch('../data/roadmaps.json');
    if (!response.ok) throw new Error('Failed to fetch roadmap data');

    const data = await response.json();
    // Use the defined roadmap key
    const roadmapData = data[ROADMAP_KEY];
    if (!roadmapData) throw new Error(`Roadmap data for key '${ROADMAP_KEY}' not found.`);

    const phases = roadmapData.phases;

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

      // 4. Create Modules (MODIFIED FOR FEATURE 1)
      phase.modules.forEach(mod => {
        const link = document.createElement('a');

        // Feature 1: Unique ID for Local Storage
        const moduleId = `${ROADMAP_KEY}-${phase.title.replace(/\s/g, '-')}-${mod.title.replace(/\s/g, '-')}`;

        link.className = `module-node ${globalModuleIndex % 2 === 0 ? 'left' : 'right'}`;
        link.href = mod.link;
        link.target = '_blank';

        // Inherit locked status from phase
        if (phase.status === 'locked') {
          link.setAttribute('data-status', 'locked');
        } else {
          link.setAttribute('data-status', 'unlocked');
        }

        // Feature 1: Set initial completion class
        if (completedModules.has(moduleId)) {
          link.classList.add('completed');
        }

        link.innerHTML = `
                    <h4>${mod.title}</h4>
                    <p>${mod.desc}</p>
                `;

        // Feature 1: Add click listener to toggle completion
        link.addEventListener('click', e => {
          if (e.ctrlKey || e.metaKey || e.button === 1) {
            return;
          }

          e.preventDefault();
          const isCompleted = link.classList.toggle('completed');
          const currentCompleted = getCompletedModules(ROADMAP_KEY);

          if (isCompleted) {
            currentCompleted.add(moduleId);
          } else {
            currentCompleted.delete(moduleId);
          }
          saveCompletedModules(currentCompleted, ROADMAP_KEY);

          // Navigate after showing visual feedback
          setTimeout(() => {
            window.open(mod.link, '_blank');
          }, 50);
        });

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
    container.innerHTML = `<div style="text-align:center; color:red;">[ERROR] DATA_STREAM_INTERRUPTED: ${error.message}</div>`;
  }
}

// =======================================================
// GSAP ANIMATION FUNCTION (Unchanged)
// =======================================================
function animateRoadmap() {
  if (typeof gsap === 'undefined') return; // Safety check

  gsap.registerPlugin(ScrollTrigger);

  // Animate Spine
  gsap.from('.roadmap-spine', {
    height: 0,
    duration: 2,
    ease: 'power1.inOut',
  });

  // Animate Phase Headers
  gsap.utils.toArray('.phase-header').forEach(header => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
    });
  });

  // Animate Module Nodes
  gsap.utils.toArray('.module-node').forEach(node => {
    gsap.from(node, {
      scrollTrigger: {
        trigger: node,
        start: 'top 85%',
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
}
