// Servicio para obtener y filtrar procesos de usuario
// ✅ REFACTORIZADO: Ahora usa la API real

import { SaleService, ServiceService, initializeMockData } from '../../../../../utils/mockDataService.js';
import solicitudesApiService from '../../gestionVentasServicios/services/solicitudesApiService';
import serviciosApiService from '../../gestionVentasServicios/services/serviciosApiService';
import { getAuthToken } from '../../../../../shared/utils/authHelpers.js';

// Inicializar datos mock centralizados (solo para fallback)
initializeMockData();

export async function getSolicitudesUsuario(email) {
  try {
    console.log(`🔧 [ProcesosService] Obteniendo solicitudes del usuario: ${email}...`);
    
    const token = getAuthToken();
    if (!token) {
      console.log('⚠️ [ProcesosService] No hay token, usando datos mock...');
      
      // Usar SaleService para obtener todas las ventas
      const todas = SaleService.getAll();
      console.log('🔧 [procesosService] Todas las ventas:', todas);
      console.log('🔧 [procesosService] Filtrando por email:', email);
      
      const filtradas = todas.filter((s) => s && typeof s === "object" && s.email === email);
      console.log('🔧 [procesosService] Ventas filtradas para el usuario:', filtradas);
      
      return filtradas;
    }

    console.log('🔧 [ProcesosService] Obteniendo desde API con token...');
    
    // Llamar al endpoint directamente
    const solicitudesAPI = await solicitudesApiService.getMisSolicitudes(token);
    
    console.log('🔍 [ProcesosService] ========== RESPUESTA DE API ==========');
    console.log('🔍 [ProcesosService] Respuesta completa:', solicitudesAPI);
    console.log('🔍 [ProcesosService] Tipo:', typeof solicitudesAPI);
    console.log('🔍 [ProcesosService] Es array?', Array.isArray(solicitudesAPI));
    console.log('🔍 [ProcesosService] Longitud:', Array.isArray(solicitudesAPI) ? solicitudesAPI.length : 'N/A');
    
    if (Array.isArray(solicitudesAPI) && solicitudesAPI.length > 0) {
      console.log('🔍 [ProcesosService] Primera solicitud (raw):', solicitudesAPI[0]);
      console.log('🔍 [ProcesosService] Campos de la primera solicitud:', Object.keys(solicitudesAPI[0]));
    }
    console.log('🔍 [ProcesosService] =======================================');
    
    // Verificar si la respuesta es un array directamente o está envuelta
    let solicitudesArray = null;
    
    if (Array.isArray(solicitudesAPI)) {
      // ✅ La respuesta es directamente un array
      solicitudesArray = solicitudesAPI;
      console.log('✅ [ProcesosService] Respuesta es un array directo con', solicitudesArray.length, 'elementos');
    } else if (solicitudesAPI && typeof solicitudesAPI === 'object') {
      // Intentar extraer el array de diferentes propiedades
      if (Array.isArray(solicitudesAPI.data)) {
        solicitudesArray = solicitudesAPI.data;
        console.log('✅ [ProcesosService] Array encontrado en .data:', solicitudesArray.length);
      } else if (Array.isArray(solicitudesAPI.solicitudes)) {
        solicitudesArray = solicitudesAPI.solicitudes;
        console.log('✅ [ProcesosService] Array encontrado en .solicitudes:', solicitudesArray.length);
      } else if (Array.isArray(solicitudesAPI.result)) {
        solicitudesArray = solicitudesAPI.result;
        console.log('✅ [ProcesosService] Array encontrado en .result:', solicitudesArray.length);
      } else {
        console.error('❌ [ProcesosService] No se pudo encontrar un array en la respuesta. Estructura:', Object.keys(solicitudesAPI));
        console.error('❌ [ProcesosService] Respuesta completa:', JSON.stringify(solicitudesAPI, null, 2));
        return [];
      }
    } else {
      console.error('❌ [ProcesosService] Respuesta no es un array ni un objeto:', solicitudesAPI);
      return [];
    }
    
    // Verificar que tenemos un array válido
    if (!Array.isArray(solicitudesArray)) {
      console.error('❌ [ProcesosService] No se pudo obtener un array válido');
      return [];
    }
    
    // Si el array está vacío, retornar directamente
    if (solicitudesArray.length === 0) {
      console.log('ℹ️ [ProcesosService] El array está vacío - no hay solicitudes para este usuario');
      return [];
    }
    
    // ✅ Verificar si las solicitudes ya vienen en el formato del frontend
    // (el backend puede estar devolviendo datos ya transformados)
    const primeraSolicitud = solicitudesArray[0];
    const tieneCamposFrontend = primeraSolicitud && (
      primeraSolicitud.nombreMarca || 
      primeraSolicitud.tipoSolicitud || 
      primeraSolicitud.expediente
    );
    const tieneCamposBackend = primeraSolicitud && (
      primeraSolicitud.nombre_marca || 
      primeraSolicitud.marca_a_buscar ||
      primeraSolicitud.servicio ||
      primeraSolicitud.id_orden_servicio
    );
    
    console.log('🔍 [ProcesosService] Análisis de formato:');
    console.log('  - Tiene campos frontend (nombreMarca, tipoSolicitud)?', tieneCamposFrontend);
    console.log('  - Tiene campos backend (nombre_marca, servicio)?', tieneCamposBackend);
    
    // Si ya tiene campos del frontend, usar directamente (backend ya transformó)
    if (tieneCamposFrontend && !tieneCamposBackend) {
      console.log('✅ [ProcesosService] Las solicitudes ya vienen en formato frontend - usando directamente');
      console.log('📊 [ProcesosService] Total de solicitudes:', solicitudesArray.length);
      return solicitudesArray;
    }
    
    // Si tiene campos del backend, necesitamos transformar
    if (tieneCamposBackend) {
      console.log('🔄 [ProcesosService] Las solicitudes vienen en formato backend - transformando...');
      console.log(`🔄 [ProcesosService] Transformando ${solicitudesArray.length} solicitudes...`);
      
      const solicitudesFormateadas = solicitudesArray.map((solicitud, index) => {
        try {
          const transformada = solicitudesApiService.transformarRespuestaDelAPI(solicitud);
          if (index < 3) { // Solo log de las primeras 3 para no saturar
            console.log(`  ✅ Solicitud ${index + 1} transformada:`, {
              id: transformada.id,
              nombreMarca: transformada.nombreMarca,
              tipoSolicitud: transformada.tipoSolicitud,
              estado: transformada.estado
            });
          }
          return transformada;
        } catch (transformError) {
          console.error(`❌ [ProcesosService] Error transformando solicitud ${index + 1}:`, transformError);
          console.error(`❌ [ProcesosService] Solicitud que falló:`, solicitud);
          return null;
        }
      }).filter(s => s !== null); // Filtrar solicitudes que fallaron en la transformación
      
      console.log(`✅ [ProcesosService] ${solicitudesFormateadas.length} solicitudes transformadas correctamente`);
      if (solicitudesFormateadas.length > 0) {
        console.log('📊 [ProcesosService] Primeras 3 solicitudes transformadas:', solicitudesFormateadas.slice(0, 3));
      }
      
      return solicitudesFormateadas;
    }
    
    // Si no tiene ninguno de los formatos esperados, intentar transformar de todas formas
    console.warn('⚠️ [ProcesosService] Formato desconocido - intentando transformar de todas formas...');
    const solicitudesFormateadas = solicitudesArray.map((solicitud) => {
      try {
        return solicitudesApiService.transformarRespuestaDelAPI(solicitud);
      } catch (transformError) {
        console.error('❌ [ProcesosService] Error en transformación:', transformError);
        return null;
      }
    }).filter(s => s !== null);
    
    return solicitudesFormateadas;
  } catch (error) {
    console.error('❌ [ProcesosService] Error obteniendo solicitudes del usuario desde API:', error);
    console.error('❌ [ProcesosService] Stack trace:', error.stack);
    console.error('❌ [ProcesosService] Error completo:', JSON.stringify(error, null, 2));
    
    // Fallback a datos mock en caso de error
    try {
      console.log('🔄 [ProcesosService] Intentando fallback a datos mock...');
      const todas = SaleService.getAll();
      const filtradas = todas.filter((s) => s && typeof s === "object" && s.email === email);
      console.log(`⚠️ [ProcesosService] Usando ${filtradas.length} solicitudes mock como fallback`);
      return filtradas;
    } catch (fallbackError) {
      console.error('❌ [ProcesosService] Error también en fallback:', fallbackError);
      return [];
    }
  }
}

