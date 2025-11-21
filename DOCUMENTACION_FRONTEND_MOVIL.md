# 📱 Documentación Frontend para Aplicación Móvil - Registrack

Este documento contiene toda la información del frontend web necesaria para implementar la aplicación móvil React Native.

---

## 📋 Índice

1. [Landing Page](#1-landing-page)
2. [Autenticación](#2-autenticación)
3. [Dashboard Administrativo](#3-dashboard-administrativo)
4. [Gestión de Solicitudes (Admin)](#4-gestión-de-solicitudes-admin)
5. [Mis Procesos (Cliente)](#5-mis-procesos-cliente)
6. [Perfil de Usuario](#6-perfil-de-usuario)
7. [Sistema de Alertas](#7-sistema-de-alertas)
8. [Diseño y Estilos](#8-diseño-y-estilos)

---

## 1. Landing Page

### 1.1 Estructura General

**Componente Principal**: `landing.jsx`

**Estructura**:
- **Navbar**: Navegación superior con logo, menú y botones de sesión
- **Hero**: Sección principal con servicios y formularios
- **Footer**: Información de contacto y enlaces

### 1.2 Navbar (`landingNavbar.jsx`)

**Funcionalidades**:
- Logo clickeable que redirige a "/"
- Menú de navegación con scroll suave:
  - Nosotros (scroll a sección)
  - Servicios (scroll a sección)
  - Contáctanos (scroll a footer)
  - Ayuda (ruta "/ayuda")
- Botones según estado de autenticación:
  - **Sin autenticar**: "Iniciar Sesión" y "Regístrate"
  - **Autenticado**: Avatar con menú desplegable:
    - Ver perfil
    - Cerrar sesión
- Menú hamburguesa para móviles

**Estilos Clave**:
```css
/* Clases activas */
text-blue-700 font-semibold border-b-2 border-blue-700

/* Clases inactivas */
text-gray-700 border-transparent hover:text-blue-700

/* Botones */
bg-blue-700 text-white rounded-md hover:bg-blue-800
bg-white text-blue-600 rounded-md hover:bg-blue-50
```

**Colores**:
- Azul primario: `#275FAA` / `#083874`
- Azul hover: `#3B82F6`
- Gris: `#6B7280`

### 1.3 Hero Section (`hero.jsx`)

**Funcionalidades**:
- Mostrar servicios disponibles
- Formularios dinámicos según tipo de servicio
- Modal para crear solicitud
- Integración con pasarela de pago

**Servicios Disponibles**:
1. Búsqueda de Antecedentes
2. Certificación de Marca
3. Renovación de Marca
4. Ampliación de Alcance
5. Cesión de Marca
6. Presentación de Oposición
7. Respuesta a Oposición

**Componentes Relacionados**:
- `ServiceModal.jsx`: Modal para seleccionar servicio
- `FormularioBusqueda.jsx`: Formulario de búsqueda
- `FormularioCertificacion.jsx`: Formulario de certificación
- `FormularioRenovacion.jsx`: Formulario de renovación
- `FormularioOposicion.jsx`: Formulario de oposición
- `FormularioCesion.jsx`: Formulario de cesión
- `FormularioAmpliacion.jsx`: Formulario de ampliación
- `FormularioRespuesta.jsx`: Formulario de respuesta

### 1.4 Footer (`footer.jsx`)

**Contenido**:
- Información de contacto
- Enlaces a redes sociales
- Información legal
- Copyright

---

## 2. Autenticación

### 2.1 Login (`login.jsx`)

**Estructura**:
- Formulario a la izquierda
- Video decorativo a la derecha (opcional en móvil)

**Campos**:
- **Email**: Validación de formato
- **Contraseña**: Campo oculto con opción mostrar/ocultar

**Validaciones**:
```javascript
// Email
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Campos requeridos
email && password
```

**Flujo**:
1. Usuario ingresa credenciales
2. Validación de campos
3. Sanitización de datos
4. Llamada a API: `POST /api/usuarios/login`
5. Almacenamiento de token en localStorage
6. Redirección según rol:
   - **Admin/Empleado**: `/admin/dashboard`
   - **Cliente**: `/` (landing)

**Estilos**:
```css
/* Input */
w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
focus:outline-none focus:ring-2 focus:ring-blue-500

/* Botón */
w-full bg-blue-600 text-white py-3 rounded-lg 
font-semibold hover:bg-blue-700
disabled:opacity-50 disabled:cursor-not-allowed

/* Error */
bg-red-50 border-red-200 text-red-600
```

**Manejo de Errores**:
- Credenciales incorrectas
- Rate limiting (demasiados intentos)
- Error de conexión
- Sesión expirada

### 2.2 Recuperar Contraseña (`forgotPassword.jsx`)

**Estructura**:
- Similar a login (formulario + video)

**Campos**:
- **Email**: Para recibir código de recuperación

**Flujo**:
1. Usuario ingresa email
2. Validación de formato
3. Llamada a API: `POST /api/usuarios/forgot-password`
4. Almacenar email en localStorage
5. Redirección a `/codigoRecuperacion`

**Mensajes**:
- Éxito: "Se ha enviado un código de recuperación a tu correo"
- Error: Mensaje específico según el tipo de error

### 2.3 Código de Recuperación (`codigoRecuperacion.jsx`)

**Campos**:
- **Código**: 6 dígitos enviados por email

**Flujo**:
1. Usuario ingresa código
2. Validación de código
3. Redirección a `/resetPassword` con token

### 2.4 Restablecer Contraseña (`resetPassword.jsx`)

**Campos**:
- **Nueva contraseña**: Con validación de fortaleza
- **Confirmar contraseña**: Debe coincidir

**Validaciones**:
- Mínimo 8 caracteres
- Incluir mayúsculas, minúsculas y números
- Las contraseñas deben coincidir

**Flujo**:
1. Usuario ingresa nueva contraseña
2. Validación de fortaleza
3. Validación de coincidencia
4. Llamada a API: `POST /api/usuarios/reset-password`
5. Redirección a `/login`

### 2.5 Kit de Implementación Móvil (Paso 1)

> Objetivo: portar login, registro y recuperación de contraseña a React Native replicando la experiencia visual e interacciones del frontend web.

#### 2.5.1 Arquitectura recomendada
- **Navegación**: stack con pantallas `Login`, `Register`, `ForgotPassword`, `CodigoRecuperacion`, `ResetPassword`.
- **Servicios**: módulo `authApiService` que encapsule `login`, `register`, `forgotPassword`, `resetPassword`, `logout`, `isAuthenticated`, `getCurrentUser`, `hasPermission`, etc., reutilizando `API_CONFIG`.
- **Almacenamiento**: `AsyncStorage` (o `expo-secure-store`) con las mismas claves usadas en web para compatibilidad (`authToken`, `token`, `currentUser`, `user`, `userData`, `isAuthenticated`).
- **Contexto**: `AuthContext` móvil que provea `login`, `logout`, `user`, `isAuthenticated`, `hasRole`, `hasPermission`.

#### 2.5.2 Payloads y endpoints
| Acción | Método / Endpoint | Payload | Respuesta esperada |
|---|---|---|---|
| Login | `POST /api/usuarios/login` | `{ correo, contrasena }` | `{ success, data.token, data.usuario }` |
| Registro | `POST /api/usuarios/registrar` | `{ tipo_documento, documento, nombre, apellido, correo, contrasena, telefono?, id_rol=3 }` | `{ success, usuario, mensaje }` |
| Forgot password | `POST /api/usuarios/forgot-password` | `{ correo }` | `{ success, mensaje }` |
| Reset password | `POST /api/usuarios/reset-password` | `{ token, newPassword }` | `{ success, mensaje }` |

Usa `API_CONFIG.BASE_URL` para producción (`https://api-registrack-2.onrender.com`) y proxy relativo `/api` en desarrollo.

#### 2.5.3 Flujo detallado
- **Login**: validar campos, sanitizar (`sanitizeLoginData` equivalente), llamar a `authApiService.login`, guardar token/usuario, determinar ruta siguiente según `tieneRolAdministrativo`. Manejar errores (credenciales, rate limit con minutos de espera, conexión).
- **Registro**: validar cada campo, fortaleza de contraseña (`validatePasswordStrength` y `getPasswordRequirementsShort`), aceptar política de privacidad, sanitizar (`sanitizeRegisterData`), enviar a registro y mostrar alertas de éxito/error.
- **ForgotPassword**: validar email, sanitizar (`sanitizeEmail`), invocar `authApiService.forgotPassword`, guardar `emailRecuperacion` y navegar a `CodigoRecuperacion`.
- **CodigoRecuperacion**: validar que sean 6 dígitos, confirmar con API (o mock temporal), guardar `resetToken` y navegar a `ResetPassword`.
- **ResetPassword**: validar presencia del token, requisitos de nueva contraseña, confirmar coincidencia, llamar a `authApiService.resetPassword`, limpiar `resetToken`/`emailRecuperacion` y redirigir a login tras alerta de éxito.

#### 2.5.4 Estilos a replicar
- **Tipografía y colores**: Azul primario `#275FAA` / `#083874`, hover `#3B82F6`, grises `#6B7280`, fondos claros `#F9FAFB`.
- **Inputs**: `w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`.
- **Botones primarios**: `w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`.
- **Botones secundarios**: `text-blue-500 hover:text-blue-700 font-medium transition-colors`.
- **Tarjetas/contenedores**: `bg-white rounded-lg shadow-lg p-8`.
- **Alertas**: Éxito (`bg-green-50 border-green-200 text-green-600`), Error (`bg-red-50 border-red-200 text-red-600`), Rate limit (`bg-yellow-50 border-yellow-200 text-yellow-800`).
- **Iconografía**: `react-native-vector-icons/MaterialCommunityIcons` o `@expo/vector-icons/Feather` para equivalentes de `BiEnvelope`, `BiLock`, `BiShow`, `BiHide`.

#### 2.5.5 Prompt sugerido (para IA o handoff)
```
Eres un desarrollador React Native que debe portar el flujo de autenticación de Registrack (Certimarcas) desde el frontend web existente. Implementa tres módulos: Login, Registro y Recuperación de contraseña (email + código + reset). Respeta la lógica actual:

1. Login:
   - Campos email/contraseña con validaciones y toggle de visibilidad.
   - Sanitiza entradas y llama a POST /api/usuarios/login (payload { correo, contrasena }).
   - Guarda token y usuario en AsyncStorage (claves: authToken, token, currentUser, user, userData, isAuthenticated).
   - Redirige a dashboard si el rol es administrativo (usa equivalente de `tieneRolAdministrativo`) o al home público si es cliente.
   - Maneja errores de rate limit mostrando tiempos de espera.

2. Registro:
   - Campos: nombre, apellido, tipo/número de documento, correo, teléfono opcional, contraseña y confirmación, checkbox de política.
   - Validaciones de formato y fortaleza (usa `validatePasswordStrength`/`getPasswordRequirementsShort`).
   - Sanitiza datos y llama a POST /api/usuarios/registrar con payload { tipo_documento, documento, nombre, apellido, correo, contrasena, telefono?, id_rol=3 }.
   - Muestra alertas de éxito y errores específicos.

3. Recuperación:
   - Pantalla 1: solicitar correo, validar y enviar a POST /api/usuarios/forgot-password ({ correo }). Guardar email en AsyncStorage.
   - Pantalla 2: código de 6 dígitos; validar, guardar `resetToken` y avanzar.
   - Pantalla 3: nueva contraseña + confirmación; validar requisitos y llamar a POST /api/usuarios/reset-password ({ token, newPassword }). Limpiar `resetToken`/`emailRecuperacion`.

Implementa un `authApiService` móvil con `axios` o `fetch` que replique la configuración (`API_CONFIG`, headers, manejo de errores con `manejarErrorAPI`/`obtenerMensajeErrorUsuario`). Usa componentes estilizados con los mismos colores, sombras y tipografías del frontend web (contenedores blancos, bordes redondeados, botones azul intenso, alertas de colores). Añade loaders, alerts modales y navegación con React Navigation. La app debe apuntar a `https://api-registrack-2.onrender.com` en producción y a `/api` en desarrollo (usa proxy o variable de entorno).
```

Esta sección sirve como guía autocontenida para el equipo móvil y puede reutilizarse como prompt base en herramientas de IA o documentación interna.

### 2.5 Registro (`register.jsx`)

**Campos**:
- Nombre
- Apellido
- Tipo de documento
- Número de documento
- Email
- Contraseña
- Confirmar contraseña
- Teléfono (opcional)

**Validaciones**:
- Todos los campos requeridos (excepto teléfono)
- Email válido
- Contraseña fuerte
- Contraseñas coinciden

**Flujo**:
1. Usuario completa formulario
2. Validación de campos
3. Llamada a API: `POST /api/usuarios/registrar`
4. Almacenamiento de token
5. Redirección según rol

---

## 3. Dashboard Administrativo

### 3.1 Estructura General (`dashboard.jsx`)

**Componentes**:
1. `GraficaIngresosPie.jsx`: Gráfica circular de ingresos
2. `GraficaResumenServicios.jsx`: Gráfica de resumen de servicios
3. `TablaMarcasCertificadas.jsx`: Tabla de marcas próximas a vencerse
4. `TablaServicios.jsx`: Tabla de servicios inactivos

### 3.2 Gráfica de Ingresos (`GraficaIngresosPie.jsx`)

**Funcionalidades**:
- Gráfica circular (pie chart) de ingresos por servicio
- Selector de período (3, 6, 12 meses)
- Tooltip con valores y porcentajes
- Descarga de Excel

**API Endpoint**:
```
GET /api/dashboard/ingresos?periodo=12meses
```

**Datos**:
```javascript
{
  labels: ["Servicio 1", "Servicio 2", ...],
  values: [1000, 2000, ...],
  colors: ["#3B82F6", "#10B981", ...]
}
```

**Colores por Servicio**:
- Búsqueda de Antecedentes: `#3B82F6` (Azul)
- Certificación: `#10B981` (Verde)
- Renovación: `#F59E0B` (Amarillo)
- Ampliación: `#8B5CF6` (Púrpura)
- Cesión: `#EF4444` (Rojo)
- Oposición: `#06B6D4` (Cian)
- Respuesta Oposición: `#F97316` (Naranja)

### 3.3 Gráfica de Resumen de Servicios (`GraficaResumenServicios.jsx`)

**Funcionalidades**:
- Gráfica de barras de servicios por tipo
- Distribución de estados por servicio
- Selector de período
- Descarga de Excel

**API Endpoint**:
```
GET /api/dashboard/servicios?periodo=12meses
```

**Datos**:
```javascript
{
  servicios: [
    {
      nombre: "Certificación de Marca",
      totalSolicitudes: 50,
      porcentajeUso: 25.5,
      estados: [
        { nombre: "En proceso", cantidad: 20, color: "#3B82F6" },
        { nombre: "Finalizado", cantidad: 30, color: "#10B981" }
      ]
    }
  ],
  totalServicios: 7,
  totalSolicitudes: 200
}
```

### 3.4 Tabla de Marcas Certificadas (`TablaMarcasCertificadas.jsx`)

**Funcionalidades**:
- Lista de marcas próximas a vencerse
- Filtros por fecha
- Información de vencimiento

### 3.5 Tabla de Servicios (`TablaServicios.jsx`)

**Funcionalidades**:
- Lista de servicios inactivos
- Filtros por estado
- Acciones de reactivación

---

## 4. Gestión de Solicitudes (Admin)

### 4.1 Listar Solicitudes (`tablaVentasProceso.jsx`)

**Funcionalidades**:
- Lista de todas las solicitudes en proceso
- Búsqueda por texto (expediente, cliente, marca, email)
- Filtros:
  - Por servicio
  - Por estado
- Paginación (5 por página)
- Acciones por solicitud:
  - Ver detalles
  - Editar
  - Anular
  - Asignar empleado
  - Descargar documentos
  - Ver seguimiento
  - Agregar seguimiento

**API Endpoint**:
```
GET /api/gestion-solicitudes
```

**Estructura de Datos**:
```javascript
{
  id_orden_servicio: 1,
  tipoSolicitud: "Certificación de Marca",
  estado: "En proceso",
  titular: "Juan Pérez",
  marca: "Mi Marca",
  email: "cliente@email.com",
  expediente: "EXP-001",
  encargado: "María García",
  fechaCreacion: "2024-01-15"
}
```

**Estilos de Badges de Estado**:
- Pendiente: `bg-yellow-100 text-yellow-800`
- En proceso: `bg-blue-100 text-blue-800`
- Finalizado: `bg-green-100 text-green-800`
- Anulado: `bg-red-100 text-red-800`

### 4.2 Crear Solicitud (`CrearSolicitud.jsx`)

**Funcionalidades**:
- Selector de tipo de servicio
- Formulario dinámico según servicio
- **Para Admin/Empleado**: Selector de cliente (OBLIGATORIO)
- Validación de campos
- Subida de archivos (PDF, JPG, PNG, máx 5MB)
- Conversión a base64

**Diferencias Cliente vs Admin**:
- **Cliente**: NO envía `id_cliente` (se usa del token)
- **Admin/Empleado**: DEBE enviar `id_cliente` (obligatorio)

**API Endpoint**:
```
POST /api/gestion-solicitudes/crear/:nombreServicio
```

**Campos Comunes**:
- Tipo de solicitante
- Tipo de persona
- Tipo de documento
- Número de documento
- Nombres
- Apellidos
- Email
- Teléfono
- Dirección
- Ciudad
- Código postal
- Información de marca
- Documentos adjuntos

### 4.3 Ver Detalles (`verDetalleVenta.jsx`)

**Información Mostrada**:
- Datos generales (orden, estado, fecha)
- Información del cliente
- Información del servicio
- Información de la marca
- Documentos adjuntos
- Historial de seguimiento
- Empleado asignado

**Acciones Disponibles**:
- Editar (si el estado lo permite)
- Anular (si el estado lo permite)
- Asignar/Reasignar empleado
- Agregar seguimiento
- Descargar documentos
- Programar cita

### 4.4 Editar Solicitud (`editarVenta.jsx`)

**Funcionalidades**:
- Cargar datos actuales
- Formulario prellenado
- Validación de campos
- Solo permite edición si el estado lo permite

**API Endpoint**:
```
PUT /api/gestion-solicitudes/editar/:id
```

### 4.5 Anular Solicitud

**Funcionalidades**:
- Modal de confirmación
- Campo de motivo (requerido)
- Validación del motivo

**API Endpoint**:
```
PUT /api/gestion-solicitudes/anular/:id
Body: { motivo: "string" }
```

### 4.6 Asignar Empleado

**Funcionalidades**:
- Modal con lista de empleados activos
- Búsqueda de empleados
- Mostrar empleado actualmente asignado
- Confirmación antes de asignar

**API Endpoint**:
```
PUT /api/gestion-solicitudes/asignar-empleado/:id
Body: { id_empleado: number }
```

**Response**:
```javascript
{
  success: true,
  mensaje: "Empleado asignado exitosamente",
  data: {
    solicitud_id: 1,
    empleado_asignado: {
      id_empleado: 2,
      nombre: "María García López",
      correo: "maria@email.com"
    },
    empleado_anterior: null
  }
}
```

### 4.7 Seguimiento (`seguimiento.jsx`)

**Funcionalidades**:
- Timeline visual del seguimiento
- Agregar nuevo seguimiento (solo admin/empleado)
- Cambiar estado desde seguimiento
- Descargar archivos de seguimiento

**API Endpoints**:
```
GET /api/seguimiento/cliente/:idOrdenServicio
POST /api/seguimiento/crear
GET /api/gestion-solicitudes/:id/estados-disponibles
```

**Estructura de Seguimiento**:
```javascript
{
  id_seguimiento: 1,
  titulo: "Cambio de estado",
  descripcion: "Descripción del seguimiento",
  observaciones: "Observaciones adicionales",
  nuevo_estado: "Verificación de Documentos",
  estado_anterior: "Solicitud Inicial",
  fecha: "2024-01-15T10:30:00",
  usuario: "María García",
  documentos_adjuntos: {}
}
```

---

## 5. Mis Procesos (Cliente)

### 5.1 Estructura General (`MisProcesos.jsx`)

**Vistas**:
1. **Procesos Activos**: Solicitudes en curso
2. **Historial**: Solicitudes finalizadas/anuladas

**Componentes**:
- `ProcesosActivos.jsx`: Lista de procesos activos
- `HistorialProcesos.jsx`: Lista de procesos finalizados
- `PagosPendientesCard.jsx`: Tarjeta de pagos pendientes

### 5.2 Procesos Activos (`ProcesosActivos.jsx`)

**Funcionalidades**:
- Lista de solicitudes en proceso
- Filtros:
  - Por servicio
  - Por estado
  - Búsqueda por texto (marca, expediente)
- Información mostrada:
  - Tipo de servicio
  - Estado (con badge)
  - Nombre de marca
  - Expediente
  - Fecha de creación
  - Empleado asignado (si tiene)
- Acciones:
  - Ver detalles
  - Ver seguimiento
  - Descargar documentos

**API Endpoint**:
```
GET /api/gestion-solicitudes/mias
```

### 5.3 Historial (`HistorialProcesos.jsx`)

**Funcionalidades**:
- Lista de solicitudes finalizadas/anuladas
- Mismos filtros que procesos activos
- Información adicional:
  - Fecha de finalización
  - Motivo de anulación (si aplica)

### 5.4 Pagos Pendientes (`PagosPendientesCard.jsx`)

**Funcionalidades**:
- Lista de pagos pendientes
- Información del pago:
  - Monto
  - Servicio
  - Fecha de vencimiento
- Acción: "Pagar ahora"

---

## 6. Perfil de Usuario

### 6.1 Ver Perfil (`profile.jsx`)

**Información Mostrada**:
- Nombre completo
- Email
- Documento
- Teléfono (si existe)
- Tipo de documento
- Rol
- Estado de cuenta

**Layout según Rol**:
- **Cliente**: Navbar de cliente
- **Admin/Empleado**: Sidebar de admin

### 6.2 Editar Perfil (`editProfile.jsx`)

**Campos Editables**:
- Nombre
- Apellido
- Teléfono
- Email (puede requerir verificación)

**Validaciones**:
- Email válido
- Teléfono válido (opcional)

**API Endpoint**:
```
PUT /api/usuarios/perfil
```

**Funcionalidades**:
- Guardar cambios
- Cambiar contraseña (pantalla separada)
- Cancelar edición

---

## 7. Sistema de Alertas

### 7.1 Configuración Base (`alertStandards.js`)

**Librería**: SweetAlert2

**Configuración**:
```javascript
{
  background: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.4)",
  customClass: {
    popup: "rounded-2xl shadow-2xl",
    title: "text-gray-800 font-bold text-2xl",
    content: "text-gray-600 text-base",
    confirmButton: "rounded-xl px-8 py-3 font-bold",
    cancelButton: "rounded-xl px-8 py-3 font-bold"
  },
  timer: 4000,
  timerProgressBar: true
}
```

### 7.2 Tipos de Alertas

**Success** (Verde):
- Icono: `success`
- Color: `#10b981`
- Timer: 3000ms

**Error** (Rojo):
- Icono: `error`
- Color: `#ef4444`
- Timer: 5000ms

**Warning** (Amarillo):
- Icono: `warning`
- Color: `#f59e0b`
- Timer: 4000ms

**Info** (Azul):
- Icono: `info`
- Color: `#3b82f6`
- Timer: 4000ms

**Question** (Confirmación):
- Icono: `question`
- Color: `#ef4444`
- Botones: Confirmar / Cancelar

### 7.3 Mensajes Estandarizados

**CRUD**:
- `createSuccess`: "El registro ha sido creado exitosamente."
- `updateSuccess`: "Los cambios han sido guardados exitosamente."
- `deleteSuccess`: "El registro ha sido eliminado exitosamente."
- `deleteConfirm`: "¿Está seguro de que desea eliminar este registro?"

**Autenticación**:
- `loginSuccess`: "Sesión iniciada correctamente. Bienvenido al sistema."
- `loginError`: "Credenciales incorrectas. Por favor, verifique su usuario y contraseña."
- `logoutSuccess`: "Sesión cerrada correctamente. Hasta luego."
- `sessionExpired`: "Su sesión ha expirado. Por favor, inicie sesión nuevamente."

**Validaciones**:
- `requiredFields`: "Por favor, complete todos los campos obligatorios."
- `invalidEmail`: "Por favor, ingrese una dirección de correo electrónico válida."
- `passwordMismatch`: "Las contraseñas no coinciden."

**Sistema**:
- `networkError`: "Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente."
- `serverError`: "Error del servidor. Por favor, intente más tarde."

### 7.4 Uso del Servicio

```javascript
import alertService from '../../../utils/alertService';

// Success
await alertService.success("Título", "Mensaje");

// Error
await alertService.error("Título", "Mensaje");

// Warning
await alertService.warning("Título", "Mensaje");

// Info
await alertService.info("Título", "Mensaje");

// Confirmación
const result = await alertService.confirm("Título", "Mensaje");
if (result.isConfirmed) {
  // Acción
}

// Loading
alertService.loading("Procesando...", "Por favor, espere...");
// Cerrar
alertService.closeLoading();
```

---

## 8. Diseño y Estilos

### 8.1 Colores Principales

**Primarios**:
- Azul oscuro: `#083874` / `#275FAA`
- Azul: `#3B82F6`
- Azul hover: `#2563EB`

**Secundarios**:
- Verde (éxito): `#10B981`
- Rojo (error): `#EF4444`
- Amarillo (advertencia): `#F59E0B`
- Gris: `#6B7280`

**Neutros**:
- Fondo: `#FFFFFF` / `#F9FAFB`
- Texto primario: `#111827`
- Texto secundario: `#6B7280`
- Borde: `#E5E7EB`

### 8.2 Tipografía

**Fuente**: Open Sans (o similar)

**Tamaños**:
- Título principal: `text-2xl` / `text-3xl` / `text-4xl`
- Subtítulo: `text-xl` / `text-2xl`
- Texto normal: `text-base` / `text-lg`
- Texto pequeño: `text-sm` / `text-xs`

**Pesos**:
- Normal: `font-normal`
- Semibold: `font-semibold`
- Bold: `font-bold`

### 8.3 Componentes Reutilizables

**Botones**:
```css
/* Primario */
bg-blue-600 text-white rounded-lg px-6 py-3 
font-semibold hover:bg-blue-700 transition

/* Secundario */
bg-white text-blue-600 rounded-lg px-6 py-3 
font-semibold border border-blue-600 hover:bg-blue-50

/* Peligro */
bg-red-600 text-white rounded-lg px-6 py-3 
font-semibold hover:bg-red-700
```

**Inputs**:
```css
w-full px-4 py-3 border border-gray-300 rounded-lg 
focus:outline-none focus:ring-2 focus:ring-blue-500 
focus:border-transparent
```

**Cards**:
```css
bg-white rounded-lg shadow-md p-6 border border-gray-200
```

**Badges**:
```css
/* Pendiente */
bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold

/* En proceso */
bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold

/* Finalizado */
bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold

/* Anulado */
bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold
```

### 8.4 Espaciado

**Padding**:
- Pequeño: `p-2` / `p-4`
- Mediano: `p-6` / `p-8`
- Grande: `p-12` / `p-16`

**Margin**:
- Pequeño: `m-2` / `m-4`
- Mediano: `m-6` / `m-8`
- Grande: `m-12` / `m-16`

**Gap**:
- `gap-2` / `gap-4` / `gap-6` / `gap-8`

### 8.5 Responsive

**Breakpoints** (Tailwind):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Ejemplo**:
```css
/* Móvil primero */
text-base md:text-lg lg:text-xl
flex-col md:flex-row
w-full md:w-1/2
```

### 8.6 Iconos

**Librería**: Bootstrap Icons / React Icons

**Iconos Comunes**:
- Usuario: `CgProfile` / `BiUser`
- Email: `BiEnvelope`
- Contraseña: `BiLock`
- Mostrar/Ocultar: `BiShow` / `BiHide`
- Editar: `BiEdit`
- Eliminar: `BiTrash`
- Ver: `BiEye`
- Descargar: `BiDownload`
- Calendario: `BiCalendar`
- Búsqueda: `BiSearch`

---

## 9. API Endpoints Principales

### 9.1 Autenticación
```
POST /api/usuarios/login
POST /api/usuarios/registrar
POST /api/usuarios/forgot-password
POST /api/usuarios/reset-password
PUT /api/usuarios/perfil
```

### 9.2 Solicitudes
```
GET /api/gestion-solicitudes (todas - admin)
GET /api/gestion-solicitudes/mias (solo del cliente)
GET /api/gestion-solicitudes/:id
POST /api/gestion-solicitudes/crear/:nombreServicio
PUT /api/gestion-solicitudes/editar/:id
PUT /api/gestion-solicitudes/anular/:id
PUT /api/gestion-solicitudes/asignar-empleado/:id
GET /api/gestion-solicitudes/:id/empleado-asignado
GET /api/gestion-solicitudes/:id/estados-disponibles
GET /api/gestion-solicitudes/:id/descargar-archivos
```

### 9.3 Seguimiento
```
GET /api/seguimiento/cliente/:idOrdenServicio
POST /api/seguimiento/crear
```

### 9.4 Dashboard
```
GET /api/dashboard/ingresos?periodo=12meses
GET /api/dashboard/servicios?periodo=12meses
GET /api/dashboard/resumen?periodo=12meses
GET /api/dashboard/pendientes
```

### 9.5 Empleados
```
GET /api/gestion-empleados
GET /api/gestion-empleados/:id
```

### 9.6 Clientes
```
GET /api/gestion-clientes
GET /api/gestion-clientes/:id
```

---

## 10. Consideraciones para React Native

### 10.1 Diferencias Clave

**Navegación**:
- Web: React Router DOM
- Móvil: React Navigation

**Almacenamiento**:
- Web: localStorage
- Móvil: AsyncStorage

**Alertas**:
- Web: SweetAlert2
- Móvil: React Native Alert / react-native-paper Snackbar

**Estilos**:
- Web: Tailwind CSS
- Móvil: StyleSheet / styled-components

**Iconos**:
- Web: Bootstrap Icons / React Icons
- Móvil: react-native-vector-icons

### 10.2 Adaptaciones Necesarias

1. **Formularios**: Usar componentes nativos (TextInput, Picker)
2. **Navegación**: Implementar Stack y Tab Navigation
3. **Gráficas**: Usar react-native-chart-kit
4. **Archivos**: Usar react-native-document-picker y react-native-fs
5. **Imágenes**: Usar Image de React Native
6. **Videos**: Usar react-native-video (si aplica)

### 10.3 Estructura de Carpetas Sugerida

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   └── ResetPasswordScreen.js
│   ├── landing/
│   │   └── LandingScreen.js
│   ├── dashboard/
│   │   ├── DashboardScreen.js
│   │   └── components/
│   ├── solicitudes/
│   │   ├── SolicitudesListScreen.js
│   │   ├── CreateSolicitudScreen.js
│   │   └── SolicitudDetailScreen.js
│   ├── procesos/
│   │   └── MisProcesosScreen.js
│   └── profile/
│       └── ProfileScreen.js
├── components/
│   ├── common/
│   ├── forms/
│   └── charts/
├── services/
│   ├── api/
│   └── auth/
├── navigation/
│   ├── AuthNavigator.js
│   └── MainNavigator.js
├── contexts/
│   └── AuthContext.js
└── utils/
    ├── alerts.js
    └── validations.js
```

---

## 11. Notas Finales

- **Autenticación**: Todos los endpoints requieren token en header `Authorization: Bearer <token>`
- **Roles**: Verificar rol del usuario para mostrar/ocultar funcionalidades
- **Validaciones**: Implementar validaciones tanto en frontend como confiar en backend
- **Manejo de Errores**: Siempre mostrar mensajes amigables al usuario
- **Loading States**: Mostrar indicadores de carga en todas las operaciones asíncronas
- **Offline**: Considerar caché local para datos críticos

---

**Última actualización**: Enero 2025

