// Utilidad para filtrar errores de extensiones del navegador
export const setupErrorFilter = () => {
  // Guardar la función original de console.error
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Función para verificar si un error es de una extensión del navegador
  const isExtensionError = (message) => {
    if (typeof message !== 'string') return false;
    
    return (
      // Errores de extensiones de escritura/IA
      (message.includes('permission error') && 
       (message.includes('pathPrefix') || message.includes('reqInfo'))) ||
      
      // Errores de extensiones de generación de contenido
      (message.includes('code: 403') && 
       (message.includes('generate') || message.includes('tone') || message.includes('writing'))) ||
      
      // Errores de extensiones de integración de sitios
      (message.includes('site_integration') || message.includes('template_list')) ||
      
      // Errores de extensiones de Chrome
      (message.includes('chrome-extension://') && message.includes('403')) ||
      
      // Errores de extensiones de Grammarly, LanguageTool, etc.
      (message.includes('grammarly') || message.includes('languagetool') || message.includes('whisk')) ||
      
      // Errores específicos de extensiones con pathPrefix
      (message.includes('pathPrefix: \'/generate\'') || 
       message.includes('pathPrefix: \'/writing\'') || 
       message.includes('pathPrefix: \'/site_integration\'')) ||
      
      // Errores con reqInfo y pathPrefix
      (message.includes('reqInfo:') && message.includes('pathPrefix:')) ||
      
      // Errores de background.js de extensiones
      (message.includes('background.js') && message.includes('permission error'))
    );
  };

  // Filtrar console.error
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    if (isExtensionError(message)) {
      // No mostrar errores de extensiones
      return;
    }
    
    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };

  // Filtrar console.warn
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    if (isExtensionError(message)) {
      // No mostrar warnings de extensiones
      return;
    }
    
    // Mostrar otros warnings normalmente
    originalConsoleWarn.apply(console, args);
  };

  // Filtrar console.log para errores de extensiones
  console.log = (...args) => {
    const message = args[0]?.toString() || '';
    
    if (isExtensionError(message)) {
      // No mostrar logs de extensiones
      return;
    }
    
    // Mostrar otros logs normalmente
    originalConsoleLog.apply(console, args);
  };

  // Filtrar errores no capturados de extensiones
  window.addEventListener('error', (event) => {
    const message = event.message || event.error?.message || '';
    
    if (isExtensionError(message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Filtrar promesas rechazadas de extensiones
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || '';
    const reason = event.reason;
    
    // Verificar si es un error de extensión
    if (isExtensionError(message) || 
        (reason && typeof reason === 'object' && 
         (reason.code === 403 && reason.reqInfo && reason.reqInfo.pathPrefix))) {
      event.preventDefault();
      return false;
    }
  });

  // Función para restaurar los console originales
  return () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  };
};

// Función para verificar si un error es de la aplicación
export const isAppError = (error) => {
  if (!error) return false;
  
  const message = error.message || error.toString() || '';
  
  // Errores que SÍ son de la aplicación
  return (
    message.includes('api-registrack.onrender.com') ||
    message.includes('apiregistrack') ||
    message.includes('herokuapp.com') ||
    message.includes('registrack') ||
    message.includes('auth') ||
    message.includes('login') ||
    message.includes('forgot-password') ||
    message.includes('HTTP error! status:') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError')
  );
};

export default setupErrorFilter;
