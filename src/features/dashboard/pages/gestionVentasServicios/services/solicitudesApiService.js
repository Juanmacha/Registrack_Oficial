// Servicio para conectar solicitudes/procesos con la API real
import { apiConfig } from '../../../../../shared/config/apiConfig.js';

class SolicitudesApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    console.log('🔧 [SolicitudesApiService] Base URL configurada:', this.baseURL);
  }

  // Función para hacer peticiones HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Construir headers correctamente
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    // Construir config separando headers y body
    const config = {
      method: options.method || 'GET',
      headers: headers
    };
    
    // Solo agregar body si existe y asegurarse de que sea string JSON
    if (options.body) {
      config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      console.log('📤 [SolicitudesApiService] Request body:', config.body);
      console.log('📤 [SolicitudesApiService] Request headers:', headers);
    }

    try {
      console.log('🌐 [SolicitudesApiService] Base URL:', this.baseURL);
      console.log('🌐 [SolicitudesApiService] Endpoint:', endpoint);
      console.log('🌐 [SolicitudesApiService] URL completa:', url);
      console.log('🌐 [SolicitudesApiService] Method:', config.method);
      const response = await fetch(url, config);
      console.log('📡 [SolicitudesApiService] Response status:', response.status);
      
      if (!response.ok) {
        // Obtener información completa del error
        let errorData = {};
        let errorText = '';
        try {
          const text = await response.clone().text();
          errorText = text;
          console.error('❌ [SolicitudesApiService] Error response text:', text);
          console.error('❌ [SolicitudesApiService] Response status:', response.status);
          console.error('❌ [SolicitudesApiService] Response statusText:', response.statusText);
          console.error('❌ [SolicitudesApiService] Response headers:', Object.fromEntries(response.headers.entries()));
          try {
            errorData = JSON.parse(text);
            console.error('❌ [SolicitudesApiService] Error data parsed:', errorData);
            // Si hay detalles adicionales en el error, mostrarlos
            if (errorData.error?.details) {
              console.error('❌ [SolicitudesApiService] Error details:', errorData.error.details);
            }
            if (errorData.camposFaltantes) {
              console.error('❌ [SolicitudesApiService] Campos faltantes:', errorData.camposFaltantes);
            }
            if (errorData.camposRequeridos) {
              console.error('❌ [SolicitudesApiService] Campos requeridos:', errorData.camposRequeridos);
            }
            // Si hay stack trace en el error, mostrarlo
            if (errorData.stack) {
              console.error('❌ [SolicitudesApiService] Stack trace:', errorData.stack);
            }
            if (errorData.error?.stack) {
              console.error('❌ [SolicitudesApiService] Error stack trace:', errorData.error.stack);
            }
          } catch (parseError) {
            // Si no es JSON, usar el texto como mensaje
            errorText = text;
            console.error('❌ [SolicitudesApiService] No se pudo parsear error como JSON:', parseError);
            console.error('❌ [SolicitudesApiService] Texto del error:', text.substring(0, 500));
          }
        } catch (e) {
          console.error('❌ [SolicitudesApiService] No se pudo obtener error response:', e);
          errorText = `Error ${response.status}: ${response.statusText}`;
        }
        
        console.error('❌ [SolicitudesApiService] Error data completo:', errorData);
        
        // Extraer mensaje de error según formato del backend
        let errorMessage = errorData.mensaje || 
                           errorData.message || 
                           errorData.error?.message ||
                           errorData.error ||
                           errorText || 
                           `Error ${response.status}: ${response.statusText}`;
        
        // Para errores 500, agregar más contexto
        if (response.status === 500) {
          errorMessage = errorMessage || 'Error interno del servidor';
          if (errorData.error?.details) {
            errorMessage += `\nDetalles: ${JSON.stringify(errorData.error.details)}`;
          }
          if (errorData.camposFaltantes && errorData.camposFaltantes.length > 0) {
            errorMessage += `\nCampos faltantes: ${errorData.camposFaltantes.join(', ')}`;
          }
          if (errorData.camposRequeridos && errorData.camposRequeridos.length > 0) {
            errorMessage += `\nCampos requeridos: ${errorData.camposRequeridos.join(', ')}`;
          }
        }
        
        // Si hay campos faltantes, incluirlos en el mensaje
        if (errorData.camposFaltantes && errorData.camposFaltantes.length > 0) {
          errorMessage += `\nCampos faltantes: ${errorData.camposFaltantes.join(', ')}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ [SolicitudesApiService] Response data:', data);
      return data;
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
  // ✅ CORREGIDO: El parámetro :servicio debe ser el ID numérico del servicio, no el nombre
  async crearSolicitud(servicioId, datos, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Creando solicitud para servicio ID: ${servicioId}...`, datos);
      
      // ✅ IMPORTANTE: El endpoint espera el ID numérico del servicio, no el nombre
      // Validar que servicioId sea un número
      if (!servicioId || (typeof servicioId !== 'number' && isNaN(parseInt(servicioId)))) {
        throw new Error(`ID de servicio inválido: ${servicioId}. Debe ser un número.`);
      }
      
      // Asegurar que sea un número
      const idServicio = typeof servicioId === 'number' ? servicioId : parseInt(servicioId);
      
      // ✅ Logging detallado del payload antes de enviar
      console.log('📤 [SolicitudesApiService] ========== PAYLOAD COMPLETO ==========');
      console.log('📤 [SolicitudesApiService] Servicio ID:', idServicio);
      console.log('📤 [SolicitudesApiService] Total de campos:', Object.keys(datos).length);
      console.log('📤 [SolicitudesApiService] Campos enviados:', Object.keys(datos));
      console.log('📤 [SolicitudesApiService] Tamaño del payload (JSON):', JSON.stringify(datos).length, 'caracteres');
      
      // Log de cada campo (sin mostrar el contenido completo de base64)
      const datosLog = {};
      for (const [key, value] of Object.entries(datos)) {
        if (typeof value === 'string' && value.length > 100 && (key.includes('logo') || key.includes('poder') || key.includes('certificado') || key.includes('documento') || key.includes('soporte'))) {
          datosLog[key] = `[Base64 - ${value.length} caracteres]`;
        } else {
          datosLog[key] = value;
        }
      }
      console.log('📤 [SolicitudesApiService] Datos (resumidos):', datosLog);
      console.log('📤 [SolicitudesApiService] ===========================================');
      
      // Log final antes de enviar - mostrar estructura exacta sin los archivos completos
      const datosParaLog = {};
      for (const [key, value] of Object.entries(datos)) {
        if (typeof value === 'string' && value.startsWith('data:') && value.length > 100) {
          datosParaLog[key] = `[Base64 - ${value.length} caracteres, tipo: ${value.substring(5, value.indexOf(';'))}]`;
        } else {
          datosParaLog[key] = value;
        }
      }
      console.log('🔍 [SolicitudesApiService] DATOS FINALES QUE SE ENVIARÁN AL BACKEND:');
      console.log(JSON.stringify(datosParaLog, null, 2));
      console.log('🔍 [SolicitudesApiService] Número total de campos:', Object.keys(datos).length);
      console.log('🔍 [SolicitudesApiService] Campos presentes:', Object.keys(datos).join(', '));
      
      const solicitudCreada = await this.makeRequest(`/api/gestion-solicitudes/crear/${idServicio}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });
      
      console.log('✅ [SolicitudesApiService] Solicitud creada:', solicitudCreada);
      return solicitudCreada;
    } catch (error) {
      console.error(`❌ [SolicitudesApiService] Error creando solicitud para servicio ID ${servicioId}:`, error);
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
  async anularSolicitud(id, motivo, token) {
    try {
      console.log(`🔧 [SolicitudesApiService] Anulando solicitud ${id} con motivo: ${motivo}...`);
      
      // Validar que el motivo existe y no está vacío
      if (!motivo || !motivo.trim()) {
        throw new Error('El motivo de anulación es requerido');
      }
      
      const bodyData = {
        motivo: motivo.trim()
      };
      
      const bodyString = JSON.stringify(bodyData);
      console.log('📤 [SolicitudesApiService] Payload de anulación:', bodyString);
      console.log('📤 [SolicitudesApiService] BodyData objeto:', bodyData);
      
      const solicitudAnulada = await this.makeRequest(`/api/gestion-solicitudes/anular/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type ya está en makeRequest por defecto
        },
        body: bodyString  // ✅ Asegurar que es un string JSON
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

  // Función auxiliar para convertir archivo a Base64
  async convertirArchivoABase64(archivo) {
    if (!archivo) return null; // Retornar null en lugar de string vacío
    if (typeof archivo === 'string') {
      // Si ya es base64, validar que tenga el formato correcto
      if (archivo.trim() === '' || archivo === 'data:,') {
        return null;
      }
      return archivo; // Ya es Base64 válido
    }
    if (archivo instanceof File) {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(archivo);
          reader.onload = () => {
            const result = reader.result;
            // Validar que la conversión fue exitosa
            if (result && result.startsWith('data:')) {
              resolve(result);
            } else {
              reject(new Error('Error al convertir archivo a base64'));
            }
          };
          reader.onerror = error => {
            console.error('❌ [SolicitudesApiService] Error en FileReader:', error);
            reject(new Error('Error al leer el archivo'));
          };
        } catch (error) {
          console.error('❌ [SolicitudesApiService] Error al convertir archivo:', error);
          reject(error);
        }
      });
    }
    return null; // Retornar null para valores no válidos
  }
  
  /**
   * Limpiar datos antes de enviar: remover campos con valores null, undefined o strings vacíos
   * EXCEPTO si son campos requeridos por la API
   */
  limpiarDatosParaEnvio(datos, camposRequeridos = []) {
    const datosLimpios = {};
    for (const [key, value] of Object.entries(datos)) {
      // Si el campo es requerido, mantenerlo incluso si está vacío (el backend lo validará)
      if (camposRequeridos.includes(key)) {
        datosLimpios[key] = value === null || value === undefined ? '' : value;
      } 
      // Si no es requerido, solo incluir si tiene un valor válido
      else if (value !== null && value !== undefined && value !== '') {
        // Para archivos en base64, verificar que no sea solo el prefijo
        if (typeof value === 'string' && value.startsWith('data:') && value.length > 100) {
          datosLimpios[key] = value;
        } else if (typeof value !== 'string' || (typeof value === 'string' && value.trim() !== '')) {
          datosLimpios[key] = value;
        }
      }
    }
    return datosLimpios;
  }

  // Función para transformar datos del frontend al formato de la API
  async transformarDatosParaAPI(datosFrontend, tipoServicio, userRole = null) {
    console.log('🔧 [SolicitudesApiService] Transformando datos del frontend para API...', datosFrontend);
    console.log('🔧 [SolicitudesApiService] Rol del usuario:', userRole);
    
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
    
    // Helper para obtener nombres_apellidos
    const obtenerNombresApellidos = () => {
      if (datosFrontend.nombres && datosFrontend.apellidos) {
        return `${datosFrontend.nombres} ${datosFrontend.apellidos}`.trim();
      }
      return datosFrontend.nombresApellidos || datosFrontend.titular || '';
    };

    // Helper para obtener clase_niza
    const obtenerClaseNiza = () => {
      if (datosFrontend.clases && datosFrontend.clases.length > 0) {
        return datosFrontend.clases.map(c => c.numero).filter(n => n).join(', ');
      }
      return datosFrontend.claseNiza || datosFrontend.categoria || '';
    };

    // Helper para convertir archivos a Base64
    const convertirArchivos = async (campos) => {
      const datosConvertidos = {};
      for (const [key, value] of Object.entries(campos)) {
        if (value && (value instanceof File || typeof value === 'object')) {
          try {
            datosConvertidos[key] = await this.convertirArchivoABase64(value);
          } catch (error) {
            console.error(`❌ [SolicitudesApiService] Error convirtiendo archivo ${key}:`, error);
            datosConvertidos[key] = ''; // Usar string vacío si falla la conversión
          }
        } else {
          datosConvertidos[key] = value || '';
        }
      }
      return datosConvertidos;
    };
    
    // Transformar según el tipo de servicio
    let datosAPI = {};
    
    switch (servicioAPI) {
      case 'Búsqueda de antecedentes':
        // ✅ Validar campos requeridos antes de construir el objeto
        const nombresApellidos = obtenerNombresApellidos();
        const tipoDocumento = datosFrontend.tipoDocumento || '';
        const numeroDocumento = datosFrontend.numeroDocumento || '';
        const direccion = datosFrontend.direccion || '';
        const telefono = datosFrontend.telefono || '';
        const correo = datosFrontend.email || datosFrontend.correo || '';
        const pais = datosFrontend.pais || 'Colombia';
        const nombreABuscar = datosFrontend.nombreMarca || datosFrontend.nombreABuscar || '';
        const tipoProductoServicio = datosFrontend.tipoProductoServicio || datosFrontend.categoria || '';
        const logotipoBase64 = await this.convertirArchivoABase64(datosFrontend.logotipoMarca || datosFrontend.logotipo || '');
        
        // ✅ Logging detallado para debugging
        console.log('🔍 [SolicitudesApiService] Campos para Búsqueda de Antecedentes:');
        console.log('  - nombres_apellidos:', nombresApellidos);
        console.log('  - tipo_documento:', tipoDocumento);
        console.log('  - numero_documento:', numeroDocumento);
        console.log('  - direccion:', direccion);
        console.log('  - telefono:', telefono);
        console.log('  - correo:', correo);
        console.log('  - pais:', pais);
        console.log('  - nombre_a_buscar:', nombreABuscar);
        console.log('  - tipo_producto_servicio:', tipoProductoServicio);
        console.log('  - logotipo (tiene valor):', !!logotipoBase64, logotipoBase64 ? `(${logotipoBase64.length} caracteres)` : '');
        
        // ✅ Validar campos requeridos
        const camposFaltantes = [];
        if (!nombresApellidos || nombresApellidos.trim() === '') camposFaltantes.push('nombres_apellidos');
        if (!tipoDocumento || tipoDocumento.trim() === '') camposFaltantes.push('tipo_documento');
        if (!numeroDocumento || numeroDocumento.trim() === '') camposFaltantes.push('numero_documento');
        if (!direccion || direccion.trim() === '') camposFaltantes.push('direccion');
        if (!telefono || telefono.trim() === '') camposFaltantes.push('telefono');
        if (!correo || correo.trim() === '') camposFaltantes.push('correo');
        if (!pais || pais.trim() === '') camposFaltantes.push('pais');
        if (!nombreABuscar || nombreABuscar.trim() === '') camposFaltantes.push('nombre_a_buscar');
        if (!tipoProductoServicio || tipoProductoServicio.trim() === '') camposFaltantes.push('tipo_producto_servicio');
        if (!logotipoBase64 || logotipoBase64.trim() === '') camposFaltantes.push('logotipo');
        
        if (camposFaltantes.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes:', camposFaltantes);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
        }
        
        // ✅ Mapeo de campos según formato que el backend espera (documentación actualizada)
        // Campos requeridos según "Solicitar documentacion formularios.md":
        // nombres_apellidos, tipo_documento, numero_documento, direccion, telefono, 
        // correo, pais, nombre_a_buscar, tipo_producto_servicio, logotipo
        datosAPI = {
          // Campos requeridos (formato nuevo según documentación)
          nombres_apellidos: nombresApellidos.trim(),
          tipo_documento: tipoDocumento.trim(),
          numero_documento: numeroDocumento.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
          correo: correo.trim(),
          pais: pais.trim(),
          nombre_a_buscar: nombreABuscar.trim(),
          tipo_producto_servicio: tipoProductoServicio.trim(),
          logotipo: logotipoBase64,
          
          // Campos opcionales (si están presentes)
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {}),
          ...(datosFrontend.codigoPostal ? { codigo_postal: datosFrontend.codigoPostal.trim() } : {}),
          ...(obtenerClaseNiza() ? { clase_niza: obtenerClaseNiza() } : {})
        };
        break;
        
      case 'Certificación de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, numero_nit_cedula, nombre_marca, 
        // tipo_producto_servicio, certificado_camara_comercio, logotipo, poder_autorizacion
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio
        const esJuridicaCert = datosFrontend.tipoPersona === 'Jurídica' || datosFrontend.tipoSolicitante === 'Jurídica';
        
        // Convertir archivos a base64 (pueden retornar null si no existen)
        const certificadoCamaraBase64 = await this.convertirArchivoABase64(
          datosFrontend.certificadoCamara || datosFrontend.certificadoCamaraComercio || null
        );
        const logotipoBase64Cert = await this.convertirArchivoABase64(
          datosFrontend.logotipoMarca || datosFrontend.logotipo || null
        );
        const poderAutorizacionBase64 = await this.convertirArchivoABase64(
          datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || null
        );
        
        // Validar archivos requeridos según tipo de solicitante
        const camposFaltantesCert = [];
        
        // Para Natural: certificado_camara_comercio es opcional (personas naturales no tienen cámara de comercio)
        // Para Jurídica: certificado_camara_comercio es requerido
        if (esJuridicaCert) {
          if (!certificadoCamaraBase64 || (typeof certificadoCamaraBase64 === 'string' && !certificadoCamaraBase64.startsWith('data:'))) {
            camposFaltantesCert.push('certificado_camara_comercio');
          }
        }
        // Si es Natural y no hay certificado, no se incluye (opcional)
        
        // Logotipo siempre requerido
        if (!logotipoBase64Cert || (typeof logotipoBase64Cert === 'string' && !logotipoBase64Cert.startsWith('data:'))) {
          camposFaltantesCert.push('logotipo');
        }
        
        // Poder de autorización siempre requerido
        if (!poderAutorizacionBase64 || (typeof poderAutorizacionBase64 === 'string' && !poderAutorizacionBase64.startsWith('data:'))) {
          camposFaltantesCert.push('poder_autorizacion');
        }
        
        // Validar otros campos requeridos
        if (!obtenerNombresApellidos() || obtenerNombresApellidos().trim() === '') camposFaltantesCert.push('nombres_apellidos');
        if (!datosFrontend.tipoDocumento || datosFrontend.tipoDocumento.trim() === '') camposFaltantesCert.push('tipo_documento');
        if (!datosFrontend.numeroDocumento || datosFrontend.numeroDocumento.trim() === '') camposFaltantesCert.push('numero_documento');
        if (!datosFrontend.direccion || datosFrontend.direccion.trim() === '') camposFaltantesCert.push('direccion');
        if (!datosFrontend.telefono || datosFrontend.telefono.trim() === '') camposFaltantesCert.push('telefono');
        if (!datosFrontend.email && !datosFrontend.correo) camposFaltantesCert.push('correo');
        if (!datosFrontend.nombreMarca || datosFrontend.nombreMarca.trim() === '') camposFaltantesCert.push('nombre_marca');
        if (!datosFrontend.tipoProductoServicio && !datosFrontend.categoria) camposFaltantesCert.push('tipo_producto_servicio');
        
        if (camposFaltantesCert.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes en Certificación de marca:', camposFaltantesCert);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantesCert.join(', ')}`);
        }
        
        // Determinar tipo de solicitante final
        const tipoSolicitanteFinal = datosFrontend.tipoSolicitante === 'Titular' ? 
          (datosFrontend.tipoPersona || 'Natural') : 
          (datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' ? 
            datosFrontend.tipoSolicitante : 
            (datosFrontend.tipoPersona || 'Natural'));
        
        // Construir objeto base con campos siempre requeridos
        datosAPI = {
          // Campos siempre requeridos
          tipo_solicitante: tipoSolicitanteFinal,
          nombres_apellidos: obtenerNombresApellidos().trim(),
          tipo_documento: datosFrontend.tipoDocumento.trim(),
          numero_documento: datosFrontend.numeroDocumento.trim(),
          direccion: datosFrontend.direccion.trim(),
          telefono: datosFrontend.telefono.trim(),
          correo: (datosFrontend.email || datosFrontend.correo || '').trim(),
          pais: (datosFrontend.pais || 'Colombia').trim(),
          nombre_marca: datosFrontend.nombreMarca.trim(),
          tipo_producto_servicio: (datosFrontend.tipoProductoServicio || datosFrontend.categoria || '').trim(),
          logotipo: logotipoBase64Cert || '',
          poder_autorizacion: poderAutorizacionBase64 || ''
        };
        
        // Para Natural: numero_nit_cedula puede ser opcional o igual a numero_documento
        // Para Jurídica: numero_nit_cedula es requerido y debe ser diferente
        if (esJuridicaCert) {
          // Jurídica: campos adicionales requeridos
          const numeroNitCedula = (datosFrontend.numeroNitCedula || datosFrontend.nitMarca || '').trim();
          if (!numeroNitCedula) {
            camposFaltantesCert.push('numero_nit_cedula');
          }
          datosAPI.numero_nit_cedula = numeroNitCedula;
          datosAPI.certificado_camara_comercio = certificadoCamaraBase64 || '';
          datosAPI.tipo_entidad = (datosFrontend.tipoEntidad || '').trim();
          datosAPI.razon_social = (datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '').trim();
          datosAPI.nit_empresa = datosFrontend.nit ? parseInt(datosFrontend.nit) : null;
          datosAPI.representante_legal = (datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '').trim();
          datosAPI.direccion_domicilio = (datosFrontend.direccionDomicilio || datosFrontend.direccion || '').trim();
        } else {
          // Natural: numero_nit_cedula puede ser opcional, si no se proporciona usar numero_documento
          datosAPI.numero_nit_cedula = (datosFrontend.numeroNitCedula || datosFrontend.nitMarca || datosFrontend.numeroDocumento || '').trim();
          // Para Natural: certificado_camara_comercio es opcional, solo incluir si está presente
          if (certificadoCamaraBase64 && certificadoCamaraBase64.startsWith('data:')) {
            datosAPI.certificado_camara_comercio = certificadoCamaraBase64;
          }
          // NO incluir campos de jurídica (tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio)
        }
        
        // Validar campos faltantes después de construir el objeto
        if (camposFaltantesCert.length > 0) {
          console.error('❌ [SolicitudesApiService] Campos faltantes en Certificación de marca:', camposFaltantesCert);
          throw new Error(`Campos requeridos faltantes: ${camposFaltantesCert.join(', ')}`);
        }
        
        // Campos opcionales (solo agregar si tienen valor)
        if (datosFrontend.ciudad && datosFrontend.ciudad.trim()) {
          datosAPI.ciudad = datosFrontend.ciudad.trim();
        }
        if (obtenerClaseNiza() && obtenerClaseNiza().trim()) {
          datosAPI.clase_niza = obtenerClaseNiza();
        }
        
        // Limpiar datos: remover campos vacíos que no sean requeridos
        const camposRequeridosCert = [
          'tipo_solicitante', 'nombres_apellidos', 'tipo_documento', 'numero_documento',
          'direccion', 'telefono', 'correo', 'pais', 'numero_nit_cedula', 'nombre_marca',
          'tipo_producto_servicio', 'logotipo', 'poder_autorizacion'
        ];
        
        // Si es Jurídica, agregar campos condicionales a requeridos
        if (esJuridicaCert) {
          camposRequeridosCert.push('certificado_camara_comercio', 'tipo_entidad', 'razon_social', 'nit_empresa', 'representante_legal', 'direccion_domicilio');
        }
        // Si es Natural, certificado_camara_comercio NO está en requeridos (es opcional)
        
        datosAPI = this.limpiarDatosParaEnvio(datosAPI, camposRequeridosCert);
        
        // Log adicional para debugging
        console.log('🔍 [SolicitudesApiService] Tipo solicitante:', tipoSolicitanteFinal);
        console.log('🔍 [SolicitudesApiService] Es Jurídica:', esJuridicaCert);
        console.log('🔍 [SolicitudesApiService] Certificado incluido:', !!datosAPI.certificado_camara_comercio);
        if (datosAPI.certificado_camara_comercio) {
          console.log('🔍 [SolicitudesApiService] Tamaño certificado:', datosAPI.certificado_camara_comercio.length, 'caracteres');
        }
        break;

      case 'Renovación de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nombre_marca, numero_expediente_marca, 
        // poder_autorizacion, certificado_renovacion, logotipo
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, nit_empresa, representante_legal
        const esJuridicaRen = datosFrontend.tipoPersona === 'Jurídica' || datosFrontend.tipoSolicitante === 'Jurídica';
        datosAPI = {
          // Campos requeridos
          tipo_solicitante: datosFrontend.tipoSolicitante === 'Titular' ? 
            (datosFrontend.tipoPersona || 'Natural') : 
            (datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' ? 
              datosFrontend.tipoSolicitante : 
              (datosFrontend.tipoPersona || 'Natural')),
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          certificado_renovacion: await this.convertirArchivoABase64(datosFrontend.certificadoRenovacion || ''),
          logotipo: await this.convertirArchivoABase64(datosFrontend.logotipoMarca || datosFrontend.logotipo || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || ''),
          // Campos condicionales (si es Jurídica)
          ...(esJuridicaRen ? {
            tipo_entidad: datosFrontend.tipoEntidad || '',
            razon_social: datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '',
            nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null,
            representante_legal: datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || ''
          } : {}),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {}),
          ...(obtenerClaseNiza() ? { clase_niza: obtenerClaseNiza() } : {})
        };
        break;

      case 'Cesión de marca':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nombre_marca, numero_expediente_marca, 
        // documento_cesion, poder_autorizacion, nombre_razon_social_cesionario, nit_cesionario, 
        // representante_legal_cesionario, tipo_documento_cesionario, numero_documento_cesionario, 
        // correo_cesionario, telefono_cesionario, direccion_cesionario
        datosAPI = {
          // Campos requeridos del cedente
          tipo_solicitante: datosFrontend.tipoSolicitante === 'Titular' ? 
            (datosFrontend.tipoPersona || 'Natural') : 
            (datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' ? 
              datosFrontend.tipoSolicitante : 
              (datosFrontend.tipoPersona || 'Natural')),
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          documento_cesion: await this.convertirArchivoABase64(datosFrontend.documentoCesion || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || ''),
          // Campos requeridos del cesionario
          nombre_razon_social_cesionario: datosFrontend.nombreRazonSocialCesionario || datosFrontend.nombreCesionario || '',
          nit_cesionario: datosFrontend.nitCesionario || '',
          representante_legal_cesionario: datosFrontend.representanteLegalCesionario || '',
          tipo_documento_cesionario: datosFrontend.tipoDocumentoCesionario || '',
          numero_documento_cesionario: datosFrontend.numeroDocumentoCesionario || '',
          correo_cesionario: datosFrontend.correoCesionario || '',
          telefono_cesionario: datosFrontend.telefonoCesionario || '',
          direccion_cesionario: datosFrontend.direccionCesionario || '',
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        break;

      case 'Presentación de oposición':
        // ✅ Campos requeridos según documentación: tipo_solicitante, nombres_apellidos, tipo_documento, 
        // numero_documento, direccion, telefono, correo, pais, nit_empresa (SIEMPRE requerido), nombre_marca, 
        // marca_a_oponerse, poder_autorizacion, argumentos_respuesta, documentos_oposicion
        // Campos condicionales (si es Jurídica): tipo_entidad, razon_social, representante_legal
        const esJuridicaOpo = datosFrontend.tipoPersona === 'Jurídica' || datosFrontend.tipoSolicitante === 'Jurídica';
        datosAPI = {
          // Campos requeridos
          tipo_solicitante: datosFrontend.tipoSolicitante === 'Titular' ? 
            (datosFrontend.tipoPersona || 'Natural') : 
            (datosFrontend.tipoSolicitante === 'Natural' || datosFrontend.tipoSolicitante === 'Jurídica' ? 
              datosFrontend.tipoSolicitante : 
              (datosFrontend.tipoPersona || 'Natural')),
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null,
          nombre_marca: datosFrontend.nombreMarca || '',
          marca_a_oponerse: datosFrontend.marcaAOponerse || '',
          argumentos_respuesta: datosFrontend.argumentosRespuesta || '',
          documentos_oposicion: await this.convertirArchivoABase64(datosFrontend.documentosOposicion || ''),
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || ''),
          // Campos condicionales (si es Jurídica)
          ...(esJuridicaOpo ? {
            tipo_entidad: datosFrontend.tipoEntidad || '',
            razon_social: datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '',
            representante_legal: datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || ''
          } : {}),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        break;

      case 'Respuesta a oposición':
        // ✅ Campos requeridos según documentación: nombres_apellidos, tipo_documento, numero_documento, 
        // direccion, telefono, correo, pais, nit_empresa, nombre_marca, numero_expediente_marca, 
        // marca_opositora, poder_autorizacion, razon_social, representante_legal
        datosAPI = {
          // Campos requeridos
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          telefono: datosFrontend.telefono || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          pais: datosFrontend.pais || 'Colombia',
          razon_social: datosFrontend.razonSocial || datosFrontend.nombreEmpresa || '',
          nit_empresa: datosFrontend.nit ? parseInt(datosFrontend.nit) : null,
          representante_legal: datosFrontend.representanteLegal || datosFrontend.nombreRepresentante || '',
          nombre_marca: datosFrontend.nombreMarca || '',
          numero_expediente_marca: datosFrontend.numeroExpedienteMarca || datosFrontend.expediente || '',
          marca_opositora: datosFrontend.marcaOpositora || '',
          poder_autorizacion: await this.convertirArchivoABase64(datosFrontend.poderAutorizacion || datosFrontend.poderRepresentante || ''),
          // Campos opcionales
          ...(datosFrontend.ciudad ? { ciudad: datosFrontend.ciudad.trim() } : {})
        };
        break;

      case 'Ampliación de alcance':
        // ✅ Campos requeridos según documentación: documento_nit_titular, direccion, ciudad, pais, 
        // correo, telefono, numero_registro_existente, nombre_marca, clase_niza_actual, 
        // nuevas_clases_niza, descripcion_nuevos_productos_servicios, soportes
        datosAPI = {
          // Campos requeridos
          documento_nit_titular: datosFrontend.documentoNitTitular || datosFrontend.numeroNitCedula || datosFrontend.numeroDocumento || '',
          direccion: datosFrontend.direccion || '',
          ciudad: datosFrontend.ciudad || 'Bogotá',
          pais: datosFrontend.pais || 'Colombia',
          correo: datosFrontend.email || datosFrontend.correo || '',
          telefono: datosFrontend.telefono || '',
          numero_registro_existente: datosFrontend.numeroRegistroExistente || datosFrontend.expediente || '',
          nombre_marca: datosFrontend.nombreMarca || '',
          clase_niza_actual: datosFrontend.claseNizaActual || datosFrontend.clases?.[0]?.numero || '',
          nuevas_clases_niza: datosFrontend.nuevasClasesNiza || 
            (datosFrontend.clases && datosFrontend.clases.length > 1 ? 
              datosFrontend.clases.slice(1).map(c => c.numero).filter(n => n).join(', ') : ''),
          descripcion_nuevos_productos_servicios: datosFrontend.descripcionNuevosProductosServicios || datosFrontend.descripcionAdicional || '',
          soportes: await this.convertirArchivoABase64(datosFrontend.soportes || '')
        };
        break;
        
      default:
        datosAPI = {
          nombres_apellidos: obtenerNombresApellidos(),
          tipo_documento: datosFrontend.tipoDocumento || '',
          numero_documento: datosFrontend.numeroDocumento || '',
          correo: datosFrontend.email || datosFrontend.correo || '',
          telefono: datosFrontend.telefono || '',
          direccion: datosFrontend.direccion || '',
          pais: datosFrontend.pais || 'Colombia',
          ciudad: datosFrontend.ciudad || 'Bogotá',
          nombre_marca: datosFrontend.nombreMarca || '',
          descripcion_adicional: datosFrontend.descripcionAdicional || ''
        };
    }
    
    // 🔥 NUEVO: Lógica de id_cliente según rol (Enero 2026)
    // Clientes: NO enviar id_cliente (se toma del token)
    // Admin/Empleado: DEBE enviar id_cliente (obligatorio)
    if (userRole === 'cliente') {
      // Cliente: NO incluir id_cliente (se toma automáticamente del token)
      if (datosFrontend.id_cliente) {
        console.warn('⚠️ [SolicitudesApiService] Cliente no debe enviar id_cliente, se removerá del body');
        delete datosAPI.id_cliente;
      }
      // Asegurar que no esté en datosAPI
      delete datosAPI.id_cliente;
    } else if (userRole === 'administrador' || userRole === 'empleado') {
      // Admin/Empleado: Validar que id_cliente esté presente (obligatorio)
      if (!datosFrontend.id_cliente) {
        throw new Error('El campo id_cliente es obligatorio para administradores y empleados');
      }
      datosAPI.id_cliente = datosFrontend.id_cliente;
      console.log('✅ [SolicitudesApiService] Admin/Empleado - id_cliente incluido:', datosAPI.id_cliente);
    } else {
      // Si no se especifica rol, asumir cliente (no enviar id_cliente)
      delete datosAPI.id_cliente;
      console.warn('⚠️ [SolicitudesApiService] Rol no especificado, asumiendo cliente (no se envía id_cliente)');
    }
    
    // Los datos ya fueron limpiados en cada caso del switch
    // Solo asegurar que no haya valores null que puedan causar problemas
    const datosFinales = {};
    for (const [key, value] of Object.entries(datosAPI)) {
      // Convertir null a string vacío para campos que el backend espera como strings
      if (value === null) {
        datosFinales[key] = '';
      } else {
        datosFinales[key] = value;
      }
    }
    
    console.log('✅ [SolicitudesApiService] Datos transformados para API:');
    console.log('  - Total de campos:', Object.keys(datosFinales).length);
    console.log('  - Campos:', Object.keys(datosFinales));
    console.log('  - Tamaño del payload (aproximado):', JSON.stringify(datosFinales).length, 'caracteres');
    
    // Log detallado de archivos (sin mostrar el contenido completo)
    const archivosInfo = {};
    for (const [key, value] of Object.entries(datosFinales)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        archivosInfo[key] = `[Base64 - ${value.length} caracteres]`;
      } else {
        archivosInfo[key] = value;
      }
    }
    console.log('  - Datos (archivos resumidos):', archivosInfo);
    
    return { servicioAPI, datosAPI: datosFinales };
  }

  // Función para mapear estados de la API al frontend
  mapearEstadoAPIaFrontend(estadoAPI) {
    // ✅ IMPORTANTE: El backend usa estados dinámicos del process_state (no ENUMs genéricos)
    // Ejemplos: "Solicitud Inicial", "Verificación de Documentos", "Aprobación Final"
    // Solo mapear estados especiales que el backend pueda usar para solicitudes terminales:
    const mapeoEstados = {
      'Anulada': 'Anulada',           // Estado especial cuando se anula
      'Anulado': 'Anulado',           // ✅ NUEVO: Backend usa "Anulado" (masculino)
      'Rechazada': 'Rechazada',       // Estado especial cuando se rechaza
      'Rechazado': 'Rechazado',       // ✅ NUEVO: Backend puede usar "Rechazado" (masculino)
      'Finalizada': 'Finalizada',     // Estado especial cuando se completa
      'Finalizado': 'Finalizado',     // ✅ NUEVO: Backend puede usar "Finalizado" (masculino)
      'Aprobada': 'Finalizada',       // Por si el backend usa "Aprobada" en vez de "Finalizada"
      'Aprobado': 'Finalizado'        // Por si el backend usa "Aprobado" en vez de "Finalizado"
    };
    
    const estadoMapeado = mapeoEstados[estadoAPI];
    if (estadoMapeado) {
      return estadoMapeado;
    }
    
    // ✅ CORRECTO: Mantener los estados dinámicos del process_state tal cual vienen
    // Ejemplos del backend: "Solicitud Inicial", "Verificación de Documentos", 
    // "Procesamiento de Pago", "Consulta en BD", "Generación de Certificado", "Entrega Final"
    return estadoAPI || 'Sin Estado';
  }

  // Función para transformar respuesta de la API al formato del frontend
  transformarRespuestaDelAPI(respuestaAPI) {
    // ✅ Log de debugging deshabilitado - Backend confirmado con 36 campos (28 Oct 2025)
    // if (!this._loggedOnce) {
    //   console.log('🔍 [SolicitudesApiService] DATOS RAW del backend (sin transformar):', respuestaAPI);
    //   console.log('🔍 [SolicitudesApiService] Campos disponibles:', Object.keys(respuestaAPI));
    //   this._loggedOnce = true;
    // }
    
    // ✅ MEJORADO: Extraer titular de múltiples fuentes posibles
    const titular = respuestaAPI.nombre_solicitante || 
                    respuestaAPI.nombre_completo_titular || 
                    respuestaAPI.nombres_apellidos ||
                    respuestaAPI.titular || 
                    respuestaAPI.cliente?.nombre ||
                    'Sin titular';
    
    // ✅ MEJORADO: Extraer marca de múltiples fuentes posibles
    const marca = respuestaAPI.marca_a_buscar || 
                  respuestaAPI.nombre_marca || 
                  respuestaAPI.marca || 
                  respuestaAPI.nombre_a_buscar ||
                  'Sin marca';
    
    // ✅ MEJORADO: Extraer servicio de múltiples fuentes (puede ser objeto o string)
    const tipoSolicitud = respuestaAPI.servicio?.nombre || 
                          respuestaAPI.servicio || 
                          respuestaAPI.tipoSolicitud || 
                          'Sin servicio';
    
    // ✅ MEJORADO: Extraer encargado de múltiples fuentes (puede ser objeto)
    const encargado = respuestaAPI.empleado_asignado?.nombre ||
                      respuestaAPI.empleado_asignado?.nombres ||
                      (respuestaAPI.empleado_asignado ? 
                        `${respuestaAPI.empleado_asignado.nombres || ''} ${respuestaAPI.empleado_asignado.apellidos || ''}`.trim() : 
                        null) ||
                      respuestaAPI.empleado?.nombre ||
                      respuestaAPI.encargado || 
                      'Sin asignar';
    
    // ✅ MEJORADO: Extraer email de múltiples fuentes
    const email = respuestaAPI.correo_electronico || 
                  respuestaAPI.correo_titular || 
                  respuestaAPI.correo ||
                  respuestaAPI.email || 
                  respuestaAPI.cliente?.correo ||
                  '';
    
    // ✅ MEJORADO: Extraer teléfono de múltiples fuentes
    const telefono = respuestaAPI.telefono || 
                     respuestaAPI.telefono_titular || 
                     respuestaAPI.cliente?.telefono ||
                     '';
    
    // ✅ MEJORADO: Extraer fechas con múltiples formatos
    const fechaCreacion = respuestaAPI.fecha_solicitud || 
                          respuestaAPI.createdAt ||
                          respuestaAPI.created_at ||
                          respuestaAPI.fechaCreacion || 
                          new Date().toISOString();
    
    const fechaFin = respuestaAPI.fecha_finalizacion ||
                     respuestaAPI.updatedAt ||
                     respuestaAPI.updated_at ||
                     respuestaAPI.fechaFin || 
                     null;
    
    const respuestaFrontend = {
      id: respuestaAPI.id?.toString() || respuestaAPI.id_orden_servicio?.toString(),
      expediente: respuestaAPI.expediente || `EXP-${respuestaAPI.id || respuestaAPI.id_orden_servicio}`,
      titular,
      marca,
      tipoSolicitud,
      encargado,
      estado: this.mapearEstadoAPIaFrontend(respuestaAPI.estado),
      email,
      telefono,
      comentarios: respuestaAPI.comentarios || [],
      fechaCreacion,
      fechaFin,
      
      // ✅ Campos para la tabla (con múltiples fuentes)
      pais: respuestaAPI.pais || respuestaAPI.pais_titular || '',
      ciudad: respuestaAPI.ciudad || respuestaAPI.ciudad_titular || '',
      direccion: respuestaAPI.direccion || respuestaAPI.direccion_titular || '',
      tipoDocumento: respuestaAPI.tipo_documento || respuestaAPI.tipodedocumento || '',
      numeroDocumento: respuestaAPI.numero_documento || respuestaAPI.numerodedocumento || '',
      tipoPersona: respuestaAPI.tipo_persona || respuestaAPI.tipodepersona || '',
      
      // ✅ Campos adicionales para la tabla y ver detalle
      nombreCompleto: titular,
      nombreMarca: marca,
      categoria: respuestaAPI.clase_niza || respuestaAPI.categoria || '',
      tipoSolicitante: respuestaAPI.tipo_solicitante || '',
      tipoEntidad: respuestaAPI.tipo_entidad || respuestaAPI.tipodeentidadrazonsocial || '',
      razonSocial: respuestaAPI.razon_social || respuestaAPI.nombre_razon_social || '',
      nombreEmpresa: respuestaAPI.nombre_empresa || respuestaAPI.nombredelaempresa || '',
      nit: respuestaAPI.nit || respuestaAPI.nit_empresa || respuestaAPI.documento_nit || '',
      
      // IDs para relaciones
      id_cliente: respuestaAPI.id_cliente,
      id_empresa: respuestaAPI.id_empresa,
      id_empleado_asignado: respuestaAPI.id_empleado_asignado,
      
      // ✅ Información completa del servicio si está disponible
      servicioCompleto: respuestaAPI.servicio || null,
      
      // ✅ Información completa del empleado si está disponible
      empleadoCompleto: respuestaAPI.empleado_asignado || respuestaAPI.empleado || null,
      
      // ✅ Información completa del cliente si está disponible
      clienteCompleto: respuestaAPI.cliente || null
    };
    
    // console.log('✅ [SolicitudesApiService] Respuesta transformada para frontend:', respuestaFrontend);
    // console.log('🔍 [SolicitudesApiService] Campos extraídos:');
    // console.log('   - Titular:', titular);
    // console.log('   - Marca:', marca);
    // console.log('   - Servicio:', tipoSolicitud);
    // console.log('   - Encargado:', encargado);
    // console.log('   - Estado:', respuestaFrontend.estado);
    
    return respuestaFrontend;
  }
}

// Crear instancia única del servicio
const solicitudesApiService = new SolicitudesApiService();

export default solicitudesApiService;
