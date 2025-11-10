const getEstadoPagoBadge = (estado) => {
  // Si el estado es un string, normalizarlo
  const estadoNormalizado = typeof estado === 'string' 
    ? estado.toLowerCase().trim() 
    : estado;

  // Mapeo de estados
  const estados = {
    // Estados completos/exitosos
    'completado': { color: "#16a34a", texto: "Completado" },
    'completo': { color: "#16a34a", texto: "Completado" },
    'verificado': { color: "#2563eb", texto: "Verificado" },
    'pagado': { color: "#16a34a", texto: "Pagado" },
    'aprobado': { color: "#16a34a", texto: "Aprobado" },
    
    // Estados pendientes
    'pendiente': { color: "#f59e0b", texto: "Pendiente" },
    'en proceso': { color: "#f59e0b", texto: "En Proceso" },
    'procesando': { color: "#f59e0b", texto: "Procesando" },
    
    // Estados fallidos
    'fallido': { color: "#dc2626", texto: "Fallido" },
    'rechazado': { color: "#dc2626", texto: "Rechazado" },
    'cancelado': { color: "#dc2626", texto: "Cancelado" },
    'anulado': { color: "#dc2626", texto: "Anulado" },
    
    // Estados booleanos (compatibilidad con datos antiguos)
    true: { color: "#16a34a", texto: "Completado" },
    false: { color: "#dc2626", texto: "Fallido" },
  };

  // Buscar el estado en el mapeo
  if (estados[estadoNormalizado]) {
    return estados[estadoNormalizado];
  }

  // Si no se encuentra, devolver estado desconocido con el estado original como texto
  return {
    color: "#6b7280", // gris
    texto: typeof estado === 'string' ? estado : "Desconocido",
  };
};

export default getEstadoPagoBadge;
