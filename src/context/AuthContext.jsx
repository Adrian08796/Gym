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
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from server');
      } else {
        console.error('Error details:', error.message);
        throw error;
      }
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
      console.log('Attempting to refresh token with:', refreshToken);
  
      if (!refreshToken) {
        console.log('No refresh token found in localStorage');
        throw new Error('No refresh token available');
      }
  
      const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });
      console.log('Refresh token response:', response.data);
  
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
  
        // Add a small delay after token refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        if (silent) {
          const refreshTime = Math.min((response.data.expiresIn - 60) * 1000, 5 * 60 * 1000);
          console.log('Scheduling next refresh in', refreshTime, 'ms');
          refreshTimeoutRef.current = setTimeout(() => refreshToken(true), refreshTime);
        }
  
        return response.data.accessToken;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error.response && error.response.status === 500) {
        console.log('Server error during token refresh, will retry');
        // Don't logout immediately on server error, maybe retry
      } else {
        logout();
      }
      throw error;
    } finally {
      isRefreshing.current = false;
    }
  }, [logout]);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for user:', username);
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      console.log('Login response:', response.data);

      if (response.data && response.data.accessToken && response.data.refreshToken && response.data.user) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser({
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email
        });
        console.log('User set after login:', response.data.user);
        
        // Add a small delay before initiating the first token refresh
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
    console.log('FETCHING USER');
    const checkLoggedIn = async () => {
      console.log('Checking if user is logged in');
      const token = localStorage.getItem('token');
      const refreshTokenStored = localStorage.getItem('refreshToken');
      if (token && refreshTokenStored) {
        try {
          console.log('Attempting to fetch user data');
          const response = await axiosInstance.get('/api/auth/user');
          console.log('User data fetched:::: :', response.data);
          setUser(response.data);
          refreshToken(true);
          updateActivity();
        } catch (error) {
          console.error('Error fetching user:', error);
          if (error.response && error.response.status === 401) {
            try {
              console.log('Token expired, attempting to refresh');
              await refreshToken();
              const retryResponse = await axiosInstance.get('/api/auth/user');
              console.log('User data fetched after refresh:::: :', retryResponse.data);
              setUser(retryResponse.data);
              updateActivity();
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              logout();
            }
          } else {
            console.log('Unexpected error, logging out');
            logout();
          }
        }
      } else {
        console.log('No tokens found, user is not logged in');
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

    // Add event listeners for user activity
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