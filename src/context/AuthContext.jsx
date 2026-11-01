import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  getStoredToken,
} from '../services/apiClient';
import { notifications } from '@mantine/notifications';
import { extractErrorMessage } from '../utils/formatters';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize and verify stored token
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser();
        setUser(profile);
        setToken(stored);
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        // Only clear credentials if the backend explicitly rejected the token as 401 Unauthorized
        // Do NOT log out the user on transient network glitches or server cold-start delays
        if (err.response && err.response.status === 401) {
          logoutUser();
          setUser(null);
          setToken(null);
        } else {
          // Preserve token for offline/reconnecting state
          setToken(stored);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for 401 expiration event from apiClient
    const handleExpired = () => {
      setUser(null);
      setToken(null);
      notifications.show({
        title: 'Session Expired',
        message: 'Your security session has expired. Please sign in again.',
        color: 'yellow',
      });
    };

    window.addEventListener('teledoc_auth_expired', handleExpired);
    return () => window.removeEventListener('teledoc_auth_expired', handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await loginUser(email, password);
      setUser(res.user);
      setToken(res.token);
      notifications.show({
        title: 'Vault Unlocked',
        message: `Welcome back, ${res.user.name || res.user.email}!`,
        color: 'teal',
      });
      return res;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Login failed. Please check server connection.');
      notifications.show({
        title: 'Authentication Failed',
        message: msg,
        color: 'red',
      });
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await registerUser(data);
      setUser(res.user);
      setToken(res.token);
      notifications.show({
        title: 'Vault Account Created',
        message: `Account created. Zero-knowledge encryption key initialized.`,
        color: 'teal',
      });
      return res;
    } catch (err) {
      const msg = extractErrorMessage(err, 'Registration failed. Please check server connection.');
      notifications.show({
        title: 'Registration Error',
        message: msg,
        color: 'red',
      });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setToken(null);
    notifications.show({
      title: 'Vault Locked',
      message: 'You have been securely signed out.',
      color: 'blue',
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

