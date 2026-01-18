import api from './api';

export const vehiclesService = {
  getVehicles: async (sessionId, schemaId) => {
    const response = await api.get('vehicles/', {
      params: { session_id: sessionId, schema_id: schemaId }
    });
    return response.data; // Возвращает { success, vehicles: [processed_info], ... }
  },

  getOnlineData: async (sessionId, schemaId, deviceIds) => {
    const response = await api.get('vehicles/online/', {
      params: {
        session_id: sessionId,
        schema_id: schemaId,
        device_ids: deviceIds
      }
    });
    return response.data; // Возвращает { success, online_data: { id: {...} } }
  }
};