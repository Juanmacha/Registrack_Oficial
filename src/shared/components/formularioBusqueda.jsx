import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import ValidationService from '../../utils/validationService.js';
import FileUpload from './FileUpload.jsx';

// ✅ Actualizado según especificación: valores válidos según FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md
const tiposDocumento = [
  'Cédula de Ciudadanía',
  'Cédula de Extranjería', 
  'Pasaporte',
  'NIT',
  'Tarjeta de Identidad'
];

const FormularioBusqueda = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Búsqueda de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors }) => {
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

  // Usar props si están disponibles, sino usar estado local
  const form = propForm || localForm;
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
    }
  }, [isOpen, tipoSolicitud]);

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

  const handleChange = e => {
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

  if (!isOpen) {
    console.log('🔧 [FormularioBusqueda] isOpen es false, no renderizando');
    return null;
  }

  console.log('✅ [FormularioBusqueda] Renderizando formulario...');
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
                Tipo de Documento * <span className="text-xs text-gray-500 font-normal">(tipo_documento)</span>
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
                Número de Documento * <span className="text-xs text-gray-500 font-normal">(numero_documento)</span>
              </label>
              <input 
                type="text" 
                name="numeroDocumento" 
                value={form.numeroDocumento} 
                onChange={handleChange} 
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
                Nombres * <span className="text-xs text-gray-500 font-normal">(nombres_apellidos)</span>
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
                Apellidos * <span className="text-xs text-gray-500 font-normal">(nombres_apellidos)</span>
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
                Correo Electrónico * <span className="text-xs text-gray-500 font-normal">(correo)</span>
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
                Teléfono * <span className="text-xs text-gray-500 font-normal">(telefono)</span>
              </label>
              <input 
                type="text" 
                name="telefono" 
                value={form.telefono} 
                onChange={handleChange} 
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
                Dirección * <span className="text-xs text-gray-500 font-normal">(direccion)</span>
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
                País * <span className="text-xs text-gray-500 font-normal">(pais)</span>
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
                Ciudad <span className="text-xs text-gray-500 font-normal">(opcional - ciudad)</span>
              </label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.ciudad ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: Bogotá" />
              {errors.ciudad && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.ciudad}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Código Postal <span className="text-xs text-gray-500 font-normal">(opcional - codigo_postal)</span>
              </label>
              <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.codigoPostal ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: 110111" />
              {errors.codigoPostal && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.codigoPostal}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Nombre a Buscar (Marca) * <span className="text-xs text-gray-500 font-normal">(nombre_a_buscar)</span>
              </label>
              <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.nombreMarca ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Nombre de la marca a buscar" />
              {errors.nombreMarca && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.nombreMarca}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Tipo de Producto/Servicio * <span className="text-xs text-gray-500 font-normal">(tipo_producto_servicio)</span>
              </label>
              <input type="text" name="tipoProductoServicio" value={form.tipoProductoServicio} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md ${errors.tipoProductoServicio ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`} placeholder="Ej: Productos tecnológicos" />
              {errors.tipoProductoServicio && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.tipoProductoServicio}</p>}
            </div>
          </div>
          {/* Clases de la Marca (Opcional) - Se mapea a clase_niza */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clases de la marca (Opcional) <span className="text-xs text-gray-500 font-normal">(clase_niza - opcional)</span>
            </label>
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
                  <input type="number" min="1" max="45" placeholder="N° Clase" value={clase.numero} onChange={e => handleClaseChange(i, 'numero', e.target.value)} className="w-24 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
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
              label="Logotipo de la Marca * (logotipo - requerido)"
              required={true}
              accept=".jpg,.jpeg,.png"
              error={errors.logotipoMarca}
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
        </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioBusqueda;
