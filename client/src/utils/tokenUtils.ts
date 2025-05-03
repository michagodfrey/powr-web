// Token management utility functions
// Centralizes token storage and retrieval logic

const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Get stored tokens from localStorage
 */
export const getStoredTokens = () => {
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  console.log("[TokenUtils] getStoredTokens:", {
    accessTokenPresent: !!accessToken,
    refreshTokenPresent: !!refreshToken,
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length,
  });
  return { accessToken, refreshToken };
};

/**
 * Set tokens in localStorage
 */
export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  console.log("[TokenUtils] setStoredTokens:", {
    accessTokenSet: !!accessToken,
    refreshTokenSet: !!refreshToken,
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length,
  });
};

/**
 * Remove tokens from localStorage
 */
export const removeStoredTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  console.log("[TokenUtils] removeStoredTokens: tokens removed");
};

/**
 * Check if tokens exist in localStorage
 */
export const hasStoredTokens = () => {
  const { accessToken, refreshToken } = getStoredTokens();
  const hasTokens = !!(accessToken && refreshToken);
  console.log("[TokenUtils] hasStoredTokens:", hasTokens);
  return hasTokens;
};
