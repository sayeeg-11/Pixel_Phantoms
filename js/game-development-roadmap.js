document.addEventListener('DOMContentLoaded', () => {
  loadRoadmap();
});

async function loadRoadmap() {
  // 1. Target the correct container ID from the HTML
  const container = document.getElementById('roadmap-content');

  if (!container) {
    console.error("Error: Element with id 'roadmap-content' not found.");
    return;
  }

  try {
    // 2. Fetch the data
    const response = await fetch('../data/roadmaps.json');
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();

    // 3. Access the specific 'game-dev-roadmap' key from your JSON
    const roadmapData = data['game-dev-roadmap'];

    if (!roadmapData) {
      container.innerHTML =
        '<p style="text-align:center; color:red;">[ERROR]: Game Dev Roadmap data key not found in JSON.</p>';
      return;
    }

    container.innerHTML = ''; // Clear loading state
    let globalModuleIndex = 0; // For left/right alternation

    // 4. Loop through phases
    roadmapData.phases.forEach(phase => {
      // Create Phase Block
      const phaseBlock = document.createElement('div');
      phaseBlock.className = 'phase-block';

      // Create Header
      const header = document.createElement('div');
      header.className = 'phase-header';
      header.innerText = phase.title;
      phaseBlock.appendChild(header);

      // Create Description (Specific to your Game Dev JSON structure)
      if (phase.description) {
        const desc = document.createElement('p');
        desc.className = 'phase-description';
        desc.innerText = phase.description;
        phaseBlock.appendChild(desc);
      }

      // Create Modules Container
      const modulesContainer = document.createElement('div');
      modulesContainer.className = 'modules-container';

      // 5. Loop through resources (modules)
      if (phase.resources && Array.isArray(phase.resources)) {
        phase.resources.forEach(res => {
          const link = document.createElement('a');
          // Alternate left/right classes
          link.className = `module-node ${globalModuleIndex % 2 === 0 ? 'left' : 'right'}`;
          link.href = res.url || '#';
          link.target = '_blank';
          link.setAttribute('data-status', 'unlocked'); // Default to unlocked

          link.innerHTML = `
                        <h4>${res.name}</h4>
                        <p>Click to access resource</p>
                    `;

          modulesContainer.appendChild(link);
          globalModuleIndex++;
        });
      }

      phaseBlock.appendChild(modulesContainer);
      container.appendChild(phaseBlock);
    });
  } catch (error) {
    console.error('Roadmap Load Error:', error);
    container.innerHTML = `<p style="text-align:center; color:red;">[SYSTEM FAILURE]: ${error.message}</p>`;
  }
}
