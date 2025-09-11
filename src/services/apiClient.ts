/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WalkInRegistrationData {
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Create walk-in registration
  async createWalkInRegistration(data: WalkInRegistrationData): Promise<ApiResponse> {
    return this.request('/registrations/walk-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create RSVP confirmation
  async createRsvpConfirmation(): Promise<ApiResponse> {
    return this.request('/registrations/rsvp', {
      method: 'POST',
    });
  }

  // Get walk-in registrations
  async getWalkInRegistrations(): Promise<ApiResponse> {
    return this.request('/registrations/walk-in');
  }

  // Get statistics
  async getStats(): Promise<ApiResponse> {
    return this.request('/registrations/stats');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const url = `${API_BASE_URL.replace('/api', '')}/health`;
    const response = await fetch(url);
    return response.json();
  }
}

export const apiClient = new ApiClient();