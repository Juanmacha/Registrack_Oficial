import React, { useEffect, useState, useMemo } from 'react';
import NavBarLanding from '../../../landing/components/landingNavbar.jsx';
import { useAuth } from '../../../../shared/contexts/authContext';
import ProcesosActivos from './components/ProcesosActivos.jsx';
import HistorialProcesos from './components/HistorialProcesos.jsx';
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
    return () => {
      if (user && user.email) {
        return getSolicitudesUsuario(user.email);
      }
      return [];
    };
  }, [user?.email]);

  // Usar hook de sincronización para procesos del usuario
  const [procesos, refreshProcesos, loading, lastUpdate, errorProcesos] = useSalesSync(
    dataFetcher,
    [user?.email]
  );

  useEffect(() => {
    try {
      setServicios(obtenerServicios());
    } catch (err) {
      setError('Ocurrió un error al cargar tus procesos.');
    }
  }, [user?.email]); // Solo depender del email, no del objeto user completo

  if (!user) {
    return (
      <>
        <NavBarLanding />
        <div className="pt-32 p-8 text-center text-red-600 font-bold">Debes iniciar sesión para ver tus procesos.</div>
      </>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
  }
  if (!Array.isArray(procesos)) {
    return <div className="p-8 text-center text-red-600 font-bold">Error al cargar tus procesos. Intenta recargar la página.</div>;
  }

  // Procesos filtrados
  const procesosActivos = filtrarProcesos(procesos, false);
  const procesosHistorial = filtrarProcesos(procesos, true);

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
              <div className="text-gray-400 text-center py-8">No tienes procesos registrados.</div>
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