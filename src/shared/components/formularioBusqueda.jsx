import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import ValidationService from '../../utils/validationService.js';
import FileUpload from './FileUpload.jsx';
import { handleDocumentNumberChange, handlePhoneChange, handleNumericPaste } from '../../shared/utils/numericInputFilter.js';

// ✅ Actualizado según especificación: valores válidos según FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md
const tiposDocumento = [
  'Cédula de Ciudadanía',
  'Cédula de Extranjería', 
  'Pasaporte',
  'NIT',
  'Tarjeta de Identidad'
];

// ✅ Categorías de Productos y Servicios para búsqueda de antecedentes
const CATEGORIAS_PRODUCTOS_SERVICIOS = [
  // PRODUCTOS
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Alimentos y bebidas', items: [
    'Alimentos procesados', 'Snacks y pasabocas', 'Productos de panadería', 'Productos lácteos',
    'Carnes y embutidos', 'Pescados y mariscos', 'Frutas y verduras', 'Conservas y enlatados',
    'Salsas, aderezos y condimentos', 'Bebidas no alcohólicas', 'Cervezas', 'Bebidas alcohólicas (licores, vinos)'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Cosméticos y cuidado personal', items: [
    'Maquillaje', 'Perfumería', 'Cremas y tratamientos para la piel', 'Shampoos y cuidado del cabello',
    'Aseo personal (jabones, desodorantes)', 'Productos de spa y bienestar', 'Productos de barbería / barber shop'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Productos farmacéuticos y de salud', items: [
    'Medicamentos', 'Vitaminas y suplementos', 'Productos naturistas', 'Productos para cuidado médico',
    'Insolaciones y primeros auxilios'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Limpieza y hogar', items: [
    'Detergentes', 'Limpiadores para el hogar', 'Aromatizantes', 'Desinfectantes', 'Productos biodegradables'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Moda y accesorios', items: [
    'Ropa', 'Zapatos', 'Bolsos y mochilas', 'Accesorios de moda', 'Ropa deportiva',
    'Ropa interior', 'Ropa para niños', 'Uniformes'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Juguetes y artículos infantiles', items: [
    'Juguetería', 'Juegos didácticos', 'Cuidado y accesorios para bebés'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Tecnología y electrónica', items: [
    'Computadores y laptops', 'Teléfonos y dispositivos móviles', 'Accesorios electrónicos',
    'Equipos de audio y sonido', 'Cámaras y fotografía', 'Hardware especializado', 'Componentes electrónicos'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Equipos médicos y de laboratorio', items: [
    'Insumos médicos', 'Equipos hospitalarios', 'Equipos odontológicos', 'Material de laboratorio'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Herramientas y ferretería', items: [
    'Herramientas manuales', 'Herramientas eléctricas', 'Materiales de construcción',
    'Maquinaria industrial', 'Equipos de soldadura', 'Equipos de seguridad industrial'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Automotriz', items: [
    'Repuestos de autos', 'Accesorios automotrices', 'Llantas', 'Herramientas de taller automotriz'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Hogar y decoración', items: [
    'Muebles', 'Electrodomésticos', 'Decoración', 'Iluminación', 'Artículos de cocina', 'Artículos de baño'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Papelería y oficina', items: [
    'Cuadernos y hojas', 'Artículos de oficina', 'Impresoras', 'Tintas y tóner', 'Material escolar'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Mascotas', items: [
    'Alimentos para mascotas', 'Juguetes para mascotas', 'Accesorios y cuidado'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Arte y entretenimiento', items: [
    'Instrumentos musicales', 'Material artístico', 'Productos para manualidades', 'Artículos de fiesta'
  ]},
  { categoria: 'PRODUCTOS', tipo: 'producto', subcategoria: 'Otros productos específicos', items: [
    'Productos químicos', 'Material agrícola', 'Productos de caucho o plástico',
    'Productos metalmecánicos', 'Artículos militares o tácticos', 'Productos de impresión 3D'
  ]},
  // SERVICIOS
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Publicidad y marketing', items: [
    'Marketing digital', 'Gestión de redes', 'Publicidad tradicional', 'Branding',
    'Producción de contenido', 'Consultorías de marketing'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios profesionales y consultoría', items: [
    'Consultoría empresarial', 'Consultoría contable', 'Consultoría financiera',
    'Recursos humanos', 'Coaching y capacitación', 'Outsourcing profesional'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios legales', items: [
    'Asesoría jurídica', 'Marcas y patentes', 'Derecho civil', 'Derecho laboral',
    'Derecho mercantil', 'Servicios notariales'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios financieros', items: [
    'Servicios bancarios', 'Fintech', 'Créditos y préstamos', 'Seguros', 'Cobranzas'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Construcción y mantenimiento', items: [
    'Obras civiles', 'Remodelaciones', 'Fontanería', 'Electricidad', 'Carpintería',
    'Plomería', 'Paisajismo', 'Mantenimiento de edificios', 'Limpieza profesional'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Transporte y logística', items: [
    'Envíos', 'Mensajería', 'Transporte terrestre', 'Transporte aéreo', 'Carga pesada',
    'Logística internacional', 'Importación y exportación'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Telecomunicaciones', items: [
    'Internet y redes', 'Telefonía', 'Cable / TV', 'Servicios satelitales'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Tecnología y software', items: [
    'Desarrollo web', 'Desarrollo móvil', 'Desarrollo de software a medida', 'Hosting y dominios',
    'Ciberseguridad', 'Consultoría TI', 'Soporte técnico', 'Venta de software como servicio (SaaS)'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Educación y formación', items: [
    'Cursos virtuales', 'Cursos presenciales', 'Tutorías', 'Escuelas deportivas', 'Capacitaciones empresariales'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Entretenimiento y cultura', items: [
    'Organización de eventos', 'Alquiler de sonido e iluminación', 'Espectáculos en vivo',
    'Producción audiovisual', 'Fotografía y video', 'Gestión de influencers'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Gastronomía y turismo', items: [
    'Restaurantes', 'Cafeterías', 'Bares', 'Food trucks', 'Hoteles', 'Hostales',
    'Guías turísticos', 'Agencias de viajes'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Belleza y cuidado personal', items: [
    'Salones de belleza', 'Barberías', 'Spa', 'Masajes', 'Estética', 'Uñas', 'Servicios dermatológicos estéticos'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios para mascotas', items: [
    'Veterinaria', 'Peluquería canina', 'Guarderías', 'Adiestramiento'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios médicos', items: [
    'Clínicas', 'Consultorios médicos', 'Odontología', 'Laboratorios clínicos',
    'Fisioterapia', 'Terapias alternativas', 'Servicios de ambulancia'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios agrícolas', items: [
    'Asesorías agrícolas', 'Producción agrícola', 'Servicios pecuarios', 'Servicios ambientales'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Seguridad', items: [
    'Vigilancia privada', 'Monitoreo de alarmas', 'Seguridad electrónica', 'Escoltas'
  ]},
  { categoria: 'SERVICIOS', tipo: 'servicio', subcategoria: 'Servicios funerarios', items: [
    'Funerarias', 'Cremación', 'Traslados'
  ]}
];

