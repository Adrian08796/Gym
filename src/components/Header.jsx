// src/components/Header.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/tracker", text: "Workout Tracker" },
    { to: "/exercises", text: "Exercise Library" },
    { to: "/plans", text: "Workout Plans" },
    { to: "/workout-summary", text: "Workout History" },
    { to: "/profile", text: "Profile" },
  ];

  const MenuItem = ({ to, text, onClick }) => (
    <Link 
      to={to} 
      className="block py-2 px-4 text-sm hover:bg-gray-700 text-gray-300 hover:text-white"
      onClick={() => {
        setIsMenuOpen(false);
        onClick && onClick();
      }}
    >
      {text}
    </Link>
  );

  const AuthButton = ({ to, text }) => (
    <Link 
      to={to} 
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
    >
      {text}
    </Link>
  );

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-heading font-bold">Gym App</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <>
                {menuItems.map((item) => (
                  <MenuItem key={item.to} to={item.to} text={item.text} />
                ))}
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <AuthButton to="/login" text="Login" />
                <AuthButton to="/register" text="Register" />
              </>
            )}
            <button 
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-300 ease-in-out"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-700 rounded-lg shadow-lg">
            {user ? (
              <>
                {menuItems.map((item) => (
                  <MenuItem key={item.to} to={item.to} text={item.text} />
                ))}
                <MenuItem to="/" text="Logout" onClick={handleLogout} />
              </>
            ) : (
              <>
                <AuthButton to="/login" text="Login" />
                <AuthButton to="/register" text="Register" />
              </>
            )}
            <button 
              onClick={() => {
                toggleDarkMode();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-4 text-sm hover:bg-gray-600 text-gray-300 hover:text-white"
            >
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;