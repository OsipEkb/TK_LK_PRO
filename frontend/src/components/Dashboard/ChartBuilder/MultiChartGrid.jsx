import React, { useState, useRef, useEffect } from 'react';
import {
  X, Maximize2, Minimize2, Edit2, Settings, RefreshCw,
  Copy, Download as DownloadIcon, Eye, EyeOff
} from 'lucide-react';
import ReactGridLayout from 'react-grid-layout';
import { useThemeContext } from '../../../contexts/ThemeContext';
import ChartContainer from './ChartContainer';
import Chart3DView from './Chart3DView';

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

    chart.vehicleIds.forEach(vehicleId => {
      const vehicleData = chartData[vehicleId];
      if (!vehicleData || !Array.isArray(vehicleData)) return;

      const vehicle = vehicles.find(v => v.ID.toString() === vehicleId);

      vehicleData.forEach(point => {
        const dataPoint = {
          t: new Date(point.t).getTime(),
          vehicle: vehicle?.Name || `ID: ${vehicleId}`,
          vehicleId
        };

        // Добавляем все параметры из point
        Object.keys(point).forEach(key => {
          if (key !== 't' && point[key] !== undefined) {
            dataPoint[key] = point[key];
          }
        });

        allData.push(dataPoint);
      });
    });

    // Сортируем по времени
    return allData.sort((a, b) => a.t - b.t);
  };

  // Обработчик изменения layout
  const onLayoutChange = (newLayout) => {
    newLayout.forEach(item => {
      const chart = charts.find(c => c.id === item.i);
      if (chart) {
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

  // Дублирование графика
  const duplicateChart = (chartId) => {
    const chartToDuplicate = charts.find(c => c.id === chartId);
    if (!chartToDuplicate) return;

    const newChart = {
      ...chartToDuplicate,
      id: `chart-${Date.now()}`,
      title: `${chartToDuplicate.title} (копия)`,
      layout: {
        ...chartToDuplicate.layout,
        x: chartToDuplicate.layout.x + 1,
        y: chartToDuplicate.layout.y + 1
      }
    };

    onUpdateChart(chartId, { duplicate: newChart });
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
            {chart.title}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateChart(chart.id, { title: prompt('Новое название:', chart.title) || chart.title })}
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
          {viewMode === '3d' ? (
            <Chart3DView
              chart={chart}
              data={chartDataForDisplay}
              theme={currentTheme}
            />
          ) : (
            <ChartContainer
              chart={chart}
              data={chartDataForDisplay}
              isFullscreen={true}
              theme={currentTheme}
            />
          )}
        </div>

        <div className="mt-6 flex justify-between items-center text-sm opacity-60">
          <div>
            {chart.vehicleIds.length} ТС • {chart.dataKeys.length} параметров • {chartDataForDisplay.length} точек
          </div>
          <div className="text-xs font-black uppercase">
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  // Режим сетки (Grid Layout)
  if (layoutMode === 'grid') {
    const layout = charts
      .filter(chart => visibleCharts[chart.id])
      .map(chart => ({
        i: chart.id,
        x: chart.layout.x,
        y: chart.layout.y,
        w: chart.layout.w,
        h: chart.layout.h,
        minW: chart.layout.minW,
        minH: chart.layout.minH
      }));

    return (
      <div className="relative h-full">
        {editMode && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded-xl bg-current text-black text-xs font-black uppercase"
              style={{ backgroundColor: currentTheme.accent }}
            >
              Сохранить компоновку
            </button>
          </div>
        )}

        {charts.filter(chart => visibleCharts[chart.id]).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <EyeOff size={48} />
            <p className="text-xs font-black uppercase mt-4">Все графики скрыты</p>
          </div>
        ) : (
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
            {charts
              .filter(chart => visibleCharts[chart.id])
              .map(chart => {
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
                        onClick={() => duplicateChart(chart.id)}
                        title="Дублировать"
                      >
                        <Copy size={12} />
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
                          value={chart.title}
                          onChange={(e) => onUpdateChart(chart.id, { title: e.target.value })}
                          className="text-sm font-black uppercase bg-transparent border-none outline-none w-full truncate"
                          style={{ color: currentTheme.text }}
                        />
                        {editMode && (
                          <div className="flex gap-1 ml-2">
                            <button
                              className="p-1 rounded hover:bg-white/10"
                              onClick={() => onUpdateChart(chart.id, {
                                layout: { ...chart.layout, w: Math.max(2, chart.layout.w - 1) }
                              })}
                            >
                              -
                            </button>
                            <span className="text-xs opacity-60">{chart.layout.w}×{chart.layout.h}</span>
                            <button
                              className="p-1 rounded hover:bg-white/10"
                              onClick={() => onUpdateChart(chart.id, {
                                layout: { ...chart.layout, w: chart.layout.w + 1 }
                              })}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-black uppercase opacity-40 mt-1 flex items-center gap-2">
                        <span>{chart.type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{chart.vehicleIds.length} ТС</span>
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
                        viewMode === '3d' ? (
                          <Chart3DView
                            chart={chart}
                            data={chartDataForDisplay}
                            theme={currentTheme}
                          />
                        ) : (
                          <ChartContainer
                            chart={chart}
                            data={chartDataForDisplay}
                            isFullscreen={false}
                            theme={currentTheme}
                          />
                        )
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                          <p className="text-xs font-black uppercase">Нет данных</p>
                          <p className="text-[10px] opacity-60 mt-1">Загрузите данные для ТС</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </ReactGridLayout>
        )}

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
                title={chart.title}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Режим masonry (каменная кладка)
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
                    <div className="text-sm font-black uppercase truncate">{chart.title}</div>
                    <div className="text-[10px] font-black uppercase opacity-40 mt-1">
                      {chart.type.toUpperCase()} • {chart.vehicleIds.length} ТС
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
                    viewMode === '3d' ? (
                      <Chart3DView
                        chart={chart}
                        data={chartDataForDisplay}
                        theme={currentTheme}
                      />
                    ) : (
                      <ChartContainer
                        chart={chart}
                        data={chartDataForDisplay}
                        isFullscreen={false}
                        theme={currentTheme}
                      />
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <p className="text-xs font-black uppercase">Нет данных</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MultiChartGrid;