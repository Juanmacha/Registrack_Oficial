import React from "react";

// Función para extraer nombre del cliente (misma lógica que en tablaServicios)
const extraerNombreCliente = (datos) => {
  if (!datos) {
    console.log('⚠️ [Modal] No hay datos');
    return 'Cliente';
  }
  
  console.log('🔍 [Modal] Datos recibidos:', datos);
  console.log('🔍 [Modal] datos.cliente:', datos.cliente);
  console.log('🔍 [Modal] datos.datosCompletos:', datos.datosCompletos);
  
  let clienteNombre = null;
  
  // 0. PRIMERO: Intentar desde datosCompletos.cliente como string directo (caso más común en esta API)
  if (datos.datosCompletos?.cliente && typeof datos.datosCompletos.cliente === 'string' && datos.datosCompletos.cliente.trim() !== '') {
    clienteNombre = datos.datosCompletos.cliente.trim();
    console.log('✅ [Modal] Cliente encontrado (string directo en datosCompletos):', clienteNombre);
  }
  
  // 1. Intentar desde datos transformados (si no se encontró en datosCompletos)
  if (!clienteNombre && datos.cliente && typeof datos.cliente === 'string') {
    // Si es un valor válido (no es el genérico 'Cliente'), usarlo
    const clienteStr = datos.cliente.trim();
    if (clienteStr !== 'Cliente' && 
        clienteStr !== 'Cliente ID:' &&
        !clienteStr.startsWith('Cliente ID:')) {
      clienteNombre = clienteStr;
      console.log('✅ [Modal] Usando datos.cliente transformado:', clienteNombre);
    }
  }
  
  // 2. Intentar desde datosCompletos.cliente.usuario (cuando cliente es objeto)
  if (!clienteNombre && datos.datosCompletos?.cliente?.usuario) {
    if (datos.datosCompletos.cliente.usuario.nombre && datos.datosCompletos.cliente.usuario.apellido) {
      clienteNombre = `${datos.datosCompletos.cliente.usuario.nombre} ${datos.datosCompletos.cliente.usuario.apellido}`;
      console.log('✅ [Modal] Cliente desde usuario (nombre + apellido):', clienteNombre);
    } else if (datos.datosCompletos.cliente.usuario.nombre) {
      clienteNombre = datos.datosCompletos.cliente.usuario.nombre;
      console.log('✅ [Modal] Cliente desde usuario (nombre):', clienteNombre);
    } else if (datos.datosCompletos.cliente.usuario.correo) {
      clienteNombre = datos.datosCompletos.cliente.usuario.correo;
      console.log('✅ [Modal] Cliente desde usuario (correo):', clienteNombre);
    }
  }
  
  // 3. Intentar desde datosCompletos.cliente como objeto (nombre, razon_social, etc.)
  if (!clienteNombre && datos.datosCompletos?.cliente && typeof datos.datosCompletos.cliente === 'object') {
    if (datos.datosCompletos.cliente.nombre) {
      clienteNombre = datos.datosCompletos.cliente.nombre;
      console.log('✅ [Modal] Cliente desde cliente.nombre:', clienteNombre);
    } else if (datos.datosCompletos.cliente.razon_social) {
      clienteNombre = datos.datosCompletos.cliente.razon_social;
      console.log('✅ [Modal] Cliente desde cliente.razon_social:', clienteNombre);
    } else if (datos.datosCompletos.cliente.nombre_completo) {
      clienteNombre = datos.datosCompletos.cliente.nombre_completo;
      console.log('✅ [Modal] Cliente desde cliente.nombre_completo:', clienteNombre);
    }
  }
  
  // 4. Intentar campos directos en datosCompletos
  if (!clienteNombre && datos.datosCompletos) {
    clienteNombre = datos.datosCompletos.cliente_nombre || 
                   datos.datosCompletos.nombre_cliente ||
                   datos.datosCompletos.nombre_solicitante ||
                   datos.datosCompletos.cliente_nombre_completo;
    if (clienteNombre) {
      console.log('✅ [Modal] Cliente desde campos directos:', clienteNombre);
    }
  }
  
  // 5. Intentar desde orden_servicio.cliente si existe
  if (!clienteNombre && datos.datosCompletos?.orden_servicio?.cliente) {
    if (datos.datosCompletos.orden_servicio.cliente.usuario) {
      if (datos.datosCompletos.orden_servicio.cliente.usuario.nombre && datos.datosCompletos.orden_servicio.cliente.usuario.apellido) {
        clienteNombre = `${datos.datosCompletos.orden_servicio.cliente.usuario.nombre} ${datos.datosCompletos.orden_servicio.cliente.usuario.apellido}`;
        console.log('✅ [Modal] Cliente desde orden_servicio:', clienteNombre);
      }
    }
  }
  
  const resultado = clienteNombre || datos.cliente || 'Cliente';
  console.log('📋 [Modal] Nombre del cliente final:', resultado);
  return resultado;
};

