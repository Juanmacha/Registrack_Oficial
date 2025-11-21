/**
 * Utilidades para manejar pagos pendientes después de timeouts
 */

import solicitudesApiService from '../../features/dashboard/pages/gestionVentasServicios/services/solicitudesApiService';
import { getAuthToken } from './authHelpers.js';

/**
 * Verifica si hay solicitudes recientes pendientes de pago del cliente
 * Busca solicitudes creadas en los últimos 10 minutos con estado "Pendiente de Pago"
 * 
 * @param {string} tipoSolicitud - Tipo de solicitud buscada (opcional, para filtrado)
 * @returns {Promise<Object|null>} - Solicitud pendiente encontrada o null
 */
export async function verificarSolicitudRecientePendiente(tipoSolicitud = null) {
  try {
    console.log('🔍 [PagosPendientesUtils] Verificando solicitudes recientes pendientes de pago...');
    
    const token = getAuthToken();
    if (!token) {
      console.warn('⚠️ [PagosPendientesUtils] No hay token de autenticación');
      return null;
    }

    // Obtener todas las solicitudes del usuario
    const solicitudes = await solicitudesApiService.getMisSolicitudes(token);
    
    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      console.log('ℹ️ [PagosPendientesUtils] No hay solicitudes del usuario');
      return null;
    }

    // Filtrar solicitudes pendientes de pago creadas en los últimos 10 minutos
    const ahora = new Date();
    const diezMinutosAtras = new Date(ahora.getTime() - 10 * 60 * 1000); // 10 minutos en milisegundos

    const solicitudesPendientes = solicitudes.filter(solicitud => {
      // Verificar estado "Pendiente de Pago" (puede venir en diferentes formatos)
      const estado = solicitud.estado || solicitud.estado_actual || solicitud.status || '';
      const estadoLower = estado.toLowerCase();
      const esPendientePago = 
        estadoLower.includes('pendiente') && 
        (estadoLower.includes('pago') || estadoLower.includes('payment'));

      if (!esPendientePago) {
        return false;
      }

      // Verificar fecha de creación (últimos 10 minutos)
      let fechaCreacion = null;
      if (solicitud.fecha_creacion) {
        fechaCreacion = new Date(solicitud.fecha_creacion);
      } else if (solicitud.fechaCreacion) {
        fechaCreacion = new Date(solicitud.fechaCreacion);
      } else if (solicitud.created_at) {
        fechaCreacion = new Date(solicitud.created_at);
      } else if (solicitud.fecha_solicitud) {
        fechaCreacion = new Date(solicitud.fecha_solicitud);
      }

      if (!fechaCreacion || isNaN(fechaCreacion.getTime())) {
        // Si no hay fecha, considerar la solicitud si tiene estado pendiente
        console.log('⚠️ [PagosPendientesUtils] Solicitud sin fecha válida, considerándola si es muy reciente:', solicitud.id || solicitud.id_orden_servicio);
        return true; // Incluir por si acaso (fallback)
      }

      const esReciente = fechaCreacion >= diezMinutosAtras;
      
      // Si se especificó tipo de solicitud, verificar que coincida
      if (tipoSolicitud) {
        const tipo = solicitud.tipoSolicitud || solicitud.tipo_solicitud || solicitud.servicio?.nombre || solicitud.nombre_servicio || '';
        const tiposCoinciden = tipo.toLowerCase().includes(tipoSolicitud.toLowerCase()) || 
                               tipoSolicitud.toLowerCase().includes(tipo.toLowerCase());
        return esReciente && tiposCoinciden;
      }

      return esReciente;
    });

    if (solicitudesPendientes.length === 0) {
      console.log('ℹ️ [PagosPendientesUtils] No se encontraron solicitudes pendientes recientes');
      return null;
    }

    // Retornar la más reciente
    const masReciente = solicitudesPendientes.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion || a.fechaCreacion || a.created_at || a.fecha_solicitud || 0);
      const fechaB = new Date(b.fecha_creacion || b.fechaCreacion || b.created_at || b.fecha_solicitud || 0);
      return fechaB - fechaA; // Más reciente primero
    })[0];

    console.log('✅ [PagosPendientesUtils] Solicitud pendiente encontrada:', {
      id: masReciente.id || masReciente.id_orden_servicio,
      estado: masReciente.estado || masReciente.estado_actual,
      tipo: masReciente.tipoSolicitud || masReciente.tipo_solicitud
    });

    return masReciente;
  } catch (error) {
    console.error('❌ [PagosPendientesUtils] Error al verificar solicitudes recientes:', error);
    return null;
  }
}

/**
 * Extrae información de pago de una solicitud pendiente
 * 
 * @param {Object} solicitud - Objeto de solicitud
 * @returns {Object|null} - Información de pago { orden_id, monto_a_pagar, servicio } o null
 */
export function extraerInfoPago(solicitud) {
  if (!solicitud) return null;

  // Extraer orden_id (puede venir en diferentes formatos)
  const ordenId = solicitud.id_orden_servicio || 
                  solicitud.orden_id || 
                  solicitud.id_orden || 
                  solicitud.id || 
                  solicitud.solicitud?.id_orden_servicio ||
                  null;

  // Extraer monto a pagar (buscar en múltiples lugares posibles, incluyendo objetos anidados)
  let montoAPagar = 
    solicitud.monto_a_pagar || 
    solicitud.montoAPagar ||
    solicitud.total_estimado ||
    solicitud.total ||
    solicitud.precio ||
    solicitud.valor ||
    solicitud.monto ||
    // Buscar en orden_servicio (objeto anidado)
    solicitud.orden_servicio?.total_estimado ||
    solicitud.orden_servicio?.total ||
    solicitud.orden_servicio?.monto_a_pagar ||
    solicitud.orden_servicio?.precio ||
    solicitud.ordenServicio?.total_estimado ||
    solicitud.ordenServicio?.total ||
    // Buscar en pago (objeto anidado)
    solicitud.pago?.monto ||
    solicitud.pago?.total_estimado ||
    solicitud.pago?.total ||
    // Buscar en servicio (objeto anidado) - precio base del servicio
    (solicitud.servicio && typeof solicitud.servicio === 'object' ? 
      (solicitud.servicio.precio_base || solicitud.servicio.precio || solicitud.servicio.valor) : null) ||
    null;
  
  // Si aún no se encontró, buscar en campos adicionales con diferentes nombres
  if (!montoAPagar) {
    // Buscar en todas las propiedades que puedan contener el monto
    const posiblesCampos = ['precio_base', 'valor_estimado', 'costo', 'precio_servicio', 'valor_total'];
    for (const campo of posiblesCampos) {
      if (solicitud[campo] && typeof solicitud[campo] === 'number') {
        montoAPagar = solicitud[campo];
        console.log(`✅ [PagosPendientesUtils] Monto encontrado en campo '${campo}':`, montoAPagar);
        break;
      }
    }
  }
  
  // Log de debugging para ver qué campos están disponibles
  if (!montoAPagar) {
    console.log('⚠️ [PagosPendientesUtils] No se encontró monto. Campos disponibles:', Object.keys(solicitud));
    console.log('⚠️ [PagosPendientesUtils] Estructura completa de la solicitud:', solicitud);
  }
  
  // Si el monto es null o undefined, convertir a número para asegurar que sea un número válido o null
  let montoFinal = null;
  if (montoAPagar !== null && montoAPagar !== undefined) {
    if (typeof montoAPagar === 'string') {
      montoFinal = parseFloat(montoAPagar);
    } else if (typeof montoAPagar === 'number') {
      montoFinal = montoAPagar;
    } else {
      montoFinal = Number(montoAPagar);
    }
    
    // Si después de convertir sigue siendo NaN o menor o igual a 0, establecer como null
    if (isNaN(montoFinal) || montoFinal <= 0) {
      console.warn('⚠️ [PagosPendientesUtils] Monto extraído inválido:', montoAPagar, '→ establecido como null');
      montoFinal = null;
    } else {
      console.log('✅ [PagosPendientesUtils] Monto válido extraído:', montoFinal);
    }
  } else {
    console.log('ℹ️ [PagosPendientesUtils] Monto no disponible - el backend lo calculará automáticamente desde total_estimado');
  }

  // Extraer servicio
  const servicio = solicitud.servicio || 
                   solicitud.nombre_servicio || 
                   solicitud.tipoSolicitud || 
                   solicitud.tipo_solicitud || 
                   null;

  if (!ordenId) {
    console.warn('⚠️ [PagosPendientesUtils] Solicitud sin orden_id válido:', solicitud);
    return null;
  }

  return {
    orden_id: ordenId,
    monto_a_pagar: montoFinal, // Usar monto convertido y validado
    servicio: servicio,
    estado: solicitud.estado || solicitud.estado_actual || 'Pendiente de Pago',
    nombreMarca: solicitud.nombreMarca || solicitud.nombre_marca || solicitud.marca_a_buscar || null,
    expediente: solicitud.expediente || solicitud.numero_expediente || null
  };
}

/**
 * Obtiene todas las solicitudes pendientes de pago del usuario
 * 
 * @returns {Promise<Array>} - Array de solicitudes pendientes de pago
 */
export async function obtenerSolicitudesPendientesPago() {
  try {
    console.log('🔍 [PagosPendientesUtils] Obteniendo todas las solicitudes pendientes de pago...');
    
    const token = getAuthToken();
    if (!token) {
      console.warn('⚠️ [PagosPendientesUtils] No hay token de autenticación');
      return [];
    }

    // Obtener todas las solicitudes del usuario
    const solicitudes = await solicitudesApiService.getMisSolicitudes(token);
    
    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      console.log('ℹ️ [PagosPendientesUtils] No hay solicitudes del usuario');
      return [];
    }

    // Filtrar solo las pendientes de pago
    const pendientes = solicitudes.filter(solicitud => {
      const estado = solicitud.estado || solicitud.estado_actual || solicitud.status || '';
      const estadoLower = estado.toLowerCase();
      return estadoLower.includes('pendiente') && 
             (estadoLower.includes('pago') || estadoLower.includes('payment'));
    });

    console.log(`✅ [PagosPendientesUtils] Se encontraron ${pendientes.length} solicitudes pendientes de pago`);

    return pendientes;
  } catch (error) {
    console.error('❌ [PagosPendientesUtils] Error al obtener solicitudes pendientes:', error);
    return [];
  }
}

