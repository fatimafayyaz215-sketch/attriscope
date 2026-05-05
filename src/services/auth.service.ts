/**
 * Auth Service
 * Example of a domain-specific service for backend integration.
 */

import { apiClient } from "@/lib/api-client";
import { LoginCredentials, AuthResponse, RegisterData } from "@/types/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
