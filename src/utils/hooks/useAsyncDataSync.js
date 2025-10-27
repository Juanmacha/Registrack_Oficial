import { useState, useEffect, useCallback } from "react";

/**
 * Hook personalizado para sincronizar datos asíncronos entre componentes
 * @param {Function} dataFetcher - Función asíncrona para obtener los datos actualizados
 * @param {Array} dependencies - Dependencias adicionales para el useEffect
 * @returns {Array} [data, refreshData, loading, lastUpdate] - Datos actuales, función para refrescar, estado de carga y timestamp
 */
export const useAsyncDataSync = (dataFetcher, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(null);

  // Función para cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔧 [useAsyncDataSync] Cargando datos...');
      
      const newData = await dataFetcher();
      setData(newData);
      setLastUpdate(Date.now());
      console.log('✅ [useAsyncDataSync] Datos cargados:', newData.length);
    } catch (err) {
      console.error('❌ [useAsyncDataSync] Error cargando datos:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dataFetcher]);

  // Función para refrescar datos manualmente
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Efecto para cargar datos cuando cambian las dependencias
  useEffect(() => {
    console.log('🔧 [useAsyncDataSync] Dependencias cambiaron, recargando datos...', dependencies);
    loadData();
  }, dependencies);

  return [data, refreshData, loading, lastUpdate, error];
};

/**
 * Hook específico para sincronizar procesos de usuario
 * @param {Function} dataFetcher - Función asíncrona para obtener procesos
 * @param {Array} dependencies - Dependencias adicionales
 * @returns {Array} [procesos, refreshProcesos, loading, lastUpdate, error]
 */
export const useSalesSync = (dataFetcher, dependencies = []) => {
  return useAsyncDataSync(dataFetcher, dependencies);
};
