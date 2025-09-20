import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, User, UserLogin, UserRegister } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (loginData: UserLogin) => Promise<void>;
  register: (registerData: UserRegister) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@phillysafe_user';
const TOKEN_STORAGE_KEY = '@phillysafe_token';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        apiService.setAuthToken(storedToken);
      }
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const saveTokenToStorage = async (token: string) => {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  };

  const removeUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  };

  const login = async (loginData: UserLogin) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await apiService.loginUser(loginData);
      // apiService.loginUser sets the token internally; persist it
      const token = apiService.getAuthToken();
      if (token) await saveTokenToStorage(token);
      setUser(userData);
      await saveUserToStorage(userData);
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: UserRegister) => {
    try {
      setError(null);
      setIsLoading(true);
      const userData = await apiService.registerUser(registerData);
      // authapi.register doesn't return a token; auto-login to obtain token
      try {
        const loginData = { username: registerData.username, password: registerData.password };
        const loggedInUser = await apiService.loginUser(loginData);
        const token = apiService.getAuthToken();
        if (token) await saveTokenToStorage(token);
        setUser(loggedInUser);
        await saveUserToStorage(loggedInUser);
      } catch (e) {
        // If auto-login fails, still return created user object
        setUser(userData);
        await saveUserToStorage(userData);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      apiService.setAuthToken(null);
      await removeUserFromStorage();
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
  }), [user, isLoading, isAuthenticated, login, register, logout, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
