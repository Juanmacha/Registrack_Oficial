import React, { useEffect, useState } from "react";
import {
  BiArrowBack, BiHide, BiShow
} from "react-icons/bi";
import { useAuth } from "../../../shared/contexts/authContext";
import alertService from "../../../utils/alertService";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user: usuario, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(true);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      setFormData({ 
        ...usuario, 
        password: "", 
        confirmPassword: "",
        firstName: usuario.nombre || usuario.firstName || '',
        lastName: usuario.apellido || usuario.lastName || '',
        email: usuario.correo || usuario.email || '',
        documentType: usuario.tipo_documento || usuario.documentType || '',
        documentNumber: usuario.documento || usuario.documentNumber || ''
      });
    }
  }, [usuario]);

  const validate = (data = formData) => {
    const errs = {};
    if (!data.firstName?.trim()) errs.firstName = "Nombre requerido";
    if (!data.lastName?.trim()) errs.lastName = "Apellido requerido";
    if (!data.documentType?.trim()) errs.documentType = "Tipo requerido";
    if (!data.documentNumber?.trim()) errs.documentNumber = "Número requerido";
    if (data.password && data.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (data.password) {
      if (!data.confirmPassword) {
        errs.confirmPassword = "Confirma la contraseña";
      } else if (data.password !== data.confirmPassword) {
        errs.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setErrors(validate(updated));
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const updatedData = {
        nombre: formData.firstName,
        apellido: formData.lastName,
        correo: formData.email,
        telefono: formData.phone || formData.telefono,
        tipoDocumento: formData.documentType,
        documento: formData.documentNumber
      };

      // Solo incluir contraseña si se proporcionó
      if (formData.password && formData.password.trim()) {
        updatedData.contrasena = formData.password;
      }

      const result = await updateUser(updatedData);
      
      if (result.success) {
        await alertService.success(
          "¡Perfil actualizado!",
          "Tus datos se han guardado correctamente.",
          { confirmButtonText: "Entendido" }
        );
        navigate("/profile");
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
    }
  };

  if (!usuario) return <div className="h-screen flex justify-center items-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
        >
          <BiArrowBack />
        </button>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-red-500 text-white font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md">
            {usuario.firstName?.charAt(0)}{usuario.lastName?.charAt(0)}
          </div>
          <h1 className="text-white text-2xl font-semibold mt-2">Editar Perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white mt-6 p-8 rounded-lg shadow-md">
        {/* Sección 1: Información Personal */}
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información Personal</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium">Nombre *</label>
            <input
              type="text"
              name="firstName"
              placeholder="Ingresa tu nombre"
              className="w-full border rounded px-3 py-2"
              value={formData.firstName || ''}
              onChange={handleChange}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block font-medium">Apellido *</label>
            <input
              type="text"
              name="lastName"
              placeholder="Ingresa tu apellido"
              className="w-full border rounded px-3 py-2"
              value={formData.lastName || ''}
              onChange={handleChange}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Sección 2: Documentación */}
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Documentación</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium">Tipo de Documento *</label>
            <select
              name="documentType"
              className="w-full border rounded px-3 py-2"
              value={formData.documentType || ''}
              onChange={handleChange}
            >
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="PA">Pasaporte</option>
              <option value="PEP">Permiso Especial</option>
              <option value="NIT">NIT</option>
            </select>
            {errors.documentType && <p className="text-sm text-red-500">{errors.documentType}</p>}
          </div>
          <div>
            <label className="block font-medium">Número de Documento *</label>
            <input
              type="text"
              name="documentNumber"
              placeholder="Número de documento"
              className="w-full border rounded px-3 py-2"
              value={formData.documentNumber || ''}
              onChange={handleChange}
            />
            {errors.documentNumber && <p className="text-sm text-red-500">{errors.documentNumber}</p>}
          </div>
        </div>

        {/* Sección 3: Acceso */}
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información de Acceso</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium">Correo Electrónico *</label>
            <input  
              type="email"
              value={formData.email || ''}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Contraseña (opcional)</label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nueva contraseña"
                className="w-full border rounded px-3 py-2"
                value={formData.password || ''}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-600"
              >
                {showPassword ? <BiHide /> : <BiShow />}
              </button>
            </div>
            <small className="text-gray-500">Deja en blanco si no deseas cambiar la contraseña</small>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            {/* Campo de Confirmar Contraseña */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                className="w-full border rounded px-3 py-2"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                disabled={!formData.password}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <BiHide /> : <BiShow />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded border border-gray-400 hover:bg-gray-100"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;