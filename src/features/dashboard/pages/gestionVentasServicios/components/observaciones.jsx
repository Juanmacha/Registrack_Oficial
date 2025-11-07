import React, { useState, useEffect } from "react";
import { AlertService } from '../../../../../shared/styles/alertStandards.js';

const Observaciones = ({ isOpen, onClose, onGuardar }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitulo("");
      setDescripcion("");
    }
  }, [isOpen]);

  const handleGuardar = () => {
    // Validaciones según API: título ≤200 chars, descripción requerida
    if (!titulo.trim()) {
      AlertService.error("Título requerido", "Por favor, ingresa un título para el seguimiento.");
      return;
    }
    
    if (titulo.length > 200) {
      AlertService.error("Título muy largo", "El título no puede exceder 200 caracteres.");
      return;
    }

    if (!descripcion.trim()) {
      AlertService.error("Descripción requerida", "Por favor, escribe una descripción para el seguimiento.");
      return;
    }

    // Pasar objeto con título y descripción en lugar de solo texto
    onGuardar({ titulo: titulo.trim(), descripcion: descripcion.trim() });
    setTitulo("");
    setDescripcion("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <i className="bi bi-clipboard-check text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Agregar Seguimiento</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <i className="bi bi-x-lg text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Seguimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Ej: Revisión de documentos, Seguimiento de estado..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {titulo.length}/200 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="8"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Describe los avances, observaciones o comentarios sobre el seguimiento del proceso..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Guardar Seguimiento
          </button>
        </div>
      </div>
    </div>
  );
};

export default Observaciones;