export function filtrarProcesos(procesos, finalizados = false, servicios = []) {
  if (!Array.isArray(procesos)) return [];
  
  // Estados que siempre se consideran finalizados (incluyendo variaciones masculino/femenino)
  const estadosFinalesHardcodeados = [
    "Aprobado", "Aprobada",
    "Rechazado", "Rechazada", 
    "Anulado", "Anulada",
    "Finalizado", "Finalizada"
  ];
  
  // Función auxiliar para verificar si un estado es finalizado
  const esEstadoFinalizado = (estado) => {
    if (!estado) return false;
    
    // Normalizar el estado para comparación (case-insensitive)
    const estadoNormalizado = String(estado).trim();
    const estadoLower = estadoNormalizado.toLowerCase();
    
    // Verificar estados hardcodeados (case-insensitive)
    const esHardcodeado = estadosFinalesHardcodeados.some(
      e => e.toLowerCase() === estadoLower
    );
    if (esHardcodeado) {
      console.log(`🔍 [esEstadoFinalizado] Estado "${estado}" coincide con estado hardcodeado`);
      return true;
    }
    
    // Verificar si contiene palabras clave de finalización/anulación (case-insensitive)
    const palabrasFinales = [
      'finalizado', 'finalizada', 
      'completado', 'completada', 
      'terminado', 'terminada',
      'anulado', 'anulada',  // ✅ Asegurar que se detecte anulado/anulada
      'aprobado', 'aprobada',
      'rechazado', 'rechazada'
    ];
    const contienePalabraFinal = palabrasFinales.some(
      palabra => estadoLower.includes(palabra)
    );
    if (contienePalabraFinal) {
      console.log(`🔍 [esEstadoFinalizado] Estado "${estado}" contiene palabra clave de finalización/anulación`);
      return true;
    }
    
    return false;
  };
  
  if (finalizados) {
    const procesosFinalizados = procesos.filter((p) => {
      const estadoActual = p?.estado;
      
      // 1. Verificar estados hardcodeados (con función auxiliar que es case-insensitive)
      if (esEstadoFinalizado(estadoActual)) {
        return true;
      }
      
      // 2. Verificar si el estado está en los estados finales del servicio (último estado)
      const servicio = servicios.find(s => s && s.nombre === p.tipoSolicitud);
      if (servicio && servicio.process_states && servicio.process_states.length > 0) {
        // El último estado del proceso se considera estado final
        const ultimoEstado = servicio.process_states[servicio.process_states.length - 1];
        
        // Verificar si el estado actual coincide con el último estado del proceso
        if (ultimoEstado.status_key === estadoActual || 
            ultimoEstado.name === estadoActual ||
            estadoActual === ultimoEstado.status_key ||
            estadoActual === ultimoEstado.name) {
          return true;
        }
        
        // También verificar si hay campo es_final en el estado actual
        const estadoEncontrado = servicio.process_states.find(e => 
          e.status_key === estadoActual || e.name === estadoActual
        );
        if (estadoEncontrado && estadoEncontrado.es_final === true) {
          return true;
        }
      }
      
      return false;
    });
    
    // Log resumen de procesos finalizados por estado
    const estadosCount = {};
    procesosFinalizados.forEach(p => {
      const estado = p.estado || 'Sin estado';
      estadosCount[estado] = (estadosCount[estado] || 0) + 1;
    });
    console.log('📊 [filtrarProcesos] Procesos finalizados/anulados encontrados:', procesosFinalizados.length);
    console.log('📊 [filtrarProcesos] Distribución por estado:', estadosCount);
    
    return procesosFinalizados;
  } else {
    // Filtrar procesos activos (NO finalizados)
    return procesos.filter((p) => {
      const estadoActual = p?.estado;
      
      // 1. Excluir si está en estados finales hardcodeados
      if (esEstadoFinalizado(estadoActual)) {
        return false;
      }
      
      // 2. Verificar si NO está en los estados finales del servicio
      const servicio = servicios.find(s => s && s.nombre === p.tipoSolicitud);
      if (servicio && servicio.process_states && servicio.process_states.length > 0) {
        // El último estado del proceso se considera estado final
        const ultimoEstado = servicio.process_states[servicio.process_states.length - 1];
        
        // Verificar si el estado actual coincide con el último estado del proceso
        if (ultimoEstado.status_key === estadoActual || 
            ultimoEstado.name === estadoActual ||
            estadoActual === ultimoEstado.status_key ||
            estadoActual === ultimoEstado.name) {
          return false;
        }
        
        // También verificar si hay campo es_final en el estado actual
        const estadoEncontrado = servicio.process_states.find(e => 
          e.status_key === estadoActual || e.name === estadoActual
        );
        if (estadoEncontrado && estadoEncontrado.es_final === true) {
          return false;
        }
      }
      
      // Si no es finalizado, está activo
      return true;
    });
  }
}

