import axios from 'axios';

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api/v1`
    : 'http://localhost:8000/api/v1');
const API_BASE_URL = rawBase.replace(/\/+$/, '');

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token from localStorage if available
authApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('skillmatch_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface LoginPayload {
  identity: string;
  password: string;
  require_2fa?: boolean;
  code?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
  tenant_id?: string;
}

export const authService = {
  async login(credentials: LoginPayload) {
    const { data } = await authApi.post('/auth/login-json', credentials);
    if (data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('skillmatch_auth_token', data.access_token);
      if (data.user) {
        localStorage.setItem('skillmatch_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  async register(userData: RegisterPayload) {
    const { data } = await authApi.post('/auth/register', userData);
    if (data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('skillmatch_auth_token', data.access_token);
      if (data.user) {
        localStorage.setItem('skillmatch_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  async sendVerification(email: string, purpose: 'signup' | 'login' = 'signup') {
    const { data } = await authApi.post('/auth/send-verification', { email, purpose });
    return data;
  },

  async verifyCode(email: string, code: string, purpose: 'signup' | 'login' = 'signup') {
    const { data } = await authApi.post('/auth/verify-code', { email, code, purpose });
    return data;
  },

  async refresh() {
    const { data } = await authApi.post('/auth/refresh');
    if (data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('skillmatch_auth_token', data.access_token);
    }
    return data;
  },

  async getProfile() {
    const { data } = await authApi.get('/auth/me');
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillmatch_auth_token');
      localStorage.removeItem('skillmatch_user');
    }
  },

  getSavedUser() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillmatch_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  getSavedToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('skillmatch_auth_token');
    }
    return null;
  }
};
