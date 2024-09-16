import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      onClick={toggleDarkMode}
      className="test nav-btn-cycle relative rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none overflow-hidden"
      style={{
        width: '5rem',
        height: '2.5rem',
        backgroundColor: 'transparent',
        border: '2px solid #45FFCA',
        boxShadow: darkMode ? '0 0 10px #45FFCA' : 'none'
      }}
    >
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center`}
        style={{
          backgroundColor: '#45FFCA',
          transform: darkMode ? 'translateX(100%)' : 'translateX(0)',
        }}
      >
        {darkMode ? (
          <svg className="w-4 h-4 text-backgroundDark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-backgroundDark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <span 
          className={`text-xs font-semibold transition-opacity duration-300 ${darkMode ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: darkMode ? 'white' : 'white' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
        <span 
          className={`text-xs font-semibold transition-opacity duration-300 ${darkMode ? 'opacity-0' : 'opacity-100'}`}
          style={{ color: darkMode ? 'white' : 'white' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </span>
      </div>
    </button>
  );
};

export default ThemeToggle;