import React from 'react';
import * as Icons from 'lucide-react';
import { MENU_ITEMS } from '../../utils/constants';

const Header = ({ activeTab, setActiveTab, onSettingsClick, onLogout }) => {
  const getIconComponent = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={14} /> : <Icons.Square size={14} />;
  };

  return (
    <header className="sticky top-0 z-[100] border-b px-8 h-20 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-8">
        <div className="font-black text-xl tracking-tighter uppercase mr-4">
          TK_SYSTEM <span className="text-[#FFB800]">PRO</span>
        </div>
        <nav className="flex items-center gap-1">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest ${
                activeTab === item.id
                  ? 'bg-white/10 text-[#FFB800]'
                  : 'opacity-40 hover:opacity-100'
              }`}
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
          className="p-3 rounded-2xl bg-white/5 border border-white/5"
        >
          <Icons.Settings size={20} className="text-[#FFB800]" />
        </button>
        <button
          onClick={onLogout}
          className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"
        >
          <Icons.LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;