const ModalDetalleServicio = ({ abierto, cerrar, datos }) => {
  if (!abierto || !datos) return null;
  
  // Extraer nombre del cliente
  const nombreCliente = extraerNombreCliente(datos);

  const getEstadoBadge = (estado) => {
    const estadoLower = (estado || "").toLowerCase();
    if (estadoLower.includes("proceso")) {
      return (
        <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full text-xs font-semibold">
          {estado}
        </span>
      );
    }
    if (estadoLower.includes("estudio")) {
      return (
        <span className="px-3 py-1 text-yellow-700 bg-yellow-100 rounded-full text-xs font-semibold">
          {estado}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full text-xs font-semibold">
        {estado}
      </span>
    );
  };

  return (
    <div className="modal-responsive">
      <div className="modal-content-responsive">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-info-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Detalle del Servicio</h2>
              <p className="text-sm text-gray-500">Servicio con inactividad prolongada</p>
            </div>
          </div>
          <button 
            onClick={cerrar}
            className="text-gray-900 hover:text-red-700 bg-gray-50"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Servicio */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Información del Servicio</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{datos.servicio || datos.datosCompletos?.servicio || 'Servicio'}</div>
                    <div className="text-sm text-gray-500">Cliente: {nombreCliente}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    {getEstadoBadge(datos.estado)}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles Adicionales */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Detalles Adicionales</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-person-badge text-gray-400"></i>
                  <span className="text-gray-600">Empleado Asignado:</span>
                  <span className="font-medium text-gray-800">
                    {(() => {
                      // Prioridad 1: datosCompletos.empleado_asignado (string directo)
                      if (datos.datosCompletos?.empleado_asignado && 
                          typeof datos.datosCompletos.empleado_asignado === 'string' &&
                          datos.datosCompletos.empleado_asignado.trim() !== '' &&
                          datos.datosCompletos.empleado_asignado !== 'Sin asignar') {
                        return datos.datosCompletos.empleado_asignado;
                      }
                      // Prioridad 2: datos transformados
                      if (datos.empleado && datos.empleado !== 'Sin asignar') {
                        return datos.empleado;
                      }
                      // Prioridad 3: datosCompletos.empleado.usuario
                      if (datos.datosCompletos?.empleado?.usuario) {
                        if (datos.datosCompletos.empleado.usuario.nombre && datos.datosCompletos.empleado.usuario.apellido) {
                          return `${datos.datosCompletos.empleado.usuario.nombre} ${datos.datosCompletos.empleado.usuario.apellido}`;
                        } else if (datos.datosCompletos.empleado.usuario.nombre) {
                          return datos.datosCompletos.empleado.usuario.nombre;
                        }
                      }
                      // Prioridad 4: campos directos
                      return datos.datosCompletos?.empleado_nombre ||
                             datos.datosCompletos?.nombre_empleado ||
                             datos.datosCompletos?.empleado?.nombre ||
                             datos.empleadoAsignado ||
                             datos.empleado ||
                             'Sin asignar';
                    })()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-clock-history text-gray-400"></i>
                  <span className="text-gray-600">Tiempo de Inactividad:</span>
                  <span className="font-medium text-gray-800">
                    {(() => {
                      // Prioridad 1: datos transformados
                      if (datos.inactividad && datos.inactividad !== 0) {
                        return `${datos.inactividad} días`;
                      }
                      // Prioridad 2: datosCompletos
                      const dias = datos.datosCompletos?.dias_inactivos || 
                                  datos.datosCompletos?.dias_sin_actualizar || 
                                  datos.datosCompletos?.dias_inactividad ||
                                  datos.datosCompletos?.dias ||
                                  datos.dias_inactivos ||
                                  datos.dias_sin_actualizar ||
                                  datos.dias_inactividad ||
                                  datos.dias ||
                                  0;
                      return dias > 0 ? `${dias} días` : 'N/A días';
                    })()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <i className="bi bi-exclamation-triangle text-yellow-400"></i>
                  <span className="text-gray-600">Alerta:</span>
                  <span className="font-medium text-yellow-700">Inactividad Prolongada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={cerrar}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleServicio; 