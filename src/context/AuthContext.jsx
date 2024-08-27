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

  const refreshToken = useCallback(async (silent = false) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/api/auth/refresh-token', { refreshToken });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      if (silent) {
        // Schedule the next refresh based on expiresIn
        const refreshTime = (response.data.expiresIn - 60) * 1000; // 60 seconds before expiry
        refreshTimeoutRef.current = setTimeout(() => refreshToken(true), refreshTime);
      }

      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenStored = localStorage.getItem('refreshToken');
      if (token && refreshTokenStored) {
        try {
          const response = await axiosInstance.get('/api/auth/user');
          setUser(response.data);
          refreshToken(true); // Start silent refresh cycle
        } catch (error) {
          console.error('Error fetching user:', error);
          if (error.response && error.response.status === 401) {
            try {
              await refreshToken();
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
    };
  }, [refreshToken, logout]);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { username, password });

      if (response.data && response.data.accessToken && response.data.refreshToken && response.data.user) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
        refreshToken(true); // Start silent refresh cycle
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      await axiosInstance.post('/api/auth/register', { username, email, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
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