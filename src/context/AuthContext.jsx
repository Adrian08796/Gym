// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const register = async (username, email, password) => {
    try {
      await axios.post('http://localhost:4500/api/auth/register', { username, email, password });
      // Registration successful, but don't log in automatically
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:4500/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setUser({ id: response.data.userId });
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}