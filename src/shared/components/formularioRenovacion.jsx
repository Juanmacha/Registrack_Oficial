import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import FileUpload from './FileUpload.jsx';

// ✅ Actualizado según especificación
const tiposDocumento = [
  'Cédula de Ciudadanía',
  'Cédula de Extranjería', 
  'Pasaporte',
  'NIT',
  'Tarjeta de Identidad'
];
const tiposEntidad = [
  'Sociedad por Acciones Simplificada',
  'Sociedad Anónima',
  'Sociedad Limitada',
  'Empresa Unipersonal',
  'Sociedad en Comandita Simple',
  'Sociedad en Comandita por Acciones'
];

const FormularioRenovacion = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Renovación de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    tipoSolicitante: '', // ✅ Debe ser "Natural" o "Jurídica"
    tipoPersona: '', // ✅ Para compatibilidad con "Titular"
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: 'Bogotá', // ✅ Default según especificación
    codigoPostal: '110111', // ✅ NUEVO: Campo opcional
    tipoEntidad: '',
    razonSocial: '',
    nit: '',
    representanteLegal: '', // ✅ Nombre correcto según especificación
    pais: '',
    nombreMarca: '',
    numeroExpedienteMarca: '', // ✅ NUEVO: Campo requerido según especificación
    clases: [{ numero: '', descripcion: '' }],
    certificadoRenovacion: null,
    logotipoMarca: null,
    poderAutorizacion: null, // ✅ Requerido según especificación
    fechaSolicitud: '',
    estado: 'En revisión',
    tipoSolicitud: tipoSolicitud,
    encargado: 'Sin asignar',
    proximaCita: null,
    comentarios: []
  });
  const [localErrors, setLocalErrors] = useState({});

  // Usar props si están disponibles, sino usar estado local
  const form = propForm || localForm;
  const setForm = propSetForm || setLocalForm;
  const errors = propErrors || localErrors;
  const setErrors = propSetErrors || setLocalErrors;

  useEffect(() => {
    if (isOpen) {
      setForm(f => ({ ...f, tipoSolicitud: tipoSolicitud }));
      setErrors({});
    } else {
    setForm({
        tipoSolicitante: '',
        tipoPersona: '',
        tipoDocumento: '',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: 'Bogotá', // ✅ Default
        codigoPostal: '110111', // ✅ NUEVO
        tipoEntidad: '',
        razonSocial: '',
        nit: '',
        representanteLegal: '', // ✅ Nombre correcto
        pais: '',
        nombreMarca: '',
        numeroExpedienteMarca: '', // ✅ NUEVO
        clases: [{ numero: '', descripcion: '' }],
        certificadoRenovacion: null,
        logotipoMarca: null,
        poderAutorizacion: null,
        fechaSolicitud: '',
        estado: 'En revisión',
        tipoSolicitud: tipoSolicitud,
        encargado: 'Sin asignar',
        proximaCita: null,
        comentarios: []
      });
      setErrors({});
    }
  }, [isOpen, tipoSolicitud]);

  // ✅ Actualizado: tipo_solicitante debe ser "Natural" o "Jurídica"
  const esNatural = form.tipoSolicitante === 'Natural' || (form.tipoSolicitante === 'Titular' && form.tipoPersona === 'Natural');
  const esJuridica = form.tipoSolicitante === 'Jurídica' || (form.tipoSolicitante === 'Titular' && form.tipoPersona === 'Jurídica');
  const esRepresentante = esJuridica; // ✅ Los poderes se requieren cuando es persona jurídica

  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};
    
    // ✅ Validación según especificación completa
    // Sección 1: Tipo de Solicitante
    if (!f.tipoSolicitante) {
      e.tipoSolicitante = 'Requerido';
    } else if (f.tipoSolicitante === 'Titular') {
      if (!f.tipoPersona) {
        e.tipoPersona = 'Requerido';
      }
    } else if (f.tipoSolicitante !== 'Natural' && f.tipoSolicitante !== 'Jurídica') {
      e.tipoSolicitante = 'Debe ser "Natural" o "Jurídica"';
    }
    
    // Sección 2: Información del Solicitante (siempre requerida)
    if (!f.nombres) e.nombres = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.nombres)) e.nombres = 'Solo letras, 2-50 caracteres';
    if (!f.apellidos) e.apellidos = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.apellidos)) e.apellidos = 'Solo letras, 2-50 caracteres';
    if (!f.tipoDocumento) e.tipoDocumento = 'Requerido';
    if (!f.numeroDocumento) e.numeroDocumento = 'Requerido';
    else {
      if (f.tipoDocumento === 'Pasaporte') {
        if (!/^[A-Za-z0-9]{6,20}$/.test(f.numeroDocumento)) e.numeroDocumento = 'Pasaporte: solo letras y números, 6-20 caracteres';
      } else if (f.tipoDocumento === 'NIT') {
        if (!/^[0-9]{9,15}$/.test(f.numeroDocumento)) e.numeroDocumento = 'NIT: solo números, 9-15 dígitos';
      } else {
        if (!/^[0-9]{6,20}$/.test(f.numeroDocumento)) e.numeroDocumento = 'Solo números, 6-20 dígitos';
      }
    }
    if (!f.direccion) e.direccion = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,#-]{5,500}$/.test(f.direccion)) e.direccion = 'Dirección inválida (5-500 caracteres)';
    if (!f.telefono) e.telefono = 'Requerido';
    else if (!/^[0-9]{7,20}$/.test(f.telefono)) e.telefono = 'Solo números, 7-20 dígitos';
    if (!f.email) e.email = 'Requerido';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo inválido';
    if (!f.pais) e.pais = 'Requerido';
    if (f.codigoPostal && !/^[0-9]{4,10}$/.test(f.codigoPostal)) {
      e.codigoPostal = 'Código postal inválido (4-10 dígitos)';
    }
    
    // Sección 3: Información de la Empresa (solo si es Jurídica)
    if (esJuridica || (f.tipoSolicitante === 'Titular' && f.tipoPersona === 'Jurídica')) {
      if (!f.tipoEntidad) e.tipoEntidad = 'Requerido';
      if (!f.razonSocial) e.razonSocial = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.razonSocial)) e.razonSocial = 'Solo letras, números y básicos, 2-100 caracteres';
      if (!f.nit) e.nit = 'Requerido';
      else if (!/^[0-9]{10}$/.test(f.nit)) e.nit = 'NIT debe tener exactamente 10 dígitos (sin guión)';
      else if (parseInt(f.nit) < 1000000000 || parseInt(f.nit) > 9999999999) {
        e.nit = 'NIT debe estar entre 1000000000 y 9999999999';
      }
      if (!f.representanteLegal) e.representanteLegal = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,100}$/.test(f.representanteLegal)) e.representanteLegal = 'Solo letras, 3-100 caracteres';
    }
    
    // Sección 4: Información de la Marca
    if (!f.nombreMarca) e.nombreMarca = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.nombreMarca)) e.nombreMarca = 'Solo letras, números y básicos, 2-100 caracteres';
    // ✅ NUEVO: numero_expediente_marca (requerido)
    if (!f.numeroExpedienteMarca) e.numeroExpedienteMarca = 'Requerido';
    else if (!/^[A-Za-z0-9-]{3,30}$/.test(f.numeroExpedienteMarca)) e.numeroExpedienteMarca = 'Número de expediente inválido (3-30 caracteres, letras, números y guiones)';
    if (!f.logotipoMarca) {
      e.logotipoMarca = 'El logotipo es requerido';
    } else if (f.logotipoMarca instanceof File) {
      if (f.logotipoMarca.size > 5 * 1024 * 1024) {
        e.logotipoMarca = 'El logotipo no puede exceder 5MB';
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.logotipoMarca.type)) {
        e.logotipoMarca = 'El logotipo debe ser JPG o PNG';
      }
    }
    
    // Sección 5: Documentos
    if (!f.certificadoRenovacion) {
      e.certificadoRenovacion = 'El certificado de renovación es requerido';
    } else if (f.certificadoRenovacion instanceof File) {
      if (f.certificadoRenovacion.size > 5 * 1024 * 1024) {
        e.certificadoRenovacion = 'El certificado no puede exceder 5MB';
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.certificadoRenovacion.type)) {
        e.certificadoRenovacion = 'El certificado debe ser PDF, JPG o PNG';
      }
    }
    if (!f.poderAutorizacion) {
      e.poderAutorizacion = 'El poder de autorización es requerido';
    } else if (f.poderAutorizacion instanceof File) {
      if (f.poderAutorizacion.size > 5 * 1024 * 1024) {
        e.poderAutorizacion = 'El poder no puede exceder 5MB';
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.poderAutorizacion.type)) {
        e.poderAutorizacion = 'El poder debe ser PDF, JPG o PNG';
      }
    }
    
    return e;
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    let newValue;
    
    if (type === 'file') {
      // Manejar archivos del FileUpload (evento sintético)
      if (files && files.length > 0) {
        newValue = files[0];
      } else {
        // Si no hay archivos, limpiar el campo
        newValue = null;
      }
    } else {
      newValue = value;
    }
    
    setForm(f => {
      const updatedForm = { ...f, [name]: newValue };
      const newErrors = validate(updatedForm);
      setErrors(newErrors);
      return updatedForm;
    });
  };

  const handleClaseChange = (i, field, value) => {
    setForm(f => {
      const clases = [...f.clases];
      clases[i][field] = value;
      return { ...f, clases };
    });
    setErrors(prev => ({ ...prev, [`clase_${field}_${i}`]: '' }));
  };

  const addClase = () => {
    if (form.clases.length < 25) {
      setForm(f => ({ ...f, clases: [...f.clases, { numero: '', descripcion: '' }] }));
    }
  };

  const removeClase = i => {
    setForm(f => ({ ...f, clases: f.clases.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔧 [FormularioRenovacion] handleSubmit llamado');
    
    const newErrors = validate(form);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('🔧 [FormularioRenovacion] Formulario válido, llamando onGuardar');
      await onGuardar(form);
    } else {
      console.log('🔧 [FormularioRenovacion] Formulario con errores:', newErrors);
    }
  };

  if (!isOpen) return null;

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
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 px-8 py-6 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-2 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Solicitud de Renovación de Marca</h2>
                <p className="text-sm text-purple-100/90 font-medium">Complete la información requerida para continuar</p>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/60">
            {/* Tipo de Solicitud (bloqueado) */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Solicitud *</label>
              <input
                type="text"
                name="tipoSolicitud"
                value={form.tipoSolicitud}
                readOnly
                className="w-full border rounded p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            {/* Tipo de Solicitante - Actualizado según especificación */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Solicitante * <span className="text-xs text-gray-500 font-normal">(tipo_solicitante)</span></label>
              <select name="tipoSolicitante" value={form.tipoSolicitante} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoSolicitante ? 'border-red-500' : ''}`}>
                <option value="">Seleccionar</option>
                <option value="Natural">Natural</option>
                <option value="Jurídica">Jurídica</option>
                <option value="Titular">Titular (compatibilidad)</option>
              </select>
              {errors.tipoSolicitante && <p className="text-xs text-red-600">{errors.tipoSolicitante}</p>}
            </div>
            {/* Si es "Titular" (compatibilidad) */}
            {(form.tipoSolicitante === 'Titular') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Persona *</label>
                  <select name="tipoPersona" value={form.tipoPersona} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoPersona ? 'border-red-500' : ''}`}>
                    <option value="">Seleccionar</option>
                    <option value="Natural">Natural</option>
                    <option value="Jurídica">Jurídica</option>
                  </select>
                  {errors.tipoPersona && <p className="text-xs text-red-600">{errors.tipoPersona}</p>}
                </div>
                {/* Si Natural */}
                {esNatural && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Documento * <span className="text-xs text-gray-500 font-normal">(tipo_documento)</span></label>
                      <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoDocumento ? 'border-red-500' : ''}`}>
                        <option value="">Seleccionar</option>
                        {tiposDocumento.map(t => <option key={t}>{t}</option>)}
                      </select>
                      {errors.tipoDocumento && <p className="text-xs text-red-600">{errors.tipoDocumento}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Número de Documento * <span className="text-xs text-gray-500 font-normal">(numero_documento)</span></label>
                      <input type="text" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.numeroDocumento ? 'border-red-500' : ''}`} />
                      {errors.numeroDocumento && <p className="text-xs text-red-600">{errors.numeroDocumento}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombres * <span className="text-xs text-gray-500 font-normal">(nombres_apellidos)</span></label>
                      <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombres ? 'border-red-500' : ''}`} />
                      {errors.nombres && <p className="text-xs text-red-600">{errors.nombres}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Apellidos * <span className="text-xs text-gray-500 font-normal">(nombres_apellidos)</span></label>
                      <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.apellidos ? 'border-red-500' : ''}`} />
                      {errors.apellidos && <p className="text-xs text-red-600">{errors.apellidos}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Correo Electrónico * <span className="text-xs text-gray-500 font-normal">(correo)</span></label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.email ? 'border-red-500' : ''}`} />
                      {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono * <span className="text-xs text-gray-500 font-normal">(telefono)</span></label>
                      <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.telefono ? 'border-red-500' : ''}`} />
                      {errors.telefono && <p className="text-xs text-red-600">{errors.telefono}</p>}
                    </div>
                  </>
                )}
                {/* Si Jurídica */}
                {esJuridica && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Entidad * <span className="text-xs text-gray-500 font-normal">(tipo_entidad)</span></label>
                      <select name="tipoEntidad" value={form.tipoEntidad} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoEntidad ? 'border-red-500' : ''}`}>
                        <option value="">Seleccionar</option>
                        {tiposEntidad.map(t => <option key={t}>{t}</option>)}
                      </select>
                      {errors.tipoEntidad && <p className="text-xs text-red-600">{errors.tipoEntidad}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Razón Social * <span className="text-xs text-gray-500 font-normal">(razon_social)</span></label>
                      <input type="text" name="razonSocial" value={form.razonSocial} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.razonSocial ? 'border-red-500' : ''}`} />
                      {errors.razonSocial && <p className="text-xs text-red-600">{errors.razonSocial}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre de la Empresa *</label>
                      <input type="text" name="nombreEmpresa" value={form.nombreEmpresa} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombreEmpresa ? 'border-red-500' : ''}`} />
                      {errors.nombreEmpresa && <p className="text-xs text-red-600">{errors.nombreEmpresa}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">NIT * <span className="text-xs text-gray-500 font-normal">(nit_empresa)</span></label>
                      <input type="text" name="nit" value={form.nit} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nit ? 'border-red-500' : ''}`} />
                      {errors.nit && <p className="text-xs text-red-600">{errors.nit}</p>}
                    </div>
                  </>
                )}
              </>
            )}
            {/* Si Representante Autorizado */}
            {esRepresentante && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Documento *</label>
                  <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoDocumento ? 'border-red-500' : ''}`}>
                    <option value="">Seleccionar</option>
                    {tiposDocumento.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.tipoDocumento && <p className="text-xs text-red-600">{errors.tipoDocumento}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Documento *</label>
                  <input type="text" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.numeroDocumento ? 'border-red-500' : ''}`} />
                  {errors.numeroDocumento && <p className="text-xs text-red-600">{errors.numeroDocumento}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombres *</label>
                  <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombres ? 'border-red-500' : ''}`} />
                  {errors.nombres && <p className="text-xs text-red-600">{errors.nombres}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellidos *</label>
                  <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.apellidos ? 'border-red-500' : ''}`} />
                  {errors.apellidos && <p className="text-xs text-red-600">{errors.apellidos}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Correo Electrónico *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.email ? 'border-red-500' : ''}`} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono *</label>
                  <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.telefono ? 'border-red-500' : ''}`} />
                  {errors.telefono && <p className="text-xs text-red-600">{errors.telefono}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección * <span className="text-xs text-gray-500 font-normal">(direccion)</span></label>
                  <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.direccion ? 'border-red-500' : ''}`} />
                  {errors.direccion && <p className="text-xs text-red-600">{errors.direccion}</p>}
                </div>
              </>
            )}
            {/* Datos de la Marca */}
            <div>
              <label className="block text-sm font-medium mb-1">País * <span className="text-xs text-gray-500 font-normal">(pais)</span></label>
              <div className="flex items-center gap-2">
                <select name="pais" value={form.pais} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.pais ? 'border-red-500' : ''}`}>
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
                    className="w-7 h-5 rounded shadow border border-gray-300"
                  />
                )}
              </div>
              {errors.pais && <p className="text-xs text-red-600">{errors.pais}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad <span className="text-xs text-gray-500 font-normal">(opcional - ciudad)</span></label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.ciudad ? 'border-red-500' : ''}`} placeholder="Ej: Bogotá" />
              {errors.ciudad && <p className="text-xs text-red-600">{errors.ciudad}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código Postal</label>
              <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.codigoPostal ? 'border-red-500' : ''}`} placeholder="Ej: 110111" />
              {errors.codigoPostal && <p className="text-xs text-red-600">{errors.codigoPostal}</p>}
            </div>
            {/* Sección 4: Información de la Marca */}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Marca * <span className="text-xs text-gray-500 font-normal">(nombre_marca)</span></label>
              <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombreMarca ? 'border-red-500' : ''}`} />
              {errors.nombreMarca && <p className="text-xs text-red-600">{errors.nombreMarca}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de Expediente de la Marca * <span className="text-xs text-gray-500 font-normal">(numero_expediente_marca)</span></label>
              <input type="text" name="numeroExpedienteMarca" value={form.numeroExpedienteMarca} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.numeroExpedienteMarca ? 'border-red-500' : ''}`} placeholder="Ej: 2020-123456" />
              {errors.numeroExpedienteMarca && <p className="text-xs text-red-600">{errors.numeroExpedienteMarca}</p>}
            </div>
          </div>
          {/* Clases de la Marca (Opcional) */}
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
              {form.clases?.map((clase, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="number" min="1" max="45" placeholder="N° Clase" value={clase.numero} onChange={e => handleClaseChange(i, 'numero', e.target.value)} className="w-24 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                  <input type="text" placeholder="Descripción (opcional)" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                  <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                </div>
              ))}
              <button type="button" onClick={addClase} disabled={form.clases?.length >= 25} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Añadir Clase</button>
            </div>
          </div>
          {/* Sección 5: Documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              name="certificadoRenovacion"
              value={form.certificadoRenovacion}
              onChange={handleChange}
              label="Certificado de Renovación * (certificado_renovacion)"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.certificadoRenovacion}
            />
            <FileUpload
              name="logotipoMarca"
              value={form.logotipoMarca}
              onChange={handleChange}
              label="Logotipo de la Marca * (logotipo)"
              required={true}
              accept=".jpg,.jpeg,.png"
              error={errors.logotipoMarca}
            />
            <FileUpload
              name="poderAutorizacion"
              value={form.poderAutorizacion}
              onChange={handleChange}
              label="Poder de Autorización * (poder_autorizacion)"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.poderAutorizacion}
            />
            {esRepresentante && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Poder del Representante Autorizado *</label>
                  <input type="file" name="poderRepresentante" onChange={handleChange} className="w-full" />
                  {errors.poderRepresentante && <p className="text-xs text-red-600">{errors.poderRepresentante}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poder que nos autoriza *</label>
                  <input type="file" name="poderAutorizacion" onChange={handleChange} className="w-full" />
                  {errors.poderAutorizacion && <p className="text-xs text-red-600">{errors.poderAutorizacion}</p>}
                </div>
              </>
            )}
          </div>
          {/* Botones de acción modernos */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioRenovacion;