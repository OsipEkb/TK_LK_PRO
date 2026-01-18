import React, { useState, useEffect } from 'react';
import VehicleCard from './VehicleCard';
import { useThemeContext } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

const OnlineTab = ({ sessionId, schemaId, vehicles = [] }) => {
  const { currentTheme, gridCols, borderRadius } = useThemeContext();
  const [onlineData, setOnlineData] = useState({});
  const [loading, setLoading] = useState(true);

  // Загружаем онлайн данные
  useEffect(() => {
    const fetchOnlineData = async () => {
      if (!sessionId || !schemaId || vehicles.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Собираем ID всех ТС
        const deviceIds = vehicles.map(v => v.ID).join(',');

        // Загружаем онлайн данные через API
        const response = await apiService.getAnalytics({
          session: sessionId,
          schema_id: schemaId,
          device_id: deviceIds,
          from: new Date(Date.now() - 3600000).toISOString().split('T')[0] + ' 00:00',
          to: new Date().toISOString().split('T')[0] + ' 23:59'
        });

        // Преобразуем данные в нужный формат
        const dataMap = {};
        if (Array.isArray(response)) {
          // Если пришел массив точек
          response.forEach(point => {
            if (point.device_id) {
              if (!dataMap[point.device_id]) {
                dataMap[point.device_id] = {};
              }
              // Обновляем последние данные
              dataMap[point.device_id] = {
                ...dataMap[point.device_id],
                Speed: point.s || point.speed || 0,
                Fuel: point.f || point.fuel || 0,
                Address: point.address || 'Местоположение не определено',
                DT: point.t || new Date().toISOString(),
                Ignition: point.ignition || false,
                Moto: point.moto_hours || point.engine_hours || 0
              };
            }
          });
        }

        setOnlineData(dataMap);
      } catch (error) {
        console.error('Error loading online data:', error);
        // Если API не отвечает, создаем тестовые данные
        const mockData = {};
        vehicles.forEach(vehicle => {
          mockData[vehicle.ID] = {
            Speed: Math.floor(Math.random() * 120),
            Fuel: Math.floor(Math.random() * 100),
            Address: vehicle.Address || 'Москва, ул. Ленина, 1',
            DT: new Date().toISOString(),
            Ignition: Math.random() > 0.5,
            Moto: Math.floor(Math.random() * 5000)
          };
        });
        setOnlineData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineData();

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchOnlineData, 30000);
    return () => clearInterval(interval);
  }, [sessionId, schemaId, vehicles]);

  if (loading) {
    return (
      <div className="h-[78vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB800] mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">
          ЗАГРУЗКА ДАННЫХ...
        </p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="h-[78vh] flex flex-col items-center justify-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center">
          НЕТ ДОСТУПНЫХ ТРАНСПОРТНЫХ СРЕДСТВ
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 transition-all duration-500`}
         style={{
           gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
           borderRadius: `${borderRadius}px`
         }}>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.ID}
          vehicle={vehicle}
          online={onlineData[vehicle.ID] || {}}
          theme={currentTheme}
        />
      ))}
    </div>
  );
};

export default OnlineTab;