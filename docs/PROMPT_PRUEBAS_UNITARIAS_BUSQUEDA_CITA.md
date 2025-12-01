# 🧪 PROMPT: Pruebas Unitarias - Solicitud de Búsqueda y Cita

## Contexto del Proyecto

Este proyecto es un sistema de gestión de solicitudes y citas para Registrack. Necesitas crear un conjunto completo de pruebas unitarias para dos módulos principales:

1. **Solicitud de Búsqueda de Antecedentes**
2. **Gestión de Citas**

## 📋 Información del Proyecto

### Stack Tecnológico
- **Framework**: React con Vite
- **Testing**: Jest + React Testing Library (o el framework que estés usando)
- **Lenguaje**: JavaScript/TypeScript

### Estructura del Proyecto
```
src/
├── shared/
│   ├── components/
│   │   └── formularioBusqueda.jsx
│   └── utils/
│       └── validationService.js
├── features/
│   └── dashboard/
│       └── pages/
│           └── gestionCitas/
│               └── calendario.jsx
└── utils/
    └── validationService.js
```

---

## 🎯 MÓDULO 1: Solicitud de Búsqueda de Antecedentes

### Descripción
Formulario para crear solicitudes de búsqueda de antecedentes de marca. Incluye validaciones de campos requeridos, formatos y archivos.

### Campos del Formulario

#### Campos Requeridos (Obligatorios)
1. **tipoDocumento** (string)
   - Valores permitidos: "CC", "TI", "NIT", "Pasaporte", "CE"
   - No puede estar vacío

2. **numeroDocumento** (string)
   - Validación según tipo:
     - **CC**: Solo números, exactamente 10 dígitos
     - **TI**: 10-11 caracteres
     - **NIT**: Solo números, 9-15 dígitos
     - **Pasaporte**: Letras y números, 6-20 caracteres
     - **CE**: Validación básica (mínimo 5 caracteres)

3. **nombres** (string)
   - Mínimo 2 caracteres
   - No puede estar vacío
   - Se concatena con apellidos para enviar como `nombres_apellidos` al backend

4. **apellidos** (string)
   - Mínimo 2 caracteres
   - No puede estar vacío

5. **email** (string)
   - Formato válido de email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Se mapea a `correo` en el backend
   - No puede estar vacío

6. **telefono** (string)
   - Formato: `/^[\d\s\-\+\(\)]+$/`
   - Mínimo 7 dígitos (después de remover caracteres no numéricos)
   - Máximo 15 dígitos
   - No puede estar vacío

7. **direccion** (string)
   - No puede estar vacío
   - Mínimo 5 caracteres

8. **pais** (string)
   - No puede estar vacío

9. **nombreMarca** (string)
   - Se mapea a `nombre_a_buscar` en el backend
   - No puede estar vacío
   - Mínimo 2 caracteres

10. **tipoProductoServicio** (string)
    - Se mapea a `tipo_producto_servicio` en el backend
    - Puede ser seleccionado de una lista predefinida o texto libre
    - No puede estar vacío

11. **logotipoMarca** (File)
    - Archivo requerido
    - Formatos permitidos: PDF, JPG, PNG
    - Tamaño máximo: 5MB
    - Se convierte a base64 con prefijo `data:image/png;base64,` o `data:application/pdf;base64,`

#### Campos Opcionales
- **ciudad** (string) - Default: "Bogotá"
- **codigoPostal** (string) - Default: "110111"
- **claseNiza** (string)
- **clases** (array) - Array de objetos `{ numero: string, descripcion: string }`

### Validaciones Específicas

#### Validación de Email
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  error = 'Correo inválido';
}
```

#### Validación de Teléfono
```javascript
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
const soloNumeros = telefono.replace(/\D/g, '');
if (!phoneRegex.test(telefono) || soloNumeros.length < 7 || soloNumeros.length > 15) {
  error = 'Teléfono inválido';
}
```

#### Validación de Documento por Tipo
```javascript
// CC: 10 dígitos numéricos
if (tipoDocumento === 'CC' && !/^\d{10}$/.test(numeroDocumento)) {
  error = 'Cédula: debe tener exactamente 10 dígitos';
}

