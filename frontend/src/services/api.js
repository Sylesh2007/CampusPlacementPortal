import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placement_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized occurs on a protected route, token might have expired
    if (error.response && error.response.status === 401) {
      const isAuthCheck = error.config.url.includes('/login') || error.config.url.includes('/register');
      if (!isAuthCheck) {
        // Clear expired auth session
        localStorage.removeItem('placement_token');
        localStorage.removeItem('placement_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
