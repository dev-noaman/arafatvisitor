/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

// Get API URL from app config or environment
const API_URL = Constants.expoConfig?.extra?.API_URL as string || process.env.API_URL || 'https://arafatvisitor.cloud';

/**
 * Retry delay with exponential backoff
 * @param retryCount - Current retry attempt (0-indexed)
 * @returns Promise that resolves after delay
 */
const delay = (retryCount: number): Promise<void> => {
  const delays = [1000, 3000, 5000]; // 1s, 3s, 5s
  const delayTime = delays[Math.min(retryCount, delays.length - 1)];
  return new Promise((resolve) => setTimeout(resolve, delayTime));
};

/**
 * Create and configure Axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Send cookies for cross-origin requests (httpOnly refresh token)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor to attach auth token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from storage (will be managed by auth store)
    const token = config.headers?.Authorization;
    if (!token) {
      // Token will be set by auth store
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor with retry logic for network failures
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Initialize retry count
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Retry on network errors (no response) with exponential backoff
    if (!error.response && originalRequest._retryCount! < 3) {
      originalRequest._retryCount = originalRequest._retryCount! + 1;
      console.log(`Retrying request (${originalRequest._retryCount}/3)...`);
      await delay(originalRequest._retryCount - 1);
      return apiClient(originalRequest);
    }

    // Handle 401 Unauthorized - token refresh logic will be handled by auth store
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Return error to be handled by auth store
      return Promise.reject(error);
    }

    // Handle other HTTP errors
    const errorMessage = getErrorMessage(error);
    return Promise.reject({
      message: errorMessage,
      code: error.code,
      status: error.response?.status,
    });
  }
);


/**
 * Extract user-friendly error message from Axios error
 */
function getErrorMessage(error: AxiosError): string {
  const status = error.response?.status;
  const data = error.response?.data as any;

  // Use server message for most errors, but prefer user-friendly text for rate limits
  if (data?.message && status !== 429) {
    return data.message;
  }

  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}

/**
 * Export API URL for use in other parts of the app
 */
export const API_BASE_URL = API_URL;

export default apiClient;
