import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      // Старый endpoint для обратной совместимости
      const response = await api.post('/init-data/', credentials);
      return {
        success: true,
        session_id: response.data.session_id,
        schema_id: response.data.schema_id,
        vehicles: response.data.vehicles,
        online: response.data.online,
        props: response.data.props
      };
    } catch (error) {
      // Если старый endpoint не работает, пробуем новый
      try {
        const response = await api.post('/auth/login/', credentials);
        return {
          success: true,
          session_id: response.data.session_id,
          schema_id: null, // Нужно будет получить отдельно
          vehicles: [],
          online: {},
          props: {}
        };
      } catch (newError) {
        throw newError;
      }
    }
  },

  logout: () => {
    localStorage.removeItem('tk_creds');
  },

  getStoredCredentials: () => {
    const stored = localStorage.getItem('tk_creds');
    return stored ? JSON.parse(stored) : null;
  },

  storeCredentials: (credentials) => {
    localStorage.setItem('tk_creds', JSON.stringify(credentials));
  }
};