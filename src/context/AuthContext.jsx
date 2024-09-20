// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef();
  const isRefreshing = useRef(false);
  const activityTimeoutRef = useRef();
  // const INACTIVITY_TIMEOUT = 10 * 1000; // 10 seconds
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
    // Add a redirect to login page here if needed
  }, []);

  const updateActivity = useCallback(() => {
  // console.log('Activity detected, resetting timeout');
  if (activityTimeoutRef.current) {
    // console.log('Clearing existing timeout');
    clearTimeout(activityTimeoutRef.current);
  }
  // console.log('Setting new timeout');
  activityTimeoutRef.current = setTimeout(() => {
    console.log('Inactivity timeout reached, logging out');
    logout();
  }, INACTIVITY_TIMEOUT);
}, [logout]);

const updateExperienceLevel = useCallback(async (level) => {
  try {
    const response = await axiosInstance.put('/api/users/experience-level', { experienceLevel: level });
    setUser(prevUser => ({ ...prevUser, experienceLevel: response.data.experienceLevel }));
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
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
        
        setTimeout(() => refreshToken(true), 1000);
        
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await axiosInstance.put('/api/auth/user', userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put('/api/auth/change-password', { currentPassword, newPassword });
      updateActivity();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenStored = localStorage.getItem('refreshToken');
      if (token && refreshTokenStored) {
        try {
          const response = await axiosInstance.get('/api/auth/user');
          setUser(response.data);
          refreshToken(true);
          updateActivity();
        } catch (error) {
          if (error.response && error.response.status === 401) {
            try {
              await refreshToken();
              const retryResponse = await axiosInstance.get('/api/auth/user');
              setUser(retryResponse.data);
              updateActivity();
            } catch (refreshError) {
              logout();
            }
          } else {
            logout();
          }
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
    updateUser,
    changePassword,
    updateActivity,
    updateExperienceLevel,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;