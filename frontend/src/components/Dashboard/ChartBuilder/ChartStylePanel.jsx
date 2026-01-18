import React, { useState } from 'react';
import {
  LineChart, BarChart3, PieChart, Gauge,
  Thermometer, Radar, GitBranch, Wind, Filter,
  Palette, Circle, Square, Hexagon
} from 'lucide-react';

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

const ChartStylePanel = ({ chartData, selectedVehicles, vehicles, onAddChart }) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [chartType, setChartType] = useState('spline');
  const [chartStyle, setChartStyle] = useState({
    is3D: false,
    lineWidth: 3,
    showPoints: false,
    gradient: true,
    shadows: true
  });

  const chartTypes = [
    { id: 'spline', label: 'ЛИНИЯ', icon: LineChart, description: 'Плавные кривые' },
    { id: 'line', label: 'ЛИНЕЙНЫЙ', icon: LineChart, description: 'Прямые линии' },
    { id: 'area', label: 'ОБЛАСТЬ', icon: BarChart3, description: 'Закрашенные области' },
    { id: 'column', label: 'СТОЛБЦЫ', icon: BarChart3, description: 'Вертикальные столбцы' },
    { id: 'bar', label: 'ПОЛОСЫ', icon: BarChart3, description: 'Горизонтальные полосы' },
    { id: 'pie', label: 'КРУГ', icon: PieChart, description: 'Круговая диаграмма' },
    { id: 'gauge', label: 'СПИДОМЕТР', icon: Gauge, description: 'Индикаторные датчики' },
    { id: 'heatmap', label: 'ТЕПЛО', icon: Thermometer, description: 'Тепловая карта' },
    { id: 'radar', label: 'РАДАР', icon: Radar, description: 'Радарная диаграмма' },
    { id: 'sankey', label: 'САНКЕЙ', icon: GitBranch, description: 'Диаграмма потоков' },
    { id: 'stream', label: 'СТРУЯ', icon: Wind, description: 'Струйный график' },
    { id: 'funnel', label: 'ВОРОНКА', icon: Filter, description: 'Воронкообразная' }
  ];

  const styleOptions = [
    { key: 'lineWidth', label: 'Толщина линии', type: 'range', min: 1, max: 10, step: 1 },
    { key: 'showPoints', label: 'Точки данных', type: 'toggle' },
    { key: 'gradient', label: 'Градиент', type: 'toggle' },
    { key: 'shadows', label: 'Тени', type: 'toggle' },
    { key: 'is3D', label: '3D эффект', type: 'toggle' }
  ];

  const markerShapes = [
    { id: 'circle', label: 'Круг', icon: Circle },
    { id: 'square', label: 'Квадрат', icon: Square },
    { id: 'diamond', label: 'Ромб', icon: Hexagon }
  ];

  const handleStyleChange = (key, value) => {
    setChartStyle(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateChart = () => {
    if (selectedVehicles.length === 0) {
      alert('Выберите ТС для создания графика');
      return;
    }

    const colors = [
      currentTheme.accent,
      '#ef4444', // red
      '#22c55e', // green
      '#3b82f6', // blue
      '#f59e0b', // amber
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6'  // teal
    ];

    onAddChart({
      type: chartType,
      is3D: chartStyle.is3D,
      colors: colors.slice(0, Math.min(8, selectedVehicles.length)),
      lineWidth: chartStyle.lineWidth,
      showPoints: chartStyle.showPoints,
      gradient: chartStyle.gradient,
      shadows: chartStyle.shadows,
      title: `${chartTypes.find(t => t.id === chartType)?.label} - ${selectedVehicles.length} ТС`
    });
  };

  const hasData = Object.keys(chartData).length > 0;

  return (
    <div className="border p-6"
         style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

      <div className="text-[10px] font-black uppercase opacity-60 mb-4 flex items-center gap-2">
        <Palette size={12} />
        СТИЛЬ ГРАФИКОВ
      </div>

      {/* Выбор типа графика */}
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase opacity-40 mb-3">ТИП ДИАГРАММЫ</div>
        <div className="grid grid-cols-3 gap-2">
          {chartTypes.slice(0, 6).map(type => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                chartType === type.id ? 'border-white/30' : 'border-white/5 opacity-40 hover:opacity-100'
              }`}
              style={{
                borderColor: chartType === type.id ? currentTheme.accent : currentTheme.border,
                backgroundColor: chartType === type.id ? `${currentTheme.accent}20` : 'transparent'
              }}
              title={type.description}
            >
              <type.icon size={16} />
              <span className="text-[8px] font-black uppercase">{type.label}</span>
            </button>
          ))}
        </div>

        {chartTypes.length > 6 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {chartTypes.slice(6).map(type => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  chartType === type.id ? 'border-white/30' : 'border-white/5 opacity-40 hover:opacity-100'
                }`}
                style={{
                  borderColor: chartType === type.id ? currentTheme.accent : currentTheme.border,
                  backgroundColor: chartType === type.id ? `${currentTheme.accent}20` : 'transparent'
                }}
                title={type.description}
              >
                <type.icon size={16} />
                <span className="text-[8px] font-black uppercase">{type.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Настройки стиля */}
      <div className="space-y-4 mb-6">
        <div className="text-[9px] font-black uppercase opacity-40">НАСТРОЙКИ ВИЗУАЛИЗАЦИИ</div>

        {styleOptions.map(option => (
          <div key={option.key} className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase opacity-60">{option.label}</span>
            {option.type === 'range' ? (
              <input
                type="range"
                min={option.min}
                max={option.max}
                step={option.step}
                value={chartStyle[option.key]}
                onChange={(e) => handleStyleChange(option.key, parseInt(e.target.value))}
                className="w-24 accent-current"
                style={{ color: currentTheme.accent }}
              />
            ) : (
              <button
                onClick={() => handleStyleChange(option.key, !chartStyle[option.key])}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  chartStyle[option.key] ? 'bg-current' : 'bg-white/10'
                }`}
                style={{ color: chartStyle[option.key] ? currentTheme.accent : 'transparent' }}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  chartStyle[option.key] ? 'transform translate-x-5' : 'transform translate-x-0.5'
                }`} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Формы маркеров */}
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase opacity-40 mb-3">ФОРМА МАРКЕРОВ</div>
        <div className="flex gap-2">
          {markerShapes.map(shape => (
            <button
              key={shape.id}
              className="p-2 rounded-xl border border-white/5 opacity-40 hover:opacity-100"
            >
              <shape.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Сводка */}
      <div className="p-4 rounded-xl border mb-6"
           style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: currentTheme.border }}>
        <div className="text-[9px] font-black uppercase opacity-60 mb-2">СВОДКА</div>
        <div className="space-y-1">
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>Тип:</span>
            <span>{chartTypes.find(t => t.id === chartType)?.label}</span>
          </div>
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>ТС выбрано:</span>
            <span>{selectedVehicles.length}</span>
          </div>
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>Данных загружено:</span>
            <span>{hasData ? 'ДА' : 'НЕТ'}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCreateChart}
        disabled={selectedVehicles.length === 0}
        className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg"
        style={{ backgroundColor: currentTheme.accent, color: '#000' }}
      >
        СОЗДАТЬ ГРАФИК
      </button>
    </div>
  );
};

export default ChartStylePanel;