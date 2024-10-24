// src/components/PasswordReset.jsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import axiosInstance from '../utils/axiosConfig';
import { useTranslation } from 'react-i18next';

function PasswordReset() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useGymContext();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t("Passwords don't match"));
      return;
    }

    if (password.length < 6) {
      setError(t('Password must be at least 6 characters'));
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      showToast('success', 'Success', t('Password reset successfully'));
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || t('Error resetting password'));
      showToast('error', 'Error', t('Failed to reset password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
          {t("Reset Password")}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("New Password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("Confirm Password")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="nav-btn w-full"
            disabled={isLoading}
          >
            {isLoading ? t("Resetting...") : t("Reset Password")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset;