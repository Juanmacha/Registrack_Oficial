import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Componente base para todos los modales del sistema
 * Proporciona estructura consistente: backdrop, header, contenido, footer
 * 
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título del modal
 * @param {string} subtitle - Subtítulo opcional del modal (se muestra debajo del título)
 * @param {string} headerGradient - Color del gradiente del header ('blue', 'green', 'purple', 'red', 'gray')
 * @param {React.ReactNode} headerIcon - Icono opcional para el header
 * @param {React.ReactNode} children - Contenido del modal
 * @param {array} footerActions - Array de acciones para el footer [{label, onClick, variant, icon, disabled}]
 * @param {string} maxWidth - Ancho máximo del modal ('sm', 'md', 'lg', 'xl', '2xl', '4xl', '6xl', 'full')
 * @param {boolean} showCloseButton - Mostrar botón de cerrar en header (default: true)
 * @param {boolean} closeOnBackdropClick - Cerrar al hacer click en backdrop (default: true)
 * @param {boolean} closeOnEscape - Cerrar al presionar ESC (default: true)
 * @param {string} className - Clases CSS adicionales para el modal
 * @param {boolean} showHeader - Mostrar header (default: true si hay title)
 * @param {boolean} showFooter - Mostrar footer (default: true si hay footerActions)
 * @param {React.ReactNode} customHeader - Header personalizado (sobrescribe header estándar)
 * @param {React.ReactNode} customFooter - Footer personalizado (sobrescribe footer estándar)
 */
const BaseModal = ({
  isOpen,
  onClose,
  title = '',
  subtitle = '',
  headerGradient = 'blue',
  headerIcon = null,
  children,
  footerActions = [],
  maxWidth = '4xl',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  showHeader = undefined, // auto-detect si hay title
  showFooter = undefined, // auto-detect si hay footerActions
  customHeader = null,
  customFooter = null,
  ...props
}) => {
  // Auto-detectar si mostrar header/footer
  const shouldShowHeader = showHeader !== undefined ? showHeader : (title || subtitle || customHeader);
  const shouldShowFooter = showFooter !== undefined ? showFooter : (footerActions.length > 0 || customFooter);

  // Manejar tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Colores del gradiente según el tipo
  const gradientColors = {
    blue: 'from-[#275FAA] to-[#163366]',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    red: 'from-red-600 to-red-800',
    gray: 'from-gray-600 to-gray-800',
    orange: 'from-orange-600 to-orange-800',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  const buttonVariants = {
    primary: 'bg-[#275FAA] text-white hover:bg-[#163366] active:bg-[#122855]',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
    outline: 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth] || maxWidthClasses['4xl']}
          overflow-hidden relative border border-gray-200
          animate-in fade-in zoom-in duration-200
          ${className}
        `}
        onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer click dentro del modal
        {...props}
      >
        {/* Header con gradiente */}
        {shouldShowHeader && (
          <>
            {customHeader ? (
              customHeader
            ) : (
              <div
                className={`
                  sticky top-0 z-20 bg-gradient-to-r ${gradientColors[headerGradient] || gradientColors.blue}
                  px-6 py-4 rounded-t-2xl shadow-sm
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {headerIcon && (
                      <div className="bg-white bg-opacity-20 p-2 rounded-full flex-shrink-0">
                        {headerIcon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {title && (
                        <h2 className="text-xl font-bold text-white truncate">{title}</h2>
                      )}
                      {subtitle && (
                        <p className="text-sm text-white text-opacity-90 mt-1 truncate">{subtitle}</p>
                      )}
                    </div>
                  </div>

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200 active:scale-95"
                      aria-label="Cerrar modal"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]" style={{ maxHeight: shouldShowHeader && shouldShowFooter ? 'calc(90vh - 12rem)' : shouldShowHeader || shouldShowFooter ? 'calc(90vh - 10rem)' : 'calc(90vh - 2rem)' }}>
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Footer con acciones */}
        {shouldShowFooter && (
          <>
            {customFooter ? (
              customFooter
            ) : (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl shadow-sm">
                {footerActions.map((action, index) => {
                  const {
                    label,
                    onClick,
                    variant = 'primary',
                    icon: Icon,
                    disabled = false,
                    className: buttonClassName = '',
                    ...buttonProps
                  } = action;

                  return (
                    <button
                      key={index}
                      onClick={onClick}
                      disabled={disabled}
                      className={`
                        ${buttonVariants[variant] || buttonVariants.primary}
                        px-6 py-3 rounded-lg font-semibold 
                        transition-all duration-200 shadow-md hover:shadow-lg
                        transform hover:-translate-y-0.5 active:translate-y-0
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        flex items-center gap-2
                        ${buttonClassName}
                      `}
                      {...buttonProps}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BaseModal;

