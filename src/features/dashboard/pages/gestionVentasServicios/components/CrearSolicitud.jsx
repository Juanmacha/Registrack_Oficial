import React, { useState, useEffect } from 'react';
import { crearVenta } from '../services/ventasService';
import { mockDataService } from '../../../../../utils/mockDataService';
import solicitudesApiService from '../services/solicitudesApiService';
import authData from '../../../../auth/services/authData.js';
import Swal from 'sweetalert2';
import { PAISES } from '../../../../../shared/utils/paises.js';
import { AlertService } from '../../../../../shared/styles/alertStandards.js';
// Importar formularios específicos
import FormularioBusqueda from '../../../../../shared/components/formularioBusqueda';
import FormularioCertificacion from '../../../../../shared/components/formularioCertificacion';
import FormularioRenovacion from '../../../../../shared/components/formularioRenovacion';
import FormularioOposicion from '../../../../../shared/components/formularioOposicion';
import FormularioCesion from '../../../../../shared/components/formularioCesiondeMarca';
import FormularioAmpliacion from '../../../../../shared/components/formularioAmpliacion';
import FormularioRespuesta from '../../../../../shared/components/formularioRespuesta';
import DemoPasarelaPagoModal from '../../../../landing/components/DemoPasarelaPagoModal'; // Asegúrate de que la ruta sea correcta

// Mapeo de formularios por servicio
const FORMULARIOS_POR_SERVICIO = {
  'Búsqueda de Antecedentes': FormularioBusqueda,
  'Certificación de Marca': FormularioCertificacion,
  'Renovación de Marca': FormularioRenovacion,
  'Presentación de Oposición': FormularioOposicion,
  'Cesión de Marca': FormularioCesion,
  'Ampliación de Alcance': FormularioAmpliacion,
  'Respuesta a Oposición': FormularioRespuesta,
};

