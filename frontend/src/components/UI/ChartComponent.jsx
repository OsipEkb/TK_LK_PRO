import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ChartComponent = ({ data, theme, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase tracking-[1em]">
        Синхронизация данных...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center opacity-10 italic">
        Выберите ТС в режиме Онлайн для построения графика
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3} />
            <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="t" hide />
        <YAxis strokeOpacity={0.1} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#000',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px'
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="f"
          name="Топливо (Л)"
          stroke={theme.accent}
          fill="url(#colorFuel)"
          strokeWidth={3}
        />
        <Line
          type="monotone"
          dataKey="s"
          name="Скорость (КМ/Ч)"
          stroke="#ef4444"
          dot={false}
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;