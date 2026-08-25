import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return '/api';
  
  // Normalize URL: remove trailing slashes
  const cleanUrl = url.trim().replace(/\/$/, '');
  
  // If the url already contains /api, return it
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  
  // If user pointed it to their login page or similar, extract the root host
  try {
    const parsed = new URL(cleanUrl);
    return `${parsed.origin}/api`;
  } catch (e) {
    return `${cleanUrl}/api`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach the token if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired or invalid tokens automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If we are on the app, force page reload to let AuthContext clear user state
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
