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
