import React, { useState, useMemo } from "react";
import {
  TbLayoutGrid,
  TbUser,
  TbUsers,
  TbBriefcase,
  TbCalendar,
  TbCreditCard,
  TbListDetails,
  TbBox,
  TbSettings,
  TbCircleCheck,
  TbUserSquareRounded,
  TbCalendarEvent
} from "react-icons/tb";
import { FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../../shared/contexts/SidebarContext";
import { useAuth } from "../../../shared/contexts/authContext";
import { getMenuItemsForRole, getSolicitudesDropdownItems } from "../../../shared/utils/sidebarUtils";

// Mapa de iconos por nombre
const iconMap = {
  TbLayoutGrid,
  TbUser,
  TbUsers,
  TbBriefcase,
  TbCalendar,
  TbCreditCard,
  TbListDetails,
  TbBox,
  TbSettings,
  TbCircleCheck,
  TbUserSquareRounded,
  TbCalendarEvent
};

const SideBarGeneral = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const { setIsSidebarExpanded } = useSidebar();
  const { user } = useAuth();

  const iconClass = "text-gray-600 w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0";
  const baseLinkClasses =
    "flex items-center space-x-1 lg:space-x-2 p-1 lg:p-1.5 rounded-md hover:bg-gray-200 transition-all text-xs lg:text-[0.95rem]";
  const activeLinkClasses = "bg-gray-100 border-l-2 lg:border-l-4 border-blue-500";

  // ✅ Obtener todos los items del menú (incluyendo el dropdown de Solicitudes) ordenados
  const allMenuItems = useMemo(() => {
    return getMenuItemsForRole(user);
  }, [user]);

  // ✅ Obtener items del dropdown de Solicitudes filtrados por rol
  const solicitudesDropdownItems = useMemo(() => {
    return getSolicitudesDropdownItems(user);
  }, [user]);

  // ✅ Separar items regulares del dropdown de Solicitudes
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => !item.isDropdown);
  }, [allMenuItems]);

  // ✅ Obtener el item de Solicitudes (dropdown) si existe
  const solicitudesMenuItem = useMemo(() => {
    return allMenuItems.find(item => item.isDropdown);
  }, [allMenuItems]);

  // ✅ Siempre mostrar el dropdown de Solicitudes si existe (ya no se filtra por rol)
  const showSolicitudesDropdown = solicitudesMenuItem && solicitudesMenuItem.dropdownItems && solicitudesMenuItem.dropdownItems.length > 0;

  const handleToggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const handleSidebarEnter = () => setIsSidebarExpanded(true);
  const handleSidebarLeave = () => {
    setIsDropdownOpen(false);
    setIsSidebarExpanded(false);
  };

  return (
    <div className="h-screen">
      <div
        className="flex flex-col group transition-all duration-300 h-full"
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <aside className="sidebar-responsive w-16 lg:w-20 group-hover:w-64 transition-all duration-300 ease-in-out text-gray-900 p-2 lg:p-3 h-full flex flex-col">
          {/* Logo */}
          <div className="flex justify-center items-center mb-2 lg:mb-3 flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-8 h-auto lg:w-12 group-hover:w-32 transition-all duration-300"
            />
          </div>
          {/* Navegación */}
          <nav className="space-y-1 flex-1 overflow-y-auto pr-1 pb-2" style={{ scrollbarWidth: 'thin' }}>
            {/* Renderizar todos los items en orden, incluyendo el dropdown de Solicitudes en su posición correcta */}
            {allMenuItems.map((item) => {
              // Si es el dropdown de Solicitudes, renderizarlo
              if (item.isDropdown && showSolicitudesDropdown) {
                return (
                  <div key="solicitudes-dropdown" className="relative">
                    <div
                      onClick={handleToggleDropdown}
                      role="button"
                      aria-expanded={isDropdownOpen}
                      className={`${baseLinkClasses} cursor-pointer justify-between`}
                    >
                      <div className="flex items-center space-x-2">
                        <TbListDetails className={iconClass} />
                        <span className="text-gray-700 text-[0.95rem] font-medium hidden group-hover:inline">Solicitudes</span>
                      </div>
                      <FiChevronRight
                        className={`text-gray-600 transition-transform duration-300 hidden group-hover:inline ${isDropdownOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                    <div
                      className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                    >
                      {solicitudesDropdownItems.map((dropdownItem) => {
                        const DropdownIcon = iconMap[dropdownItem.icon] || TbListDetails;
                        return (
                          <Link to={dropdownItem.to} key={dropdownItem.to} className="no-underline block">
                            <div
                              className={`${baseLinkClasses} ${location.pathname === dropdownItem.to ? activeLinkClasses : ""}`}
                            >
                              <DropdownIcon className={iconClass} />
                              <span className="text-gray-700 text-[0.95rem] font-medium hidden group-hover:inline">{dropdownItem.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Items regulares del menú
              if (!item.isDropdown) {
                const IconComponent = iconMap[item.icon];
                if (!IconComponent) return null;

                return (
                  <Link to={item.to} key={item.to} className="no-underline block">
                    <div
                      className={`${baseLinkClasses} ${location.pathname === item.to ? activeLinkClasses : ""}`}
                    >
                      <IconComponent className={iconClass} />
                      <span className="text-gray-700 text-[0.95rem] font-medium hidden group-hover:inline">{item.label}</span>
                    </div>
                  </Link>
                );
              }

              return null;
            })}
          </nav>
        </aside>
      </div>
    </div>
  );
};
export default SideBarGeneral;
