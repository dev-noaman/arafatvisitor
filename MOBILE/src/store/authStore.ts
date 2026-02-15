/**
 * Auth Store
 * Zustand store for authentication state and token management
 */

import { create } from 'zustand';
import * as SecureStore from '../utils/storage';
import { User } from '../types';
import { apiClient } from '../services/api';

// Secure storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Auth state interface
 */
interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
  updateToken: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Load data from secure storage
 */
async function loadFromSecureStorage<T>(key: string): Promise<T | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error loading ${key} from secure storage:`, error);
    return null;
  }
}

/**
 * Save data to secure storage
 */
async function saveToSecureStorage<T>(key: string, value: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to secure storage:`, error);
  }
}

/**
 * Remove data from secure storage
 */
async function removeFromSecureStorage(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing ${key} from secure storage:`, error);
  }
}

/**
 * Create auth store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Set authentication data
   */
  setAuth: async (user: User, accessToken: string, refreshToken: string) => {
    // Set API client header FIRST (before state change triggers navigation + data fetches)
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Save to secure storage (non-blocking for navigation)
    Promise.all([
      saveToSecureStorage(ACCESS_TOKEN_KEY, accessToken),
      saveToSecureStorage(REFRESH_TOKEN_KEY, refreshToken),
      saveToSecureStorage(USER_KEY, user),
    ]).catch(console.error);

    // Update state (triggers navigation to Dashboard)
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  /**
   * Clear authentication data
   */
  clearAuth: async () => {
    // Remove from secure storage
    await Promise.all([
      removeFromSecureStorage(ACCESS_TOKEN_KEY),
      removeFromSecureStorage(REFRESH_TOKEN_KEY),
      removeFromSecureStorage(USER_KEY),
    ]);

    // Clear state
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });

    // Remove API client default header
    delete apiClient.defaults.headers.common['Authorization'];
  },

  /**
   * Load authentication data from storage on app start
   */
  loadAuth: async () => {
    set({ isLoading: true });

    try {
      const [accessToken, refreshToken, user] = await Promise.all([
        loadFromSecureStorage<string>(ACCESS_TOKEN_KEY),
        loadFromSecureStorage<string>(REFRESH_TOKEN_KEY),
        loadFromSecureStorage<User>(USER_KEY),
      ]);

      if (accessToken && user) {
        // Set API header FIRST before state change triggers data fetches
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({
          user,
          accessToken,
          refreshToken: refreshToken || '',
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Update tokens (after refresh)
   */
  updateToken: (accessToken: string, refreshToken: string) => {
    set({
      accessToken,
      refreshToken,
    });
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  },

  /**
   * Update user data
   */
  updateUser: (user: User) => {
    set({ user });
    saveToSecureStorage(USER_KEY, user);
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set error state
   */
  setError: (error: string | null) => {
    set({ error });
  },
}));
