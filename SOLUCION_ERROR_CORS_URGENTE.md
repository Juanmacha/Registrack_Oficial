# 🚨 SOLUCIÓN URGENTE - ERROR CORS

**Fecha**: 28 de Octubre de 2025  
**Severidad**: 🔴 **CRÍTICA** - Bloquea todas las peticiones al API  
**Estado**: Pendiente de corrección en BACKEND

---

## ❌ PROBLEMA IDENTIFICADO

### **Error en Consola:**
```
Access to fetch at 'https://api-registrack-2.onrender.com/api/servicios' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### **Causa Raíz:**
El backend desplegado en `https://api-registrack-2.onrender.com` **NO está configurado** para permitir peticiones desde el frontend en desarrollo (`http://localhost:5173`).

---

## 🔍 ¿QUÉ ES CORS?

**CORS** (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que bloquea peticiones entre diferentes orígenes (dominios, puertos o protocolos).

### **En este caso:**
- **Frontend**: `http://localhost:5173` (desarrollo local)
- **Backend**: `https://api-registrack-2.onrender.com` (producción)
- **Problema**: Origen diferente → Navegador bloquea las peticiones

---

## ✅ SOLUCIÓN 1: CONFIGURAR CORS EN EL BACKEND (RECOMENDADA)

### **Ubicación del Código:**
El backend debe tener un archivo de configuración de CORS, probablemente en:
- `app.js` o `server.js`
- Middleware de CORS

### **Código Requerido en el Backend:**

```javascript
// ✅ CONFIGURACIÓN CORRECTA DE CORS
const cors = require('cors');

// Opción 1: Permitir todos los orígenes (solo desarrollo)
app.use(cors({
  origin: '*',  // ⚠️ SOLO PARA DESARROLLO
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Opción 2: Permitir orígenes específicos (RECOMENDADA para producción)
app.use(cors({
  origin: [
    'http://localhost:5173',           // Frontend desarrollo
    'http://localhost:3000',           // Alternativa desarrollo
    'https://registrack-frontend.vercel.app',  // Frontend producción
    'https://tu-dominio.com'           // Tu dominio de producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Opción 3: Configuración basada en entorno (MEJOR PRÁCTICA)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://registrack-frontend.vercel.app',
      'https://tu-dominio.com'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (Postman, móvil, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
}));
```

---

## 📋 VERIFICACIÓN EN EL BACKEND

### **Archivo a Revisar:**
Buscar en el backend el archivo donde se configura Express:

```bash
# Buscar configuración de CORS
grep -r "cors" . --include="*.js"
grep -r "Access-Control-Allow-Origin" . --include="*.js"
```

### **Verificar que existe:**
```javascript
// Debe existir algo como:
const cors = require('cors');
app.use(cors(...));
```

---

## 🔧 SOLUCIÓN 2: PROXY EN VITE (TEMPORAL - SOLO DESARROLLO)

**⚠️ NOTA**: Esta es una solución **temporal** solo para desarrollo. El backend DEBE configurarse correctamente.

### **PASO 1: Configurar Proxy en Vite**

**Archivo a modificar**: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ AGREGAR: Configuración de proxy
  server: {
    proxy: {
      '/api': {
        target: 'https://api-registrack-2.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  }
})
```

### **PASO 2: Actualizar apiConfig.js**

**Archivo a modificar**: `src/shared/config/apiConfig.js`

```javascript
// Configuración de la API
const API_CONFIG = {
  // ✅ CAMBIAR: Usar proxy en desarrollo, URL completa en producción
  baseURL: import.meta.env.DEV 
    ? ''  // En desarrollo, usar proxy (relativo)
    : 'https://api-registrack-2.onrender.com',  // En producción, URL completa
  
  BASE_URL: import.meta.env.DEV 
    ? ''  // En desarrollo, usar proxy
    : 'https://api-registrack-2.onrender.com',  // En producción
  
  // ... resto de la configuración ...
};
```

### **PASO 3: Reiniciar Servidor de Desarrollo**

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

### **⚠️ LIMITACIONES DEL PROXY:**
- ✅ Funciona SOLO en desarrollo (`npm run dev`)
- ❌ NO funciona en producción
- ❌ Requiere que el servidor de Vite esté corriendo
- ⚠️ Solución temporal hasta que el backend configure CORS

---

## 🔍 VERIFICACIÓN DE CORS

### **Prueba Manual en Navegador:**

1. Abrir las **Herramientas de Desarrollador** (F12)
2. Ir a la pestaña **Network** (Red)
3. Intentar hacer login o cargar servicios
4. Seleccionar la petición fallida
5. Verificar en **Headers**:
   - ❌ Si falta `Access-Control-Allow-Origin` → Backend no está configurado
   - ✅ Si aparece `Access-Control-Allow-Origin: http://localhost:5173` → Funciona

### **Prueba con curl (Terminal):**

```bash
# Verificar si el backend responde a OPTIONS (preflight)
curl -X OPTIONS https://api-registrack-2.onrender.com/api/servicios \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Debe retornar headers CORS:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
# Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📝 CHECKLIST PARA EL BACKEND DEVELOPER

### **Configuración CORS:**
- [ ] Instalar `cors` package: `npm install cors`
- [ ] Configurar CORS en `app.js` o `server.js`
- [ ] Agregar `http://localhost:5173` a origins permitidos
- [ ] Agregar métodos permitidos: GET, POST, PUT, DELETE, PATCH, OPTIONS
- [ ] Agregar headers permitidos: Content-Type, Authorization, Accept
- [ ] Habilitar `credentials: true` si se envían cookies
- [ ] Probar con curl o Postman
- [ ] Verificar en producción que funciona

### **Configuración para Producción:**
- [ ] Configurar origins de producción
- [ ] Usar variables de entorno para URLs permitidas
- [ ] No usar `origin: '*'` en producción
- [ ] Configurar preflight (OPTIONS) correctamente

---

## 🚀 ACCIONES INMEDIATAS

### **Para el Backend Developer:**
1. ✅ Abrir archivo de configuración de Express (`app.js` o `server.js`)
2. ✅ Verificar si `cors` está instalado: `npm list cors`
3. ✅ Agregar configuración CORS (usar código de arriba)
4. ✅ Reiniciar servidor backend
5. ✅ Probar con curl o Postman
6. ✅ Verificar que funciona desde frontend

### **Para el Frontend Developer (Solución Temporal):**
1. ✅ Configurar proxy en `vite.config.js`
2. ✅ Actualizar `apiConfig.js` para usar proxy en desarrollo
3. ✅ Reiniciar servidor de desarrollo
4. ✅ Probar que funciona

---

## 📞 INFORMACIÓN PARA EL BACKEND DEVELOPER

### **URLs que deben estar permitidas:**
- `http://localhost:5173` (desarrollo frontend)
- `http://localhost:3000` (alternativa desarrollo)
- `http://127.0.0.1:5173` (alternativa localhost)
- Tu dominio de producción (cuando esté listo)

### **Métodos HTTP que deben estar permitidos:**
- `GET`
- `POST`
- `PUT`
- `DELETE`
- `PATCH`
- `OPTIONS` (⚠️ CRÍTICO para preflight)

### **Headers que deben estar permitidos:**
- `Content-Type`
- `Authorization`
- `Accept`

---

## 🔄 ALTERNATIVA: EXTENSIÓN DE NAVEGADOR (NO RECOMENDADA)

**⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN**

Puedes instalar una extensión de navegador que desactiva CORS:

1. **Chrome/Edge**: "Allow CORS: Access-Control-Allow-Origin"
2. **Firefox**: "CORS Everywhere"

**⚠️ ADVERTENCIAS:**
- Solo funciona en tu navegador
- No es una solución real
- Puede causar problemas de seguridad
- Solo para pruebas rápidas

---

## ✅ VERIFICACIÓN POST-CORRECCIÓN

Después de que el backend configure CORS, verificar:

1. **En la consola del navegador:**
   ```
   ✅ No debe aparecer error de CORS
   ✅ Las peticiones deben completarse exitosamente
   ```

2. **En Network tab:**
   ```
   ✅ Status: 200 OK (o el código apropiado)
   ✅ Response Headers incluyen:
      - Access-Control-Allow-Origin: http://localhost:5173
      - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
      - Access-Control-Allow-Headers: Content-Type, Authorization, Accept
   ```

3. **Funcionalidad:**
   ```
   ✅ Login funciona
   ✅ Carga de servicios funciona
   ✅ Todas las peticiones funcionan
   ```

---

## 📋 CÓDIGO COMPLETO PARA EL BACKEND

### **Ejemplo Completo de app.js:**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// ✅ CONFIGURACIÓN DE CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://registrack-frontend.vercel.app',
      // Agregar más orígenes de producción aquí
    ];

    // Permitir peticiones sin origen (Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si el origen está permitido
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // Cache preflight por 24 horas
};

// Aplicar CORS
app.use(cors(corsOptions));

// Manejar preflight explícitamente
app.options('*', cors(corsOptions));

// Resto de la configuración de Express...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... rutas y middlewares ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`✅ CORS configurado para desarrollo y producción`);
});
```

---

## 🎯 PRIORIDAD

**🔴 URGENTE** - Este problema bloquea TODAS las peticiones al API.

**Tiempo estimado de corrección**: 5-10 minutos  
**Impacto**: Sin corrección, el frontend NO puede conectarse al backend

---

## 📞 CONTACTO

Si el backend developer necesita más información, puede consultar:
- Documentación oficial de CORS: https://expressjs.com/en/resources/middleware/cors.html
- Este documento para detalles específicos

---

**Documento creado por**: Claude AI  
**Fecha**: 28 de Octubre de 2025  
**Versión**: 1.0  
**Estado**: Pendiente de implementación en backend

