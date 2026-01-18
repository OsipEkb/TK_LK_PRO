import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'; // Добавил только импорт графиков
import {
  Settings, MapPin, X, LogOut, Loader2, Fuel, Clock,
  Hash, Activity, Palette, Type, Square, LayoutGrid,
  BarChart3, Truck, ChevronDown, FileText, CreditCard,
  Headphones, Share2, BrainCircuit, Zap
} from 'lucide-react';

const THEMES = {
  industrial: { name: 'Industrial', bg: '#050505', accent: '#FFB800', card: '#111111', text: '#FFFFFF', border: 'rgba(255,255,255,0.05)' },
  ocean: { name: 'Deep Ocean', bg: '#0f172a', accent: '#38BDF8', card: '#1e293b', text: '#FFFFFF', border: 'rgba(56,189,248,0.1)' },
  arctic: { name: 'Arctic', bg: '#f1f5f9', accent: '#2563eb', card: '#ffffff', text: '#0f172a', border: 'rgba(0,0,0,0.08)' },
  forest: { name: 'Dark Forest', bg: '#061006', accent: '#4ADE80', card: '#0a1a0a', text: '#FFFFFF', border: 'rgba(74,222,128,0.1)' },
  ruby: { name: 'Ruby', bg: '#1a0505', accent: '#F87171', card: '#250a0a', text: '#FFFFFF', border: 'rgba(248,113,113,0.1)' },
  midnight: { name: 'Midnight', bg: '#000000', accent: '#A855F7', card: '#090909', text: '#FFFFFF', border: 'rgba(168,85,247,0.1)' },
  sunset: { name: 'Sunset', bg: '#1a120b', accent: '#F97316', card: '#27190c', text: '#FFFFFF', border: 'rgba(249,115,22,0.1)' }
};

