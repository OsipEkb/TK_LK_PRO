import { useState, useCallback } from 'react';
import { analyticsService } from '../services/analytics';

export const useAnalytics = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackData = useCallback(async (sessionId, schemaId, deviceId, dateFrom, dateTo) => {
    if (!sessionId || !schemaId || !deviceId || !dateFrom || !dateTo) {
      setError('Missing required parameters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getTrackData(
        sessionId,
        schemaId,
        deviceId,
        dateFrom,
        dateTo
      );

      if (data.success) {
        setChartData(data.points || []);
      } else {
        setError(data.error || 'Failed to fetch track data');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalyticsData = useCallback(async (sessionId, schemaId, deviceId, dateFrom, dateTo) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getAnalyticsData(
        sessionId,
        schemaId,
        deviceId,
        dateFrom,
        dateTo
      );

      if (data.points) {
        setChartData(data.points);
      } else {
        setChartData([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChartData = useCallback(() => {
    setChartData([]);
    setError(null);
  }, []);

  return {
    chartData,
    loading,
    error,
    fetchTrackData,
    fetchAnalyticsData,
    clearChartData
  };
};