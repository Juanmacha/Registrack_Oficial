# 🔢 Guía de Filtrado Numérico en Inputs

## 📋 Descripción

Se ha implementado una funcionalidad que previene que se digiten letras en campos numéricos (como teléfono y número de documento) y que no se muestren en el input.

---

## 🛠️ Función Utilitaria

**Ubicación:** `src/shared/utils/numericInputFilter.js`

### Funciones Disponibles:

1. **`filterNumericInput(value, options)`** - Filtra solo números de una cadena
2. **`handleNumericChange(e, onChange, options)`** - Handler genérico para onChange
3. **`handlePhoneChange(e, onChange)`** - Handler específico para teléfonos (permite +, espacios, guiones, paréntesis)
4. **`handleDocumentNumberChange(e, onChange)`** - Handler específico para números de documento (solo números)
5. **`handleNumericPaste(e, options)`** - Handler para eventos onPaste que filtra al pegar

---

## ✅ Formularios Actualizados

### 1. Formulario de Registro (`src/features/auth/pages/register.jsx`)
- ✅ Campo `documentNumber` - Solo números
- ✅ Campo `phone` - Números, +, espacios, guiones, paréntesis

### 2. Perfil de Usuario (`src/features/auth/components/ProfileContent.jsx`)
- ✅ Campo `documentNumber` - Solo números
- ✅ Campo `phone` - Números, +, espacios, guiones, paréntesis

---

## 📝 Cómo Aplicar en Otros Formularios

### Paso 1: Importar las funciones

```javascript
import { 
  handleDocumentNumberChange, 
  handlePhoneChange, 
  handleNumericPaste 
} from "../../../shared/utils/numericInputFilter.js";
```

### Paso 2: Crear wrappers para los handlers

```javascript
// En tu componente
const handleInputChange = (e) => {
  // Tu lógica actual
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Wrappers para campos numéricos
const handleDocumentNumberChangeWrapper = (e) => {
  handleDocumentNumberChange(e, handleInputChange);
};

const handlePhoneChangeWrapper = (e) => {
  handlePhoneChange(e, handleInputChange);
};
```

### Paso 3: Aplicar en los inputs

#### Para Número de Documento:
```jsx
<input
  name="documentNumber"
  value={formData.documentNumber}
  onChange={handleDocumentNumberChangeWrapper}
  onPaste={(e) => handleNumericPaste(e, {})}
  // ... otros props
/>
```

#### Para Teléfono:
```jsx
<input
  name="phone"
  type="tel"
  value={formData.phone}
  onChange={handlePhoneChangeWrapper}
  onPaste={(e) => handleNumericPaste(e, { 
    allowPlus: true, 
    allowSpaces: true, 
    allowDashes: true, 
    allowParentheses: true 
  })}
  // ... otros props
/>
```

---

## 📌 Formularios que Necesitan Actualización

### Alta Prioridad:
- [ ] `src/features/dashboard/pages/gestionUsuarios/components/FormularioUsuario.jsx`
- [ ] `src/features/dashboard/pages/gestionClientes/components/FormularioCliente.jsx`
- [ ] `src/features/auth/pages/editProfile.jsx`

### Media Prioridad:
- [ ] `src/features/landing/components/ModalAgendarCita.jsx`
- [ ] `src/shared/components/formularioBusqueda.jsx`
- [ ] `src/shared/components/formularioAmpliacion.jsx`
- [ ] `src/shared/components/formularioRespuesta.jsx`
- [ ] `src/shared/components/formularioOposicion.jsx`
- [ ] `src/shared/components/formularioRenovacion.jsx`
- [ ] `src/shared/components/formularioCesiondeMarca.jsx`
- [ ] `src/features/landing/components/SolicitudCitaLanding.jsx`

---

## 🎯 Características

### Para Número de Documento:
- ✅ Solo permite números (0-9)
- ✅ Filtra letras en tiempo real
- ✅ Filtra al pegar (onPaste)
- ✅ No muestra caracteres no numéricos

### Para Teléfono:
- ✅ Permite números (0-9)
- ✅ Permite símbolo + (para números internacionales)
- ✅ Permite espacios, guiones y paréntesis (para formateo)
- ✅ Filtra caracteres no permitidos en tiempo real
- ✅ Filtra al pegar (onPaste)

---

## 🔍 Ejemplo Completo

```jsx
import { 
  handleDocumentNumberChange, 
  handlePhoneChange, 
  handleNumericPaste 
} from "../../../shared/utils/numericInputFilter.js";

const MiComponente = () => {
  const [formData, setFormData] = useState({
    documentNumber: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Wrappers para campos numéricos
  const handleDocumentNumberChangeWrapper = (e) => {
    handleDocumentNumberChange(e, handleInputChange);
  };

  const handlePhoneChangeWrapper = (e) => {
    handlePhoneChange(e, handleInputChange);
  };

  return (
    <>
      {/* Input de número de documento */}
      <input
        name="documentNumber"
        value={formData.documentNumber}
        onChange={handleDocumentNumberChangeWrapper}
        onPaste={(e) => handleNumericPaste(e, {})}
        placeholder="Número de documento"
      />

      {/* Input de teléfono */}
      <input
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handlePhoneChangeWrapper}
        onPaste={(e) => handleNumericPaste(e, { 
          allowPlus: true, 
          allowSpaces: true, 
          allowDashes: true, 
          allowParentheses: true 
        })}
        placeholder="Teléfono"
      />
    </>
  );
};
```

---

## ✅ Ventajas

1. **Mejor UX**: Los usuarios no pueden ingresar caracteres inválidos
2. **Validación en tiempo real**: Los caracteres no permitidos no aparecen
3. **Protección al pegar**: También filtra contenido pegado desde portapapeles
4. **Reutilizable**: Una sola función para todos los formularios
5. **Configurable**: Opciones flexibles según el tipo de campo

---

**Última actualización:** Enero 2026
