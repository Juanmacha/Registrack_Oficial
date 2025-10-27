// Configuración de la API
const API_CONFIG = {
  // URL base de la API desplegada
  baseURL: 'https://api-registrack-2.onrender.com',
  BASE_URL: 'https://api-registrack-2.onrender.com',
  
  // Endpoints de autenticación
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/api/usuarios/login',
    REGISTER: '/api/usuarios/registrar',
    FORGOT_PASSWORD: '/api/usuarios/forgot-password',
    RESET_PASSWORD: '/api/usuarios/reset-password',
    
    // Usuarios
    USERS: '/api/usuarios',
    CREATE_USER: '/api/usuarios/crear',
    USER_BY_ID: (id) => `/api/usuarios/${id}`,
    
    // Servicios
    SERVICES: '/api/servicios',
    SERVICE_BY_ID: (id) => `/api/servicios/${id}`,
    SERVICE_PROCESSES: (id) => `/api/servicios/${id}/procesos`,
    
    // Solicitudes
    REQUESTS: '/api/gestion-solicitudes',
    CREATE_REQUEST: (service) => `/api/gestion-solicitudes/crear/${encodeURIComponent(service)}`,
    MY_REQUESTS: '/api/gestion-solicitudes/mias',
    SEARCH_REQUESTS: '/api/gestion-solicitudes/buscar',
    REQUEST_BY_ID: (id) => `/api/gestion-solicitudes/${id}`,
    EDIT_REQUEST: (id) => `/api/gestion-solicitudes/editar/${id}`,
    CANCEL_REQUEST: (id) => `/api/gestion-solicitudes/anular/${id}`,
    
    // Citas
    APPOINTMENTS: '/api/gestion-citas',
    RESCHEDULE_APPOINTMENT: (id) => `/api/gestion-citas/${id}/reprogramar`,
    CANCEL_APPOINTMENT: (id) => `/api/gestion-citas/${id}/anular`,
    APPOINTMENTS_REPORT: '/api/gestion-citas/reporte/excel',
    
    // Solicitudes de Citas
    APPOINTMENT_REQUESTS: '/api/gestion-solicitud-cita',
    CREATE_APPOINTMENT_REQUEST: '/api/gestion-solicitud-cita',
    MY_APPOINTMENT_REQUESTS: '/api/gestion-solicitud-cita/mis-solicitudes',
    MANAGE_APPOINTMENT_REQUEST: (id) => `/api/gestion-solicitud-cita/${id}/gestionar`,
    
    // Seguimiento
    TRACKING: '/api/seguimiento',
    TRACKING_HISTORY: (id) => `/api/seguimiento/historial/${id}`,
    CREATE_TRACKING: '/api/seguimiento/crear',
    TRACKING_BY_ID: (id) => `/api/seguimiento/${id}`,
    SEARCH_TRACKING: (id) => `/api/seguimiento/buscar/${id}`,
    
    // Archivos
    FILES: '/api/archivos',
    UPLOAD_FILE: '/api/archivos/upload',
    DOWNLOAD_FILE: (id) => `/api/archivos/${id}/download`,
    CLIENT_FILES: (id) => `/api/archivos/cliente/${id}`,
    
    // Clientes
    CLIENTS: '/api/gestion-clientes',
    CLIENT_BY_ID: (id) => `/api/gestion-clientes/${id}`,
    CLIENT_UPDATE_EMPRESA: (id) => `/api/gestion-clientes/${id}/empresa`,
    CLIENT_UPDATE_USUARIO: (id) => `/api/gestion-clientes/${id}/usuario`,
    CLIENTS_REPORT: '/api/gestion-clientes/reporte/excel',
    
    // Pagos
    PAYMENTS: '/api/gestion-pagos',
    PAYMENT_BY_ID: (id) => `/api/gestion-pagos/${id}`,
    
    // Empresas
    COMPANIES: '/api/empresas',
    COMPANY_CLIENTS: (id) => `/api/empresas/${id}/clientes`,
    COMPANY_CLIENTS_BY_NIT: (nit) => `/api/empresas/nit/${nit}/clientes`,
    
    // Tipos de archivo
    FILE_TYPES: '/api/gestion-tipo-archivos',
    FILE_TYPE_BY_ID: (id) => `/api/gestion-tipo-archivos/${id}`,
    
    // Formularios dinámicos
    DYNAMIC_FORMS: '/api/formularios-dinamicos',
    FORM_BY_SERVICE: (id) => `/api/formularios-dinamicos/servicio/${id}`,
    VALIDATE_FORM: '/api/formularios-dinamicos/validar',
    
    // Empleados
    EMPLOYEES: '/api/gestion-empleados',
    EMPLOYEE_BY_ID: (id) => `/api/gestion-empleados/${id}`,
    EMPLOYEE_ESTADO: (id) => `/api/gestion-empleados/${id}/estado`,
    EMPLOYEES_REPORT: '/api/gestion-empleados/reporte/excel',
    
    // Roles y Permisos
    ROLES: '/api/gestion-roles',
    ROLE_BY_ID: (id) => `/api/gestion-roles/${id}`,
    ROLE_STATE: (id) => `/api/gestion-roles/${id}/state`,
    PERMISSIONS: '/api/gestion-permisos',
    PERMISSION_BY_ID: (id) => `/api/gestion-permisos/${id}`,
    PRIVILEGES: '/api/gestion-privilegios',
    PRIVILEGE_BY_ID: (id) => `/api/gestion-privilegios/${id}`
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,
  
  // Configuración de reintentos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Exportar tanto el objeto completo como propiedades individuales para compatibilidad
export default API_CONFIG;
export const apiConfig = API_CONFIG;
