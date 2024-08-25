// src/utils/axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://walrus-app-lqhsg.ondigitalocean.app/backend', // Update this with your actual backend URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh-token', { refreshToken });
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        axios.defaults.headers.common['x-auth-token'] = response.data.accessToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;