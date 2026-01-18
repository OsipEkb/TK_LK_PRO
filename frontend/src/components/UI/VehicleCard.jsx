import React from 'react';
import { MapPin, Clock, Activity, Fuel } from 'lucide-react';

const VehicleCard = ({
  vehicle,
  onlineData,
  props,
  theme,
  onClick,
  borderRadius
}) => {
  const vId = String(vehicle.ID);
  const online = onlineData[vId] || {};
  const vehicleProps = props[vId] || {};

  const getDataStatus = (lastData) => {
    if (!lastData) return { label: 'НЕТ СВЯЗИ С ТЕРМИНАЛОМ', color: '#6b7280' };
    const diff = (new Date() - new Date(lastData)) / 1000 / 60;
    if (diff <= 10) return { label: 'ДАННЫЕ АКТУАЛЬНЫЕ', color: '#22c55e' };
    if (diff <= 60) return { label: 'ЗАДЕРЖКА ДАННЫХ', color: '#eab308' };
    return { label: 'ДАННЫЕ УСТАРЕВШИЕ', color: '#ef4444' };
  };

  const statusInfo = getDataStatus(online.LastData || online.DT);
  const perc = vehicleProps.MaxFuel > 0
    ? Math.round((online.Fuel / vehicleProps.MaxFuel) * 100)
    : 0;

  return (
    <div
      onClick={() => onClick(vehicle.ID)}
      className="p-6 border flex flex-col justify-between h-[450px] relative transition-all shadow-xl group cursor-pointer hover:scale-[1.01]"
      style={{
        backgroundColor: theme.card,
        borderRadius: `${borderRadius}px`,
        borderColor: theme.border
      }}
    >
      {/* Индикатор статуса */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: statusInfo.color,
            boxShadow: `0 0 15px ${statusInfo.color}`
          }}
        />
      </div>

      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div className="w-2/3">
          <h3 className="text-lg font-black uppercase tracking-tighter leading-none truncate">
            {vehicle.Name}
          </h3>
          <div className="text-[10px] font-bold opacity-40 uppercase mt-2">
            {vehicleProps.RegNumber || '—'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black italic" style={{ color: theme.accent }}>
            {Math.round(online.Speed || 0)}
          </div>
          <div className="text-[9px] font-black opacity-40 uppercase">КМ/Ч</div>
        </div>
      </div>

      {/* Адрес */}
      <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex gap-3 items-start my-2">
        <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: theme.accent }} />
        <p className="text-[11px] leading-tight opacity-70 line-clamp-2 min-h-[32px]">
          {online.Address || 'Координаты не определены'}
        </p>
      </div>

      {/* Статусы */}
      <div className="grid grid-cols-2 gap-2">
        {online.Moto > 0 && (
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
            <span className="text-[8px] font-black opacity-30 uppercase block mb-1 flex items-center gap-1">
              <Clock size={10} /> Мото
            </span>
            <div className="font-black italic text-xl">{online.Moto}</div>
          </div>
        )}
        <div className={`bg-white/5 p-4 rounded-2xl border border-white/5 ${online.Moto > 0 ? '' : 'col-span-2'}`}>
          <span className="text-[8px] font-black opacity-30 uppercase block mb-1 flex items-center gap-1">
            <Activity size={10} /> Статус связи
          </span>
          <div className="font-black text-[10px] mt-1 uppercase" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </div>
        </div>
      </div>

      {/* Топливо */}
      <div
        className="p-6 rounded-[32px] text-black shadow-inner mt-4 relative overflow-hidden transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: theme.accent }}
      >
        <div className="flex justify-between items-end mb-1 relative z-10">
          <span className="uppercase text-[9px] font-black flex items-center gap-1">
            <Fuel size={12} /> Топливо {perc}%
          </span>
          <span className="text-2xl font-black italic">
            {Math.round(online.Fuel || 0)} Л
          </span>
        </div>
        <div className="w-full h-1.5 bg-black/10 rounded-full mt-3 overflow-hidden relative z-10">
          <div
            className="h-full bg-black/80 transition-all duration-1000"
            style={{ width: `${perc}%` }}
          />
        </div>
      </div>

      {/* Зажигание */}
      <div className={`mt-4 text-[10px] font-black uppercase flex items-center gap-2 px-2 ${
        online.Ignition ? 'opacity-100' : 'opacity-20'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          online.Ignition ? 'animate-pulse' : ''
        }`} style={{backgroundColor: online.Ignition ? '#22c55e' : 'currentColor'}} />
        {online.Ignition ? (
          <span className="text-green-500">Зажигание ВКЛ</span>
        ) : (
          'Зажигание выкл'
        )}
      </div>
    </div>
  );
};

export default VehicleCard;