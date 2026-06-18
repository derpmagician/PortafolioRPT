// Función principal para exportar
export function setupImageTilt(containerSelector) {
  // Seleccionar el contenedor de la imagen
  const container = document.querySelector(containerSelector);
  
  // Si no se encuentra el contenedor, salir
  if (!container) return;
    // Variables para controlar el efecto
  let tiltX = 0;
  let tiltY = 0;
  const maxTilt = 25; // Grados máximos de inclinación
  
  // Manejar el movimiento del mouse
  function handleMouseMove(e) {
    // Obtener la posición relativa del mouse dentro del contenedor
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calcular la posición en porcentaje (0-1)
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    // Determinar el cuadrante (esquina) donde está el cursor
    // y calcular la inclinación correspondiente
    if (xPercent < 0.5 && yPercent < 0.5) {
      // Esquina superior izquierda
      tiltX = -maxTilt * (1 - yPercent * 2);
      tiltY = -maxTilt * (1 - xPercent * 2);
    } else if (xPercent >= 0.5 && yPercent < 0.5) {
      // Esquina superior derecha
      tiltX = -maxTilt * (1 - yPercent * 2);
      tiltY = maxTilt * ((xPercent - 0.5) * 2);
    } else if (xPercent < 0.5 && yPercent >= 0.5) {
      // Esquina inferior izquierda
      tiltX = maxTilt * ((yPercent - 0.5) * 2);
      tiltY = -maxTilt * (1 - xPercent * 2);
    } else {
      // Esquina inferior derecha
      tiltX = maxTilt * ((yPercent - 0.5) * 2);
      tiltY = maxTilt * ((xPercent - 0.5) * 2);
    }
    
    // Aplicar la transformación 3D
    container.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }
  
  // Restablecer la posición cuando el mouse sale
  function handleMouseLeave() {
    container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }
  
  // Añadir transición suave
  container.style.transition = 'transform 0.3s ease-out';
  
  // Event listeners
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseleave', handleMouseLeave);
}
