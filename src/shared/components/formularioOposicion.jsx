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

const FormularioOposicion = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Oposición de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    tipoSolicitante: '', // ✅ Debe ser "Natural" o "Jurídica"
    tipoPersona: '', // ✅ Para compatibilidad
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
    marcaAOponerse: '', // ✅ Nombre correcto según especificación
    argumentosRespuesta: '', // ✅ Nombre correcto según especificación (min 10 caracteres)
    documentosOposicion: null,
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
        marcaAOponerse: '', // ✅ Nombre correcto
        argumentosRespuesta: '', // ✅ Nombre correcto
        documentosOposicion: null,
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
    
    // ✅ IMPORTANTE: nit_empresa es SIEMPRE requerido para Presentación de Oposición (según documentación)
    if (!f.nit) e.nit = 'Requerido';
    else if (!/^[0-9]{10}$/.test(f.nit)) e.nit = 'NIT debe tener exactamente 10 dígitos (sin guión)';
    else if (parseInt(f.nit) < 1000000000 || parseInt(f.nit) > 9999999999) {
      e.nit = 'NIT debe estar entre 1000000000 y 9999999999';
    }
    
    // Sección 3: Información de la Empresa (si es Jurídica)
    if (esJuridica || (f.tipoSolicitante === 'Titular' && f.tipoPersona === 'Jurídica')) {
        if (!f.tipoEntidad) e.tipoEntidad = 'Requerido';
        if (!f.razonSocial) e.razonSocial = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.razonSocial)) e.razonSocial = 'Solo letras, números y básicos, 2-100 caracteres';
      if (!f.representanteLegal) e.representanteLegal = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,100}$/.test(f.representanteLegal)) e.representanteLegal = 'Solo letras, 3-100 caracteres';
    }
    
    // Sección 4: Información de las Marcas
    if (!f.nombreMarca) e.nombreMarca = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.nombreMarca)) e.nombreMarca = 'Solo letras, números y básicos, 2-100 caracteres';
    if (!f.marcaAOponerse) e.marcaAOponerse = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.marcaAOponerse)) e.marcaAOponerse = 'Solo letras, números y básicos, 2-100 caracteres';
    
    // Sección 5: Argumentos y Documentos
    if (!f.argumentosRespuesta) e.argumentosRespuesta = 'Requerido';
    else if (f.argumentosRespuesta.length < 10) e.argumentosRespuesta = 'Mínimo 10 caracteres';
    if (!f.documentosOposicion) {
      e.documentosOposicion = 'Los documentos de oposición son requeridos';
    } else if (f.documentosOposicion instanceof File) {
      if (f.documentosOposicion.size > 5 * 1024 * 1024) {
        e.documentosOposicion = 'Los documentos no pueden exceder 5MB';
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.documentosOposicion.type)) {
        e.documentosOposicion = 'Los documentos deben ser PDF, JPG o PNG';
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
      if (files && files.length > 0) {
        newValue = files[0];
      } else {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔧 [FormularioOposicion] handleSubmit llamado');
    
    const newErrors = validate(form);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('🔧 [FormularioOposicion] Formulario válido, llamando onGuardar');
      await onGuardar(form);
    } else {
      console.log('🔧 [FormularioOposicion] Formulario con errores:', newErrors);
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
        {/* Encabezado moderno con gradiente */}
        <div className="relative bg-gradient-to-br from-rose-600 via-red-500 to-rose-600 px-8 py-6 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-2 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
              </div>
          <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Solicitud de Oposición de Marca</h2>
                <p className="text-sm text-rose-100/90 font-medium">Complete la información requerida para continuar</p>
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
                      <label className="block text-sm font-medium mb-1">Número de Documento *</label>
                      <input type="text" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.numeroDocumento ? 'border-red-500' : ''}`} />
                      {errors.numeroDocumento && <p className="text-xs text-red-600">{errors.numeroDocumento}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombres * <span className="text-xs text-gray-500 font-normal">(nombres_apellidos)</span></label>
                      <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombres ? 'border-red-500' : ''}`} />
                      {errors.nombres && <p className="text-xs text-red-600">{errors.nombres}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Apellidos *</label>
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
                    {/* ✅ NIT ya está fuera del bloque condicional, no duplicar aquí */}
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
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.ciudad ? 'border-red-500' : ''}`} placeholder="Ej: Bogotá" />
              {errors.ciudad && <p className="text-xs text-red-600">{errors.ciudad}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código Postal</label>
              <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.codigoPostal ? 'border-red-500' : ''}`} placeholder="Ej: 110111" />
              {errors.codigoPostal && <p className="text-xs text-red-600">{errors.codigoPostal}</p>}
            </div>
            {/* ✅ IMPORTANTE: NIT de Empresa es SIEMPRE requerido para Presentación de Oposición */}
            <div>
              <label className="block text-sm font-medium mb-1">NIT de la Empresa * <span className="text-xs text-gray-500">(nit_empresa - siempre requerido)</span></label>
              <input type="text" name="nit" value={form.nit} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nit ? 'border-red-500' : ''}`} placeholder="10 dígitos (sin guión)" />
              {errors.nit && <p className="text-xs text-red-600">{errors.nit}</p>}
            </div>
            {/* Sección 4: Información de las Marcas */}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Marca * <span className="text-xs text-gray-500 font-normal">(nombre_marca)</span></label>
              <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombreMarca ? 'border-red-500' : ''}`} />
              {errors.nombreMarca && <p className="text-xs text-red-600">{errors.nombreMarca}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marca a la que se Oponen * <span className="text-xs text-gray-500 font-normal">(marca_a_oponerse)</span></label>
              <input type="text" name="marcaAOponerse" value={form.marcaAOponerse} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.marcaAOponerse ? 'border-red-500' : ''}`} />
              {errors.marcaAOponerse && <p className="text-xs text-red-600">{errors.marcaAOponerse}</p>}
            </div>
          </div>
          {/* Sección 5: Argumentos y Documentos */}
          <div>
            <label className="block text-sm font-medium mb-1">Argumentos de la Oposición * <span className="text-xs text-gray-500 font-normal">(argumentos_respuesta)</span></label>
            <textarea 
              name="argumentosRespuesta" 
              value={form.argumentosRespuesta} 
              onChange={handleChange} 
              rows="4"
              placeholder="Describa los argumentos legales de su oposición (mínimo 10 caracteres)..."
              className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.argumentosRespuesta ? 'border-red-500' : ''}`}
            />
            {errors.argumentosRespuesta && <p className="text-xs text-red-600">{errors.argumentosRespuesta}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              name="documentosOposicion"
              value={form.documentosOposicion}
              onChange={handleChange}
              label="Documentos de Oposición * (documentos_oposicion)"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.documentosOposicion}
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
            </div>
          {/* Botones de acción modernos */}
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
              className="px-8 py-3.5 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white rounded-xl hover:from-rose-700 hover:via-red-600 hover:to-rose-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enviar Solicitud
              </span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioOposicion;
