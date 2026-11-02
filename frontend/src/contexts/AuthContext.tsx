import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api-services';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    // data = { access_token, token_type, role }
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    setToken(data.access_token);

    // Fetch full user profile after login
    const profile = await authService.getProfile();
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    await authService.register(name, email, password, phone);
    // Don't auto-login — let the page redirect to /login
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  const updateProfile = (data: { name?: string; phone?: string }) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};