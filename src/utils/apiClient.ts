import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Success:', response.config.method?.toUpperCase(), response.config.url); // Debug logging
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data, 'URL:', error.config?.url); // Debug logging
    if (error.response?.status === 401) {
      console.log('API Error - 401, redirecting to login'); // Debug logging
      // Logout logic
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      console.log('API Error - showing error message'); // Debug logging
      message.error(error.response?.data?.message || 'An error occurred');
    }
    return Promise.reject(error);
  }
);

export default apiClient;