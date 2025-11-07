import React, { useState, useRef, useEffect } from 'react';

const ActionDropdown = ({ 
  actions = [], 
  triggerIcon = "bi-three-dots-vertical",
  triggerTitle = "Acciones",
  className = "",
  layout = "grid" // "grid" para 2x3, "horizontal" para fila
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  // ✅ MEJORADO: Actualizar posición del dropdown con ajuste automático
  const updatePosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownWidth = layout === "horizontal" ? 250 : 288; // w-72 = 288px
      const dropdownHeight = 400; // Altura estimada máxima
      
      // Calcular posición inicial
      let top = rect.bottom + 8;
      let left = rect.right - 150;
      
      // ✅ Ajustar si se sale por la derecha
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16; // 16px de margen
      }
      
      // ✅ Ajustar si se sale por la izquierda
      if (left < 16) {
        left = 16;
      }
      
      // ✅ Ajustar si se sale por abajo (abrir hacia arriba)
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 8; // Abrir hacia arriba
        
        // Si tampoco cabe arriba, centrar verticalmente
        if (top < 16) {
          top = Math.max(16, (window.innerHeight - dropdownHeight) / 2);
        }
      }
      
      setDropdownPosition({ top, left });
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Actualizar posición cuando se abre
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón trigger */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center h-10 w-10 border border-gray-300 transition-all duration-200 hover:shadow-md"
        title={triggerTitle}
      >
        <i className={`${triggerIcon} text-sm`}></i>
      </button>

      {/* Dropdown menu - Renderizado en portal */}
      {isOpen && (
        <div 
          className={`fixed ${layout === "horizontal" ? "" : "w-72"} bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[9999] animate-fadeInDown max-h-[80vh] overflow-y-auto`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {triggerTitle}
            </p>
          </div>
          
          <div className="p-2">
            <div className={layout === "horizontal" ? "flex flex-row gap-1.5" : "grid grid-cols-2 gap-1.5"}>
              {actions.map((action, index) => {
                // Colores neutros para todos los iconos
                let colorClasses = 'text-gray-600 hover:bg-gray-50 hover:border-gray-300';

                // Función para obtener el icono SVG apropiado
                const getIconSVG = (iconClass) => {
                  if (iconClass.includes('pencil')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    );
                  } else if (iconClass.includes('eye')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    );
                  } else if (iconClass.includes('trash') || iconClass.includes('x-circle')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    );
                  } else if (iconClass.includes('chat')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    );
                  } else if (iconClass.includes('file-earmark-zip')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    );
                  } else if (iconClass.includes('person-badge')) {
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    );
                  } else {
                    // Para otros iconos, usar el icono original
                    return <i className={`${action.icon} text-sm`}></i>;
                  }
                };

                return (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    disabled={action.disabled}
                    className={`${layout === "horizontal" ? "p-2 text-sm transition-all duration-200 flex items-center justify-center h-10 w-10" : "px-2 py-2 text-left text-sm transition-all duration-200 flex flex-col items-center gap-1"} disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-md hover:shadow-sm ${colorClasses}`}
                    title={action.title}
                  >
                    {getIconSVG(action.icon)}
                    {!action.hideLabel && (
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                    )}
                    {action.badge && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        action.badge === 'new' ? 'bg-green-100 text-green-600' :
                        action.badge === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {action.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar al hacer click */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ActionDropdown;
