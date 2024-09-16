// src/components/Header.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import '../components/Header.css';

function Header() {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/tracker", text: "Tracker" },
    { to: "/exercises", text: "Exercises" },
    { to: "/plans", text: "Plans" },
    { to: "/workout-summary", text: "History" },
    { to: "/profile", text: "Profile" },
  ];

  const MenuItem = ({ to, text, onClick }) => (
    <Link 
      to={to} 
      className="nav-btn block w-full text-left hover:bg-gray-700 transition duration-300"
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
      className="nav-btn"
      onClick={() => setIsMenuOpen(false)}
    >
      {text}
    </Link>
  );

  return (
    <header className={`bg-gray-800 text-white ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="logo font-heading font-bold">
            Level <span className='logoSpan'>Up</span>
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {user && menuItems.map((item) => (
              <MenuItem key={item.to} to={item.to} text={item.text} />
            ))}
            {user ? (
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            ) : (
              <>
                <AuthButton to="/login" text="Login" />
                <AuthButton to="/register" text="Register" />
              </>
            )}
          </nav>

          {/* ThemeToggle - Moved outside of the nav for desktop */}
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button and ThemeToggle */}
          <div className="lg:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button 
              className="text-white focus:outline-none"
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 bg-gray-700 rounded-lg shadow-lg">
            {user ? (
              <>
                {menuItems.map((item) => (
                  <MenuItem key={item.to} to={item.to} text={item.text} />
                ))}
                <button onClick={handleLogout} className="nav-btn block w-full text-left hover:bg-gray-600">
                  Logout
                </button>
              </>
            ) : (
              <div className="p-4 space-y-2">
                <AuthButton to="/login" text="Login" />
                <AuthButton to="/register" text="Register" />
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;