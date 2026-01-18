import React, { useState } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

const ReportsTab = ({ sessionId, schemaId, vehicles }) => {
  const { currentTheme, borderRadius } = useThemeContext();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReports({
        session: sessionId,
        schema_id: schemaId,
        from: `${dateFrom} 00:00`,
        to: `${dateTo} 23:59`
      });
      setReports(data);
    } catch (e) {
      console.error(e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 italic animate-in fade-in duration-500 h-[78vh]">
      <div className="p-8 border border-white/5 flex items-end gap-8 shadow-xl"
           style={{
             backgroundColor: currentTheme.card,
             borderRadius: `${borderRadius}px`,
             borderColor: currentTheme.border
           }}>
        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase opacity-30 flex items-center gap-2">
              <Calendar size={12}/> ПЕРИОД ОТЧЕТА
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-black/60 border border-white/5 p-3 rounded-xl text-[10px] text-white outline-none"
                style={{ borderColor: currentTheme.border }}
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-black/60 border border-white/5 p-3 rounded-xl text-[10px] text-white outline-none"
                style={{ borderColor: currentTheme.border }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-10 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-30"
          style={{
            backgroundColor: currentTheme.accent,
            color: '#000'
          }}
        >
          {loading ? 'ОБРАБОТКА...' : 'СФОРМИРОВАТЬ ОТЧЕТ'}
        </button>
      </div>

      <div className="border border-white/5 overflow-hidden shadow-2xl flex-1"
           style={{
             backgroundColor: currentTheme.card,
             borderRadius: `${borderRadius}px`,
             borderColor: currentTheme.border
           }}>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[9px] font-black uppercase opacity-40">
              <th className="p-6">Транспорт</th>
              <th className="p-6">Пробег (км)</th>
              <th className="p-6">Моточасы</th>
              <th className="p-6">Макс. Скорость</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? reports.map((r, i) => (
              <tr key={i} className="border-b border-white/5 text-[11px] font-black uppercase">
                <td className="p-6">{r.name}</td>
                <td className="p-6">{r.distance}</td>
                <td className="p-6">{r.engine_hours}</td>
                <td className="p-6" style={{ color: currentTheme.accent }}>{r.max_speed}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-20 text-center opacity-10 uppercase font-black text-[10px] tracking-widest">
                  Нет данных для отчета. Сформируйте отчет за выбранный период.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTab;