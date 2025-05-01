// API client utility for making authenticated requests
// Handles token management and request/response interceptors

import {
  getStoredTokens,
  setStoredTokens,
  removeStoredTokens,
} from "./tokenUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Refresh the access token using the refresh token
const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to refresh token");
    }

    const data = await response.json();
    setStoredTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("[Auth] Token refresh error:", error);
    if (
      error instanceof Error &&
      error.message === "No refresh token available"
    ) {
      removeStoredTokens();
    }
    throw error;
  }
};

// Create an authenticated fetch function
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get the access token
  const { accessToken } = getStoredTokens();

  // Prepare headers with authentication
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  headers.set("Content-Type", "application/json");

  // Make the request
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh the token
    if (response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${newAccessToken}`);

        // Retry the request with the new token
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          const data = await retryResponse.json().catch(() => ({}));
          console.error("[Auth] Request failed after token refresh:", {
            status: retryResponse.status,
            error: data.error,
          });
        }

        return retryResponse;
      } catch (error) {
        console.error("[Auth] Authentication error:", error);
        removeStoredTokens();
        throw new Error(
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try logging in again."
        );
      }
    }

    return response;
  } catch (error) {
    console.error("[Auth] Network or request error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
};

// Create API methods
export const api = {
  async get(endpoint: string) {
    return apiFetch(endpoint);
  },

  async post(endpoint: string, data: unknown) {
    return apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put(endpoint: string, data: unknown) {
    return apiFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string) {
    return apiFetch(endpoint, {
      method: "DELETE",
    });
  },
};
