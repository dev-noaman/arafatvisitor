import { ApiError } from '../types';

// API Base URL - empty since Vite proxy handles requests
// The proxy is configured in vite.config.ts to route:
// /api/* -> http://localhost:3000
// /auth/* -> http://localhost:3000
// /admin/api/* -> http://localhost:3000
const API_BASE_URL = '';
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Attempt to refresh the access token using the refresh token cookie
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) {
    return refreshPromise || Promise.resolve(false);
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      } else {
        // Refresh failed, redirect to login
        sessionStorage.setItem('session_expired', 'Your session has expired. Please sign in again.');
        window.location.href = '/admin/login';
        return false;
      }
    } catch (error) {
      sessionStorage.setItem('session_expired', 'Your session has expired. Please sign in again.');
      window.location.href = '/admin/login';
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Generic API request function - returns T directly (backend returns data unwrapped)
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies for authentication
    headers,
  });

  // Handle 401 Unauthorized - try to refresh token first
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with the new token
      return apiRequest<T>(endpoint, options);
    }
    throw new Error('Unauthorized - session expired');
  }

  // Handle non-OK responses
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: response.statusText || 'An error occurred',
      statusCode: response.status,
    }));
    throw errorData;
  }

  return response.json();
}

// GET request
export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

// POST request
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request
export async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// Upload file (multipart/form-data)
export async function upload<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies
    body: formData,
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the upload
      return upload<T>(endpoint, formData);
    }
    throw new Error('Unauthorized - session expired');
  }

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: response.statusText || 'Upload failed',
      statusCode: response.status,
    }));
    throw errorData;
  }

  return response.json();
}

// Stub functions for backwards compatibility - localStorage tokens are no longer used
export const getAuthToken = (): string | null => null;
export const setAuthToken = (_token: string): void => {};
export const removeAuthToken = (): void => {};

// Export api object for services that import { api }
export const api = {
  get,
  post,
  put,
  del,
  delete: del,
  upload,
};
