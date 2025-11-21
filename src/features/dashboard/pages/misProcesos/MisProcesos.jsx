import React, { useEffect, useState, useMemo } from 'react';
import NavBarLanding from '../../../landing/components/landingNavbar.jsx';
import { useAuth } from '../../../../shared/contexts/authContext';
import ProcesosActivos from './components/ProcesosActivos.jsx';
import HistorialProcesos from './components/HistorialProcesos.jsx';
import { PagosPendientesSection } from './components/PagosPendientesCard.jsx';
import { getSolicitudesUsuario, filtrarProcesos, obtenerServicios } from './services/procesosService.js';
import { useSalesSync } from '../../../../utils/hooks/useAsyncDataSync.js';

const MisProcesos = () => {
  const { user } = useAuth();
  
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState(null);
  const [vistaHistorial, setVistaHistorial] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");
  const [servicioFiltro, setServicioFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [busquedaActivos, setBusquedaActivos] = useState("");
  const [servicioFiltroActivos, setServicioFiltroActivos] = useState('Todos');
  const [estadoFiltroActivos, setEstadoFiltroActivos] = useState('Todos');

  // Estabilizar la función dataFetcher para evitar bucles infinitos
  const dataFetcher = useMemo(() => {
    return async () => {
      console.log('🔧 [MisProcesos] dataFetcher ejecutado');
      console.log('🔧 [MisProcesos] user:', user);
      
      // El usuario puede tener 'email' o 'correo' según el backend
      const email = user?.email || user?.correo;
      console.log('🔧 [MisProcesos] Email del usuario:', email);
      
      if (user && email) {
        console.log('🔧 [MisProcesos] Llamando getSolicitudesUsuario con email:', email);
        try {
          const resultado = await getSolicitudesUsuario(email);
          console.log('✅ [MisProcesos] getSolicitudesUsuario devolvió:', resultado?.length || 0, 'solicitudes');
          return resultado;
        } catch (error) {
          console.error('❌ [MisProcesos] Error en getSolicitudesUsuario:', error);
          return [];
        }
      }
      console.log('⚠️ [MisProcesos] No hay user o email, devolviendo array vacío');
      return [];
    };
  }, [user?.email, user?.correo, user]);

  // Obtener email del usuario (puede ser 'email' o 'correo')
  const userEmail = user?.email || user?.correo;
  
  // Usar hook de sincronización para procesos del usuario
  const [procesos, refreshProcesos, loading, lastUpdate, errorProcesos] = useSalesSync(
    dataFetcher,
    [userEmail]
  );

  // Cargar servicios desde API
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        console.log('🔧 [MisProcesos] Cargando servicios...');
        const serviciosAPI = await obtenerServicios();
        setServicios(serviciosAPI);
        console.log(`✅ [MisProcesos] Servicios cargados:`, serviciosAPI.length);
      } catch (err) {
        console.error('❌ [MisProcesos] Error cargando servicios:', err);
        // No establecer error, solo dejar array vacío - el servicio ya maneja el fallback
        setServicios([]);
      }
    };
    cargarServicios();
  }, []); // Solo cargar una vez al montar el componente

  // Debug: Log de procesos recibidos (DEBE estar antes de los returns condicionales)
  useEffect(() => {
    if (Array.isArray(procesos)) {
      console.log('📊 [MisProcesos] Estado actual:');
      console.log('  - Total de procesos:', procesos.length);
      console.log('  - Procesos (primeros 3):', procesos.slice(0, 3));
      console.log('  - Servicios cargados:', servicios.length);
      console.log('  - Loading:', loading);
      console.log('  - Error:', errorProcesos);
    }
  }, [procesos, servicios, loading, errorProcesos]);

  if (!user) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center text-red-600 font-bold">Debes iniciar sesión para ver tus procesos.</div>
      </>
    );
  }

  // Mostrar indicador de carga mientras se cargan los procesos
  if (loading) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando tus procesos...</p>
        </div>
      </>
    );
  }

  // Mostrar error si hay problemas cargando los procesos
  if (errorProcesos) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center">
          <div className="text-red-600">
            <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
            <p className="font-bold text-lg">Error al cargar tus procesos</p>
            <p className="text-sm mt-2 text-gray-600">
              {errorProcesos.message || 'Por favor, intenta recargar la página.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center text-red-600 font-bold">{error}</div>
      </>
    );
  }

  if (!Array.isArray(procesos)) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center text-red-600 font-bold">
          Error al cargar tus procesos. Intenta recargar la página.
        </div>
      </>
    );
  }

  // Procesos filtrados (pasar servicios para usar estados dinámicos)
  const procesosActivos = filtrarProcesos(procesos, false, servicios);
  const procesosHistorial = filtrarProcesos(procesos, true, servicios);
  
  console.log('📊 [MisProcesos] Filtrado de procesos:');
  console.log(`  - Total procesos: ${procesos.length}`);
  console.log(`  - Procesos activos: ${procesosActivos.length}`);
  console.log(`  - Procesos en historial: ${procesosHistorial.length}`);

  // Procesos filtrados activos con filtros
  const serviciosActivos = ['Todos', ...Array.from(new Set(procesosActivos.map(p => p.tipoSolicitud)))];
  const estadosActivos = ['Todos', ...Array.from(new Set(procesosActivos.map(p => p.estado)))];
  const procesosActivosFiltrados = procesosActivos.filter(proc =>
    (servicioFiltroActivos === 'Todos' || proc.tipoSolicitud === servicioFiltroActivos) &&
    (
      proc.nombreMarca?.toLowerCase().includes(busquedaActivos.toLowerCase()) ||
      proc.expediente?.toLowerCase().includes(busquedaActivos.toLowerCase()) ||
      proc.tipoSolicitud?.toLowerCase().includes(busquedaActivos.toLowerCase())
    )
  );

  return (
    <>
      <NavBarLanding />
      <div className="w-full py-8 px-4 pt-3 md:pt-28">
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded font-semibold transition-all ${!vistaHistorial ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setVistaHistorial(false)}
          >
            Procesos Activos
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold transition-all ${vistaHistorial ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setVistaHistorial(true)}
          >
            Historial
          </button>
        </div>
        {vistaHistorial ? (
          <HistorialProcesos
            procesos={procesosHistorial}
            servicios={servicios}
            servicioFiltro={servicioFiltro}
            estadoFiltro={estadoFiltro}
            busquedaHistorial={busquedaHistorial}
            onChangeServicio={setServicioFiltro}
            onChangeEstado={setEstadoFiltro}
            onChangeBusqueda={setBusquedaHistorial}
          />
        ) : (
          <>
            {/* ✅ NUEVO: Sección de Pagos Pendientes */}
            <PagosPendientesSection 
              procesos={procesos} 
              servicios={servicios}
              onRefresh={refreshProcesos}
            />

            <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 w-full">
              {/* Buscador */}
              <div className="relative w-full md:w-80 flex-shrink-0">
                <span className="absolute left-3 top-2.5 text-gray-400"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  placeholder="Buscar"
                  className="pl-9 pr-3 py-3 w-full text-base border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 bg-white shadow-md"
                  value={busquedaActivos}
                  onChange={e => setBusquedaActivos(e.target.value)}
                />
              </div>
              {/* Select Servicio */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <label className="text-sm text-gray-500" htmlFor="select-servicio-activos">Servicio:</label>
                <select
                  id="select-servicio-activos"
                  value={servicioFiltroActivos}
                  onChange={e => setServicioFiltroActivos(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-blue-300 text-base font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                >
                  {serviciosActivos.map(servicio => (
                    <option key={servicio} value={servicio}>{servicio}</option>
                  ))}
                </select>
              </div>
            </div>
            {procesosActivosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                {procesos.length === 0 ? (
                  <div>
                    <i className="bi bi-inbox text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600 text-lg font-medium mb-2">No tienes procesos registrados</p>
                    <p className="text-gray-400 text-sm">Cuando crees una solicitud, aparecerá aquí.</p>
                    <div className="mt-4 text-xs text-gray-500">
                      <p>Debug: {procesos.length} procesos totales, {procesosActivos.length} activos</p>
                      <p>Servicios cargados: {servicios.length}</p>
                      {errorProcesos && <p className="text-red-500">Error: {errorProcesos.message}</p>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <i className="bi bi-funnel text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600 text-lg font-medium mb-2">No se encontraron procesos con los filtros aplicados</p>
                    <p className="text-gray-400 text-sm">Intenta cambiar los filtros de búsqueda.</p>
                    <div className="mt-4 text-xs text-gray-500">
                      <p>Debug: {procesos.length} procesos totales, {procesosActivos.length} activos, {procesosActivosFiltrados.length} filtrados</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ProcesosActivos procesos={procesosActivosFiltrados} servicios={servicios} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MisProcesos; 