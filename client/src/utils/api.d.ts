// Type declarations for the API utility

export interface ApiMethods {
  get: (endpoint: string) => Promise<Response>;
  post: (endpoint: string, data: unknown) => Promise<Response>;
  put: (endpoint: string, data: unknown) => Promise<Response>;
  delete: (endpoint: string) => Promise<Response>;
}

export const api: ApiMethods;

export function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response>;
