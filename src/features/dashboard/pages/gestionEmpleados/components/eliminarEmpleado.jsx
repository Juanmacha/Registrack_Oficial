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
        title: "Eliminando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
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
              <div style="text-align: left;">
                <p style="margin-bottom: 10px;"><strong>${errorMessage}</strong></p>
                ${errorDetails ? `<p style="margin-bottom: 10px; color: #666;">${errorDetails}</p>` : ''}
                <hr style="margin: 15px 0;">
                <p style="margin-bottom: 10px;"><strong>Acciones requeridas:</strong></p>
                <ul style="margin-left: 20px; margin-bottom: 10px;">
                  <li>Si tiene <strong>citas activas</strong>: Reprograme o cancele las citas primero</li>
                  <li>Si tiene <strong>solicitudes activas</strong>: Reasigne las solicitudes a otro empleado o finalice/anule primero</li>
                </ul>
              </div>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3085d6',
            width: '600px'
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
