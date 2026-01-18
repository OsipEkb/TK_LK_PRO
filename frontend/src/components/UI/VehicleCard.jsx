import React from 'react';
import { MapPin, Fuel, Clock, Zap } from 'lucide-react';

const VehicleCard = ({ vehicle, online = {}, theme }) => {
  // Расчет статуса на основе DT из твоего API
  const getStatus = (dt) => {
    if (!dt) return { label: 'НЕТ ДАННЫХ', color: '#6b7280' };
    const diff = (new Date() - new Date(dt)) / 1000 / 60;
    if (diff <= 15) return { label: 'ОНЛАЙН', color: '#22c55e' };
    return { label: 'ОФФЛАЙН', color: '#ef4444' };
  };

  const status = getStatus(online.DT);
  const fuelPerc = vehicle.max_fuel > 0 ? Math.min(100, Math.round((online.fuel / vehicle.max_fuel) * 100)) : 0;

  return (
    <div className="p-6 border flex flex-col justify-between h-[420px] relative transition-all shadow-xl group"
         style={{ backgroundColor: theme.card, borderRadius: '24px', borderColor: theme.border }}>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black uppercase tracking-tighter text-white">{vehicle.Name}</h3>
          <div className="text-[10px] font-bold opacity-40 uppercase text-white">{vehicle.reg_number}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black italic" style={{ color: theme.accent }}>{Math.round(online.Speed || 0)}</div>
          <div className="text-[9px] font-black opacity-40 uppercase text-white">КМ/Ч</div>
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex gap-3 items-start my-4">
        <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: theme.accent }} />
        <p className="text-[11px] leading-tight opacity-70 text-white line-clamp-2">{online.Address}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Моточасы</span>
          <div className="font-black text-white">{online.moto_hours || 0} ч</div>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Статус</span>
          <div className="font-black text-[10px]" style={{ color: status.color }}>{status.label}</div>
        </div>
      </div>

      <div className="p-5 rounded-[24px] text-black shadow-inner relative overflow-hidden"
           style={{ backgroundColor: theme.accent }}>
        <div className="flex justify-between items-end mb-1 relative z-10">
          <span className="uppercase text-[9px] font-black flex items-center gap-1"><Fuel size={12}/> Топливо {fuelPerc}%</span>
          <span className="text-xl font-black italic">{Math.round(online.fuel || 0)} Л</span>
        </div>
        <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden relative z-10">
          <div className="h-full bg-black/80 transition-all duration-1000" style={{ width: `${fuelPerc}%` }} />
        </div>
      </div>

      <div className={`mt-4 text-[9px] font-black uppercase flex items-center gap-2 ${online.ignition ? 'text-green-500' : 'opacity-20 text-white'}`}>
        <Zap size={12} fill={online.ignition ? "currentColor" : "none"} />
        {online.ignition ? 'Зажигание включено' : 'Зажигание выключено'}
      </div>
    </div>
  );
};

export default VehicleCard;