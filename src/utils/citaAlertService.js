import alertService from "./alertService.js";
import { CommonAlerts, AlertService } from "../shared/styles/alertStandards.js";

const citaAlertService = {
  // Alerta de fecha no válida
  fechaNoValida: () => {
    return AlertService.warning(
      "Fecha no válida",
      "No se pueden agendar citas en fechas anteriores a hoy. Por favor, seleccione una fecha futura."
    );
  },

  // Alerta de cita agendada exitosamente
  citaAgendada: () => {
    return AlertService.success(
      "Cita agendada exitosamente",
      "La cita ha sido programada correctamente. Recibirás una confirmación por correo electrónico."
    );
  },

  // Alerta de cita reprogramada exitosamente
  citaReprogramada: () => {
    return AlertService.success(
      "Cita reprogramada exitosamente",
      "La cita ha sido reprogramada correctamente. Se ha enviado una notificación al cliente."
    );
  },

  // Alerta de cita anulada exitosamente
  citaAnulada: () => {
    return AlertService.success(
      "Cita anulada exitosamente",
      "La cita ha sido anulada correctamente. Se ha notificado al cliente sobre la cancelación."
    );
  },

  // Confirmación para anular cita
  confirmarAnulacion: () => {
    return AlertService.confirm(
      "Confirmar anulación de cita",
      "¿Está seguro de que desea anular esta cita? Esta acción no se puede deshacer y se notificará al cliente.",
      {
        confirmButtonText: "Sí, anular cita",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ef4444",
      }
    );
  },

  // Confirmación para reprogramar cita
  confirmarReprogramacion: () => {
    return AlertService.confirm(
      "Confirmar reprogramación de cita",
      "¿Está seguro de que desea reprogramar esta cita? Se enviará una notificación al cliente con la nueva fecha y hora.",
      {
        confirmButtonText: "Sí, reprogramar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#f59e0b",
      }
    );
  },

  // Alerta de error al procesar cita
  errorProcesarCita: () => {
    return AlertService.error(
      "Error al procesar cita",
      "No se pudo procesar la solicitud de cita. Por favor, verifique los datos e intente nuevamente."
    );
  },

  // Alerta de error al anular cita
  errorAnularCita: () => {
    return AlertService.error(
      "Error al anular cita",
      "No se pudo anular la cita. Por favor, intente nuevamente o contacte al soporte técnico."
    );
  },

  // Alerta de error al reprogramar cita
  errorReprogramarCita: () => {
    return AlertService.error(
      "Error al reprogramar cita",
      "No se pudo reprogramar la cita. Por favor, intente nuevamente o contacte al soporte técnico."
    );
  },

  // Alerta de validación de campos
  validacionCampos: (campo) => {
    return alertService.validationError(
      `Por favor, complete el campo: ${campo}`
    );
  },

  // Alerta de conflicto de horarios
  conflictoHorarios: () => {
    return alertService.warning(
      "Conflicto de horarios",
      "Ya existe una cita programada en este horario. Por favor, seleccione otro horario."
    );
  },

  // Alerta de cita próxima
  citaProxima: (nombre, hora) => {
    return alertService.info(
      "Cita próxima",
      `Recordatorio: ${nombre} tiene una cita programada a las ${hora}.`
    );
  },

  // Alerta de cita vencida
  citaVencida: (nombre) => {
    return alertService.warning(
      "Cita vencida",
      `La cita de ${nombre} ha vencido. Por favor, reprograma o anula la cita.`
    );
  },

  // Alerta de carga para agendar cita
  cargandoAgendar: () => {
    return alertService.loading("Agendando cita...");
  },

  // Alerta de carga para reprogramar cita
  cargandoReprogramar: () => {
    return alertService.loading("Reprogramando cita...");
  },

  // Alerta de carga para anular cita
  cargandoAnular: () => {
    return alertService.loading("Anulando cita...");
  },

  // Alerta de éxito al exportar citas
  exportarExitoso: () => {
    return alertService.success(
      "Exportación exitosa",
      "Las citas han sido exportadas correctamente."
    );
  },

  // Alerta de error al exportar citas
  errorExportar: () => {
    return alertService.error(
      "Error de exportación",
      "Error al exportar las citas. Por favor, intente nuevamente."
    );
  },

  // Alerta de confirmación para eliminar múltiples citas
  confirmarEliminacionMultiple: (cantidad) => {
    return alertService.confirm(
      "Eliminar citas",
      `¿Está seguro de que desea eliminar ${cantidad} citas? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
      "Cancelar"
    );
  },

  // Alerta de éxito al eliminar múltiples citas
  eliminacionMultipleExitosa: (cantidad) => {
    return alertService.success(
      "Citas eliminadas",
      `${cantidad} citas han sido eliminadas correctamente.`
    );
  },

  // Alerta de información sobre el calendario
  infoCalendario: () => {
    return alertService.info(
      "Información del calendario",
      "• Citas programadas: Verde\n• Citas reprogramadas: Azul\n• Citas anuladas: Gris\n\nHaz clic en una fecha para agendar una nueva cita o en una cita existente para ver detalles."
    );
  },

  // Alerta de confirmación para limpiar calendario
  confirmarLimpiarCalendario: () => {
    return alertService.confirm(
      "Limpiar calendario",
      "¿Está seguro de que desea eliminar todas las citas del calendario? Esta acción no se puede deshacer.",
      "Sí, limpiar todo",
      "Cancelar"
    );
  },

  // Alerta de éxito al limpiar calendario
  calendarioLimpio: () => {
    return alertService.success(
      "Calendario limpio",
      "Todas las citas han sido eliminadas del calendario."
    );
  },
};

export default citaAlertService;
