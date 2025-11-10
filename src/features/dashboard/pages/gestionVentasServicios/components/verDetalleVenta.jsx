import React from "react";
import { getComentarios } from '../services/ventasService';
import Badge from '../../../../../shared/components/Badge';

// ✅ Helper para verificar si un valor está realmente vacío
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

// ✅ Helper para renderizar valor con fallback
const renderValue = (value, fallbackText = "No especificado") => {
  if (isEmpty(value)) {
    return <span className="italic text-gray-400">{fallbackText}</span>;
  }
  return value;
};

// ✅ Helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  try {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return fecha;
  }
};

// ✅ Helper para renderizar archivo descargable
const renderFileDownload = (file, label, filename) => {
  if (!file || (typeof file === 'string' && !file.startsWith('data:'))) {
    return <span className="italic text-gray-400">No disponible</span>;
  }
  
  if (typeof file === 'string' && file.startsWith('data:')) {
    return (
      <a
        href={file}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800 flex items-center space-x-1"
      >
        <i className="bi bi-download text-xs"></i>
        <span>Descargar {label}</span>
      </a>
    );
  }
  
  return <span className="text-gray-800">{file.name || file}</span>;
};

const VerDetalleVenta = ({ datos, isOpen, onClose }) => {
  // ✅ Guard clause: Si no hay datos, no renderizar nada
  if (!isOpen || !datos) {
    return null;
  }

  // Obtener comentarios de la venta
  const comentarios = getComentarios(datos.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-file-text text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Detalle de la Solicitud</h2>
              <p className="text-sm text-gray-500">Expediente: {datos?.expediente || 'No especificado'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Información del Titular/Representante */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="bi bi-person text-blue-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información del Titular</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${datos.titular || datos.nombreCompleto || 'Cliente'}`}
                    alt={datos.titular || datos.nombreCompleto || 'Cliente'}
                    className="w-16 h-16 rounded-full border-2 border-blue-300"
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-lg">{renderValue(datos.titular || datos.nombreCompleto)}</div>
                    <div className="text-sm text-gray-500">{renderValue(datos.email)}</div>
                    {datos.telefono && (
                      <div className="text-sm text-gray-500">{renderValue(datos.telefono)}</div>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-badge text-blue-500"></i>
                      <span className="text-gray-600">Tipo de Solicitante:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.tipoSolicitante || datos.tipoPersona)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-card-text text-blue-500"></i>
                      <span className="text-gray-600">Tipo de Documento:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.tipoDocumento)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-123 text-blue-500"></i>
                      <span className="text-gray-600">N° Documento:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.numeroDocumento)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-geo-alt text-blue-500"></i>
                      <span className="text-gray-600">Dirección:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.direccion)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-geo text-blue-500"></i>
                      <span className="text-gray-600">Ciudad:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.ciudad)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-globe text-blue-500"></i>
                      <span className="text-gray-600">País:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.pais)}</span>
                    </div>
                    {datos.codigo_postal || datos.codigoPostal ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-mailbox text-blue-500"></i>
                        <span className="text-gray-600">Código Postal:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.codigo_postal || datos.codigoPostal)}</span>
                      </div>
                    ) : null}
                    {datos.representanteLegal || datos.nombreRepresentante ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-person-check text-blue-500"></i>
                        <span className="text-gray-600">Representante Legal:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.representanteLegal || datos.nombreRepresentante)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Empresa (si aplica) */}
            {(datos.nombreEmpresa || datos.razonSocial || datos.nit || datos.tipoEntidad) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <i className="bi bi-building text-green-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información de la Empresa</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <i className="bi bi-building text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{renderValue(datos.nombreEmpresa || datos.razonSocial)}</div>
                      {datos.nit && (
                        <div className="text-sm text-gray-500">NIT: {renderValue(datos.nit)}</div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {datos.tipoEntidad && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-briefcase text-green-500"></i>
                          <span className="text-gray-600">Tipo de Entidad:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.tipoEntidad)}</span>
                        </div>
                      )}
                      {datos.razonSocial && datos.razonSocial !== datos.nombreEmpresa && (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-file-text text-green-500"></i>
                          <span className="text-gray-600">Razón Social:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.razonSocial)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de la Solicitud */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <i className="bi bi-file-earmark-text text-purple-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información de la Solicitud</h3>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-tag text-purple-500"></i>
                    <span className="text-gray-600">Estado:</span>
                    <Badge estado={datos.estado} tipo="solicitud" size="xs" />
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-briefcase text-purple-500"></i>
                    <span className="text-gray-600">Tipo de Solicitud:</span>
                    <span className="font-medium text-gray-800">{renderValue(datos.tipoSolicitud)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-person-check text-purple-500"></i>
                    <span className="text-gray-600">Encargado:</span>
                    <span className="font-medium text-gray-800">{renderValue(datos.encargado)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-calendar text-purple-500"></i>
                    <span className="text-gray-600">Fecha Solicitud:</span>
                    <span className="font-medium text-gray-800">{formatearFecha(datos.fechaSolicitud || datos.fechaCreacion)}</span>
                  </div>
                  {(datos.fechaFin || datos.fecha_finalizacion || datos.fecha_anulacion) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-calendar-check text-purple-500"></i>
                      <span className="text-gray-600">Fecha Fin:</span>
                      <span className="font-medium text-gray-800">{formatearFecha(datos.fechaFin || datos.fecha_finalizacion || datos.fecha_anulacion)}</span>
                    </div>
                  )}
                  {datos.proximaCita && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-calendar-event text-purple-500"></i>
                      <span className="text-gray-600">Próxima Cita:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.proximaCita)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="bi bi-hash text-purple-500"></i>
                    <span className="text-gray-600">ID Solicitud:</span>
                    <span className="font-medium text-gray-800">{renderValue(datos.id)}</span>
                  </div>
                  {datos.id_cliente && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person text-purple-500"></i>
                      <span className="text-gray-600">ID Cliente:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.id_cliente)}</span>
                    </div>
                  )}
                  {datos.id_empleado_asignado && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-person-badge text-purple-500"></i>
                      <span className="text-gray-600">ID Empleado:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.id_empleado_asignado)}</span>
                    </div>
                  )}
                  {datos.id_servicio && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-gear text-purple-500"></i>
                      <span className="text-gray-600">ID Servicio:</span>
                      <span className="font-medium text-gray-800">{renderValue(datos.id_servicio)}</span>
                    </div>
                  )}
                </div>
                {datos.motivoAnulacion && (
                  <div className="mt-3 pt-3 border-t border-purple-200 bg-red-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <i className="bi bi-exclamation-triangle text-red-500 mt-0.5"></i>
                      <div>
                        <span className="text-sm font-semibold text-red-700">Motivo de Anulación:</span>
                        <p className="text-sm text-red-600 mt-1">{datos.motivoAnulacion}</p>
                        {datos.fecha_anulacion && (
                          <span className="text-xs text-red-500">Fecha: {formatearFecha(datos.fecha_anulacion)}</span>
                        )}
                        {datos.anulado_por && (
                          <span className="text-xs text-red-500 ml-2">Anulado por ID: {datos.anulado_por}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de la Marca */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <i className="bi bi-award text-yellow-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Información de la Marca</h3>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <i className="bi bi-award text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-lg">{renderValue(datos.nombreMarca || datos.marca)}</div>
                    <div className="text-sm text-gray-500">Marca registrada</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="bi bi-tag text-yellow-500"></i>
                      <span className="text-gray-600">Categoría:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        datos.categoria === 'Productos' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {renderValue(datos.categoria)}
                      </span>
                    </div>
                    {datos.clase_niza || datos.claseNiza ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-123 text-yellow-500"></i>
                        <span className="text-gray-600">Clase Niza:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.clase_niza || datos.claseNiza)}</span>
                      </div>
                    ) : null}
                    {datos.numeroExpedienteMarca || datos.expediente ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-earmark text-yellow-500"></i>
                        <span className="text-gray-600">N° Expediente:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.numeroExpedienteMarca || datos.expediente)}</span>
                      </div>
                    ) : null}
                    {datos.marcaAOponerse || datos.marca_a_oponerse ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-shield-exclamation text-yellow-500"></i>
                        <span className="text-gray-600">Marca a Oponerse:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.marcaAOponerse || datos.marca_a_oponerse)}</span>
                      </div>
                    ) : null}
                    {datos.marcaOpositora || datos.marca_opositora ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-shield-slash text-yellow-500"></i>
                        <span className="text-gray-600">Marca Opositora:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.marcaOpositora || datos.marca_opositora)}</span>
                      </div>
                    ) : null}
                    {datos.numeroRegistroExistente || datos.numero_registro_existente ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-check text-yellow-500"></i>
                        <span className="text-gray-600">N° Registro:</span>
                        <span className="font-medium text-gray-800">{renderValue(datos.numeroRegistroExistente || datos.numero_registro_existente)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* Clases de la Marca */}
                {Array.isArray(datos.clases) && datos.clases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Clases de la Marca:</h4>
                    <div className="space-y-2">
                      {datos.clases.map((c, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-yellow-200">
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-circle-fill text-yellow-500 text-xs"></i>
                            <span className="font-medium">Clase {c.numero || 'N/A'}:</span>
                            <span className="text-gray-600">{c.descripcion || 'Sin descripción'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Clases Niza adicionales */}
                {(datos.claseNizaActual || datos.clase_niza_actual || datos.nuevasClasesNiza || datos.nuevas_clases_niza) && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {datos.claseNizaActual || datos.clase_niza_actual ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-arrow-right-circle text-yellow-500"></i>
                          <span className="text-gray-600">Clase Niza Actual:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.claseNizaActual || datos.clase_niza_actual)}</span>
                        </div>
                      ) : null}
                      {datos.nuevasClasesNiza || datos.nuevas_clases_niza ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-arrow-left-circle text-yellow-500"></i>
                          <span className="text-gray-600">Nuevas Clases:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.nuevasClasesNiza || datos.nuevas_clases_niza)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Archivos Adjuntos */}
            {(datos.certificadoCamara || datos.logotipoMarca || datos.poderRepresentante || datos.poderAutorizacion || 
              datos.certificadoRenovacion || datos.documentoCesion || datos.documentosOposicion || datos.soportes) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <i className="bi bi-paperclip text-indigo-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Archivos Adjuntos</h3>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {datos.certificadoCamara && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-pdf text-indigo-500"></i>
                        <span className="text-gray-600">Certificado Cámara:</span>
                        <div>{renderFileDownload(datos.certificadoCamara, 'Certificado', 'certificado_camara.pdf')}</div>
                      </div>
                    )}
                    {datos.logotipoMarca && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-image text-indigo-500"></i>
                        <span className="text-gray-600">Logotipo Marca:</span>
                        <div>{renderFileDownload(datos.logotipoMarca, 'Logotipo', 'logotipo_marca.png')}</div>
                      </div>
                    )}
                    {datos.poderRepresentante && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-text text-indigo-500"></i>
                        <span className="text-gray-600">Poder Representante:</span>
                        <div>{renderFileDownload(datos.poderRepresentante, 'Poder', 'poder_representante.pdf')}</div>
                      </div>
                    )}
                    {datos.poderAutorizacion && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-check text-indigo-500"></i>
                        <span className="text-gray-600">Poder Autorización:</span>
                        <div>{renderFileDownload(datos.poderAutorizacion, 'Autorización', 'poder_autorizacion.pdf')}</div>
                      </div>
                    )}
                    {datos.certificadoRenovacion && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-arrow-repeat text-indigo-500"></i>
                        <span className="text-gray-600">Certificado Renovación:</span>
                        <div>{renderFileDownload(datos.certificadoRenovacion, 'Renovación', 'certificado_renovacion.pdf')}</div>
                      </div>
                    )}
                    {datos.documentoCesion && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-earmark-arrow-down text-indigo-500"></i>
                        <span className="text-gray-600">Documento Cesión:</span>
                        <div>{renderFileDownload(datos.documentoCesion, 'Cesión', 'documento_cesion.pdf')}</div>
                      </div>
                    )}
                    {datos.documentosOposicion && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-file-earmark-excel text-indigo-500"></i>
                        <span className="text-gray-600">Documentos Oposición:</span>
                        <div>{renderFileDownload(datos.documentosOposicion, 'Oposición', 'documentos_oposicion.pdf')}</div>
                      </div>
                    )}
                    {datos.soportes && (
                      <div className="flex items-center space-x-2 text-sm">
                        <i className="bi bi-folder text-indigo-500"></i>
                        <span className="text-gray-600">Soportes:</span>
                        <div>{renderFileDownload(datos.soportes, 'Soportes', 'soportes.pdf')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Información Específica del Servicio */}
            {(datos.argumentosRespuesta || datos.argumentos_respuesta || 
              datos.descripcionNuevosProductosServicios || datos.descripcion_nuevos_productos_servicios ||
              datos.documentoNitTitular || datos.numeroNitCedula || 
              datos.nombreRazonSocialCesionario || datos.nitCesionario) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <i className="bi bi-info-circle text-teal-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Información Específica del Servicio</h3>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-4">
                  {datos.argumentosRespuesta || datos.argumentos_respuesta ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <i className="bi bi-chat-quote text-teal-500"></i>
                        <span>Argumentos de Respuesta</span>
                      </h4>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-teal-200">
                        {renderValue(datos.argumentosRespuesta || datos.argumentos_respuesta)}
                      </p>
                    </div>
                  ) : null}
                  {datos.descripcionNuevosProductosServicios || datos.descripcion_nuevos_productos_servicios ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <i className="bi bi-box-seam text-teal-500"></i>
                        <span>Descripción Nuevos Productos/Servicios</span>
                      </h4>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border border-teal-200">
                        {renderValue(datos.descripcionNuevosProductosServicios || datos.descripcion_nuevos_productos_servicios)}
                      </p>
                    </div>
                  ) : null}
                  {(datos.documentoNitTitular || datos.numeroNitCedula) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {datos.documentoNitTitular || datos.documento_nit_titular ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-file-earmark-text text-teal-500"></i>
                          <span className="text-gray-600">Documento/NIT Titular:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.documentoNitTitular || datos.documento_nit_titular)}</span>
                        </div>
                      ) : null}
                      {datos.numeroNitCedula || datos.numero_nit_cedula ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <i className="bi bi-123 text-teal-500"></i>
                          <span className="text-gray-600">N° NIT/Cédula:</span>
                          <span className="font-medium text-gray-800">{renderValue(datos.numeroNitCedula || datos.numero_nit_cedula)}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Campos del Cesionario */}
                  {(datos.nombreRazonSocialCesionario || datos.nombre_razon_social_cesionario || 
                    datos.nitCesionario || datos.nit_cesionario) && (
                    <div className="mt-4 pt-4 border-t border-teal-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <i className="bi bi-people text-teal-500"></i>
                        <span>Información del Cesionario</span>
                      </h4>
                      <div className="bg-white p-3 rounded border border-teal-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <i className="bi bi-building text-teal-500"></i>
                            <span className="text-gray-600">Nombre/Razón Social:</span>
                            <span className="font-medium text-gray-800">{renderValue(datos.nombreRazonSocialCesionario || datos.nombre_razon_social_cesionario || datos.nombreCesionario)}</span>
                          </div>
                          {datos.nitCesionario || datos.nit_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-hash text-teal-500"></i>
                              <span className="text-gray-600">NIT:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.nitCesionario || datos.nit_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.tipoDocumentoCesionario || datos.tipo_documento_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-card-text text-teal-500"></i>
                              <span className="text-gray-600">Tipo Documento:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.tipoDocumentoCesionario || datos.tipo_documento_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.numeroDocumentoCesionario || datos.numero_documento_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-123 text-teal-500"></i>
                              <span className="text-gray-600">N° Documento:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.numeroDocumentoCesionario || datos.numero_documento_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.correoCesionario || datos.correo_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-envelope text-teal-500"></i>
                              <span className="text-gray-600">Correo:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.correoCesionario || datos.correo_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.telefonoCesionario || datos.telefono_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-telephone text-teal-500"></i>
                              <span className="text-gray-600">Teléfono:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.telefonoCesionario || datos.telefono_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.direccionCesionario || datos.direccion_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-geo-alt text-teal-500"></i>
                              <span className="text-gray-600">Dirección:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.direccionCesionario || datos.direccion_cesionario)}</span>
                            </div>
                          ) : null}
                          {datos.representanteLegalCesionario || datos.representante_legal_cesionario ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <i className="bi bi-person-check text-teal-500"></i>
                              <span className="text-gray-600">Representante Legal:</span>
                              <span className="font-medium text-gray-800">{renderValue(datos.representanteLegalCesionario || datos.representante_legal_cesionario)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comentarios */}
            {comentarios && comentarios.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <i className="bi bi-chat-dots text-pink-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Comentarios</h3>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {comentarios.map((c, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-white p-3 rounded border ${
                          c.especial 
                            ? 'border-pink-300 bg-pink-50' 
                            : 'border-pink-200'
                        }`}
                      >
                        {c.especial ? (
                          <>
                            <div className="flex items-center space-x-2 mb-2">
                              <i className="bi bi-arrow-repeat text-pink-500"></i>
                              <span className="text-sm font-semibold text-pink-800">Justificación de cambio de estado</span>
                            </div>
                            <p className="text-sm text-pink-900 mb-2">{c.texto}</p>
                            <span className="text-xs text-pink-600">{c.fecha}</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">{c.autor || 'Sistema'}</span>
                              <span className="text-xs text-gray-500">{c.fecha}</span>
                            </div>
                            <p className="text-sm text-gray-700">{c.texto}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerDetalleVenta;
