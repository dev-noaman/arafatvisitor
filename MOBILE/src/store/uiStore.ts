/**
 * UI Store
 * Zustand store for UI state (dark mode, filters, etc.)
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../theme';

// Storage keys
const DARK_MODE_KEY = 'dark_mode';
const VISITOR_FILTER_KEY = 'visitor_filter';

/**
 * UI state interface
 */
interface UIState {
  // Theme
  colorScheme: ColorScheme;
  isDarkMode: boolean;

  // Visitor filters
  visitorFilter: string | null;

  // Loading states
  isGlobalLoading: boolean;

  // Actions
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setVisitorFilter: (filter: string | null) => Promise<void>;
  setGlobalLoading: (isLoading: boolean) => void;

  // Load preferences
  loadPreferences: () => Promise<void>;
}

/**
 * Load data from AsyncStorage
 */
async function loadFromAsyncStorage<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error loading ${key} from AsyncStorage:`, error);
    return null;
  }
}

/**
 * Save data to AsyncStorage
 */
async function saveToAsyncStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to AsyncStorage:`, error);
  }
}

/**
 * Create UI store
 */
export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  colorScheme: 'light',
  isDarkMode: false,
  visitorFilter: null,
  isGlobalLoading: false,

  /**
   * Set color scheme
   */
  setColorScheme: async (scheme: ColorScheme) => {
    const isDark = scheme === 'dark';
    set({
      colorScheme: scheme,
      isDarkMode: isDark,
    });
    await saveToAsyncStorage(DARK_MODE_KEY, scheme);
  },

  /**
   * Toggle dark mode
   */
  toggleDarkMode: async () => {
    const currentScheme = get().colorScheme;
    const newScheme: ColorScheme = currentScheme === 'light' ? 'dark' : 'light';
    set({
      colorScheme: newScheme,
      isDarkMode: newScheme === 'dark',
    });
    await saveToAsyncStorage(DARK_MODE_KEY, newScheme);
  },

  /**
   * Set visitor filter
   */
  setVisitorFilter: async (filter: string | null) => {
    set({ visitorFilter: filter });
    await saveToAsyncStorage(VISITOR_FILTER_KEY, filter);
  },

  /**
   * Set global loading state
   */
  setGlobalLoading: (isLoading: boolean) => {
    set({ isGlobalLoading: isLoading });
  },

  /**
   * Load preferences from storage on app start
   */
  loadPreferences: async () => {
    try {
      const [colorScheme, visitorFilter] = await Promise.all([
        loadFromAsyncStorage<ColorScheme>(DARK_MODE_KEY),
        loadFromAsyncStorage<string>(VISITOR_FILTER_KEY),
      ]);

      set({
        colorScheme: colorScheme || 'light',
        isDarkMode: colorScheme === 'dark',
        visitorFilter: visitorFilter || null,
      });
    } catch (error) {
      console.error('Error loading UI preferences:', error);
    }
  },
}));
