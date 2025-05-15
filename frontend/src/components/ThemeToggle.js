import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button 
      variant={theme === 'light' ? 'outline-dark' : 'outline-light'} 
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <FaMoon /> : <FaSun />}
    </Button>
  );
};

export default ThemeToggle;