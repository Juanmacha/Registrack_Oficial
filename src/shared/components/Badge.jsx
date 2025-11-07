import React from 'react';
import { getEstadoSolicitudBadge, getEstadoPagoBadge, getEstadoActivoBadge } from '../utils/badgeUtils';

/**
 * Componente Badge reutilizable
 * @param {object} props - Propiedades del badge
 * @param {string|boolean} props.estado - Estado a mostrar
 * @param {string} props.tipo - Tipo de badge ('solicitud', 'pago', 'activo', 'rol')
 * @param {string} props.size - Tamaño del badge ('xs', 'sm', 'md', 'lg')
 * @param {string} props.className - Clases CSS adicionales
 * @param {function} props.children - Contenido opcional (si se proporciona, se usa en lugar del label)
 * @returns {JSX.Element} Badge renderizado
 */
const Badge = ({
  estado,
  tipo = 'solicitud',
  size = 'xs',
  className = '',
  children,
  ...props
}) => {
  // Obtener configuración según el tipo
  let config;
  switch (tipo) {
    case 'pago':
      config = getEstadoPagoBadge(estado);
      break;
    case 'activo':
    case 'rol':
      config = getEstadoActivoBadge(estado);
      break;
    case 'solicitud':
    default:
      config = getEstadoSolicitudBadge(estado);
      break;
  }
  
  // Tamaños
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg'
  };
  
  const baseClasses = 'inline-flex items-center rounded-full font-semibold';
  const sizeClass = sizeClasses[size] || sizeClasses.xs;
  
  return (
    <span
      className={`${baseClasses} ${sizeClass} ${config.bg} ${config.text} ${className}`}
      {...props}
    >
      {children || config.label}
    </span>
  );
};

export default Badge;

