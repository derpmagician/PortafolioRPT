import { animate, utils, stagger, createDraggable, createSpring, onScroll, waapi, createScope } from './anime/anime.esm.js';
import { myWorks } from './myWork.js';
import { setupParticles } from './particleSystem.js';
import { setupImageTilt } from './imageTiltEffect.js';

const [ $homeBtn ] = utils.$('.homeBtn');
const [ $experienceBtn ] = utils.$('.experienceBtn');
const [ $aboutBtn ] = utils.$('.aboutBtn');
const [ $contactBtn ] = utils.$('.contactBtn');
const [ $topBtn ] = utils.$('.topBtn');
const [ $bottomBtn ] = utils.$('.bottomBtn');
const [ $button ] = utils.$('.button');
let rotations = 0;

animate('.cube', {
  scale: [
    { to: 1.25, ease: 'inOut(3)', duration: 200 },
    { to: 1, ease: createSpring({ stiffness: 300 }) }
  ],
  loop: true,
  loopDelay: 5000,
});

// Make the logo draggable around its center
const cube = document.querySelector('.cube');
let initialRotationX = 0;
let initialRotationY = 0;

createDraggable('.cube', {
  container: [0, 0, 0, 0],
  releaseEase: createSpring({ stiffness: 200 }),
  onGrab: (e) => {
    // Store initial rotation when starting to drag
    const transform = getComputedStyle(cube).transform;
    // Extract rotation values if needed
    initialRotationX = 0; 
    initialRotationY = 0;
  },
  onDrag: (e) => {
    // Calculate rotation based on drag movement
    if (e.deltaX !== undefined && e.deltaY !== undefined) {
      const rotationY = initialRotationY + (e.deltaX * 0.5);
      const rotationX = initialRotationX + (e.deltaY * 0.5);
      
      // Apply rotation directly
      utils.set(cube, {
        transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`
      });
    }
  }
});

// Particle background is now imported from particleSystem.js

// Initial load animations
document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle background
  setupParticles();
  
  // Render projects from myWorks array
  renderProjects();
  
  // Inicializar el efecto de inclinación en la imagen
  setupImageTilt('.home-image-container');
  
  // Fade in header
  animate('.header', {
    opacity: [0, 1],
    translateY: ['-20px', '0px'],
    duration: 800,
    easing: 'easeOutCubic'
  });
  
  // Button controls fade in
  animate('.controls', {
    opacity: [0, 1],
    translateY: ['20px', '0px'],
    duration: 800,
    delay: 300,
    easing: 'easeOutCubic'
  });
  
  // Add subtle floating animation to the cube
  addCubeFloatingEffect();
  
  // Setup animated skill bars
  setTimeout(() => {
    setupSkillBars();
  }, 500);
  
  // Setup form input animations
  setupFormAnimations();
  
  // Inicialización de los controles de partículas
  initializeParticleControls();
});


// Function to render projects from myWorks array
const renderProjects = () => {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid) return;
  
  // Clear loading message
  projectsGrid.innerHTML = '';
  
  // Create project cards
  myWorks.forEach(project => {
    // Skip commented out projects
    if (project.id === 5) return;
    
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    const image = document.createElement('img');
    image.src = project.img;
    image.alt = project.title;
    image.className = 'project-image';
    
    const content = document.createElement('div');
    content.className = 'project-content';
    
    const title = document.createElement('h4');
    title.className = 'project-title';
    title.textContent = project.title;
    
    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description;
    
    const links = document.createElement('div');
    links.className = 'project-links';
    
    const githubLink = document.createElement('a');
    githubLink.href = project.github;
    githubLink.target = '_blank';
    githubLink.textContent = 'GitHub';
    githubLink.className = 'project-link github';
    
    links.appendChild(githubLink);
    
    if (project.demo) {
      const demoLink = document.createElement('a');
      demoLink.href = project.demo;
      demoLink.target = '_blank';
      demoLink.textContent = 'Demo';
      demoLink.className = 'project-link demo';
      links.appendChild(demoLink);
    }
    
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(links);
    
    projectCard.appendChild(image);
    projectCard.appendChild(content);
    
    projectsGrid.appendChild(projectCard);
  });
  
  // Animate project cards with staggered effect
  animate('.project-card', {
    opacity: [0, 1],
    translateY: ['20px', '0px'],
    duration: 600,
    easing: 'easeOutCubic',
    delay: stagger(100)
  });
};

// Add subtle floating animation to the cube
const addCubeFloatingEffect = () => {
  animate('.cube', {
    translateY: [0, -10, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true,
    id: 'floating'
  });
};

// Setup animated skill bars
const setupSkillBars = () => {
  const skillItems = document.querySelectorAll('.skill-item');
  
  skillItems.forEach((item, index) => {
    const level = item.querySelector('.skill-level').textContent;
    const percentage = parseInt(level);
    const bar = item.querySelector('::before');
    
    animate(item, {
      '--width': ['0%', `${percentage}%`],
      duration: 1000,
      delay: index * 100,
      easing: 'easeOutQuart'
    });
  });
};

// Setup form input animations
const setupFormAnimations = () => {
  const formInputs = document.querySelectorAll('.form-input, .form-textarea');
  
  formInputs.forEach(input => {
    const inputScope = createScope();
    
    // Focus effect
    input.addEventListener('focus', () => {
      inputScope.animate(input, {
        borderColor: 'var(--font-color)',
        boxShadow: '0 0 8px rgba(207, 228, 20, 0.5)',
        duration: 400,
        easing: 'easeOutCubic'
      });
    });
    
    // Blur effect
    input.addEventListener('blur', () => {
      inputScope.animate(input, {
        borderColor: 'var(--color-lime)',
        boxShadow: '0 0 0px rgba(207, 228, 20, 0)',
        duration: 400,
        easing: 'easeOutCubic'
      });
    });
  });
  
  // Submit button click effect
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      animate(submitBtn, {
        scale: [1, 0.95, 1.05, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
      
      // Show "Message sent" confirmation (simulated)
      setTimeout(() => {
        const formInputs = document.querySelectorAll('.form-input, .form-textarea');
        formInputs.forEach(input => input.value = '');
        
        // Create temporary confirmation message
        const form = document.querySelector('.contact-form');
        const confirmation = document.createElement('div');
        confirmation.textContent = '¡Mensaje enviado!';
        confirmation.style.color = 'var(--color-lime)';
        confirmation.style.textAlign = 'center';
        confirmation.style.marginTop = '10px';
        confirmation.style.fontWeight = 'bold';
        
        form.appendChild(confirmation);
        
        // Animate confirmation message
        animate(confirmation, {
          opacity: [0, 1],
          translateY: ['-10px', '0px'],
          duration: 400,
          easing: 'easeOutCubic'
        });
        
        // Remove confirmation message after 3 seconds
        setTimeout(() => {
          animate(confirmation, {
            opacity: [1, 0],
            translateY: ['0px', '10px'],
            duration: 400,
            easing: 'easeOutCubic',
            complete: () => {
              confirmation.remove();
            }
          });
        }, 3000);
      }, 500);
    });
  }
};

// Set custom properties for sides
utils.set('.side', {
  '--color-lime': '#d6e414',
  '--color-turquoise': '#003b46',
  '--color-turquoise-dark': '#003b46',
  '--color-turquoise-light': '#07575b',
  '--color-white': '#e7e7d6',
  '--bg-color': 'var(--color-turquoise)',
  '--bg-color-light': 'var(--color-turquoise-light)',
  '--border-color': 'var(--color-lime)',
  '--side-color': 'var(--color-turquoise)',
  '--cube-size': '350px',
  '--gap': '80px',
  '--side-offset': 'calc((var(--cube-size) + var(--gap)) / 2)',
  '--button-color-light': 'var(--color-turquoise-light)',
  '--button-color-dark': 'var(--color-turquoise-dark)',
  '--font-color-light': 'var(--color-white)',
  '--font-color-dark': 'var(--color-black)',
  background: 'var(--side-color)',
});

// Enhanced button animations with smoother transitions
const homeBtn = () => {
  // Disable the button
  $homeBtn.disabled = true;
  
  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateY: '0',
    rotateX: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $homeBtn.disabled = false;
  }, 850);
};

const experienceBtn = () => {
  // Disable the button
  $experienceBtn.disabled = true;
  
  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateY: '+90',
    rotateX: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $experienceBtn.disabled = false;
  }, 850);
};

const aboutBtn = () => {
  // Disable the button
  $aboutBtn.disabled = true;

  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateY: '-90',
    rotateX: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $aboutBtn.disabled = false;
  }, 850);
};

const contactBtn = () => {
  // Disable the button
  $contactBtn.disabled = true;

  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateY: '180',
    rotateX: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });

  setTimeout(() => {
    $contactBtn.disabled = false;
  }, 850);
};

const topBtn = () => {
  // Disable the button
  $topBtn.disabled = true;

  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateX: '-90',
    rotateY: '0',
    scale: '1.25',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $topBtn.disabled = false;
  }, 850);
};

const bottomBtn = () => {
  // Disable the button
  $bottomBtn.disabled = true;

  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateX: '90',
    rotateY: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $bottomBtn.disabled = false;
  }, 850);
};

// Content animation functions
const animateVisibleContent = (sideClass) => {
  const selectors = {
    '.front': ['.home-title', '.home-image'],
    '.right': ['.profile-description', '.tech-logos-frontend img', '.tech-logos-backend img'],
    '.left': ['.profile-description', '.about-content p'],
    '.back': ['.contact-title', '.form-group', '.social-links'],
    '.top': ['.projects-title', '.project-card'],
    '.bottom': ['.skills-title', '.skill-item']
  };
    
    // Special animations for specific sides
    if (sideClass === '.bottom') {
      setupSkillBars();
    }

}

// Detect which side is currently visible and animate its content
const updateVisibleSide = () => {
  const cube = document.querySelector('.cube');
  const computedStyle = window.getComputedStyle(cube);
  const transform = computedStyle.transform;
  
  // Extract rotation angle from transform matrix
  let angle = 0;
  if (transform !== 'none') {
    const values = transform.split('(')[1].split(')')[0].split(',');
    angle = Math.round(Math.atan2(values[1], values[0]) * (180/Math.PI));
  }
  
  // Determine which side is visible based on angle
  if (angle === 0 || angle === 360 || angle === -360) {
    animateVisibleContent('.front');
  } else if (angle === 90 || angle === -270) {
    animateVisibleContent('.right');
  } else if (angle === -90 || angle === 270) {
    animateVisibleContent('.left');
  } else if (angle === 180 || angle === -180) {
    animateVisibleContent('.back');
  }
  
  // Check for vertical rotations for top and bottom
  const matrix = new DOMMatrix(transform);
  const rotateX = Math.round(Math.atan2(matrix.m32, matrix.m33) * (180/Math.PI));
  
  if (rotateX === 90 || rotateX === -270) {
    animateVisibleContent('.top');
  } else if (rotateX === -90 || rotateX === 270) {
    animateVisibleContent('.bottom');
  }
};


// Monitor transitions
document.querySelector('.cube').addEventListener('transitionend', updateVisibleSide);

// Event listeners
$homeBtn.addEventListener('click', () => {
  homeBtn();
  updateVisibleSide();
});

$experienceBtn.addEventListener('click', () => {
  experienceBtn();
  updateVisibleSide();
});

$aboutBtn.addEventListener('click', () => {
  aboutBtn();
  updateVisibleSide();
});

$contactBtn.addEventListener('click', () => {
  contactBtn();
  updateVisibleSide();
});

$topBtn.addEventListener('click', () => {
  topBtn();
  updateVisibleSide();
});

$bottomBtn.addEventListener('click', () => {
  bottomBtn();
  updateVisibleSide();
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      experienceBtn();
      updateVisibleSide();
      break;
    case 'ArrowRight':
      aboutBtn();
      updateVisibleSide();
      break;
    case 'ArrowUp':
      topBtn();
      updateVisibleSide();
      break;
    case 'ArrowDown':
      bottomBtn();
      updateVisibleSide();
      break;
    case 'Home':
      homeBtn();
      updateVisibleSide();
      break;
    case 'End':
      contactBtn();
      updateVisibleSide();
      break;
  }
});


// Initialize to show home content
setTimeout(updateVisibleSide, 100);

// Inicialización de los controles de partículas
function initializeParticleControls() {
  // Obtener elementos de control
  const particleCountSlider = document.getElementById('particleCount');
  const particleSpeedSlider = document.getElementById('particleSpeed');
  const particleSizeSlider = document.getElementById('particleSize');
  const connectionDistanceSlider = document.getElementById('connectionDistance');
  
  const particleCountValue = document.getElementById('particleCountValue');
  const particleSpeedValue = document.getElementById('particleSpeedValue');
  const particleSizeValue = document.getElementById('particleSizeValue');
  const connectionDistanceValue = document.getElementById('connectionDistanceValue');
    // Eventos para actualizar los valores y el sistema de partículas
  particleCountSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    particleCountValue.textContent = value;
    import('./particleSystem.js').then(module => {
      module.configureParticleSystem.changeParticleCount(value);
    });
  });
  
  particleSpeedSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    particleSpeedValue.textContent = value;
    import('./particleSystem.js').then(module => {
      module.configureParticleSystem.changeParticleSpeed(value);
    });
  });
  
  particleSizeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    particleSizeValue.textContent = value;
    import('./particleSystem.js').then(module => {
      module.configureParticleSystem.changeParticleSize(value);
    });
  });
  
  connectionDistanceSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    connectionDistanceValue.textContent = value;
    import('./particleSystem.js').then(module => {
      module.configureParticleSystem.changeConnectionDistance(value);
    });
  });
  
  // Añadir evento para el botón de reset
  const resetButton = document.getElementById('resetParticlesBtn');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Restablecer los valores predeterminados en los controles
      particleCountSlider.value = 150;
      particleSpeedSlider.value = 0.7;
      particleSizeSlider.value = 5;
      connectionDistanceSlider.value = 120;
      
      // Actualizar los valores mostrados
      particleCountValue.textContent = 150;
      particleSpeedValue.textContent = 0.7;
      particleSizeValue.textContent = 5;
      connectionDistanceValue.textContent = 120;
        // Resetear los valores en el sistema de partículas usando la función de reset
      import('./particleSystem.js').then(module => {
        module.configureParticleSystem.resetToDefaults();
      });
    });
  }
}
