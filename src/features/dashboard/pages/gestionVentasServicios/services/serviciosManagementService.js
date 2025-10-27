// Servicio robusto para la gestión modular de servicios
// ✅ REFACTORIZADO: Ahora usa la data mock centralizada

import { ServiceService, initializeMockData } from '../../../../../utils/mockDataService.js';

// Inicializar datos mock centralizados
initializeMockData();

// (getServicios eliminado completamente)

export function getServicioById(id) {
  return ServiceService.getById(id);
}

export function updateServicio(id, data) {
  return ServiceService.update(id, data);
}

export function toggleVisibilidadServicio(id) {
  return ServiceService.toggleVisibility(id);
}

// Métodos para landing_data
export function updateLandingData(id, landing_data) {
  return ServiceService.update(id, { landing_data });
}


// Métodos para process_states
export function updateProcessStates(id, process_states) {
  return ServiceService.update(id, { process_states });
}

export function addProcessState(id, newState) {
  const servicio = ServiceService.getById(id);
  if (servicio) {
    const process_states = [...(servicio.process_states || []), newState];
    return ServiceService.update(id, { process_states });
  }
  return false;
}

export function removeProcessState(id, stateId) {
  const servicio = ServiceService.getById(id);
  if (servicio) {
    const process_states = (servicio.process_states || []).filter(state => state.id !== stateId);
    return ServiceService.update(id, { process_states });
  }
  return false;
}

export function reorderProcessStates(id, newOrder) {
  const servicio = ServiceService.getById(id);
  if (servicio) {
    const process_states = newOrder.map((stateId, index) => {
      const state = servicio.process_states.find(s => s.id === stateId);
      return state ? { ...state, order: index + 1 } : null;
    }).filter(Boolean);
    return ServiceService.update(id, { process_states });
  }
  return false;
}
