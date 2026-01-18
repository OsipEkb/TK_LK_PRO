import React from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import VehicleCard from '../components/UI/VehicleCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const OnlinePage = () => {
  const { session_id, schema_id } = useAuth();
  const { currentTheme } = useTheme();
  const { vehicles, onlineData, loading, error } = useVehicles(session_id, schema_id);

  if (loading && vehicles.length === 0) return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-10 text-red-500 uppercase font-black italic">Ошибка соединения: {error}</div>;

  return (
    <div className="p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {vehicles.map(vehicle => (
        <VehicleCard
          key={vehicle.ID}
          vehicle={vehicle}
          online={onlineData[String(vehicle.ID)]}
          theme={currentTheme}
        />
      ))}
    </div>
  );
};

export default OnlinePage;