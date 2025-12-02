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
      console.error('❌ [EliminarRol] Error completo:', JSON.stringify(error, null, 2));
      
      // Extraer mensaje de error más descriptivo
      let errorMessage = 'Error al eliminar el rol';
      let errorDetails = '';
      
      // Extraer mensaje desde diferentes estructuras de error
      if (error.message && error.message !== 'Error al eliminar el rol') {
        errorMessage = error.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.error?.message) {
        errorMessage = error.data.error.message;
      } else if (error.data?.error) {
        errorMessage = typeof error.data.error === 'string' ? error.data.error : errorMessage;
      }
      
      // Extraer detalles adicionales si existen (solo strings)
      if (error.data?.detalles) {
        if (typeof error.data.detalles === 'string') {
          errorDetails = error.data.detalles;
        }
      } else if (error.data?.error?.detalles) {
        if (typeof error.data.error.detalles === 'string') {
          errorDetails = error.data.error.detalles;
        }
      }
      
      // Detectar si es un error de usuarios/empleados asociados
      const tieneAsociaciones = error.status === 400 && (
        errorMessage.toLowerCase().includes('usuario') ||
        errorMessage.toLowerCase().includes('asociado') ||
        errorMessage.toLowerCase().includes('asignado') ||
        errorMessage.toLowerCase().includes('empleado') ||
        errorMessage.toLowerCase().includes('usando') ||
        error.data?.codigo === 'ROL_CON_USUARIOS' ||
        error.data?.error?.codigo === 'ROL_CON_USUARIOS'
      );
      
      // Mensajes específicos según el tipo de error
      if (error.status === 400) {
        if (tieneAsociaciones) {
          // Si el mensaje ya es descriptivo, usarlo; si no, proporcionar uno genérico
          if (!errorMessage || errorMessage === 'Error al eliminar el rol') {
            errorMessage = 'No se puede eliminar el rol. Tiene usuarios o empleados asociados. Por favor, reasigna los usuarios a otro rol antes de eliminar.';
          }
          // Agregar detalles solo si es un string válido
          if (errorDetails && typeof errorDetails === 'string' && errorDetails.trim()) {
            errorMessage = `${errorMessage}\n\n${errorDetails}`;
          }
        } else if (!errorMessage || errorMessage === 'Error al eliminar el rol') {
          errorMessage = 'No se puede eliminar el rol. Verifica que no tenga usuarios asociados.';
        }
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para eliminar roles.';
      } else if (error.status === 404) {
        errorMessage = 'El rol no existe o ya fue eliminado.';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor al eliminar el rol. Por favor, intenta más tarde.';
      }
      
      // Limpiar cualquier "[object Object]" que pueda haber quedado
      errorMessage = errorMessage.replace(/\[object Object\]/g, '').trim();
      
      // Mostrar alerta con el mensaje de error
      Swal.fire({
        icon: 'error',
        title: tieneAsociaciones ? 'No se puede eliminar el rol' : 'Error al eliminar rol',
        html: errorMessage.replace(/\n/g, '<br>'),
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          htmlContainer: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    }
  }
};

export default eliminarRol;
