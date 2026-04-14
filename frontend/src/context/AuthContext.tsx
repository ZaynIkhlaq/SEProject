import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  email: string;
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'brand' | 'influencer') => Promise<void>;
  registerBrand: (email: string, password: string, companyName: string, industry: string, budgetTier: string) => Promise<void>;
  registerInfluencer: (email: string, password: string, niche: string, platform: string, followerCount: number, engagementRate: number) => Promise<void>;
  logout: () => void;
  api: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [isLoading, setIsLoading] = useState(false);

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL: '/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const newAccessToken = response.data.data.accessToken;
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(error.config);
        } catch {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (email: string, password: string, role: 'brand' | 'influencer') => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.data.user);
      setAccessToken(response.data.data.accessToken);
      setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const registerBrand = async (email: string, password: string, companyName: string, industry: string, budgetTier: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register/brand', {
        email,
        password,
        companyName,
        industry,
        budgetTier,
      });
      setUser(response.data.data.user);
      setAccessToken(response.data.data.accessToken);
      setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const registerInfluencer = async (email: string, password: string, niche: string, platform: string, followerCount: number, engagementRate: number) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register/influencer', {
        email,
        password,
        niche,
        platform,
        followerCount,
        engagementRate,
      });
      setUser(response.data.data.user);
      setAccessToken(response.data.data.accessToken);
      setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken,
      isLoading,
      login,
      registerBrand,
      registerInfluencer,
      logout,
      api,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
