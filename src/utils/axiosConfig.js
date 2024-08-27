// src/utils/axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://walrus-app-lqhsg.ondigitalocean.app/backend',
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
        console.log('Attempting to refresh token due to 401 error');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token found in localStorage');
          throw new Error('No refresh token available');
        }
        const response = await axios.post('/api/auth/refresh-token', { refreshToken });
        console.log('Token refresh response:', response.data);
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        axiosInstance.defaults.headers.common['x-auth-token'] = response.data.accessToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;