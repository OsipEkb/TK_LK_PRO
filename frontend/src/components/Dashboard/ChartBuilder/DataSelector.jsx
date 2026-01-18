import React, { useState } from 'react';
import { Search, Calendar, Filter, Zap, ChevronDown, ChevronUp } from 'lucide-react';

// Временный fallback для useThemeContext
const useThemeContext = () => {
  return {
    currentTheme: {
      bg: '#050505',
      accent: '#FFB800',
      card: '#111111',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.05)'
    },
    borderRadius: 24
  };
};

const DataSelector = ({
  vehicles,
  selectedVehicles,
  onSelectVehicles,
  dataParameters,
  selectedParameters,
  onSelectParameters,
  dateRange,
  onDateChange,
  onFetchData,
  loading,
  sessionId,
  schemaId
}) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [customTimeFrom, setCustomTimeFrom] = useState('00:00');
  const [customTimeTo, setCustomTimeTo] = useState('23:59');

  const toggleVehicle = (id) => {
    onSelectVehicles(prev =>
      prev.includes(id)
        ? prev.filter(vId => vId !== id)
        : [...prev, id]
    );
  };

  const toggleParameter = (key) => {
    onSelectParameters(prev =>
      prev.includes(key)
        ? prev.filter(p => p !== key)
        : [...prev, key]
    );
  };

  const selectAllVehicles = () => {
    onSelectVehicles(vehicles.map(v => v.ID));
  };

  const clearVehicles = () => {
    onSelectVehicles([]);
  };

  const handleFetchData = () => {
    onFetchData();
  };

  const filteredVehicles = vehicles.filter(v =>
    v.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Панель выбора ТС */}
      <div className="border p-6 flex flex-col flex-1"
           style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-black uppercase opacity-60">ВЫБОР ТРАНСПОРТА</div>
          <div className="flex gap-2">
            <button
              onClick={selectAllVehicles}
              className="text-[9px] font-black uppercase opacity-40 hover:opacity-100"
            >
              ВСЕ
            </button>
            <button
              onClick={clearVehicles}
              className="text-[9px] font-black uppercase opacity-40 hover:opacity-100"
            >
              НЕТ
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-[9px] font-black uppercase opacity-40 hover:opacity-100"
            >
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={14} />
              <input
                type="text"
                placeholder="ПОИСК МАШИНЫ..."
                className="w-full bg-black/40 border border-white/5 p-3 pl-10 rounded-xl text-[10px] text-white outline-none focus:border-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4">
              {filteredVehicles.map(vehicle => (
                <div
                  key={vehicle.ID}
                  onClick={() => toggleVehicle(vehicle.ID)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                    selectedVehicles.includes(vehicle.ID)
                      ? 'border-white/20 bg-white/5'
                      : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter truncate">
                    {vehicle.Name}
                  </span>
                  {selectedVehicles.includes(vehicle.ID) && (
                    <Zap size={14} style={{ color: currentTheme.accent }} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-[9px] font-black uppercase opacity-40 pt-4 border-t border-white/5">
              Выбрано: {selectedVehicles.length} из {vehicles.length}
            </div>
          </>
        )}
      </div>

      {/* Панель параметров */}
      <div className="border p-6"
           style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

        <div className="text-[10px] font-black uppercase opacity-60 mb-4 flex items-center gap-2">
          <Filter size={12} />
          ПАРАМЕТРЫ АНАЛИЗА
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {dataParameters.map(param => (
            <button
              key={param.key}
              onClick={() => toggleParameter(param.key)}
              className={`p-2 rounded-xl border text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                selectedParameters.includes(param.key)
                  ? 'border-white/30'
                  : 'border-transparent opacity-40 hover:opacity-100'
              }`}
              style={{
                borderColor: selectedParameters.includes(param.key) ? param.color : currentTheme.border,
                backgroundColor: selectedParameters.includes(param.key) ? `${param.color}20` : 'transparent'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: param.color }} />
              {param.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-[9px] font-black uppercase opacity-40 flex items-center gap-2">
            <Calendar size={12} />
            ПЕРИОД АНАЛИЗА
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-black uppercase opacity-40 block mb-1">НАЧАЛО</label>
              <div className="flex gap-1">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                />
                <input
                  type="time"
                  value={customTimeFrom}
                  onChange={(e) => setCustomTimeFrom(e.target.value)}
                  className="w-20 bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[8px] font-black uppercase opacity-40 block mb-1">КОНЕЦ</label>
              <div className="flex gap-1">
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                />
                <input
                  type="time"
                  value={customTimeTo}
                  onChange={(e) => setCustomTimeTo(e.target.value)}
                  className="w-20 bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleFetchData}
            disabled={loading || selectedVehicles.length === 0}
            className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg"
            style={{ backgroundColor: loading ? '#222' : currentTheme.accent, color: '#000' }}
          >
            {loading ? 'СИНХРОНИЗАЦИЯ...' : 'ЗАГРУЗИТЬ ДАННЫЕ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSelector;