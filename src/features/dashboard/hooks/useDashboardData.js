import { useState, useEffect, useCallback } from 'react';
import dashboardApiService from '../services/dashboardApiService';
import { PERIODO_DEFECTO } from '../shared/periodos';

/**
 * Hook personalizado para obtener datos del dashboard
 * @param {string} endpoint - Nombre del endpoint a llamar ('ingresos', 'servicios', 'resumen', 'pendientes', 'inactivas', 'renovaciones')
 * @param {object} params - Parámetros para la petición (periodo, format, etc.)
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente al montar el componente
 * @returns {object} { data, loading, error, refetch, updateParams }
 */
export const useDashboardData = (endpoint, params = {}, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [currentParams, setCurrentParams] = useState(params);

  // Función para obtener los datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      switch (endpoint) {
        case 'ingresos':
          result = await dashboardApiService.getIngresos(currentParams.periodo || PERIODO_DEFECTO);
          break;
        case 'servicios':
          result = await dashboardApiService.getServicios(currentParams.periodo || PERIODO_DEFECTO);
          break;
        case 'resumen':
          result = await dashboardApiService.getResumen(currentParams.periodo || PERIODO_DEFECTO);
          break;
        case 'pendientes':
          result = await dashboardApiService.getPendientes(currentParams.format || 'json');
          break;
        case 'inactivas':
          result = await dashboardApiService.getInactivas(currentParams.format || 'json');
          break;
        case 'renovaciones':
          result = await dashboardApiService.getRenovacionesProximas(currentParams.format || 'json');
          break;
        default:
          throw new Error(`Endpoint no válido: ${endpoint}`);
      }

      if (result.success) {
        // El servicio dashboardApiService devuelve {success: true, data: {...}}
        // donde data es directamente el objeto de datos de la API
        // Por lo tanto, result.data ya contiene los datos que necesitamos
        const dataToSet = result.data;
        
        console.log('✅ [useDashboardData] Datos establecidos para endpoint:', endpoint);
        console.log('✅ [useDashboardData] Tipo de datos:', typeof dataToSet);
        console.log('✅ [useDashboardData] ¿Es array?', Array.isArray(dataToSet));
        if (dataToSet && typeof dataToSet === 'object') {
          console.log('✅ [useDashboardData] Claves de datos:', Object.keys(dataToSet));
        }
        
        setData(dataToSet);
        setError(null);
      } else {
        setError(result.message || 'Error al obtener los datos');
        setData(null);
        
        // Si requiere autenticación, el servicio ya maneja la redirección
        if (result.requiresAuth) {
          console.warn('⚠️ [useDashboardData] Requiere autenticación');
        }
      }
    } catch (err) {
      console.error('💥 [useDashboardData] Error:', err);
      setError(err.message || 'Error al obtener los datos');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentParams]);

  // Efecto para obtener datos automáticamente
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, currentParams, autoFetch]);

  // Función para refrescar los datos
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Función para actualizar parámetros y refrescar
  const updateParams = useCallback((newParams) => {
    setCurrentParams(prev => ({ ...prev, ...newParams }));
    // Los datos se refrescarán automáticamente por el useEffect
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    updateParams
  };
};

/**
 * Hook específico para obtener ingresos del dashboard
 * @param {string} periodo - Periodo de análisis (6meses, 12meses, custom)
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente
 * @returns {object} { data, loading, error, refetch, updatePeriodo }
 */
export const useDashboardIngresos = (periodo = PERIODO_DEFECTO, autoFetch = true) => {
  const { data, loading, error, refetch, updateParams } = useDashboardData(
    'ingresos',
    { periodo },
    autoFetch
  );

  const updatePeriodo = useCallback((newPeriodo) => {
    updateParams({ periodo: newPeriodo });
  }, [updateParams]);

  return {
    data,
    loading,
    error,
    refetch,
    updatePeriodo
  };
};

/**
 * Hook específico para obtener servicios del dashboard
 * @param {string} periodo - Periodo de análisis (6meses, 12meses, custom)
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente
 * @returns {object} { data, loading, error, refetch, updatePeriodo }
 */
export const useDashboardServicios = (periodo = PERIODO_DEFECTO, autoFetch = true) => {
  const { data, loading, error, refetch, updateParams } = useDashboardData(
    'servicios',
    { periodo },
    autoFetch
  );

  const updatePeriodo = useCallback((newPeriodo) => {
    updateParams({ periodo: newPeriodo });
  }, [updateParams]);

  return {
    data,
    loading,
    error,
    refetch,
    updatePeriodo
  };
};

/**
 * Hook específico para obtener resumen del dashboard
 * @param {string} periodo - Periodo de análisis (6meses, 12meses, custom)
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente
 * @returns {object} { data, loading, error, refetch, updatePeriodo }
 */
export const useDashboardResumen = (periodo = PERIODO_DEFECTO, autoFetch = true) => {
  const { data, loading, error, refetch, updateParams } = useDashboardData(
    'resumen',
    { periodo },
    autoFetch
  );

  const updatePeriodo = useCallback((newPeriodo) => {
    updateParams({ periodo: newPeriodo });
  }, [updateParams]);

  return {
    data,
    loading,
    error,
    refetch,
    updatePeriodo
  };
};

/**
 * Hook específico para obtener solicitudes inactivas
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente
 * @returns {object} { data, loading, error, refetch }
 */
export const useDashboardInactivas = (autoFetch = true) => {
  return useDashboardData('inactivas', { format: 'json' }, autoFetch);
};

/**
 * Hook específico para obtener renovaciones próximas
 * @param {boolean} autoFetch - Si debe obtener los datos automáticamente
 * @returns {object} { data, loading, error, refetch }
 */
export const useDashboardRenovaciones = (autoFetch = true) => {
  return useDashboardData('renovaciones', { format: 'json' }, autoFetch);
};

export default useDashboardData;

