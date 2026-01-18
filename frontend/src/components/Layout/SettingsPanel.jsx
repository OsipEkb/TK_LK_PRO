import React, { useState } from 'react';
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

  const [tempFontSize, setTempFontSize] = useState(fontSize);
  const [tempBorderRadius, setTempBorderRadius] = useState(borderRadius);
  const [tempGridCols, setTempGridCols] = useState(gridCols);

  const handleApply = () => {
    setFontSize(tempFontSize);
    setBorderRadius(tempBorderRadius);
    setGridCols(tempGridCols);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-24 right-8 w-80 p-8 rounded-[40px] border shadow-2xl z-[110] backdrop-blur-sm"
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="space-y-6">
        <div className="text-[10px] font-black uppercase opacity-60 mb-2 block">
          Цветовые схемы
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.keys(themes).map(key => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className="p-3 rounded-xl border text-[9px] font-black uppercase flex gap-2 items-center transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: themes[key].bg,
                color: themes[key].accent,
                borderColor: currentTheme.border
              }}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{backgroundColor: themes[key].accent}} 
              />
              {themes[key].name}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Сетка колонок</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black">{tempGridCols}</span>
              <input
                type="range"
                min="1"
                max="6"
                value={tempGridCols}
                onChange={(e) => setTempGridCols(parseInt(e.target.value))}
                className="w-32 accent-current"
                style={{ color: currentTheme.accent }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Размер текста</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black">{tempFontSize}px</span>
              <input
                type="range"
                min="11"
                max="18"
                value={tempFontSize}
                onChange={(e) => setTempFontSize(parseInt(e.target.value))}
                className="w-32 accent-current"
                style={{ color: currentTheme.accent }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase opacity-40">Скругление углов</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black">{tempBorderRadius}px</span>
              <input
                type="range"
                min="0"
                max="40"
                value={tempBorderRadius}
                onChange={(e) => setTempBorderRadius(parseInt(e.target.value))}
                className="w-32 accent-current"
                style={{ color: currentTheme.accent }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: currentTheme.accent,
              color: '#000',
              borderColor: currentTheme.border
            }}
          >
            Применить
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'transparent',
              color: currentTheme.text,
              borderColor: currentTheme.border
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;