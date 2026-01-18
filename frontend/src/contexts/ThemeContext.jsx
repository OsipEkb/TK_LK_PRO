import React, { createContext, useContext, useState, useEffect } from 'react';

const THEMES = {
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
  },
  cyberpunk: {
    name: 'Cyberpunk',
    bg: '#0a0a1a',
    accent: '#FF00FF',
    card: '#151530',
    text: '#FFFFFF',
    border: 'rgba(255,0,255,0.2)'
  },
  gold: {
    name: 'Gold',
    bg: '#1a1406',
    accent: '#FFD700',
    card: '#2a200a',
    text: '#FFFFFF',
    border: 'rgba(255,215,0,0.2)'
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('tk_theme');
    return saved ? JSON.parse(saved) : THEMES.industrial;
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('tk_fontSize');
    return saved ? parseInt(saved) : 13;
  });

  const [borderRadius, setBorderRadius] = useState(() => {
    const saved = localStorage.getItem('tk_borderRadius');
    return saved ? parseInt(saved) : 24;
  });

  const [gridCols, setGridCols] = useState(() => {
    const saved = localStorage.getItem('tk_gridCols');
    return saved ? parseInt(saved) : 4;
  });

  const changeTheme = (themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(THEMES[themeKey]);
      localStorage.setItem('tk_theme', JSON.stringify(THEMES[themeKey]));
    }
  };

  const handleSetFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('tk_fontSize', size.toString());
  };

  const handleSetBorderRadius = (radius) => {
    setBorderRadius(radius);
    localStorage.setItem('tk_borderRadius', radius.toString());
  };

  const handleSetGridCols = (cols) => {
    setGridCols(cols);
    localStorage.setItem('tk_gridCols', cols.toString());
  };

  const resetTheme = () => {
    setCurrentTheme(THEMES.industrial);
    setFontSize(13);
    setBorderRadius(24);
    setGridCols(4);
    localStorage.removeItem('tk_theme');
    localStorage.removeItem('tk_fontSize');
    localStorage.removeItem('tk_borderRadius');
    localStorage.removeItem('tk_gridCols');
  };

  const themeValue = {
    currentTheme,
    fontSize,
    borderRadius,
    gridCols,
    themes: THEMES,
    changeTheme,
    setFontSize: handleSetFontSize,
    setBorderRadius: handleSetBorderRadius,
    setGridCols: handleSetGridCols,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div
        className="min-h-screen transition-all duration-300"
        style={{
          backgroundColor: currentTheme.bg,
          color: currentTheme.text,
          fontSize: `${fontSize}px`
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};