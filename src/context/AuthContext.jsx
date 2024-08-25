// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Checking logged in status with token');
          const response = await axiosInstance.get('/api/auth/user');
          console.log('User data received:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          if (error.response && error.response.status === 401) {
            try {
              await refreshToken();
              // Retry fetching user data with new token
              const retryResponse = await axiosInstance.get('/api/auth/user');
              setUser(retryResponse.data);
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [refreshToken]);

  const register = async (username, email, password) => {
    try {
      console.log('Attempting to register user:', username);
      await axiosInstance.post('/api/auth/register', { username, email, password });
      console.log('Registration successful');
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Attempting to log in user:', username);
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const value = {
    user,
    register,
    login,
    logout,
    loading,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;