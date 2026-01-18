import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [credentials, setCredentials] = useState(() =>
    authService.getStoredCredentials()
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!credentials);
  }, [credentials]);

  const login = useCallback(async (username, password) => {
    try {
      const result = await authService.login({ username, password });

      const creds = {
        username,
        password,
        session_id: result.session_id,
        schema_id: result.schema_id
      };

      authService.storeCredentials(creds);
      setCredentials(creds);

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка авторизации'
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCredentials(null);
    setIsAuthenticated(false);
  }, []);

  return {
    credentials,
    isAuthenticated,
    login,
    logout,
    setCredentials
  };
};