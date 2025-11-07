import React from "react";
import { getComentarios } from '../services/ventasService';
import BaseModal from '../../../../../shared/components/BaseModal';
import Badge from '../../../../../shared/components/Badge';
import { Eye } from 'lucide-react';

const labelClass = "text-xs text-gray-500 font-semibold mb-1";
const valueClass = "text-xs text-gray-800 mb-2 break-all";

// ✅ Helper para verificar si un valor está realmente vacío (null, undefined, "", 0 como número es válido)
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

const renderFileDisplayName = (file) => {
  if (!file) return <span className="italic text-gray-400">No disponible</span>;
  if (typeof file === 'string') return file;
  if (file.name) return file.name;
  return <span className="italic text-gray-400">No disponible</span>;
};

const VerDetalleVenta = ({ datos, isOpen, onClose }) => {
  // ✅ Guard clause: Si no hay datos, no renderizar nada
  if (!datos) {
    return null;
  }

  // Obtener comentarios de la venta
  const comentarios = getComentarios(datos.id);

  return (
    <BaseModal
      isOpen={isOpen && datos}
      onClose={onClose}
      title="Detalle del Servicio"
      subtitle={`Expediente: ${datos?.expediente || 'No especificado'}`}
      headerGradient="blue"
      headerIcon={<Eye className="w-5 h-5 text-white" />}
      maxWidth="6xl"
      footerActions={[
        {
          label: "Cerrar",
          onClick: onClose,
          variant: "secondary"
        }
      ]}
    >

        {/* Content: grid 4 columnas en desktop, 1 en móvil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 -m-6 p-6">
          {/* Columna 1: Cliente y Representante */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Titular / Representante</h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${datos.titular || datos.nombreCompleto || ''}`}
                  alt={datos.titular || datos.nombreCompleto || ''}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-800">{datos.titular || datos.nombreCompleto || <span className="italic text-gray-400">No especificado</span>}</div>
                  <div className="text-xs text-gray-500">{datos.tipoPersona || datos.tipoSolicitante || <span className="italic text-gray-400">No especificado</span>}</div>
                </div>
              </div>
              <div className={labelClass}>Tipo de Solicitante:</div>
              <div className={valueClass}>{renderValue(datos.tipoSolicitante || datos.tipoPersona)}</div>
              <div className={labelClass}>Tipo de Persona:</div>
              <div className={valueClass}>{renderValue(datos.tipoPersona)}</div>
              <div className={labelClass}>Tipo de Documento:</div>
              <div className={valueClass}>{renderValue(datos.tipoDocumento)}</div>
              <div className={labelClass}>N° Documento:</div>
              <div className={valueClass}>{renderValue(datos.numeroDocumento)}</div>
              <div className={labelClass}>Email:</div>
              <div className={valueClass}>{renderValue(datos.email)}</div>
              <div className={labelClass}>Teléfono:</div>
              <div className={valueClass}>{renderValue(datos.telefono)}</div>
              <div className={labelClass}>Dirección:</div>
              <div className={valueClass}>{renderValue(datos.direccion)}</div>
              <div className={labelClass}>Tipo de Entidad:</div>
              <div className={valueClass}>{renderValue(datos.tipoEntidad)}</div>
              <div className={labelClass}>Razón Social:</div>
              <div className={valueClass}>{renderValue(datos.razonSocial)}</div>
              <div className={labelClass}>Nombre Empresa:</div>
              <div className={valueClass}>{renderValue(datos.nombreEmpresa)}</div>
              <div className={labelClass}>NIT:</div>
              <div className={valueClass}>{renderValue(datos.nit)}</div>
              <div className={labelClass}>Poder Representante:</div>
              <div className={valueClass}>{renderValue(datos.poderRepresentante, "No disponible")}</div>
              <div className={labelClass}>Poder Autorización:</div>
              <div className={valueClass}>{renderValue(datos.poderAutorizacion, "No disponible")}</div>
            </div>
          </div>

          {/* Columna 2: Detalles de la Solicitud y Marca */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Detalles y Marca</h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Estado:</span>
                <Badge estado={datos.estado} tipo="solicitud" size="xs" />
              </div>
              <div className={labelClass}>Tipo de Solicitud:</div>
              <div className={valueClass}>{renderValue(datos.tipoSolicitud)}</div>
              <div className={labelClass}>Encargado:</div>
              <div className={valueClass}>{renderValue(datos.encargado)}</div>
              <div className={labelClass}>Fecha Solicitud:</div>
              <div className={valueClass}>{renderValue(datos.fechaSolicitud || datos.fechaCreacion)}</div>
              <div className={labelClass}>Próxima Cita:</div>
              <div className={valueClass}>{renderValue(datos.proximaCita, "Sin citas")}</div>
              {datos.motivoAnulacion && (
                <div className="flex items-center space-x-2 text-xs bg-red-50 p-2 rounded mt-2">
                  <i className="bi bi-exclamation-triangle text-red-400"></i>
                  <span className="text-gray-600">Motivo de Anulación:</span>
                  <span className="font-medium text-red-700">{datos.motivoAnulacion}</span>
                </div>
              )}
              <div className="mt-2 border-t pt-2">
                <div className={labelClass}>País:</div>
                <div className={valueClass}>{renderValue(datos.pais)}</div>
                <div className={labelClass}>Ciudad:</div>
                <div className={valueClass}>{renderValue(datos.ciudad)}</div>
                <div className={labelClass}>Nombre Marca:</div>
                <div className={valueClass}>{renderValue(datos.nombreMarca || datos.marca)}</div>
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Categoría:</span>
                  <div className="flex items-center gap-1">
                    <i className={`bi ${
                      datos.categoria === 'Productos' 
                        ? 'bi-box text-blue-600' 
                        : 'bi-gear text-green-600'
                    } text-xs`}></i>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      datos.categoria === 'Productos' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {datos.categoria || 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Archivos Adjuntos */}
            <div className="bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">Archivos Adjuntos</h4>
              <div className={labelClass}>Certificado Cámara:</div>
              <div className={valueClass}>
                {datos.certificadoCamara && typeof datos.certificadoCamara === 'string' && datos.certificadoCamara.startsWith('data:') ? (
                  <a
                    href={datos.certificadoCamara}
                    download={`certificado_camara.${datos.certificadoCamara.split(';')[0].split('/')[1] || 'pdf'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Descargar Certificado
                  </a>
                ) : renderFileDisplayName(datos.certificadoCamara)}
              </div>
              <div className={labelClass}>Logotipo Marca:</div>
              <div className={valueClass}>
                {datos.logotipoMarca && typeof datos.logotipoMarca === 'string' && datos.logotipoMarca.startsWith('data:') ? (
                  <a
                    href={datos.logotipoMarca}
                    download={`logotipo_marca.${datos.logotipoMarca.split(';')[0].split('/')[1] || 'png'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Descargar Logotipo
                  </a>
                ) : renderFileDisplayName(datos.logotipoMarca)}
              </div>
              <div className={labelClass}>Poder Representante:</div>
              <div className={valueClass}>
                {datos.poderRepresentante && typeof datos.poderRepresentante === 'string' && datos.poderRepresentante.startsWith('data:') ? (
                  <a
                    href={datos.poderRepresentante}
                    download={`poder_representante.${datos.poderRepresentante.split(';')[0].split('/')[1] || 'pdf'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Descargar Poder
                  </a>
                ) : renderFileDisplayName(datos.poderRepresentante)}
              </div>
              <div className={labelClass}>Poder Autorización:</div>
              <div className={valueClass}>
                {datos.poderAutorizacion && typeof datos.poderAutorizacion === 'string' && datos.poderAutorizacion.startsWith('data:') ? (
                  <a
                    href={datos.poderAutorizacion}
                    download={`poder_autorizacion.${datos.poderAutorizacion.split(';')[0].split('/')[1] || 'pdf'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Descargar Autorización
                  </a>
                ) : renderFileDisplayName(datos.poderAutorizacion)}
              </div>
            </div>
          </div>

          {/* Columna 3: Clases de la Marca */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Clases de la Marca</h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto">
              {Array.isArray(datos.clases) && datos.clases.length > 0 ? (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {datos.clases.map((c, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex flex-col md:flex-row md:items-center md:gap-2">
                      <span>N° Clase: <span className="font-medium">{c.numero || <span className="italic text-gray-400">No especificado</span>}</span></span>
                      <span>Descripción: <span className="font-medium">{c.descripcion || <span className="italic text-gray-400">No especificado</span>}</span></span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-xs italic">Sin clases</div>
              )}
            </div>
          </div>

          {/* Columna 4: Comentarios */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Comentarios</h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-56 overflow-y-auto">
              {comentarios && comentarios.length > 0 ? (
                <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {comentarios.map((c, idx) => (
                    <li key={idx} className={`text-xs text-gray-700 ${c.especial ? 'bg-blue-50 border-l-4 border-blue-400 p-2 rounded' : ''}`}>
                      {c.especial ? (
                        <>
                          <span className="font-semibold text-blue-800 flex items-center gap-1">
                            <i className="bi bi-arrow-repeat"></i> Justificación de cambio de estado
                          </span>
                          <span className="block text-blue-900 font-medium mt-1">{c.texto}</span>
                          <span className="block text-xs text-blue-500 mt-1">{c.fecha}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-blue-700">{c.autor || 'Sistema'}:</span> {c.texto}
                          <span className="block text-xs text-gray-400">{c.fecha}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-xs italic">Sin comentarios</div>
              )}
            </div>
          </div>
        </div>

    </BaseModal>
  );
};

export default VerDetalleVenta;
