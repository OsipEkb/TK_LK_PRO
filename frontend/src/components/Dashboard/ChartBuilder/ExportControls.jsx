import React, { useState } from 'react';
import {
  Download, FileText, Image, Printer, Share2,
  FileJson, FileSpreadsheet, FilePieChart, Check
} from 'lucide-react';
import { useThemeContext } from '../../../contexts/ThemeContext';

const ExportControls = ({ charts, chartData, vehicles, onExport }) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [exportFormat, setExportFormat] = useState('png');
  const [exportOptions, setExportOptions] = useState({
    includeData: true,
    includeCharts: true,
    includeMeta: true,
    highQuality: true,
    transparentBg: false
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportFormats = [
    { id: 'png', label: 'PNG', icon: Image, description: 'Изображение высокого качества' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Документ для печати' },
    { id: 'json', label: 'JSON', icon: FileJson, description: 'Структурированные данные' },
    { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Табличные данные' },
    { id: 'svg', label: 'SVG', icon: FilePieChart, description: 'Масштабируемая графика' }
  ];

  const handleOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExport = async () => {
    if (charts.length === 0) {
      alert('Нет графиков для экспорта');
      return;
    }

    setExporting(true);
    try {
      // Здесь будет логика экспорта
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация

      // Вызываем колбэк для экспорта
      onExport({
        format: exportFormat,
        options: exportOptions,
        timestamp: new Date().toISOString()
      });

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте');
    } finally {
      setExporting(false);
    }
  };

  const handleQuickExport = (format) => {
    setExportFormat(format);
    onExport({
      format,
      options: { includeData: true, includeCharts: true },
      quick: true
    });
  };

  return (
    <div className="border p-6"
         style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

      <div className="text-[10px] font-black uppercase opacity-60 mb-4 flex items-center gap-2">
        <Download size={12} />
        ЭКСПОРТ ДАННЫХ
      </div>

      {/* Статистика */}
      <div className="p-4 rounded-xl border mb-6"
           style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: currentTheme.border }}>
        <div className="text-[9px] font-black uppercase opacity-60 mb-2">ГОТОВО К ЭКСПОРТУ</div>
        <div className="space-y-1">
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>Графиков:</span>
            <span>{charts.length}</span>
          </div>
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>Точек данных:</span>
            <span>{Object.values(chartData).reduce((acc, data) => acc + (data?.length || 0), 0)}</span>
          </div>
          <div className="text-[8px] font-black uppercase opacity-40 flex justify-between">
            <span>Память:</span>
            <span>{Math.round(JSON.stringify(chartData).length / 1024)} KB</span>
          </div>
        </div>
      </div>

      {/* Быстрый экспорт */}
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase opacity-40 mb-3">БЫСТРЫЙ ЭКСПОРТ</div>
        <div className="flex flex-wrap gap-2">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => handleQuickExport(format.id)}
              disabled={exporting}
              className="px-3 py-2 rounded-xl border flex items-center gap-2 text-[9px] font-black uppercase transition-all hover:bg-white/5 disabled:opacity-30"
              style={{ borderColor: currentTheme.border }}
              title={format.description}
            >
              <format.icon size={14} />
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Детальные настройки */}
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase opacity-40 mb-3">НАСТРОЙКИ ЭКСПОРТА</div>
        <div className="space-y-2">
          {Object.entries(exportOptions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase opacity-60">
                {key === 'includeData' && 'Включать данные'}
                {key === 'includeCharts' && 'Включать графики'}
                {key === 'includeMeta' && 'Включать метаданные'}
                {key === 'highQuality' && 'Высокое качество'}
                {key === 'transparentBg' && 'Прозрачный фон'}
              </span>
              <button
                onClick={() => handleOptionChange(key)}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  value ? 'bg-current' : 'bg-white/10'
                }`}
                style={{ color: value ? currentTheme.accent : 'transparent' }}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  value ? 'transform translate-x-5' : 'transform translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Формат экспорта */}
      <div className="mb-6">
        <div className="text-[9px] font-black uppercase opacity-40 mb-3">ФОРМАТ ЭКСПОРТА</div>
        <div className="flex gap-2">
          {exportFormats.map(format => (
            <button
              key={format.id}
              onClick={() => setExportFormat(format.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                exportFormat === format.id ? 'bg-white/10' : 'opacity-40 hover:opacity-100'
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка экспорта */}
      <button
        onClick={handleExport}
        disabled={exporting || charts.length === 0}
        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          exported ? 'bg-green-500' : ''
        }`}
        style={{
          backgroundColor: exported ? '#22c55e' : currentTheme.accent,
          color: '#000'
        }}
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            ЭКСПОРТ...
          </>
        ) : exported ? (
          <>
            <Check size={16} />
            ЭКСПОРТИРОВАНО!
          </>
        ) : (
          <>
            <Download size={16} />
            ВЫПОЛНИТЬ ЭКСПОРТ
          </>
        )}
      </button>

      {/* Дополнительные действия */}
      <div className="flex gap-2 mt-4">
        <button
          className="flex-1 py-2 rounded-xl border text-[9px] font-black uppercase transition-all hover:bg-white/5"
          style={{ borderColor: currentTheme.border }}
        >
          <Printer size={14} className="inline mr-2" />
          ПЕЧАТЬ
        </button>
        <button
          className="flex-1 py-2 rounded-xl border text-[9px] font-black uppercase transition-all hover:bg-white/5"
          style={{ borderColor: currentTheme.border }}
        >
          <Share2 size={14} className="inline mr-2" />
          ПОДЕЛИТЬСЯ
        </button>
      </div>
    </div>
  );
};

export default ExportControls;