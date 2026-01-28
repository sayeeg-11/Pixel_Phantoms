document.addEventListener('DOMContentLoaded', () => {
    initAIRoadmap();
  });
  
  function initAIRoadmap() {
    const container = document.getElementById('roadmap-content');
    if (!container) return;
  
    // Internal data structure to match Python's approach
    const aiCurriculum = [
      {
        title: "PHASE_01: Neural_Foundations",
        desc: "The language of AI. Python syntax, Linear Algebra, and Statistics.",
        modules: [
          { n: "Python Syntax", u: "https://docs.python.org/3/tutorial/" },
          { n: "Math for ML", u: "https://www.khanacademy.org/math/linear-algebra" },
          { n: "Statistics & Probability", u: "https://www.khanacademy.org/math/statistics-probability" }
        ]
      },
      {
        title: "PHASE_02: Data_Engineering",
        desc: "High-performance computing and data manipulation with NumPy and Pandas.",
        modules: [
          { n: "NumPy Matrices", u: "https://numpy.org/doc/stable/user/absolute_beginners.html" },
          { n: "Pandas Manipulation", u: "https://pandas.pydata.org/docs/user_guide/10min.html" },
          { n: "Data Visualization", u: "https://matplotlib.org/stable/tutorials/introductory/quick_start.html" }
        ]
      },
      {
        title: "PHASE_03: Model_Training",
        desc: "Implementing Regression, Classification, and basic Neural Networks.",
        modules: [
          { n: "Scikit-Learn Basics", u: "https://scikit-learn.org/stable/getting_started.html" },
          { n: "Model Evaluation", u: "https://scikit-learn.org/stable/modules/model_evaluation.html" },
          { n: "Deep Learning Intro", u: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html" }
        ]
      },
      {
        title: "PHASE_04: Project_Challenges",
        desc: "Real-world application: Predict prices, classify images, and analyze sentiment.",
        modules: [
          { n: "Housing Price Predictor", u: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques" },
          { n: "Image Classifier", u: "https://www.kaggle.com/c/cifar-10" },
          { n: "Sentiment Analysis", u: "https://www.kaggle.com/c/sentiment-analysis-on-movie-reviews" }
        ]
      }
    ];
  
    container.innerHTML = '';
  
    aiCurriculum.forEach((phase, index) => {
      const side = index % 2 === 0 ? 'left' : 'right';
      const node = document.createElement('div');
      node.className = `chapter-node ${side}`;
  
      node.innerHTML = `
              <div class="node-header">
                  <h3>${phase.title}</h3>
                  <button class="toggle-btn" onclick="toggleAIModule(this)">+</button>
              </div>
              <div class="chapter-details">
                  <p style="color:#666; font-size:0.9rem; margin-bottom:15px;">${phase.desc}</p>
                  <div class="module-list">
                      ${phase.modules.map(m => `
                          <a href="${m.u}" target="_blank" class="module-link">
                              <i class="fas fa-brain" style="margin-right:10px; color:var(--ai-purple);"></i> ${m.n}
                          </a>
                      `).join('')}
                  </div>
              </div>
          `;
      container.appendChild(node);
    });
  
    // Aligning GSAP with the Python version's ScrollTrigger
    gsap.from('.chapter-node', {
      scrollTrigger: { 
          trigger: '.roadmap-wrapper', 
          start: 'top 80%' 
      },
      opacity: 0,
      y: 50,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
    });
  }
  
  function toggleAIModule(btn) {
    const details = btn.parentElement.nextElementSibling;
    btn.classList.toggle('active');
    details.classList.toggle('open');
    btn.innerText = btn.classList.contains('active') ? '×' : '+';
  }