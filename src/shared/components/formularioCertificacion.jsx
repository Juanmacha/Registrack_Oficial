import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import { AlertService } from '../../shared/styles/alertStandards.js';
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

const FormularioCertificacion = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Certificación de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors, renderForm = true, renderModal = true }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    tipoSolicitante: '',
    tipoDocumento: '',
    numeroDocumento: '',
    numeroNitCedula: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    direccionDomicilio: '',
    ciudad: 'Bogotá',
    codigoPostal: '110111',
    tipoEntidad: '',
    razonSocial: '',
    nit: '',
    representanteLegal: '',
    pais: '',
    tipoProductoServicio: '',
    nombreMarca: '',
    clases: [{ numero: '', descripcion: '' }],
    certificadoCamara: null,
    logotipoMarca: null,
    poderAutorizacion: null,
    tipoSolicitud: tipoSolicitud
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
    } else {
      setForm({
        tipoSolicitante: '',
        tipoDocumento: '',
        numeroDocumento: '',
        numeroNitCedula: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        direccionDomicilio: '',
        ciudad: 'Bogotá',
        codigoPostal: '110111',
        tipoEntidad: '',
        razonSocial: '',
        nit: '',
        representanteLegal: '',
        pais: '',
        tipoProductoServicio: '',
        nombreMarca: '',
        clases: [{ numero: '', descripcion: '' }],
        certificadoCamara: null,
        logotipoMarca: null,
        poderAutorizacion: null,
        tipoSolicitud: tipoSolicitud
      });
      setErrors({});
    }
  }, [isOpen, tipoSolicitud]);

  const esNatural = form.tipoSolicitante === 'Natural';
  const esJuridica = form.tipoSolicitante === 'Jurídica';

  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};
    
    if (!f.tipoSolicitante) {
      e.tipoSolicitante = 'Requerido';
    }
    
    if (!f.nombres) e.nombres = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.nombres)) e.nombres = 'Solo letras, 2-50 caracteres';
    if (!f.apellidos) e.apellidos = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.apellidos)) e.apellidos = 'Solo letras, 2-50 caracteres';
    if (!f.tipoDocumento) e.tipoDocumento = 'Requerido';
    if (!f.numeroDocumento) e.numeroDocumento = 'Requerido';
    if (!f.numeroNitCedula) e.numeroNitCedula = 'Requerido';
    if (!f.direccion) e.direccion = 'Requerido';
    if (esJuridica && !f.direccionDomicilio) e.direccionDomicilio = 'Requerido para persona jurídica';
    if (!f.telefono) e.telefono = 'Requerido';
    if (!f.email) e.email = 'Requerido';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo inválido';
    if (!f.pais) e.pais = 'Requerido';
    
    if (esJuridica) {
      if (!f.tipoEntidad) e.tipoEntidad = 'Requerido';
      if (!f.razonSocial) e.razonSocial = 'Requerido';
      if (!f.nit) e.nit = 'Requerido';
      else if (!/^[0-9]{10}$/.test(f.nit)) e.nit = 'NIT debe tener exactamente 10 dígitos';
      else if (parseInt(f.nit) < 1000000000 || parseInt(f.nit) > 9999999999) {
        e.nit = 'NIT debe estar entre 1000000000 y 9999999999';
      }
      if (!f.representanteLegal) e.representanteLegal = 'Requerido';
      if (!f.certificadoCamara) e.certificadoCamara = 'Requerido para persona jurídica';
    }
    
    if (!f.nombreMarca) e.nombreMarca = 'Requerido';
    if (!f.tipoProductoServicio) e.tipoProductoServicio = 'Requerido';
    if (!f.logotipoMarca) e.logotipoMarca = 'Requerido';
    if (!f.poderAutorizacion) e.poderAutorizacion = 'Requerido';
    
    return e;
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    let newValue;
    
    if (type === 'file') {
      newValue = files && files.length > 0 ? files[0] : null;
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
    const newErrors = validate(form);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await onGuardar(form);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, completa todos los campos requeridos correctamente.',
      });
    }
  };

  // Si no se debe renderizar el modal, solo retornar el contenido del formulario
  if (!renderModal) {
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
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.tipoSolicitante ? 'border-red-400' : 'border-gray-300'}`}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número NIT/Cédula *</label>
                    <input type="text" name="numeroNitCedula" value={form.numeroNitCedula} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.numeroNitCedula ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.numeroNitCedula && <p className="text-xs text-red-600 mt-1">{errors.numeroNitCedula}</p>}
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección *</label>
                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.direccion ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
                  </div>
                  {esJuridica && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Domicilio *</label>
                      <input type="text" name="direccionDomicilio" value={form.direccionDomicilio} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.direccionDomicilio ? 'border-red-400' : 'border-gray-300'}`} />
                      {errors.direccionDomicilio && <p className="text-xs text-red-600 mt-1">{errors.direccionDomicilio}</p>}
                    </div>
                  )}
                  
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
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">NIT de la Empresa *</label>
                        <input type="text" name="nit" value={form.nit} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nit ? 'border-red-400' : 'border-gray-300'}`} placeholder="10 dígitos (sin guión)" />
                        {errors.nit && <p className="text-xs text-red-600 mt-1">{errors.nit}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Representante Legal *</label>
                        <input type="text" name="representanteLegal" value={form.representanteLegal} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.representanteLegal ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.representanteLegal && <p className="text-xs text-red-600 mt-1">{errors.representanteLegal}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sección 3: Información de la Marca */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Información de la Marca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                    <select name="pais" value={form.pais} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.pais ? 'border-red-400' : 'border-gray-300'}`}>
                      <option value="">Seleccionar</option>
                      {PAISES.map(p => (
                        <option key={p.codigo} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                    {errors.pais && <p className="text-xs text-red-600 mt-1">{errors.pais}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                    <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl px-4 py-3" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Marca *</label>
                    <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nombreMarca ? 'border-red-400' : 'border-gray-300'}`} />
                    {errors.nombreMarca && <p className="text-xs text-red-600 mt-1">{errors.nombreMarca}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Producto/Servicio *</label>
                    <input type="text" name="tipoProductoServicio" value={form.tipoProductoServicio} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.tipoProductoServicio ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: Productos tecnológicos" />
                    {errors.tipoProductoServicio && <p className="text-xs text-red-600 mt-1">{errors.tipoProductoServicio}</p>}
                  </div>
                  
                  {/* Clases de Niza */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Clases de Niza (Opcional)</label>
                    <a href="https://www.wipo.int/es/web/classification-nice" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mb-2 inline-block">
                      Consulta la Clasificación de Niza
                    </a>
                    <div className="space-y-2">
                      {form.clases.map((clase, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="number" min="1" max="45" placeholder="N° Clase" value={clase.numero} onChange={e => handleClaseChange(i, 'numero', e.target.value)} className="w-24 border-2 border-gray-300 rounded-xl px-3 py-2" />
                          <input type="text" placeholder="Descripción" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-2" />
                          {form.clases.length > 1 && (
                            <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-xl font-bold">×</button>
                          )}
                        </div>
                      ))}
                      {form.clases.length < 25 && (
                        <button type="button" onClick={addClase} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          + Añadir Clase
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección 4: Documentos */}
            {form.tipoSolicitante && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Documentos Requeridos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esJuridica && (
                    <FileUpload
                      name="certificadoCamara"
                      value={form.certificadoCamara}
                      onChange={handleChange}
                      label="Certificado de Cámara y Comercio *"
                      required={true}
                      accept=".pdf,.jpg,.jpeg,.png"
                      error={errors.certificadoCamara}
                    />
                  )}
                  <FileUpload
                    name="logotipoMarca"
                    value={form.logotipoMarca}
                    onChange={handleChange}
                    label="Logotipo de la Marca *"
                    required={true}
                    accept=".jpg,.jpeg,.png"
                    error={errors.logotipoMarca}
                  />
                  <FileUpload
                    name="poderAutorizacion"
                    value={form.poderAutorizacion}
                    onChange={handleChange}
                    label="Poder de Autorización *"
                    required={true}
                    accept=".pdf,.doc,.docx"
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
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[96vh] overflow-hidden border border-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-8 py-6 shadow-xl">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-2 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 017.5 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Solicitud de Certificación de Marca</h2>
                <p className="text-sm text-blue-100/90 font-medium">Complete la información requerida</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Contenido del formulario */}
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
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.tipoSolicitante ? 'border-red-400' : 'border-gray-300'}`}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Número NIT/Cédula *</label>
                        <input type="text" name="numeroNitCedula" value={form.numeroNitCedula} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.numeroNitCedula ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.numeroNitCedula && <p className="text-xs text-red-600 mt-1">{errors.numeroNitCedula}</p>}
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
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección *</label>
                        <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.direccion ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
                      </div>
                      {esJuridica && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección de Domicilio *</label>
                          <input type="text" name="direccionDomicilio" value={form.direccionDomicilio} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.direccionDomicilio ? 'border-red-400' : 'border-gray-300'}`} />
                          {errors.direccionDomicilio && <p className="text-xs text-red-600 mt-1">{errors.direccionDomicilio}</p>}
                        </div>
                      )}
                      
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
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">NIT de la Empresa *</label>
                            <input type="text" name="nit" value={form.nit} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nit ? 'border-red-400' : 'border-gray-300'}`} placeholder="10 dígitos (sin guión)" />
                            {errors.nit && <p className="text-xs text-red-600 mt-1">{errors.nit}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Representante Legal *</label>
                            <input type="text" name="representanteLegal" value={form.representanteLegal} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.representanteLegal ? 'border-red-400' : 'border-gray-300'}`} />
                            {errors.representanteLegal && <p className="text-xs text-red-600 mt-1">{errors.representanteLegal}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Sección 3: Información de la Marca */}
                {form.tipoSolicitante && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Información de la Marca
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">País *</label>
                        <select name="pais" value={form.pais} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.pais ? 'border-red-400' : 'border-gray-300'}`}>
                          <option value="">Seleccionar</option>
                          {PAISES.map(p => (
                            <option key={p.codigo} value={p.nombre}>{p.nombre}</option>
                          ))}
                        </select>
                        {errors.pais && <p className="text-xs text-red-600 mt-1">{errors.pais}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                        <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full border-2 border-gray-300 rounded-xl px-4 py-3" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Marca *</label>
                        <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.nombreMarca ? 'border-red-400' : 'border-gray-300'}`} />
                        {errors.nombreMarca && <p className="text-xs text-red-600 mt-1">{errors.nombreMarca}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Producto/Servicio *</label>
                        <input type="text" name="tipoProductoServicio" value={form.tipoProductoServicio} onChange={handleChange} className={`w-full border-2 rounded-xl px-4 py-3 ${errors.tipoProductoServicio ? 'border-red-400' : 'border-gray-300'}`} placeholder="Ej: Productos tecnológicos" />
                        {errors.tipoProductoServicio && <p className="text-xs text-red-600 mt-1">{errors.tipoProductoServicio}</p>}
                      </div>
                      
                      {/* Clases de Niza */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Clases de Niza (Opcional)</label>
                        <a href="https://www.wipo.int/es/web/classification-nice" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mb-2 inline-block">
                          Consulta la Clasificación de Niza
                        </a>
                        <div className="space-y-2">
                          {form.clases.map((clase, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="number" min="1" max="45" placeholder="N° Clase" value={clase.numero} onChange={e => handleClaseChange(i, 'numero', e.target.value)} className="w-24 border-2 border-gray-300 rounded-xl px-3 py-2" />
                              <input type="text" placeholder="Descripción" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-2" />
                              {form.clases.length > 1 && (
                                <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-xl font-bold">×</button>
                              )}
                            </div>
                          ))}
                          {form.clases.length < 25 && (
                            <button type="button" onClick={addClase} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              + Añadir Clase
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sección 4: Documentos */}
                {form.tipoSolicitante && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Documentos Requeridos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {esJuridica && (
                        <FileUpload
                          name="certificadoCamara"
                          value={form.certificadoCamara}
                          onChange={handleChange}
                          label="Certificado de Cámara y Comercio *"
                          required={true}
                          accept=".pdf,.jpg,.jpeg,.png"
                          error={errors.certificadoCamara}
                        />
                      )}
                      <FileUpload
                        name="logotipoMarca"
                        value={form.logotipoMarca}
                        onChange={handleChange}
                        label="Logotipo de la Marca *"
                        required={true}
                        accept=".jpg,.jpeg,.png"
                        error={errors.logotipoMarca}
                      />
                      <FileUpload
                        name="poderAutorizacion"
                        value={form.poderAutorizacion}
                        onChange={handleChange}
                        label="Poder de Autorización *"
                        required={true}
                        accept=".pdf,.doc,.docx"
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

export default FormularioCertificacion;
