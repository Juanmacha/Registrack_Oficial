import React, { useState, useEffect } from 'react';
import FileUpload from '../../../../../shared/components/FileUpload.jsx';
import { fileToBase64 } from '../../../../../shared/utils/fileUtils.js';

function EditarLandingData({ servicio, isOpen, onClose, onSave }) {
  const [form, setForm] = useState(servicio?.landing_data || {});
  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(servicio?.landing_data?.imagen || '');
  const [previewUrl, setPreviewUrl] = useState(null); // URL temporal para preview de archivos nuevos
  const [isSaving, setIsSaving] = useState(false);
  
  // Limpiar URLs de objeto cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Actualizar form y preview cuando el modal se abre o cuando cambian los landing_data del servicio
  useEffect(() => { 
    if (isOpen) {
      console.log('🔄 [EditarLandingData] Actualizando form desde servicio:', servicio?.landing_data);
      const landingData = servicio?.landing_data || {};
      setForm(landingData);
      // Si hay una imagen existente (base64), usarla como preview
      setPreview(landingData.imagen || '');
      setImagenFile(null); // Limpiar archivo nuevo al abrir
      // Limpiar URL temporal si existe
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, servicio?.landing_data]);

  // Función para manejar cambio de archivo desde FileUpload
  const handleImagenChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      // Si se limpia el archivo
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setImagenFile(null);
      setPreview(servicio?.landing_data?.imagen || '');
      setForm(f => ({ ...f, imagen: servicio?.landing_data?.imagen || '' }));
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, selecciona una imagen válida (JPG, PNG, GIF o WebP)');
      return;
    }

    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen no puede exceder 5MB');
      return;
    }

    setImagenFile(file);
    
    // Limpiar URL anterior si existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Crear preview temporal
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreview(url);
    
    // Convertir a base64 inmediatamente para tenerlo listo
    try {
      const base64 = await fileToBase64(file);
      setForm(f => ({ ...f, imagen: base64 }));
      console.log('✅ [EditarLandingData] Imagen convertida a base64 correctamente');
    } catch (error) {
      console.error('❌ [EditarLandingData] Error convirtiendo imagen a base64:', error);
      alert('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
      setImagenFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setPreview(servicio?.landing_data?.imagen || '');
    }
  };

  // Función para limpiar imagen nueva y restaurar original
  const handleRemoveImagen = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImagenFile(null);
    setPreview(servicio?.landing_data?.imagen || '');
    setForm(f => ({ ...f, imagen: servicio?.landing_data?.imagen || '' }));
  };

  // Función para guardar
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let imagenFinal = form.imagen;
      
      // Si hay un archivo nuevo, asegurarse de que esté convertido a base64
      if (imagenFile && imagenFile instanceof File) {
        try {
          imagenFinal = await fileToBase64(imagenFile);
          console.log('✅ [EditarLandingData] Imagen convertida a base64');
        } catch (error) {
          console.error('❌ [EditarLandingData] Error convirtiendo imagen:', error);
          alert('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
          setIsSaving(false);
          return;
        }
      }

      // Preparar datos finales
      const datosFinales = {
        ...form,
        imagen: imagenFinal || form.imagen
      };

      console.log('💾 [EditarLandingData] Guardando datos:', {
        titulo: datosFinales.titulo,
        resumen: datosFinales.resumen,
        tieneImagen: !!datosFinales.imagen,
        tipoImagen: datosFinales.imagen ? (datosFinales.imagen.startsWith('data:') ? 'base64' : 'url') : 'sin imagen'
      });

      await onSave(datosFinales);
    } catch (error) {
      console.error('❌ [EditarLandingData] Error al guardar:', error);
      alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-6 text-blue-800">Editar Datos para Landing Page</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Título *</label>
            <input 
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={form.titulo || ''} 
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Certificación de Marca"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Resumen</label>
            <textarea 
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              rows="4"
              value={form.resumen || ''} 
              onChange={e => setForm(f => ({ ...f, resumen: e.target.value }))}
              placeholder="Descripción breve del servicio..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Imagen</label>
            
            {/* Previsualización de imagen existente o nueva */}
            {preview && (
              <div className="mb-4 relative">
                <img 
                  src={preview} 
                  alt="Previsualización" 
                  className="w-full h-48 object-contain border-2 border-gray-200 rounded-xl mb-2 bg-gray-50"
                  onError={(e) => {
                    console.error('❌ [EditarLandingData] Error cargando imagen de preview');
                    e.target.style.display = 'none';
                  }}
                />
                {imagenFile ? (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    Nueva imagen
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    Imagen actual
                  </div>
                )}
              </div>
            )}

            {/* Componente FileUpload para seleccionar imagen */}
            <FileUpload
              name="imagen"
              value={imagenFile}
              onChange={handleImagenChange}
              label={imagenFile ? "Cambiar imagen seleccionada" : "Seleccionar nueva imagen"}
              accept="image/*"
              error={null}
            />

            {/* Botón para eliminar imagen nueva y restaurar original */}
            {imagenFile && servicio?.landing_data?.imagen && (
              <button
                type="button"
                onClick={handleRemoveImagen}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline flex items-center gap-1"
              >
                <span>↩</span> Restaurar imagen original
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving || !form.titulo}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}


function GestionarProcessStates({ servicio, isOpen, onClose, onSave }) {
  const [states, setStates] = useState(servicio?.process_states || []);
  const [nuevoNombre, setNuevoNombre] = useState('');
  
  // Actualizar states cuando el modal se abre o cuando cambian los process_states del servicio
  useEffect(() => { 
    if (isOpen) {
      console.log('🔄 [GestionarProcessStates] Actualizando states desde servicio:', servicio?.process_states);
      setStates(servicio?.process_states || []); 
    }
  }, [isOpen, servicio?.process_states]);

  const addState = () => {
    if (!nuevoNombre.trim()) return;
    const newState = {
      id: Date.now().toString(),
      name: nuevoNombre,
      order: states.length + 1,
      status_key: nuevoNombre.toLowerCase().replace(/\s+/g, '_'),
    };
    setStates([...states, newState]);
    setNuevoNombre('');
  };
  const removeState = (id) => setStates(states.filter(s => s.id !== id));
  const moveState = (idx, dir) => {
    const arr = [...states];
    if (dir === 'up' && idx > 0) {
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    } else if (dir === 'down' && idx < arr.length - 1) {
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
    }
    setStates(arr.map((s, i) => ({ ...s, order: i + 1 })));
  };
  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-yellow-800">Gestionar Estados del Proceso</h3>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Estados del Proceso (en orden):</h4>
          <ol className="ml-6 space-y-2">
            {states.map((s, idx) => (
              <li key={s.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-bold text-blue-700 mr-1">{idx + 1}.</span>
                <span className="font-medium text-gray-800 flex-1">{s.name}</span>
                {/* Icono 'i' con tooltip al hacer hover */}
                <div className="relative group ml-1 flex items-center">
                  <i className="bi bi-info-circle text-lg text-blue-600 hover:text-blue-900 cursor-pointer"/>
                  <div className="absolute left-1/2 -translate-x-1/2 top-7 z-20 hidden group-hover:block bg-white border border-blue-200 shadow-lg rounded px-4 py-2 text-sm text-gray-700 min-w-[220px] whitespace-pre-line">
                    Explicación del proceso: <b>{s.name}</b>.
                    <br />Aquí irá la descripción específica.
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => moveState(idx, 'up')} 
                    disabled={idx === 0} 
                    className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveState(idx, 'down')} 
                    disabled={idx === states.length - 1} 
                    className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button 
                    onClick={() => removeState(s.id)} 
                    className="text-xs px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300"
                    title="Eliminar estado"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {states.length === 0 && (
            <p className="text-gray-500 text-center py-4 italic">No hay estados configurados</p>
          )}
        </div>
        <div className="flex gap-2 mb-4">
          <input className="flex-1 border rounded p-2" placeholder="Nuevo estado" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
          <button onClick={addState} className="px-4 py-2 bg-green-600 text-white rounded">Añadir</button>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          <button onClick={() => onSave(states)} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
  ) : null;
}

export default function ModalEditarServicio({ servicio, isOpen, onClose, onSave }) {
  const [modal, setModal] = useState(null); // 'landing', 'process'
  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-blue-200">
        <h3 className="text-2xl font-bold mb-8 text-center text-blue-800">¿Qué deseas editar?</h3>
        <div className="flex flex-col gap-6">
          <button onClick={() => setModal('landing')} className="px-6 py-4 bg-blue-100 text-blue-800 rounded-xl font-semibold hover:bg-blue-200 shadow transition-all text-lg">Editar Datos para Landing Page</button>
          <button onClick={() => setModal('process')} className="px-6 py-4 bg-yellow-100 text-yellow-800 rounded-xl font-semibold hover:bg-yellow-200 shadow transition-all text-lg">Gestionar Estados del Proceso</button>
        </div>
        <EditarLandingData
          servicio={servicio}
          isOpen={modal === 'landing'}
          onClose={() => setModal(null)}
          onSave={data => { onSave('landing', data); setModal(null); }}
        />
        <GestionarProcessStates
          servicio={servicio}
          isOpen={modal === 'process'}
          onClose={() => setModal(null)}
          onSave={data => { onSave('process', data); setModal(null); }}
        />
        {modal === null && (
          <div className="flex justify-end gap-2 mt-8">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  ) : null;
} 