const CrearSolicitud = ({ isOpen, onClose, onGuardar, tipoSolicitud, servicioId }) => {
  // Estados del formulario
  const [form, setForm] = useState({
    tipoSolicitante: '',
    tipoPersona: '',
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoEntidad: '',
    razonSocial: '',
    nombreEmpresa: '',
    nit: '',
    pais: '',
    nitMarca: '',
    nombreMarca: '',
    categoria: '',
    clases: [{ numero: '', descripcion: '' }],
    certificadoCamara: null,
    logotipoMarca: null,
    poderRepresentante: null,
    poderAutorizacion: null,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    estado: 'En revisión',
    tipoSolicitud: tipoSolicitud,
    encargado: 'Sin asignar',
    proximaCita: null,
    comentarios: []
  });
  const [errors, setErrors] = useState({});

  // Estado para la pasarela demo
  const [mostrarPasarela, setMostrarPasarela] = useState(false);
  const [pagoDemo, setPagoDemo] = useState(null);

  // Determinar qué formulario renderizar
  const FormularioComponente = FORMULARIOS_POR_SERVICIO[tipoSolicitud];

  // Función para convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para manejar cambios en las clases
  const handleClaseChange = (index, field, value) => {
    const nuevasClases = [...form.clases];
    nuevasClases[index][field] = value;
    setForm(prev => ({ ...prev, clases: nuevasClases }));
  };

  // Función para agregar una nueva clase
  const addClase = () => {
    setForm(prev => ({
      ...prev,
      clases: [...prev.clases, { numero: '', descripcion: '' }]
    }));
  };

  // Función para eliminar una clase
  const removeClase = (index) => {
    if (form.clases.length > 1) {
      const nuevasClases = form.clases.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, clases: nuevasClases }));
    }
  };

  // Función de validación
  const validate = () => {
    const newErrors = {};
    
    console.log("🔧 [CrearSolicitud] Validando form:", form);
    
    // Validar solo campos básicos requeridos que siempre deben estar
    if (!form.tipoSolicitante || form.tipoSolicitante.trim() === '') {
      newErrors.tipoSolicitante = 'El tipo de solicitante es requerido';
    }
    if (!form.email || form.email.trim() === '') {
      newErrors.email = 'El email es requerido';
    }
    if (!form.nombreMarca || form.nombreMarca.trim() === '') {
      newErrors.nombreMarca = 'El nombre de la marca es requerido';
    }
    
    // Validar campos condicionales según el tipo de solicitante
    if (form.tipoSolicitante === 'Titular') {
      if (!form.tipoPersona || form.tipoPersona.trim() === '') {
        newErrors.tipoPersona = 'El tipo de persona es requerido';
      }
      if (form.tipoPersona === 'Natural') {
        if (!form.tipoDocumento || form.tipoDocumento.trim() === '') {
          newErrors.tipoDocumento = 'El tipo de documento es requerido';
        }
        if (!form.numeroDocumento || form.numeroDocumento.trim() === '') {
          newErrors.numeroDocumento = 'El número de documento es requerido';
        }
        if (!form.nombres || form.nombres.trim() === '') {
          newErrors.nombres = 'Los nombres son requeridos';
        }
        if (!form.apellidos || form.apellidos.trim() === '') {
          newErrors.apellidos = 'Los apellidos son requeridos';
        }
      } else if (form.tipoPersona === 'Jurídica') {
        if (!form.nombreEmpresa || form.nombreEmpresa.trim() === '') {
          newErrors.nombreEmpresa = 'El nombre de la empresa es requerido';
        }
        if (!form.nit || form.nit.trim() === '') {
          newErrors.nit = 'El NIT es requerido';
        }
      }
    } else if (form.tipoSolicitante === 'Representante Autorizado') {
      if (!form.tipoDocumento || form.tipoDocumento.trim() === '') {
        newErrors.tipoDocumento = 'El tipo de documento es requerido';
      }
      if (!form.numeroDocumento || form.numeroDocumento.trim() === '') {
        newErrors.numeroDocumento = 'El número de documento es requerido';
      }
      if (!form.nombres || form.nombres.trim() === '') {
        newErrors.nombres = 'Los nombres son requeridos';
      }
      if (!form.apellidos || form.apellidos.trim() === '') {
        newErrors.apellidos = 'Los apellidos son requeridos';
      }
    }
    
    console.log("🔧 [CrearSolicitud] Errores generados:", newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    console.log("🔧 [CrearSolicitud] handleSubmit iniciado");
    console.log("🔧 [CrearSolicitud] Form actual:", form);
    console.log("🔧 [CrearSolicitud] Form keys:", Object.keys(form));
    e.preventDefault();
    
    const newErrors = validate();
    console.log("🔧 [CrearSolicitud] Errores de validación encontrados:", newErrors);
    console.log("🔧 [CrearSolicitud] Número de errores:", Object.keys(newErrors).length);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log("🔧 [CrearSolicitud] Errores de validación:", newErrors);
      // ✅ NO MOSTRAR ALERT, DEJAR QUE LOS ERRORES SE MUESTREN EN EL FORMULARIO
      return;
    }
    console.log("🔧 [CrearSolicitud] Validación exitosa");
    
    try {
      // Obtener token y rol del usuario
      const token = authData.getToken();
      const userRole = authData.getUserRole();
      
      if (!token) {
        AlertService.error('Error', 'No hay sesión activa. Por favor, inicia sesión.');
        return;
      }

      console.log("🔧 [CrearSolicitud] Token obtenido, rol del usuario:", userRole);

      // Convertir archivos a base64 antes de enviar
      const formToSave = { ...form };
      
      const fileFields = [
        'certificadoCamara',
        'logotipoMarca',
        'poderRepresentante',
        'poderAutorizacion',
      ];
      
      for (const field of fileFields) {
        if (formToSave[field] instanceof File) {
          console.log("🔧 [CrearSolicitud] Convirtiendo archivo:", field);
          formToSave[field] = await fileToBase64(formToSave[field]);
        }
      }

      // ✅ LÓGICA DE ROLES según la documentación de la API
      // Los clientes NO envían id_cliente (se usa automáticamente del token)
      // Los admin/empleados SÍ deben enviar id_cliente
      
      if (userRole === 'administrador' || userRole === 'empleado') {
        // TODO: Implementar selector de cliente para admin/empleado
        // Por ahora, usamos el ID del usuario actual como fallback
        const userId = authData.getUserId();
        formToSave.id_cliente = userId;
        console.log("🔧 [CrearSolicitud] Admin/Empleado - Agregando id_cliente:", userId);
      } else {
        // Clientes: NO enviar id_cliente (se usa automáticamente del token JWT)
        console.log("🔧 [CrearSolicitud] Cliente - No se envía id_cliente (se usa del token)");
      }

      // Transformar datos del formulario al formato de la API
      const { servicioAPI, datosAPI } = solicitudesApiService.transformarDatosParaAPI(
        formToSave,
        tipoSolicitud
      );

      console.log("🔧 [CrearSolicitud] Servicio API:", servicioAPI);
      console.log("🔧 [CrearSolicitud] Datos transformados para API:", datosAPI);

      // Crear solicitud usando la API real
      const resultado = await solicitudesApiService.crearSolicitud(
        servicioAPI,
        datosAPI,
        token
      );

      console.log("✅ [CrearSolicitud] Solicitud creada exitosamente:", resultado);

      // Mostrar mensaje de éxito
      AlertService.success(
        'Solicitud Creada', 
        'La solicitud ha sido creada exitosamente. Se han enviado notificaciones por email.'
      );

      // Llamar a onGuardar con el resultado de la API
      if (onGuardar) {
        await onGuardar(resultado);
      }

      // Cerrar el modal
      if (onClose) {
        onClose();
      }

    } catch (err) {
      console.error("❌ [CrearSolicitud] Error al guardar:", err);
      AlertService.error(
        "Error al crear solicitud", 
        `No se pudo crear la solicitud: ${err.message || 'Error desconocido'}`
      );
    }
  };

  // Cuando el pago es exitoso, guardar la solicitud
  const handlePagoExitoso = async (pago) => {
    console.log("🔧 [CrearSolicitud] handlePagoExitoso iniciado");
    console.log("🔧 [CrearSolicitud] Pago recibido:", pago);
    console.log("🔧 [CrearSolicitud] Form actual:", form);
    console.log("🔧 [CrearSolicitud] tipoSolicitud:", tipoSolicitud);
    
    setMostrarPasarela(false);
    setPagoDemo(pago);
    try {
      // Convertir archivos a base64 antes de guardar
      const formToSave = { 
        ...form,
        tipoSolicitud: tipoSolicitud, // ✅ AGREGAR EL TIPO DE SOLICITUD
        estado: 'Pendiente', // ✅ AGREGAR ESTADO INICIAL
        fechaSolicitud: new Date().toISOString().split('T')[0] // ✅ AGREGAR FECHA
      };
      console.log("🔧 [CrearSolicitud] FormToSave antes de archivos:", formToSave);
      
      const fileFields = [
        'certificadoCamara',
        'logotipoMarca',
        'poderRepresentante',
        'poderAutorizacion',
      ];
      for (const field of fileFields) {
        if (formToSave[field] instanceof File) {
          console.log("🔧 [CrearSolicitud] Convirtiendo archivo:", field);
          formToSave[field] = await fileToBase64(formToSave[field]);
        }
      }
      console.log("🔧 [CrearSolicitud] Formulario final a guardar:", formToSave);
      console.log("🔧 [CrearSolicitud] Llamando a onGuardar...");
      
      // Solo llamar a onGuardar, no cerrar el modal aquí
      await onGuardar(formToSave);
      
      console.log("🔧 [CrearSolicitud] onGuardar completado exitosamente");
    } catch (err) {
      console.error("🔧 [CrearSolicitud] Error al guardar:", err);
      AlertService.error("Error al guardar", "No se pudo crear la solicitud. Inténtalo de nuevo.");
    }
  };

  // ...existing code...

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Crear Solicitud</h2>
          {/* Renderizar el formulario dinámico */}
          {FormularioComponente ? (
            <form onSubmit={handleSubmit}>
              <FormularioComponente
                isOpen={isOpen}
                onClose={onClose}
                onGuardar={onGuardar}
                tipoSolicitud={tipoSolicitud}
                servicioId={servicioId}
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                handleChange={handleChange}
                handleClaseChange={handleClaseChange}
                addClase={addClase}
                removeClase={removeClase}
              />
              <div className="flex justify-end mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-700 font-semibold">Cancelar</button>
                <button type="submit" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Guardar y Pagar</button>
              </div>
            </form>
          ) : (
            <div className="text-red-500">No hay formulario disponible para este servicio.</div>
          )}
          {/* Modal de pasarela demo */}
          <DemoPasarelaPagoModal
            isOpen={mostrarPasarela}
            onClose={() => setMostrarPasarela(false)}
            monto={1000000} // Puedes ajustar el monto según el servicio
            datosPago={{
              nombreMarca: form.nombreMarca || '',
              nombreRepresentante: `${form.nombres || ''} ${form.apellidos || ''}`.trim(),
              tipoDocumento: form.tipoDocumento || '',
              numeroDocumento: form.numeroDocumento || '',
              // ...otros datos si necesitas, siempre con valor por defecto
            }}
            onPagoExitoso={handlePagoExitoso}
          />
        </div>
      </div>
    )
  );
};

export default CrearSolicitud;