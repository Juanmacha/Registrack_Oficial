import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiEditAlt, BiCheck, BiX, BiArrowBack } from "react-icons/bi";
import { useAuth } from "../../../shared/contexts/authContext";
import { isAdminOrEmployee } from "../../../shared/utils/roleUtils";
import alertService from "../../../utils/alertService";

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
    phone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
        phone: usuario.telefono || usuario.phone || ''
      };
      
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [usuario, isEditing]);

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

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
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
        correo: formData.email
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
      <div className="p-6">
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

          <div className="space-y-4">
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

            {/* Segunda fila: Email y Teléfono */}
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
                  onChange={handleInputChange}
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