// NIT: 9-15 dígitos numéricos
if (tipoDocumento === 'NIT' && !/^\d{9,15}$/.test(numeroDocumento)) {
  error = 'NIT: solo números, 9-15 dígitos';
}

// Pasaporte: 6-20 caracteres alfanuméricos
if (tipoDocumento === 'Pasaporte' && !/^[A-Za-z0-9]{6,20}$/.test(numeroDocumento)) {
  error = 'Pasaporte: solo letras y números, 6-20 caracteres';
}
```

#### Validación de Archivo
```javascript
// Tamaño máximo: 5MB
if (archivo.size > 5 * 1024 * 1024) {
  error = 'El archivo excede el tamaño máximo de 5MB';
}

// Formatos permitidos
const formatosPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
if (!formatosPermitidos.includes(archivo.type)) {
  error = 'Formato no permitido. Use PDF, JPG o PNG';
}
```

### Transformación de Datos para API

Los datos del formulario se transforman antes de enviar al backend:

```javascript
{
  nombres_apellidos: `${nombres} ${apellidos}`.trim(),
  tipo_documento: tipoDocumento,
  numero_documento: numeroDocumento,
  correo: email,
  telefono: telefono,
  direccion: direccion,
  pais: pais,
  ciudad: ciudad || 'Bogotá',
  codigo_postal: codigoPostal || '110111',
  nombre_a_buscar: nombreMarca,
  tipo_producto_servicio: tipoProductoServicio,
  logotipo: archivoBase64, // "data:image/png;base64,..."
  clase_niza: claseNiza || null
}
```

---

## 🎯 MÓDULO 2: Gestión de Citas

### Descripción
Sistema de gestión de citas con validaciones de horarios, fechas y cruces de citas existentes.

### Campos del Formulario

#### Campos Requeridos (Obligatorios)

**Para Crear Cita Nueva:**
1. **nombre** (string)
   - No puede estar vacío
   - Mínimo 2 caracteres

2. **apellido** (string)
   - No puede estar vacío
   - Mínimo 2 caracteres

3. **cedula** (string) - O **tipoDocumento** + **numeroDocumento**
   - Si se usa `cedula`: debe tener exactamente 10 dígitos numéricos
   - Si se usa `tipoDocumento` + `numeroDocumento`: validación según tipo

4. **tipoDocumento** (string) - Si no se usa `cedula`
   - Valores: "CC", "TI", "NIT", "Pasaporte", "CE"

5. **telefono** (string)
   - Formato: `/^[\d\s\-\+\(\)]+$/`
   - Mínimo 7 dígitos
   - Máximo 15 dígitos

6. **tipoCita** (string)
   - Valores permitidos: "General", "Busqueda", "Ampliacion", "Certificacion", "Renovacion", "Cesion", "Oposicion", "Respuesta de oposicion"
   - No puede estar vacío

7. **fecha** (Date/string)
   - Formato: "YYYY-MM-DD" o ISO string
   - **NO puede ser una fecha pasada**
   - Debe ser una fecha válida

8. **horaInicio** (string)
   - Formato: "HH:MM" o "HH:MM:SS"
   - **Rango permitido: 07:00 - 18:00**
   - No puede estar vacío

9. **horaFin** (string)
   - Formato: "HH:MM" o "HH:MM:SS"
   - **Debe ser posterior a horaInicio**
   - **Rango permitido: 07:00 - 18:00**
   - No puede estar vacío

10. **asesor** (string) - ID o nombre del empleado
    - No puede estar vacío
    - Debe existir en la lista de empleados activos

**Para Reprogramar Cita:**
- Solo se requieren: **fecha**, **horaInicio**, **horaFin**
- **asesor** es opcional (solo si se cambia el empleado)

#### Campos Opcionales
- **detalle** (string) - Observaciones adicionales
- **id_cliente** (number) - Si el cliente ya existe en el sistema

### Validaciones Específicas

#### Validación de Fecha
```javascript
const fecha = new Date(fechaInput);
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

