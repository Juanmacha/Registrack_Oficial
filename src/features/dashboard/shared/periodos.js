/**
 * Configuración de períodos disponibles para el dashboard
 * Este archivo centraliza la configuración de períodos para que sea fácil de actualizar
 */

export const PERIODOS_DISPONIBLES = [
  // Períodos cortos (análisis detallados)
  { label: "1 Mes", value: "1mes", tipo: "corto", descripcion: "Último mes" },
  { label: "3 Meses", value: "3meses", tipo: "corto", descripcion: "Último trimestre" },
  { label: "6 Meses", value: "6meses", tipo: "medio", descripcion: "Último semestre" },
  
  // Períodos medianos
  { label: "12 Meses", value: "12meses", tipo: "medio", descripcion: "Último año" },
  { label: "18 Meses", value: "18meses", tipo: "medio", descripcion: "Últimos 18 meses" },
  
  // Períodos largos (análisis históricos)
  { label: "2 Años", value: "2anos", tipo: "largo", descripcion: "Últimos 2 años" },
  { label: "3 Años", value: "3anos", tipo: "largo", descripcion: "Últimos 3 años" },
  { label: "5 Años", value: "5anos", tipo: "largo", descripcion: "Últimos 5 años" },
  
  // Período completo
  { label: "Todos", value: "todo", tipo: "completo", descripcion: "Todos los datos disponibles" }
];

// Período por defecto
export const PERIODO_DEFECTO = "12meses";

// Períodos por categoría (útil para agrupar en la UI)
export const PERIODOS_POR_CATEGORIA = {
  cortos: PERIODOS_DISPONIBLES.filter(p => p.tipo === "corto"),
  medios: PERIODOS_DISPONIBLES.filter(p => p.tipo === "medio"),
  largos: PERIODOS_DISPONIBLES.filter(p => p.tipo === "largo"),
  completo: PERIODOS_DISPONIBLES.filter(p => p.tipo === "completo")
};

// Función para obtener el label de un período por su value
export const obtenerLabelPeriodo = (value) => {
  const periodo = PERIODOS_DISPONIBLES.find(p => p.value === value);
  return periodo ? periodo.label : value;
};

// Función para validar si un período es válido
export const esPeriodoValido = (value) => {
  return PERIODOS_DISPONIBLES.some(p => p.value === value);
};

// Función para obtener períodos por tipo
export const obtenerPeriodosPorTipo = (tipo) => {
  return PERIODOS_DISPONIBLES.filter(p => p.tipo === tipo);
};

export default PERIODOS_DISPONIBLES;

