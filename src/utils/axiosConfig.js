// src/utils/axiosConfig.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:4500/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('Response error:', error);

    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.statusText);
      console.error('Error Headers:', error.response.headers);
      
      if (error.response.headers['content-type']?.includes('text/html')) {
        console.error('HTML Error Response:', error.response.data);
        // You might want to extract and log only a portion of the HTML if it's too large
        console.error('HTML Error Response (first 500 characters):', error.response.data.substring(0, 500));
      } else {
        console.error('Error Data:', error.response.data);
      }
    } else if (error.request) {
      console.error('Error Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }

    if (error.response?.status === 401 && error.response?.data?.tokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, { refreshToken });
        
        if (response.data && response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          axiosInstance.defaults.headers.common['x-auth-token'] = response.data.accessToken;
          processQueue(null, response.data.accessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (window.authContext && typeof window.authContext.logout === 'function') {
          window.authContext.logout();
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;