/**
 * Authentication utilities for managing JWT tokens.
 */

const TOKEN_KEY = 'auth_token';

/**
 * Get the stored authentication token.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the authentication token.
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear the stored authentication token.
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Decode JWT token payload without verification.
 * Note: This is only for reading claims, not for validation.
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get user ID from the stored token.
 */
export function getUserId(): string | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  // JWT typically uses 'sub' (subject) claim for user ID
  return (payload.sub as string) || null;
}
