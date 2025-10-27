// Servicio de ventas usando la data mock centralizada
// ✅ REFACTORIZADO: Ahora usa SaleService del mockDataService

import {
  SaleService,
  initializeMockData,
} from "../../../../../utils/mockDataService.js";
import solicitudesApiService from './solicitudesApiService';
import authData from '../../../../auth/services/authData.js';

// Inicializar datos mock centralizados
initializeMockData();

// Función para inicializar datos de prueba (solo si no hay datos)
export function initDatosPrueba() {
  const ventas = SaleService.getInProcess();
  if (ventas.length === 0) {
    const datosPrueba = [
      {
        id: "1",
        titular: "Juan Pérez",
        tipoPersona: "Natural",
        expediente: "EXP-00123",
        tipoSolicitud: "Certificación de Marca",
        marca: "TechNova",
        encargado: "Dra. Gómez",
        proximaCita: null,
        estado: "En revisión",
        comentarios: [],
        email: "juan.perez@example.com",
        telefono: "3001234567",
      },
      {
        id: "2",
        titular: "Empresa XYZ",
        tipoPersona: "Jurídica",
        expediente: "EXP-00124",
        tipoSolicitud: "Certificación de Marca",
        marca: "Zentra",
        encargado: "Dr. Morales",
        proximaCita: "2025-06-22",
        estado: "Pendiente",
        comentarios: [],
        email: "empresa.xyz@example.com",
        telefono: "3009876543",
      },
    ];

    // Usar SaleService para crear las ventas
    datosPrueba.forEach((venta) => {
      SaleService.create(venta);
    });
  }
}

// Crear nueva venta
export function crearVenta(nuevaVenta) {
  console.log("🔧 [crearVenta] Datos recibidos:", nuevaVenta);

  // Generar número de expediente automático
  const generarExpediente = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `EXP-${timestamp}${random}`;
  };

  // Mapear los campos del formulario a los campos que espera la tabla
  const ventaMapeada = {
    ...nuevaVenta,
    expediente: generarExpediente(), // Generar expediente automáticamente
    comentarios: [],
    // Mapear titular
    titular:
      nuevaVenta.tipoSolicitante === "Titular"
        ? nuevaVenta.tipoPersona === "Natural"
          ? `${nuevaVenta.nombres || ""} ${nuevaVenta.apellidos || ""}`.trim()
          : nuevaVenta.nombreEmpresa
        : `${nuevaVenta.nombres || ""} ${nuevaVenta.apellidos || ""}`.trim(),
    // Mapear marca
    marca: nuevaVenta.nombreMarca,
    // Mapear tipo de solicitud
    tipoSolicitud: nuevaVenta.tipoSolicitud,
    // Mapear encargado (por defecto)
    encargado: nuevaVenta.encargado || "Sin asignar",
    // Mapear próxima cita (por defecto)
    proximaCita: nuevaVenta.proximaCita || null,
    // Mapear tipo de persona
    tipoPersona: nuevaVenta.tipoPersona || nuevaVenta.tipoSolicitante,
  };

  console.log("🔧 [crearVenta] Datos mapeados:", ventaMapeada);

  const resultado = SaleService.create(ventaMapeada);
  console.log("🔧 [crearVenta] Resultado de SaleService.create:", resultado);

  return resultado;
}

// Editar venta
export function actualizarVenta(id, datosActualizados) {
  // Función para mapear datos actualizados
  const mapearDatosActualizados = (datos) => {
    const mapeados = { ...datos };

    // Mapear titular si se actualizaron campos relacionados
    if (
      datos.tipoSolicitante ||
      datos.tipoPersona ||
      datos.nombres ||
      datos.apellidos ||
      datos.nombreEmpresa
    ) {
      mapeados.titular =
        datos.tipoSolicitante === "Titular"
          ? datos.tipoPersona === "Natural"
            ? `${datos.nombres || ""} ${datos.apellidos || ""}`.trim()
            : datos.nombreEmpresa
          : `${datos.nombres || ""} ${datos.apellidos || ""}`.trim();
    }

    // Mapear marca si se actualizó nombreMarca
    if (datos.nombreMarca) {
      mapeados.marca = datos.nombreMarca;
    }

    // Mapear tipo de persona
    if (datos.tipoPersona || datos.tipoSolicitante) {
      mapeados.tipoPersona = datos.tipoPersona || datos.tipoSolicitante;
    }

    // Guardar fecha de finalización si el estado es finalizado/anulado/rechazado
    if (["Finalizado", "Anulado", "Rechazado"].includes(datos.estado)) {
      mapeados.fechaFin = new Date().toISOString();
    }

    return mapeados;
  };

  const datosMapeados = mapearDatosActualizados(datosActualizados);
  return SaleService.update(id, datosMapeados);
}

