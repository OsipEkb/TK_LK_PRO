import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import Highcharts3D from 'highcharts/highcharts-3d';
import HighchartsTreeMap from 'highcharts/modules/treemap';
import HighchartsHeatMap from 'highcharts/modules/heatmap';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import HighchartsSankey from 'highcharts/modules/sankey';
import HighchartsFunnel from 'highcharts/modules/funnel';
import HighchartsExporting from 'highcharts/modules/exporting';

// Инициализация всех модулей Highcharts
if (typeof Highcharts === 'object') {
  HighchartsMore(Highcharts);
  Highcharts3D(Highcharts);
  HighchartsTreeMap(Highcharts);
  HighchartsHeatMap(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsSankey(Highcharts);
  HighchartsFunnel(Highcharts);
  HighchartsExporting(Highcharts);

  Highcharts.setOptions({
    lang: {
      thousandsSep: ' ',
      decimalPoint: ','
    }
  });
}

const ChartContainer = ({ chart, data, isFullscreen, theme }) => {
  const chartOptions = useMemo(() => {
    // Базовые опции для всех типов графиков
    const baseOptions = {
      chart: {
        backgroundColor: 'transparent',
        type: chart.type,
        animation: chart.style.animation,
        options3d: chart.style.is3D ? {
          enabled: true,
          alpha: 15,
          beta: 15,
          depth: 50,
          viewDistance: 25
        } : undefined,
        style: {
          fontFamily: 'inherit',
          fontWeight: '900',
          fontSize: '10px'
        },
        spacing: [20, 20, 20, 20],
        height: isFullscreen ? '85%' : '100%'
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            theme: {
              fill: 'transparent',
              stroke: 'none'
            }
          }
        }
      },
      colors: chart.style.colors,
      plotOptions: {
        series: {
          marker: {
            enabled: chart.style.showPoints,
            radius: 4,
            symbol: 'circle'
          },
          lineWidth: chart.style.lineWidth,
          shadow: chart.style.shadows,
          fillOpacity: chart.type === 'area' ? 0.4 : undefined,
          states: {
            hover: {
              lineWidth: chart.style.lineWidth + 2
            }
          }
        }
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: theme.text,
          textTransform: 'uppercase',
          fontSize: '9px',
          fontWeight: '900'
        },
        itemHoverStyle: {
          color: theme.accent
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        padding: 10,
        itemDistance: 20
      },
      xAxis: {
        type: 'datetime',
        gridLineColor: 'rgba(255,255,255,0.05)',
        gridLineWidth: 1,
        labels: {
          style: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: '9px',
            fontWeight: '900'
          }
        },
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: null
        },
        gridLineColor: 'rgba(255,255,255,0.05)',
        gridLineWidth: 1,
        labels: {
          style: {
            color: 'rgba(255,255,255,0.4)',
            fontSize: '9px',
            fontWeight: '900'
          }
        }
      },
      tooltip: {
        shared: true,
        crosshairs: true,
        backgroundColor: '#000',
        borderColor: theme.border,
        borderRadius: 20,
        style: {
          color: theme.text,
          fontSize: '10px',
          fontWeight: '900'
        },
        formatter: function() {
          const date = new Date(this.x).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          let tooltip = `<div style="font-weight: 900; margin-bottom: 8px;">${date}</div>`;

          this.points?.forEach(point => {
            const value = point.y !== null && point.y !== undefined
              ? Math.round(point.y * 100) / 100
              : '—';
            tooltip += `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: ${point.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span style="font-weight: 900;">${point.series.name}:</span>
                <span style="margin-left: auto; font-weight: 900;">${value}</span>
              </div>
            `;
          });

          return tooltip;
        }
      }
    };

    // Подготовка серий данных для разных типов графиков
    const prepareSeriesData = () => {
      if (!data || data.length === 0) return [];

      // Для линейных графиков, областей, столбцов
      if (['line', 'spline', 'area', 'column', 'bar'].includes(chart.type)) {
        // Группируем данные по ТС и параметрам
        const seriesMap = {};

        data.forEach(point => {
          chart.dataKeys.forEach(key => {
            if (point[key] !== undefined) {
              const seriesKey = `${point.vehicle}-${key}`;
              if (!seriesMap[seriesKey]) {
                seriesMap[seriesKey] = {
                  name: `${point.vehicle} (${key.toUpperCase()})`,
                  data: [],
                  type: chart.type === 'area' ? 'area' : chart.type,
                  color: chart.style.colors[
                    Object.keys(seriesMap).length % chart.style.colors.length
                  ]
                };
              }
              seriesMap[seriesKey].data.push([point.t, point[key]]);
            }
          });
        });

        return Object.values(seriesMap);
      }

      // Для круговых диаграмм
      if (chart.type === 'pie') {
        // Агрегируем данные по ТС
        const aggregatedData = {};

        data.forEach(point => {
          const vehicleName = point.vehicle;
          if (!aggregatedData[vehicleName]) {
            aggregatedData[vehicleName] = { sum: 0, count: 0 };
          }

          chart.dataKeys.forEach(key => {
            if (point[key] !== undefined) {
              aggregatedData[vehicleName].sum += point[key];
              aggregatedData[vehicleName].count++;
            }
          });
        });

        return [{
          type: 'pie',
          name: 'Суммарные значения',
          data: Object.entries(aggregatedData).map(([name, values], index) => ({
            name,
            y: values.sum,
            color: chart.style.colors[index % chart.style.colors.length]
          })),
          size: '80%',
          showInLegend: true
        }];
      }

      // Для спидометров
      if (chart.type === 'gauge') {
        const lastData = data[data.length - 1];
        if (!lastData) return [];

        return [{
          type: 'gauge',
          data: chart.dataKeys.map((key, index) => ({
            name: key.toUpperCase(),
            y: lastData[key] || 0,
            color: chart.style.colors[index % chart.style.colors.length]
          }))
        }];
      }

      // По умолчанию возвращаем простой линейный график
      return chart.dataKeys.map((key, index) => ({
        name: key.toUpperCase(),
        data: data
          .filter(point => point[key] !== undefined)
          .map(point => [point.t, point[key]]),
        type: 'spline',
        color: chart.style.colors[index % chart.style.colors.length]
      }));
    };

    const seriesData = prepareSeriesData();

    // Специфичные настройки для разных типов графиков
    const typeSpecificOptions = {};

    switch (chart.type) {
      case 'area':
        typeSpecificOptions.plotOptions = {
          area: {
            fillOpacity: 0.4,
            stacking: 'normal'
          }
        };
        break;

      case 'column':
      case 'bar':
        typeSpecificOptions.plotOptions = {
          column: {
            grouping: false,
            pointPadding: 0.2,
            borderWidth: 0
          }
        };
        break;

      case 'pie':
        typeSpecificOptions.plotOptions = {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y:.1f}',
              style: {
                color: theme.text,
                fontSize: '10px',
                fontWeight: '900'
              }
            },
            showInLegend: true,
            depth: chart.style.is3D ? 45 : 0
          }
        };
        typeSpecificOptions.tooltip = {
          pointFormat: '{series.name}: <b>{point.y:.1f}</b>'
        };
        break;

      case 'gauge':
        typeSpecificOptions.pane = {
          startAngle: -90,
          endAngle: 90,
          background: null,
          center: ['50%', '75%'],
          size: '110%'
        };
        typeSpecificOptions.yAxis = {
          min: 0,
          max: 100,
          tickPixelInterval: 72,
          tickPosition: 'inside',
          tickColor: theme.text,
          tickLength: 20,
          tickWidth: 2,
          minorTickInterval: null,
          labels: {
            distance: 20,
            style: {
              fontSize: '10px',
              fontWeight: '900'
            }
          },
          plotBands: [{
            from: 0,
            to: 50,
            color: '#55BF3B',
            thickness: 20
          }, {
            from: 50,
            to: 80,
            color: '#DDDF0D',
            thickness: 20
          }, {
            from: 80,
            to: 100,
            color: '#DF5353',
            thickness: 20
          }]
        };
        break;
    }

    return {
      ...baseOptions,
      ...typeSpecificOptions,
      series: seriesData
    };
  }, [chart, data, isFullscreen, theme]);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-10">
        <p className="text-xs font-black uppercase">НЕТ ДАННЫХ ДЛЯ ОТОБРАЖЕНИЯ</p>
        <p className="text-[10px] opacity-60 mt-1">Загрузите данные для выбранных ТС</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        containerProps={{ className: 'h-full w-full' }}
      />
    </div>
  );
};

export default ChartContainer;