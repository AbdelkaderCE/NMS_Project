import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const response = await authAPI.getMe();
        // Backend returns: { success, message, data: user }
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Backend returns: { success, message, data: { token, user } }
      const tokenValue = response.data?.token || response.token;
      const userData = response.data?.user || response.data;
      
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(tokenValue);
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Backend returns: { success, message, data: { token, user } }
      const tokenValue = response.data?.token || response.token;
      const user = response.data?.user || response.data;
      
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(tokenValue);
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
