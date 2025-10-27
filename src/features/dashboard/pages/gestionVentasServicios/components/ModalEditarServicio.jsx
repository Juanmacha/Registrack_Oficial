import React, { useState, useEffect } from 'react';

function EditarLandingData({ servicio, isOpen, onClose, onSave }) {
  const [form, setForm] = useState(servicio?.landing_data || {});
  const [preview, setPreview] = useState(servicio?.landing_data?.imagen || '');
  
  // Actualizar form y preview cuando el modal se abre o cuando cambian los landing_data del servicio
  useEffect(() => { 
    if (isOpen) {
      console.log('🔄 [EditarLandingData] Actualizando form desde servicio:', servicio?.landing_data);
      setForm(servicio?.landing_data || {});
      setPreview(servicio?.landing_data?.imagen || '');
    }
  }, [isOpen, servicio?.landing_data]);
  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-blue-800">Editar Datos para Landing Page</h3>
        <label className="block mb-2 text-sm">Título</label>
        <input className="w-full border rounded p-2 mb-3" value={form.titulo || ''} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
        <label className="block mb-2 text-sm">Resumen</label>
        <textarea className="w-full border rounded p-2 mb-3" value={form.resumen || ''} onChange={e => setForm(f => ({ ...f, resumen: e.target.value }))} />
        <label className="block mb-2 text-sm">Imagen</label>
        {preview && <img src={preview} alt="Previsualización" className="w-full h-32 object-contain mb-2 rounded" />}
        <input type="file" accept="image/*" className="mb-3" onChange={e => {
          const file = e.target.files[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            setForm(f => ({ ...f, imagen: url, imagenFile: file }));
          }
        }} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
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