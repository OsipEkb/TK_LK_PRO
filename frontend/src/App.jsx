import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ChartsTab from './components/Dashboard/ChartsTab';
import OnlineTab from './components/Dashboard/OnlineTab';
import ReportsTab from './components/Dashboard/ReportsTab';
import Header from './components/Layout/Header';
import SettingsPanel from './components/Layout/SettingsPanel';
import { BrainCircuit } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('tk_creds');
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState({
    vehicles: [],
    online: {},
    props: {},
    session_id: null,
    schema_id: null
  });

  const [activeTab, setActiveTab] = useState('online');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Тестовые данные для разработки
  const mockVehicles = [
    { ID: 1, Name: '644 Freightliner', RegNumber: 'А123ВС777' },
    { ID: 2, Name: '776 Freightliner', RegNumber: 'В234СД888' },
    { ID: 3, Name: '336 Freightliner', RegNumber: 'С345ЕФ999' },
    { ID: 4, Name: '716 Freightliner', RegNumber: 'Е456ЖЗ000' },
    { ID: 5, Name: '031 Freightliner', RegNumber: 'К567ЛМ111' },
    { ID: 6, Name: '363 Freightliner', RegNumber: 'М678НП222' },
    { ID: 7, Name: '376 Freightliner', RegNumber: 'Н789РС333' },
    { ID: 8, Name: '652 Freightliner', RegNumber: 'П890ТУ444' },
    { ID: 9, Name: '653 Freightliner', RegNumber: 'Р901ФХ555' },
    { ID: 10, Name: '375 Freightliner', RegNumber: 'С012ЦЧ666' },
    { ID: 11, Name: '708 Freightliner', RegNumber: 'Т123ШЩ777' },
    { ID: 12, Name: '212 Freightliner', RegNumber: 'У234ЪЫ888' },
    { ID: 13, Name: '635 Freightliner', RegNumber: 'Ф345ЬЭ999' }
  ];

  const fetchData = async (creds) => {
    setIsLoading(true);
    try {
      // Пробуем загрузить с бэкенда
      const res = await axios.post(`${API_BASE}/init-data/`, creds, {
        timeout: 5000
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.log('Используем тестовые данные:', e.message);
      // Используем тестовые данные если бэкенд не доступен
      setData({
        vehicles: mockVehicles,
        online: {},
        props: {},
        session_id: '478EEE7A',
        schema_id: 'fad66447-fe18-4a2a-a7b9-945eab775fda'
      });

      if (e.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (credentials) {
      fetchData(credentials);
      const timer = setInterval(() => fetchData(credentials), 60000);
      return () => clearInterval(timer);
    }
  }, [credentials]);

  const handleLogin = async (username, password) => {
    try {
      // Тестовая авторизация
      const creds = { username, password };
      setCredentials(creds);
      localStorage.setItem('tk_creds', JSON.stringify(creds));

      // Загружаем данные
      await fetchData(creds);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tk_creds');
    setCredentials(null);
    setData({ vehicles: [], online: {}, props: {}, session_id: null, schema_id: null });
  };

  // Если нет авторизации - показываем форму входа
  if (!credentials) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-[#050505] italic">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const success = await handleLogin(username, password);
            if (!success) {
              alert('Ошибка авторизации. Используем тестовый режим.');
            }
          }} className="w-full max-w-sm bg-[#111] p-10 rounded-[40px] border border-white/5 shadow-2xl">
            <h1 className="text-2xl font-black text-center mb-8 text-white uppercase tracking-tighter">
              TK_SYSTEM <span className="text-[#FFB800]">PRO</span>
            </h1>
            <input
              name="username"
              type="text"
              placeholder="ЛОГИН"
              defaultValue="admin"
              className="w-full p-4 bg-black border border-white/5 rounded-2xl text-white mb-4 outline-none focus:border-[#FFB800]/50"
            />
            <input
              name="password"
              type="password"
              placeholder="ПАРОЛЬ"
              defaultValue="admin"
              className="w-full p-4 bg-black border border-white/5 rounded-2xl text-white mb-6 outline-none focus:border-[#FFB800]/50"
            />
            <button className="w-full py-4 bg-[#FFB800] text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:opacity-90 transition-opacity">
              ВОЙТИ
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleLogin('demo', 'demo')}
                className="text-xs opacity-40 hover:opacity-100"
              >
                Демо доступ
              </button>
            </div>
          </form>
        </div>
      </ThemeProvider>
    );
  }

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="h-[78vh] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB800] mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            ЗАГРУЗКА СИСТЕМЫ...
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'online':
        return (
          <OnlineTab
            sessionId={data.session_id}
            schemaId={data.schema_id}
            vehicles={data.vehicles || mockVehicles}
          />
        );
      case 'charts':
        return (
          <ChartsTab
            sessionId={data.session_id}
            schemaId={data.schema_id}
            vehicles={data.vehicles || mockVehicles}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            sessionId={data.session_id}
            schemaId={data.schema_id}
            vehicles={data.vehicles || mockVehicles}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20">
            <BrainCircuit size={100} strokeWidth={1} />
            <h2 className="text-4xl font-black uppercase tracking-tighter mt-4">
              Раздел {activeTab}
            </h2>
            <p className="mt-2 text-sm italic">
              Функционал находится на стадии калибровки
            </p>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen italic font-sans">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSettingsClick={() => setShowSettings(!showSettings)}
            onLogout={handleLogout}
          />

          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />

          <main className="p-8">
            {renderTabContent()}
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;