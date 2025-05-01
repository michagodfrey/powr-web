// Token management utility functions
// Centralizes token storage and retrieval logic

const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Get stored tokens from localStorage
 */
export const getStoredTokens = () => ({
  accessToken: localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN),
  refreshToken: localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN),
});

/**
 * Set tokens in localStorage
 */
export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * Remove tokens from localStorage
 */
export const removeStoredTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Check if tokens exist in localStorage
 */
export const hasStoredTokens = () => {
  const { accessToken, refreshToken } = getStoredTokens();
  return !!(accessToken && refreshToken);
};
