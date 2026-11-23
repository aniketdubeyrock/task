import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000, // 12 second fail-safe timeout against sleeping backends
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized session
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    // Trigger interactive 500 Server Error Modal for any 5xx response
    if (error.response && error.response.status >= 500) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('taskflow:server-error', {
            detail: {
              endpoint: error.config?.url || 'Backend Service',
              message:
                error.response?.data?.message ||
                'Server temporarily unavailable. Our automated recovery system is working on it.',
            },
          })
        );
      }
    }

    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

