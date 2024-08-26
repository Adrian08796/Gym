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
        // Schedule the next refresh
        refreshTimeoutRef.current = setTimeout(() => refreshToken(true), (response.data.expiresIn - 60) * 1000);
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
    // Optionally, invalidate the token on the server
    axiosInstance.post('/api/auth/logout').catch(console.error);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
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

  const register = async (username, email, password) => {
    try {
      await axiosInstance.post('/api/auth/register', { username, email, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      
      if (response.data && response.data.accessToken && response.data.user) {
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