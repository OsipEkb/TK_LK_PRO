import api from './api';

export const vehiclesService = {
  getSchemas: async (sessionId) => {
    const response = await api.get('/schemas/', {
      params: { session_id: sessionId }
    });
    return response.data;
  },

  getVehicles: async (sessionId, schemaId) => {
    const response = await api.get('/vehicles/', {
      params: {
        session_id: sessionId,
        schema_id: schemaId
      }
    });
    return response.data;
  },

  getOnlineData: async (sessionId, schemaId, deviceIds) => {
    const response = await api.get('/vehicles/online/', {
      params: {
        session_id: sessionId,
        schema_id: schemaId,
        device_ids: deviceIds
      }
    });
    return response.data;
  },

  getVehicleDetail: async (sessionId, schemaId, vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}/`, {
      params: {
        session_id: sessionId,
        schema_id: schemaId
      }
    });
    return response.data;
  }
};