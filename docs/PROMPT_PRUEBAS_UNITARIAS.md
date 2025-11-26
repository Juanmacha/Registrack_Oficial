# 🧪 PROMPT PARA PRUEBAS UNITARIAS - Registro de Usuario y Procesamiento de Pago

## 📋 CONTEXTO DEL PROYECTO

Necesito crear pruebas unitarias para un sistema de gestión que maneja dos funcionalidades principales:

1. **Registro de Usuario** - Creación de usuarios en el sistema
2. **Procesamiento de Pago** - Procesamiento de pagos para activar solicitudes de servicio

Debes seguir la metodología de pruebas unitarias con Jest siguiendo los pasos estándar de configuración, preparación, ejecución, verificación y limpieza.

**⚠️ IMPORTANTE:** Este prompt está alineado con la implementación real del proyecto Registrack (Enero 2026).

---

## 🎯 OBJETIVO

Crear un conjunto completo de pruebas unitarias que validen:
- ✅ Creación de registros de usuario
- ✅ Procesamiento de pagos y activación automática de solicitudes
- ✅ Validaciones de campos requeridos
- ✅ Validaciones de formato de datos
- ✅ Manejo de errores
- ✅ Casos límite y edge cases

---

## 📊 ESTRUCTURA DE DATOS

### 1. REGISTRO DE USUARIO

#### Nota sobre Transformación de Datos

El frontend envía datos en formato camelCase que son transformados a snake_case antes de enviarlos a la API:

**Frontend (camelCase):**
```typescript
{
  tipoDocumento: string;
  documento: string | number;
  nombre: string;
  apellido: string;
  email: string;          // ⚠️ Nota: frontend usa "email"
  password: string;       // ⚠️ Nota: frontend usa "password"
  roleId: number;         // ⚠️ Nota: frontend usa "roleId"
  telefono?: string;
}
```

**API (snake_case):**
```typescript
interface RegistroUsuario {
  tipo_documento: string;        // "CC", "CE", "TI", "RC", "NIT", "PAS"
  documento: string | number;     // Número de documento (ej: "12345678" o 12345678)
  nombre: string;                 // Nombre del usuario (mínimo 2, máximo 50 caracteres)
  apellido: string;               // Apellido del usuario (mínimo 2, máximo 50 caracteres)
  correo: string;                 // Email válido (debe ser único)
  contrasena: string;             // Contraseña (ver validaciones abajo)
  id_rol: number;                 // ID del rol (debe existir en BD y estar activo)
  telefono?: string;              // Número de teléfono opcional (7-20 caracteres)
}
```

#### Validaciones Requeridas:

