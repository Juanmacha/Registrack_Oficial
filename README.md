# 🚀 Registrack Frontend

Aplicación web moderna para la gestión integral de servicios de registro de marcas, propiedad intelectual y procesos legales. Sistema completo con roles diferenciados, formularios dinámicos, sistema de pagos, notificaciones automáticas y seguimiento de procesos.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Módulos Principales](#-módulos-principales)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)

---

## 🎯 Descripción

**Registrack** es una plataforma web completa diseñada para gestionar servicios legales relacionados con propiedad intelectual, especialmente registro de marcas. El sistema permite a clientes crear solicitudes de servicios, realizar pagos, y hacer seguimiento de sus procesos, mientras que administradores y empleados gestionan toda la operación desde un dashboard administrativo completo.

### Funcionalidades Clave

- ✅ **Sistema de autenticación** con JWT y recuperación de contraseña
- ✅ **Gestión de roles y permisos granular** (administrador, empleado, cliente)
- ✅ **Formularios dinámicos** configurados por servicio
- ✅ **Sistema de pagos** con procesamiento automático y activación de solicitudes
- ✅ **Dashboard administrativo** con métricas y reportes
- ✅ **Gestión completa de citas** con calendario interactivo
- ✅ **Seguimiento de procesos** con historial completo
- ✅ **Notificaciones automáticas** por email
- ✅ **Exportación de reportes** en Excel y PDF
- ✅ **Interfaz responsive** y moderna

---

## ✨ Características Principales

### 🔐 Autenticación y Autorización

- Login y registro de usuarios
- Recuperación de contraseña con código de verificación
- Sistema de permisos granular basado en módulos y acciones
- Protección de rutas por rol (admin, empleado, cliente)
- Gestión de sesiones con JWT

### 💼 Gestión de Servicios

Soporte para 7 tipos de servicios:

1. **Búsqueda de Antecedentes** (logo opcional)
2. **Registro de Marca**
3. **Certificación de Marca**
4. **Renovación de Marca**
5. **Ampliación de Cobertura**
6. **Cesión de Marca**
7. **Oposición y Respuesta de Oposición**

Cada servicio tiene:
- Formularios dinámicos configurados desde el backend
- Validación de campos específicos
- Procesos y estados personalizados
- Precios configurables

### 💳 Sistema de Pagos

- Procesamiento automático de pagos (mock para desarrollo)
- Monto automático desde el precio del servicio
- Activación automática de solicitudes al procesar pago
- Comprobantes PDF descargables
- Historial completo de pagos
- Reportes en Excel

### 📊 Dashboard Administrativo

- **Ingresos**: Gráficas de ingresos por período y método de pago
- **Servicios**: Estadísticas de uso, servicios más/menos solicitados
- **KPIs**: Ingresos totales, solicitudes, tasa de finalización, clientes activos
- **Servicios Pendientes**: Tabla con días en espera
- **Solicitudes Inactivas**: Detección de procesos estancados
- **Renovaciones Próximas**: Alertas para marcas que vencen

### 📅 Gestión de Citas

- Calendario interactivo con FullCalendar
- Creación de citas desde solicitudes
- Reprogramación y cancelación
- Notificaciones automáticas a clientes y empleados
- Búsqueda de usuarios por documento
- Reportes en Excel

### 📁 Gestión de Archivos

- Subida de archivos con categorización
- Descarga segura de documentos
- Descarga de archivos en ZIP por solicitud
- Asociación con clientes y órdenes de servicio

---

## 🛠️ Tecnologías

### Core

- **React 18.3.1** - Biblioteca de UI
- **React Router DOM 7.6.2** - Enrutamiento
- **Vite 6.3.5** - Build tool y dev server

### UI y Estilos

- **Tailwind CSS 3.4.17** - Framework de CSS utility-first
- **Bootstrap 5.3.7** - Framework CSS adicional
- **React Bootstrap 2.10.10** - Componentes React de Bootstrap
- **Bootstrap Icons 1.13.1** - Iconografía
- **Lucide React 0.522.0** - Iconos modernos
- **Headless UI 2.2.4** - Componentes accesibles sin estilos

### Gráficas y Visualización

- **Chart.js 4.5.0** - Librería de gráficas
- **React ChartJS 2 5.3.0** - Wrapper de Chart.js para React

### Formularios y Validación

- **Formik 2.4.6** - Manejo de formularios
- **Yup 1.6.1** - Validación de esquemas

### Calendario

- **FullCalendar 6.1.17/18** - Calendario interactivo completo
  - @fullcalendar/react
  - @fullcalendar/core
  - @fullcalendar/daygrid
  - @fullcalendar/timegrid
  - @fullcalendar/interaction

### Alertas y Notificaciones

- **SweetAlert2 11.22.2** - Modales y alertas elegantes
- Sistema personalizado de toast notifications

### Exportación de Datos

- **ExcelJS 4.4.0** - Generación de archivos Excel
- **XLSX 0.18.5** - Procesamiento de Excel
- **jsPDF 3.0.1** - Generación de PDFs
- **html2canvas 1.4.1** - Captura de HTML para PDF
- **File Saver 2.0.5** - Descarga de archivos
- **JSZip 3.10.1** - Compresión de archivos ZIP

### Utilidades

- **React Scroll 1.9.3** - Scroll suave

### Testing

- **Jest 29.7.0** - Framework de testing
- **React Testing Library 14.2.1** - Testing de componentes React
- **Jest DOM 6.4.2** - Matchers personalizados para DOM

### Desarrollo

- **ESLint 9.25.0** - Linter de código
- **PostCSS 8.5.6** - Procesador de CSS
- **Autoprefixer 10.4.21** - Prefijos CSS automáticos

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.x
- **npm** >= 9.x o **yarn** >= 1.22.x
- **Git**

Para verificar tus versiones:

```bash
node --version
npm --version
git --version
```

---

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd Registrack_Oficial
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto (ver sección de [Configuración](#-configuración))

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL de la API Backend
VITE_USE_LOCAL_API=false

# Si está en true, usa http://localhost:3000
# Si está en false, usa el proxy de Vite o la URL de producción
```

### Configuración de la API

La aplicación se conecta automáticamente a:

- **Desarrollo**: Usa proxy de Vite (configurado en `vite.config.js`) que redirige a `https://apiregistrack-b0b629b0780d.herokuapp.com`
- **Producción**: Se conecta directamente a `https://apiregistrack-b0b629b0780d.herokuapp.com`

Para cambiar la URL de la API, edita `src/shared/config/apiConfig.js`:

```javascript
const PROD_BASE_URL = 'https://apiregistrack-b0b629b0780d.herokuapp.com';
const LOCAL_BASE_URL = 'http://localhost:3000';
```

### Proxy de Desarrollo

El proxy está configurado en `vite.config.js` para evitar problemas de CORS en desarrollo. Todas las peticiones a `/api/*` se redirigen automáticamente al backend.

---

## 📁 Estructura del Proyecto

```
Registrack_Oficial/
├── public/                 # Archivos estáticos
│   └── images/            # Imágenes y assets
├── src/
│   ├── assets/            # Assets del proyecto
│   ├── components/        # Componentes de prueba y testing
│   ├── examples/          # Ejemplos de uso
│   ├── features/          # Módulos de la aplicación
│   │   ├── auth/          # Autenticación y autorización
│   │   │   ├── components/  # Componentes de auth
│   │   │   ├── hooks/      # Hooks personalizados
│   │   │   ├── pages/      # Páginas de auth
│   │   │   └── services/   # Servicios de API
│   │   ├── dashboard/     # Dashboard administrativo
│   │   │   ├── components/  # Componentes del dashboard
│   │   │   ├── hooks/      # Hooks del dashboard
│   │   │   ├── layouts/    # Layouts del dashboard
│   │   │   └── pages/      # Páginas del dashboard
│   │   │       ├── dashAdmin/        # Dashboard principal
│   │   │       ├── gestionCitas/     # Gestión de citas
│   │   │       ├── gestionClientes/  # Gestión de clientes
│   │   │       ├── gestionEmpleados/ # Gestión de empleados
│   │   │       ├── gestionRoles/     # Gestión de roles
│   │   │       ├── gestionUsuarios/  # Gestión de usuarios
│   │   │       ├── gestionVentasServicios/ # Gestión de solicitudes
│   │   │       ├── misProcesos/      # Mis procesos (cliente)
│   │   │       ├── pagos/            # Gestión de pagos
│   │   │       └── solicitudesCitas/ # Solicitudes de citas
│   │   └── landing/       # Páginas públicas
│   │       ├── components/  # Componentes de landing
│   │       ├── pages/      # Páginas de servicios
│   │       └── services/   # Servicios de landing
│   ├── routes/            # Configuración de rutas
│   ├── shared/            # Recursos compartidos
│   │   ├── components/    # Componentes reutilizables
│   │   ├── config/        # Configuraciones
│   │   ├── contexts/      # Contextos de React
│   │   ├── hooks/         # Hooks compartidos
│   │   ├── layouts/       # Layouts compartidos
│   │   ├── services/      # Servicios compartidos
│   │   ├── styles/        # Estilos compartidos
│   │   └── utils/         # Utilidades
│   ├── styles/            # Estilos globales
│   ├── utils/             # Utilidades globales
│   ├── App.jsx            # Componente raíz
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── docs/                  # Documentación adicional
├── scripts/               # Scripts de utilidad
├── .env                   # Variables de entorno (crear)
├── index.html             # HTML principal
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
└── README.md              # Este archivo
```

---

## 🎮 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de la build de producción
npm run preview
```

### Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en CI
npm run test:ci
```

### Linting

```bash
# Verificar código con ESLint
npm run lint
```

### Utilidades

```bash
# Verificar datos mock
npm run verify-mock-data
```

---

## 🏗️ Módulos Principales

### 1. Autenticación (`/features/auth`)

- **Páginas**: Login, Registro, Recuperación de contraseña, Perfil, Editar Perfil
- **Componentes**: Navbars, Layouts, Guards de rutas
- **Servicios**: API de autenticación, gestión de usuarios
- **Funcionalidades**:
  - Login con JWT
  - Registro de usuarios
  - Recuperación de contraseña con código
  - Gestión de perfil
  - Edición de perfil propio (clientes)
  - Protección de rutas por rol

### 2. Dashboard Administrativo (`/features/dashboard/pages/dashAdmin`)

- **Componentes**: Gráficas, tablas, KPIs
- **Funcionalidades**:
  - Dashboard con métricas en tiempo real
  - Gráficas de ingresos (pie chart, barras)
  - Resumen de servicios
  - Alertas y notificaciones
  - Exportación de reportes

### 3. Gestión de Solicitudes (`/features/dashboard/pages/gestionVentasServicios`)

- **Funcionalidades**:
  - Listado de solicitudes (en proceso, finalizadas)
  - Creación y edición de solicitudes
  - Asignación de empleados
  - Cambio de estados
  - Búsqueda y filtrado avanzado
  - Exportación a Excel

### 4. Gestión de Citas (`/features/dashboard/pages/gestionCitas`)

- **Funcionalidades**:
  - Calendario interactivo (FullCalendar)
  - Creación de citas desde solicitudes
  - Reprogramación y cancelación
  - Listado de citas
  - Reportes en Excel

### 5. Gestión de Pagos (`/features/dashboard/pages/pagos`)

- **Funcionalidades**:
  - Tabla de pagos completa
  - Procesamiento de pagos (mock)
  - Descarga de comprobantes PDF
  - Historial de pagos
  - Reportes en Excel
  - Precio del servicio visible

### 6. Gestión de Clientes (`/features/dashboard/pages/gestionClientes`)

- **Funcionalidades**:
  - Listado de clientes
  - Edición de información
  - Gestión de empresas asociadas
  - Exportación a Excel

### 7. Gestión de Empleados (`/features/dashboard/pages/gestionEmpleados`)

- **Funcionalidades**:
  - CRUD completo de empleados
  - Asignación a solicitudes
  - Control de estado (activo/inactivo)
  - Reportes en Excel

### 8. Gestión de Roles y Permisos (`/features/dashboard/pages/gestionRoles`)

- **Funcionalidades**:
  - Creación de roles personalizados
  - Asignación de permisos granular
  - Gestión de privilegios
  - Control de acceso por módulo y acción

### 9. Mis Procesos (`/features/dashboard/pages/misProcesos`)

- **Funcionalidades** (vista de cliente):
  - Listado de solicitudes propias
  - Seguimiento de procesos
  - Estados y actualizaciones
  - Pagos pendientes
  - Descarga de documentos asociados a seguimientos
  - Modal detallado de seguimientos con descarga de archivos adjuntos
  - **Descarga de archivos de seguimiento** con endpoints diferenciados por rol:
    - Clientes: Acceso a archivos de sus propios seguimientos
    - Administradores/Empleados: Acceso completo a todos los seguimientos

### 10. Landing Page (`/features/landing`)

- **Funcionalidades**:
  - Página principal
  - Descripción de servicios
  - Formularios de solicitud
  - Información de contacto

---

## 🔄 Flujo de Rutas

### Rutas Públicas

- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro
- `/forgotPassword` - Recuperación de contraseña
- `/pages/busqueda` - Página de búsqueda de antecedentes
- `/pages/certificacion` - Página de certificación
- `/pages/renovacion` - Página de renovación
- `/pages/ampliacion` - Página de ampliación
- `/pages/cesion-marca` - Página de cesión
- `/pages/presentacion-oposicion` - Página de oposición
- `/ayuda` - Página de ayuda

### Rutas de Cliente (`/cliente/*`)

- `/cliente/misprocesos` - Mis procesos
- `/cliente/profile` - Perfil
- `/cliente/editProfile` - Editar perfil

### Rutas de Admin/Empleado (`/admin/*`)

- `/admin/dashboard` - Dashboard administrativo
- `/admin/pagos` - Gestión de pagos
- `/admin/calendario` - Calendario de citas
- `/admin/clientes` - Gestión de clientes
- `/admin/usuarios` - Gestión de usuarios
- `/admin/ventas-proceso` - Solicitudes en proceso
- `/admin/ventas-fin` - Solicitudes finalizadas
- `/admin/roles` - Gestión de roles
- `/admin/empleados` - Gestión de empleados
- `/admin/servicios` - Gestión de servicios
- `/admin/solicitudes-citas` - Solicitudes de citas
- `/admin/profile` - Perfil

---

## 🧩 Componentes Compartidos

### Componentes de UI

- **Badge** - Etiquetas con estado
- **DownloadButton** - Botón de descarga
- **FileUpload** - Subida de archivos
- **StandardAvatar** - Avatar estándar
- **StandardDropdown** - Dropdown reutilizable
- **BaseModal** - Modal base
- **ToastContainer** - Contenedor de notificaciones

### Componentes de Formularios

- **FormularioBase** - Layout base para formularios
- Formularios específicos por servicio (Busqueda, Certificacion, etc.)

### Componentes de Seguridad

- **ProtectedRoute** - Guard de rutas protegidas
- **PermissionGuard** - Guard de permisos
- **AdminRoute** - Guard para administradores
- **EmployeeRoute** - Guard para empleados
- **ClientRoute** - Guard para clientes

---

## 🔌 Integración con API

### Configuración

La configuración de la API se encuentra en `src/shared/config/apiConfig.js`:

- Endpoints centralizados
- URLs de producción y desarrollo
- Configuración de timeout y reintentos

### Servicios de API

Cada módulo tiene su servicio de API correspondiente:

- `authApiService.js` - Autenticación
- `citasApiService.js` - Citas
- `clientesApiService.js` - Clientes
- `dashboardApiService.js` - Dashboard
- `empleadosApiService.js` - Empleados
- `solicitudesCitasApiService.js` - Solicitudes de citas
- `pagosApiService.js` - Pagos (en `/features/dashboard/pages/pagos/services`)

### Manejo de Errores

- Interceptores de errores globales
- Manejo de errores 401 (token expirado)
- Manejo de errores 403 (permisos)
- Mensajes de error amigables

---

## 🎨 Estilos y Temas

### Tailwind CSS

La aplicación usa Tailwind CSS como framework principal de estilos:

- Configuración en `tailwind.config.js`
- Colores personalizados definidos
- Utilidades personalizadas

### Estilos Globales

- `src/index.css` - Estilos globales base
- `src/styles/alertAnimations.css` - Animaciones de alertas
- `src/styles/fullcalendar-custom.css` - Estilos personalizados de FullCalendar
- `src/styles/responsive.css` - Estilos responsive

### Estilos Compartidos

- `src/shared/styles/alertStandards.js` - Estándares de alertas
- `src/shared/styles/buttonStandards.js` - Estándares de botones

---

## 📱 Responsive Design

La aplicación está diseñada para ser responsive:

- Diseño mobile-first
- Breakpoints de Tailwind CSS
- Componentes adaptativos
- Tablas con scroll horizontal en móviles

---

## 🧪 Testing

### Configuración

- Jest como framework de testing
- React Testing Library para componentes
- Configuración en `jest.config.js`
- Setup en `src/setupTests.js`

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

### Estructura de Tests

Los tests se encuentran en:
- `src/utils/__tests__/` - Tests de utilidades

---

## 🚢 Despliegue

### Build de Producción

```bash
npm run build
```

Esto generará una carpeta `dist/` con los archivos optimizados.

### Variables de Entorno en Producción

Asegúrate de configurar las variables de entorno en tu plataforma de despliegue:

```env
VITE_USE_LOCAL_API=false
```

### Despliegue en Vercel/Netlify

1. Conecta tu repositorio
2. Configura las variables de entorno
3. El build se ejecutará automáticamente

### Preview Local de Producción

```bash
npm run build
npm run preview
```

---

## 🔧 Desarrollo

### Estructura de Características

Cada feature sigue esta estructura:

```
feature/
├── components/     # Componentes específicos
├── pages/          # Páginas del módulo
├── services/       # Servicios de API
├── hooks/          # Hooks personalizados
└── utils/          # Utilidades del módulo
```

### Convenciones de Código

- **Componentes**: PascalCase (ej: `MiComponente.jsx`)
- **Funciones/Utilidades**: camelCase (ej: `miFuncion.js`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MI_CONSTANTE.js`)
- **Archivos de servicios**: camelCase con sufijo `Service` (ej: `authApiService.js`)

### Hooks Personalizados

- `useAuth` - Manejo de autenticación
- `usePermissions` - Verificación de permisos
- `useToast` - Notificaciones toast
- `useDashboardData` - Datos del dashboard
- `useSincronizacionEmpleados` - Sincronización de empleados

### Contextos

- `AuthContext` - Contexto de autenticación
- `NotificationContext` - Contexto de notificaciones
- `PaymentContext` - Contexto de pagos
- `SidebarContext` - Contexto de sidebar

---

## 📊 Estado y Manejo de Datos

### Estado Local

- React Hooks (`useState`, `useEffect`)
- Context API para estado global

### Persistencia

- `localStorage` para tokens y datos de sesión
- Tokens JWT almacenados de forma segura

---

## 🔐 Seguridad

### Autenticación

- Tokens JWT almacenados en `localStorage`
- Tokens incluidos en headers `Authorization: Bearer <token>`
- Limpieza automática al cerrar sesión

### Autorización

- Protección de rutas por rol
- Verificación de permisos granular
- Middleware de permisos en componentes

### Validación

- Validación de formularios con Yup
- Sanitización de inputs
- Validación de tipos de archivo
- Límites de tamaño de archivo

---

## 📚 Documentación Adicional

La documentación adicional se encuentra en la carpeta `docs/`:

- Guías de implementación
- Ejemplos de uso
- Documentación de API (en `documentacion api.md`)
- Guías de diseño

---

## 🤝 Contribución

### Proceso de Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/MiNuevaFeature`)
3. Commit tus cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/MiNuevaFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usa ESLint para mantener consistencia
- Sigue las convenciones de nombrado
- Documenta funciones complejas
- Mantén componentes pequeños y reutilizables

---

## 📝 Notas Importantes

### Desarrollo

- El proxy de Vite está configurado para desarrollo local
- Los logs de consola incluyen prefijos para identificar el origen (`[ComponentName]`)
- Los errores se muestran con SweetAlert2 para mejor UX

### Producción

- Asegúrate de que el backend tenga CORS configurado correctamente
- Verifica que todas las variables de entorno estén configuradas
- El build de producción optimiza automáticamente los assets

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación en `docs/`
2. Revisa los issues existentes
3. Crea un nuevo issue con detalles del problema

---

## 📄 Licencia

[Especificar licencia si aplica]

---

## 👥 Equipo

[Información del equipo de desarrollo]

---

## 🎉 Agradecimientos

[Reconocimientos si aplica]

---

**Última actualización**: Enero 2026

