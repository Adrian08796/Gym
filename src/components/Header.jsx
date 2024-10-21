// src/components/Header.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../components/Header.css';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [isMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  const menuItems = [
    { to: "/guide", text: t("App Guide") },
    { to: "/dashboard", text: t("Dashboard") },
    { to: "/tracker", text: t("Tracker") },
    { to: "/exercises", text: t("Exercises") },
    { to: "/plans", text: t("Plans") },
    { to: "/workout-summary", text: t("History") },
    { to: "/profile", text: t("Profile") },
  ];

  const MenuItem = ({ to, text, onClick }) => (
    <Link 
      to={to} 
      className="nav-btn block w-full text-left hover:bg-gray-700 transition duration-300"
      onClick={() => {
        closeMenu();
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
      onClick={() => {
        closeMenu();
      }}
    >
      {text}
    </Link>
  );

  const handleMenuButtonClick = (e) => {
    e.stopPropagation();
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  return (
    <header className={`bg-gray-800 text-white ${darkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="logo font-heading font-bold flex items-center">
              {t("Level")} <span className='logoSpan'>{t("Up")}</span>
              <div className="pyramid-container">
                <div className="pyramid-level level-1"></div>
                <div className="pyramid-level level-2"></div>
                <div className="pyramid-level level-3"></div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {user && menuItems.map((item) => (
              <MenuItem key={item.to} to={item.to} text={item.text} />
            ))}
            {user ? (
              <button onClick={handleLogout} className="nav-btn nav-btn-danger">{t("Logout")}</button>
            ) : (
              <>
                <AuthButton to="/login" text={t("Login")} />
                <AuthButton to="/register" text={t("Register")} />
              </>
            )}
          </nav>

          {/* ThemeToggle and LanguageSwitcher - Moved outside of the nav for desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button, ThemeToggle, and LanguageSwitcher */}
          <div className="lg:hidden flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <button 
              ref={menuButtonRef}
              className="text-white focus:outline-none"
              onClick={handleMenuButtonClick}
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
          <nav 
            ref={menuRef}
            className="lg:hidden mt-4 bg-gray-700 rounded-lg shadow-lg absolute right-0 w-64 z-50"
            data-aos="fade-left"
            data-aos-duration="300"
          >
            <div className="p-4 space-y-2">
              {user ? (
                <>
                  {menuItems.map((item) => (
                    <MenuItem key={item.to} to={item.to} text={item.text} />
                  ))}
                  <button onClick={handleLogout} className="nav-btn nav-btn-danger block w-full text-left hover:bg-gray-600">
                    {t("Logout")}
                  </button>
                </>
              ) : (
                <>
                  <AuthButton to="/login" text={t("Login")} />
                  <AuthButton to="/register" text={t("Register")} />
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;