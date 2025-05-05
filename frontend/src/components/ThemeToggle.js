import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant={theme === 'light' ? 'dark' : 'light'}
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
      size="sm"
    >
      {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'} Mode
    </Button>
  );
};

export default ThemeToggle;