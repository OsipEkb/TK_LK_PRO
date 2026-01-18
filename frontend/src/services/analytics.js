import api from './api';

export const analyticsService = {
  getTrackData: async (sessionId, schemaId, deviceId, fromDate, toDate) => {
    // Твой бэк в analytics.py ожидает ключи session, schema_id, device_id, from, to
    const response = await api.get('analytics/track/', {
      params: {
        session: sessionId,
        schema_id: schemaId,
        device_id: deviceId,
        from: fromDate, // Формат YYYY-MM-DD HH:mm (бэк сам его почистит)
        to: toDate
      }
    });
    return response.data; // Ожидаем { success: true, points: [...] }
  }
};