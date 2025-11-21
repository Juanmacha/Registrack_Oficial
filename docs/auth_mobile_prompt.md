## Prompt Implementación Autenticación Móvil

Eres un desarrollador React Native que debe portar el flujo de autenticación de Registrack (Certimarcas) desde el frontend web existente. Implementa tres módulos: Login, Registro y Recuperación de contraseña (email + código + reset). Respeta la lógica actual:

1. **Login**
   - Campos email/contraseña con validaciones (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` y requeridos).
   - Toggle de visibilidad de contraseña.
   - Sanitiza entradas (`sanitizeLoginData` equivalente) y llama a `POST /api/usuarios/login` con payload `{ correo, contrasena }`.
   - Guarda token y usuario en AsyncStorage usando las mismas claves que web (`authToken`, `token`, `currentUser`, `user`, `userData`, `isAuthenticated`).
   - Determina redirección según rol (usa lógica equivalente a `tieneRolAdministrativo`).
   - Maneja errores de credenciales, rate limit (mostrar minutos de espera), conexión y sesión expirada.

2. **Registro**
   - Campos: nombre, apellido, tipo y número de documento, correo, teléfono opcional, contraseña, confirmación y checkbox de política de privacidad.
   - Validaciones de requeridos, formatos y fortaleza de contraseña (`validatePasswordStrength` + mensaje `getPasswordRequirementsShort`).
   - Sanitiza datos (`sanitizeRegisterData` equivalente).
   - Envía a `POST /api/usuarios/registrar` con payload `{ tipo_documento, documento, nombre, apellido, correo, contrasena, telefono?, id_rol=3 }`.
   - Muestra alertas de éxito y errores específicos devueltos por la API.

3. **Recuperación**
   - Pantalla 1 (Forgot): solicita correo, valida, sanitiza (`sanitizeEmail`) y llama a `POST /api/usuarios/forgot-password` ({ correo }). Guarda `emailRecuperacion`.
   - Pantalla 2 (Código): ingresa código de 6 dígitos, valida, guarda `resetToken` tras confirmarlo y navega al reset.
   - Pantalla 3 (Reset): nueva contraseña + confirmación, valida requisitos, llama a `POST /api/usuarios/reset-password` ({ token, newPassword }), limpia `resetToken` y `emailRecuperacion`, muestra alerta y redirige a login.

### Requerimientos técnicos
- **Servicio**: crea `authApiService` móvil con `axios` o `fetch` que reutilice `API_CONFIG` (`baseURL`, endpoints, headers, timeouts) y manejo de errores (`manejarErrorAPI`, `obtenerMensajeErrorUsuario` equivalentes).
- **Contexto**: implementa `AuthContext` para exponer `login`, `logout`, `user`, `isAuthenticated`, `hasRole`, `hasPermission`.
- **Navegación**: usa React Navigation con stack `Login`, `Register`, `ForgotPassword`, `CodigoRecuperacion`, `ResetPassword`.
- **Estilos**: replica la estética web con contenedores blancos (`bg-white rounded-lg shadow-lg p-8`), botones azul intenso (`bg-blue-600 hover:bg-blue-700 text-white rounded-lg`), inputs con borde gris y focus azul (`border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500`), alertas de colores (`red/yellow/green`) y tipografía en tonos `#275FAA`, `#083874`, `#3B82F6`, `#6B7280`.
- **Almacenamiento seguro**: considera `expo-secure-store` para el token en producción.
- **Mensajería**: usa modales/alerts tipo SweetAlert (e.g., `react-native-awesome-alerts`) para éxitos, advertencias y errores.

### Entorno
- En desarrollo utiliza proxy `/api`; en producción usa `https://api-registrack-2.onrender.com`.
- Respeta los tiempos de espera largos (hasta 150s) porque el backend en Render puede “despertar”.

### Tareas de validación
- Prueba flujos completos con cuentas admin y cliente.
- Verifica manejo de token expirado (`authApiService.isAuthenticated`).
- Asegura que rate limiting muestre el tiempo de espera proporcionado por la API.