if (fecha < hoy) {
  error = 'La fecha no puede ser pasada';
}
```

#### Validación de Horario
```javascript
// Rango permitido: 07:00 - 18:00
const [horas, minutos] = horaInicio.split(':').map(Number);
if (horas < 7 || horas > 18 || (horas === 18 && minutos > 0)) {
  error = 'La hora debe estar entre 07:00 y 18:00';
}

// horaFin debe ser posterior a horaInicio
const inicio = new Date(`2000-01-01T${horaInicio}`);
const fin = new Date(`2000-01-01T${horaFin}`);
if (inicio >= fin) {
  error = 'La hora de fin debe ser posterior a la hora de inicio';
}
```

#### Validación de Cruce de Horarios
```javascript
// Verificar que no haya cruce con otras citas del mismo día y asesor
const cruza = citasExistentes.some(cita => {
  if (cita.id === citaActual.id) return false; // Excluir la cita actual si se está editando
  if (cita.fecha !== fecha) return false; // Mismo día
  if (cita.asesor !== asesor) return false; // Mismo asesor
  
  const inicioExistente = cita.horaInicio;
  const finExistente = cita.horaFin;
  
  // Verificar cruce: (horaInicio < finExistente && horaFin > inicioExistente)
  return (horaInicio < finExistente && horaFin > inicioExistente);
});

