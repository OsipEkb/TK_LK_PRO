import React from 'react';
import * as Icons from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';

const Header = ({ activeTab, setActiveTab, onSettingsClick, onLogout }) => {
  const { currentTheme } = useThemeContext();

  const MENU_ITEMS = [
    { id: 'online', label: 'Онлайн', icon: 'Truck' },
    { id: 'charts', label: 'Графики', icon: 'LineChart' },
    { id: 'reports', label: 'Отчеты', icon: 'FileText' },
    { id: 'billing', label: 'Счета', icon: 'CreditCard' },
    { id: 'support', label: 'Поддержка', icon: 'Headphones' },
    { id: 'relay', label: 'Ретрансляция', icon: 'Share2' },
    { id: 'ai', label: 'Анализ ИИ', icon: 'BrainCircuit' },
  ];

  const getIconComponent = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={14} /> : <Icons.Square size={14} />;
  };

  return (
    <header
      className="sticky top-0 z-[100] border-b px-8 h-20 flex items-center justify-between shadow-md backdrop-blur-sm"
      style={{
        backgroundColor: currentTheme.card,
        borderColor: currentTheme.border,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center gap-8">
        <div className="font-black text-xl tracking-tighter uppercase mr-4">
          TK_SYSTEM <span style={{ color: currentTheme.accent }}>PRO</span>
        </div>
        <nav className="flex items-center gap-1">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest ${
                activeTab === item.id
                  ? 'bg-white/10'
                  : 'opacity-40 hover:opacity-100 hover:bg-white/5'
              }`}
              style={{
                color: activeTab === item.id ? currentTheme.accent : currentTheme.text
              }}
            >
              {getIconComponent(item.icon)}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSettingsClick}
          className="p-3 rounded-2xl bg-white/5 border border-white/5 transition-transform active:scale-95 hover:bg-white/10"
          style={{ borderColor: currentTheme.border }}
        >
          <Icons.Settings size={20} style={{ color: currentTheme.accent }} />
        </button>
        <button
          onClick={onLogout}
          className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 transition-transform active:scale-95 hover:bg-red-500/20"
          style={{ borderColor: currentTheme.border }}
        >
          <Icons.LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;