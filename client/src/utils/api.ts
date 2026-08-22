// API client utility for making authenticated requests
// Attaches the current Supabase session's access token — Supabase's SDK
// keeps that session fresh in the background, so there's no manual
// refresh/retry dance needed here.

import { supabase } from "../lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Create an authenticated fetch function
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  headers.set("Content-Type", "application/json");

  try {
    return await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("[API] Network or request error:", error);
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
