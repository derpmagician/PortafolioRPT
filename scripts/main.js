import { animate, utils, stagger, createDraggable, createSpring, createScope } from './anime/anime.esm.js';
import { myWorks } from './myWork.js';
import { setupParticles, configureParticleSystem } from './particleSystem.js';
import { setupImageTilt } from './imageTiltEffect.js';

const [ $homeBtn ] = utils.$('.homeBtn');
const [ $experienceBtn ] = utils.$('.experienceBtn');
const [ $aboutBtn ] = utils.$('.aboutBtn');
const [ $contactBtn ] = utils.$('.contactBtn');
const [ $topBtn ] = utils.$('.topBtn');
const [ $bottomBtn ] = utils.$('.bottomBtn');
let activeScrollEl = null;
let activeScrollTransform = false;
let contactScrollOffset = 0;

const cubePulse = animate('.cube', {
  scale: [
    { to: 1.25, ease: 'inOut(3)', duration: 200 },
    { to: 1, ease: createSpring({ stiffness: 300 }) }
  ],
  loop: true,
  loopDelay: 5000,
});

// Make the logo draggable around its center
const cube = document.querySelector('.cube');
const screenEl = document.querySelector('.screen');
let floatingAnimation = null;
let isScreenHovered = false;

screenEl.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'mouse') return;
  isScreenHovered = true;
  cubePulse.pause();
});

screenEl.addEventListener('pointerleave', (event) => {
  if (event.pointerType !== 'mouse') return;
  isScreenHovered = false;
  cubePulse.play();
});

