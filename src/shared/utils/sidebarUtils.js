/**
 * Utilidades para el sidebar y navegación
 * 
 * Proporciona funciones para filtrar y gestionar items del menú según roles
 * 
 * @module sidebarUtils
 */

import { isAdmin, isEmployee, isAdminOrEmployee, getUserRole } from './roleUtils';

/**
 * Obtiene los items del menú filtrados según el rol del usuario
 * @param {object} user - Usuario actual
 * @returns {array} Array de items del menú disponibles para el usuario
 * 
 * @example
 * const menuItems = getMenuItemsForRole(user);
 * // Retorna solo los items que el usuario puede ver según su rol
 */
export const getMenuItemsForRole = (user) => {
  // Si no hay usuario, retornar array vacío
  if (!user) return [];

  const isUserAdmin = isAdmin(user);
  const isUserEmployee = isEmployee(user);
  const isUserAdminOrEmployee = isAdminOrEmployee(user);

  // Definir todos los items del menú con sus permisos
  const allMenuItems = [
    {
      label: "Dashboard",
      icon: "TbLayoutGrid",
      to: "/admin/dashboard",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 1
    },
    {
      label: "Configuración",
      icon: "TbSettings",
      to: "/admin/roles",
      roles: ['admin'], // Solo Admin
      order: 2
    },
    {
      label: "Usuarios",
      icon: "TbUser",
      to: "/admin/gestionUsuarios",
      roles: ['admin'], // Solo Admin
      order: 3
    },
    {
      label: "Servicios",
      icon: "TbBox",
      to: "/admin/servicios",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 4
    },
    {
      label: "Empleados",
      icon: "TbUsers",
      to: "/admin/empleados",
      roles: ['admin'], // Solo Admin
      order: 5
    },
    {
      label: "Clientes",
      icon: "TbUserSquareRounded",
      to: "/admin/gestionClientes",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 6
    },
    {
      label: "Pagos",
      icon: "TbCreditCard",
      to: "/admin/pagos",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 7
    },
    {
      label: "Citas",
      icon: "TbCalendar",
      to: "/admin/calendario",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 8
    }
  ];

  // Items del dropdown de Solicitudes
  const solicitudesDropdownItems = [
    {
      label: "En proceso",
      icon: "TbListDetails",
      to: "/admin/ventasServiciosProceso",
      roles: ['admin', 'empleado'], // Admin y Empleado
      isDropdownItem: true
    },
    {
      label: "Terminadas",
      icon: "TbCircleCheck",
      to: "/admin/ventasServiciosFin",
      roles: ['admin', 'empleado'], // Admin y Empleado
      isDropdownItem: true
    },
    {
      label: "Solicitudes de citas",
      icon: "TbCalendarEvent",
      to: "/admin/solicitudesCitas",
      roles: ['admin', 'empleado'], // Admin y Empleado
      isDropdownItem: true
    }
  ];

  // Filtrar items principales según rol
  const filteredMainItems = allMenuItems.filter(item => {
    if (item.roles.includes('admin') && item.roles.includes('empleado')) {
      return isUserAdminOrEmployee;
    }
    if (item.roles.includes('admin')) {
      return isUserAdmin;
    }
    if (item.roles.includes('empleado')) {
      return isUserEmployee;
    }
    return false;
  });

  // Filtrar items del dropdown según rol
  const filteredDropdownItems = solicitudesDropdownItems.filter(item => {
    if (item.roles.includes('admin') && item.roles.includes('empleado')) {
      return isUserAdminOrEmployee;
    }
    if (item.roles.includes('admin')) {
      return isUserAdmin;
    }
    if (item.roles.includes('empleado')) {
      return isUserEmployee;
    }
    return false;
  });

  // Retornar items principales y el dropdown si tiene items
  const result = [...filteredMainItems];
  
  // Si hay items en el dropdown, agregar el item "Solicitudes" como dropdown
  if (filteredDropdownItems.length > 0) {
    result.push({
      label: "Solicitudes",
      icon: "TbListDetails",
      to: null, // No tiene ruta directa, es un dropdown
      roles: ['admin', 'empleado'],
      order: 9,
      isDropdown: true,
      dropdownItems: filteredDropdownItems
    });
  }

  // Ordenar por order
  return result.sort((a, b) => a.order - b.order);
};

/**
 * Verifica si un item del menú es visible para el usuario
 * @param {object} item - Item del menú
 * @param {object} user - Usuario actual
 * @returns {boolean} True si el item es visible para el usuario
 */
export const isMenuItemVisible = (item, user) => {
  if (!item || !user) return false;
  
  const itemRoles = item.roles || [];
  const isUserAdmin = isAdmin(user);
  const isUserEmployee = isEmployee(user);
  
  if (itemRoles.includes('admin') && itemRoles.includes('empleado')) {
    return isUserAdmin || isUserEmployee;
  }
  if (itemRoles.includes('admin')) {
    return isUserAdmin;
  }
  if (itemRoles.includes('empleado')) {
    return isUserEmployee;
  }
  
  return false;
};

/**
 * Obtiene los items del dropdown de Solicitudes filtrados por rol
 * @param {object} user - Usuario actual
 * @returns {array} Array de items del dropdown disponibles
 */
export const getSolicitudesDropdownItems = (user) => {
  if (!user) return [];

  const isUserAdminOrEmployee = isAdminOrEmployee(user);
  
  if (!isUserAdminOrEmployee) return [];

  return [
    {
      label: "En proceso",
      icon: "TbListDetails",
      to: "/admin/ventasServiciosProceso"
    },
    {
      label: "Terminadas",
      icon: "TbCircleCheck",
      to: "/admin/ventasServiciosFin"
    },
    {
      label: "Solicitudes de citas",
      icon: "TbCalendarEvent",
      to: "/admin/solicitudesCitas"
    }
  ];
};

// Exportación por defecto
export default {
  getMenuItemsForRole,
  isMenuItemVisible,
  getSolicitudesDropdownItems
};

