import React, { useState, useEffect } from "react";
import { AlertService } from '../../../../../shared/styles/alertStandards.js';
import seguimientoApiService from '../services/seguimientoApiService';
import { useAuth } from '../../../../../shared/contexts/authContext';

const Seguimiento = ({ isOpen, onClose, solicitudId, onGuardar }) => {
  const { getToken } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState("");
  const [cambiarEstado, setCambiarEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [cargandoEstados, setCargandoEstados] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [estadoActual, setEstadoActual] = useState("");

  useEffect(() => {
    if (isOpen && solicitudId) {
      setTitulo("");
      setDescripcion("");
      setObservaciones("");
      setDocumentosAdjuntos("");
      setCambiarEstado(false);
      setEstadoSeleccionado("");
      cargarEstadosDisponibles(); // También carga estado actual
      cargarHistorial();
    }
  }, [isOpen, solicitudId]);

  const cargarEstadosDisponibles = async () => {
    if (!solicitudId) return;
    
    setCargandoEstados(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('❌ [Seguimiento] No hay token para cargar estados');
        return;
      }
      
      console.log('🔧 [Seguimiento] Cargando estados disponibles para solicitud:', solicitudId);
      const resultado = await seguimientoApiService.getEstadosDisponibles(solicitudId, token);
      console.log('✅ [Seguimiento] Estados cargados:', resultado);
      
      // El resultado viene con success, data, etc. Según la guía
      // puede ser un array directo o venir envuelto
      if (Array.isArray(resultado)) {
        setEstadosDisponibles(resultado);
      } else if (resultado.success && resultado.data) {
        setEstadosDisponibles(resultado.data.estados_disponibles || []);
        // También obtener el estado actual desde el mismo endpoint
        setEstadoActual(resultado.data.estado_actual || 'No especificado');
      } else {
        setEstadosDisponibles([]);
      }
    } catch (error) {
      console.error('❌ [Seguimiento] Error cargando estados:', error);
      setEstadosDisponibles([]);
    } finally {
      setCargandoEstados(false);
    }
  };

  const cargarHistorial = async () => {
    if (!solicitudId) return;
    
    setCargandoHistorial(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('❌ [Seguimiento] No hay token para cargar historial');
        return;
      }
      
      console.log('🔧 [Seguimiento] Cargando historial para solicitud:', solicitudId);
      const historialData = await seguimientoApiService.getHistorial(solicitudId, token);
      console.log('✅ [Seguimiento] Historial cargado:', historialData);
      
      // El historial viene como array de objetos
      setHistorial(historialData || []);
    } catch (error) {
      console.error('❌ [Seguimiento] Error cargando historial:', error);
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };


  const handleGuardar = () => {
    // Validaciones
    if (!titulo.trim()) {
      AlertService.error("Título requerido", "Por favor, ingresa un título para el seguimiento.");
      return;
    }
    
    if (titulo.length > 200) {
      AlertService.error("Título muy largo", "El título no puede exceder 200 caracteres.");
      return;
    }

    if (!descripcion.trim()) {
      AlertService.error("Descripción requerida", "Por favor, escribe una descripción para el seguimiento.");
      return;
    }

    if (cambiarEstado && !estadoSeleccionado) {
      AlertService.error("Estado requerido", "Si decides cambiar el estado, debes seleccionar uno.");
      return;
    }

    // Pasar objeto con todos los datos según la guía
    const datos = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
    };

    // Campos opcionales según la guía
    if (observaciones.trim()) {
      datos.observaciones = observaciones.trim();
    }

    if (documentosAdjuntos.trim()) {
      datos.documentos_adjuntos = documentosAdjuntos.trim();
    }

    // Si hay cambio de estado, agregar nuevo_proceso (nombre exacto del estado)
    if (cambiarEstado && estadoSeleccionado) {
      datos.nuevo_proceso = estadoSeleccionado.trim();
    }

    onGuardar(datos);
    setTitulo("");
    setDescripcion("");
    setObservaciones("");
    setDocumentosAdjuntos("");
    setCambiarEstado(false);
    setEstadoSeleccionado("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-clipboard-check text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Agregar Seguimiento</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <i className="bi bi-x-lg text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Estado Actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <i className="bi bi-info-circle text-blue-600"></i>
              <span className="text-sm font-semibold text-gray-700">Estado Actual:</span>
            </div>
            {cargandoEstados ? (
              <div className="text-sm text-gray-600">Cargando...</div>
            ) : (
              <div className="text-sm font-medium text-blue-800">{estadoActual || 'No especificado'}</div>
            )}
          </div>

          {/* Historial */}
          {historial.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <i className="bi bi-clock-history text-gray-600"></i>
                <span className="text-sm font-semibold text-gray-700">Historial de Seguimiento</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {historial.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800">{item.titulo || 'Sin título'}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.descripcion || item.observaciones || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <i className="bi bi-person text-gray-400 text-xs"></i>
                        <span className="text-xs text-gray-600">
                          {item.usuario_registro ? `${item.usuario_registro.nombre} ${item.usuario_registro.apellido}` : item.nombre || 'Usuario'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="bi bi-calendar text-gray-400 text-xs"></i>
                        <span className="text-xs text-gray-600">
                          {item.fecha_registro ? new Date(item.fecha_registro).toLocaleString('es-CO') : 'Sin fecha'}
                        </span>
                      </div>
                    </div>
                    {item.nuevo_estado && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <i className="bi bi-arrow-right-circle text-gray-400 text-xs"></i>
                          <span className="text-xs text-gray-600">
                            Nuevo estado: <span className="font-semibold text-blue-600">{item.nuevo_estado}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cargandoHistorial && (
            <div className="text-center py-4 text-gray-500">
              <i className="bi bi-hourglass-split text-2xl animate-spin"></i>
              <p className="text-sm mt-2">Cargando historial...</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-4">
            <div className="flex items-center justify-center -mt-3">
              <span className="bg-white px-4 text-sm font-semibold text-gray-600">Nuevo Seguimiento</span>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Seguimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Ej: Revisión de documentos, Seguimiento de estado..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {titulo.length}/200 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="6"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Describe los avances o comentarios sobre el seguimiento del proceso..."
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones <span className="text-gray-500 text-xs">(Opcional)</span>
            </label>
            <textarea
              rows="4"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Observaciones adicionales (ej: No se presentaron observaciones, todo correcto)..."
            />
          </div>

          {/* Documentos Adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos Adjuntos <span className="text-gray-500 text-xs">(Opcional)</span>
            </label>
            <input
              type="text"
              value={documentosAdjuntos}
              onChange={(e) => setDocumentosAdjuntos(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="URLs separadas por comas: https://ejemplo.com/doc1.pdf,https://ejemplo.com/doc2.pdf"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa las URLs de los documentos separadas por comas
            </p>
          </div>

          {/* Cambio de Estado */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="cambiar-estado"
                checked={cambiarEstado}
                onChange={(e) => setCambiarEstado(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="cambiar-estado" className="text-sm font-medium text-gray-700">
                ¿Cambiar estado del proceso?
              </label>
            </div>

            {cambiarEstado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={estadoSeleccionado}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={cargandoEstados}
                >
                  <option value="">Seleccionar estado...</option>
                  {estadosDisponibles.map((estado, idx) => (
                    <option key={idx} value={estado.nombre}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
                {cargandoEstados && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cargando estados disponibles...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Guardar Seguimiento
          </button>
        </div>
      </div>
    </div>
  );
};

export default Seguimiento;

