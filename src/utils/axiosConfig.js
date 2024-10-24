// src/utils/axiosConfig.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:4500/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  validateStatus: function (status) {
    // Include 403 for verification errors
    return status >= 200 && status < 300 || status === 403;
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle verification errors
    if (error.response?.status === 403 && 
        error.response.data?.message?.includes('verify your email')) {
      return Promise.reject({
        response: error.response,
        isVerificationError: true,
        message: error.response.data.message
      });
    }

    // Handle HTML responses
    if (error.response?.headers['content-type']?.includes('text/html')) {
      return Promise.reject({
        response: error.response,
        isHtmlError: true,
        message: 'Server returned HTML instead of JSON'
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        isNetworkError: true,
        message: 'Network error. Please check your connection.'
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;