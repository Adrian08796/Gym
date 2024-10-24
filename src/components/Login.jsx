// src/components/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail } from 'react-icons/fi';
import axiosInstance from '../utils/axiosConfig';
import '../components/Header.css';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // For resending verification
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { showToast } = useGymContext();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = t('Username is required');
    if (!password) newErrors.password = t('Password is required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const result = await login(username, password);
        if (result && result.user) {
          showToast('success', 'Success', t('Logged in successfully'));
          setTimeout(() => navigate('/'), 500);
        }
      } catch (err) {
        console.error('Login error:', err);
        if (err.response?.status === 403 && err.response?.data?.message?.includes('verify your email')) {
          showToast('warning', t('Email Verification Required'), t('Please verify your email before logging in'));
          setShowResendForm(true);
        } else {
          showToast('error', 'Error', t(err.response?.data?.message || 'Failed to log in'));
        }
      }
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('error', 'Error', t('Please enter your email address'));
      return;
    }

    try {
      setIsResendingVerification(true);
      await axiosInstance.post('/api/auth/resend-verification', { email });
      showToast('success', 'Success', t('Verification email sent successfully'));
      setShowResendForm(false);
      
      // Start cooldown
      setResendCooldown(300); // 5 minutes in seconds
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      if (error.response?.status === 429) {
        showToast('error', 'Error', t('Please wait before requesting another verification email'));
      } else {
        showToast('error', 'Error', t('Failed to send verification email'));
      }
    } finally {
      setIsResendingVerification(false);
    }
  };

  const formatCooldown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="px-4 py-6 mx-4 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-lg sm:w-full sm:max-w-md">
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          {t('Login to your account')}
        </h3>
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              {t('Username')}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('Enter Username')}
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              {t('Password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('Enter Password')}
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 pr-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button type="submit" className="nav-btn w-full">
              {t('Login')}
            </button>
          </div>
        </form>

        {/* Resend Verification Form */}
        {showResendForm && (
          <div className="mt-6 border-t pt-6 dark:border-gray-700">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {t('Resend Verification Email')}
            </h4>
            <form onSubmit={handleResendVerification}>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t('Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                  disabled={isResendingVerification || resendCooldown > 0}
                  required
                />
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('You can request another email in')} {formatCooldown(resendCooldown)}
                </p>
              ) : (
                <button
                  type="submit"
                  className={`nav-btn w-full mt-4 ${(isResendingVerification || resendCooldown > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isResendingVerification || resendCooldown > 0}
                >
                  {isResendingVerification ? t('Sending...') : t('Resend Verification Email')}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("Don't have an account?")}
            <Link to="/register" className="nav-btn inline-block mt-2 ml-2">
              {t('Sign up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;