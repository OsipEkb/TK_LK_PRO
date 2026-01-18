import { useState, useEffect, useCallback } from 'react';
import { THEMES } from '../utils/constants';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('tk_theme');
    return savedTheme ? JSON.parse(savedTheme) : THEMES.industrial;
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

  // Сохраняем настройки в localStorage
  useEffect(() => {
    localStorage.setItem('tk_theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('tk_fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('tk_borderRadius', borderRadius.toString());
  }, [borderRadius]);

  useEffect(() => {
    localStorage.setItem('tk_gridCols', gridCols.toString());
  }, [gridCols]);

  const changeTheme = useCallback((themeKey) => {
    if (THEMES[themeKey]) {
      setCurrentTheme(THEMES[themeKey]);
    }
  }, []);

  const resetTheme = useCallback(() => {
    setCurrentTheme(THEMES.industrial);
    setFontSize(13);
    setBorderRadius(24);
    setGridCols(4);
  }, []);

  return {
    currentTheme,
    fontSize,
    borderRadius,
    gridCols,
    themes: THEMES,
    changeTheme,
    setFontSize,
    setBorderRadius,
    setGridCols,
    resetTheme
  };
};