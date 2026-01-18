import React, { useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

// Временный fallback для useThemeContext
const useThemeContext = () => {
  return {
    currentTheme: {
      bg: '#050505',
      accent: '#FFB800',
      card: '#111111',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.05)'
    }
  };
};

const Chart3DView = ({ chart, data, theme: propTheme }) => {
  const themeContext = useThemeContext();
  const theme = propTheme || themeContext?.currentTheme;
  const [rotation, setRotation] = useState({ alpha: 15, beta: 15 });
  const [zoom, setZoom] = useState(1);

  if (!theme) return null;

  return (
    <div className="h-full w-full relative">
      <div
        className="h-full w-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Здесь должен быть 3D график, но пока заглушка */}
        <div className="h-full w-full flex items-center justify-center opacity-20">
          <p className="text-xs font-black uppercase">3D ГРАФИК В РАЗРАБОТКЕ</p>
        </div>
      </div>

      {/* Панель управления 3D */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="p-2 rounded-xl border bg-black/50 backdrop-blur-sm hover:bg-black/70"
          style={{ borderColor: theme.border }}
          title="Увеличить"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
          className="p-2 rounded-xl border bg-black/50 backdrop-blur-sm hover:bg-black/70"
          style={{ borderColor: theme.border }}
          title="Уменьшить"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setRotation({ alpha: 15, beta: 15 });
            setZoom(1);
          }}
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
        <div className="text-[10px] font-black uppercase opacity-60">3D РЕЖИМ</div>
        <div className="text-xs font-black mt-1">
          Масштаб: {zoom.toFixed(1)}x
        </div>
      </div>

      {/* Подсказка */}
      <div className="absolute top-4 right-4 p-3 rounded-xl border bg-black/50 backdrop-blur-sm max-w-xs"
           style={{ borderColor: theme.border }}>
        <div className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2">
          <Move size={12} />
          3D ГРАФИК
        </div>
        <div className="text-[9px] opacity-60 mt-1">
          Используйте кнопки для управления отображением
        </div>
      </div>
    </div>
  );
};

export default Chart3DView;