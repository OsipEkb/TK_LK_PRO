import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { Calendar, barChart3, Filter } from 'lucide-react';

const ChartsPage = () => {
  const { session_id, schema_id } = useAuth();
  const { currentTheme } = useTheme();
  const { vehicles } = useVehicles(session_id, schema_id);
  const { data, loading, availableKeys, fetchAnalytics } = useAnalytics(session_id, schema_id);

  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0] + ' 00:00');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0] + ' 23:59');
  const [activeKeys, setActiveKeys] = useState(['f', 's']); // По умолчанию Топливо и Скорость

  const handleFetch = () => {
    if (selectedVehicle) fetchAnalytics(selectedVehicle, dateFrom, dateTo);
  };

  return (
    <div className="p-8 h-[calc(100vh-80px)] flex flex-col gap-6 italic">
      {/* Панель управления */}
      <div className="p-6 rounded-[32px] border flex flex-wrap items-center gap-4"
           style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>

        <select
          className="bg-black/20 p-3 rounded-xl border border-white/5 text-[11px] font-black uppercase outline-none text-white"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
        >
          <option value="">Выберите ТС</option>
          {vehicles.map(v => <option key={v.ID} value={v.ID}>{v.Name}</option>)}
        </select>

        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
          <Calendar size={14} className="opacity-40" />
          <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-[11px] outline-none text-white w-32" />
          <span className="opacity-20">—</span>
          <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-[11px] outline-none text-white w-32" />
        </div>

        <button
          onClick={handleFetch}
          className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-transform active:scale-95"
          style={{ backgroundColor: currentTheme.accent, color: '#000' }}
        >
          {loading ? 'Загрузка...' : 'Построить'}
        </button>

        {/* Выбор активных параметров */}
        <div className="flex gap-2 ml-auto">
          {availableKeys.map(key => (
            <button
              key={key}
              onClick={() => setActiveKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${activeKeys.includes(key) ? 'opacity-100' : 'opacity-20'}`}
              style={{ borderColor: currentTheme.accent, color: activeKeys.includes(key) ? currentTheme.accent : 'white' }}
            >
              {key === 'f' ? 'Топливо' : key === 's' ? 'Скорость' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Контейнер графика */}
      <div className="flex-1 bg-black/10 rounded-[40px] border border-white/5 p-8 shadow-inner overflow-hidden">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis yAxisId="left" strokeOpacity={0.2} tick={{fontSize: 10}} />
              <YAxis yAxisId="right" orientation="right" strokeOpacity={0.2} tick={{fontSize: 10}} />
              <Tooltip
                contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '10px'}}
                itemStyle={{fontWeight: '900', textTransform: 'uppercase'}}
              />
              <Legend iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px'}} />

              {activeKeys.includes('f') && (
                <Area yAxisId="left" type="monotone" dataKey="f" name="Топливо (Л)" stroke={currentTheme.accent} fillOpacity={0.1} fill={currentTheme.accent} strokeWidth={3} />
              )}
              {activeKeys.includes('s') && (
                <Line yAxisId="right" type="monotone" dataKey="s" name="Скорость" stroke="#ef4444" dot={false} strokeWidth={2} />
              )}
              {/* Автоматическая генерация линий для остальных ключей (RPM, Volt и т.д.) */}
              {activeKeys.filter(k => k !== 'f' && k !== 's').map((key, idx) => (
                <Line
                  key={key}
                  yAxisId="right"
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={`hsl(${idx * 137}, 70%, 50%)`}
                  dot={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-[1em]">
            Нет данных для отображения
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsPage;