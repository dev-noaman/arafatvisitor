import { ApiError } from '../types';

// API Base URL - empty since Vite proxy handles requests
// The proxy is configured in vite.config.ts to route:
// /api/* -> http://localhost:3000
// /auth/* -> http://localhost:3000
// /admin/api/* -> http://localhost:3000
const API_BASE_URL = '';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('admin_token');
};

// Generic API request function - returns T directly (backend returns data unwrapped)
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - redirect to login with message
  if (response.status === 401) {
    removeAuthToken();
    // Store session expiry message for display on login page
    sessionStorage.setItem('session_expired', 'Your session has expired. Please sign in again.');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized - redirecting to login');
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
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: response.statusText || 'Upload failed',
      statusCode: response.status,
    }));
    throw errorData;
  }

  return response.json();
}

export { getAuthToken, setAuthToken, removeAuthToken };

// Export api object for services that import { api }
export const api = {
  get,
  post,
  put,
  del,
  delete: del,
  upload,
};
