import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const useAnalytics = (sessionId, schemaId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (vehicleIds, dateRange) => {
    if (!sessionId || !schemaId || !vehicleIds.length) return;

    setLoading(true);
    setError(null);

    try {
      const dataPromises = vehicleIds.map(async (vehicleId) => {
        const response = await apiService.getAnalytics({
          session: sessionId,
          schema_id: schemaId,
          device_id: vehicleId,
          from: dateRange.from,
          to: dateRange.to
        });
        return { vehicleId, data: response };
      });

      const results = await Promise.all(dataPromises);
      const dataMap = {};
      results.forEach(result => {
        dataMap[result.vehicleId] = result.data;
      });

      setData(dataMap);
      return dataMap;
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, schemaId]);

  const clearData = useCallback(() => {
    setData({});
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
    clearData
  };
};