// Aplanar todas las opciones para el buscador
const OPCIONES_PRODUCTOS_SERVICIOS = CATEGORIAS_PRODUCTOS_SERVICIOS.flatMap(cat => 
  cat.items.map(item => ({
    label: `${cat.subcategoria} - ${item}`,
    value: `${cat.subcategoria} - ${item}`,
    categoria: cat.categoria,
    subcategoria: cat.subcategoria,
    item: item
  }))
);

const FormularioBusqueda = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Búsqueda de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors, handleChange: propHandleChange, handleClaseChange: propHandleClaseChange, addClase: propAddClase, removeClase: propRemoveClase, renderForm = true, renderModal = true }) => {
  console.log('🔧 [FormularioBusqueda] Componente montado, isOpen:', isOpen);
  
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    // ✅ Campos requeridos según backend: nombres_apellidos, tipo_documento, numero_documento, 
    // direccion, telefono, correo, pais, nombre_a_buscar, tipo_producto_servicio, logotipo
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '', // Se mapea a 'correo' en el backend
    telefono: '',
    direccion: '',
    pais: '',
    ciudad: 'Bogotá', // ✅ Opcional, default según especificación
    codigoPostal: '110111', // ✅ Opcional, default según especificación
    nombreMarca: '', // Se mapea a 'nombre_a_buscar' en el backend
    tipoProductoServicio: '', // Se mapea a 'tipo_producto_servicio' en el backend
    claseNiza: '', // ✅ Opcional - se puede enviar como 'clase_niza'
    clases: [{ numero: '', descripcion: '' }], // ✅ Opcional - se convierte a clase_niza
    logotipoMarca: null, // ✅ Requerido - se mapea a 'logotipo' en el backend
    fechaSolicitud: '',
    estado: 'En revisión',
    tipoSolicitud: tipoSolicitud,
    encargado: 'Sin asignar',
    proximaCita: null,
    comentarios: []
  });
  const [localErrors, setLocalErrors] = useState({});
  
  // Estados para el buscador de productos/servicios
  const [busquedaProductoServicio, setBusquedaProductoServicio] = useState('');
  const [mostrarListaProductosServicios, setMostrarListaProductosServicios] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);

  // Usar props si están disponibles, sino usar estado local
  // Asegurar que todos los campos tengan valores por defecto para evitar warnings de inputs no controlados
  const form = propForm ? {
    tipoDocumento: propForm.tipoDocumento ?? '',
    numeroDocumento: propForm.numeroDocumento ?? '',
    nombres: propForm.nombres ?? '',
    apellidos: propForm.apellidos ?? '',
    email: propForm.email ?? '',
    telefono: propForm.telefono ?? '',
    direccion: propForm.direccion ?? '',
    pais: propForm.pais ?? '',
    ciudad: propForm.ciudad ?? 'Bogotá',
    codigoPostal: propForm.codigoPostal ?? '110111',
    nombreMarca: propForm.nombreMarca ?? '',
    tipoProductoServicio: propForm.tipoProductoServicio ?? '',
    claseNiza: propForm.claseNiza ?? '',
    clases: propForm.clases ?? [{ numero: '', descripcion: '' }],
    logotipoMarca: propForm.logotipoMarca ?? null,
    fechaSolicitud: propForm.fechaSolicitud ?? '',
    estado: propForm.estado ?? 'En revisión',
    tipoSolicitud: propForm.tipoSolicitud ?? tipoSolicitud,
    encargado: propForm.encargado ?? 'Sin asignar',
    proximaCita: propForm.proximaCita ?? null,
    comentarios: propForm.comentarios ?? [],
    ...propForm // Mantener cualquier otro campo adicional
  } : localForm;
  const setForm = propSetForm || setLocalForm;
  const errors = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;

  useEffect(() => {
    if (isOpen) {
      setForm(f => ({ ...f, tipoSolicitud: tipoSolicitud }));
      // ✅ NO RESETEAR ERRORES AL ABRIR, DEJAR QUE SE MUESTREN
    } else {
      setForm({
        tipoDocumento: '',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        pais: '',
        ciudad: 'Bogotá', // ✅ Default según especificación
        codigoPostal: '110111', // ✅ Opcional, default según especificación
        nombreMarca: '',
        tipoProductoServicio: '',
        claseNiza: '',
        clases: [{ numero: '', descripcion: '' }],
        logotipoMarca: null,
        fechaSolicitud: '',
        estado: 'En revisión',
        tipoSolicitud: tipoSolicitud,
        encargado: 'Sin asignar',
        proximaCita: null,
        comentarios: []
      });
      setErrors({});
      // Limpiar buscador de productos/servicios
      setBusquedaProductoServicio('');
      setMostrarListaProductosServicios(false);
      setOpcionSeleccionada(null);
    }
  }, [isOpen, tipoSolicitud]);

  // Sincronizar búsqueda con el valor del formulario
  useEffect(() => {
    if (form.tipoProductoServicio && !opcionSeleccionada) {
      const opcion = OPCIONES_PRODUCTOS_SERVICIOS.find(op => op.value === form.tipoProductoServicio);
      if (opcion) {
        setOpcionSeleccionada(opcion);
        setBusquedaProductoServicio(opcion.label);
      } else {
        // Si el valor no está en las opciones, mantenerlo como texto libre
        setBusquedaProductoServicio(form.tipoProductoServicio);
      }
    } else if (!form.tipoProductoServicio) {
      setBusquedaProductoServicio('');
      setOpcionSeleccionada(null);
    }
  }, [form.tipoProductoServicio]);

  // Función para normalizar texto (búsqueda sin acentos)
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar opciones según la búsqueda
  const opcionesFiltradas = OPCIONES_PRODUCTOS_SERVICIOS.filter(opcion => {
    if (!busquedaProductoServicio.trim()) return true;
    const textoBusqueda = normalizarTexto(busquedaProductoServicio);
    const labelNormalizado = normalizarTexto(opcion.label);
    const subcategoriaNormalizada = normalizarTexto(opcion.subcategoria);
    const itemNormalizado = normalizarTexto(opcion.item);
    return labelNormalizado.includes(textoBusqueda) || 
           subcategoriaNormalizada.includes(textoBusqueda) ||
           itemNormalizado.includes(textoBusqueda);
  });

  // Manejar selección de opción desde el buscador
  const handleSeleccionarOpcion = (opcion) => {
    setOpcionSeleccionada(opcion);
    setForm(prev => ({ 
      ...prev, 
      tipoProductoServicio: opcion.value 
    }));
    setBusquedaProductoServicio(opcion.label);
    setMostrarListaProductosServicios(false);
    
    // Limpiar error del campo
    if (errors.tipoProductoServicio) {
      setErrors(prev => ({ ...prev, tipoProductoServicio: undefined }));
    }
  };

  // Manejar cambio en el input de búsqueda
  const handleBusquedaProductoServicioChange = (e) => {
    const valor = e.target.value;
    setBusquedaProductoServicio(valor);
    setMostrarListaProductosServicios(true);
    
    // Si se limpia el input, limpiar también la selección
    if (!valor.trim()) {
      setOpcionSeleccionada(null);
      setForm(prev => ({ ...prev, tipoProductoServicio: '' }));
    } else {
      // Si el usuario escribe texto libre, actualizar el formulario
      setForm(prev => ({ ...prev, tipoProductoServicio: valor }));
    }
  };

  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};
    
    // ✅ Campos requeridos según backend: nombres_apellidos (nombres + apellidos), tipo_documento, 
    // numero_documento, direccion, telefono, correo (email), pais, nombre_a_buscar (nombreMarca), 
    // tipo_producto_servicio, logotipo
    const requiredFields = ['tipoDocumento', 'numeroDocumento', 'nombres', 'apellidos', 'email', 'telefono', 'direccion', 'pais', 'nombreMarca', 'tipoProductoServicio', 'logotipoMarca'];
    const requiredErrors = ValidationService.validateRequiredFields(f, requiredFields);
    Object.assign(e, requiredErrors);
    
    // Validaciones específicas usando ValidationService
    if (f.email && !ValidationService.isValidEmail(f.email)) {
      e.email = 'Correo inválido';
    }
    
    if (f.telefono && !ValidationService.isValidPhone(f.telefono)) {
      e.telefono = 'Teléfono inválido';
    }
    
    // Validaciones específicas del formulario
    
    if (f.numeroDocumento) {
      // Validación según tipo de documento
      if (f.tipoDocumento === 'Pasaporte') {
        if (!/^[A-Za-z0-9]{6,20}$/.test(f.numeroDocumento)) {
          e.numeroDocumento = 'Pasaporte: solo letras y números, 6-20 caracteres';
        }
      } else if (f.tipoDocumento === 'NIT') {
        if (!/^[0-9]{9,15}$/.test(f.numeroDocumento)) {
          e.numeroDocumento = 'NIT: solo números, 9-15 dígitos';
        }
      } else {
        // Cédula de Ciudadanía, Cédula de Extranjería, Tarjeta de Identidad
        if (!/^[0-9]{6,20}$/.test(f.numeroDocumento)) {
          e.numeroDocumento = 'Solo números, 6-20 dígitos';
        }
      }
    }
    
    if (f.nombres && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.nombres)) {
      e.nombres = 'Solo letras, 2-50 caracteres';
    }
    
    if (f.apellidos && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.apellidos)) {
      e.apellidos = 'Solo letras, 2-50 caracteres';
    }
    
    if (f.direccion && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,#-]{5,100}$/.test(f.direccion)) {
      e.direccion = 'Dirección inválida';
    }
    
    if (f.ciudad && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.ciudad)) {
      e.ciudad = 'Solo letras, 2-50 caracteres';
    }
    
    if (f.nombreMarca && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,80}$/.test(f.nombreMarca)) {
      e.nombreMarca = 'Solo letras, números y básicos, 2-80 caracteres';
    }
    
    // Validaciones de código postal (opcional, pero si se proporciona debe ser válido)
    if (f.codigoPostal && !/^[0-9]{4,10}$/.test(f.codigoPostal)) {
      e.codigoPostal = 'Código postal inválido (4-10 dígitos)';
    }
    
    // Validaciones de clases (opcional según especificación)
    // Las clases son opcionales para Búsqueda de Antecedentes
    f.clases?.forEach((c, i) => {
      if (c.numero && !/^[0-9]{1,2}$/.test(c.numero)) {
        e[`clase_numero_${i}`] = 'Número de clase inválido (1-45)';
      }
    });
    
    // Validación de logotipo (requerido según especificación)
    if (!f.logotipoMarca) {
      e.logotipoMarca = 'El logotipo es requerido';
    } else if (f.logotipoMarca instanceof File) {
      // Validar tamaño (máx 5MB)
      if (f.logotipoMarca.size > 5 * 1024 * 1024) {
        e.logotipoMarca = 'El logotipo no puede exceder 5MB';
      }
      // Validar formato
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.logotipoMarca.type)) {
        e.logotipoMarca = 'El logotipo debe ser JPG o PNG';
      }
    }
    
    return e;
  };

  // Usar props si están disponibles, sino usar funciones locales
  const handleChangeBase = propHandleChange || (e => {
    const { name, value, type, files } = e.target;
    let newValue;
    
    console.log('🔧 [FormularioBusqueda] handleChange llamado:', { name, type, files, value });
    
    if (type === 'file') {
      // Manejar archivos del FileUpload (evento sintético)
      if (files && files.length > 0) {
        newValue = files[0];
        console.log('🔧 [FormularioBusqueda] Archivo seleccionado:', newValue);
      } else {
        // Si no hay archivos, limpiar el campo
        newValue = null;
        console.log('🔧 [FormularioBusqueda] Archivo eliminado');
      }
    } else {
      newValue = value;
    }
    
    setForm(f => {
      const updatedForm = { ...f, [name]: newValue };
      console.log('🔧 [FormularioBusqueda] Form actualizado:', updatedForm);
      const newErrors = validate(updatedForm);
      setErrors(newErrors);
      return updatedForm;
    });
  });

  // Handler principal que envuelve el base
  const handleChange = handleChangeBase;

  // Wrappers para campos numéricos
  const handleDocumentNumberChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleChangeBase);
  };

  const handlePhoneChangeWrapper = (e) => {
    handlePhoneChange(e, handleChangeBase);
  };

  const handleCodigoPostalChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleChangeBase); // Código postal solo números
  };

  const handleClaseChange = propHandleClaseChange || ((i, field, value) => {
    setForm(f => {
      const clases = [...f.clases];
      if (field === 'numero') {
        // Solo permitir números y máximo 2 dígitos
        const soloNumeros = value.replace(/[^0-9]/g, '');
        clases[i][field] = soloNumeros.length <= 2 ? soloNumeros : soloNumeros.substring(0, 2);
      } else {
        clases[i][field] = value;
      }
      return { ...f, clases };
    });
    setErrors(prev => ({ ...prev, [`clase_${field}_${i}`]: '' }));
  });

  const addClase = propAddClase || (() => {
    if (form.clases.length < 25) {
      setForm(f => ({ ...f, clases: [...f.clases, { numero: '', descripcion: '' }] }));
    }
  });

  const removeClase = propRemoveClase || (i => {
    setForm(f => ({ ...f, clases: f.clases.filter((_, idx) => idx !== i) }));
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔧 [FormularioBusqueda] handleSubmit llamado');
    
    const newErrors = validate(form);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('🔧 [FormularioBusqueda] Formulario válido, llamando onGuardar');
      await onGuardar(form);
    } else {
      console.log('🔧 [FormularioBusqueda] Formulario con errores:', newErrors);
    }
  };

  // Si no se debe renderizar el modal, solo retornar el contenido del formulario
  if (!renderModal) {
    console.log('✅ [FormularioBusqueda] Renderizando solo contenido (sin modal)...');
    const FormWrapper = renderForm ? 'form' : 'div';
    const wrapperProps = renderForm 
      ? { onSubmit: handleSubmit, className: "space-y-6" }
      : { className: "space-y-6" };
    
    return (
      <FormWrapper {...wrapperProps}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/60">
            {/* Tipo de Solicitud (bloqueado) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Tipo de Solicitud *
              </label>
              <input
                type="text"
                name="tipoSolicitud"
                value={form.tipoSolicitud}
                readOnly
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 cursor-not-allowed focus:outline-none transition-all font-medium"
              />
            </div>
            {/* Datos del Solicitante */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Tipo de Documento *              </label>
              <select 
                name="tipoDocumento" 
                value={form.tipoDocumento} 
                onChange={handleChange} 
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.tipoDocumento ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`}
              >
                <option value="">Seleccionar</option>
                {tiposDocumento.map(t => <option key={t}>{t}</option>)}
              </select>
              {errors.tipoDocumento && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.tipoDocumento}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Número de Documento *              </label>
              <input 
                type="text" 
                name="numeroDocumento" 
                value={form.numeroDocumento} 
                onChange={handleDocumentNumberChangeWrapper}
                onPaste={(e) => handleNumericPaste(e, {})}
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.numeroDocumento ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="Ej: 1234567890" 
              />
              {errors.numeroDocumento && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.numeroDocumento}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Nombres *              </label>
              <input 
                type="text" 
                name="nombres" 
                value={form.nombres} 
                onChange={handleChange} 
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.nombres ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="Ej: Juan" 
              />
              {errors.nombres && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nombres}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Apellidos *              </label>
              <input 
                type="text" 
                name="apellidos" 
                value={form.apellidos} 
                onChange={handleChange} 
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.apellidos ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="Ej: Pérez" 
              />
              {errors.apellidos && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.apellidos}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Correo Electrónico *              </label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.email ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="ejemplo@correo.com" 
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Teléfono *              </label>
              <input 
                type="text" 
                name="telefono" 
                value={form.telefono} 
                onChange={handlePhoneChangeWrapper}
                onPaste={(e) => handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true })}
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.telefono ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="Ej: 3001234567" 
              />
              {errors.telefono && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.telefono}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Dirección *              </label>
              <input 
                type="text" 
                name="direccion" 
                value={form.direccion} 
                onChange={handleChange} 
                className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.direccion ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                placeholder="Ej: Calle 123 #45-67" 
              />
              {errors.direccion && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.direccion}
                </p>
              )}
            </div>
            {/* Datos de la Marca */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                País *              </label>
              <div className="flex items-center gap-3">
                <select name="pais" value={form.pais} onChange={handleChange} className={`flex-1 border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.pais ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <option value="">Seleccionar</option>
                  {PAISES.map(p => (
                    <option key={p.codigo} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
                {form.pais && PAISES.find(p => p.nombre === form.pais) && (
                  <img
                    src={PAISES.find(p => p.nombre === form.pais).bandera}
                    alt={form.pais}
                    title={form.pais}
                    className="w-10 h-7 rounded-lg shadow-md border-2 border-gray-200 object-cover"
                  />
                )}
              </div>
              {errors.pais && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.pais}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Ciudad              </label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.ciudad ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: Bogotá" />
              {errors.ciudad && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.ciudad}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Código Postal              </label>
              <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleCodigoPostalChangeWrapper} onPaste={(e) => handleNumericPaste(e, {})} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.codigoPostal ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: 110111" />
              {errors.codigoPostal && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.codigoPostal}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Nombre a Buscar (Marca) *              </label>
              <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.nombreMarca ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Nombre de la marca a buscar" />
              {errors.nombreMarca && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.nombreMarca}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Tipo de Producto/Servicio *
              </label>
              
              {/* Input de búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: Alimentos, Tecnología, Consultoría, Restaurantes... o escriba libremente"
                  value={busquedaProductoServicio}
                  onChange={handleBusquedaProductoServicioChange}
                  onFocus={() => setMostrarListaProductosServicios(true)}
                  onBlur={() => {
                    // Delay para permitir click en la lista
                    setTimeout(() => setMostrarListaProductosServicios(false), 200);
                  }}
                  className={`w-full border-2 rounded-xl px-4 py-3.5 pl-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${
                    errors.tipoProductoServicio ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                
                {/* Botón para limpiar búsqueda */}
                {busquedaProductoServicio && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaProductoServicio('');
                      setOpcionSeleccionada(null);
                      setForm(prev => ({ ...prev, tipoProductoServicio: '' }));
                      setMostrarListaProductosServicios(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>

              {/* Lista desplegable de opciones filtradas */}
              {mostrarListaProductosServicios && opcionesFiltradas.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {opcionesFiltradas.map((opcion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSeleccionarOpcion(opcion)}
                      className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        opcionSeleccionada?.value === opcion.value ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{opcion.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {opcion.categoria === 'PRODUCTOS' ? '🛍️ Producto' : '🧰 Servicio'}
                          </p>
                        </div>
                        {opcionSeleccionada?.value === opcion.value && (
                          <i className="bi bi-check-circle text-blue-600 ml-2"></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {mostrarListaProductosServicios && busquedaProductoServicio.trim() && opcionesFiltradas.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4">
                  <p className="text-sm text-gray-500 text-center">
                    No se encontraron opciones que coincidan con "{busquedaProductoServicio}"
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Puedes escribir libremente el tipo de producto o servicio
                  </p>
                </div>
              )}

              {errors.tipoProductoServicio && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <span>⚠</span>{errors.tipoProductoServicio}
                </p>
              )}

              {/* Mostrar opción seleccionada */}
              {opcionSeleccionada && !mostrarListaProductosServicios && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-700">
                    <i className="bi bi-check-circle text-blue-600 mr-1"></i>
                    Seleccionado: <span className="font-semibold">{opcionSeleccionada.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {opcionSeleccionada.subcategoria}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Clases de la Marca (Opcional) - Se mapea a clase_niza */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clases de la marca (Opcional)            </label>
            {/* Enlace a la Clasificación de Niza */}
            <a
              href="https://www.wipo.int/es/web/classification-nice"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs mb-2 inline-block"
            >
              Consulta la Clasificación de Niza para identificar la clase adecuada
            </a>
            <div className="space-y-2">
              {form.clases.map((clase, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="N° Clase" 
                    value={clase.numero} 
                    onChange={e => handleClaseNumeroChange(i, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                      const soloNumeros = pastedText.replace(/\D/g, '').slice(0, 2);
                      handleClaseChange(i, 'numero', soloNumeros);
                    }} 
                    maxLength={2}
                    className="w-24 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" 
                  />
                  <input type="text" placeholder="Descripción (opcional)" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                  <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                  {errors[`clase_numero_${i}`] && <span className="text-xs text-red-600">{errors[`clase_numero_${i}`]}</span>}
                </div>
              ))}
              <button type="button" onClick={addClase} disabled={form.clases.length >= 25} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Añadir Clase</button>
            </div>
          </div>
          {/* Adjuntar Logotipo (Requerido) - Se mapea a logotipo */}
          <div className="mb-4">
            <FileUpload
              name="logotipoMarca"
              value={form.logotipoMarca}
              onChange={handleChange}
              label="Logotipo de la Marca *"
              required={true}
              accept=".jpg,.jpeg,.png"
              error={errors.logotipoMarca}
            />
          </div>
          {/* Botones de acción modernos - Solo mostrar si renderForm es true */}
          {renderForm && (
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/60 mt-8 bg-white/50 rounded-xl p-6 backdrop-blur-sm">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enviar Solicitud
                </span>
              </button>
            </div>
          )}
      </FormWrapper>
    );
  }

  if (!isOpen) {
    console.log('🔧 [FormularioBusqueda] isOpen es false, no renderizando');
    return null;
  }

  console.log('✅ [FormularioBusqueda] Renderizando formulario con modal...');
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] overflow-hidden border border-gray-200/50 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.4s ease-out' }}
      >
        {/* Encabezado moderno con gradiente mejorado */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-8 py-6 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-2 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Búsqueda de Antecedentes</h2>
                <p className="text-sm text-blue-100/90 font-medium">Complete la información requerida para continuar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contenido del formulario con scroll */}
        <div className="overflow-y-auto max-h-[calc(96vh-140px)] px-8 py-8 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50">
        {(() => {
          const FormWrapper = renderForm ? 'form' : 'div';
          const wrapperProps = renderForm 
            ? { onSubmit: handleSubmit, className: "space-y-6" }
            : { className: "space-y-6" };
          
          return (
            <FormWrapper {...wrapperProps}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/60">
                {/* Tipo de Solicitud (bloqueado) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Tipo de Solicitud *
                  </label>
                  <input
                    type="text"
                    name="tipoSolicitud"
                    value={form.tipoSolicitud}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 cursor-not-allowed focus:outline-none transition-all font-medium"
                  />
                </div>
                {/* Datos del Solicitante */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Tipo de Documento *
                  </label>
                  <select 
                    name="tipoDocumento" 
                    value={form.tipoDocumento} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.tipoDocumento ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`}
                  >
                    <option value="">Seleccionar</option>
                    {tiposDocumento.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.tipoDocumento && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.tipoDocumento}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Número de Documento *
                  </label>
                  <input 
                    type="text" 
                    name="numeroDocumento" 
                    value={form.numeroDocumento} 
                    onChange={handleDocumentNumberChangeWrapper}
                    onPaste={(e) => handleNumericPaste(e, {})}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.numeroDocumento ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="Ej: 1234567890" 
                  />
                  {errors.numeroDocumento && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.numeroDocumento}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Nombres *
                  </label>
                  <input 
                    type="text" 
                    name="nombres" 
                    value={form.nombres} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.nombres ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="Ej: Juan" 
                  />
                  {errors.nombres && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.nombres}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Apellidos *
                  </label>
                  <input 
                    type="text" 
                    name="apellidos" 
                    value={form.apellidos} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.apellidos ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="Ej: Pérez" 
                  />
                  {errors.apellidos && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.apellidos}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Correo Electrónico *
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.email ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="ejemplo@correo.com" 
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Teléfono *
                  </label>
                  <input 
                    type="text" 
                    name="telefono" 
                    value={form.telefono} 
                    onChange={handlePhoneChangeWrapper}
                    onPaste={(e) => handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true })}
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.telefono ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="Ej: 3001234567" 
                  />
                  {errors.telefono && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.telefono}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Dirección *
                  </label>
                  <input 
                    type="text" 
                    name="direccion" 
                    value={form.direccion} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white shadow-sm hover:shadow-md hover:border-gray-300 font-medium ${errors.direccion ? 'border-red-400 focus:ring-red-300 bg-red-50/50' : 'border-gray-200'}`} 
                    placeholder="Ej: Calle 123 #45-67" 
                  />
                  {errors.direccion && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.direccion}
                    </p>
                  )}
                </div>
                {/* Datos de la Marca */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    País *
                  </label>
                  <div className="flex items-center gap-3">
                    <select name="pais" value={form.pais} onChange={handleChange} className={`flex-1 border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.pais ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <option value="">Seleccionar</option>
                      {PAISES.map(p => (
                        <option key={p.codigo} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                    {form.pais && PAISES.find(p => p.nombre === form.pais) && (
                      <img
                        src={PAISES.find(p => p.nombre === form.pais).bandera}
                        alt={form.pais}
                        title={form.pais}
                        className="w-10 h-7 rounded-lg shadow-md border-2 border-gray-200 object-cover"
                      />
                    )}
                  </div>
                  {errors.pais && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.pais}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    Ciudad
                  </label>
                  <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.ciudad ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: Bogotá" />
                  {errors.ciudad && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.ciudad}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    Código Postal
                  </label>
                  <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleCodigoPostalChangeWrapper} onPaste={(e) => handleNumericPaste(e, {})} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.codigoPostal ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: 110111" />
                  {errors.codigoPostal && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.codigoPostal}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Nombre a Buscar (Marca) *
                  </label>
                  <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.nombreMarca ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Nombre de la marca a buscar" />
                  {errors.nombreMarca && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.nombreMarca}</p>}
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Tipo de Producto/Servicio *
                  </label>
                  
                  {/* Input de búsqueda */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar producto o servicio..."
                      value={busquedaProductoServicio}
                      onChange={handleBusquedaProductoServicioChange}
                      onFocus={() => setMostrarListaProductosServicios(true)}
                      onBlur={() => {
                        // Delay para permitir click en la lista
                        setTimeout(() => setMostrarListaProductosServicios(false), 200);
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-3.5 pl-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${
                        errors.tipoProductoServicio ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    
                    {/* Botón para limpiar búsqueda */}
                    {busquedaProductoServicio && (
                      <button
                        type="button"
                        onClick={() => {
                          setBusquedaProductoServicio('');
                          setOpcionSeleccionada(null);
                          setForm(prev => ({ ...prev, tipoProductoServicio: '' }));
                          setMostrarListaProductosServicios(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </div>

                  {/* Lista desplegable de opciones filtradas */}
                  {mostrarListaProductosServicios && opcionesFiltradas.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {opcionesFiltradas.map((opcion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSeleccionarOpcion(opcion)}
                          className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            opcionSeleccionada?.value === opcion.value ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">{opcion.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {opcion.categoria === 'PRODUCTOS' ? 'Producto' : 'Servicio'}
                              </p>
                            </div>
                            {opcionSeleccionada?.value === opcion.value && (
                              <i className="bi bi-check-circle text-blue-600 ml-2"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mensaje cuando no hay resultados */}
                  {mostrarListaProductosServicios && busquedaProductoServicio.trim() && opcionesFiltradas.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4">
                      <p className="text-sm text-gray-500 text-center">
                        No se encontraron opciones que coincidan con "{busquedaProductoServicio}"
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-2">
                        Puedes escribir libremente el tipo de producto o servicio
                      </p>
                    </div>
                  )}

                  {errors.tipoProductoServicio && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <span>⚠</span>{errors.tipoProductoServicio}
                    </p>
                  )}

                  {/* Mostrar opción seleccionada */}
                  {opcionSeleccionada && !mostrarListaProductosServicios && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-700">
                        <i className="bi bi-check-circle text-blue-600 mr-1"></i>
                        Seleccionado: <span className="font-semibold">{opcionSeleccionada.item}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {opcionSeleccionada.subcategoria}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Clases de la Marca (Opcional) - Se mapea a clase_niza */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clases de la marca (Opcional)
                </label>
                <a
                  href="https://www.wipo.int/es/web/classification-nice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs mb-2 inline-block"
                >
                  Consulta la Clasificación de Niza para identificar la clase adecuada
                </a>
                <div className="space-y-2">
                  {form.clases.map((clase, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="N° Clase" 
                    value={clase.numero} 
                    onChange={e => handleClaseNumeroChange(i, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                      const soloNumeros = pastedText.replace(/\D/g, '').slice(0, 2);
                      handleClaseChange(i, 'numero', soloNumeros);
                    }} 
                    maxLength={2}
                    className="w-24 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" 
                  />
                      <input type="text" placeholder="Descripción (opcional)" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                      <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                      {errors[`clase_numero_${i}`] && <span className="text-xs text-red-600">{errors[`clase_numero_${i}`]}</span>}
                    </div>
                  ))}
                  <button type="button" onClick={addClase} disabled={form.clases.length >= 25} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Añadir Clase</button>
                </div>
              </div>
              {/* Adjuntar Logotipo (Requerido) - Se mapea a logotipo */}
              <div className="mb-4">
                <FileUpload
                  name="logotipoMarca"
                  value={form.logotipoMarca}
                  onChange={handleChange}
                  label="Logotipo de la Marca *"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  error={errors.logotipoMarca}
                />
              </div>
              {/* Botones de acción modernos - Solo mostrar si renderForm es true */}
              {renderForm && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/60 mt-8 bg-white/50 rounded-xl p-6 backdrop-blur-sm">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enviar Solicitud
                    </span>
                  </button>
                </div>
              )}
            </FormWrapper>
          );
        })()}
        </div>
      </div>
    </div>
  );
};

export default FormularioBusqueda;
