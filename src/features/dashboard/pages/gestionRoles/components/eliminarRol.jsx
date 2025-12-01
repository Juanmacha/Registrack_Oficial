import Swal from "sweetalert2";
import rolesApiService from "../services/rolesApiService";

const eliminarRol = async (rolId, roles, setRoles, loadRoles) => {
  const confirmado = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: 'rounded-2xl shadow-2xl border-t-4 border-t-yellow-500',
      title: 'text-gray-800 font-bold text-2xl mb-4',
      content: 'text-gray-600 text-base mb-6',
      confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white',
      cancelButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#6b7280] hover:bg-[#4b5563] border border-[#6b7280] text-white'
    }
  });

  if (confirmado.isConfirmed) {
    try {
      console.log(`🔄 [EliminarRol] Eliminando rol con ID: ${rolId}`);
      await rolesApiService.deleteRole(rolId);
      console.log('✅ [EliminarRol] Rol eliminado exitosamente');
      
      // Recargar la lista de roles desde la API
      await loadRoles();
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El rol ha sido eliminado correctamente.',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
        }
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar rol',
        text: errorMessage,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    }
  }
};

export default eliminarRol;
