import React, { useState, useEffect } from 'react';
import { mockDataService } from '../../../../../utils/mockDataService';
import {
  toggleVisibilidadServicio,
  updateLandingData,
  updateProcessStates,
} from '../services/serviciosManagementService';
import serviciosApiService from '../services/serviciosApiService';
import ModalVerDetalleServicio from './ModalVerDetalleServicio';
import ModalEditarServicio from './ModalEditarServicio';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../../shared/contexts/authContext';

const Servicios = () => {
  const { getToken } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [editar, setEditar] = useState(null);


  const cargarServicios = async () => {
    setLoading(true);
    try {
      console.log('🔧 [Servicios] Cargando servicios desde la API...');
      
      const serviciosAPI = await serviciosApiService.getServicios();
      console.log('✅ [Servicios] Servicios cargados desde API:', serviciosAPI.length);
      console.log('📊 [Servicios] Estado de visibilidad de los servicios:', serviciosAPI.map(s => ({ id: s.id, nombre: s.nombre, visible: s.visible_en_landing })));
      
      // Log específico para verificar process_states del servicio 1
      const servicio1 = serviciosAPI.find(s => s.id === '1');
      if (servicio1) {
        console.log('🔍 [DEBUG] Servicio 1 después de recarga:');
        console.log('  - Process states:', servicio1.process_states);
        console.log('  - Cantidad de process states:', servicio1.process_states?.length);
        console.log('  - Último process state:', servicio1.process_states?.[servicio1.process_states?.length - 1]);
        
        // Verificar si los process_states persisten correctamente
        if (servicio1.process_states?.length > 0) {
          console.log('✅ [DEBUG] ¡Persistencia correcta! Process states se mantienen después de la recarga');
          console.log('✅ [DEBUG] Backend funcionando correctamente - Process states cargados desde la base de datos');
        } else {
          console.log('⚠️ [DEBUG] Process states no persisten correctamente después de la recarga');
        }
      }
      
      setServicios(serviciosAPI);
      
    } catch (error) {
      console.error('❌ [Servicios] Error cargando servicios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "No se pudieron cargar los servicios. Por favor, inténtelo de nuevo.",
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleToggleVisibilidad = async (id) => {
    const servicio = servicios.find(s => s.id === id);
    if (!servicio) return;
    
    const nuevaVisibilidad = !servicio.visible_en_landing;
    const accion = nuevaVisibilidad ? "mostrar" : "ocultar";
    
    const result = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} servicio?`,
      text: nuevaVisibilidad 
        ? "¿Estás seguro que deseas mostrar este servicio en la página principal? Será visible para los usuarios."
        : "¿Estás seguro que deseas ocultar este servicio de la página principal? No será visible para los usuarios.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: nuevaVisibilidad ? "#28a745" : "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar"
    });
    
      if (!result.isConfirmed) return;
    try {
      const token = getToken();
      console.log('🔑 [Servicios] Token disponible:', token ? 'Sí' : 'No');
      if (token) {
        console.log(`🔧 [Servicios] Cambiando visibilidad del servicio ${id} via API...`);
        console.log('🔑 [Servicios] Token enviado:', token.substring(0, 20) + '...');
        const nuevaVisibilidad = !servicio.visible_en_landing;
        
        // Actualización optimista del estado local
        setServicios(prevServicios => 
          prevServicios.map(s => 
            s.id === id ? { ...s, visible_en_landing: nuevaVisibilidad } : s
          )
        );
        
        const resultado = await serviciosApiService.toggleVisibilidadServicio(id, nuevaVisibilidad, token);
        console.log('✅ [Servicios] Visibilidad actualizada via API:', resultado);
        
        // Actualización optimista del estado local
        setServicios(prevServicios => 
          prevServicios.map(s => 
            s.id === id ? { ...s, visible_en_landing: nuevaVisibilidad } : s
          )
        );
        
        // Detectar el tipo de respuesta
        if (resultado.message && resultado.message.includes('No hay cambios necesarios')) {
          console.log('ℹ️ [Servicios] No hay cambios necesarios');
          Swal.fire({
            icon: 'info',
            title: 'Sin cambios',
            text: "El servicio ya tiene el estado de visibilidad deseado.",
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-500',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#3b82f6] hover:bg-[#2563eb] border border-[#3b82f6] text-white'
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: "El estado de visibilidad del servicio ha sido actualizado.",
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
            }
          });
        }
        
        console.log('🔄 [Servicios] Recargando servicios después del cambio...');
        await cargarServicios();
        
        // Notificar a la landing page que los servicios han cambiado
        window.dispatchEvent(new CustomEvent('servicios_updated'));
      } else {
        console.log(`⚠️ [Servicios] No hay token, usando método mock para servicio ${id}...`);
        const nuevaVisibilidad = !servicio.visible_en_landing;
        
        // Actualización optimista del estado local
        setServicios(prevServicios => 
          prevServicios.map(s => 
            s.id === id ? { ...s, visible_en_landing: nuevaVisibilidad } : s
          )
        );
        
      await Promise.resolve(toggleVisibilidadServicio(id));
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: "El estado de visibilidad del servicio ha sido actualizado.",
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
          }
        });
        console.log('🔄 [Servicios] Recargando servicios después del cambio (mock)...');
        await cargarServicios();
      }
    } catch (err) {
      console.error('❌ [Servicios] Error cambiando visibilidad:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "No se pudo cambiar la visibilidad del servicio. Por favor, inténtelo de nuevo.",
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    }
  };

  const handleEditar = (servicio) => setEditar(servicio);
  const handleVerDetalle = (servicio) => setDetalle(servicio);

  const handleGuardarEdicion = async (tipo, data) => {
    if (!editar) return;
    try {
      const token = getToken();
      
      console.log(`🔧 [Servicios] Actualizando servicio ${editar.id} via API (tipo: ${tipo})...`);
      console.log('🔍 [DEBUG] Tipo de edición:', tipo);
      console.log('🔍 [DEBUG] Datos recibidos:', data);
      console.log('🔍 [DEBUG] Estructura de datos:', JSON.stringify(data, null, 2));
      console.log('🔍 [DEBUG] Servicio a editar:', editar);
      
      if (token) {
        console.log('🔑 [Servicios] Token disponible:', token ? 'Sí' : 'No');
        
        try {
          if (tipo === 'landing') {
            console.log('🔧 [Servicios] Ejecutando updateLandingData...');
            await serviciosApiService.updateLandingData(editar.id, data, token);
          } else if (tipo === 'process') {
            console.log('🔧 [Servicios] Ejecutando updateProcessStates...');
            await serviciosApiService.updateProcessStates(editar.id, data, token);
          }
          
          console.log('✅ [Servicios] Servicio actualizado via API');
          
          // Actualizar el estado local optimistamente
          setServicios(prevServicios => 
            prevServicios.map(s => 
              s.id === editar.id ? { ...s, [tipo === 'landing' ? 'landing_data' : 'process_states']: data } : s
            )
          );
          
          // Log específico para verificar actualización en UI
          console.log('🔄 [Servicios] Actualización optimística aplicada:', {
            tipo: tipo,
            servicioId: editar.id,
            campoActualizado: tipo === 'landing' ? 'landing_data' : 'process_states',
            datos: data
          });
          
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: "El servicio ha sido actualizado correctamente.",
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
            }
          });
          cargarServicios();
          
          // Notificar a la landing page que los servicios han cambiado
          window.dispatchEvent(new CustomEvent('servicios_updated'));
        } catch (apiError) {
          console.error('❌ [Servicios] Error actualizando servicio:', apiError);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "No se pudo actualizar el servicio. Por favor, inténtelo de nuevo.",
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
              title: 'text-gray-800 font-bold text-2xl mb-4',
              content: 'text-gray-600 text-base mb-6',
              confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
            }
          });
        }
      } else {
        console.log(`⚠️ [Servicios] No hay token, usando métodos mock para servicio ${editar.id}...`);
        
      if (tipo === 'landing') await Promise.resolve(updateLandingData(editar.id, data));
      if (tipo === 'process') await Promise.resolve(updateProcessStates(editar.id, data));
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: "El servicio ha sido actualizado correctamente.",
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl shadow-2xl border-t-4 border-t-blue-900',
            title: 'text-gray-800 font-bold text-2xl mb-4',
            content: 'text-gray-600 text-base mb-6',
            confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#10b981] hover:bg-[#059669] border border-[#10b981] text-white'
          }
        });
      cargarServicios();
        
        // Notificar a la landing page que los servicios han cambiado
        window.dispatchEvent(new CustomEvent('servicios_updated'));
      }
    } catch (err) {
      console.error('❌ [Servicios] Error general actualizando servicio:', err);
      console.error('🔍 [DEBUG] Error completo:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "No se pudo actualizar el servicio. Por favor, inténtelo de nuevo.",
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border-t-4 border-t-red-500',
          title: 'text-gray-800 font-bold text-2xl mb-4',
          content: 'text-gray-600 text-base mb-6',
          confirmButton: 'rounded-xl px-8 py-3 font-bold text-base bg-[#ef4444] hover:bg-[#dc2626] border border-[#ef4444] text-white'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full px-4">
        <div className="mb-6 flex items-center justify-between">
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{servicio.nombre}</h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    servicio.visible_en_landing 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {servicio.visible_en_landing ? 'Visible' : 'Oculto'}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {servicio.descripcion_corta}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleVerDetalle(servicio)}
                    className="flex-1 px-4 py-2.5 bg-blue-400/20 backdrop-blur-sm border border-blue-300/30 text-blue-700 rounded-xl hover:bg-blue-400/30 hover:border-blue-400/50 transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver
                  </button>
                  <button
                    onClick={() => handleToggleVisibilidad(servicio.id)}
                    className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm border ${
                      servicio.visible_en_landing 
                        ? 'bg-rose-400/20 border-rose-300/30 text-rose-700 hover:bg-rose-400/30 hover:border-rose-400/50' 
                        : 'bg-emerald-400/20 border-emerald-300/30 text-emerald-700 hover:bg-emerald-400/30 hover:border-emerald-400/50'
                    }`}
                  >
                    {servicio.visible_en_landing ? (
                      // Icono de ojo tachado (para ocultar)
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // Icono de ojo normal (para mostrar)
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                    {servicio.visible_en_landing ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    onClick={() => handleEditar(servicio)}
                    className="flex-1 px-4 py-2.5 bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 text-amber-700 rounded-xl hover:bg-amber-400/30 hover:border-amber-400/50 transition-all duration-300 text-sm font-medium flex items-center justify-center shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ModalVerDetalleServicio
          servicio={detalle}
          isOpen={!!detalle}
          onClose={() => setDetalle(null)}
        />
        <ModalEditarServicio
          servicio={editar}
          isOpen={!!editar}
          onClose={() => setEditar(null)}
          onSave={handleGuardarEdicion}
        />
      </div>
    </div>
  );
};

export default Servicios;
