import React, { useState, useEffect } from 'react';
import { PAISES } from '../../../../../shared/utils/paises.js';
import { AlertService } from '../../../../../shared/styles/alertStandards.js';

const tiposDocumento = ['Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte', 'DNI', 'Otro'];
const tiposEntidad = ['Sociedad Anónima', 'SAS', 'LTDA', 'Otra'];

const EditarVenta = ({ datos, isOpen, onClose, onGuardar }) => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && datos) {
      // Separar nombres y apellidos si viene nombrecompleto
      let nombres = datos.nombres || '';
      let apellidos = datos.apellidos || '';
      
      if (datos.nombrecompleto && !nombres && !apellidos) {
        const partes = datos.nombrecompleto.split(' ');
        nombres = partes[0] || '';
        apellidos = partes.slice(1).join(' ') || '';
      }

      setForm({
        // Campos editables
        pais: datos.pais || '',
        ciudad: datos.ciudad || '',
        tipodepersona: datos.tipodepersona || datos.tipoPersona || '',
        tipodedocumento: datos.tipodedocumento || datos.tipoDocumento || '',
        numerodedocumento: datos.numerodedocumento || datos.numeroDocumento || '',
        nombres: nombres,
        apellidos: apellidos,
        correoelectronico: datos.correoelectronico || datos.email || '',
        telefono: datos.telefono || '',
        direccion: datos.direccion || '',
        tipodeentidadrazonsocial: datos.tipodeentidadrazonsocial || datos.tipoEntidad || '',
        nombredelaempresa: datos.nombredelaempresa || datos.nombreEmpresa || '',
        nit: datos.nit || '',
        poderdelrepresentanteautorizado: datos.poderdelrepresentanteautorizado || datos.poderRepresentante || '',
        poderparaelregistrodelamarca: datos.poderparaelregistrodelamarca || datos.poderAutorizacion || '',
        // Campos no editables (solo lectura)
        expediente: datos.expediente || datos.numero_expediente || '',
        estado: datos.estado || '',
        tipoSolicitud: datos.tipoSolicitud || datos.tipo_servicio || '',
        fechaCreacion: datos.fecha_creacion || datos.fechaCreacion || '',
        nombreMarca: datos.nombreMarca || datos.nombre_marca || '',
        categoria: datos.categoria || '',
        clases: datos.clases || [],
      });
      setErrors({});
    }
  }, [isOpen, datos]);

  const esNatural = form.tipodepersona === 'Natural';
  const esJuridica = form.tipodepersona === 'Jurídica';

  // Validar solo campos editables
  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};

    // Validar tipo de persona
    if (!f.tipodepersona) e.tipodepersona = 'Requerido';

    // Validaciones para persona Natural
    if (esNatural) {
      if (!f.tipodedocumento) e.tipodedocumento = 'Requerido';
      if (!f.numerodedocumento) e.numerodedocumento = 'Requerido';
      else if (f.tipodedocumento !== 'Pasaporte' && !/^[0-9]{6,15}$/.test(f.numerodedocumento)) {
        e.numerodedocumento = 'Solo números, 6-15 dígitos';
      }
      else if (f.tipodedocumento === 'Pasaporte' && !/^[A-Za-z0-9]{6,20}$/.test(f.numerodedocumento)) {
        e.numerodedocumento = 'Pasaporte: solo letras y números, 6-20 caracteres';
      }
      if (!f.nombres || !f.nombres.trim()) e.nombres = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.nombres.trim())) {
        e.nombres = 'Solo letras, 2-50 caracteres';
      }
      if (!f.apellidos || !f.apellidos.trim()) e.apellidos = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/.test(f.apellidos.trim())) {
        e.apellidos = 'Solo letras, 2-50 caracteres';
      }
    }

    // Validaciones para persona Jurídica
    if (esJuridica) {
      if (!f.tipodeentidadrazonsocial) e.tipodeentidadrazonsocial = 'Requerido';
      if (!f.nombredelaempresa || !f.nombredelaempresa.trim()) e.nombredelaempresa = 'Requerido';
      else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,80}$/.test(f.nombredelaempresa.trim())) {
        e.nombredelaempresa = 'Solo letras, números y básicos, 2-80 caracteres';
      }
      if (!f.nit) e.nit = 'Requerido';
      else if (!/^[0-9]{6,15}$/.test(f.nit)) e.nit = 'Solo números, 6-15 dígitos';
    }

    // Validaciones comunes
    if (!f.correoelectronico || !f.correoelectronico.trim()) e.correoelectronico = 'Requerido';
    else if (!/^\S+@\S+\.\S+$/.test(f.correoelectronico.trim())) {
      e.correoelectronico = 'Correo inválido';
    }
    if (!f.telefono || !f.telefono.trim()) e.telefono = 'Requerido';
    else if (!/^[0-9]{7,15}$/.test(f.telefono.trim())) {
      e.telefono = 'Solo números, 7-15 dígitos';
    }
    if (!f.direccion || !f.direccion.trim()) e.direccion = 'Requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,#-]{5,100}$/.test(f.direccion.trim())) {
      e.direccion = 'Dirección inválida';
    }
    if (!f.pais) e.pais = 'Requerido';
    if (!f.ciudad || !f.ciudad.trim()) e.ciudad = 'Requerido';

    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => {
      const updatedForm = { ...f, [name]: value };
      const newErrors = validate(updatedForm);
      setErrors(newErrors);
      return updatedForm;
    });
  };

  // Utilidad para convertir File a base64
  const fileToBase64 = file => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      AlertService.error("Error en el formulario", "Por favor, corrige los campos marcados en rojo antes de continuar.");
      return;
    }

    try {
      // Preparar datos en formato de API (snake_case)
      const datosAPI = {
        pais: form.pais || '',
        ciudad: form.ciudad || '',
        tipodepersona: form.tipodepersona || '',
        tipodedocumento: form.tipodedocumento || '',
        numerodedocumento: form.numerodedocumento || '',
        nombrecompleto: `${form.nombres || ''} ${form.apellidos || ''}`.trim(),
        correoelectronico: form.correoelectronico || '',
        telefono: form.telefono || '',
        direccion: form.direccion || '',
        tipodeentidadrazonsocial: form.tipodeentidadrazonsocial || '',
        nombredelaempresa: form.nombredelaempresa || '',
        nit: form.nit || '',
        poderdelrepresentanteautorizado: form.poderdelrepresentanteautorizado || '',
        poderparaelregistrodelamarca: form.poderparaelregistrodelamarca || ''
      };

      await onGuardar(datosAPI);
      AlertService.success("Solicitud actualizada", "La solicitud se ha actualizado correctamente.");
      onClose();
    } catch (err) {
      console.error('Error al guardar:', err);
      AlertService.error("Error al guardar", err.message || "No se pudo actualizar la solicitud. Intente nuevamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2563eb" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 12.362-12.303ZM19 7l-2-2" />
              </svg>
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Editar Solicitud</h2>
              <p className="text-sm text-gray-500 mt-1">
                {form.expediente && `Expediente: ${form.expediente}`}
                {form.tipoSolicitud && ` • ${form.tipoSolicitud}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de Solo Lectura */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información de Solo Lectura
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <div className="text-sm font-medium text-gray-800 bg-white px-3 py-2 rounded border border-gray-200">
                  {form.estado || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Creación</label>
                <div className="text-sm text-gray-800 bg-white px-3 py-2 rounded border border-gray-200">
                  {form.fechaCreacion ? new Date(form.fechaCreacion).toLocaleDateString('es-CO') : 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre de Marca</label>
                <div className="text-sm text-gray-800 bg-white px-3 py-2 rounded border border-gray-200">
                  {form.nombreMarca || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Información del Solicitante - Campos Editables */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Solicitante
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Persona */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Persona <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipodepersona"
                  value={form.tipodepersona || ''}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tipodepersona ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
                {errors.tipodepersona && <p className="text-xs text-red-600 mt-1">{errors.tipodepersona}</p>}
              </div>

              {/* Persona Natural */}
              {esNatural && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tipodedocumento"
                      value={form.tipodedocumento || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.tipodedocumento ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.tipodedocumento && <p className="text-xs text-red-600 mt-1">{errors.tipodedocumento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numerodedocumento"
                      value={form.numerodedocumento || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.numerodedocumento ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.numerodedocumento && <p className="text-xs text-red-600 mt-1">{errors.numerodedocumento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={form.nombres || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nombres ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nombres && <p className="text-xs text-red-600 mt-1">{errors.nombres}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={form.apellidos || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.apellidos ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.apellidos && <p className="text-xs text-red-600 mt-1">{errors.apellidos}</p>}
                  </div>
                </>
              )}

              {/* Persona Jurídica */}
              {esJuridica && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Entidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tipodeentidadrazonsocial"
                      value={form.tipodeentidadrazonsocial || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.tipodeentidadrazonsocial ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar</option>
                      {tiposEntidad.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.tipodeentidadrazonsocial && <p className="text-xs text-red-600 mt-1">{errors.tipodeentidadrazonsocial}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empresa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombredelaempresa"
                      value={form.nombredelaempresa || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nombredelaempresa ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nombredelaempresa && <p className="text-xs text-red-600 mt-1">{errors.nombredelaempresa}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nit"
                      value={form.nit || ''}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nit ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nit && <p className="text-xs text-red-600 mt-1">{errors.nit}</p>}
                  </div>
                </>
              )}

              {/* Campos comunes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correoelectronico"
                  value={form.correoelectronico || ''}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.correoelectronico ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.correoelectronico && <p className="text-xs text-red-600 mt-1">{errors.correoelectronico}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={form.telefono || ''}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion || ''}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.direccion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.direccion && <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>}
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Información de Ubicación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="pais"
                    value={form.pais || ''}
                    onChange={handleChange}
                    className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.pais ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
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
                      className="w-8 h-6 rounded shadow border border-gray-300"
                    />
                  )}
                </div>
                {errors.pais && <p className="text-xs text-red-600 mt-1">{errors.pais}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={form.ciudad || ''}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ciudad ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ciudad && <p className="text-xs text-red-600 mt-1">{errors.ciudad}</p>}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarVenta;
