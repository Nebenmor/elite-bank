/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { authAPI, userAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        accountNumber: userData.accountNumber,
        balance: userData.balance,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      toast.success('Login successful!');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(email, password, fullName);
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateBalance = useMemo(() => (newBalance: number) => {
    setUser((currentUser) => {
      if (currentUser) {
        return { ...currentUser, balance: newBalance };
      }
      return currentUser;
    });
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    loading,
    updateBalance,
  }), [user, loading, login, signup, logout, updateBalance]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};