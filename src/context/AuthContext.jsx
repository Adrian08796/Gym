// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef();
  const isRefreshing = useRef(false);
  const activityTimeoutRef = useRef();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  const logout = useCallback(() => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
  }, []);

  const updateActivity = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    activityTimeoutRef.current = setTimeout(() => {
      console.log('Inactivity timeout reached, logging out');
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  const updateExperienceLevel = useCallback(async (level) => {
    try {
      console.log('Updating experience level to:', level);
      const response = await axiosInstance.put('/api/users/experience-level', { experienceLevel: level });
      setUser(prevUser => {
        const updatedUser = { ...prevUser, experienceLevel: response.data.experienceLevel };
        console.log('Updated user:', updatedUser);
        return updatedUser;
      });
      return response.data;
    } catch (error) {
      console.error('Error updating experience level:', error);
      throw error;
    }
  }, []);

  const register = async (username, email, password) => {
    try {
      console.log('Attempting to register user:', username);
      const response = await axiosInstance.post('/api/auth/register', { username, email, password });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const refreshToken = useCallback(async (silent = false) => {
    if (isRefreshing.current) {
      console.log('Token refresh already in progress, skipping');
      return;
    }

    isRefreshing.current = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
  
      const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });
  
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
  
        if (silent) {
          const refreshTime = Math.min((response.data.expiresIn - 60) * 1000, 5 * 60 * 1000);
          refreshTimeoutRef.current = setTimeout(() => refreshToken(true), refreshTime);
        }
  
        return response.data.accessToken;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    } finally {
      isRefreshing.current = false;
    }
  }, [logout]);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      if (response.data?.accessToken && response.data?.refreshToken && response.data?.user) {
        const userData = {
          ...response.data.user,
          experienceLevel: response.data.user.experienceLevel || 'beginner',
          isAdmin: response.data.user.isAdmin || false,
          hasSeenGuide: response.data.user.hasSeenGuide || false
        };
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const updateUser = useCallback(async (userData) => {
    try {
      const response = await axiosInstance.put('/api/users/update', userData);
      if (response.data && response.data.user) {
        setUser(prevUser => ({
          ...prevUser,
          ...response.data.user
        }));
        return response.data.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put('/api/auth/change-password', { currentPassword, newPassword });
      updateActivity();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await axiosInstance.delete('/api/auth/user');
      logout();
      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error.response?.data?.message || error.message || 'Failed to delete account';
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenStored = localStorage.getItem('refreshToken');
      if (token && refreshTokenStored) {
        try {
          const response = await axiosInstance.get('/api/auth/user');
          const userData = {
            ...response.data,
            experienceLevel: response.data.experienceLevel || 'beginner'
          };
          setUser(userData);
          console.log('Restored user session:', userData);
          refreshToken(true);
          updateActivity();
        } catch (error) {
          console.error('Error checking logged in status:', error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    checkLoggedIn();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [refreshToken, logout, updateActivity]);

  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    // Desktop events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Mobile events
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('touchmove', handleActivity);
    window.addEventListener('touchend', handleActivity);

    // Visibility change event (for when user switches tabs or minimizes browser)
    document.addEventListener('visibilitychange', handleActivity);

    // Initialize the timeout
    updateActivity();

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('touchmove', handleActivity);
      window.removeEventListener('touchend', handleActivity);
      document.removeEventListener('visibilitychange', handleActivity);

      // Clear the timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [updateActivity]);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    refreshToken,
    changePassword,
    updateActivity,
    updateExperienceLevel,
    deleteAccount,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;