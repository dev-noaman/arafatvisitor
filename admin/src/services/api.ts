import { ApiError } from '../types';

// API Base URL - empty since Vite proxy handles requests
// The proxy is configured in vite.config.ts to route:
// /api/* -> http://localhost:3000
// /auth/* -> http://localhost:3000
// /admin/api/* -> http://localhost:3000
const API_BASE_URL = '';

// Handle session expiry - redirect to login
function handleSessionExpired(): void {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
  sessionStorage.setItem('session_expired', 'Your session has expired. Please sign in again.');
  window.location.href = '/admin/login';
}

// Generic API request function - returns T directly (backend returns data unwrapped)
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && token !== 'authenticated' ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for httpOnly cookie auth
    headers,
  });

  // Handle 401 Unauthorized - session expired
  if (response.status === 401) {
    handleSessionExpired();
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

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = token && token !== 'authenticated'
    ? { 'Authorization': `Bearer ${token}` }
    : {};

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers,
    body: formData,
  });

  if (response.status === 401) {
    handleSessionExpired();
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
