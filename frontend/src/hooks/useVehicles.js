import { useState, useEffect, useCallback } from 'react';
import { vehiclesService } from '../services/vehicles';

export const useVehicles = (sessionId, schemaId) => {
  const [vehicles, setVehicles] = useState([]);
  const [onlineData, setOnlineData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!sessionId || !schemaId) return;
    setLoading(true);
    try {
      const vResponse = await vehiclesService.getVehicles(sessionId, schemaId);
      if (vResponse.success) {
        setVehicles(vResponse.vehicles);
        const deviceIds = vResponse.vehicles.map(v => v.ID).join(',');
        const oResponse = await vehiclesService.getOnlineData(sessionId, schemaId, deviceIds);
        if (oResponse.success) {
          setOnlineData(oResponse.online_data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, schemaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { vehicles, onlineData, loading, error, refresh: fetchData };
};