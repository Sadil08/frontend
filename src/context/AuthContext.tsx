"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  role: 'STUDENT' | 'ADMIN';
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload); // Debug logging
        setUser({ id: payload.id, role: payload.role, email: payload.sub });
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('No token found in localStorage'); // Debug logging
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role, email: payload.sub });
    } catch (error) {
      console.error('Invalid token during login:', error);
      setUser(userData); // Fallback to provided userData
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