export async function obtenerServicios() {
  try {
    console.log('🔧 [ProcesosService] Obteniendo servicios desde API...');
    
    // Intentar obtener desde API
    const servicios = await serviciosApiService.getServicios();
    
    if (Array.isArray(servicios) && servicios.length > 0) {
      console.log(`✅ [ProcesosService] Servicios obtenidos desde API:`, servicios.length);
      return servicios;
    } else {
      console.log('⚠️ [ProcesosService] API no devolvió servicios, usando datos mock...');
      // Fallback a datos mock
      const servs = ServiceService.getAll();
      return Array.isArray(servs) ? servs : [];
    }
  } catch (error) {
    console.error('❌ [ProcesosService] Error obteniendo servicios desde API, usando datos mock:', error);
    // Fallback a datos mock en caso de error
    try {
      const servs = ServiceService.getAll();
      return Array.isArray(servs) ? servs : [];
    } catch (fallbackError) {
      console.error('❌ [ProcesosService] Error también en fallback:', fallbackError);
      return [];
    }
  }
}

// Formatea una fecha a formato legible (DD/MM/YYYY)
export function formatearFecha(fecha) {
  if (!fecha || fecha === "-") return "-";
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return fecha; // Si no es una fecha válida, devolver tal cual
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return fecha; // Devolver tal cual si hay error
  }
}

