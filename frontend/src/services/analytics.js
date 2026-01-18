import api from './api';

export const analyticsService = {
  getTrackData: async (sessionId, schemaId, deviceId, dateFrom, dateTo) => {
    const response = await api.get('/analytics/track/', {
      params: {
        session: sessionId,
        schema_id: schemaId,
        device_id: deviceId,
        from: dateFrom,
        to: dateTo
      }
    });
    return response.data;
  },

  getAnalyticsData: async (sessionId, schemaId, deviceId, dateFrom, dateTo) => {
    const response = await api.get('/analytics/', {
      params: {
        session: sessionId,
        schema_id: schemaId,
        device_id: deviceId,
        from: `${dateFrom}T00:00`,
        to: `${dateTo}T23:59`
      }
    });
    return response.data;
  }
};