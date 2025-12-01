import apiService from '../../../shared/services/apiService.js';
import API_CONFIG from '../../../shared/config/apiConfig.js';
import alertService from '../../../utils/alertService.js';

// Servicio para citas usando la API real
const citasApiService = {
  // Función de prueba para verificar conectividad
  testConnection: async () => {
    try {
      console.log('🧪 [CitasApiService] Probando conectividad con la API...');
      const response = await apiService.get(API_CONFIG.ENDPOINTS.APPOINTMENTS);
      console.log('🧪 [CitasApiService] Respuesta de prueba:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('🧪 [CitasApiService] Error en prueba de conectividad:', error);
      return { success: false, error: error };
    }
  },

  // Función para verificar si hay citas en la base de datos
  checkCitasExists: async () => {
    try {
      console.log('🔍 [CitasApiService] Verificando si existen citas...');
      const response = await apiService.get(API_CONFIG.ENDPOINTS.APPOINTMENTS);
      console.log('🔍 [CitasApiService] Respuesta completa:', response);
      
      let citasCount = 0;
      let citasData = [];
      
      if (response.data?.citas && Array.isArray(response.data.citas)) {
        citasData = response.data.citas;
        citasCount = response.data.citas.length;
      } else if (Array.isArray(response.data)) {
        citasData = response.data;
        citasCount = response.data.length;
      }
      
      console.log('📊 [CitasApiService] Estadísticas de citas:', {
        totalCitas: citasCount,
        hasData: citasCount > 0,
        firstCita: citasCount > 0 ? citasData[0] : null,
        allCitas: citasData
      });
      
      return {
        success: true,
        count: citasCount,
        data: citasData,
        hasCitas: citasCount > 0
      };
    } catch (error) {
      console.error('🔍 [CitasApiService] Error al verificar citas:', error);
      return { success: false, count: 0, hasCitas: false, error: error };
    }
  },
  // Obtener todas las citas
  getAllCitas: async () => {
    try {
      console.log('📅 [CitasApiService] Obteniendo todas las citas...');
      
      const response = await apiService.get(API_CONFIG.ENDPOINTS.APPOINTMENTS);
      console.log('📥 [CitasApiService] Respuesta recibida:', response);
      console.log('📊 [CitasApiService] Estructura de respuesta:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasCitas: !!(response.data?.citas),
        citasLength: Array.isArray(response.data?.citas) ? response.data.citas.length : 'N/A'
      });
      
      // Determinar qué datos usar
      let citasData = response.data;
      if (response.data?.citas && Array.isArray(response.data.citas)) {
        citasData = response.data.citas;
      } else if (!Array.isArray(response.data)) {
        citasData = [];
      }
      
      console.log('📋 [CitasApiService] Datos finales de citas:', citasData);
      
      return {
        success: true,
        data: citasData,
        message: response.message || 'Citas obtenidas correctamente'
      };
    } catch (error) {
      console.error('💥 [CitasApiService] Error al obtener citas:', error);
      
      let errorMessage = 'Error al obtener las citas';
      
      if (error.response?.status === 401) {
        errorMessage = 'No autorizado para ver las citas';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para acceder a las citas';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      return {
        success: false,
        data: [],
        message: errorMessage
      };
    }
  },

  // Crear nueva cita
  createCita: async (citaData) => {
    try {
      console.log('📅 [CitasApiService] ========== INICIO CREAR CITA ==========');
      console.log('📤 [CitasApiService] Datos recibidos:', citaData);
      console.log('📤 [CitasApiService] Tipo de citaData:', typeof citaData);
      console.log('📤 [CitasApiService] id_usuario en citaData:', citaData?.id_usuario);
      console.log('📤 [CitasApiService] Tipo de id_usuario:', typeof citaData?.id_usuario);
      console.log('📤 [CitasApiService] citaData completo (JSON):', JSON.stringify(citaData, null, 2));
      
      // Validar datos antes de enviar
      console.log('🔍 [CitasApiService] Validando datos recibidos...');
      const validation = citasApiService.validateCitaData(citaData);
      console.log('🔍 [CitasApiService] Resultado de validación:', validation);
      console.log('🔍 [CitasApiService] ¿Es válido?:', validation.isValid);
      console.log('🔍 [CitasApiService] Errores encontrados:', validation.errors);
      
      if (!validation.isValid) {
        console.log('❌ [CitasApiService] Validación falló:', validation.errors);
        return {
          success: false,
          data: null,
          message: 'Datos inválidos: ' + Object.values(validation.errors).join(', ')
        };
      }
      
      console.log('✅ [CitasApiService] Validación exitosa');
      
      // Transformar datos al formato esperado por la API
      // Según la documentación: se debe enviar id_usuario (no id_cliente)
      const requestData = {
        fecha: citaData.fecha,
        hora_inicio: citaData.hora_inicio,
        hora_fin: citaData.hora_fin,
        tipo: citaData.tipo,
        modalidad: citaData.modalidad,
        id_usuario: citaData.id_usuario, // ✅ USAR id_usuario (usuario con rol "cliente")
        id_empleado: citaData.id_empleado,
        estado: citaData.estado || 'Programada',
        observacion: citaData.observacion || '',
        // Incluir datos del cliente si están disponibles
        ...(citaData.cliente && {
          cliente_nombre: citaData.cliente.nombre,
          cliente_apellido: citaData.cliente.apellido,
          cliente_documento: citaData.cliente.documento,
          cliente_telefono: citaData.cliente.telefono
        })
      };
      
      console.log('🔄 [CitasApiService] Enviando solicitud a:', API_CONFIG.ENDPOINTS.APPOINTMENTS);
      console.log('📤 [CitasApiService] Datos transformados:', requestData);
      console.log('📤 [CitasApiService] Datos transformados (JSON):', JSON.stringify(requestData, null, 2));
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.APPOINTMENTS, requestData);
      console.log('📥 [CitasApiService] Respuesta recibida:', response);
      console.log('📊 [CitasApiService] Status:', response.status);
      console.log('📊 [CitasApiService] Data:', response.data);
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Cita creada exitosamente'
      };
    } catch (error) {
      console.error('💥 [CitasApiService] Error al crear cita:', error);
      console.error('💥 [CitasApiService] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: API_CONFIG.ENDPOINTS.APPOINTMENTS
      });
      
      // Log detallado del error de la API
      if (error.response?.data) {
        console.error('💥 [CitasApiService] Error data completo:', JSON.stringify(error.response.data, null, 2));
        if (error.response.data.error) {
          console.error('💥 [CitasApiService] Error específico:', error.response.data.error);
        }
        if (error.response.data.message) {
          console.error('💥 [CitasApiService] Mensaje de error:', error.response.data.message);
        }
        
        // ✅ Verificar si el error es porque la cita ya existe (probablemente creada en un intento anterior)
        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || '';
          const errorData = error.response.data?.data || {};
          const citaExistente = errorData?.cita_existente;
          
          // Si el backend indica que ya existe una cita y proporciona los datos de la cita existente
          if ((errorMessage.includes('ya tiene una cita') || errorMessage.includes('cita activa') || errorMessage.includes('horario')) && citaExistente) {
            console.log('✅ [CitasApiService] El backend indica que ya existe una cita con estos datos.');
            console.log('✅ [CitasApiService] Verificando si la cita coincide con los datos enviados...');
            
            // Verificar si los datos coinciden (fecha, hora, empleado)
            const fechaCoincide = citaExistente.fecha === requestData.fecha;
            const horaInicioCoincide = citaExistente.hora_inicio === requestData.hora_inicio ||
                                     citaExistente.hora_inicio === requestData.hora_inicio.replace(':00', '');
            const horaFinCoincide = citaExistente.hora_fin === requestData.hora_fin ||
                                  citaExistente.hora_fin === requestData.hora_fin.replace(':00', '');
            
            // Verificar empleado (puede venir como id_empleado directo o en objeto empleado)
            const idEmpleadoCita = citaExistente.id_empleado || citaExistente.empleado?.id_empleado || citaExistente.empleado?.id;
            const empleadoCoincide = idEmpleadoCita === parseInt(requestData.id_empleado);
            
            // También verificar usuario (cliente) si está disponible
            let clienteCoincide = true;
            // Verificar por id_usuario (nuevo formato según documentación)
            if (requestData.id_usuario && citaExistente.id_usuario) {
              clienteCoincide = citaExistente.id_usuario === parseInt(requestData.id_usuario);
            } else if (requestData.id_usuario && citaExistente.id_cliente) {
              // Fallback: si la cita existente tiene id_cliente, verificar por id_cliente del usuario
              clienteCoincide = citaExistente.id_cliente === parseInt(requestData.id_usuario);
            }
            
            if (fechaCoincide && horaInicioCoincide && horaFinCoincide && empleadoCoincide && clienteCoincide) {
              console.log('✅ [CitasApiService] ¡Cita encontrada! Los datos coinciden. La cita se creó exitosamente en un intento anterior.');
              console.log('✅ [CitasApiService] ID de cita creada:', citaExistente.id_cita || citaExistente.id);
              
              // Tratar como éxito si la cita existe con los mismos datos
              return {
                success: true,
                data: citaExistente,
                message: 'Cita creada exitosamente (la cita ya existía, probablemente creada en un intento anterior que tuvo timeout)'
              };
            } else {
              console.warn('⚠️ [CitasApiService] La cita existente no coincide completamente con los datos enviados.');
              console.warn('⚠️ [CitasApiService] Coincidencias:', {
                fecha: fechaCoincide,
                horaInicio: horaInicioCoincide,
                horaFin: horaFinCoincide,
                empleado: empleadoCoincide,
                cliente: clienteCoincide
              });
            }
          }
        }
      }
      
      let errorMessage = 'Error al crear la cita';
      
      if (error.response?.status === 400) {
        const serverMessage = error.response.data?.message || '';
        if (serverMessage.includes('ya tiene una cita') || serverMessage.includes('cita activa') || serverMessage.includes('horario')) {
          errorMessage = `${serverMessage}. Por favor, verifique las citas existentes en el calendario o intente con otro horario.`;
        } else {
          errorMessage = 'Datos inválidos para la cita: ' + (serverMessage || JSON.stringify(error.response.data));
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Debe estar autenticado para crear una cita';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para crear citas';
      } else if (error.response?.status === 409) {
        errorMessage = 'Conflicto de horarios: el empleado ya tiene una cita en ese horario';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  },

  // Reprogramar cita
  reprogramarCita: async (citaId, nuevosDatos) => {
    try {
      console.log('📅 [CitasApiService] Reprogramando cita ID:', citaId);
      console.log('📤 [CitasApiService] Nuevos datos:', nuevosDatos);
      
      // Validar datos específicos para reprogramar (solo fecha, hora_inicio, hora_fin)
      const validation = citasApiService.validateReprogramarData(nuevosDatos);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Datos inválidos: ' + Object.values(validation.errors).join(', ')
        };
      }
      
      const requestData = {
        fecha: nuevosDatos.fecha,
        hora_inicio: nuevosDatos.hora_inicio,
        hora_fin: nuevosDatos.hora_fin,
        observacion: nuevosDatos.observacion || ''
      };
      
      // Incluir id_empleado si se proporciona (para cambiar de empleado al reprogramar)
      if (nuevosDatos.id_empleado) {
        requestData.id_empleado = nuevosDatos.id_empleado;
      }
      
      const response = await apiService.put(
        API_CONFIG.ENDPOINTS.RESCHEDULE_APPOINTMENT(citaId), 
        requestData
      );
      console.log('📥 [CitasApiService] Cita reprogramada:', response);
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Cita reprogramada exitosamente'
      };
    } catch (error) {
      console.error('💥 [CitasApiService] Error al reprogramar cita:', error);
      
      let errorMessage = 'Error al reprogramar la cita';
      
      if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos para reprogramar la cita';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para reprogramar citas';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para reprogramar citas';
      } else if (error.response?.status === 404) {
        errorMessage = 'Cita no encontrada';
      } else if (error.response?.status === 409) {
        errorMessage = 'Conflicto de horarios: el empleado ya tiene una cita en ese horario';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  },

  // Anular cita
  anularCita: async (citaId, motivo) => {
    try {
      console.log('📅 [CitasApiService] Anulando cita ID:', citaId);
      console.log('📤 [CitasApiService] Motivo:', motivo);
      
      const requestData = {
        observacion: motivo || 'Cita anulada'
      };
      
      const response = await apiService.put(
        API_CONFIG.ENDPOINTS.CANCEL_APPOINTMENT(citaId), 
        requestData
      );
      console.log('📥 [CitasApiService] Cita anulada:', response);
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Cita anulada exitosamente'
      };
    } catch (error) {
      console.error('💥 [CitasApiService] Error al anular cita:', error);
      
      let errorMessage = 'Error al anular la cita';
      
      if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos para anular la cita';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado para anular citas';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para anular citas';
      } else if (error.response?.status === 404) {
        errorMessage = 'Cita no encontrada';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  },

  // Descargar reporte de citas en Excel
  downloadReporteExcel: async () => {
    try {
      console.log('📅 [CitasApiService] Descargando reporte Excel...');
      
      const response = await apiService.get(API_CONFIG.ENDPOINTS.APPOINTMENTS_REPORT);
      console.log('📥 [CitasApiService] Reporte descargado:', response);
      
      // La respuesta debería ser un blob o datos para descarga
      return {
        success: true,
        data: response,
        message: 'Reporte descargado exitosamente'
      };
    } catch (error) {
      console.error('💥 [CitasApiService] Error al descargar reporte:', error);
      
      let errorMessage = 'Error al descargar el reporte';
      
      if (error.response?.status === 401) {
        errorMessage = 'No autorizado para descargar reportes';
      } else if (error.response?.status === 403) {
        errorMessage = 'Sin permisos para descargar reportes';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  },

  // Crear cita asociada a una solicitud
  crearCitaDesdeSolicitud: async (idOrdenServicio, datosCita, token) => {
    try {
      console.log(`📅 [CitasApiService] Creando cita desde solicitud ${idOrdenServicio}...`);
      console.log('📤 [CitasApiService] Datos de la cita recibidos:', datosCita);
      
      // Validar campos requeridos según documentación
      if (!datosCita.fecha) {
        throw new Error('El campo fecha es requerido');
      }
      if (!datosCita.hora_inicio) {
        throw new Error('El campo hora_inicio es requerido');
      }
      if (!datosCita.hora_fin) {
        throw new Error('El campo hora_fin es requerido');
      }
      if (!datosCita.id_empleado) {
        throw new Error('El campo id_empleado es requerido');
      }
      if (!datosCita.modalidad) {
        throw new Error('El campo modalidad es requerido');
      }
      
      // Validar formato de fecha (YYYY-MM-DD)
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(datosCita.fecha)) {
        throw new Error('El formato de fecha debe ser YYYY-MM-DD');
      }
      
      // Asegurar formato de hora HH:MM:SS
      let horaInicio = datosCita.hora_inicio;
      if (horaInicio.includes(':') && horaInicio.split(':').length === 2) {
        horaInicio = horaInicio + ':00';
      } else if (!horaInicio.includes(':')) {
        throw new Error('El formato de hora_inicio debe ser HH:MM o HH:MM:SS');
      }
      
      let horaFin = datosCita.hora_fin;
      if (horaFin.includes(':') && horaFin.split(':').length === 2) {
        horaFin = horaFin + ':00';
      } else if (!horaFin.includes(':')) {
        throw new Error('El formato de hora_fin debe ser HH:MM o HH:MM:SS');
      }
      
      // Validar modalidad
      const modalidadesValidas = ['Presencial', 'Virtual'];
      if (!modalidadesValidas.includes(datosCita.modalidad)) {
        throw new Error(`La modalidad debe ser una de: ${modalidadesValidas.join(', ')}`);
      }
      
      // Construir payload según documentación de la API
      const requestData = {
        fecha: datosCita.fecha, // YYYY-MM-DD
        hora_inicio: horaInicio, // HH:MM:SS
        hora_fin: horaFin, // HH:MM:SS
        id_empleado: parseInt(datosCita.id_empleado), // number
        modalidad: datosCita.modalidad // "Presencial" | "Virtual"
      };
      
      // Campo opcional: observacion
      if (datosCita.observacion && datosCita.observacion.trim()) {
        requestData.observacion = datosCita.observacion.trim();
      }
      
      console.log('📤 [CitasApiService] Payload final validado:', JSON.stringify(requestData, null, 2));
      console.log('📋 [CitasApiService] Campos incluidos en payload:', {
        fecha: requestData.fecha,
        hora_inicio: requestData.hora_inicio,
        hora_fin: requestData.hora_fin,
        id_empleado: requestData.id_empleado,
        modalidad: requestData.modalidad,
        observacion: requestData.observacion || 'No incluida',
        idOrdenServicio: idOrdenServicio
      });
      
      // Llamar al endpoint específico
      const endpoint = API_CONFIG.ENDPOINTS.CREATE_APPOINTMENT_FROM_REQUEST(idOrdenServicio);
      console.log('🌐 [CitasApiService] Endpoint:', endpoint);
      console.log('📧 [CitasApiService] Nota: El backend debería enviar emails automáticamente al cliente y empleado cuando recibe 200 OK');
      
      // El token se maneja automáticamente en makeHttpRequest desde localStorage
      // No es necesario pasarlo manualmente
      const response = await apiService.post(endpoint, requestData);
      
      console.log('✅ [CitasApiService] Respuesta del servidor:', response);
      console.log('✅ [CitasApiService] Tipo de respuesta:', typeof response);
      console.log('✅ [CitasApiService] Respuesta completa (stringify):', JSON.stringify(response, null, 2));
      
      // apiService.post devuelve response.data (ya parseado desde makeRequest)
      // Entonces response ya ES el data del backend
      console.log('✅ [CitasApiService] responseData extraído:', response);
      
      return {
        success: true,
        data: response,
        message: response?.message || 'Cita agendada exitosamente'
      };
      
    } catch (error) {
      console.error('❌ [CitasApiService] Error al crear cita desde solicitud:', error);
      console.error('❌ [CitasApiService] Detalles del error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Error al agendar la cita';
      
      // Si el error tiene una respuesta del servidor
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data || {};
        
        // Extraer mensaje de error de diferentes formatos posibles
        const serverMessage = responseData.message || 
                             responseData.mensaje || 
                             responseData.error?.message || 
                             responseData.error?.mensaje ||
                             responseData.error ||
                             JSON.stringify(responseData);
        
        switch (status) {
          case 400:
            // Si es error de conflicto de horario, verificar si la cita realmente existe
            if (serverMessage.includes('Ya existe una cita') || serverMessage.includes('horario')) {
              console.warn('⚠️ [CitasApiService] CONFLICTO DE HORARIO DETECTADO');
              console.warn('⚠️ [CitasApiService] Verificando si la cita se creó exitosamente en un intento anterior...');
              
              try {
                // Intentar obtener todas las citas para verificar si existe la cita que intentamos crear
                const todasLasCitas = await citasApiService.getAllCitas();
                
                if (todasLasCitas.success && Array.isArray(todasLasCitas.data)) {
                  // Buscar una cita que coincida con los datos que intentamos crear
                  // Usar las horas ya normalizadas (horaInicio y horaFin del scope superior)
                  const citaExistente = todasLasCitas.data.find(cita => {
                    // Comparar fecha, hora y empleado
                    const fechaCoincide = cita.fecha === datosCita.fecha;
                    // Comparar horas (puede venir en formato HH:MM o HH:MM:SS)
                    const horaInicioCoincide = cita.hora_inicio === horaInicio || 
                                             cita.hora_inicio === datosCita.hora_inicio ||
                                             cita.hora_inicio === datosCita.hora_inicio + ':00';
                    const horaFinCoincide = cita.hora_fin === horaFin || 
                                          cita.hora_fin === datosCita.hora_fin ||
                                          cita.hora_fin === datosCita.hora_fin + ':00';
                    
                    // Comparar empleado (puede venir como id_empleado directo o en objeto empleado)
                    const idEmpleadoCita = cita.id_empleado || cita.empleado?.id_empleado || cita.empleado?.id;
                    const empleadoCoincide = idEmpleadoCita === parseInt(datosCita.id_empleado);
                    
                    // También verificar si la cita está asociada a la misma solicitud
                    const solicitudCoincide = !idOrdenServicio || 
                      (cita.id_orden_servicio === parseInt(idOrdenServicio)) ||
                      (cita.idOrdenServicio === parseInt(idOrdenServicio));
                    
                    return fechaCoincide && horaInicioCoincide && horaFinCoincide && empleadoCoincide;
                  });
                  
                  if (citaExistente) {
                    console.log('✅ [CitasApiService] ¡Cita encontrada! La cita se creó exitosamente en un intento anterior.');
                    console.log('✅ [CitasApiService] ID de cita creada:', citaExistente.id_cita || citaExistente.id);
                    
                    // Tratar como éxito si la cita existe con los mismos datos
                    return {
                      success: true,
                      data: citaExistente,
                      message: 'Cita agendada exitosamente (la cita ya existía, probablemente creada en un intento anterior que tuvo timeout)'
                    };
                  } else {
                    console.warn('⚠️ [CitasApiService] No se encontró la cita en el backend. Puede ser un conflicto real.');
                  }
                }
              } catch (verificationError) {
                console.error('❌ [CitasApiService] Error al verificar si la cita existe:', verificationError);
                // Continuar con el manejo de error normal
              }
              
              // Si no se encontró la cita, mostrar el error normal
              errorMessage = `${serverMessage}. Por favor, verifique las citas existentes del empleado en el calendario o intente con otro horario.`;
              
              console.warn('⚠️ [CitasApiService] El backend indica que ya existe una cita para:');
              console.warn('   - Fecha:', datosCita.fecha);
              console.warn('   - Hora inicio:', datosCita.hora_inicio);
              console.warn('   - Hora fin:', datosCita.hora_fin);
              console.warn('   - ID Empleado:', datosCita.id_empleado);
            } else {
              errorMessage = `Datos inválidos: ${serverMessage}`;
            }
            // Agregar información completa del error para debugging
            console.log('📋 [CitasApiService] Detalles completos del error 400:', {
              message: serverMessage,
              responseData: responseData,
              datosEnviados: datosCita,
              idOrdenServicio: idOrdenServicio,
              endpoint: API_CONFIG.ENDPOINTS.CREATE_APPOINTMENT_FROM_REQUEST(idOrdenServicio)
            });
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
            break;
          case 404:
            errorMessage = `Solicitud no encontrada: ${serverMessage}`;
            break;
          case 409:
            errorMessage = `Conflicto: ${serverMessage}`;
            break;
          case 500:
            errorMessage = `Error interno del servidor: ${serverMessage}. Por favor, contacta al administrador.`;
            break;
          default:
            errorMessage = `Error ${status}: ${serverMessage}`;
        }
      } else if (error.message) {
        // Error de validación o conexión
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Validar datos de cita según la documentación (para crear cita)
  validateCitaData: (citaData) => {
    const errors = {};
    
    // Validar fecha
    if (!citaData.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else {
      const fecha = new Date(citaData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      // ✅ Validación 1: Fecha no puede ser pasada
      if (fecha < hoy) {
        errors.fecha = 'La fecha no puede ser pasada';
      }
      
      // ✅ Validación 4: Rango de fechas (máximo 1 año en el futuro)
      const unAnoEnElFuturo = new Date();
      unAnoEnElFuturo.setFullYear(unAnoEnElFuturo.getFullYear() + 1);
      if (fecha > unAnoEnElFuturo) {
        errors.fecha = 'La fecha no puede ser más de 1 año en el futuro';
      }
      
      // ✅ Validación 1: Días hábiles (lunes a viernes)
      const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      if (diaSemana === 0 || diaSemana === 6) {
        errors.fecha = 'Las citas solo se pueden agendar de lunes a viernes';
      }
    }
    
    // Validar hora_inicio
    if (!citaData.hora_inicio) {
      errors.hora_inicio = 'La hora de inicio es requerida';
    } else {
      const hora = citaData.hora_inicio;
      const [horas, minutos, segundos] = hora.split(':').map(Number);
      
      // ✅ Validación 6: Horarios de atención (7:00 AM - 6:00 PM)
      if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
        errors.hora_inicio = 'La hora debe estar entre 07:00 y 18:00';
      }
    }
    
    // Validar hora_fin
    if (!citaData.hora_fin) {
      errors.hora_fin = 'La hora de fin es requerida';
    } else {
      const hora = citaData.hora_fin;
      const [horas, minutos, segundos] = hora.split(':').map(Number);
      
      // ✅ Validación 6: Horarios de atención (7:00 AM - 6:00 PM)
      if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
        errors.hora_fin = 'La hora debe estar entre 07:00 y 18:00';
      }
      
      // Validar que hora_fin sea mayor que hora_inicio
      if (citaData.hora_inicio && citaData.hora_fin) {
        const inicio = new Date(`2000-01-01T${citaData.hora_inicio}`);
        const fin = new Date(`2000-01-01T${citaData.hora_fin}`);
        
        if (fin <= inicio) {
          errors.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio';
        } else {
          // ✅ Validación 2: Duración (1 hora ±5 minutos) - 55-65 minutos
          const duracionMinutos = (fin - inicio) / (1000 * 60); // Diferencia en minutos
          if (duracionMinutos < 55 || duracionMinutos > 65) {
            errors.hora_fin = 'La duración de la cita debe ser de aproximadamente 1 hora (55-65 minutos)';
          }
        }
      }
    }
    
    // Validar tipo
    if (!citaData.tipo || !citaData.tipo.trim()) {
      errors.tipo = 'El tipo de cita es requerido';
    }
    
    // Validar modalidad
    if (!citaData.modalidad || !citaData.modalidad.trim()) {
      errors.modalidad = 'La modalidad es requerida';
    } else {
      // Validar que la modalidad sea válida
      const modalidadesValidas = ['Virtual', 'Presencial'];
      if (!modalidadesValidas.includes(citaData.modalidad.trim())) {
        errors.modalidad = `La modalidad debe ser: ${modalidadesValidas.join(' o ')}`;
      }
    }
    
    // Validar id_usuario (usuario con rol "cliente")
    console.log('🔍 [CitasApiService.validateCitaData] Validando id_usuario...');
    console.log('🔍 [CitasApiService.validateCitaData] citaData.id_usuario:', citaData.id_usuario);
    console.log('🔍 [CitasApiService.validateCitaData] Tipo:', typeof citaData.id_usuario);
    console.log('🔍 [CitasApiService.validateCitaData] ¿Es falsy?:', !citaData.id_usuario);
    console.log('🔍 [CitasApiService.validateCitaData] ¿Es <= 0?:', citaData.id_usuario <= 0);
    
    if (!citaData.id_usuario || citaData.id_usuario <= 0) {
      console.error('❌ [CitasApiService.validateCitaData] id_usuario inválido:', citaData.id_usuario);
      errors.id_usuario = 'El usuario (cliente) es requerido';
    } else {
      console.log('✅ [CitasApiService.validateCitaData] id_usuario válido:', citaData.id_usuario);
    }
    
    // Validar id_empleado
    if (!citaData.id_empleado || citaData.id_empleado <= 0) {
      errors.id_empleado = 'El empleado es requerido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },

  // Validar datos para reprogramar cita (solo campos requeridos según API)
  validateReprogramarData: (citaData) => {
    const errors = {};
    
    // Validar fecha
    if (!citaData.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else {
      const fecha = new Date(citaData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      // ✅ Validación 1: Fecha no puede ser pasada
      if (fecha < hoy) {
        errors.fecha = 'La fecha no puede ser pasada';
      }
      
      // ✅ Validación 4: Rango de fechas (máximo 1 año en el futuro)
      const unAnoEnElFuturo = new Date();
      unAnoEnElFuturo.setFullYear(unAnoEnElFuturo.getFullYear() + 1);
      if (fecha > unAnoEnElFuturo) {
        errors.fecha = 'La fecha no puede ser más de 1 año en el futuro';
      }
      
      // ✅ Validación 1: Días hábiles (lunes a viernes)
      const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      if (diaSemana === 0 || diaSemana === 6) {
        errors.fecha = 'Las citas solo se pueden agendar de lunes a viernes';
      }
    }
    
    // Validar hora_inicio
    if (!citaData.hora_inicio) {
      errors.hora_inicio = 'La hora de inicio es requerida';
    } else {
      const hora = citaData.hora_inicio;
      const [horas, minutos, segundos] = hora.split(':').map(Number);
      
      // ✅ Validación 6: Horarios de atención (7:00 AM - 6:00 PM)
      if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
        errors.hora_inicio = 'La hora debe estar entre 07:00 y 18:00';
      }
    }
    
    // Validar hora_fin
    if (!citaData.hora_fin) {
      errors.hora_fin = 'La hora de fin es requerida';
    } else {
      const hora = citaData.hora_fin;
      const [horas, minutos, segundos] = hora.split(':').map(Number);
      
      // ✅ Validación 6: Horarios de atención (7:00 AM - 6:00 PM)
      if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
        errors.hora_fin = 'La hora debe estar entre 07:00 y 18:00';
      }
      
      // Validar que hora_fin sea mayor que hora_inicio
      if (citaData.hora_inicio && citaData.hora_fin) {
        const inicio = new Date(`2000-01-01T${citaData.hora_inicio}`);
        const fin = new Date(`2000-01-01T${citaData.hora_fin}`);
        
        if (fin <= inicio) {
          errors.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio';
        } else {
          // ✅ Validación 2: Duración (1 hora ±5 minutos) - 55-65 minutos
          const duracionMinutos = (fin - inicio) / (1000 * 60); // Diferencia en minutos
          if (duracionMinutos < 55 || duracionMinutos > 65) {
            errors.hora_fin = 'La duración de la cita debe ser de aproximadamente 1 hora (55-65 minutos)';
          }
        }
      }
    }
    
    // id_empleado es opcional (solo si se quiere cambiar el empleado)
    // observacion es opcional
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }
};

export default citasApiService;