// Formatea una fecha a formato corto (DD/MM/YYYY HH:MM)
export function formatearFechaCompleta(fecha) {
  if (!fecha || fecha === "-") return "-";
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha completa:', error);
    return fecha;
  }
}

// Devuelve la fecha de creación del proceso
export function obtenerFechaCreacion(proc) {
  const fecha = proc.fechaCreacion || proc.fechaSolicitud || "-";
  return formatearFecha(fecha);
}

// Devuelve la fecha de finalización del proceso (si está finalizado o anulado)
export function obtenerFechaFin(proc) {
  // Verificar si el proceso está finalizado o anulado
  const esFinalizado = proc.estado && (
    proc.estado === 'Finalizado' || proc.estado === 'Finalizada' ||
    proc.estado === 'Anulado' || proc.estado === 'Anulada' ||
    proc.estado.toLowerCase().includes('finalizado') ||
    proc.estado.toLowerCase().includes('anulado')
  );
  
  if (!esFinalizado) {
    return "-";
  }
  
  // Prioridad 1: Buscar fecha de finalización específica del backend
  // Para procesos anulados, priorizar fecha_anulacion
  const esAnulado = proc.estado && (
    proc.estado === 'Anulado' || proc.estado === 'Anulada' ||
    proc.estado.toLowerCase().includes('anulado')
  );
  
  let fecha = null;
  if (esAnulado) {
    // Para anulados, buscar fecha_anulacion primero (campo del backend)
    fecha = proc.fecha_anulacion ||  // ✅ Prioridad 1: Campo específico del backend
            proc.fechaAnulacion ||   // Fallback camelCase
            proc.fechaFin ||         // Fallback genérico
            proc.fecha_finalizacion ||
            proc.fecha_fin ||
            null;
    
    if (proc.fecha_anulacion) {
      console.log(`✅ [obtenerFechaFin] Proceso ${proc.id} - Usando fecha_anulacion del backend:`, proc.fecha_anulacion);
    }
  } else {
    // Para finalizados, buscar fecha_finalizacion
    fecha = proc.fechaFin ||
            proc.fecha_finalizacion ||
            proc.fecha_fin ||
            null;
  }
  
  // Prioridad 2: Si no hay fecha de finalización, usar fecha de última actualización
  // (esto indica cuándo se cambió el estado a finalizado/anulado)
  if (!fecha || fecha === "-" || fecha === null) {
    fecha = proc.fechaSolicitud ||  // Última actualización
            proc.updatedAt ||        // Fecha de actualización del backend
            proc.updated_at ||       // Variante de updatedAt
            proc.fecha_actualizacion || // Otra posible variante
            null;
    
    if (fecha) {
      console.log(`ℹ️ [obtenerFechaFin] Proceso ${proc.id} - Usando fecha de última actualización como fecha fin:`, fecha);
    }
  }
  
  // Prioridad 3: Si aún no hay fecha, usar fechaCreacion como fecha fin para procesos finalizados/anulados
  // (El backend puede no tener fecha_finalizacion, pero si está finalizado/anulado, usamos fechaCreacion)
  if ((!fecha || fecha === "-" || fecha === null) && esFinalizado) {
    if (proc.fechaCreacion) {
      fecha = proc.fechaCreacion;
      console.log(`ℹ️ [obtenerFechaFin] Proceso ${proc.id} - Usando fecha de creación como fecha fin:`, fecha);
    }
  }
  
  if (!fecha || fecha === "-" || fecha === null) {
    console.log(`⚠️ [obtenerFechaFin] Proceso ${proc.id} no tiene fecha de fin. Campos disponibles:`, {
      fecha_anulacion: proc.fecha_anulacion,
      fechaAnulacion: proc.fechaAnulacion,
      fechaFin: proc.fechaFin,
      fecha_finalizacion: proc.fecha_finalizacion,
      fecha_fin: proc.fecha_fin,
      fechaSolicitud: proc.fechaSolicitud,
      updatedAt: proc.updatedAt,
      updated_at: proc.updated_at,
      fechaCreacion: proc.fechaCreacion,
      todasLasPropiedades: Object.keys(proc).filter(k => 
        k.toLowerCase().includes('fecha') || 
        k.toLowerCase().includes('update') ||
        k.toLowerCase().includes('solicitud') ||
        k.toLowerCase().includes('anul')
      )
    });
    return "-";
  }
  
  const fechaFormateada = formatearFecha(fecha);
  console.log(`✅ [obtenerFechaFin] Proceso ${proc.id} - Fecha fin:`, fechaFormateada, 'desde campo:', fecha);
  return fechaFormateada;
}

// Devuelve la fecha de solicitud formateada (para mostrar "Última actualización")
export function obtenerFechaSolicitud(proc) {
  const fecha = proc.fechaSolicitud || proc.fechaCreacion || "-";
  return formatearFecha(fecha);
}

// Calcula la duración del proceso en días (entre creación y fin)
export function calcularDuracion(proc) {
  const fechaCreacion = proc.fechaCreacion || proc.fechaSolicitud;
  const fechaFin = proc.fechaFin;
  
  if (!fechaCreacion || !fechaFin || fechaFin === "-") return "-";
  
  try {
    const inicio = new Date(fechaCreacion);
    const fin = new Date(fechaFin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "-";
    const diffMs = fin - inicio;
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDias + " días";
  } catch (error) {
    console.error('Error calculando duración:', error);
    return "-";
  }
}
