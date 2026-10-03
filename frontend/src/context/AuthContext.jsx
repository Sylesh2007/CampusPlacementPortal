import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('placement_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('placement_user');
    const savedToken = localStorage.getItem('placement_token');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('placement_user');
        localStorage.removeItem('placement_token');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setUser(receivedUser);
        setToken(receivedToken);
        localStorage.setItem('placement_token', receivedToken);
        localStorage.setItem('placement_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (registrationData) => {
    try {
      const response = await api.post('/register', registrationData);
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setUser(receivedUser);
        setToken(receivedToken);
        localStorage.setItem('placement_token', receivedToken);
        localStorage.setItem('placement_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placement_token');
    localStorage.removeItem('placement_user');
  };

  const value = {
    user,
    token,
    loading,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
