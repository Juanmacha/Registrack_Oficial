// Sistema estandarizado de alertas y modales para el dashboard
import Swal from "sweetalert2";

// Configuración base para todas las alertas
const BASE_CONFIG = {
  background: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.4)",
  customClass: {
    popup: "rounded-2xl shadow-2xl border-0 p-8 text-center",
    title: "text-gray-800 font-bold text-2xl mb-4 mt-2",
    content: "text-gray-600 text-base leading-relaxed mb-6",
    confirmButton:
      "rounded-xl px-8 py-3 font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg",
    cancelButton:
      "rounded-xl px-8 py-3 font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg",
    actions: "gap-3 mt-6",
    icon: "w-20 h-20 mb-4 mx-auto",
  },
  showClass: {
    popup: "animate__animated animate__fadeInDown animate__faster",
    backdrop: "animate__animated animate__fadeIn animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutUp animate__faster",
    backdrop: "animate__animated animate__fadeOut animate__faster",
  },
  timer: 4000,
  timerProgressBar: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
  focusConfirm: false,
  focusCancel: false,
  width: "400px",
  padding: "2rem",
};

// Configuraciones específicas por tipo de alerta
const ALERT_TYPES = {
  success: {
    icon: "success",
    iconColor: "#10b981",
    confirmButtonColor: "#10b981",
    confirmButtonColor: "#059669",
    confirmButtonText: "Cerrar",
    timer: 3000,
    showConfirmButton: true,
  },

  error: {
    icon: "error",
    iconColor: "#ef4444",
    confirmButtonColor: "#ef4444",
    confirmButtonColor: "#dc2626",
    confirmButtonText: "Entendido",
    timer: 5000,
    showConfirmButton: true,
  },

  warning: {
    icon: "warning",
    iconColor: "#f59e0b",
    confirmButtonColor: "#f59e0b",
    confirmButtonColor: "#d97706",
    confirmButtonText: "Entendido",
    timer: 4000,
    showConfirmButton: true,
  },

  info: {
    icon: "info",
    iconColor: "#3b82f6",
    confirmButtonColor: "#3b82f6",
    confirmButtonColor: "#2563eb",
    confirmButtonText: "Entendido",
    timer: 4000,
    showConfirmButton: true,
  },

  question: {
    icon: "question",
    iconColor: "#ef4444",
    confirmButtonColor: "#ef4444",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    showConfirmButton: true,
    timer: null,
  },
};

// Mensajes estandarizados por contexto
const STANDARD_MESSAGES = {
  // Operaciones CRUD
  create: {
    success: "El registro ha sido creado exitosamente.",
    error:
      "No se pudo crear el registro. Por favor, verifique los datos e intente nuevamente.",
    confirm: "¿Estás seguro de que deseas crear este registro?",
  },

  update: {
    success: "Los cambios han sido guardados exitosamente.",
    error:
      "No se pudieron guardar los cambios. Por favor, verifique los datos e intente nuevamente.",
    confirm: "¿Estás seguro de que deseas guardar estos cambios?",
  },

  delete: {
    success: "El registro ha sido eliminado exitosamente.",
    error: "No se pudo eliminar el registro. Por favor, intente nuevamente.",
    confirm:
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
  },

  // Autenticación
  auth: {
    loginSuccess: "Sesión iniciada correctamente. Bienvenido al sistema.",
    loginError:
      "Credenciales incorrectas. Por favor, verifique su usuario y contraseña.",
    logoutSuccess: "Sesión cerrada correctamente. Hasta luego.",
    sessionExpired:
      "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
    accessDenied:
      "No tiene permisos para realizar esta acción. Contacte al administrador.",
  },

  // Validaciones
  validation: {
    requiredFields: "Por favor, complete todos los campos obligatorios.",
    invalidEmail:
      "Por favor, ingrese una dirección de correo electrónico válida.",
    invalidPhone: "Por favor, ingrese un número de teléfono válido.",
    invalidDate: "Por favor, seleccione una fecha válida.",
    passwordMismatch:
      "Las contraseñas no coinciden. Por favor, verifique e intente nuevamente.",
    weakPassword:
      "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.",
  },

  // Archivos
  files: {
    uploadSuccess: "Archivo subido correctamente.",
    uploadError: "Error al subir el archivo. Por favor, intente nuevamente.",
    downloadSuccess: "Descarga iniciada correctamente.",
    downloadError:
      "Error al descargar el archivo. Por favor, intente nuevamente.",
    deleteSuccess: "Archivo eliminado correctamente.",
    deleteError: "Error al eliminar el archivo. Por favor, intente nuevamente.",
  },

  // Sistema
  system: {
    loading: "Procesando...",
    networkError:
      "Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.",
    serverError: "Error del servidor. Por favor, intente más tarde.",
    maintenance:
      "El sistema está en mantenimiento. Por favor, intente más tarde.",
  },
};

