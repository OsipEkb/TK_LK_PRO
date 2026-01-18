import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';
import { Search, Calendar, BarChart3, Zap } from 'lucide-react';
import axios from 'axios';

if (typeof Highcharts === 'object') { highcharts3d(Highcharts); }

const Analytics = ({ sessionId, schemaId, vehicles, currentTheme, borderRadius }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [series, setSeries] = useState([]);

    const today = new Date().toISOString().split('T')[0];
    const [dateFrom, setDateFrom] = useState(today);
    const [timeFrom, setTimeFrom] = useState('00:00');
    const [dateTo, setDateTo] = useState(today);
    const [timeTo, setTimeTo] = useState('23:59');

    const toggleVehicle = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const buildCharts = async () => {
        if (selectedIds.length === 0) return alert("Выберите ТС в списке слева!");
        setLoading(true);
        try {
            const results = await Promise.all(selectedIds.map(async (id) => {
                const res = await axios.get('http://127.0.0.1:8000/api/analytics/', {
                    params: {
                        session: sessionId,
                        schema_id: schemaId,
                        device_id: id,
                        from: `${dateFrom} ${timeFrom}`,
                        to: `${dateTo} ${timeTo}`
                    }
                });
                const v = vehicles.find(vh => String(vh.ID) === String(id));
                return {
                    name: v ? v.Name : `ID: ${id}`,
                    data: res.data.track || res.data.points || [],
                    type: 'spline'
                };
            }));
            setSeries(results.filter(r => r.data.length > 0));
        } catch (e) {
            console.error(e);
            alert("Ошибка связи с сервером");
        } finally { setLoading(false); }
    };

    const chartOptions = {
        chart: { backgroundColor: 'transparent', type: 'spline', zoomType: 'x' },
        title: { text: '' },
        xAxis: { type: 'datetime', gridLineColor: 'rgba(255,255,255,0.05)' },
        yAxis: { title: { text: 'Скорость/Уровень' }, gridLineColor: 'rgba(255,255,255,0.05)' },
        legend: { itemStyle: { color: currentTheme.text, textTransform: 'uppercase', fontSize: '10px' } },
        series: series,
        plotOptions: { series: { marker: { enabled: false } } }
    };

    return (
        <div className="flex gap-6 h-[78vh] italic">
            {/* Сайдбар */}
            <div className="w-80 flex flex-col border border-white/5 p-6" style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px` }}>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={14} />
                    <input type="text" placeholder="ПОИСК..." className="w-full bg-black/20 border border-white/5 p-2 pl-10 rounded-xl text-[10px] outline-none" onChange={e => setSearchTerm(e.target.value.toLowerCase())} />
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                    {vehicles.filter(v => v.Name.toLowerCase().includes(searchTerm)).map(v => (
                        <div key={v.ID} onClick={() => toggleVehicle(v.ID)} className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${selectedIds.includes(v.ID) ? 'border-white/20 bg-white/5' : 'border-transparent opacity-40'}`}>
                            <div className={`w-3 h-3 rounded-sm border ${selectedIds.includes(v.ID) ? 'bg-current' : ''}`} style={{color: currentTheme.accent}} />
                            <span className="text-[10px] font-black uppercase">{v.Name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* График */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="p-6 border border-white/5 flex items-end gap-6" style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px` }}>
                    <div className="flex gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-30 flex items-center gap-1"><Calendar size={10}/> Период с</label>
                            <div className="flex gap-1">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none" />
                                <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} className="bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-30 flex items-center gap-1"><Calendar size={10}/> По</label>
                            <div className="flex gap-1">
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none" />
                                <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} className="bg-black/40 border border-white/5 p-2 rounded-lg text-[10px] text-white outline-none" />
                            </div>
                        </div>
                    </div>
                    <button onClick={buildCharts} disabled={loading} className="ml-auto px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all" style={{ backgroundColor: loading ? '#333' : currentTheme.accent, color: '#000' }}>
                        {loading ? 'ЗАГРУЗКА...' : 'ПОСТРОИТЬ ГРАФИК'}
                    </button>
                </div>

                <div className="flex-1 border border-white/5 p-8 relative overflow-hidden" style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px` }}>
                    {series.length > 0 ? (
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <BarChart3 size={48} />
                            <p className="text-[10px] font-black uppercase mt-4">Нет данных для отображения</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;