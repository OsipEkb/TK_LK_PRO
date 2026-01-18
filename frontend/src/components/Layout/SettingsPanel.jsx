import React from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

const SettingsPanel = ({ isOpen, onClose }) => {
  const {
    currentTheme,
    themes,
    fontSize,
    borderRadius,
    gridCols,
    changeTheme,
    setFontSize,
    setBorderRadius,
    setGridCols
  } = useThemeContext();

  if (!isOpen) return null;

  return (
    <div className="absolute top-24 right-8 w-80 p-8 rounded-[40px] border shadow-2xl z-[110]"
         style={{
           backgroundColor: currentTheme.card,
           borderColor: currentTheme.border
         }}>

      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">
          Цветовые схемы
        </label>

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(themes).map(key => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className="p-3 rounded-xl border text-[9px] font-black uppercase flex gap-2 items-center"
              style={{
                backgroundColor: themes[key].bg,
                color: themes[key].accent,
                borderColor: currentTheme.border
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: themes[key].accent}} />
              {themes[key].name}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Сетка</span>
            <input
              type="range"
              min="1"
              max="5"
              value={gridCols}
              onChange={(e) => setGridCols(parseInt(e.target.value))}
              className="w-32 accent-current"
              style={{ color: currentTheme.accent }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Текст</span>
            <input
              type="range"
              min="11"
              max="18"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-32 accent-current"
              style={{ color: currentTheme.accent }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Углы</span>
            <input
              type="range"
              min="0"
              max="40"
              value={borderRadius}
              onChange={(e) => setBorderRadius(parseInt(e.target.value))}
              className="w-32 accent-current"
              style={{ color: currentTheme.accent }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border"
          style={{
            backgroundColor: currentTheme.accent,
            color: '#000',
            borderColor: currentTheme.border
          }}
        >
          Готово
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;