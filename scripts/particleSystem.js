/**
 * Particle System Module
 * Creates and manages an animated particle background with connections between particles
 */

// Main function to initialize the particle system
export const setupParticles = () => {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match window
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Particle properties
  const particles = [];
  
  // Usar los valores del objeto de configuración
  const particleCount = configureParticleSystem.particleCount;
  const colors = configureParticleSystem.colors;
    // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * configureParticleSystem.particleSize + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * configureParticleSystem.particleSpeed,
      speedY: (Math.random() - 0.5) * configureParticleSystem.particleSpeed,
      opacity: Math.random() * 0.8 + 0.4
    });
  }
  
  // Inicializar el objeto de configuración con referencias
  configureParticleSystem.initialize(canvas, particles);
  
  // Animation loop
  const drawParticles = () => {
    // Clear canvas with slight transparency to create trails
    ctx.fillStyle = 'rgba(0, 59, 70, 0.05)'; // Añade un efecto de estela
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around edges
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.y > canvas.height) particle.y = 0;
      if (particle.y < 0) particle.y = canvas.height;
      
      // Draw particle with glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
      ctx.shadowBlur = 0;
        // Connect nearby particles with lines
      particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const connectionDistance = configureParticleSystem.connectionDistance;
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = 0.2 * (1 - distance / connectionDistance);
          ctx.lineWidth = 0.8;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
    
    // Request next frame
    requestAnimationFrame(drawParticles);
  };
  
  // Start animation
  drawParticles();
};

// Export additional customization functions
export const configureParticleSystem = {
  // Variables para controlar el comportamiento de las partículas
  particleCount: 150,
  particleSpeed: 0.7,
  particleSize: 5,
  connectionDistance: 120,
  particles: [],
  canvas: null,
  ctx: null,
  colors: [
    'rgba(214, 228, 20, 0.7)',  // color-lime (d6e414)
    'rgba(0, 59, 70, 0.5)',     // color-turquoise (003b46)
    'rgba(7, 87, 91, 0.6)',     // color-turquoise-light (07575b)
    'rgba(231, 231, 214, 0.5)'  // color-white (e7e7d6)
  ],
  
  // Inicializar referencias
  initialize: function(canvasRef, particlesArray) {
    this.canvas = canvasRef;
    this.ctx = canvasRef.getContext('2d');
    this.particles = particlesArray;
    return this;
  },

  // Cambiar la cantidad de partículas
  changeParticleCount: function(count) {
    const newCount = parseInt(count);
    if (isNaN(newCount) || newCount < 10) return;
    
    this.particleCount = newCount;
    
    // Ajustar el número actual de partículas
    if (newCount > this.particles.length) {
      // Añadir más partículas
      for (let i = this.particles.length; i < newCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * this.particleSize + 1,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          speedX: (Math.random() - 0.5) * this.particleSpeed,
          speedY: (Math.random() - 0.5) * this.particleSpeed,
          opacity: Math.random() * 0.8 + 0.4
        });
      }
    } else if (newCount < this.particles.length) {
      // Reducir partículas
      this.particles.splice(newCount);
    }
  },

  // Cambiar la velocidad de las partículas
  changeParticleSpeed: function(speed) {
    const newSpeed = parseFloat(speed);
    if (isNaN(newSpeed) || newSpeed < 0) return;
    
    this.particleSpeed = newSpeed;
    
    // Actualizar velocidad de las partículas existentes
    this.particles.forEach(particle => {
      const direction = Math.sign(particle.speedX);
      particle.speedX = direction * (Math.random() * newSpeed);
      const directionY = Math.sign(particle.speedY);
      particle.speedY = directionY * (Math.random() * newSpeed);
    });
  },

  // Cambiar el tamaño de las partículas
  changeParticleSize: function(size) {
    const newSize = parseFloat(size);
    if (isNaN(newSize) || newSize < 1) return;
    
    this.particleSize = newSize;
    
    // Actualizar tamaño de las partículas existentes
    this.particles.forEach(particle => {
      particle.radius = Math.random() * newSize + 1;
    });
  },

  // Cambiar la distancia de conexión entre partículas
  changeConnectionDistance: function(distance) {
    const newDistance = parseFloat(distance);
    if (isNaN(newDistance) || newDistance < 10) return;
    
    this.connectionDistance = newDistance;
  },

  // Restablecer todos los valores predeterminados
  resetToDefaults: function() {
    this.particleCount = 150;
    this.particleSpeed = 0.7;
    this.particleSize = 5;
    this.connectionDistance = 120;
    
    // Limpiar partículas actuales
    this.particles.length = 0;
    
    // Recrear partículas con valores predeterminados
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * this.particleSize + 1,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speedX: (Math.random() - 0.5) * this.particleSpeed,
        speedY: (Math.random() - 0.5) * this.particleSpeed,
        opacity: Math.random() * 0.8 + 0.4
      });
    }
    
    return this;
  },
};