// Anular venta
export function anularVenta(id, motivo) {
  return SaleService.cancel(id, motivo);
}

// Agregar comentario
export function agregarComentario(id, texto, especial = false) {
  return SaleService.addComment(id, texto);
}

// Obtener comentarios
export function getComentarios(id) {
  const venta = SaleService.getById(id);
  return venta?.comentarios || [];
}

// Obtener solicitudes en proceso (conectado a API)
export async function getInProcess() {
  try {
    console.log('🔧 [VentasService] Obteniendo solicitudes en proceso...');
    
    const token = authData.getToken();
    if (token) {
      console.log('🔧 [VentasService] Obteniendo desde API...');
      const solicitudesAPI = await solicitudesApiService.getAllSolicitudes(token);
      
      // Transformar respuesta de la API al formato del frontend
      const solicitudesFormateadas = solicitudesAPI.map(solicitud => 
        solicitudesApiService.transformarRespuestaDelAPI(solicitud)
      );
      
      console.log('✅ [VentasService] Solicitudes obtenidas desde API:', solicitudesFormateadas.length);
      return solicitudesFormateadas;
    } else {
      console.log('⚠️ [VentasService] No hay token, usando datos mock...');
      return SaleService.getInProcess();
    }
  } catch (error) {
    console.error('❌ [VentasService] Error obteniendo solicitudes desde API, usando datos mock:', error);
    return SaleService.getInProcess();
  }
}

// Obtener solicitudes por estado (conectado a API)
export async function getByEstado(estado) {
  try {
    console.log(`🔧 [VentasService] Obteniendo solicitudes por estado: ${estado}...`);
    
    const token = authData.getToken();
    if (token) {
      console.log('🔧 [VentasService] Obteniendo desde API...');
      const todasLasSolicitudes = await solicitudesApiService.getAllSolicitudes(token);
      
      // Filtrar por estado
      const solicitudesFiltradas = todasLasSolicitudes.filter(solicitud => 
        solicitud.estado === estado
      );
      
      // Transformar respuesta de la API al formato del frontend
      const solicitudesFormateadas = solicitudesFiltradas.map(solicitud => 
        solicitudesApiService.transformarRespuestaDelAPI(solicitud)
      );
      
      console.log(`✅ [VentasService] Solicitudes por estado ${estado} obtenidas desde API:`, solicitudesFormateadas.length);
      return solicitudesFormateadas;
    } else {
      console.log('⚠️ [VentasService] No hay token, usando datos mock...');
      return SaleService.getByEstado(estado);
    }
  } catch (error) {
    console.error('❌ [VentasService] Error obteniendo solicitudes por estado desde API, usando datos mock:', error);
    return SaleService.getByEstado(estado);
  }
}

// Buscar solicitudes (conectado a API)
export async function buscarSolicitudes(termino) {
  try {
    console.log(`🔧 [VentasService] Buscando solicitudes con término: ${termino}...`);
    
    const token = authData.getToken();
    if (token) {
      console.log('🔧 [VentasService] Buscando desde API...');
      const solicitudesAPI = await solicitudesApiService.buscarSolicitudes(termino, token);
      
      // Transformar respuesta de la API al formato del frontend
      const solicitudesFormateadas = solicitudesAPI.map(solicitud => 
        solicitudesApiService.transformarRespuestaDelAPI(solicitud)
      );
      
      console.log(`✅ [VentasService] Solicitudes encontradas desde API:`, solicitudesFormateadas.length);
      return solicitudesFormateadas;
    } else {
      console.log('⚠️ [VentasService] No hay token, usando datos mock...');
      return SaleService.buscarSolicitudes(termino);
    }
  } catch (error) {
    console.error('❌ [VentasService] Error buscando solicitudes desde API, usando datos mock:', error);
    return SaleService.buscarSolicitudes(termino);
  }
}
