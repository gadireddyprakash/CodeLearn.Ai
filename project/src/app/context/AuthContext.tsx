import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string; email: string; username: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string; profile?: any; stats?: any; progress?: any;
}

interface AuthContextType {
  user: User | null; userProgress: any | null;
  isAuthenticated: boolean; isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, role?: string, otp?: string) => Promise<void>;
  logout: () => void;
  updateProgress: (progress: any) => Promise<void>;
  refreshProgress: (language: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth must be inside AuthProvider'); return c; };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try { const d = await authAPI.getMe(); setUser(d.user); }
        catch { localStorage.removeItem('authToken'); localStorage.removeItem('user'); }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const d = await authAPI.login({ email, password });
    localStorage.setItem('authToken', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
    setUser(d.user);
  };

  const signup = async (email: string, username: string, password: string, role = 'student', otp?: string) => {
    const d = await authAPI.register({ email, username, password, role, otp });
    localStorage.setItem('authToken', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
    setUser(d.user);
  };

  const logout = () => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); setUser(null); setUserProgress(null); };
  const refreshUser = async () => { try { const d = await authAPI.getMe(); setUser(d.user); } catch {} };
  const refreshProgress = async (language: string) => { if (!user) return; const s = localStorage.getItem(`progress_${language}`); if (s) setUserProgress(JSON.parse(s)); };
  const updateProgress = async (progress: any) => { if (!userProgress) return; const u = { ...userProgress, ...progress }; localStorage.setItem(`progress_${userProgress.language}`, JSON.stringify(u)); setUserProgress(u); };

  return (
    <AuthContext.Provider value={{ user, userProgress, isAuthenticated: !!user, isLoading, login, signup, logout, updateProgress, refreshProgress, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
