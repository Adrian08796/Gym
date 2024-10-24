// src/utils/axiosConfig.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_HOST || 'http://localhost:4500/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  validateStatus: function (status) {
    // Add 403 for verification errors while maintaining existing validation
    return status >= 200 && status < 300 || status === 403;
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

// Enhanced error logging with verification-specific details
const logError = (error) => {
  console.error('Response error:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    isVerificationError: error.response?.status === 403 && 
      error.response?.data?.message?.includes('verify your email'),
    isRateLimitError: error.response?.status === 429
  });
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

    // Enhanced error logging
    logError(error);

    if (error.response) {
      // Handle verification-specific errors
      if (error.response.status === 403 && 
          error.response.data?.message?.includes('verify your email')) {
        return Promise.reject({
          response: error.response,
          isVerificationError: true,
          message: error.response.data.message
        });
      }

      // Handle rate limiting for verification requests
      if (error.response.status === 429) {
        return Promise.reject({
          response: error.response,
          isRateLimitError: true,
          message: error.response.data.message,
          retryAfter: error.response.headers['retry-after']
        });
      }

      // Handle token expiration and refresh
      if (error.response.status === 401 && 
          error.response.data?.tokenExpired && 
          !originalRequest._retry) {
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
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          
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

      // Handle HTML responses (error pages)
      if (error.response.headers['content-type']?.includes('text/html')) {
        console.error('HTML Error Response (first 500 characters):', 
          error.response.data.substring(0, 500));
        return Promise.reject({
          response: error.response,
          isHtmlError: true,
          message: 'Server returned HTML instead of JSON'
        });
      }
    } else if (error.request) {
      console.error('Error Request:', error.request);
      return Promise.reject({
        request: error.request,
        isNetworkError: true,
        message: 'No response received from server'
      });
    } else {
      console.error('Error Message:', error.message);
    }

    return Promise.reject(error);
  }
);

// Add utility methods for verification-related requests
axiosInstance.verificationRequests = {
  resendVerification: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      if (error.isRateLimitError) {
        throw new Error('Please wait before requesting another verification email');
      }
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await axiosInstance.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid or expired verification token');
      }
      throw error;
    }
  }
};

export default axiosInstance;