createDraggable('.cube', {
  container: [0, 0, 0, 0],
  releaseEase: createSpring({ stiffness: 200 }),
  onGrab: () => {
    cubePulse.pause();
    floatingAnimation?.pause();
  },
  onRelease: () => {
    floatingAnimation?.play();
    if (!isScreenHovered) cubePulse.play();
  },
  onDrag: (e) => {
    if (e.deltaX !== undefined && e.deltaY !== undefined) {
      utils.set(cube, {
        transform: `rotateY(${e.deltaX * 0.5}deg) rotateX(${e.deltaY * 0.5}deg)`
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
  
  // Setup form input animations
  setupFormAnimations();
  
  // Inicialización de los controles de partículas
  initializeParticleControls();
  
  // Inicialización del personaje 3D junto al cubo
  setupCharacterStage();
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
    image.loading = 'lazy';
    image.decoding = 'async';
    
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
  floatingAnimation = animate('.cube', {
    translateY: [0, -10, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true,
    id: 'floating'
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
    submitBtn.addEventListener('click', () => {
      animate(submitBtn, {
        scale: [1, 0.95, 1.05, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
    });
  }
  
  // Envío real del mensaje por AJAX de FormSubmit, para no salir de la página
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const data = Object.fromEntries(new FormData(contactForm).entries());
      if (submitBtn) submitBtn.disabled = true;
      
      fetch('https://formsubmit.co/ajax/renzin@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(result => {
          const sent = String(result.success) === 'true';
          showFormNotice(contactForm, sent ? '¡Mensaje enviado!' : 'No se pudo enviar. Inténtalo de nuevo.', !sent);
          if (sent) contactForm.reset();
        })
        .catch(() => {
          showFormNotice(contactForm, 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.', true);
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
};

// Aviso temporal bajo el formulario de contacto
const showFormNotice = (form, message, isError) => {
  const notice = document.createElement('div');
  notice.className = isError ? 'form-notice form-notice--error' : 'form-notice';
  notice.setAttribute('role', 'status');
  notice.textContent = message;
  form.appendChild(notice);
  
  animate(notice, {
    opacity: [0, 1],
    translateY: ['-10px', '0px'],
    duration: 400,
    easing: 'easeOutCubic'
  });
  
  setTimeout(() => {
    animate(notice, {
      opacity: [1, 0],
      translateY: ['0px', '10px'],
      duration: 400,
      easing: 'easeOutCubic',
      complete: () => {
        notice.remove();
      }
    });
  }, 3000);
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
  activeScrollEl = null;
  activeScrollTransform = false;
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
  activeScrollEl = null;
  activeScrollTransform = false;
  // Disable the button
  $experienceBtn.disabled = true;
  
  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateX: '90',
    rotateY: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $experienceBtn.disabled = false;
  }, 850);
};

const aboutBtn = () => {
  activeScrollEl = document.querySelector('.about-content');
  activeScrollTransform = false;
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
  const contactContent = document.querySelector('.contact-content');
  contactScrollOffset = 0;
  contactContent.style.transform = 'translateY(0)';
  activeScrollEl = contactContent;
  activeScrollTransform = true;
  requestAnimationFrame(updateContactScrollbar);
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
  activeScrollEl = document.querySelector('.projects-grid');
  activeScrollTransform = false;
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
  activeScrollEl = document.querySelector('.controls-side .bottom-content');
  activeScrollTransform = false;
  // Disable the button
  $bottomBtn.disabled = true;

  // Animate the cube with enhanced easing
  animate('.cube', { 
    rotateY: '+90',
    rotateX: '0',
    scale: '1',
    duration: 850,
    easing: 'easeOutExpo'
  });
  
  setTimeout(() => {
    $bottomBtn.disabled = false;
  }, 850);
};

// Mobile touch scrolling for the active cube face.
// The draggable cube sets touch-action: none and 3D hit-testing is unreliable,
// so vertical swipes are handled manually on the screen container.
let touchScrollEl = null;
let touchStartX = 0;
let touchStartY = 0;
let touchLastY = 0;
let isTouchScrolling = false;

const getContactMaxOffset = (el) => {
  const parent = el.parentElement;
  const style = getComputedStyle(parent);
  const available = parent.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  return Math.max(0, el.offsetHeight - available);
};

const contactScrollbar = document.querySelector('.contact-scrollbar');
const contactScrollbarThumb = document.querySelector('.contact-scrollbar-thumb');

function updateContactScrollbar() {
  if (!contactScrollbar || !contactScrollbarThumb || !activeScrollTransform) return;
  const el = document.querySelector('.contact-content');
  const max = getContactMaxOffset(el);

  if (max <= 0) {
    contactScrollbar.classList.remove('visible');
    return;
  }

  contactScrollbar.classList.add('visible');
  const style = getComputedStyle(el.parentElement);
  const available = el.parentElement.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const track = contactScrollbar.clientHeight;
  const thumbHeight = Math.max(20, track * Math.min(1, available / el.offsetHeight));
  const top = (track - thumbHeight) * (contactScrollOffset / max);

  contactScrollbarThumb.style.height = `${thumbHeight}px`;
  contactScrollbarThumb.style.transform = `translateY(${top}px)`;
}

screenEl.addEventListener('touchstart', (e) => {
  touchScrollEl = null;
  isTouchScrolling = false;
  if (e.touches.length !== 1) return;
  touchScrollEl = activeScrollEl;
  touchStartX = e.touches[0].clientX;
  touchStartY = touchLastY = e.touches[0].clientY;
}, { passive: true });

screenEl.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 1) return;
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  if (!touchScrollEl) {
    if (!activeScrollEl) return;
    touchScrollEl = activeScrollEl;
    touchStartX = x;
    touchStartY = touchLastY = y;
    isTouchScrolling = false;
    return;
  }

  const dx = x - touchStartX;
  const dy = y - touchStartY;

  if (!isTouchScrolling) {
    if (Math.abs(dy) < 8 || Math.abs(dy) <= Math.abs(dx)) return;
    isTouchScrolling = true;
  }

  e.preventDefault();
  const delta = touchLastY - y;

  if (activeScrollTransform) {
    const max = getContactMaxOffset(touchScrollEl);
    contactScrollOffset = Math.max(0, Math.min(max, contactScrollOffset + delta));
    touchScrollEl.style.transform = `translateY(-${contactScrollOffset}px)`;
    updateContactScrollbar();
  } else {
    touchScrollEl.scrollTop += delta;
  }

  touchLastY = y;
}, { passive: false });

screenEl.addEventListener('touchend', () => {
  touchScrollEl = null;
  isTouchScrolling = false;
}, { passive: true });

// Event listeners
$homeBtn.addEventListener('click', () => {
  homeBtn();
});

$experienceBtn.addEventListener('click', () => {
  experienceBtn();
});

$aboutBtn.addEventListener('click', () => {
  aboutBtn();
});

$contactBtn.addEventListener('click', () => {
  contactBtn();
});

$topBtn.addEventListener('click', () => {
  topBtn();
});

$bottomBtn.addEventListener('click', () => {
  bottomBtn();
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  // se usa e.code porque con NumLock apagado el numpad reporta ArrowLeft, Home, End...
  const actions = {
    Numpad4: experienceBtn,
    Numpad6: aboutBtn,
    Numpad8: topBtn,
    Numpad2: bottomBtn,
    ArrowLeft: experienceBtn,
    ArrowRight: aboutBtn,
    ArrowUp: topBtn,
    ArrowDown: bottomBtn,
    Home: homeBtn,
    End: contactBtn
  };

  const action = actions[e.code] ?? actions[e.key];
  if (!action) return;

  action();
});


// El personaje solo se descarga cuando el stage tiene espacio real en pantalla
const setupCharacterStage = () => {
  const stage = document.querySelector('.character-stage');
  if (!stage) return;

  const observer = new ResizeObserver(([entry]) => {
    if (!entry.contentRect.width) return;
    observer.disconnect();
    import('./characterStage.js')
      .then(({ mountCharacterStage }) => mountCharacterStage(stage))
      .catch(() => stage.remove());
  });

  observer.observe(stage);
};

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

  const config = configureParticleSystem;

  const syncControls = () => {
    particleCountSlider.max = config.maxParticles;
    particleCountSlider.value = config.particleCount;
    particleCountValue.textContent = config.particleCount;

    particleSpeedSlider.value = config.particleSpeed;
    particleSpeedValue.textContent = config.particleSpeed;

    particleSizeSlider.value = config.particleSize;
    particleSizeValue.textContent = config.particleSize;

    connectionDistanceSlider.max = config.maxConnectionDistance;
    connectionDistanceSlider.value = config.connectionDistance;
    connectionDistanceValue.textContent = config.connectionDistance;
  };

  syncControls();

  // Eventos para actualizar los valores y el sistema de partículas
  particleCountSlider.addEventListener('input', (e) => {
    config.changeParticleCount(e.target.value);
    e.target.value = config.particleCount;
    particleCountValue.textContent = config.particleCount;
  });
  
  particleSpeedSlider.addEventListener('input', (e) => {
    config.changeParticleSpeed(e.target.value);
    particleSpeedValue.textContent = config.particleSpeed;
  });
  
  particleSizeSlider.addEventListener('input', (e) => {
    config.changeParticleSize(e.target.value);
    particleSizeValue.textContent = config.particleSize;
  });
  
  connectionDistanceSlider.addEventListener('input', (e) => {
    config.changeConnectionDistance(e.target.value);
    e.target.value = config.connectionDistance;
    connectionDistanceValue.textContent = config.connectionDistance;
  });
  
  // Añadir evento para el botón de reset
  const resetButton = document.getElementById('resetParticlesBtn');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      config.resetToDefaults();
      syncControls();
    });
  }
}
