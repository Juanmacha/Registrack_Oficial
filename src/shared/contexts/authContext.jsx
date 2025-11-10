import React, { createContext, useContext, useState, useEffect } from 'react';
import authApiService from '../../features/auth/services/authApiService.js';
import userApiService from '../../features/auth/services/userApiService.js';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth debe ser usado dentro de un AuthProvider');
    // Retornar valores por defecto en lugar de lanzar error
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false, message: 'Contexto no disponible' }),
      logout: () => {},
      updateUser: async () => ({ success: false, message: 'Contexto no disponible' }),
      isAuthenticated: () => false,
      hasRole: () => false,
      hasAnyRole: () => false,
      hasPermission: () => false,
      isAdmin: () => false,
      isEmployee: () => false,
      isClient: () => false,
      setToken: () => {},
      getToken: () => null,
      removeToken: () => {},
      getUser: () => null
    };
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_KEY = "token";
  const USERS_KEY = "usuarios_mock";

  // Función para decodificar JWT
  const decodeToken = (token) => {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  // Función para generar JWT simple (para desarrollo)
  const generateToken = (userData) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      id: userData.id,
      name: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.name,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      documentType: userData.documentType,
      documentNumber: userData.documentNumber,
      estado: userData.estado,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    }));
    const signature = btoa("mock-signature"); // En producción usar una firma real
    return `${header}.${payload}.${signature}`;
  };

  // Verificar si hay un usuario logueado al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Usar el servicio de autenticación real
        if (authApiService.isAuthenticated()) {
          const currentUser = authApiService.getCurrentUser();
          console.log('🔍 [AuthContext] Usuario cargado desde localStorage:', currentUser);
          if (currentUser) {
            console.log('🔍 [AuthContext] Rol del usuario:', currentUser.rol || currentUser.role);
          }
          setUser(currentUser);
        } else {
          // Limpiar datos si no está autenticado
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar el estado de autenticación:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Función para iniciar sesión con email y password
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 [AuthContext] Iniciando login...');
      
      // Usar el servicio de autenticación real
      const result = await authApiService.login({ email, password });
      
      console.log('📥 [AuthContext] Resultado del login:', result);
      
      if (result.success) {
        console.log('✅ [AuthContext] Login exitoso, actualizando estado del usuario:', result.user);
        setUser(result.user);
        console.log('✅ [AuthContext] Estado del usuario actualizado en el contexto');
        return { success: true, user: result.user, message: result.message };
      } else {
        console.log('❌ [AuthContext] Login falló:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('💥 [AuthContext] Error en login:', error);
      return { success: false, message: "Error al iniciar sesión" };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Usar el servicio de autenticación real
    authApiService.logout();
    setUser(null);
  };

  // Función para actualizar datos del usuario
  const updateUser = async (updatedUserData) => {
    try {
      setLoading(true);
      
      // Obtener el usuario actual antes de actualizar para preservar el rol
      const currentUser = authApiService.getCurrentUser();
      
      // Usar el servicio de usuarios real
      const result = await userApiService.updateProfile(updatedUserData);
      
      if (result.success) {
        // Asegurar que el rol se preserve si no viene en la respuesta
        const updatedUser = result.user || {};
        if (currentUser && currentUser.rol && !updatedUser.rol) {
          updatedUser.rol = currentUser.rol;
        }
        if (currentUser && currentUser.role && !updatedUser.role && !updatedUser.rol) {
          updatedUser.role = currentUser.role;
        }
        
        // Actualizar el usuario en el contexto
        setUser(updatedUser);
        
        // También actualizar en localStorage para mantener consistencia
        if (updatedUser) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        console.log('✅ [AuthContext] Usuario actualizado:', updatedUser);
        
        return { success: true, user: updatedUser, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { success: false, message: "Error al actualizar usuario" };
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return authApiService.isAuthenticated();
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user && (user.rol === role || user.role === role);
  };

  // Verificar si el usuario tiene uno de varios roles
  const hasAnyRole = (roles) => {
    return user && (roles.includes(user.rol) || roles.includes(user.role));
  };

  // Verificar permisos específicos
  const hasPermission = (resource, action) => {
    return authApiService.hasPermission(resource, action);
  };

  // Verificar si es administrador
  const isAdmin = () => {
    return authApiService.isAdmin();
  };

  // Verificar si es empleado
  const isEmployee = () => {
    return authApiService.isEmployee();
  };

  // Verificar si es cliente
  const isClient = () => {
    return authApiService.isClient();
  };

  // Funciones compatibles con authData
  const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    const decoded = decodeToken(token);
    setUser(decoded);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const removeToken = () => {
    logout();
  };

  const getUser = () => {
    return user;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAdmin,
    isEmployee,
    isClient,
    // Funciones compatibles con authData
    setToken,
    getToken,
    removeToken,
    getUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exportar el contexto para uso directo si es necesario
export { AuthContext };
export default AuthContext;