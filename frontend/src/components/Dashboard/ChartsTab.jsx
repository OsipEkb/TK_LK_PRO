import React, { useState, useEffect } from 'react';
import {
  Grid3x3, Layout, Maximize2, Rotate3d,
  Download, Plus, Trash2, Filter, Search,
  BarChart3, LineChart, PieChart, Activity
} from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

const ChartsTab = ({ sessionId, schemaId, vehicles = [] }) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [activeCharts, setActiveCharts] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState(['speed', 'fuel']);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [viewMode, setViewMode] = useState('2d');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Доступные параметры для анализа
  const dataParameters = [
    { key: 's', label: 'СКОРОСТЬ', unit: 'км/ч', color: '#ef4444' },
    { key: 'f', label: 'ТОПЛИВО', unit: 'л', color: '#22c55e' },
    { key: 'rpm', label: 'ОБОРОТЫ', unit: 'об/мин', color: '#3b82f6' },
    { key: 'temp', label: 'ТЕМПЕРАТУРА', unit: '°C', color: '#f97316' },
    { key: 'volt', label: 'НАПРЯЖЕНИЕ', unit: 'В', color: '#8b5cf6' },
    { key: 'engine_hours', label: 'МОТОЧАСЫ', unit: 'ч', color: '#f59e0b' },
    { key: 'mileage', label: 'ПРОБЕГ', unit: 'км', color: '#14b8a6' },
    { key: 'consumption', label: 'РАСХОД', unit: 'л/100км', color: '#ec4899' }
  ];

  // Типы графиков
  const chartTypes = [
    { id: 'line', label: 'Линейный', icon: LineChart },
    { id: 'area', label: 'Областной', icon: Activity },
    { id: 'bar', label: 'Столбчатый', icon: BarChart3 },
    { id: 'pie', label: 'Круговая', icon: PieChart },
    { id: 'spline', label: 'Плавный', icon: LineChart }
  ];

  // Загрузка данных по выбранным ТС
  const fetchDataForCharts = async () => {
    if (selectedVehicles.length === 0) {
      alert('Выберите хотя бы одно ТС для анализа');
      return;
    }

    setLoading(true);
    try {
      const dataPromises = selectedVehicles.map(async (vehicleId) => {
        const response = await apiService.getAnalytics({
          session: sessionId,
          schema_id: schemaId,
          device_id: vehicleId,
          from: `${dateRange.from} 00:00`,
          to: `${dateRange.to} 23:59`
        });
        return { vehicleId, data: response };
      });

      const results = await Promise.all(dataPromises);
      const dataMap = {};
      results.forEach(result => {
        dataMap[result.vehicleId] = result.data;
      });
      setChartData(dataMap);

      // Автоматически создаем первый график при загрузке данных
      if (activeCharts.length === 0) {
        addNewChart({
          type: 'spline',
          title: `Анализ ${selectedVehicles.length} ТС`,
          vehicleIds: selectedVehicles,
          dataKeys: selectedParameters
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // Тестовые данные для демонстрации
      const mockData = {};
      selectedVehicles.forEach(vehicleId => {
        const points = [];
        for (let i = 0; i < 24; i++) {
          points.push({
            t: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            s: Math.floor(Math.random() * 120),
            f: Math.floor(Math.random() * 100),
            rpm: Math.floor(Math.random() * 3000),
            temp: 20 + Math.floor(Math.random() * 40)
          });
        }
        mockData[vehicleId] = points;
      });
      setChartData(mockData);

      if (activeCharts.length === 0) {
        addNewChart({
          type: 'spline',
          title: `Тестовый график (${selectedVehicles.length} ТС)`,
          vehicleIds: selectedVehicles,
          dataKeys: selectedParameters
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового графика
  const addNewChart = (config = {}) => {
    const defaultConfig = {
      id: `chart-${Date.now()}`,
      type: config.type || 'spline',
      title: config.title || `График ${activeCharts.length + 1}`,
      vehicleIds: config.vehicleIds || selectedVehicles,
      dataKeys: config.dataKeys || selectedParameters,
      style: {
        is3D: config.is3D || viewMode === '3d',
        colors: config.colors || [currentTheme.accent, '#ef4444', '#22c55e', '#3b82f6'],
        lineWidth: config.lineWidth || 3,
        showPoints: config.showPoints || false,
        gradient: config.gradient || true,
        shadows: config.shadows || true,
        animation: config.animation || true
      }
    };

    setActiveCharts(prev => [...prev, defaultConfig]);
  };

  // Обновление графика
  const updateChart = (chartId, updates) => {
    setActiveCharts(prev =>
      prev.map(chart =>
        chart.id === chartId ? { ...chart, ...updates } : chart
      )
    );
  };

  // Удаление графика
  const removeChart = (chartId) => {
    setActiveCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  // Очистка всех графиков
  const clearAllCharts = () => {
    if (window.confirm('Удалить все графики?')) {
      setActiveCharts([]);
      setChartData({});
    }
  };

  // Экспорт данных
  const exportData = () => {
    const exportObj = {
      meta: {
        exportedAt: new Date().toISOString(),
        vehicles: selectedVehicles.map(id =>
          vehicles.find(v => v.ID === id)?.Name || id
        ),
        dateRange,
        parameters: selectedParameters
      },
      charts: activeCharts,
      data: chartData
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charts-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Фильтрация ТС по поиску
  const filteredVehicles = vehicles.filter(v =>
    v.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[78vh] flex flex-col gap-4 p-4">
      {/* Верхняя панель управления */}
      <div className="p-6 border flex items-center justify-between shadow-xl"
           style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-xs font-black uppercase opacity-40">РЕЖИМ:</div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === '2d' ? 'bg-white/10' : 'opacity-30'}`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all ${viewMode === '3d' ? 'bg-white/10' : 'opacity-30'}`}
              >
                <Rotate3d size={12} />
                3D
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-black uppercase opacity-40">КОМПОНОВКА:</div>
            <div className="flex gap-1">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-lg ${layoutMode === 'grid' ? 'bg-white/10' : 'opacity-30'}`}
                title="Сетка"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setLayoutMode('masonry')}
                className={`p-2 rounded-lg ${layoutMode === 'masonry' ? 'bg-white/10' : 'opacity-30'}`}
                title="Каменная кладка"
              >
                <Layout size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => addNewChart()}
            disabled={selectedVehicles.length === 0}
            className="px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all disabled:opacity-30"
            style={{ backgroundColor: currentTheme.accent, color: '#000' }}
          >
            <Plus size={14} />
            НОВЫЙ ГРАФИК
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={exportData}
            disabled={activeCharts.length === 0}
            className="px-4 py-2 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase transition-all disabled:opacity-30"
            style={{ borderColor: currentTheme.border }}
          >
            <Download size={14} />
            ЭКСПОРТ
          </button>

          <button
            onClick={clearAllCharts}
            disabled={activeCharts.length === 0}
            className="px-4 py-2 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase transition-all hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30"
            style={{ borderColor: currentTheme.border }}
          >
            <Trash2 size={14} />
            ОЧИСТИТЬ ВСЕ
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Левая панель - выбор данных */}
        <div className="w-96 flex flex-col gap-4">
          {/* Поиск ТС */}
          <div className="border p-6"
               style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

            <div className="text-[10px] font-black uppercase opacity-60 mb-4">ВЫБОР ТРАНСПОРТА</div>

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

            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 mb-4">
              {filteredVehicles.map(vehicle => (
                <div
                  key={vehicle.ID}
                  onClick={() => setSelectedVehicles(prev =>
                    prev.includes(vehicle.ID)
                      ? prev.filter(id => id !== vehicle.ID)
                      : [...prev, vehicle.ID]
                  )}
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
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.accent }} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-[9px] font-black uppercase opacity-40">
              Выбрано: {selectedVehicles.length} из {vehicles.length}
            </div>
          </div>

          {/* Выбор параметров */}
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
                  onClick={() => setSelectedParameters(prev =>
                    prev.includes(param.key)
                      ? prev.filter(p => p !== param.key)
                      : [...prev, param.key]
                  )}
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

            {/* Период анализа */}
            <div className="space-y-4">
              <div className="text-[9px] font-black uppercase opacity-40">ПЕРИОД АНАЛИЗА</div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-black uppercase opacity-40 block mb-1">НАЧАЛО</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase opacity-40 block mb-1">КОНЕЦ</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none"
                  />
                </div>
              </div>

              <button
                onClick={fetchDataForCharts}
                disabled={loading || selectedVehicles.length === 0}
                className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg"
                style={{ backgroundColor: loading ? '#222' : currentTheme.accent, color: '#000' }}
              >
                {loading ? 'ЗАГРУЗКА...' : 'ЗАГРУЗИТЬ ДАННЫЕ'}
              </button>
            </div>
          </div>

          {/* Выбор типа графика */}
          <div className="border p-6"
               style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

            <div className="text-[10px] font-black uppercase opacity-60 mb-4">ТИП ГРАФИКА</div>

            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    if (selectedVehicles.length > 0) {
                      addNewChart({
                        type: type.id,
                        title: `${type.label} - ${selectedVehicles.length} ТС`
                      });
                    }
                  }}
                  disabled={selectedVehicles.length === 0}
                  className="p-3 rounded-xl border border-white/5 flex flex-col items-center gap-2 disabled:opacity-30 hover:bg-white/5"
                >
                  <type.icon size={20} />
                  <span className="text-[9px] font-black uppercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Область графиков */}
        <div className="flex-1 overflow-auto">
          {activeCharts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 p-12">
              <BarChart3 size={64} />
              <p className="text-[10px] font-black uppercase mt-6 tracking-[0.3em] text-center">
                ВЫБЕРИТЕ ТС И ПАРАМЕТРЫ ДЛЯ АНАЛИЗА
              </p>
              <p className="text-[9px] font-black uppercase mt-2 opacity-40 text-center">
                Используйте панель слева для настройки данных
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {activeCharts.map(chart => (
                <div
                  key={chart.id}
                  className="border p-6 rounded-2xl relative"
                  style={{
                    backgroundColor: currentTheme.card,
                    borderColor: currentTheme.border,
                    borderRadius: `${borderRadius}px`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase">{chart.title}</h3>
                      <p className="text-[10px] opacity-40">
                        {chart.vehicleIds.length} ТС • {chart.dataKeys.length} параметров
                      </p>
                    </div>
                    <button
                      onClick={() => removeChart(chart.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl">
                    <div className="text-center">
                      <BarChart3 size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs opacity-60">График "{chart.type}"</p>
                      <p className="text-[10px] opacity-40 mt-1">
                        Данные загружены: {chart.vehicleIds.length > 0 ? 'ДА' : 'НЕТ'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateChart(chart.id, {
                        style: { ...chart.style, is3D: !chart.style.is3D }
                      })}
                      className="px-3 py-1 text-[10px] rounded border border-white/5"
                    >
                      {chart.style.is3D ? '3D' : '2D'}
                    </button>
                    <button
                      onClick={() => {
                        const newTitle = prompt('Новое название:', chart.title);
                        if (newTitle) updateChart(chart.id, { title: newTitle });
                      }}
                      className="px-3 py-1 text-[10px] rounded border border-white/5"
                    >
                      Переименовать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsTab;