// Servicio para obtener y filtrar procesos de usuario
// ✅ REFACTORIZADO: Ahora usa la data mock centralizada

import { SaleService, ServiceService, initializeMockData } from '../../../../../utils/mockDataService.js';
import solicitudesApiService from '../../gestionVentasServicios/services/solicitudesApiService';
import { getAuthToken } from '../../../../../shared/utils/authHelpers.js';

// Inicializar datos mock centralizados
initializeMockData();

export async function getSolicitudesUsuario(email) {
  try {
    console.log(`🔧 [ProcesosService] Obteniendo solicitudes del usuario: ${email}...`);
    
    const token = getAuthToken();
    if (token) {
      console.log('🔧 [ProcesosService] Obteniendo desde API...');
      const solicitudesAPI = await solicitudesApiService.getMisSolicitudes(token);
      
      // Transformar respuesta de la API al formato del frontend
      const solicitudesFormateadas = solicitudesAPI.map(solicitud => 
        solicitudesApiService.transformarRespuestaDelAPI(solicitud)
      );
      
      console.log(`✅ [ProcesosService] Solicitudes del usuario obtenidas desde API:`, solicitudesFormateadas.length);
      return solicitudesFormateadas;
    } else {
      console.log('⚠️ [ProcesosService] No hay token, usando datos mock...');
      
      // Usar SaleService para obtener todas las ventas
      const todas = SaleService.getAll();
      console.log('🔧 [procesosService] Todas las ventas:', todas);
      console.log('🔧 [procesosService] Filtrando por email:', email);
      
      const filtradas = todas.filter((s) => s && typeof s === "object" && s.email === email);
      console.log('🔧 [procesosService] Ventas filtradas para el usuario:', filtradas);
      
      return filtradas;
    }
  } catch (error) {
    console.error('❌ [ProcesosService] Error obteniendo solicitudes del usuario desde API, usando datos mock:', error);
    
    // Fallback a datos mock en caso de error
    try {
      const todas = SaleService.getAll();
      const filtradas = todas.filter((s) => s && typeof s === "object" && s.email === email);
      return filtradas;
    } catch (fallbackError) {
      console.error('❌ [ProcesosService] Error también en fallback:', fallbackError);
      return [];
    }
  }
}

export function filtrarProcesos(procesos, finalizados = false) {
  if (!Array.isArray(procesos)) return [];
  if (finalizados) {
    return procesos.filter((p) =>
      ["Aprobado", "Rechazado", "Anulado", "Finalizado"].includes(p.estado)
    );
  } else {
    return procesos.filter(
      (p) => !["Aprobado", "Rechazado", "Anulado", "Finalizado"].includes(p.estado)
    );
  }
}

export function obtenerServicios() {
  const servs = ServiceService.getAll();
  return Array.isArray(servs) ? servs : [];
}

// Devuelve la fecha de creación del proceso
export function obtenerFechaCreacion(proc) {
  // Suponiendo que existe un campo fechaCreacion o similar
  return proc.fechaCreacion || proc.fechaSolicitud || "-";
}

// Devuelve la fecha de finalización del proceso (si está finalizado)
export function obtenerFechaFin(proc) {
  // Suponiendo que existe un campo fechaFin o similar
  return proc.fechaFin || "-";
}

// Calcula la duración del proceso en días (entre creación y fin)
export function calcularDuracion(proc) {
  const inicio = new Date(obtenerFechaCreacion(proc));
  const fin = new Date(obtenerFechaFin(proc));
  if (isNaN(inicio) || isNaN(fin) || obtenerFechaFin(proc) === "-") return "-";
  const diffMs = fin - inicio;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDias + " días";
}
