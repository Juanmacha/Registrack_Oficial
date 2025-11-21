import Swal from "sweetalert2";
// Importar el nuevo sistema de alertas estandarizado
import { AlertService, CommonAlerts } from "../shared/styles/alertStandards.js";

// Mantener compatibilidad con el código existente
const customConfig = {
  confirmButtonColor: "#2563eb",
  cancelButtonColor: "#dc2626",
  background: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.4)",
  customClass: {
    popup: "rounded-xl shadow-2xl",
    title: "text-gray-800 font-semibold",
    content: "text-gray-600",
    confirmButton: "rounded-lg px-6 py-2 font-medium",
    cancelButton: "rounded-lg px-6 py-2 font-medium",
  },
};

const alertService = {
  // Usar el nuevo sistema estandarizado
  success: (title, message = "", options = {}) => {
    return AlertService.success(title, message, options);
  },

  error: (title, message = "", options = {}) => {
    return AlertService.error(title, message, options);
  },

  warning: (title, message = "", options = {}) => {
    return AlertService.warning(title, message, options);
  },

  info: (title, message = "", options = {}) => {
    return AlertService.info(title, message, options);
  },

  question: (title, message = "", options = {}) => {
    return AlertService.confirm(title, message, options);
  },

  // Confirmación personalizada
  confirm: (
    title,
    message = "",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    options = {}
  ) => {
    return AlertService.confirm("", "");
  },

  // Alerta de carga con spinner personalizado
  loading: (title = "Cargando...", options = {}) => {
    const text = options.text || title;
    return Swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      html: `
        <div class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mb-4"></div>
          <p class="text-gray-600">${text}</p>
        </div>
      `,
      ...customConfig,
      ...options,
    });
  },

  // Cerrar alerta
  close: () => {
    Swal.close();
  },

  // Cerrar todas las alertas
  closeAll: () => {
    Swal.close();
    // Forzar cierre si es necesario
    const swalContainers = document.querySelectorAll(".swal2-container");
    swalContainers.forEach((container) => {
      container.remove();
    });
  },

  // Verificar si hay alertas abiertas
  hasOpenAlerts: () => {
    return document.querySelectorAll(".swal2-popup").length > 0;
  },

  // Alerta de login exitoso
  loginSuccess: (userName) => {
    return CommonAlerts.loginSuccess(userName);
  },

  // Alerta de login fallido
  loginError: () => {
    return CommonAlerts.loginError();
  },

  // Alerta de registro exitoso
  registerSuccess: () => {
    return AlertService.success(
      "Registro exitoso",
      "Su cuenta ha sido creada correctamente. Por favor, inicie sesión para continuar."
    );
  },

  // Alerta de registro fallido
  registerError: (
    message = "Error al registrar el usuario. Por favor, intenta de nuevo."
  ) => {
    return AlertService.error("Error en el registro", message);
  },

  // Alerta de logout
  logoutConfirm: () => {
    return AlertService.confirm(
      "¿Cerrar sesión?",
      "¿Está seguro de que desea cerrar su sesión?"
    );
  },

  // Alerta de eliminación
  deleteConfirm: (itemName = "este elemento") => {
    return Swal.fire({
      icon: "warning",
      title: "¿Eliminar?",
      text: `¿Está seguro de que desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      ...customConfig,
    });
  },

  // Alerta de eliminación exitosa
  deleteSuccess: (itemName = "el elemento") => {
    return Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: `${itemName} ha sido eliminado correctamente.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // Alerta de guardado exitoso
  saveSuccess: (itemName = "los datos") => {
    return Swal.fire({
      icon: "success",
      title: "Guardado",
      text: `${itemName} han sido guardados correctamente.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // Alerta de error de guardado
  saveError: (
    message = "Error al guardar los datos. Por favor, intenta de nuevo."
  ) => {
    return AlertService.error("Error al guardar", "");
  },

  // Alerta de validación
  validationError: (message) => {
    return CommonAlerts.validationError(message);
  },

  // Alerta de acceso denegado
  accessDenied: () => {
    return CommonAlerts.accessDenied();
  },

  // Alerta de sesión expirada
  sessionExpired: () => {
    return CommonAlerts.sessionExpired();
  },

  // ✅ NUEVO: Alertas automáticas para cambios de estado
  saleStatusChanged: (saleData, oldStatus, newStatus) => {
    return Swal.fire({
      icon: "info",
      title: "Estado actualizado",
      text: `La solicitud "${saleData.marca}" ha cambiado de "${oldStatus}" a "${newStatus}"`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de cita próxima
  upcomingAppointment: (appointmentData) => {
    return Swal.fire({
      icon: "info",
      title: "Cita próxima",
      text: `Tienes una cita programada para ${appointmentData.fecha} a las ${appointmentData.horaInicio}`,
      confirmButtonText: "Ver detalles",
      showCancelButton: true,
      cancelButtonText: "Más tarde",
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de nueva solicitud
  newSaleCreated: (saleData) => {
    return Swal.fire({
      icon: "success",
      title: "Nueva solicitud",
      text: `Se ha creado una nueva solicitud para "${saleData.marca}"`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de pago recibido
  paymentReceived: (paymentData) => {
    return Swal.fire({
      icon: "success",
      title: "Pago recibido",
      text: `Se ha registrado un pago de $${paymentData.monto} por ${paymentData.metodo_pago}`,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de error de validación
  validationError: (errors) => {
    const errorMessages = Object.values(errors).join("\n");
    return AlertService.warning("Datos incompletos", "");
  },

  // ✅ NUEVO: Alerta de confirmación de eliminación
  confirmDelete: (itemName, itemType = "elemento") => {
    return Swal.fire({
      icon: "warning",
      title: "¿Eliminar?",
      text: `¿Está seguro de que desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de éxito de eliminación
  deleteSuccess: (itemName) => {
    return Swal.fire({
      icon: "success",
      title: "Eliminado",
      text: `${itemName} ha sido eliminado correctamente.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de confirmación de cancelación
  confirmCancel: (itemName, itemType = "elemento") => {
    return Swal.fire({
      icon: "question",
      title: "¿Cancelar?",
      text: `¿Está seguro de que desea cancelar ${itemName}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      ...customConfig,
    });
  },

  // ✅ NUEVO: Alerta de cancelación exitosa
  cancelSuccess: (itemName) => {
    return Swal.fire({
      icon: "success",
      title: "Cancelado",
      text: `${itemName} ha sido cancelado correctamente.`,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...customConfig,
    });
  },
};

export default alertService;