function App() {
  const [credentials, setCredentials] = useState(() => JSON.parse(localStorage.getItem('tk_creds')));
  const [data, setData] = useState({ vehicles: [], online: {}, props: {}, session_id: null, schema_id: null });
  const [activeTab, setActiveTab] = useState('online');
  const [showSettings, setShowSettings] = useState(false);

  // Состояния для аналитики
  const [chartData, setChartData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(THEMES.industrial);
  const [fontSize, setFontSize] = useState(13);
  const [borderRadius, setBorderRadius] = useState(24);
  const [gridCols, setGridCols] = useState(4);

  const fetchData = async (creds) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/init-data/', creds);
      if (res.data) setData(res.data);
    } catch (e) { if (e.response?.status === 401) handleLogout(); }
  };

  // Метод получения истории для графиков
  const fetchHistory = async (vId) => {
    setIsLoading(true);
    setSelectedVehicle(vId);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/analytics/', {
        params: {
          session: data.session_id,
          schema_id: data.schema_id,
          device_id: vId,
          from: new Date(new Date().setHours(0,0,0,0)).toISOString().slice(0, 16).replace('T', ' '),
          to: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }
      });
      setChartData(res.data.points || []);
      setActiveTab('charts');
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (credentials) {
      fetchData(credentials);
      const timer = setInterval(() => fetchData(credentials), 60000);
      return () => clearInterval(timer);
    }
  }, [credentials]);

  const handleLogout = () => {
    localStorage.removeItem('tk_creds');
    setCredentials(null);
  };

  const getDataStatus = (lastData) => {
    if (!lastData) return { label: 'НЕТ СВЯЗИ С ТЕРМИНАЛОМ', color: '#6b7280' };
    const diff = (new Date() - new Date(lastData)) / 1000 / 60;
    if (diff <= 10) return { label: 'ДАННЫЕ АКТУАЛЬНЫЕ', color: '#22c55e' };
    if (diff <= 60) return { label: 'ЗАДЕРЖКА ДАННЫХ', color: '#eab308' };
    return { label: 'ДАННЫЕ УСТАРЕВШИЕ', color: '#ef4444' };
  };

  if (!credentials) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] italic">
      <form onSubmit={(e) => {
        e.preventDefault();
        const creds = { username: e.target.username.value, password: e.target.password.value };
        setCredentials(creds);
        localStorage.setItem('tk_creds', JSON.stringify(creds));
      }} className="w-full max-w-sm bg-[#111] p-10 rounded-[40px] border border-white/5 shadow-2xl">
        <h1 className="text-2xl font-black text-center mb-8 text-white uppercase tracking-tighter">TK_SYSTEM <span className="text-[#FFB800]">PRO</span></h1>
        <input name="username" type="text" placeholder="ЛОГИН" required className="w-full p-4 bg-black border border-white/5 rounded-2xl text-white mb-4 outline-none focus:border-[#FFB800]/50" />
        <input name="password" type="password" placeholder="ПАРОЛЬ" required className="w-full p-4 bg-black border border-white/5 rounded-2xl text-white mb-6 outline-none focus:border-[#FFB800]/50" />
        <button className="w-full py-4 bg-[#FFB800] text-black font-black rounded-2xl uppercase text-[10px] tracking-widest">ВОЙТИ</button>
      </form>
    </div>
  );

  const menuItems = [
    { id: 'online', label: 'Онлайн', icon: Truck },
    { id: 'charts', label: 'Графики', icon: LineChart },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'billing', label: 'Счета', icon: CreditCard },
    { id: 'support', label: 'Поддержка', icon: Headphones },
    { id: 'relay', label: 'Ретрансляция', icon: Share2 },
    { id: 'ai', label: 'Анализ ИИ', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen transition-all duration-300 italic font-sans"
         style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, fontSize: `${fontSize}px` }}>

      <header className="sticky top-0 z-[100] border-b px-8 h-20 flex items-center justify-between shadow-md"
              style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
        <div className="flex items-center gap-8">
          <div className="font-black text-xl tracking-tighter uppercase mr-4">TK_SYSTEM <span style={{color: currentTheme.accent}}>PRO</span></div>
          <nav className="flex items-center gap-1">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest ${activeTab === item.id ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
                style={{ color: activeTab === item.id ? currentTheme.accent : 'inherit' }}>
                <item.icon size={14}/> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettings(!showSettings)} className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <Settings size={20} style={{color: currentTheme.accent}} />
          </button>
          <button onClick={handleLogout} className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"><LogOut size={20} /></button>
        </div>

        {showSettings && (
          <div className="absolute top-24 right-8 w-80 p-8 rounded-[40px] border shadow-2xl z-[110]"
               style={{ backgroundColor: currentTheme.card, borderColor: currentTheme.border }}>
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Цветовые схемы</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(THEMES).map(k => (
                  <button key={k} onClick={() => setCurrentTheme(THEMES[k])} className="p-3 rounded-xl border border-white/5 text-[9px] font-black uppercase flex gap-2 items-center" style={{ backgroundColor: THEMES[k].bg, color: THEMES[k].accent }}>
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: THEMES[k].accent}} /> {THEMES[k].name}
                  </button>
                ))}
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Сетка</span> <input type="range" min="1" max="5" value={gridCols} onChange={(e)=>setGridCols(e.target.value)} className="w-32 accent-current" /></div>
                <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Текст</span> <input type="range" min="11" max="18" value={fontSize} onChange={(e)=>setFontSize(e.target.value)} className="w-32 accent-current" /></div>
                <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Углы</span> <input type="range" min="0" max="40" value={borderRadius} onChange={(e)=>setBorderRadius(e.target.value)} className="w-32 accent-current" /></div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="p-8">
        {activeTab === 'online' ? (
          <div className={`max-w-full mx-auto grid gap-6 transition-all duration-500`}
               style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
            {data.vehicles.map((vh) => {
              const vId = String(vh.ID);
              const online = data.online[vId] || {};
              const props = data.props[vId] || {};
              const statusInfo = getDataStatus(online.LastData);
              const perc = props.MaxFuel > 0 ? Math.round((online.Fuel / props.MaxFuel) * 100) : 0;

              return (
                <div key={vId}
                     onClick={() => fetchHistory(vh.ID)} // Добавил вызов графиков при клике
                     className="p-6 border flex flex-col justify-between h-[450px] relative transition-all shadow-xl group cursor-pointer"
                     style={{ backgroundColor: currentTheme.card, borderRadius: `${borderRadius}px`, borderColor: currentTheme.border }}>

                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusInfo.color, boxShadow: `0 0 15px ${statusInfo.color}` }} />
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="w-2/3">
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-none truncate">{vh.Name}</h3>
                      <div className="text-[10px] font-bold opacity-40 uppercase mt-2">{props.RegNumber}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-3xl font-black italic" style={{color: currentTheme.accent}}>{Math.round(online.Speed || 0)}</div>
                       <div className="text-[9px] font-black opacity-40 uppercase">КМ/Ч</div>
                    </div>
                  </div>

                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex gap-3 items-start my-2">
                    <MapPin size={16} className="shrink-0 mt-0.5" style={{color: currentTheme.accent}} />
                    <p className="text-[11px] leading-tight opacity-70 line-clamp-2 min-h-[32px]">{online.Address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {online.Moto > 0 && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                        <span className="text-[8px] font-black opacity-30 uppercase block mb-1 flex items-center gap-1"><Clock size={10}/> Мото</span>
                        <div className="font-black italic text-xl">{online.Moto}</div>
                      </div>
                    )}
                    <div className={`bg-white/5 p-4 rounded-2xl border border-white/5 ${online.Moto > 0 ? '' : 'col-span-2'}`}>
                      <span className="text-[8px] font-black opacity-30 uppercase block mb-1 flex items-center gap-1"><Activity size={10}/> Статус связи</span>
                      <div className="font-black text-[10px] mt-1 uppercase" style={{color: statusInfo.color}}>{statusInfo.label}</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[32px] text-black shadow-inner mt-4 relative overflow-hidden transition-transform group-hover:scale-[1.02]" style={{backgroundColor: currentTheme.accent}}>
                    <div className="flex justify-between items-end mb-1 relative z-10">
                      <span className="uppercase text-[9px] font-black flex items-center gap-1"><Fuel size={12}/> Топливо {perc}%</span>
                      <span className="text-2xl font-black italic">{Math.round(online.Fuel || 0)} Л</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 rounded-full mt-3 overflow-hidden relative z-10">
                      <div className="h-full bg-black/80 transition-all duration-1000" style={{ width: `${perc}%` }} />
                    </div>
                  </div>

                  <div className={`mt-4 text-[10px] font-black uppercase flex items-center gap-2 px-2 ${online.Ignition ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`w-2 h-2 rounded-full ${online.Ignition ? 'animate-pulse' : ''}`} style={{backgroundColor: online.Ignition ? '#22c55e' : 'currentColor'}} />
                    {online.Ignition ? <span className="text-green-500">Зажигание ВКЛ</span> : 'Зажигание выкл'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'charts' ? (
          <div className="h-[70vh] w-full p-10 bg-black/10 rounded-[40px] border border-white/5 shadow-inner">
             {isLoading ? (
               <div className="h-full flex items-center justify-center opacity-20 italic font-black uppercase tracking-[1em]">Синхронизация данных...</div>
             ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentTheme.accent} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={currentTheme.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="t" hide />
                    <YAxis strokeOpacity={0.1} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                    <Legend />
                    <Area type="monotone" dataKey="f" name="Топливо (Л)" stroke={currentTheme.accent} fill="url(#colorFuel)" strokeWidth={3} />
                    <Line type="monotone" dataKey="s" name="Скорость (КМ/Ч)" stroke="#ef4444" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center opacity-10 italic">Выберите ТС в режиме Онлайн для построения графика</div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20">
             <BrainCircuit size={100} strokeWidth={1} />
             <h2 className="text-4xl font-black uppercase tracking-tighter mt-4">Раздел {activeTab}</h2>
             <p className="mt-2 text-sm italic">Функционал находится на стадии калибровки ИИ</p>
          </div>
        )}
      </main>

      <style>{`
        input[type="range"] { -webkit-appearance: none; background: rgba(255,255,255,0.05); height: 4px; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: currentColor; cursor: pointer; border: 2px solid white; }
      `}</style>
    </div>
  );
}

export default App;