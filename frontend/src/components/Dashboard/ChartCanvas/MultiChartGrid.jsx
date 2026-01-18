import React, { useState, useRef, useEffect } from 'react';
import {
  X, Maximize2, Minimize2, Edit2, Settings, RefreshCw,
  Copy, Download as DownloadIcon, Eye, EyeOff, Grid3x3, Layout
} from 'lucide-react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ChartContainer from './ChartContainer';

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
    borderRadius: 24,
    gridCols: 4
  };
};

const MultiChartGrid = ({
  charts,
  chartData,
  vehicles,
  layoutMode,
  viewMode,
  onUpdateChart,
  onRemoveChart,
  loading
}) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState(
    charts.reduce((acc, chart) => ({ ...acc, [chart.id]: true }), {})
  );

  const gridRef = useRef(null);

  // Подготовка данных для графика
  const prepareChartData = (chart) => {
    const allData = [];

    if (chart.vehicleIds && Array.isArray(chart.vehicleIds)) {
      chart.vehicleIds.forEach(vehicleId => {
        const vehicleData = chartData[vehicleId];
        if (!vehicleData || !Array.isArray(vehicleData)) return;

        const vehicle = vehicles.find(v => v.ID && v.ID.toString() === vehicleId.toString());

        vehicleData.forEach(point => {
          const dataPoint = {
            t: new Date(point.t).getTime(),
            vehicle: vehicle?.Name || `ID: ${vehicleId}`,
            vehicleId
          };

          // Добавляем все параметры из point
          if (chart.dataKeys && Array.isArray(chart.dataKeys)) {
            chart.dataKeys.forEach(key => {
              if (point[key] !== undefined) {
                dataPoint[key] = point[key];
              }
            });
          }

          allData.push(dataPoint);
        });
      });
    }

    // Сортируем по времени
    return allData.sort((a, b) => a.t - b.t);
  };

  // Обработчик изменения layout
  const onLayoutChange = (newLayout) => {
    if (!editMode) return;

    newLayout.forEach(item => {
      const chart = charts.find(c => c.id === item.i);
      if (chart && chart.layout) {
        onUpdateChart(chart.id, {
          layout: {
            ...chart.layout,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h
          }
        });
      }
    });
  };

  // Переключение видимости графика
  const toggleChartVisibility = (chartId) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };

  // Режим полного экрана
  if (fullscreenChart) {
    const chart = charts.find(c => c.id === fullscreenChart);
    if (!chart) {
      setFullscreenChart(null);
      return null;
    }

    const chartDataForDisplay = prepareChartData(chart);

    return (
      <div className="fixed inset-0 z-[200] bg-black p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-black uppercase tracking-tighter">
            {chart.title || 'График'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newTitle = prompt('Новое название:', chart.title);
                if (newTitle !== null && onUpdateChart) {
                  onUpdateChart(chart.id, { title: newTitle });
                }
              }}
              className="p-3 rounded-xl border hover:bg-white/10"
              style={{ borderColor: currentTheme.border }}
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => setFullscreenChart(null)}
              className="p-3 rounded-xl border hover:bg-white/10"
              style={{ borderColor: currentTheme.border }}
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[40px] overflow-hidden border"
             style={{ borderColor: currentTheme.border }}>
          <ChartContainer
            chart={chart}
            data={chartDataForDisplay}
            isFullscreen={true}
            theme={currentTheme}
          />
        </div>

        <div className="mt-6 flex justify-between items-center text-sm opacity-60">
          <div>
            {chart.vehicleIds?.length || 0} ТС • {chart.dataKeys?.length || 0} параметров • {chartDataForDisplay.length} точек
          </div>
          <div className="text-xs font-black uppercase">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  // Если нет графиков для отображения
  if (charts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-20 p-8">
        <Grid3x3 size={64} />
        <p className="text-[10px] font-black uppercase mt-6 tracking-[0.3em] text-center">
          СОЗДАЙТЕ ПЕРВЫЙ ГРАФИК
        </p>
        <p className="text-[9px] font-black uppercase mt-2 opacity-40 text-center">
          Используйте панель слева для настройки данных и создания графиков
        </p>
      </div>
    );
  }

  // Режим сетки (Grid Layout)
  if (layoutMode === 'grid') {
    const visibleChartsList = charts.filter(chart => visibleCharts[chart.id]);

    if (visibleChartsList.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center opacity-20">
          <EyeOff size={48} />
          <p className="text-xs font-black uppercase mt-4">Все графики скрыты</p>
          <button
            onClick={() => {
              const newVisible = {};
              charts.forEach(chart => {
                newVisible[chart.id] = true;
              });
              setVisibleCharts(newVisible);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-black uppercase"
            style={{ backgroundColor: currentTheme.accent, color: '#000' }}
          >
            ПОКАЗАТЬ ВСЕ
          </button>
        </div>
      );
    }

    const layout = visibleChartsList.map(chart => ({
      i: chart.id,
      x: chart.layout?.x || 0,
      y: chart.layout?.y || 0,
      w: chart.layout?.w || 4,
      h: chart.layout?.h || 3,
      minW: chart.layout?.minW || 2,
      minH: chart.layout?.minH || 2
    }));

    return (
      <div className="relative h-full">
        {editMode && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase"
              style={{ backgroundColor: currentTheme.accent, color: '#000' }}
            >
              Сохранить компоновку
            </button>
          </div>
        )}

        <ReactGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          width={1200}
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
          isDraggable={editMode}
          isResizable={editMode}
          compactType={null}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {visibleChartsList.map(chart => {
            const chartDataForDisplay = prepareChartData(chart);

            return (
              <div
                key={chart.id}
                className="rounded-2xl border shadow-xl relative group bg-opacity-90 backdrop-blur-sm"
                style={{
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                  borderRadius: `${borderRadius}px`
                }}
              >
                {/* Панель управления графиком */}
                <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black"
                    onClick={() => toggleChartVisibility(chart.id)}
                    title="Скрыть график"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black"
                    onClick={() => setFullscreenChart(chart.id)}
                    title="На весь экран"
                  >
                    <Maximize2 size={12} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-red-500/80"
                    onClick={() => onRemoveChart(chart.id)}
                    title="Удалить"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Заголовок */}
                <div className={`drag-handle p-4 pb-2 ${editMode ? 'cursor-move' : 'cursor-default'}`}>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={chart.title || 'График'}
                      onChange={(e) => onUpdateChart && onUpdateChart(chart.id, { title: e.target.value })}
                      className="text-sm font-black uppercase bg-transparent border-none outline-none w-full truncate"
                      style={{ color: currentTheme.text }}
                    />
                    {editMode && chart.layout && (
                      <div className="flex gap-1 ml-2">
                        <button
                          className="p-1 rounded hover:bg-white/10"
                          onClick={() => onUpdateChart && onUpdateChart(chart.id, {
                            layout: { ...chart.layout, w: Math.max(2, chart.layout.w - 1) }
                          })}
                        >
                          -
                        </button>
                        <span className="text-xs opacity-60">{chart.layout.w}×{chart.layout.h}</span>
                        <button
                          className="p-1 rounded hover:bg-white/10"
                          onClick={() => onUpdateChart && onUpdateChart(chart.id, {
                            layout: { ...chart.layout, w: chart.layout.w + 1 }
                          })}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-black uppercase opacity-40 mt-1 flex items-center gap-2">
                    <span>{(chart.type || 'spline').toUpperCase()}</span>
                    <span>•</span>
                    <span>{chart.vehicleIds?.length || 0} ТС</span>
                    <span>•</span>
                    <span>{chartDataForDisplay.length} точек</span>
                  </div>
                </div>

                {/* Область графика */}
                <div className="p-2" style={{ height: 'calc(100% - 60px)' }}>
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="animate-spin opacity-40" size={24} />
                    </div>
                  ) : chartDataForDisplay.length > 0 ? (
                    <ChartContainer
                      chart={chart}
                      data={chartDataForDisplay}
                      isFullscreen={false}
                      theme={currentTheme}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <p className="text-xs font-black uppercase">Нет данных</p>
                      <p className="text-[10px] opacity-60 mt-1">Загрузите данные для выбранных ТС</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ReactGridLayout>

        {/* Панель управления видимостью */}
        {charts.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 p-1 bg-black/50 rounded-xl border backdrop-blur-sm"
               style={{ borderColor: currentTheme.border }}>
            {charts.map(chart => (
              <button
                key={chart.id}
                onClick={() => toggleChartVisibility(chart.id)}
                className={`w-2 h-2 rounded-full transition-all ${
                  visibleCharts[chart.id] ? 'bg-current' : 'bg-white/20'
                }`}
                style={{ color: visibleCharts[chart.id] ? currentTheme.accent : 'transparent' }}
                title={chart.title || `График ${chart.id}`}
              />
            ))}
          </div>
        )}

        {/* Кнопка редактирования */}
        <button
          onClick={() => setEditMode(!editMode)}
          className="absolute top-4 left-4 px-4 py-2 rounded-xl border text-xs font-black uppercase"
          style={{
            backgroundColor: editMode ? currentTheme.accent : 'transparent',
            borderColor: currentTheme.border,
            color: editMode ? '#000' : currentTheme.text
          }}
        >
          {editMode ? 'ЗАКОНЧИТЬ РЕДАКТИРОВАНИЕ' : 'РЕДАКТИРОВАТЬ КОМПОНОВКУ'}
        </button>
      </div>
    );
  }

  // Режим masonry (каменная кладка) или другие режимы
  return (
    <div className="h-full overflow-y-auto">
      <div className={`grid gap-6 ${layoutMode === 'masonry' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {charts
          .filter(chart => visibleCharts[chart.id])
          .map(chart => {
            const chartDataForDisplay = prepareChartData(chart);

            return (
              <div
                key={chart.id}
                className="rounded-2xl border shadow-xl"
                style={{
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                  borderRadius: `${borderRadius}px`
                }}
              >
                {/* Заголовок и управление */}
                <div className="p-4 border-b flex items-center justify-between"
                     style={{ borderColor: currentTheme.border }}>
                  <div className="flex-1">
                    <div className="text-sm font-black uppercase truncate">{chart.title || 'График'}</div>
                    <div className="text-[10px] font-black uppercase opacity-40 mt-1">
                      {(chart.type || 'spline').toUpperCase()} • {chart.vehicleIds?.length || 0} ТС
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      className="p-2 rounded-lg border hover:bg-white/5"
                      style={{ borderColor: currentTheme.border }}
                      onClick={() => toggleChartVisibility(chart.id)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="p-2 rounded-lg border hover:bg-white/5"
                      style={{ borderColor: currentTheme.border }}
                      onClick={() => setFullscreenChart(chart.id)}
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      className="p-2 rounded-lg border hover:bg-red-500/10 hover:text-red-500"
                      style={{ borderColor: currentTheme.border }}
                      onClick={() => onRemoveChart(chart.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* График */}
                <div className="p-4 h-80">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="animate-spin opacity-40" size={24} />
                    </div>
                  ) : chartDataForDisplay.length > 0 ? (
                    <ChartContainer
                      chart={chart}
                      data={chartDataForDisplay}
                      isFullscreen={false}
                      theme={currentTheme}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <p className="text-xs font-black uppercase">Нет данных</p>
                      <p className="text-[10px] opacity-60 mt-1">Загрузите данные для выбранных ТС</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {charts.filter(chart => visibleCharts[chart.id]).length === 0 && (
        <div className="h-full flex flex-col items-center justify-center opacity-20">
          <EyeOff size={48} />
          <p className="text-xs font-black uppercase mt-4">Все графики скрыты</p>
          <button
            onClick={() => {
              const newVisible = {};
              charts.forEach(chart => {
                newVisible[chart.id] = true;
              });
              setVisibleCharts(newVisible);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-black uppercase"
            style={{ backgroundColor: currentTheme.accent, color: '#000' }}
          >
            ПОКАЗАТЬ ВСЕ ГРАФИКИ
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiChartGrid;