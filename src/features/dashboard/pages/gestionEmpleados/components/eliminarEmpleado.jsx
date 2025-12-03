import React from "react";
import Swal from "sweetalert2";

const EliminarEmpleado = ({ empleado, onEliminar }) => {
  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${empleado.nombre}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "",
        html: "",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
          // Ocultar todos los elementos excepto el loader
          setTimeout(() => {
            const popup = document.querySelector('.swal2-loading-popup');
            if (popup) {
              // Ocultar título
              const titleElement = popup.querySelector('.swal2-title');
              if (titleElement) titleElement.style.display = 'none';
              
              // Ocultar contenido
              const contentElements = popup.querySelectorAll('.swal2-content, .swal2-html-container, .swal2-text, .swal2-icon-container');
              contentElements.forEach(el => el.style.display = 'none');
              
              // Ocultar acciones
              const actionsElement = popup.querySelector('.swal2-actions');
              if (actionsElement) actionsElement.style.display = 'none';
            }
          }, 10);
        },
        customClass: {
          popup: 'swal2-loading-popup',
          title: 'swal2-loading-title-hidden'
        }
      });

      try {
        await onEliminar(empleado);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: `${empleado.nombre} fue eliminado exitosamente.`,
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        Swal.close();
        
        // Extraer mensaje de error más descriptivo
        let errorMessage = 'Error al eliminar el empleado';
        let errorDetails = '';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.error) {
          errorMessage = error.data.error;
        }
        
        // Si hay detalles adicionales, extraerlos
        if (error.data?.detalles) {
          errorDetails = error.data.detalles;
        }
        
        // Detectar si es un error de asignaciones activas
        const tieneAsignaciones = errorMessage.toLowerCase().includes('asignada') || 
                                 errorMessage.toLowerCase().includes('cita') || 
                                 errorMessage.toLowerCase().includes('solicitud') ||
                                 errorMessage.toLowerCase().includes('asignaciones activas');
        
        if (tieneAsignaciones) {
          // Mostrar alerta detallada con información sobre las asignaciones
          Swal.fire({
            icon: 'error',
            title: 'No se puede eliminar el empleado',
            html: `
              <div style="text-align: left; max-width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                <div>
                  <p style="margin-bottom: 4px; line-height: 1.3; font-size: 14px;"><strong>${errorMessage}</strong></p>
                  ${errorDetails ? `<p style="margin-bottom: 4px; color: #666; line-height: 1.3; font-size: 13px;">${errorDetails}</p>` : ''}
                  <p style="margin-top: 8px; color: #666; line-height: 1.3; font-size: 13px;">Debe resolver todas las asignaciones activas antes de eliminar el empleado.</p>
                </div>
                <div>
                  <p style="margin-bottom: 6px; font-weight: 600; font-size: 14px;"><strong>Acciones requeridas:</strong></p>
                  <ul style="margin-left: 16px; margin-bottom: 0; line-height: 1.4; font-size: 13px; padding: 0;">
                    <li>Si tiene <strong>citas activas</strong>: Reprograme o cancele las citas primero</li>
                    <li>Si tiene <strong>solicitudes activas</strong>: Reasigne las solicitudes a otro empleado o finalice/anule primero</li>
                  </ul>
                </div>
              </div>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3085d6',
            width: '1200px',
            padding: '1.25rem',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
              title: 'text-gray-800 font-bold text-lg mb-2',
              htmlContainer: 'text-gray-600 text-base mb-3 max-h-[40vh] overflow-y-auto',
              confirmButton: 'rounded-xl px-6 py-2 font-semibold text-sm',
              icon: 'swal2-error-icon'
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: errorMessage,
            confirmButtonColor: '#3085d6'
          });
        }
      }
    }
  };

  return (
    <button
      title="Eliminar"
      onClick={handleEliminar}
      className="btn btn-outline-danger btn-sm custom-hover rounded-circle p-0 d-flex align-items-center justify-center"
      style={{
        width: "32px",
        height: "32px",
        borderColor: "#dc3545",
        color: "#dc3545",
      }}
    >
      <i className="bi bi-trash-fill"></i>
    </button>
  );
};

export default EliminarEmpleado;
