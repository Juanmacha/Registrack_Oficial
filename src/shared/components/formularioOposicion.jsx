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

const FormularioOposicion = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Oposición de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors, renderForm = true }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    tipoSolicitante: '', // ✅ Debe ser "Natural" o "Jurídica"
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

  // ✅ Simplificado: tipo_solicitante debe ser directamente "Natural" o "Jurídica"
  const esNatural = form.tipoSolicitante === 'Natural';
  const esJuridica = form.tipoSolicitante === 'Jurídica';

  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};
    
    // ✅ Validación según especificación completa
    // Sección 1: Tipo de Solicitante
    if (!f.tipoSolicitante) {
      e.tipoSolicitante = 'Requerido';
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
    if (esJuridica) {
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
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-8 py-6 shadow-xl">
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
            {/* Sección 1: Información General */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Solicitante *</label>
                  <select 
                    name="tipoSolicitante" 
                    value={form.tipoSolicitante} 
                    onChange={handleChange} 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white ${errors.tipoSolicitante ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar tipo de solicitante</option>
                    <option value="Natural">Persona Natural</option>
                    <option value="Jurídica">Persona Jurídica</option>
                  </select>
                  {errors.tipoSolicitante && <p className="text-xs text-red-600 mt-1">{errors.tipoSolicitante}</p>}
                </div>
              </div>
            </div>

            {/* Sección 2: Datos del Solicitante */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {esJuridica ? 'Datos de la Empresa' : 'Datos del Solicitante'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campos comunes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombres *</label>
                    <input type="text" name="nombres" value={form.nombres} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nombres ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.nombres && <p className="text-xs text-red-600 mt-1">{errors.nombres}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos *</label>
                    <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.apellidos ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.apellidos && <p className="text-xs text-red-600 mt-1">{errors.apellidos}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento *</label>
                    <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.tipoDocumento ? 'border-red-400' : 'border-gray-300'}`}>
                      <option value="">Seleccionar</option>
                      {tiposDocumento.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {errors.tipoDocumento && <p className="text-xs text-red-600 mt-1">{errors.tipoDocumento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento *</label>
                    <input type="text" name="numeroDocumento" value={form.numeroDocumento} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.numeroDocumento ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.numeroDocumento && <p className="text-xs text-red-600 mt-1">{errors.numeroDocumento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.email ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                    <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.telefono ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección *</label>
                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.direccion ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                    <div className="flex items-center gap-2">
                      <select name="pais" value={form.pais} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.pais ? 'border-red-400' : 'border-gray-300'}`}>
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
                    {errors.pais && <p className="text-xs text-red-600 mt-1">{errors.pais}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                    <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl px-4 py-3" placeholder="Ej: Bogotá" />
                  </div>
                  {/* ✅ IMPORTANTE: NIT de Empresa es SIEMPRE requerido para Presentación de Oposición */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIT de la Empresa *</label>
                    <input type="text" name="nit" value={form.nit} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nit ? 'border-red-400' : 'border-gray-300'}`} placeholder="10 dígitos (sin guión)" />
                    {errors.nit && <p className="text-xs text-red-600 mt-1">{errors.nit}</p>}
                  </div>
                  
                  {/* Campos específicos para Jurídica */}
                  {esJuridica && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Entidad *</label>
                        <select name="tipoEntidad" value={form.tipoEntidad} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.tipoEntidad ? 'border-red-400' : 'border-gray-300'}`}>
                          <option value="">Seleccionar</option>
                          {tiposEntidad.map(t => <option key={t}>{t}</option>)}
                        </select>
                        {errors.tipoEntidad && <p className="text-xs text-red-600 mt-1">{errors.tipoEntidad}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Razón Social *</label>
                        <input type="text" name="razonSocial" value={form.razonSocial} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.razonSocial ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.razonSocial && <p className="text-xs text-red-600 mt-1">{errors.razonSocial}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Representante Legal *</label>
                        <input type="text" name="representanteLegal" value={form.representanteLegal} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.representanteLegal ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.representanteLegal && <p className="text-xs text-red-600 mt-1">{errors.representanteLegal}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sección 3: Información de las Marcas */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Información de las Marcas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Marca *</label>
                    <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nombreMarca ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.nombreMarca && <p className="text-xs text-red-600 mt-1">{errors.nombreMarca}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marca a la que se Oponen *</label>
                    <input type="text" name="marcaAOponerse" value={form.marcaAOponerse} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.marcaAOponerse ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.marcaAOponerse && <p className="text-xs text-red-600 mt-1">{errors.marcaAOponerse}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Sección 4: Argumentos de la Oposición */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Argumentos de la Oposición
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Argumentos de la Oposición *</label>
                  <textarea 
                    name="argumentosRespuesta" 
                    value={form.argumentosRespuesta} 
                    onChange={handleChange} 
                    rows="6"
                    placeholder="Describa los argumentos legales de su oposición (mínimo 10 caracteres)..."
                    className={`w-full border-2 rounded-xl px-4 py-3 ${errors.argumentosRespuesta ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.argumentosRespuesta && <p className="text-xs text-red-600 mt-1">{errors.argumentosRespuesta}</p>}
                </div>
              </div>
            )}

            {/* Sección 5: Documentos */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Documentos Requeridos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload
                    name="documentosOposicion"
                    value={form.documentosOposicion}
                    onChange={handleChange}
                    label="Documentos de Oposición *"
                    required={true}
                    accept=".pdf,.jpg,.jpeg,.png"
                    error={errors.documentosOposicion}
                  />
                  <FileUpload
                    name="poderAutorizacion"
                    value={form.poderAutorizacion}
                    onChange={handleChange}
                    label="Poder de Autorización *"
                    required={true}
                    accept=".pdf,.jpg,.jpeg,.png"
                    error={errors.poderAutorizacion}
                  />
                </div>
              </div>
            )}

            {/* Botones - Solo mostrar si renderForm es true */}
            {renderForm && (
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Enviar Solicitud
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

export default FormularioOposicion;
