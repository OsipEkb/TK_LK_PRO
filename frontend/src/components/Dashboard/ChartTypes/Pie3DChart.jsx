import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3D from 'highcharts/highcharts-3d';

if (typeof Highcharts === 'object') {
  Highcharts3D(Highcharts);
}

const Pie3DChart = ({ data, colors, title, theme }) => {
  const options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
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
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: {
            color: theme.text,
            fontSize: '10px',
            fontWeight: '900'
          }
        },
        showInLegend: true
      }
    },
    colors: colors || ['#FFB800', '#ef4444', '#22c55e', '#3b82f6'],
    series: [{
      type: 'pie',
      name: 'Доля',
      data: data || []
    }],
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
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

export default Pie3DChart;