if (cruza) {
  error = 'Ya existe una cita en ese rango de horas';
}
```

#### Validación de Documento (Cédula)
```javascript
if (cedula && !/^\d{10}$/.test(cedula)) {
  error = 'El número de cédula debe tener exactamente 10 dígitos';
}
```

### Transformación de Datos para API

**Crear Cita:**
```javascript
{
  nombre: nombre,
  apellido: apellido,
  cedula: cedula || numeroDocumento,
  tipo_documento: tipoDocumento || 'CC',
  telefono: telefono,
  tipo: tipoCita,
  fecha: fecha, // "YYYY-MM-DD"
  hora_inicio: horaInicio.includes(':') && horaInicio.split(':').length === 2 
    ? horaInicio + ':00' 
    : horaInicio,
  hora_fin: horaFin.includes(':') && horaFin.split(':').length === 2 
    ? horaFin + ':00' 
    : horaFin,
  modalidad: "Presencial",
  id_cliente: id_cliente || null,
  id_empleado: id_empleado,
  observacion: detalle || null
}
```

**Reprogramar Cita:**
```javascript
{
  fecha: fecha,
  hora_inicio: horaInicio + ':00',
  hora_fin: horaFin + ':00',
  observacion: detalle || null,
  id_empleado: id_empleado || null // Opcional, solo si se cambia
}
```

---

## 🧪 CASOS DE PRUEBA REQUERIDOS

### MÓDULO 1: Solicitud de Búsqueda

#### 1. Validaciones de Campos Requeridos
- [ ] Debe validar que `tipoDocumento` es requerido
- [ ] Debe validar que `numeroDocumento` es requerido
- [ ] Debe validar que `nombres` es requerido
- [ ] Debe validar que `apellidos` es requerido
- [ ] Debe validar que `email` es requerido
- [ ] Debe validar que `telefono` es requerido
- [ ] Debe validar que `direccion` es requerido
- [ ] Debe validar que `pais` es requerido
- [ ] Debe validar que `nombreMarca` es requerido
- [ ] Debe validar que `tipoProductoServicio` es requerido
- [ ] Debe validar que `logotipoMarca` es requerido

#### 2. Validaciones de Formato de Email
- [ ] Debe aceptar email válido: `usuario@dominio.com`
- [ ] Debe rechazar email sin @: `usuariodominio.com`
- [ ] Debe rechazar email sin dominio: `usuario@`
- [ ] Debe rechazar email sin extensión: `usuario@dominio`
- [ ] Debe rechazar email vacío

#### 3. Validaciones de Formato de Teléfono
- [ ] Debe aceptar teléfono con 7 dígitos: `1234567`
- [ ] Debe aceptar teléfono con formato: `+57 300 123 4567`
- [ ] Debe aceptar teléfono con guiones: `300-123-4567`
- [ ] Debe rechazar teléfono con menos de 7 dígitos: `123456`
- [ ] Debe rechazar teléfono con más de 15 dígitos
- [ ] Debe rechazar teléfono vacío

#### 4. Validaciones de Documento por Tipo
- [ ] Debe validar CC con exactamente 10 dígitos: `1234567890` ✅
- [ ] Debe rechazar CC con menos de 10 dígitos: `123456789` ❌
- [ ] Debe rechazar CC con más de 10 dígitos: `12345678901` ❌
- [ ] Debe rechazar CC con letras: `123456789a` ❌
- [ ] Debe validar NIT con 9-15 dígitos: `123456789` ✅
- [ ] Debe rechazar NIT con menos de 9 dígitos: `12345678` ❌
- [ ] Debe validar Pasaporte con 6-20 caracteres alfanuméricos: `AB123456` ✅
- [ ] Debe rechazar Pasaporte con menos de 6 caracteres: `AB123` ❌
- [ ] Debe rechazar Pasaporte con caracteres especiales: `AB-123` ❌

#### 5. Validaciones de Archivo (Logotipo)
- [ ] Debe aceptar archivo JPG menor a 5MB
- [ ] Debe aceptar archivo PNG menor a 5MB
- [ ] Debe aceptar archivo PDF menor a 5MB
- [ ] Debe rechazar archivo mayor a 5MB
- [ ] Debe rechazar archivo con formato no permitido (ej: .docx)
- [ ] Debe rechazar cuando no se selecciona archivo

#### 6. Validaciones de Longitud Mínima
- [ ] Debe validar que `nombres` tiene mínimo 2 caracteres
- [ ] Debe validar que `apellidos` tiene mínimo 2 caracteres
- [ ] Debe validar que `direccion` tiene mínimo 5 caracteres
- [ ] Debe validar que `nombreMarca` tiene mínimo 2 caracteres

#### 7. Transformación de Datos
- [ ] Debe concatenar `nombres` y `apellidos` como `nombres_apellidos`
- [ ] Debe mapear `email` a `correo`
- [ ] Debe mapear `nombreMarca` a `nombre_a_buscar`
- [ ] Debe mapear `tipoProductoServicio` a `tipo_producto_servicio`
- [ ] Debe convertir archivo a base64 con prefijo `data:image/png;base64,`
- [ ] Debe incluir valores por defecto para `ciudad` y `codigoPostal` si están vacíos

#### 8. Casos de Éxito
- [ ] Debe crear solicitud con todos los campos válidos
- [ ] Debe permitir campos opcionales vacíos
- [ ] Debe limpiar el formulario después de guardar exitosamente

#### 9. Casos de Error
- [ ] Debe mostrar todos los errores de campos requeridos
- [ ] Debe mostrar error de formato sin ocultar error de requerido
- [ ] Debe mantener errores visibles hasta que se corrijan

---

### MÓDULO 2: Gestión de Citas

#### 1. Validaciones de Campos Requeridos (Crear)
- [ ] Debe validar que `nombre` es requerido
- [ ] Debe validar que `apellido` es requerido
- [ ] Debe validar que `cedula` o (`tipoDocumento` + `numeroDocumento`) es requerido
- [ ] Debe validar que `telefono` es requerido
- [ ] Debe validar que `tipoCita` es requerido
- [ ] Debe validar que `fecha` es requerido
- [ ] Debe validar que `horaInicio` es requerido
- [ ] Debe validar que `horaFin` es requerido
- [ ] Debe validar que `asesor` es requerido

#### 2. Validaciones de Campos Requeridos (Reprogramar)
- [ ] Debe validar que `fecha` es requerido
- [ ] Debe validar que `horaInicio` es requerido
- [ ] Debe validar que `horaFin` es requerido
- [ ] Debe permitir que `asesor` sea opcional

#### 3. Validaciones de Fecha
- [ ] Debe aceptar fecha de hoy
- [ ] Debe aceptar fecha futura
- [ ] Debe rechazar fecha pasada
- [ ] Debe validar formato de fecha válido

#### 4. Validaciones de Horario
- [ ] Debe aceptar hora inicio en rango 07:00 - 18:00
- [ ] Debe rechazar hora inicio antes de 07:00: `06:59` ❌
- [ ] Debe rechazar hora inicio después de 18:00: `18:01` ❌
- [ ] Debe aceptar hora fin en rango 07:00 - 18:00
- [ ] Debe validar que `horaFin` es posterior a `horaInicio`
- [ ] Debe rechazar cuando `horaFin` es igual a `horaInicio`
- [ ] Debe rechazar cuando `horaFin` es anterior a `horaInicio`

#### 5. Validaciones de Cruce de Horarios
- [ ] Debe rechazar cita que cruza con otra cita del mismo día y asesor
- [ ] Debe aceptar cita que no cruza con otras citas
- [ ] Debe permitir reprogramar cita excluyendo la cita actual del cruce
- [ ] Debe permitir citas del mismo día con diferentes asesores
- [ ] Debe permitir citas del mismo asesor en diferentes días

#### 6. Validaciones de Documento
- [ ] Debe validar cédula con exactamente 10 dígitos: `1234567890` ✅
- [ ] Debe rechazar cédula con menos de 10 dígitos: `123456789` ❌
- [ ] Debe rechazar cédula con letras: `123456789a` ❌
- [ ] Debe validar documento según tipo cuando se usa `tipoDocumento`

#### 7. Validaciones de Teléfono
- [ ] Debe aceptar teléfono con 7 dígitos mínimo
- [ ] Debe rechazar teléfono con menos de 7 dígitos
- [ ] Debe rechazar teléfono con más de 15 dígitos

#### 8. Validaciones de Tipo de Cita
- [ ] Debe aceptar tipo válido: "General", "Busqueda", etc.
- [ ] Debe rechazar tipo vacío
- [ ] Debe rechazar tipo no válido

#### 9. Transformación de Datos (Crear)
- [ ] Debe formatear `horaInicio` a "HH:MM:SS" si viene como "HH:MM"
- [ ] Debe formatear `horaFin` a "HH:MM:SS" si viene como "HH:MM"
- [ ] Debe incluir `modalidad: "Presencial"` por defecto
- [ ] Debe mapear `tipoCita` a `tipo`
- [ ] Debe mapear `detalle` a `observacion` (opcional)

#### 10. Transformación de Datos (Reprogramar)
- [ ] Debe incluir solo `fecha`, `hora_inicio`, `hora_fin`
- [ ] Debe incluir `observacion` solo si tiene valor
- [ ] Debe incluir `id_empleado` solo si se cambia el asesor

#### 11. Casos de Éxito
- [ ] Debe crear cita con todos los campos válidos
- [ ] Debe reprogramar cita con fecha y horario válidos
- [ ] Debe permitir campos opcionales vacíos
- [ ] Debe limpiar el formulario después de guardar exitosamente

#### 12. Casos de Error
- [ ] Debe mostrar todos los errores de campos requeridos
- [ ] Debe mostrar error de fecha pasada
- [ ] Debe mostrar error de horario fuera de rango
- [ ] Debe mostrar error de cruce de horarios
- [ ] Debe mantener errores visibles hasta que se corrijan

---

## 📝 ESTRUCTURA DE PRUEBAS SUGERIDA

### Archivos de Prueba

```
src/
├── __tests__/
│   ├── solicitudBusqueda/
│   │   ├── validaciones.test.js
│   │   ├── transformacion.test.js
│   │   └── formulario.test.jsx
│   └── citas/
│       ├── validaciones.test.js
│       ├── transformacion.test.js
│       ├── cruceHorarios.test.js
│       └── formulario.test.jsx
```

### Ejemplo de Estructura de Prueba

```javascript
describe('Validaciones - Solicitud de Búsqueda', () => {
  describe('Campos Requeridos', () => {
    it('debe validar que tipoDocumento es requerido', () => {
      // Arrange
      const formData = { /* sin tipoDocumento */ };
      
      // Act
      const errors = validarFormularioBusqueda(formData);
      
      // Assert
      expect(errors.tipoDocumento).toBeDefined();
      expect(errors.tipoDocumento).toContain('requerido');
    });
    
    // ... más pruebas
  });
  
  describe('Validación de Email', () => {
    it('debe aceptar email válido', () => {
      // Arrange
      const email = 'usuario@dominio.com';
      
      // Act
      const isValid = validarEmail(email);
      
      // Assert
      expect(isValid).toBe(true);
    });
    
    // ... más pruebas
  });
  
  // ... más describe blocks
});
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Cobertura Mínima
- **Cobertura de código**: Mínimo 80%
- **Cobertura de ramas**: Mínimo 75%
- **Todas las validaciones deben tener al menos 1 prueba**

