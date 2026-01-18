import { useState, useEffect, useCallback } from 'react';
import { vehiclesService } from '../services/vehicles';

export const useVehicles = (sessionId, schemaId) => {
  const [vehicles, setVehicles] = useState([]);
  const [onlineData, setOnlineData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    if (!sessionId || !schemaId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await vehiclesService.getVehicles(sessionId, schemaId);

      if (data.success) {
        setVehicles(data.vehicles || []);

        // Если есть онлайн-данные в ответе (старый endpoint)
        if (data.online_data) {
          setOnlineData(data.online_data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, schemaId]);

  const fetchOnlineData = useCallback(async (deviceIds) => {
    if (!sessionId || !schemaId || !deviceIds) return;

    try {
      const data = await vehiclesService.getOnlineData(
        sessionId,
        schemaId,
        deviceIds
      );

      if (data.success) {
        setOnlineData(data.online_data || {});
      }
    } catch (err) {
      console.error('Error fetching online data:', err);
    }
  }, [sessionId, schemaId]);

  // Автоматическое обновление каждую минуту
  useEffect(() => {
    if (sessionId && schemaId) {
      fetchVehicles();

      const interval = setInterval(fetchVehicles, 60000);
      return () => clearInterval(interval);
    }
  }, [sessionId, schemaId, fetchVehicles]);

  // Получение онлайн-данных для всех ТС
  useEffect(() => {
    if (vehicles.length > 0 && sessionId && schemaId) {
      const deviceIds = vehicles.map(v => v.ID).join(',');
      fetchOnlineData(deviceIds);

      const interval = setInterval(() => {
        fetchOnlineData(deviceIds);
      }, 30000); // Обновляем онлайн-данные каждые 30 секунд

      return () => clearInterval(interval);
    }
  }, [vehicles, sessionId, schemaId, fetchOnlineData]);

  return {
    vehicles,
    onlineData,
    loading,
    error,
    refreshVehicles: fetchVehicles,
    refreshOnlineData: fetchOnlineData
  };
};