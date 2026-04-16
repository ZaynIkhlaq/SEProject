import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
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
  login: (email: string, password: string, role: 'brand' | 'influencer') => Promise<User>;
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
  const [isLoading, setIsLoading] = useState(true);

  // Create axios instance with auth headers
  const api = useMemo(() => axios.create({
    baseURL: '/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  }), []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
  }, [api]);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  // Keep both API clients in sync for pages that still use raw axios.
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common.Authorization;
      delete axios.defaults.headers.common.Authorization;
    }
  }, [accessToken, api]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedAccessToken) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${storedAccessToken}`,
          },
        });

        if (!mounted) return;

        setUser(response.data.data);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      } catch {
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearAuthState]);

  // Handle token refresh
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && refreshToken && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
            const newAccessToken = response.data.data.accessToken;

            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
          } catch {
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [api, refreshToken, logout]);

  const login = async (email: string, password: string, role: 'brand' | 'influencer') => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const loggedInUser = response.data.data.user as User;

      setUser(loggedInUser);
      setAccessToken(response.data.data.accessToken);
      setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return loggedInUser;
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