### Calidad de Pruebas
- Cada prueba debe ser independiente
- Cada prueba debe tener un propósito claro (Arrange-Act-Assert)
- Los nombres de las pruebas deben ser descriptivos
- Debe incluir casos límite (edge cases)
- Debe incluir casos de éxito y error

### Documentación
- Cada archivo de prueba debe tener comentarios explicativos
- Los casos de prueba complejos deben tener descripción detallada
- Debe documentar los mocks y fixtures utilizados

---

## 🔧 HERRAMIENTAS Y CONFIGURACIÓN

### Dependencias Necesarias
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### Configuración de Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/main.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 📚 REFERENCIAS

### Archivos de Código Fuente
- `src/shared/components/formularioBusqueda.jsx` - Componente de formulario de búsqueda
- `src/features/dashboard/pages/gestionCitas/calendario.jsx` - Componente de gestión de citas
- `src/utils/validationService.js` - Servicio de validaciones
- `RESPUESTAS_SOLICITUDES_COMPLETAS.md` - Documentación completa de la API

### Validaciones Específicas
- Email: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Teléfono: Regex `/^[\d\s\-\+\(\)]+$/` con 7-15 dígitos
- CC: 10 dígitos numéricos
- NIT: 9-15 dígitos numéricos
- Pasaporte: 6-20 caracteres alfanuméricos
- Archivos: Máximo 5MB, formatos PDF, JPG, PNG
- Horarios: 07:00 - 18:00

---

## 🎯 INSTRUCCIONES FINALES

1. **Crea las pruebas unitarias** siguiendo la estructura sugerida
2. **Implementa todos los casos de prueba** listados en este documento
3. **Asegura cobertura mínima** del 80% en código y 75% en ramas
4. **Documenta** cualquier caso especial o decisión de diseño
5. **Ejecuta las pruebas** y verifica que todas pasen
6. **Genera reporte de cobertura** y adjúntalo

**Nota**: Si encuentras discrepancias entre este documento y el código fuente, prioriza el código fuente y documenta la diferencia.

---

**Fecha de creación**: Enero 2025
**Versión**: 1.0
**Autor**: Sistema de Documentación Registrack

