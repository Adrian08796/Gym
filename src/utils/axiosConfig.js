// src/utils/axiosConfig.js

import axios from 'axios';

const BASE_URL = 'http://192.168.178.42:4500';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      console.log('Request with token:', config.url);
      console.log('Token being sent:', token);
    } else {
      console.log('Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

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

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('Response error:', error.response?.status, originalRequest.url);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token due to 401 error');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token found in localStorage');
          throw new Error('No refresh token available');
        }
        const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, { refreshToken });
        console.log('Token refresh response:', response.data);
        if (response.data && response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          axiosInstance.defaults.headers.common['x-auth-token'] = response.data.accessToken;
          processQueue(null, response.data.accessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;