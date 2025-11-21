/**
 * Utilidades para el sidebar y navegación
 * 
 * Proporciona funciones para filtrar y gestionar items del menú según roles
 * 
 * @module sidebarUtils
 */

import { isAdmin, isEmployee, isAdminOrEmployee, getUserRole } from './roleUtils';

/**
 * Obtiene TODOS los items del menú sin filtrar por rol
 * Los permisos se validan en las rutas con PermissionGuard
 * @param {object} user - Usuario actual (no se usa para filtrar, solo para compatibilidad)
 * @returns {array} Array con TODOS los items del menú
 * 
 * @example
 * const menuItems = getMenuItemsForRole(user);
 * // Retorna TODOS los items del menú, sin importar el rol
 */
export const getMenuItemsForRole = (user) => {
  // Definir todos los items del menú
  // Orden: Dashboard - Configuración - Usuarios - Servicios - Empleados - Solicitudes - Citas - Clientes - Pagos
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
      label: "Citas",
      icon: "TbCalendar",
      to: "/admin/calendario",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 7
    },
    {
      label: "Clientes",
      icon: "TbUserSquareRounded",
      to: "/admin/gestionClientes",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 8
    },
    {
      label: "Pagos",
      icon: "TbCreditCard",
      to: "/admin/pagos",
      roles: ['admin', 'empleado'], // Admin y Empleado
      order: 9
    }
  ];

  // Items del dropdown de Solicitudes (siempre se muestran todos)
  const solicitudesDropdownItems = [
    {
      label: "En proceso",
      icon: "TbListDetails",
      to: "/admin/ventasServiciosProceso",
      isDropdownItem: true
    },
    {
      label: "Terminadas",
      icon: "TbCircleCheck",
      to: "/admin/ventasServiciosFin",
      isDropdownItem: true
    },
    {
      label: "Solicitudes de citas",
      icon: "TbCalendarEvent",
      to: "/admin/solicitudesCitas",
      isDropdownItem: true
    }
  ];

  // Retornar TODOS los items principales sin filtrar
  const result = [...allMenuItems];
  
  // Agregar el item "Solicitudes" como dropdown (siempre visible)
  // Orden: Dashboard - Configuración - Usuarios - Servicios - Empleados - Solicitudes - Citas - Clientes - Pagos
  result.push({
    label: "Solicitudes",
    icon: "TbListDetails",
    to: null, // No tiene ruta directa, es un dropdown
    order: 6, // Solicitudes va después de Empleados y antes de Citas
    isDropdown: true,
    dropdownItems: solicitudesDropdownItems
  });

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
 * Obtiene TODOS los items del dropdown de Solicitudes sin filtrar
 * Los permisos se validan en las rutas con PermissionGuard
 * @param {object} user - Usuario actual (no se usa para filtrar, solo para compatibilidad)
 * @returns {array} Array con TODOS los items del dropdown
 */
export const getSolicitudesDropdownItems = (user) => {
  // Retornar TODOS los items del dropdown sin filtrar
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