// Función principal para mostrar alertas
export const showAlert = (type, title, text, options = {}) => {
  const alertConfig = {
    ...BASE_CONFIG,
    ...ALERT_TYPES[type],
    title,
    text,
    // Asegurar que el modal se cierre correctamente
    allowOutsideClick: true,
    allowEscapeKey: true,
    focusConfirm: false,
    focusCancel: false,
    // Forzar cierre al hacer clic en botones
    preConfirm: () => {
      return true;
    },
    // Asegurar que se cierre al confirmar
    didOpen: () => {
      // Agregar event listeners para asegurar el cierre
      const confirmBtn = document.querySelector(".swal2-confirm");
      const cancelBtn = document.querySelector(".swal2-cancel");

      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          setTimeout(() => Swal.close(), 100);
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          setTimeout(() => Swal.close(), 100);
        });
      }
    },
    ...options,
  };

  return Swal.fire(alertConfig);
};

// Servicio de alertas con métodos específicos
export const AlertService = {
  success: (title, text, options = {}) =>
    showAlert("success", title, text, options),

  error: (title, text, options = {}) =>
    showAlert("error", title, text, options),

  warning: (title, text, options = {}) =>
    showAlert("warning", title, text, options),

  info: (title, text, options = {}) => showAlert("info", title, text, options),

  confirm: (title, text, options = {}) =>
    showAlert("question", title, text, options),

  loading: (title = "Procesando...", text = "Por favor, espere...") =>
    Swal.fire({
      ...BASE_CONFIG,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    }),

  closeLoading: () => Swal.close(),
};

// Alertas comunes predefinidas
export const CommonAlerts = {
  // CRUD
  createSuccess: (entity = "registro") =>
    AlertService.success(
      "¡Éxito!",
      `El ${entity} ha sido creado exitosamente.`
    ),

  updateSuccess: (entity = "registro") =>
    AlertService.success(
      "¡Éxito!",
      `El ${entity} ha sido actualizado exitosamente.`
    ),

  deleteSuccess: (entity = "registro") =>
    AlertService.success(
      "¡Éxito!",
      `El ${entity} ha sido eliminado exitosamente.`
    ),

  deleteConfirm: (entity = "registro") =>
    AlertService.confirm(
      "¿Eliminar?",
      `¿Estás seguro de que deseas eliminar este ${entity}? Esta acción no se puede deshacer.`
    ),

  // Autenticación
  loginSuccess: (name = "Usuario") =>
    AlertService.success(
      "¡Bienvenido!",
      `Hola ${name}, has iniciado sesión correctamente.`
    ),

  loginError: () =>
    AlertService.error(
      "Error de acceso",
      "Credenciales incorrectas. Por favor, verifique su usuario y contraseña."
    ),

  logoutSuccess: () =>
    AlertService.success(
      "Sesión cerrada",
      "Has cerrado sesión correctamente. ¡Hasta luego!"
    ),

  // Validaciones
  validationError: (
    message = "Por favor, completa todos los campos obligatorios."
  ) => AlertService.warning("Campos requeridos", message),

  // Archivos
  fileUploadSuccess: (filename = "archivo") =>
    AlertService.success(
      "Archivo subido",
      `El archivo ${filename} ha sido subido correctamente.`
    ),

  fileUploadError: () =>
    AlertService.error(
      "Error de subida",
      "No se pudo subir el archivo. Por favor, intente nuevamente."
    ),

  // Sistema
  networkError: () =>
    AlertService.error(
      "Error de conexión",
      "No se pudo conectar con el servidor. Por favor, verifique su conexión a internet e intente nuevamente."
    ),

  serverError: () =>
    AlertService.error(
      "Error del servidor",
      "Ocurrió un error en el servidor. Por favor, intente más tarde."
    ),
};

export default AlertService;
