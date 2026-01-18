export const THEMES = {
  industrial: {
    name: 'Industrial',
    bg: '#050505',
    accent: '#FFB800',
    card: '#111111',
    text: '#FFFFFF',
    border: 'rgba(255,255,255,0.05)'
  },
  ocean: {
    name: 'Deep Ocean',
    bg: '#0f172a',
    accent: '#38BDF8',
    card: '#1e293b',
    text: '#FFFFFF',
    border: 'rgba(56,189,248,0.1)'
  },
  arctic: {
    name: 'Arctic',
    bg: '#f1f5f9',
    accent: '#2563eb',
    card: '#ffffff',
    text: '#0f172a',
    border: 'rgba(0,0,0,0.08)'
  },
  forest: {
    name: 'Dark Forest',
    bg: '#061006',
    accent: '#4ADE80',
    card: '#0a1a0a',
    text: '#FFFFFF',
    border: 'rgba(74,222,128,0.1)'
  },
  ruby: {
    name: 'Ruby',
    bg: '#1a0505',
    accent: '#F87171',
    card: '#250a0a',
    text: '#FFFFFF',
    border: 'rgba(248,113,113,0.1)'
  },
  midnight: {
    name: 'Midnight',
    bg: '#000000',
    accent: '#A855F7',
    card: '#090909',
    text: '#FFFFFF',
    border: 'rgba(168,85,247,0.1)'
  },
  sunset: {
    name: 'Sunset',
    bg: '#1a120b',
    accent: '#F97316',
    card: '#27190c',
    text: '#FFFFFF',
    border: 'rgba(249,115,22,0.1)'
  }
};

export const MENU_ITEMS = [
  { id: 'online', label: 'Онлайн', icon: 'Truck' },
  { id: 'charts', label: 'Графики', icon: 'LineChart' },
  { id: 'reports', label: 'Отчеты', icon: 'FileText' },
  { id: 'billing', label: 'Счета', icon: 'CreditCard' },
  { id: 'support', label: 'Поддержка', icon: 'Headphones' },
  { id: 'relay', label: 'Ретрансляция', icon: 'Share2' },
  { id: 'ai', label: 'Анализ ИИ', icon: 'BrainCircuit' },
];

export const API_BASE_URL = 'http://127.0.0.1:8000/api';