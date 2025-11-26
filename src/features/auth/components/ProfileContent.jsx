import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiEditAlt, BiCheck, BiX, BiArrowBack } from "react-icons/bi";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee } from "../../../shared/utils/roleUtils";
import alertService from "../../../utils/alertService";
import { handleDocumentNumberChange, handlePhoneChange, handleNumericPaste } from "../../../shared/utils/numericInputFilter.js";

const ProfileContent = () => {
  const { user: usuario, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDocumentTypeOpen, setIsDocumentTypeOpen] = useState(false);
  const documentTypeRef = useRef(null);

  // Determinar el rol del usuario
  const userRole = usuario?.rol?.nombre || usuario?.role || usuario?.rol || 'cliente';
  const userRoleId = usuario?.rol?.id || usuario?.id_rol || usuario?.idRol;
  
  // Normalizar el nombre del rol para comparaciones
  const userRoleLower = (userRole || '').toLowerCase().trim();
  const isAdmin = userRoleId === 2 || userRoleId === '2' || userRoleLower === 'administrador' || userRoleLower === 'admin';
  const isEmployee = userRoleId === 3 || userRoleId === '3' || userRoleLower === 'empleado' || userRoleLower === 'employee';
  const isClient = userRoleId === 1 || userRoleId === '1' || userRoleLower === 'cliente' || userRoleLower === 'client';
  
  // Obtener el nombre del rol para mostrar (usar el nombre real del rol, no solo los estándar)
  const displayRole = userRole || 'Usuario';
  
  // Habilitar campo de teléfono para todos los usuarios
  const showPhone = true;

  // Inicializar datos del formulario cuando el usuario cambie
  useEffect(() => {
    if (usuario && !isEditing) {
      const fullName = usuario.name || `${usuario.nombre || usuario.firstName || ''} ${usuario.apellido || usuario.lastName || ''}`.trim() || 'Usuario';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const userData = {
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        email: usuario.correo || usuario.email || '',
        phone: usuario.telefono || usuario.phone || '',
        documentType: usuario.tipo_documento || usuario.documentType || '',
        documentNumber: usuario.documento || usuario.documentNumber || ''
      };
      
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [usuario, isEditing]);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (documentTypeRef.current && !documentTypeRef.current.contains(event.target)) {
        setIsDocumentTypeOpen(false);
      }
    };

    if (isDocumentTypeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDocumentTypeOpen]);

  const fullName = formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Usuario';
  const initials = fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);

  // Función de validación
  const validateForm = (data) => {
    const newErrors = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!data.documentType?.trim()) {
      newErrors.documentType = 'El tipo de documento es requerido';
    }

    if (!data.documentNumber?.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }

    if (!data.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Validar teléfono (opcional, pero si se proporciona debe tener formato válido)
    if (data.phone && data.phone.trim()) {
      if (!/^[0-9+\-\s()]+$/.test(data.phone.trim())) {
        newErrors.phone = 'El formato del teléfono no es válido';
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handler específico para campos numéricos (documentNumber)
  const handleDocumentNumberChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleInputChange);
  };

  // Handler específico para teléfono (permite +, espacios, guiones, paréntesis)
  const handlePhoneChangeWrapper = (e) => {
    handlePhoneChange(e, handleInputChange);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const documentTypeOptions = [
    { value: '', label: 'Tipo de documento' },
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'TI', label: 'Tarjeta de identidad' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'PA', label: 'Pasaporte' },
    { value: 'PEP', label: 'Permiso Especial' },
    { value: 'NIT', label: 'NIT' }
  ];

  const handleDocumentTypeSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      documentType: value
    }));
    setIsDocumentTypeOpen(false);
    // Limpiar error del campo
    if (errors.documentType) {
      setErrors(prev => ({
        ...prev,
        documentType: ''
      }));
    }
  };

  const getDocumentTypeLabel = () => {
    const option = documentTypeOptions.find(opt => opt.value === formData.documentType);
    return option ? option.label : 'Tipo de documento';
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
    setErrors({});
  };

  const handleSave = async () => {
    const newErrors = validateForm(formData);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = {
        nombre: formData.firstName,
        apellido: formData.lastName,
        correo: formData.email,
        tipoDocumento: formData.documentType,
        documento: formData.documentNumber
      };

      // Incluir teléfono si se proporciona
      if (formData.phone && formData.phone.trim()) {
        updatedData.telefono = formData.phone.trim();
      } else {
        // Si el campo está vacío, enviar null para limpiar el teléfono
        updatedData.telefono = null;
      }

      const result = await updateUser(updatedData);
      
      if (result.success) {
        // Salir del modo edición primero
        setIsEditing(false);
        setErrors({});
        
        // El contexto ya actualizó el usuario, esperar un momento para que se propague
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // El useEffect se encargará de actualizar los datos cuando el usuario cambie
        // Solo actualizamos originalData con los datos del formulario por ahora
        setOriginalData(formData);
        
        await alertService.success(
          "Perfil actualizado",
          "Tu perfil se ha actualizado correctamente.",
          { confirmButtonText: "Entendido" }
        );
      } else {
        await alertService.error(
          "Error",
          result.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
          { confirmButtonText: "Entendido" }
        );
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      await alertService.error(
        "Error",
        "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        { confirmButtonText: "Entendido" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se pudo cargar la información del usuario</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    // Para clientes, volver al landing principal, para admin/empleado, volver atrás en el historial
    if (isClient) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
      {/* Botón de volver atrás para clientes */}
      {isClient && (
        <div className="px-6 pt-4 pb-2">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <BiArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </button>
        </div>
      )}

      {/* Header con información del perfil */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full text-white font-bold text-xl flex items-center justify-center shadow-md ${
            isAdmin ? 'bg-red-600' : isEmployee ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">Mi Perfil</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin ? 'bg-red-100 text-red-800' : 
                isEmployee ? 'bg-green-100 text-green-800' : 
                isClient ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {isAdmin ? '👑 Administrador' : 
                 isEmployee ? '👨‍💼 Empleado' : 
                 isClient ? '👤 Cliente' : 
                 `👤 ${displayRole}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="p-6" style={{ overflow: 'visible' }}>
        {/* Sección de información personal */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <i className="bi bi-person text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
              <p className="text-sm text-gray-500">Datos de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-4" style={{ overflow: 'visible' }}>
            {/* Primera fila: Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-person text-gray-400 mr-2"></i>
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-all ${
                    isEditing
                      ? errors.firstName 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Ingresa tu nombre"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-person text-gray-400 mr-2"></i>
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-all ${
                    isEditing
                      ? errors.lastName 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Ingresa tu apellido"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Segunda fila: Tipo de Documento y Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={documentTypeRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-card-text text-gray-400 mr-2"></i>
                  Tipo de Documento <span className="text-red-500">*</span>
                </label>
                {!isEditing ? (
                  <div className="w-full px-2 py-1.5 text-sm border rounded-lg bg-gray-50 cursor-not-allowed border-gray-200">
                    {getDocumentTypeLabel()}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => isEditing && setIsDocumentTypeOpen(!isDocumentTypeOpen)}
                      disabled={!isEditing}
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg shadow-sm transition-all text-left flex items-center justify-between ${
                        errors.documentType 
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      } ${!isEditing ? 'bg-gray-50 cursor-not-allowed border-gray-200' : ''}`}
                    >
                      <span className={formData.documentType ? '' : 'text-gray-400'}>
                        {getDocumentTypeLabel()}
                      </span>
                      <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isDocumentTypeOpen ? 'rotate-180' : ''}`} style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                    </button>
                    {isDocumentTypeOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {documentTypeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleDocumentTypeSelect(option.value)}
                            className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                              formData.documentType === option.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                            } ${option.value === '' ? 'text-gray-400' : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {errors.documentType && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentType}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-123 text-gray-400 mr-2"></i>
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="documentNumber"
                  value={formData.documentNumber || ''}
                  onChange={handleDocumentNumberChangeWrapper}
                  onPaste={(e) => handleNumericPaste(e, {})}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-all ${
                    isEditing
                      ? errors.documentNumber 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Ingresa tu número de documento"
                />
                {errors.documentNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.documentNumber}</p>
                )}
              </div>
            </div>

            {/* Tercera fila: Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-envelope text-gray-400 mr-2"></i>
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-all ${
                    isEditing
                      ? errors.email 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Ingresa tu correo"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              {/* Campo de teléfono - ahora habilitado para todos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="bi bi-telephone text-gray-400 mr-2"></i>
                  Teléfono {showPhone && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handlePhoneChangeWrapper}
                  onPaste={(e) => handleNumericPaste(e, { allowPlus: true, allowSpaces: true, allowDashes: true, allowParentheses: true })}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-all ${
                    isEditing
                      ? errors.phone 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Ingresa tu teléfono (opcional)"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <BiEditAlt className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiX className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <BiCheck className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
