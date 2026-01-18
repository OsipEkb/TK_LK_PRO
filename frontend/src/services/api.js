import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Именованный экспорт apiService
export const apiService = {
  // Авторизация и получение списка машин
  initData: async (credentials) => {
    const res = await api.post('/init-data/', credentials);
    return res.data;
  },

  // Получение точек для графиков
  getAnalytics: async (params) => {
    const res = await api.get('/analytics/', { params });
    // Проверка структуры ответа бэкенда
    return res.data.track || res.data.points || res.data || [];
  },

  // Получение сводных отчетов
  getReports: async (params) => {
    const res = await api.get('/reports/', { params });
    return res.data || [];
  },

  // Получение онлайн данных
  getOnlineData: async (sessionId, schemaId, deviceIds) => {
    const res = await api.get('/vehicles/online/', {
      params: {
        session_id: sessionId,
        schema_id: schemaId,
        device_ids: deviceIds
      }
    });
    return res.data || {};
  }
};

export default api;