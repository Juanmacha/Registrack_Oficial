// Servicio para conectar solicitudes/procesos con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class SolicitudesApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  // Función para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error en petición API:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes - Obtener todas las solicitudes (admin/empleado)
  async getAllSolicitudes(token) {
    try {
      console.log('🔧 [SolicitudesApiService] Obteniendo todas las solicitudes...');
      const solicitudes = await this.makeRequest('/api/gestion-solicitudes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitudes obtenidas:', solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error('❌ [SolicitudesApiService] Error obteniendo solicitudes:', error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/mias - Obtener mis solicitudes (cliente)
  async getMisSolicitudes(token) {
    try {
      console.log('🔧 [SolicitudesApiService] Obteniendo mis solicitudes...');
      const solicitudes = await this.makeRequest('/api/gestion-solicitudes/mias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Mis solicitudes obtenidas:', solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error('❌ [SolicitudesApiService] Error obteniendo mis solicitudes:', error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id - Obtener solicitud específica
  async getSolicitudById(id, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo solicitud ${id}...`);
      const solicitud = await this.makeRequest(`/api/gestion-solicitudes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitud obtenida:', solicitud);
      return solicitud;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo solicitud ${id}:`, error);
      throw error;
    }
  }

  // POST /api/gestion-solicitudes/crear/:servicio - Crear nueva solicitud
  async crearSolicitud(servicio, datos, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Creando solicitud para servicio: ${servicio}...`, datos);
      
      // Codificar el nombre del servicio para la URL
      const servicioCodificado = encodeURIComponent(servicio);
      
      const solicitudCreada = await this.makeRequest(`/api/gestion-solicitudes/crear/${servicioCodificado}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });
      
      console.log('✅ [SolicitudesApiService] Solicitud creada:', solicitudCreada);
      return solicitudCreada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error creando solicitud para servicio ${servicio}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/editar/:id - Editar solicitud
  async editarSolicitud(id, datos, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Editando solicitud ${id}...`, datos);
      const solicitudEditada = await this.makeRequest(`/api/gestion-solicitudes/editar/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });
      console.log('✅ [SolicitudesApiService] Solicitud editada:', solicitudEditada);
      return solicitudEditada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error editando solicitud ${id}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/anular/:id - Anular solicitud
  async anularSolicitud(id, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id}...`);
      const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitud anulada:', solicitudAnulada);
      return solicitudAnulada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error anulando solicitud ${id}:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/buscar - Buscar solicitudes
  async buscarSolicitudes(termino, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Buscando solicitudes con término: ${termino}...`);
      const solicitudes = await this.makeRequest(`/api/gestion-solicitudes/buscar?search=${encodeURIComponent(termino)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Solicitudes encontradas:', solicitudes.length);
      return solicitudes;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error buscando solicitudes con término ${termino}:`, error);
      throw error;
    }
  }

  // PUT /api/gestion-solicitudes/asignar-empleado/:id - Asignar empleado a solicitud
  async asignarEmpleado(solicitudId, empleadoId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Asignando empleado ${empleadoId} a solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/asignar-empleado/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_empleado: empleadoId })
      });
      console.log('✅ [SolicitudesApiService] Empleado asignado exitosamente:', resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error asignando empleado a solicitud ${solicitudId}:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id/empleado-asignado - Obtener empleado asignado
  async getEmpleadoAsignado(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo empleado asignado a solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/empleado-asignado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Empleado asignado obtenido:', resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo empleado asignado de solicitud ${solicitudId}:`, error);
      throw error;
    }
  }

  // GET /api/gestion-solicitudes/:id/estados-disponibles - Obtener estados disponibles del servicio
  async getEstadosDisponibles(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo estados disponibles para solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/estados-disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Estados disponibles obtenidos:', resultado);
      return resultado.data?.estados_disponibles || [];
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo estados disponibles de solicitud ${solicitudId}:`, error);
      return [];
    }
  }

  // GET /api/gestion-solicitudes/:id/estado-actual - Obtener estado actual de la solicitud
  async getEstadoActual(solicitudId, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Obteniendo estado actual de solicitud ${solicitudId}...`);
      const resultado = await this.makeRequest(`/api/gestion-solicitudes/${solicitudId}/estado-actual`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ [SolicitudesApiService] Estado actual obtenido:', resultado);
      return resultado.data?.estado_actual || 'Pendiente';
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error obteniendo estado actual de solicitud ${solicitudId}:`, error);
      return 'Pendiente';
    }
  }

  // Función para transformar datos del frontend al formato de la API
  transformarDatosParaAPI(datosFrontend, tipoServicio) {
    console.log('🔧 [SolicitudesApiService] Transformando datos del frontend para API...', datosFrontend);
    
    // Mapeo de tipos de servicio del frontend a la API
    const mapeoServicios = {
      'Búsqueda de Antecedentes': 'Búsqueda de antecedentes',
      'Certificación de Marca': 'Certificación de marca',
      'Renovación de Marca': 'Renovación de marca',
      'Presentación de Oposición': 'Presentación de oposición',
      'Cesión de Marca': 'Cesión de marca',
      'Ampliación de Alcance': 'Ampliación de alcance',
      'Respuesta a Oposición': 'Respuesta a oposición'
    };

    const servicioAPI = mapeoServicios[tipoServicio] || tipoServicio;
    
    // Transformar según el tipo de servicio
    let datosAPI = {};
    
    switch (servicioAPI) {
      case 'Búsqueda de antecedentes':
        datosAPI = {
          // Campos básicos requeridos (10 campos según API actualizada)
          pais: datosFrontend.pais || '',
          ciudad: datosFrontend.ciudad || '',
          nombres_apellidos: datosFrontend.nombres ? 
            `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim() : 
            datosFrontend.titular || '',
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || '',
          nombre_a_buscar: datosFrontend.nombreMarca || '',
          tipo_producto_servicio: datosFrontend.tipoProductoServicio || datosFrontend.categoria || '',
          // Campos adicionales compatibles con versión anterior
          nombre_solicitante: datosFrontend.nombres ? 
            `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim() : 
            datosFrontend.titular || '',
          documento_solicitante: datosFrontend.numeroDocumento || '',
          correo_electronico: datosFrontend.email || '',
          marca_a_buscar: datosFrontend.nombreMarca || '',
          clase_niza: datosFrontend.clases?.[0]?.numero || datosFrontend.categoria || '',
          descripcion_adicional: datosFrontend.descripcionAdicional || '',
          // Agregar id_cliente solo si está presente (admin/empleado)
          ...(datosFrontend.id_cliente && { id_cliente: datosFrontend.id_cliente })
        };
        break;
        
      case 'Certificación de marca':
        datosAPI = {
          // Campos básicos (10 campos)
          pais: datosFrontend.pais || '',
          ciudad: datosFrontend.ciudad || '',
          nombres_apellidos: datosFrontend.nombres ? 
            `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim() : 
            datosFrontend.titular || '',
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || '',
          nombre_a_buscar: datosFrontend.nombreMarca || '',
          tipo_producto_servicio: datosFrontend.tipoProductoServicio || datosFrontend.categoria || '',
          // Campos adicionales de Certificación de Marca (18 campos totales)
          tipo_titular: datosFrontend.tipoPersona || datosFrontend.tipoTitular || '',
          nombre_marca: datosFrontend.nombreMarca || '',
          clase_niza: datosFrontend.clases?.[0]?.numero || datosFrontend.categoria || '',
          descripcion_marca: datosFrontend.descripcionMarca || '',
          logotipo: datosFrontend.logotipoMarca || datosFrontend.logotipo || '',
          razon_social: datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '',
          nit_empresa: parseInt(datosFrontend.nit) || null,
          certificado_camara_comercio: datosFrontend.certificadoCamara || datosFrontend.certificadoCamaraComercio || '',
          poder_representante: datosFrontend.poderRepresentante || datosFrontend.poderAutorizacion || '',
          nombre_representante: datosFrontend.nombreRepresentante || '',
          documento_representante: datosFrontend.documentoRepresentante || '',
          // Campos compatibles con versión anterior
          logo: datosFrontend.logotipoMarca || datosFrontend.logotipo || '',
          nombre_completo_titular: datosFrontend.nombres ? 
            `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim() : 
            datosFrontend.titular || '',
          documento_identidad_titular: datosFrontend.numeroDocumento || '',
          direccion_titular: datosFrontend.direccion || '',
          ciudad_titular: datosFrontend.ciudad || '',
          pais_titular: datosFrontend.pais || '',
          correo_titular: datosFrontend.email || '',
          telefono_titular: datosFrontend.telefono || '',
          representante_legal: datosFrontend.representanteLegal || '',
          documento_representante_legal: datosFrontend.documentoRepresentanteLegal || '',
          poder: datosFrontend.poderRepresentante || '',
          nit: datosFrontend.nit || '',
          // Agregar id_cliente solo si está presente (admin/empleado)
          ...(datosFrontend.id_cliente && { id_cliente: datosFrontend.id_cliente })
        };
        break;
        
      // Agregar más casos según sea necesario
      default:
        datosAPI = {
          nombre_solicitante: datosFrontend.nombres ? 
            `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim() : 
            datosFrontend.titular || '',
          documento_solicitante: datosFrontend.numeroDocumento || '',
          correo_electronico: datosFrontend.email || '',
          telefono: datosFrontend.telefono || '',
          marca: datosFrontend.nombreMarca || '',
          descripcion: datosFrontend.descripcionAdicional || ''
        };
    }
    
    console.log('✅ [SolicitudesApiService] Datos transformados para API:', datosAPI);
    return { servicioAPI, datosAPI };
  }

  // Función para mapear estados de la API al frontend
  mapearEstadoAPIaFrontend(estadoAPI) {
    const mapeoEstados = {
      'Pendiente': 'Pendiente', // ✅ CORREGIDO: Pendiente se mantiene como Pendiente
      'Aprobada': 'Finalizada',
      'Rechazada': 'Anulada',
      'Anulada': 'Anulada'
    };
    return mapeoEstados[estadoAPI] || estadoAPI || 'Pendiente';
  }

  // Función para transformar respuesta de la API al formato del frontend
  transformarRespuestaDelAPI(respuestaAPI) {
    console.log('🔧 [SolicitudesApiService] Transformando respuesta de la API al frontend...', respuestaAPI);
    
    const respuestaFrontend = {
      id: respuestaAPI.id?.toString() || respuestaAPI.id_orden_servicio?.toString(),
      expediente: respuestaAPI.expediente || `EXP-${respuestaAPI.id || respuestaAPI.id_orden_servicio}`,
      titular: respuestaAPI.nombre_solicitante || respuestaAPI.nombre_completo_titular || respuestaAPI.titular || 'Sin titular',
      marca: respuestaAPI.marca_a_buscar || respuestaAPI.nombre_marca || respuestaAPI.marca || 'Sin marca',
      tipoSolicitud: respuestaAPI.servicio || respuestaAPI.tipoSolicitud || 'Sin servicio',
      encargado: respuestaAPI.encargado || 'Sin asignar',
      estado: this.mapearEstadoAPIaFrontend(respuestaAPI.estado),
      email: respuestaAPI.correo_electronico || respuestaAPI.correo_titular || respuestaAPI.email || '',
      telefono: respuestaAPI.telefono || respuestaAPI.telefono_titular || '',
      comentarios: respuestaAPI.comentarios || [],
      fechaCreacion: respuestaAPI.fecha_solicitud || respuestaAPI.fechaCreacion || new Date().toISOString(),
      fechaFin: respuestaAPI.fechaFin || null,
      // Campos adicionales de la API
      id_cliente: respuestaAPI.id_cliente,
      id_empresa: respuestaAPI.id_empresa,
      pais: respuestaAPI.pais,
      ciudad: respuestaAPI.ciudad,
      direccion: respuestaAPI.direccion
    };
    
    console.log('✅ [SolicitudesApiService] Respuesta transformada para frontend:', respuestaFrontend);
    return respuestaFrontend;
  }
}

// Crear instancia única del servicio
const solicitudesApiService = new SolicitudesApiService();

export default solicitudesApiService;
