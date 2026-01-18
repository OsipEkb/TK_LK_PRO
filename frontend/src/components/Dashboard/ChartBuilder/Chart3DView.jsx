import React, { useMemo, useState, useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';
import { RotateCw, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';

// Инициализация 3D модуля
if (typeof Highcharts === 'object') {
  Highcharts3D(Highcharts);
}

const Chart3DView = ({ chart, data, theme }) => {
  const [rotation, setRotation] = useState({ alpha: 15, beta: 15 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  // Подготовка данных для 3D графика
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Для 3D столбцов
    if (chart.type === 'column') {
      const categories = [...new Set(data.map(d => d.vehicle))];
      const paramCategories = [...new Set(chart.dataKeys)];

      return paramCategories.map((param, paramIndex) => ({
        name: param.toUpperCase(),
        data: categories.map((category, catIndex) => {
          const vehicleData = data.filter(d => d.vehicle === category);
          const avgValue = vehicleData.reduce((sum, d) => sum + (d[param] || 0), 0) / vehicleData.length;
          return [catIndex, paramIndex, Math.round(avgValue * 100) / 100];
        }),
        color: chart.style.colors[paramIndex % chart.style.colors.length]
      }));
    }

    // Для 3D рассеивания
    return chart.dataKeys.map((key, index) => ({
      name: key.toUpperCase(),
      data: data
        .filter(point => point[key] !== undefined)
        .map((point, i) => ({
          x: i,
          y: point[key],
          z: Math.random() * 100, // Для 3D эффекта
          vehicle: point.vehicle
        })),
      type: 'scatter3d',
      color: chart.style.colors[index % chart.style.colors.length]
    }));
  }, [data, chart]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: chart.type === 'pie' ? 'pie' : chart.type === 'column' ? 'column3d' : 'scatter3d',
      options3d: {
        enabled: true,
        alpha: rotation.alpha,
        beta: rotation.beta,
        depth: 100,
        viewDistance: 25,
        frame: {
          bottom: { size: 1, color: 'rgba(255,255,255,0.1)' },
          back: { size: 1, color: 'rgba(255,255,255,0.1)' },
          side: { size: 1, color: 'rgba(255,255,255,0.1)' }
        }
      },
      backgroundColor: 'transparent',
      animation: chart.style.animation,
      style: {
        fontFamily: 'inherit',
        fontWeight: '900'
      }
    },
    title: {
      text: null
    },
    subtitle: {
      text: null
    },
    plotOptions: {
      column3d: {
        depth: 25,
        grouping: false,
        groupZPadding: 10
      },
      scatter3d: {
        width: 10,
        height: 10,
        depth: 10
      },
      pie: {
        depth: 45,
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        }
      }
    },
    xAxis: {
      type: chart.type === 'column3d' ? 'category' : 'linear',
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      },
      title: {
        text: null
      }
    },
    yAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      },
      title: {
        text: null
      }
    },
    zAxis: {
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      },
      title: {
        text: null
      }
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: theme.text,
        textTransform: 'uppercase',
        fontSize: '9px',
        fontWeight: '900'
      }
    },
    tooltip: {
      formatter: function() {
        if (chart.type === 'scatter3d') {
          return `
            <b>${this.point.vehicle}</b><br/>
            ${this.series.name}: <b>${this.point.y}</b>
          `;
        }
        return `<b>${this.point.name || this.point.category}</b>: ${this.point.y}`;
      },
      backgroundColor: '#000',
      borderColor: theme.border,
      style: {
        color: theme.text,
        fontSize: '10px',
        fontWeight: '900'
      }
    },
    colors: chart.style.colors,
    series: chartData,
    credits: {
      enabled: false
    }
  }), [chart, chartData, rotation, theme]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      alpha: Math.max(0, Math.min(90, prev.alpha - deltaY / 5)),
      beta: (prev.beta + deltaX / 5) % 360
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev / 1.2));
  };

  const handleReset = () => {
    setRotation({ alpha: 15, beta: 15 });
    setZoom(1);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="h-full w-full relative">
      <div
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{
            className: 'h-full w-full',
            style: { transform: `scale(${zoom})`, transformOrigin: 'center center' }
          }}
          ref={chartRef}
        />
      </div>

      {/* Панель управления 3D */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl border bg-black/50 backdrop-blur-sm hover:bg-black/70"
          style={{ borderColor: theme.border }}
          title="Увеличить"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl border bg-black/50 backdrop-blur-sm hover:bg-black/70"
          style={{ borderColor: theme.border }}
          title="Уменьшить"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl border bg-black/50 backdrop-blur-sm hover:bg-black/70"
          style={{ borderColor: theme.border }}
          title="Сбросить вид"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Индикатор углов */}
      <div className="absolute top-4 left-4 p-3 rounded-xl border bg-black/50 backdrop-blur-sm"
           style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-black uppercase opacity-60">УГЛЫ</div>
        <div className="text-xs font-black mt-1">
          α: {rotation.alpha.toFixed(1)}° β: {rotation.beta.toFixed(1)}°
        </div>
      </div>

      {/* Подсказка */}
      <div className="absolute top-4 right-4 p-3 rounded-xl border bg-black/50 backdrop-blur-sm max-w-xs"
           style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2">
          <Move size={12} />
          УПРАВЛЕНИЕ 3D
        </div>
        <div className="text-[9px] opacity-60 mt-1">
          Перетаскивайте для вращения, колесо мыши для масштаба
        </div>
      </div>
    </div>
  );
};

export default Chart3DView;