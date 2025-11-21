/**
 * Hook para verificar permisos granular del sistema
 * Implementa el sistema de permisos granular del backend (Enero 2026)
 */

import { useState, useEffect, useCallback } from 'react';
import { getToken, getUser } from '../utils/authUtils.js';
import API_CONFIG from '../config/apiConfig.js';

/**
 * NOTA: Los permisos por defecto han sido ELIMINADOS.
 * El frontend ahora usa SOLO los permisos que vienen del backend.
 * El backend es la única fuente de verdad para los permisos.
 * 
 * Si el backend no envía permisos, el usuario no tendrá acceso.
 * Los permisos por defecto deben estar asignados en la base de datos, no en el frontend.
 */

/**
 * Mapea nombres de módulos del frontend a nombres del backend
 * Basado en la documentación oficial del sistema de permisos (Enero 2026)
 * Total: 19 módulos (11 completos, 7 parciales, 1 solo lectura)
 * 
 * @param {string} moduloFrontend - Nombre del módulo en el frontend
 * @returns {string} - Nombre del módulo en el backend
 */
const mapModuloToBackend = (moduloFrontend) => {
  // Mapeo completo según documentación oficial
  const mapping = {
    // Módulos Completos (11) - Tienen todas las acciones: crear, leer, actualizar, eliminar
    'usuarios': 'gestion_usuarios',
    'empleados': 'gestion_empleados',
    'clientes': 'gestion_clientes',
    'solicitudes': 'gestion_solicitudes',
    'ventas': 'gestion_solicitudes', // Alias para solicitudes
    'citas': 'gestion_citas',
    'seguimiento': 'gestion_seguimiento',
    'roles': 'gestion_roles',
    'permisos': 'gestion_permisos',
    'privilegios': 'gestion_privilegios',
    'tipo_archivos': 'gestion_tipo_archivos',
    'detalles_procesos': 'gestion_detalles_procesos',
    
    // Módulos Parciales (7) - Tienen solo algunas acciones
    'empresas': 'gestion_empresas', // crear, leer
    'servicios': 'gestion_servicios', // leer, actualizar
    'pagos': 'gestion_pagos', // crear, leer, actualizar
    'archivos': 'gestion_archivos', // crear, leer
    'solicitud_cita': 'gestion_solicitud_cita', // crear, leer, actualizar (módulo separado de gestion_citas)
    'solicitudes_cita': 'gestion_solicitud_cita', // Alias alternativo
    'detalles_orden': 'gestion_detalles_orden', // crear, leer, actualizar
    'servicios_procesos': 'gestion_servicios_procesos', // crear, leer, eliminar
    
    // Módulos de Solo Lectura (1)
    'dashboard': 'gestion_dashboard', // leer
    
    // Módulos adicionales (no documentados pero pueden existir en el sistema)
    'formularios': 'gestion_formularios',
    'reportes': 'gestion_reportes',
    'configuracion': 'gestion_configuracion'
  };
  
  // Si ya tiene el prefijo gestion_, devolverlo tal cual
  if (moduloFrontend.startsWith('gestion_')) {
    return moduloFrontend;
  }
  
  // Mapear o devolver el nombre tal cual si no hay mapeo
  return mapping[moduloFrontend.toLowerCase()] || `gestion_${moduloFrontend.toLowerCase()}`;
};

/**
 * Hook para verificar permisos granular
 * @returns {Object} - { permissions, loading, hasPermission, refreshPermissions }
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Decodifica el token JWT para obtener el id_rol
   */
  const getRoleIdFromToken = useCallback(() => {
    try {
      const token = getToken();
      if (!token) return null;

      // Decodificar JWT
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      
      // El backend incluye id_rol en el JWT según la documentación
      return payload.id_rol || payload.idRol || null;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }, []);

  /**
   * Carga los permisos del rol desde la API
   */
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      let idRol = getRoleIdFromToken();
      console.log('🔍 [usePermissions] ID Rol obtenido del token:', idRol);
      
      // Si no se pudo obtener del token, intentar desde el usuario almacenado
      if (!idRol) {
        console.warn('⚠️ [usePermissions] No se pudo obtener id_rol del token, intentando desde user...');
        const user = getUser();
        if (user) {
          idRol = user.id_rol || user.idRol || user.rol?.id || user.rol?.id_rol;
          console.log('🔍 [usePermissions] ID Rol obtenido desde user:', idRol);
        }
      }
      
      if (!idRol) {
        console.warn('⚠️ [usePermissions] No se pudo obtener id_rol ni del token ni del user');
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Primero intentar obtener permisos desde el usuario almacenado (si vienen en el login)
      // El backend ahora envía los permisos en usuario.rol.permisos
      const user = getUser();
      console.log('🔍 [usePermissions] Usuario obtenido:', user);
      console.log('🔍 [usePermissions] user.rol:', user?.rol);
      console.log('🔍 [usePermissions] user.rol?.permisos:', user?.rol?.permisos);
      
      if (user && user.rol && user.rol.permisos) {
        console.log('✅ [usePermissions] Permisos encontrados en el usuario almacenado (desde login)');
        const permisosObj = user.rol.permisos;
        console.log('📋 [usePermissions] Estructura de permisosObj:', JSON.stringify(permisosObj, null, 2));
        
        // Procesar permisos directamente sin hacer petición a la API
        const normalizedPermissions = [];
        
        if (typeof permisosObj === 'object' && !Array.isArray(permisosObj)) {
          console.log('🔄 [usePermissions] Procesando permisos desde user.rol.permisos');
          console.log('📋 [usePermissions] Módulos encontrados:', Object.keys(permisosObj));
          
          Object.keys(permisosObj).forEach(moduloKey => {
            const moduloPermisos = permisosObj[moduloKey];
            console.log(`🔍 [usePermissions] Procesando módulo "${moduloKey}":`, moduloPermisos);
            
            if (moduloPermisos && typeof moduloPermisos === 'object') {
              const moduloBackend = mapModuloToBackend(moduloKey);
              console.log(`🔄 [usePermissions] Módulo "${moduloKey}" mapeado a "${moduloBackend}"`);
              
              const acciones = ['crear', 'leer', 'actualizar', 'editar', 'eliminar'];
              acciones.forEach(accion => {
                if (moduloPermisos[accion] === true) {
                  const accionNormalizada = accion === 'actualizar' ? 'editar' : accion;
                  normalizedPermissions.push({
                    modulo: moduloBackend,
                    accion: accionNormalizada
                  });
                  console.log(`✅ [usePermissions] Permiso agregado: ${moduloBackend} - ${accionNormalizada}`);
                }
              });
            }
          });
          
          // Si no hay permisos, el usuario no tendrá acceso (NO aplicar permisos por defecto)
          if (normalizedPermissions.length === 0) {
            console.warn('⚠️ [usePermissions] No hay permisos en user.rol.permisos. El usuario no tendrá acceso.');
            console.warn('💡 [usePermissions] Los permisos deben estar asignados en la base de datos del backend.');
            console.warn('📋 [usePermissions] Estructura completa de permisosObj:', JSON.stringify(permisosObj, null, 2));
            setPermissions([]);
            setLoading(false);
            return;
          }
          
          setPermissions(normalizedPermissions);
          console.log('✅ [usePermissions] Permisos cargados desde usuario:', normalizedPermissions);
          console.log(`📊 [usePermissions] Total de permisos: ${normalizedPermissions.length}`);
          setLoading(false);
          return;
        } else {
          console.warn('⚠️ [usePermissions] permisosObj no es un objeto válido:', typeof permisosObj, permisosObj);
        }
      } else {
        console.warn('⚠️ [usePermissions] No se encontraron permisos en user.rol.permisos');
        console.warn('📋 [usePermissions] Estructura del usuario:', {
          hasUser: !!user,
          hasRol: !!user?.rol,
          hasPermisos: !!user?.rol?.permisos,
          rolType: typeof user?.rol,
          permisosType: typeof user?.rol?.permisos
        });
      }

      // Si no están en el usuario, intentar obtener desde la API
      // Nota: Este endpoint puede requerir permisos de admin, pero intentamos de todas formas
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROLE_BY_ID(idRol)}`;
      console.log('🔗 [usePermissions] URL para obtener permisos:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido o expirado
          console.warn('⚠️ [usePermissions] Token inválido o expirado');
          setPermissions([]);
          setLoading(false);
          return;
        }
        
        if (response.status === 403) {
          // No tiene permisos para consultar roles (solo admin puede)
          console.warn('⚠️ [usePermissions] No tiene permisos para consultar roles (403 Forbidden)');
          console.log('💡 [usePermissions] Intentando obtener permisos desde el usuario almacenado...');
          
          // Intentar obtener permisos desde el usuario almacenado (si vienen del login)
          const userForPerms = getUser();
          if (userForPerms && userForPerms.rol && userForPerms.rol.permisos) {
            console.log('✅ [usePermissions] Permisos encontrados en el usuario almacenado (fallback desde 403)');
            const permisosObj = userForPerms.rol.permisos;
            const normalizedPermissions = [];
            
            if (typeof permisosObj === 'object' && !Array.isArray(permisosObj)) {
              Object.keys(permisosObj).forEach(moduloKey => {
                const moduloPermisos = permisosObj[moduloKey];
                if (moduloPermisos && typeof moduloPermisos === 'object') {
                  const moduloBackend = mapModuloToBackend(moduloKey);
                  const acciones = ['crear', 'leer', 'actualizar', 'editar', 'eliminar'];
                  acciones.forEach(accion => {
                    if (moduloPermisos[accion] === true) {
                      const accionNormalizada = accion === 'actualizar' ? 'editar' : accion;
                      normalizedPermissions.push({
                        modulo: moduloBackend,
                        accion: accionNormalizada
                      });
                    }
                  });
                }
              });
            }
            
            if (normalizedPermissions.length > 0) {
              setPermissions(normalizedPermissions);
              console.log('✅ [usePermissions] Permisos cargados desde usuario (fallback):', normalizedPermissions);
              setLoading(false);
              return;
            }
          }
          
          // Si no hay permisos disponibles, el usuario no tendrá acceso
          console.warn('⚠️ [usePermissions] No se pudieron obtener permisos. El usuario no tendrá acceso.');
          setPermissions([]);
          setLoading(false);
          return;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 [usePermissions] Respuesta completa de la API:', JSON.stringify(data, null, 2));
      
      // Extraer permisos de la respuesta - verificar todas las posibles ubicaciones
      // El backend devuelve permisos en formato granular: { "usuarios": { "crear": true, "leer": true, ... } }
      let permisosObj = null;
      
      if (data.data?.permisos) {
        permisosObj = data.data.permisos;
        console.log('✅ [usePermissions] Permisos encontrados en data.data.permisos');
      } else if (data.permisos) {
        permisosObj = data.permisos;
        console.log('✅ [usePermissions] Permisos encontrados en data.permisos');
      } else if (data.data?.rol?.permisos) {
        permisosObj = data.data.rol.permisos;
        console.log('✅ [usePermissions] Permisos encontrados en data.data.rol.permisos');
      } else if (data.rol?.permisos) {
        permisosObj = data.rol.permisos;
        console.log('✅ [usePermissions] Permisos encontrados en data.rol.permisos');
      } else {
        console.warn('⚠️ [usePermissions] No se encontraron permisos en la respuesta. Estructura completa:', Object.keys(data));
        if (data.data) {
          console.log('📋 [usePermissions] Estructura de data.data:', Object.keys(data.data));
        }
      }
      
      if (permisosObj) {
        console.log('📋 [usePermissions] Permisos objeto encontrado:', JSON.stringify(permisosObj, null, 2));
      }

      // Normalizar permisos de formato granular a array de { modulo, accion }
      const normalizedPermissions = [];
      
      if (!permisosObj) {
        console.warn('⚠️ [usePermissions] permisosObj es null o undefined');
        console.warn('💡 [usePermissions] El backend debe enviar los permisos. El usuario no tendrá acceso.');
        setPermissions([]);
        setLoading(false);
        return;
      }
      
      if (typeof permisosObj === 'object' && !Array.isArray(permisosObj)) {
        // Formato granular: { "usuarios": { "crear": true, "leer": true, ... } }
        console.log('🔄 [usePermissions] Procesando permisos en formato granular. Módulos encontrados:', Object.keys(permisosObj));
        
        // Verificar si el objeto de permisos tiene algún permiso activo
        const hasAnyPermission = Object.keys(permisosObj).some(moduloKey => {
          const moduloPermisos = permisosObj[moduloKey];
          if (moduloPermisos && typeof moduloPermisos === 'object') {
            return Object.values(moduloPermisos).some(value => value === true);
          }
          return false;
        });
        
        if (!hasAnyPermission) {
          console.warn('⚠️ [usePermissions] Objeto de permisos no tiene permisos activos. El usuario no tendrá acceso.');
          console.warn('💡 [usePermissions] Los permisos deben estar asignados en la base de datos del backend.');
        }
        
        Object.keys(permisosObj).forEach(moduloKey => {
          const moduloPermisos = permisosObj[moduloKey];
          console.log(`🔍 [usePermissions] Procesando módulo "${moduloKey}":`, moduloPermisos);
          
          if (moduloPermisos && typeof moduloPermisos === 'object') {
            // Mapear nombres de módulos del frontend a nombres del backend
            const moduloBackend = mapModuloToBackend(moduloKey);
            console.log(`🔄 [usePermissions] Módulo "${moduloKey}" mapeado a "${moduloBackend}"`);
            
            // Extraer acciones activas
            const acciones = ['crear', 'leer', 'actualizar', 'editar', 'eliminar'];
            acciones.forEach(accion => {
              // Verificar si la acción está activa (true)
              if (moduloPermisos[accion] === true) {
                const accionNormalizada = accion === 'actualizar' ? 'editar' : accion;
                normalizedPermissions.push({
                  modulo: moduloBackend,
                  accion: accionNormalizada
                });
                console.log(`✅ [usePermissions] Permiso agregado: ${moduloBackend} - ${accionNormalizada}`);
              }
            });
          }
        });
      } else if (Array.isArray(permisosObj)) {
        // Formato array (fallback)
        console.log('🔄 [usePermissions] Procesando permisos en formato array');
        permisosObj.forEach(permiso => {
          if (typeof permiso === 'string') {
            normalizedPermissions.push({ modulo: permiso, accion: 'leer' });
          } else if (permiso && typeof permiso === 'object') {
            normalizedPermissions.push({
              modulo: permiso.modulo || permiso.nombre_modulo || permiso.module,
              accion: permiso.accion || permiso.nombre_accion || permiso.action || 'leer'
            });
          }
        });
      } else {
        console.warn('⚠️ [usePermissions] Formato de permisos desconocido:', typeof permisosObj);
      }

      // Si después de normalizar no hay permisos, el usuario no tendrá acceso
      if (normalizedPermissions.length === 0) {
        console.warn('⚠️ [usePermissions] No se encontraron permisos después de normalizar. El usuario no tendrá acceso.');
        console.warn('💡 [usePermissions] Los permisos deben estar asignados en la base de datos del backend.');
      }

      setPermissions(normalizedPermissions);
      console.log('✅ [usePermissions] Permisos normalizados cargados:', normalizedPermissions);
      console.log(`📊 [usePermissions] Total de permisos: ${normalizedPermissions.length}`);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      setError(error.message);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [getRoleIdFromToken]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} modulo - Nombre del módulo (ej: 'gestion_usuarios', 'gestion_solicitudes')
   * @param {string} accion - Acción (ej: 'crear', 'leer', 'editar', 'eliminar')
   * @returns {boolean} - true si tiene el permiso
   */
  const hasPermission = useCallback((modulo, accion) => {
    console.log(`🔍 [hasPermission] Verificando permiso: ${modulo} - ${accion}`);
    console.log(`📋 [hasPermission] Permisos cargados:`, permissions);
    
    if (!permissions || permissions.length === 0) {
      console.warn('⚠️ [hasPermission] No hay permisos cargados');
      // Si no hay permisos cargados, verificar si es administrador
      // Los administradores tienen acceso total automático según el backend
      const token = getToken();
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const idRol = payload.id_rol || payload.idRol;
            // ID 1 = Administrador según la documentación
            if (idRol === 1 || idRol === '1') {
              console.log('✅ [hasPermission] Usuario es admin, acceso permitido');
              return true;
            }
          }
        } catch (error) {
          console.error('❌ [hasPermission] Error al verificar rol:', error);
        }
      }
      console.log('❌ [hasPermission] No tiene permiso (sin permisos cargados y no es admin)');
      return false;
    }

    // Normalizar la acción: 'editar' -> 'editar' (ya está normalizado en loadPermissions)
    const accionNormalizada = accion === 'actualizar' ? 'editar' : accion;
    
    const tienePermiso = permissions.some(p => {
      const moduloMatch = p.modulo === modulo;
      const accionMatch = p.accion === accionNormalizada || p.accion === accion;
      const match = moduloMatch && accionMatch;
      
      if (match) {
        console.log(`✅ [hasPermission] Permiso encontrado: ${p.modulo} - ${p.accion}`);
      }
      
      return match;
    });
    
    if (!tienePermiso) {
      console.log(`❌ [hasPermission] No se encontró permiso: ${modulo} - ${accionNormalizada}`);
      console.log(`📋 [hasPermission] Permisos disponibles:`, permissions.map(p => `${p.modulo} - ${p.accion}`));
    }
    
    return tienePermiso;
  }, [permissions]);

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param {Array} requiredPermissions - Array de { modulo, accion }
   * @returns {boolean} - true si tiene al menos uno
   */
  const hasAnyPermission = useCallback((requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return false;
    
    return requiredPermissions.some(({ modulo, accion }) => 
      hasPermission(modulo, accion)
    );
  }, [hasPermission]);

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {Array} requiredPermissions - Array de { modulo, accion }
   * @returns {boolean} - true si tiene todos
   */
  const hasAllPermissions = useCallback((requiredPermissions) => {
    if (!Array.isArray(requiredPermissions)) return false;
    
    return requiredPermissions.every(({ modulo, accion }) => 
      hasPermission(modulo, accion)
    );
  }, [hasPermission]);

  /**
   * Verifica si el usuario es administrador
   * Los administradores tienen acceso total automático
   * Verifica tanto por id_rol (1) como por nombre del rol ('administrador')
   */
  const isAdmin = useCallback(() => {
    const token = getToken();
    if (!token) return false;

    try {
      // Verificar desde el JWT token
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const idRol = payload.id_rol || payload.idRol;
        // ID 1 = Administrador según la documentación
        if (idRol === 1 || idRol === '1') {
          console.log('✅ [usePermissions] Usuario es admin (id_rol = 1)');
          return true;
        }
      }

      // También verificar desde el usuario almacenado en localStorage
      const user = getUser();
      
      if (user) {
        // Verificar por id_rol
        const userRoleId = user.id_rol || user.idRol || user.rol?.id || user.rol?.id_rol;
        if (userRoleId === 1 || userRoleId === '1') {
          console.log('✅ [usePermissions] Usuario es admin (id_rol desde user = 1)');
          return true;
        }

        // Verificar por nombre del rol
        const userRoleName = user.rol?.nombre || user.rol || user.role;
        if (userRoleName && (userRoleName.toLowerCase() === 'administrador' || userRoleName.toLowerCase() === 'admin')) {
          console.log('✅ [usePermissions] Usuario es admin (nombre del rol = administrador)');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ [usePermissions] Error al verificar si es admin:', error);
    }
    
    console.log('❌ [usePermissions] Usuario NO es admin');
    return false;
  }, []);

  // Cargar permisos al montar el componente
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    refreshPermissions: loadPermissions
  };
};

