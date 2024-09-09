// src/context/AuthContext.jsx

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
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    activityTimeoutRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

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
  
        await new Promise(resolve => setTimeout(resolve, 1000));
  
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
      if (error.response?.status !== 500) {
        logout();
      }
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
          console.error('Error fetching user:', error);
          if (error.response?.status === 401) {
            try {
              await refreshToken();
              const retryResponse = await axiosInstance.get('/api/auth/user');
              setUser(retryResponse.data);
              updateActivity();
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
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
      clearTimeout(refreshTimeoutRef.current);
      clearTimeout(activityTimeoutRef.current);
    };
  }, [refreshToken, logout, updateActivity]);

  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
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
    updateActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;