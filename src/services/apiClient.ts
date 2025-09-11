/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WalkInRegistrationData {
  adults: number;
  kids: number;
  kidGrades: string[];
  email?: string;
}

// Simplified RSVP Family structure matching Excel columns
export interface RsvpFamily {
  id: number;
  name: string;                    // Column A: Contact person's name
  email: string;                   // Column B: Email address
  attendee_count: number;          // Column C: Number of attendees
  grade_levels?: string;           // Column D: Student grade levels (comma-separated)
  created_at: string;
  updated_at: string;
}

export interface RsvpFamilyData {
  name: string;                    // Column A: Contact person's name
  email: string;                   // Column B: Email address
  attendee_count: number;          // Column C: Number of attendees
  grade_levels?: string;           // Column D: Student grade levels (comma-separated)
}

export interface RsvpCheckInData {
  rsvpFamilyId: number;
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
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Walk-in registration methods
  async createWalkInRegistration(
    data: WalkInRegistrationData
  ): Promise<ApiResponse> {
    return this.request('/registrations/walk-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalkInRegistrations(): Promise<ApiResponse> {
    return this.request('/registrations/walk-in');
  }

  // RSVP Family methods - simplified structure
  async getRsvpFamilies(): Promise<ApiResponse<RsvpFamily[]>> {
    return this.request('/registrations/rsvp-families');
  }

  async addRsvpFamily(data: RsvpFamilyData): Promise<ApiResponse> {
    return this.request('/registrations/rsvp-families', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RSVP Check-in methods
  async processRsvpCheckIn(data: RsvpCheckInData): Promise<ApiResponse> {
    return this.request('/registrations/rsvp-checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRsvpCheckIns(): Promise<ApiResponse> {
    return this.request('/registrations/rsvp-checkins');
  }

  // Legacy RSVP confirmation
  async createRsvpConfirmation(): Promise<ApiResponse> {
    return this.request('/registrations/rsvp', {
      method: 'POST',
    });
  }

  // Statistics
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