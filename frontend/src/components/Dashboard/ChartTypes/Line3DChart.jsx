import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';

if (typeof Highcharts === 'object') {
  Highcharts3D(Highcharts);
}

const Line3DChart = ({ data, colors, title, theme }) => {
  const options = {
    chart: {
      type: 'line',
      options3d: {
        enabled: true,
        alpha: 15,
        beta: 15,
        depth: 50,
        viewDistance: 25
      },
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit',
        fontWeight: '900'
      }
    },
    title: {
      text: title,
      style: {
        color: theme.text,
        fontSize: '14px',
        fontWeight: '900'
      }
    },
    plotOptions: {
      line: {
        depth: 50,
        marker: {
          enabled: true,
          radius: 3
        }
      }
    },
    xAxis: {
      type: 'datetime',
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      }
    },
    yAxis: {
      title: {
        text: null
      },
      gridLineColor: 'rgba(255,255,255,0.05)',
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      }
    },
    zAxis: {
      title: {
        text: null
      },
      labels: {
        style: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: '9px'
        }
      }
    },
    legend: {
      itemStyle: {
        color: theme.text,
        textTransform: 'uppercase',
        fontSize: '9px',
        fontWeight: '900'
      }
    },
    colors: colors || ['#FFB800'],
    series: data || [],
    tooltip: {
      formatter: function() {
        const date = new Date(this.x).toLocaleString('ru-RU');
        return `<b>${date}</b><br/>${this.series.name}: <b>${this.y?.toFixed(2) || 0}</b>`;
      },
      backgroundColor: '#000',
      borderColor: theme.border,
      style: {
        color: theme.text,
        fontSize: '10px',
        fontWeight: '900'
      }
    },
    credits: {
      enabled: false
    }
  };

  return (
    <div className="h-full w-full">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Line3DChart;