- **`tipo_documento`**: Debe ser uno de: `"CC"`, `"CE"`, `"TI"`, `"RC"`, `"NIT"`, `"PAS"`
- **`documento`**: No puede estar vacío, debe ser único en el sistema
- **`nombre`**: Mínimo 2 caracteres, máximo 50, solo letras y espacios
- **`apellido`**: Mínimo 2 caracteres, máximo 50, solo letras y espacios
- **`correo`**: Formato de email válido, debe ser único en el sistema
- **`contrasena`**: 
  - Mínimo 8 caracteres
  - Máximo 128 caracteres
  - Al menos una mayúscula (A-Z)
  - Al menos una minúscula (a-z)
  - Al menos un número (0-9)
  - Al menos un carácter especial (!@#$%^&*)
  - **NO puede ser una contraseña común** (hay una lista de 990+ contraseñas bloqueadas)
- **`id_rol`**: 
  - Debe existir en la base de datos
  - Debe estar activo (`estado: true`)
  - Puede ser cualquier ID de rol válido (no solo 1, 2, 3 - el sistema soporta roles personalizados)
- **`telefono`**: Si se proporciona, debe tener formato válido:
  - Longitud: 7-20 caracteres
  - Formatos permitidos: `"+57 300 123 4567"` o `"3001234567"`

#### Validaciones del Frontend (Adicionales):
- **Política de Privacidad**: El usuario debe aceptar la política de privacidad
- **Confirmación de Contraseña**: El campo `confirmPassword` debe coincidir con `password`

---

### 2. PROCESAMIENTO DE PAGO

#### ⚠️ IMPORTANTE: Sistema de Pago Real

El sistema **NO** usa un endpoint genérico `crearPago`. En su lugar, usa el endpoint:

**`POST /api/gestion-pagos/process-mock`**

Este endpoint:
- Procesa el pago
- Activa automáticamente la solicitud asociada (si está en estado "Pendiente de Pago")
- Establece automáticamente la fecha de pago
- Genera automáticamente el estado "Pagado"
- Genera automáticamente `numero_comprobante` (formato: `RC-YYYYMM-XXXX`)
- Genera automáticamente `transaction_id`

#### Campos del Endpoint:

```typescript
interface ProcesarPago {
  orden_id: number;              // ⚠️ NOTA: Es "orden_id", no "id_orden_servicio"
  metodo_pago: string;           // Método de pago (requerido)
  monto?: number;                // ⚠️ OPCIONAL: Si no se envía, se toma del total_estimado de la orden
}
```

#### Validaciones Requeridas:

- **`orden_id`**: 
  - Debe existir en el sistema
  - La orden debe estar en estado "Pendiente de Pago"
  - No puede estar ya pagada
- **`metodo_pago`**: Debe ser uno de los métodos permitidos:
  - `"Transferencia bancaria"`
  - `"Transferencia"`
  - `"Tarjeta de crédito"`
  - `"Tarjeta"`
  - `"Efectivo"`
  - `"Cheque"`
- **`monto`**: 
  - Es **opcional** (si no se envía, se toma del `total_estimado` de la orden)
  - Si se proporciona, debe coincidir **exactamente** con el `total_estimado` de la orden
  - Debe ser mayor a 0

#### Comportamiento Automático del Sistema:

1. **Fecha de Pago**: Se establece automáticamente cuando el estado es "Pagado"
2. **Estado**: Se establece automáticamente como "Pagado"
3. **Monto**: Si no se proporciona, se toma del `total_estimado` de la orden
4. **Activación de Solicitud**: Si la solicitud está en "Pendiente de Pago", se activa automáticamente con el primer estado del proceso
5. **Número de Comprobante**: Se genera automáticamente (formato: `RC-YYYYMM-XXXX`)
6. **Transaction ID**: Se genera automáticamente

#### Respuesta del Endpoint:

```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "payment": {
      "id": 123,
      "orden_id": 456,
      "monto": 500000.00,
      "metodo_pago": "Tarjeta",
      "fecha_pago": "2024-01-15",
      "estado": "Pagado",
      "numero_comprobante": "RC-202401-0001",
      "transaction_id": "TXN-123456789"
    },
    "solicitud_activada": true
  }
}
```

---

## 🧪 ESTRUCTURA DE PRUEBAS UNITARIAS

### PASO 1: CONFIGURACIÓN (SETUP)

```javascript
describe('Pruebas de Registro de Usuario', () => {
  // Configuración antes de todas las pruebas
  beforeAll(() => {
    // Inicializar base de datos de prueba
    // Configurar mocks
    // Establecer variables de entorno de prueba
  });

  // Configuración antes de cada prueba
  beforeEach(() => {
    // Limpiar datos de prueba anteriores
    // Resetear mocks
    // Preparar estado inicial
  });

  // Limpieza después de cada prueba
  afterEach(() => {
    // Limpiar datos creados
    // Restaurar mocks
  });

  // Limpieza después de todas las pruebas
  afterAll(() => {
    // Cerrar conexiones
    // Limpiar recursos
  });
});
```

---

## 🔧 MOCKS NECESARIOS

### Servicios a Mockear:

```javascript
// Mock de apiService
jest.mock('../../../shared/services/apiService', () => ({
  post: jest.fn(),
  postPublic: jest.fn(),
  get: jest.fn(),
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de fetch (si se usa directamente)
global.fetch = jest.fn();
```

---

### PASO 2: CASOS DE PRUEBA PARA REGISTRO DE USUARIO

#### Test 1: Crear usuario exitosamente con todos los campos requeridos

```javascript
test('debe crear un usuario exitosamente con todos los campos válidos', async () => {
  // ARRANGE (Preparar)
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan.perez@example.com",
    contrasena: "Password123!",
    id_rol: 3,
    telefono: "+57 300 123 4567"
  };

  // ACT (Ejecutar)
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT (Verificar)
  expect(resultado.success).toBe(true);
  expect(resultado.usuario).toBeDefined();
  expect(resultado.usuario.documento).toBe("12345678");
  expect(resultado.usuario.correo).toBe("juan.perez@example.com");
  expect(resultado.usuario.id_rol).toBe(3);
  expect(resultado.usuario).not.toHaveProperty('contrasena'); // La contraseña no debe retornarse
});
```

#### Test 2: Validar que no se puede crear usuario sin campos requeridos

```javascript
test('debe rechazar crear usuario sin campos requeridos', async () => {
  // ARRANGE
  const datosUsuarioIncompleto = {
    nombre: "Juan",
    apellido: "Pérez"
    // Faltan: tipo_documento, documento, correo, contrasena, id_rol
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioIncompleto);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error).toBeDefined();
  expect(resultado.error.camposFaltantes).toContain('tipo_documento');
  expect(resultado.error.camposFaltantes).toContain('documento');
  expect(resultado.error.camposFaltantes).toContain('correo');
  expect(resultado.error.camposFaltantes).toContain('contrasena');
  expect(resultado.error.camposFaltantes).toContain('id_rol');
});
```

#### Test 3: Validar formato de correo electrónico

```javascript
test('debe rechazar correo electrónico con formato inválido', async () => {
  // ARRANGE
  const correosInvalidos = [
    "correo-invalido",
    "correo@",
    "@example.com",
    "correo sin arroba",
    "correo..doble@example.com"
  ];

  for (const correo of correosInvalidos) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: correo,
      contrasena: "Password123!",
      id_rol: 3
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('correo');
  }
});
```

#### Test 4: Validar fortaleza de contraseña - Casos básicos

```javascript
test('debe rechazar contraseña débil', async () => {
  // ARRANGE
  const casosContrasenaDebil = [
    "1234567",           // Muy corta (< 8 caracteres)
    "password",         // Sin mayúsculas ni números ni especiales
    "PASSWORD",         // Sin minúsculas ni números ni especiales
    "Password",         // Sin números ni especiales
    "Password1",        // Sin caracteres especiales
    "Password!",        // Sin números
    "12345678",         // Solo números
    "ABCDEFGH",         // Solo mayúsculas
    "abcdefgh",         // Solo minúsculas
  ];

  for (const contrasena of casosContrasenaDebil) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: contrasena,
      id_rol: 3
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('contraseña');
  }
});
```

#### Test 5: Validar longitud máxima de contraseña

```javascript
test('debe rechazar contraseña con más de 128 caracteres', async () => {
  // ARRANGE
  const contrasenaLarga = "A" + "b1!".repeat(43); // 1 + 3*43 = 130 caracteres
  
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test@example.com",
    contrasena: contrasenaLarga,
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('128');
});

test('debe aceptar contraseña con exactamente 128 caracteres', async () => {
  // ARRANGE
  const contrasenaValida = "A" + "b1!".repeat(42) + "b1"; // 1 + 3*42 + 2 = 129, ajustar a 128
  const contrasena128 = "A" + "b1!".repeat(42) + "b"; // Exactamente 128 caracteres
  
  const datosUsuario = {
    tipo_documento: "CC",
    documento: `1234567${Math.random().toString().slice(2, 5)}`,
    nombre: "Juan",
    apellido: "Pérez",
    correo: `test${Math.random()}@example.com`,
    contrasena: contrasena128,
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT
  expect(resultado.success).toBe(true);
});
```

#### Test 6: Validar contraseñas comunes bloqueadas

```javascript
test('debe rechazar contraseñas comunes bloqueadas', async () => {
  // ARRANGE
  const contraseñasComunes = [
    "Password123!",
    "Admin123!",
    "Welcome123!",
    "Qwerty123!",
    "12345678",
    "password",
    "admin",
    "qwerty"
    // Nota: El sistema tiene una lista de 990+ contraseñas comunes
  ];

  for (const contrasena of contraseñasComunes) {
    // Solo probar si la contraseña cumple los requisitos básicos
    // (mayúscula, minúscula, número, especial, >= 8 caracteres)
    if (/[A-Z]/.test(contrasena) && /[a-z]/.test(contrasena) && 
        /[0-9]/.test(contrasena) && /[!@#$%^&*]/.test(contrasena) && 
        contrasena.length >= 8) {
      const datosUsuario = {
        tipo_documento: "CC",
        documento: `1234567${Math.random().toString().slice(2, 5)}`,
        nombre: "Juan",
        apellido: "Pérez",
        correo: `test${Math.random()}@example.com`,
        contrasena: contrasena,
        id_rol: 3
      };

      // ACT
      const resultado = await crearUsuario(datosUsuario);

      // ASSERT
      expect(resultado.success).toBe(false);
      expect(resultado.error.mensaje).toContain('común');
      expect(resultado.error.mensaje).toContain('segura');
    }
  }
});
```

#### Test 7: Validar que el documento sea único

```javascript
test('debe rechazar usuario con documento duplicado', async () => {
  // ARRANGE
  const documento = "12345678";
  
  // Crear primer usuario
  await crearUsuario({
    tipo_documento: "CC",
    documento: documento,
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan1@example.com",
    contrasena: "Password123!",
    id_rol: 3
  });

  // Intentar crear segundo usuario con mismo documento
  const datosUsuarioDuplicado = {
    tipo_documento: "CC",
    documento: documento,
    nombre: "Pedro",
    apellido: "García",
    correo: "pedro@example.com",
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioDuplicado);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('documento');
  expect(resultado.error.mensaje).toContain('duplicado');
});
```

#### Test 8: Validar que el correo sea único

```javascript
test('debe rechazar usuario con correo duplicado', async () => {
  // ARRANGE
  const correo = "test@example.com";
  
  // Crear primer usuario
  await crearUsuario({
    tipo_documento: "CC",
    documento: "11111111",
    nombre: "Juan",
    apellido: "Pérez",
    correo: correo,
    contrasena: "Password123!",
    id_rol: 3
  });

  // Intentar crear segundo usuario con mismo correo
  const datosUsuarioDuplicado = {
    tipo_documento: "CC",
    documento: "22222222",
    nombre: "Pedro",
    apellido: "García",
    correo: correo,
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioDuplicado);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('correo');
  expect(resultado.error.mensaje).toContain('duplicado');
});
```

#### Test 9: Validar tipos de documento permitidos

```javascript
test('debe aceptar solo tipos de documento válidos', async () => {
  // ARRANGE
  const tiposValidos = ["CC", "CE", "TI", "RC", "NIT", "PAS"];
  const tipoInvalido = "TIPO_INVALIDO";

  // Test con tipos válidos
  for (const tipo of tiposValidos) {
    const datosUsuario = {
      tipo_documento: tipo,
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: 3
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(true);
  }

  // Test con tipo inválido
  const datosUsuarioInvalido = {
    tipo_documento: tipoInvalido,
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test@example.com",
    contrasena: "Password123!",
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuarioInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('tipo_documento');
});
```

#### Test 10: Validar roles válidos (dinámico)

```javascript
test('debe aceptar solo roles que existan en la base de datos y estén activos', async () => {
  // ARRANGE
  // Simular roles existentes en BD
  const rolesExistentes = [
    { id: 1, nombre: "administrador", estado: true },
    { id: 2, nombre: "empleado", estado: true },
    { id: 3, nombre: "cliente", estado: true },
    { id: 10, nombre: "rol_personalizado", estado: true } // Rol personalizado
  ];

  // Mock para obtener roles de BD
  jest.spyOn(rolService, 'obtenerRolPorId').mockImplementation(async (id) => {
    return rolesExistentes.find(r => r.id === id && r.estado === true);
  });

  // Test con roles válidos (existen y están activos)
  for (const rol of rolesExistentes) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: rol.id
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(true);
    expect(resultado.usuario.id_rol).toBe(rol.id);
  }

  // Test con rol inexistente
  const datosUsuarioRolInexistente = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test@example.com",
    contrasena: "Password123!",
    id_rol: 999
  };

  // ACT
  const resultadoInexistente = await crearUsuario(datosUsuarioRolInexistente);

  // ASSERT
  expect(resultadoInexistente.success).toBe(false);
  expect(resultadoInexistente.error.mensaje).toContain('rol');
  expect(resultadoInexistente.error.mensaje).toContain('no encontrado');

  // Test con rol inactivo
  jest.spyOn(rolService, 'obtenerRolPorId').mockResolvedValue({
    id: 5,
    nombre: "rol_inactivo",
    estado: false
  });

  const datosUsuarioRolInactivo = {
    tipo_documento: "CC",
    documento: "12345679",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "test2@example.com",
    contrasena: "Password123!",
    id_rol: 5
  };

  // ACT
  const resultadoInactivo = await crearUsuario(datosUsuarioRolInactivo);

  // ASSERT
  expect(resultadoInactivo.success).toBe(false);
  expect(resultadoInactivo.error.mensaje).toContain('rol');
  expect(resultadoInactivo.error.mensaje).toContain('inactivo');
});
```

#### Test 11: Validar formato de teléfono

```javascript
test('debe aceptar teléfonos con formato válido', async () => {
  // ARRANGE
  const telefonosValidos = [
    "+57 300 123 4567",
    "3001234567",
    "+1 555 123 4567",
    "5551234567"
  ];

  for (const telefono of telefonosValidos) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: 3,
      telefono: telefono
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(true);
  }
});

test('debe rechazar teléfonos con formato inválido', async () => {
  // ARRANGE
  const telefonosInvalidos = [
    "12345",              // Muy corto (< 7 caracteres)
    "123456789012345678901", // Muy largo (> 20 caracteres)
    "abc123",             // Contiene letras
    "300-123-4567",       // Guiones no permitidos en este formato
  ];

  for (const telefono of telefonosInvalidos) {
    const datosUsuario = {
      tipo_documento: "CC",
      documento: `1234567${Math.random().toString().slice(2, 5)}`,
      nombre: "Juan",
      apellido: "Pérez",
      correo: `test${Math.random()}@example.com`,
      contrasena: "Password123!",
      id_rol: 3,
      telefono: telefono
    };

    // ACT
    const resultado = await crearUsuario(datosUsuario);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('teléfono');
  }
});
```

#### Test 12: Validar política de privacidad (frontend)

```javascript
test('debe rechazar registro si no se acepta la política de privacidad', async () => {
  // ARRANGE
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan@example.com",
    contrasena: "Password123!",
    id_rol: 3
  };

  const acceptedPrivacyPolicy = false;

  // ACT
  const resultado = await crearUsuario(datosUsuario, { acceptedPrivacyPolicy });

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('política de privacidad');
});
```

#### Test 13: Validar confirmación de contraseña (frontend)

```javascript
test('debe rechazar registro si las contraseñas no coinciden', async () => {
  // ARRANGE
  const datosUsuario = {
    tipo_documento: "CC",
    documento: "12345678",
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan@example.com",
    contrasena: "Password123!",
    confirmPassword: "Password456!", // No coincide
    id_rol: 3
  };

  // ACT
  const resultado = await crearUsuario(datosUsuario);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('contraseñas');
  expect(resultado.error.mensaje).toContain('no coinciden');
});
```

---

### PASO 3: CASOS DE PRUEBA PARA PROCESAMIENTO DE PAGO

#### Test 1: Procesar pago exitosamente sin monto (monto automático)

```javascript
test('debe procesar pago exitosamente tomando el monto automáticamente del total_estimado', async () => {
  // ARRANGE
  // Crear orden de servicio en estado "Pendiente de Pago" con total_estimado
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 500000.00
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Tarjeta"
    // ⚠️ NO se envía monto - se toma automáticamente
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.data.payment).toBeDefined();
  expect(resultado.data.payment.monto).toBe(500000.00); // Debe coincidir con total_estimado
  expect(resultado.data.payment.metodo_pago).toBe("Tarjeta");
  expect(resultado.data.payment.estado).toBe("Pagado");
  expect(resultado.data.payment.fecha_pago).toBeDefined();
  expect(resultado.data.payment.numero_comprobante).toMatch(/^RC-\d{6}-\d+$/);
  expect(resultado.data.payment.transaction_id).toBeDefined();
  expect(resultado.data.solicitud_activada).toBe(true); // La solicitud debe activarse
});
```

#### Test 2: Procesar pago exitosamente con monto válido

```javascript
test('debe procesar pago exitosamente cuando el monto coincide exactamente con total_estimado', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 1500000.00
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Transferencia bancaria",
    monto: 1500000.00 // ⚠️ Debe coincidir EXACTAMENTE
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.data.payment.monto).toBe(1500000.00);
  expect(resultado.data.solicitud_activada).toBe(true);
});
```

#### Test 3: Rechazar pago si el monto no coincide con total_estimado

```javascript
test('debe rechazar pago si el monto no coincide exactamente con total_estimado', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 1500000.00
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Transferencia bancaria",
    monto: 1500000.01 // ⚠️ Diferencia mínima
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('monto');
  expect(resultado.error.mensaje).toContain('coincidir');
  expect(resultado.error.mensaje).toContain('total_estimado');
});
```

#### Test 4: Validar campos requeridos

```javascript
test('debe rechazar procesamiento de pago sin campos requeridos', async () => {
  // ARRANGE - Sin orden_id
  const datosPagoIncompleto1 = {
    metodo_pago: "Tarjeta"
    // Falta: orden_id
  };

  // ACT
  const resultado1 = await procesarPago(datosPagoIncompleto1);

  // ASSERT
  expect(resultado1.success).toBe(false);
  expect(resultado1.error.mensaje).toContain('orden_id');

  // ARRANGE - Sin metodo_pago
  const datosPagoIncompleto2 = {
    orden_id: 1
    // Falta: metodo_pago
  };

  // ACT
  const resultado2 = await procesarPago(datosPagoIncompleto2);

  // ASSERT
  expect(resultado2.success).toBe(false);
  expect(resultado2.error.mensaje).toContain('metodo_pago');
});
```

#### Test 5: Validar que el monto sea mayor a cero (si se proporciona)

```javascript
test('debe rechazar pago con monto menor o igual a cero', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 1500000.00
  });

  const montosInvalidos = [0, -100, -0.01];

  for (const monto of montosInvalidos) {
    const datosPago = {
      orden_id: ordenId,
      metodo_pago: "Transferencia bancaria",
      monto: monto
    };

    // ACT
    const resultado = await procesarPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(false);
    expect(resultado.error.mensaje).toContain('monto');
    expect(resultado.error.mensaje).toContain('mayor');
  }
});
```

#### Test 6: Validar que la orden de servicio exista

```javascript
test('debe rechazar pago con orden de servicio inexistente', async () => {
  // ARRANGE
  const idOrdenInexistente = 99999;
  const datosPago = {
    orden_id: idOrdenInexistente,
    metodo_pago: "Tarjeta"
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('orden');
  expect(resultado.error.mensaje).toContain('no encontrada');
});
```

#### Test 7: Validar que la orden esté en estado "Pendiente de Pago"

```javascript
test('debe rechazar pago si la orden no está en estado "Pendiente de Pago"', async () => {
  // ARRANGE - Orden ya pagada
  const ordenIdPagada = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Solicitud Recibida", // Ya activada
    total_estimado: 1500000.00
  });

  const datosPago = {
    orden_id: ordenIdPagada,
    metodo_pago: "Tarjeta"
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('estado');
  expect(resultado.error.mensaje).toContain('Pendiente de Pago');
});
```

#### Test 8: Validar métodos de pago permitidos

```javascript
test('debe aceptar solo métodos de pago válidos', async () => {
  // ARRANGE
  const metodosValidos = [
    "Transferencia bancaria",
    "Transferencia",
    "Tarjeta de crédito",
    "Tarjeta",
    "Efectivo",
    "Cheque"
  ];
  const metodoInvalido = "Método Inexistente";

  // Test con métodos válidos
  for (const metodo of metodosValidos) {
    const ordenId = await crearOrdenServicio({
      servicio_id: 1,
      estado: "Pendiente de Pago",
      total_estimado: 1500000.00
    });

    const datosPago = {
      orden_id: ordenId,
      metodo_pago: metodo
    };

    // ACT
    const resultado = await procesarPago(datosPago);

    // ASSERT
    expect(resultado.success).toBe(true);
    expect(resultado.data.payment.metodo_pago).toBe(metodo);
  }

  // Test con método inválido
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 1500000.00
  });

  const datosPagoInvalido = {
    orden_id: ordenId,
    metodo_pago: metodoInvalido
  };

  // ACT
  const resultado = await procesarPago(datosPagoInvalido);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('método de pago');
});
```

#### Test 9: Validar que la solicitud se active automáticamente

```javascript
test('debe activar automáticamente la solicitud después del pago exitoso', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 500000.00,
    proceso_actual: null // No tiene proceso activo
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Tarjeta"
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.data.solicitud_activada).toBe(true);
  
  // Verificar que la orden cambió de estado
  const ordenActualizada = await obtenerOrdenServicio(ordenId);
  expect(ordenActualizada.estado).not.toBe("Pendiente de Pago");
  expect(ordenActualizada.proceso_actual).toBeDefined(); // Debe tener un proceso activo
  expect(ordenActualizada.proceso_actual).toBe(ordenActualizada.servicio.primer_estado);
});
```

#### Test 10: Validar generación automática de numero_comprobante

```javascript
test('debe generar automáticamente numero_comprobante con formato RC-YYYYMM-XXXX', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 500000.00
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Tarjeta"
  };

  // ACT
  const resultado = await procesarPago(datosPago);

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.data.payment.numero_comprobante).toBeDefined();
  expect(resultado.data.payment.numero_comprobante).toMatch(/^RC-\d{6}-\d+$/);
  
  // Verificar formato: RC-YYYYMM-XXXX
  const partes = resultado.data.payment.numero_comprobante.split('-');
  expect(partes[0]).toBe('RC');
  expect(partes[1].length).toBe(6); // YYYYMM
  expect(partes[2].length).toBeGreaterThan(0); // Número secuencial
});
```

#### Test 11: Validar generación automática de fecha_pago

```javascript
test('debe establecer automáticamente fecha_pago cuando el pago se procesa', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 500000.00
  });

  const datosPago = {
    orden_id: ordenId,
    metodo_pago: "Tarjeta"
  };

  const fechaAntes = new Date();

  // ACT
  const resultado = await procesarPago(datosPago);

  const fechaDespues = new Date();

  // ASSERT
  expect(resultado.success).toBe(true);
  expect(resultado.data.payment.fecha_pago).toBeDefined();
  
  const fechaPago = new Date(resultado.data.payment.fecha_pago);
  expect(fechaPago.getTime()).toBeGreaterThanOrEqual(fechaAntes.getTime());
  expect(fechaPago.getTime()).toBeLessThanOrEqual(fechaDespues.getTime());
  
  // Verificar formato ISO
  expect(resultado.data.payment.fecha_pago).toMatch(/^\d{4}-\d{2}-\d{2}/);
});
```

#### Test 12: Validar que no se pueda pagar dos veces la misma orden

```javascript
test('debe rechazar pago de una orden que ya fue pagada', async () => {
  // ARRANGE
  const ordenId = await crearOrdenServicio({
    servicio_id: 1,
    estado: "Pendiente de Pago",
    total_estimado: 500000.00
  });

  // Primer pago exitoso
  const datosPago1 = {
    orden_id: ordenId,
    metodo_pago: "Tarjeta"
  };
  await procesarPago(datosPago1);

  // Intentar segundo pago
  const datosPago2 = {
    orden_id: ordenId,
    metodo_pago: "Efectivo"
  };

  // ACT
  const resultado = await procesarPago(datosPago2);

  // ASSERT
  expect(resultado.success).toBe(false);
  expect(resultado.error.mensaje).toContain('ya pagada');
  expect(resultado.error.mensaje).toContain('pagado');
});
```

---

## 📝 ESTRUCTURA DE ARCHIVOS DE PRUEBA

```
tests/
├── unit/
│   ├── services/
│   │   ├── authApiService.test.js      # Tests del servicio de autenticación
│   │   └── paymentApiService.test.js   # Tests del servicio de pagos
│   ├── utils/
│   │   ├── passwordValidator.test.js   # Tests del validador de contraseñas
│   │   └── sanitizer.test.js           # Tests del sanitizador
│   └── helpers/
│       ├── test-data.js                # Datos de prueba reutilizables
│       ├── mocks.js                    # Mocks de servicios
│       └── assertions.js               # Funciones de aserción personalizadas
├── integration/
│   ├── registro-completo.test.js       # Pruebas de flujo completo de registro
│   └── pago-completo.test.js           # Pruebas de flujo completo de pago
└── setup/
    ├── jest.config.js                  # Configuración de Jest
    └── test-db.js                      # Configuración de BD de prueba
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración Inicial
- [ ] Instalar dependencias de testing (Jest, Supertest, etc.)
- [ ] Configurar Jest en `jest.config.js`
- [ ] Configurar base de datos de prueba
- [ ] Crear archivos de setup y teardown
- [ ] Configurar mocks necesarios (apiService, localStorage, fetch)

### Pruebas de Registro de Usuario
- [ ] Test: Crear usuario exitosamente
- [ ] Test: Validar campos requeridos
- [ ] Test: Validar formato de correo
- [ ] Test: Validar fortaleza de contraseña (casos básicos)
- [ ] Test: Validar longitud máxima de contraseña (128 caracteres)
- [ ] Test: Validar contraseñas comunes bloqueadas
- [ ] Test: Validar unicidad de documento
- [ ] Test: Validar unicidad de correo
- [ ] Test: Validar tipos de documento (CC, CE, TI, RC, NIT, PAS)
- [ ] Test: Validar roles válidos (dinámico - existe y activo)
- [ ] Test: Validar formato de teléfono
- [ ] Test: Validar política de privacidad (frontend)
- [ ] Test: Validar confirmación de contraseña (frontend)

### Pruebas de Procesamiento de Pago
- [ ] Test: Procesar pago exitosamente sin monto (monto automático)
- [ ] Test: Procesar pago exitosamente con monto válido
- [ ] Test: Rechazar pago si monto no coincide con total_estimado
- [ ] Test: Validar campos requeridos (orden_id, metodo_pago)
- [ ] Test: Validar monto mayor a cero (si se proporciona)
- [ ] Test: Validar existencia de orden de servicio
- [ ] Test: Validar que orden esté en estado "Pendiente de Pago"
- [ ] Test: Validar métodos de pago permitidos
- [ ] Test: Validar activación automática de solicitud
- [ ] Test: Validar generación automática de numero_comprobante
- [ ] Test: Validar generación automática de fecha_pago
- [ ] Test: Validar que no se pueda pagar dos veces

### Calidad del Código
- [ ] Cobertura de código >= 80%
- [ ] Todas las pruebas pasan
- [ ] Documentación de pruebas
- [ ] Refactorización de código duplicado
- [ ] Uso de datos de prueba reutilizables

---

## 🎯 RESULTADO ESPERADO

Al finalizar, debes tener:

1. **Suite completa de pruebas unitarias** que cubra todos los casos mencionados
2. **Cobertura de código** superior al 80%
3. **Documentación clara** de cada prueba
4. **Código limpio y mantenible** siguiendo las mejores prácticas
5. **Datos de prueba reutilizables** para evitar duplicación
6. **Mocks apropiados** para servicios externos y base de datos
7. **Tests que reflejen la implementación real** del sistema

---

## 📚 NOTAS ADICIONALES

- Usa **describe** para agrupar pruebas relacionadas
- Usa **test** o **it** para casos individuales
- Sigue el patrón **AAA** (Arrange-Act-Assert)
- Usa nombres descriptivos para las pruebas
- Mantén las pruebas independientes entre sí
- Usa mocks para servicios externos
- Limpia los datos después de cada prueba
- Documenta casos edge y límites
- **Importante**: Las pruebas deben reflejar el comportamiento REAL del sistema, no un comportamiento idealizado

---

## 🚀 COMANDOS PARA EJECUTAR PRUEBAS

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch

# Ejecutar pruebas con cobertura
npm test -- --coverage

# Ejecutar pruebas específicas
npm test -- registro-usuario.test.js
npm test -- procesamiento-pago.test.js

# Ejecutar pruebas en modo verbose
npm test -- --verbose

# Ejecutar pruebas en un archivo específico
npm test -- authApiService.test.js
```

---

## 📖 REFERENCIAS

- **Documentación de la API**: Ver `documentacion api.md`
- **Análisis del Prompt**: Ver `docs/ANALISIS_PROMPT_PRUEBAS_UNITARIAS.md`
- **Servicio de Autenticación**: `src/features/auth/services/authApiService.js`
- **Validador de Contraseñas**: `src/shared/utils/passwordValidator.js`

---

**¡IMPORTANTE!** Este prompt está actualizado según el análisis realizado en Enero 2026 y refleja la implementación real del proyecto Registrack. Sigue este prompt paso a paso, asegurando que cada prueba esté bien documentada y siga las mejores prácticas de testing con Jest.
