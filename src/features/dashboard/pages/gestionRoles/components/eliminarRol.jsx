import { mostrarConfirmacion } from "../../../../../utils/alerts";
import notificationService from "../../../../../shared/services/NotificationService.js";
import rolesApiService from "../services/rolesApiService";
import alertService from "../../../../../utils/alertService.js";

const eliminarRol = async (rolId, roles, setRoles, loadRoles) => {
  const confirmado = await mostrarConfirmacion(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer.",
    "Sí, eliminar"
  );

  if (confirmado.isConfirmed) {
    try {
      console.log(`🔄 [EliminarRol] Eliminando rol con ID: ${rolId}`);
      await rolesApiService.deleteRole(rolId);
      console.log('✅ [EliminarRol] Rol eliminado exitosamente');
      
      // Recargar la lista de roles desde la API
      await loadRoles();
      notificationService.deleteSuccess('rol');
    } catch (error) {
      console.error('❌ [EliminarRol] Error eliminando rol:', error);
      
      // Extraer mensaje de error más descriptivo
      let errorMessage = 'Error al eliminar el rol';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      }
      
      // Mensajes específicos según el tipo de error
      if (error.status === 400) {
        // Si el mensaje del backend ya es descriptivo (contiene información sobre usuarios), usarlo directamente
        // Si no, proporcionar un mensaje genérico
        if (!errorMessage || 
            (!errorMessage.toLowerCase().includes('usuario') && 
             !errorMessage.toLowerCase().includes('asociado') &&
             !errorMessage.toLowerCase().includes('asignado') &&
             !errorMessage.toLowerCase().includes('usando'))) {
          errorMessage = errorMessage || 'No se puede eliminar el rol. Verifica que no tenga usuarios asociados.';
        }
        // Si el mensaje ya contiene información útil, mantenerlo tal cual
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para eliminar roles.';
      } else if (error.status === 404) {
        errorMessage = 'El rol no existe o ya fue eliminado.';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor al eliminar el rol. Por favor, intenta más tarde.';
      }
      
      // Mostrar alerta con el mensaje de error
      await alertService.error(
        "Error al eliminar rol",
        errorMessage
      );
    }
  }
};

export default eliminarRol;
