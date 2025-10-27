import React, { useState, useEffect } from 'react';
import { PAISES } from '../../shared/utils/paises.js';
import Swal from 'sweetalert2';
import ValidationService from '../../utils/validationService.js';
import FileUpload from './FileUpload.jsx';

const tiposDocumento = ['Cédula', 'Pasaporte', 'DNI', 'Otro'];

const FormularioBusqueda = ({ isOpen, onClose, onGuardar, tipoSolicitud = 'Búsqueda de Marca', form: propForm, setForm: propSetForm, errors: propErrors, setErrors: propSetErrors }) => {
  // Estado local como fallback
  const [localForm, setLocalForm] = useState({
    tipoSolicitante: 'Representante Autorizado',
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    pais: '',
    ciudad: '', // ✅ NUEVO CAMPO
    nitMarca: '',
    nombreMarca: '',
    tipoProductoServicio: '', // ✅ NUEVO CAMPO
    clases: [{ numero: '', descripcion: '' }],
    poderRepresentante: null,
    poderAutorizacion: null,
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
        tipoSolicitante: 'Representante Autorizado',
        tipoDocumento: '',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        direccion: '',
        pais: '',
        ciudad: '', // ✅ NUEVO CAMPO
        nitMarca: '',
        nombreMarca: '',
        tipoProductoServicio: '', // ✅ NUEVO CAMPO
        clases: [{ numero: '', descripcion: '' }],
        poderRepresentante: null,
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

  const validate = (customForm) => {
    const f = customForm || form;
    const e = {};
    
    // ✅ NUEVO: Usar ValidationService para validaciones básicas
    const requiredFields = ['tipoDocumento', 'numeroDocumento', 'nombres', 'apellidos', 'email', 'telefono', 'direccion', 'pais', 'ciudad', 'nombreMarca', 'tipoProductoServicio'];
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
      if (f.tipoDocumento !== 'Pasaporte' && !/^[0-9]{6,15}$/.test(f.numeroDocumento)) {
        e.numeroDocumento = 'Solo números, 6-15 dígitos';
      } else if (f.tipoDocumento === 'Pasaporte' && !/^[A-Za-z0-9]{6,20}$/.test(f.numeroDocumento)) {
        e.numeroDocumento = 'Pasaporte: solo letras y números, 6-20 caracteres';
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
    
    if (f.nitMarca && !/^[0-9]{6,15}$/.test(f.nitMarca)) {
      e.nitMarca = 'Solo números, 6-15 dígitos';
    }
    
    if (f.nombreMarca && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,&-]{2,80}$/.test(f.nombreMarca)) {
      e.nombreMarca = 'Solo letras, números y básicos, 2-80 caracteres';
    }
    
    // Validaciones de clases
    if (!f.clases.length) {
      e.clases = 'Agrega al menos una clase';
    }
    
    f.clases.forEach((c, i) => {
      if (!c.numero) e[`clase_numero_${i}`] = 'Número requerido';
      if (!c.descripcion) e[`clase_desc_${i}`] = 'Descripción requerida';
    });
    
    // Validaciones de archivos
    if (!f.poderRepresentante) e.poderRepresentante = 'Adjunta el poder';
    if (!f.poderAutorizacion) e.poderAutorizacion = 'Adjunta el poder';
    
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh]">
        {/* Encabezado con ícono, título y subtítulo */}
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-t-xl mb-6">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2563eb" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 12.362-12.303ZM19 7l-2-2" />
            </svg>
          </span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Solicitud de Búsqueda de Marca</h2>
            <p className="text-sm text-gray-500">Complete la información del proceso</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4">
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
            {/* Datos del Representante */}
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
              <label className="block text-sm font-medium mb-1">Dirección *</label>
              <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.direccion ? 'border-red-500' : ''}`} />
              {errors.direccion && <p className="text-xs text-red-600">{errors.direccion}</p>}
            </div>
            {/* Datos de la Marca */}
            <div>
              <label className="block text-sm font-medium mb-1">País *</label>
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
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.ciudad ? 'border-red-500' : ''}`} placeholder="Ej: Bogotá" />
              {errors.ciudad && <p className="text-xs text-red-600">{errors.ciudad}</p>}
            </div>
                <div>
              <label className="block text-sm font-medium mb-1">NIT de la Marca *</label>
              <input type="text" name="nitMarca" value={form.nitMarca} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nitMarca ? 'border-red-500' : ''}`} />
              {errors.nitMarca && <p className="text-xs text-red-600">{errors.nitMarca}</p>}
                </div>
                <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Marca *</label>
              <input type="text" name="nombreMarca" value={form.nombreMarca} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.nombreMarca ? 'border-red-500' : ''}`} />
              {errors.nombreMarca && <p className="text-xs text-red-600">{errors.nombreMarca}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Producto/Servicio *</label>
              <input type="text" name="tipoProductoServicio" value={form.tipoProductoServicio} onChange={handleChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors.tipoProductoServicio ? 'border-red-500' : ''}`} placeholder="Ej: Productos tecnológicos" />
              {errors.tipoProductoServicio && <p className="text-xs text-red-600">{errors.tipoProductoServicio}</p>}
            </div>
          </div>
          {/* Clases de la Marca */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clases de la marca
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
                  <input type="text" placeholder="Descripción (el porqué)" value={clase.descripcion} onChange={e => handleClaseChange(i, 'descripcion', e.target.value)} className="flex-1 border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400" />
                  <button type="button" onClick={() => removeClase(i)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                  {errors[`clase_numero_${i}`] && <span className="text-xs text-red-600">{errors[`clase_numero_${i}`]}</span>}
                  {errors[`clase_desc_${i}`] && <span className="text-xs text-red-600">{errors[`clase_desc_${i}`]}</span>}
                </div>
              ))}
              {errors.clases && <p className="text-xs text-red-600">{errors.clases}</p>}
              <button type="button" onClick={addClase} disabled={form.clases.length >= 25} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Añadir Clase</button>
              </div>
          </div>
          {/* Adjuntar Documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              name="poderRepresentante"
              value={form.poderRepresentante}
              onChange={handleChange}
              label="Poder del Representante Autorizado"
              required={true}
              accept=".pdf,.doc,.docx"
              error={errors.poderRepresentante}
            />
            <FileUpload
              name="poderAutorizacion"
              value={form.poderAutorizacion}
              onChange={handleChange}
              label="Poder que nos autoriza"
              required={true}
              accept=".pdf,.doc,.docx"
              error={errors.poderAutorizacion}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-400">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioBusqueda;
