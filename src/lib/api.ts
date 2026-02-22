import { supabase } from "./supabase";

const BASE_URL = "/api";

class ApiClient {
  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${BASE_URL}${path}`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(response.status, error.error || "Request failed");
    }
    return response.json();
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(response.status, error.error || "Request failed");
    }
    return response.json();
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(response.status, error.error || "Request failed");
    }
    return response.json();
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(response.status, error.error || "Request failed");
    }
    return response.json();
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = new ApiClient();
