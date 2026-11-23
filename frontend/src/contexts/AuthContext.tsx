import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('taskflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('taskflow_token'));
  // If there's already a cached user in localStorage, don't block the screen with full screen loader
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskflow_user');
    const storedToken = localStorage.getItem('taskflow_token');
    return Boolean(storedToken && !saved);
  });

  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && isMounted) {
            setUser(res.data.data);
            localStorage.setItem('taskflow_user', JSON.stringify(res.data.data));
          }
        } catch {
          if (isMounted) {
            logout();
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    verifyAuth();

    // Safety timeout: Never stay in loading state longer than 6 seconds
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('taskflow_token', jwtToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('taskflow_token', jwtToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSuperAdmin,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

