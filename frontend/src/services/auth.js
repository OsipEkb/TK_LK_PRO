import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('auth/login/', { username, password });
    return response.data;
  },

  getSchemas: async (sessionId) => {
    const response = await api.get('schemas/', {
      params: { session_id: sessionId }
    });
    return response.data;
  }
};