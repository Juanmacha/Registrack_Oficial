import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import FileUpload from './FileUpload.jsx';

const FormularioAmpliacion = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Ampliación de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors, renderForm = true }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    // ✅ Sección 1: Información del Titular
    documentoNitTitular: '', // ✅ Nombre correcto según especificación
    direccion: '',
    ciudad: 'Bogotá', // ✅ Default según especificación
    codigoPostal: '110111', // ✅ NUEVO: Campo opcional
    pais: '',
    email: '',
    telefono: '',
    // ✅ Sección 2: Información del Registro Existente
    numeroRegistroExistente: '', // ✅ Nombre correcto según especificación
    nombreMarca: '',
    claseNizaActual: '', // ✅ Nombre correcto según especificación
    nuevasClasesNiza: '', // ✅ Nombre correcto según especificación
    descripcionNuevosProductosServicios: '', // ✅ Nombre correcto según especificación (min 10 caracteres)
    // ✅ Sección 3: Documentos
    soportes: null, // ✅ Nombre correcto según especificación
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
        documentoNitTitular: '',
        direccion: '',
        ciudad: 'Bogotá', // ✅ Default
        codigoPostal: '110111', // ✅ NUEVO
        pais: '',
        email: '',
        telefono: '',
        numeroRegistroExistente: '',
        nombreMarca: '',
        claseNizaActual: '',
        nuevasClasesNiza: '',
        descripcionNuevosProductosServicios: '',
        soportes: null,
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
    
    // ✅ Validación según especificación completa
    // Sección 1: Información del Titular
    if (!f.documentoNitTitular) e.documentoNitTitular = 'Requerido';
    else if (!/^[0-9]{6,20}$/.test(f.documentoNitTitular)) e.documentoNitTitular = 'Documento/NIT inválido (6-20 dígitos)';
    if (!f.direccion) e.direccion = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,#-]{5,500}$/.test(f.direccion)) e.direccion = 'Dirección inválida (5-500 caracteres)';
    if (!f.ciudad) e.ciudad = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/.test(f.ciudad)) e.ciudad = 'Ciudad inválida (2-100 caracteres)';
    if (!f.pais) e.pais = 'Requerido';
    if (!f.email) e.email = 'Requerido';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo inválido';
    if (!f.telefono) e.telefono = 'Requerido';
    else if (!/^[0-9]{7,20}$/.test(f.telefono)) e.telefono = 'Solo números, 7-20 dígitos';
    if (f.codigoPostal && !/^[0-9]{4,10}$/.test(f.codigoPostal)) {
      e.codigoPostal = 'Código postal inválido (4-10 dígitos)';
    }
    
    // Sección 2: Información del Registro Existente
    if (!f.numeroRegistroExistente) e.numeroRegistroExistente = 'Requerido';
    else if (!/^[A-Za-z0-9-]{3,30}$/.test(f.numeroRegistroExistente)) e.numeroRegistroExistente = 'Número de registro inválido (3-30 caracteres)';
    if (!f.nombreMarca) e.nombreMarca = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,100}$/.test(f.nombreMarca)) e.nombreMarca = 'Solo letras, números y básicos, 2-100 caracteres';
    if (!f.claseNizaActual) e.claseNizaActual = 'Requerido';
    else if (!/^[0-9]{1,3}$/.test(f.claseNizaActual)) e.claseNizaActual = 'Clase Niza inválida (1-3 dígitos)';
    if (!f.nuevasClasesNiza) e.nuevasClasesNiza = 'Requerido';
    else if (!/^[0-9, ]+$/.test(f.nuevasClasesNiza)) e.nuevasClasesNiza = 'Formato inválido (ej: 28, 35)';
    if (!f.descripcionNuevosProductosServicios) e.descripcionNuevosProductosServicios = 'Requerido';
    else if (f.descripcionNuevosProductosServicios.length < 10) e.descripcionNuevosProductosServicios = 'Mínimo 10 caracteres';
    
    // Sección 3: Documentos
    if (!f.soportes) {
      e.soportes = 'Los soportes son requeridos';
    } else if (f.soportes instanceof File) {
      if (f.soportes.size > 5 * 1024 * 1024) {
        e.soportes = 'Los soportes no pueden exceder 5MB';
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(f.soportes.type)) {
        e.soportes = 'Los soportes deben ser PDF, JPG o PNG';
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
    console.log('🔧 [FormularioAmpliacion] handleSubmit llamado');
    
    const newErrors = validate(form);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('🔧 [FormularioAmpliacion] Formulario válido, llamando onGuardar');
      await onGuardar(form);
    } else {
      console.log('🔧 [FormularioAmpliacion] Formulario con errores:', newErrors);
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Solicitud de Ampliación de Marca</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Solicitud *</label>
                  <input
                    type="text"
                    name="tipoSolicitud"
                    value={form.tipoSolicitud}
                    readOnly
                    className="w-full border-2 rounded-xl px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Información del Titular */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Información del Titular
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Documento/NIT del Titular *</label>
                  <input type="text" name="documentoNitTitular" value={form.documentoNitTitular} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.documentoNitTitular ? 'border-red-400' : 'border-gray-300'}`} placeholder="6-20 dígitos" />
                  {errors.documentoNitTitular && <p className="text-xs text-red-600 mt-1">{errors.documentoNitTitular}</p>}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
                  <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.ciudad ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: Bogotá" />
                  {errors.ciudad && <p className="text-xs text-red-600 mt-1">{errors.ciudad}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Código Postal</label>
                  <input type="text" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl px-4 py-3" placeholder="Ej: 110111" />
                </div>
              </div>
            </div>

            {/* Sección 3: Información del Registro Existente */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Información del Registro Existente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Registro Existente *</label>
                  <input type="text" name="numeroRegistroExistente" value={form.numeroRegistroExistente} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.numeroRegistroExistente ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: 2020-567890" />
                  {errors.numeroRegistroExistente && <p className="text-xs text-red-600 mt-1">{errors.numeroRegistroExistente}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Marca *</label>
                  <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nombreMarca ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.nombreMarca && <p className="text-xs text-red-600 mt-1">{errors.nombreMarca}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Clase Niza Actual *</label>
                  <input type="text" name="claseNizaActual" value={form.claseNizaActual} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.claseNizaActual ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: 25" />
                  {errors.claseNizaActual && <p className="text-xs text-red-600 mt-1">{errors.claseNizaActual}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevas Clases Niza *</label>
                  <input type="text" name="nuevasClasesNiza" value={form.nuevasClasesNiza} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nuevasClasesNiza ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: 28, 35" />
                  {errors.nuevasClasesNiza && <p className="text-xs text-red-600 mt-1">{errors.nuevasClasesNiza}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción de Nuevos Productos/Servicios *</label>
                  <textarea
                    name="descripcionNuevosProductosServicios"
                    value={form.descripcionNuevosProductosServicios}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describa los nuevos productos o servicios (mínimo 10 caracteres)..."
                    className={`w-full border-2 rounded-xl px-4 py-3 ${errors.descripcionNuevosProductosServicios ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.descripcionNuevosProductosServicios && <p className="text-xs text-red-600 mt-1">{errors.descripcionNuevosProductosServicios}</p>}
                </div>
              </div>
            </div>

            {/* Sección 4: Documentos Requeridos */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Documentos Requeridos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  name="soportes"
                  value={form.soportes}
                  onChange={handleChange}
                  label="Soportes *"
                  required={true}
                  accept=".pdf,.jpg,.jpeg,.png"
                  error={errors.soportes}
                />
              </div>
            </div>

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

export default FormularioAmpliacion;
