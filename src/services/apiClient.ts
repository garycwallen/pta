/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RsvpFamily {
  id: number;
  name: string;
  email: string;
  attendee_count: number;
  grade_levels?: string;
  created_at?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Walk-in registrations
  async createWalkInRegistration(data: any) {
    return this.request('/walk-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalkInRegistrations() {
    return this.request('/walk-in');
  }

  // RSVP families
  async getRsvpFamilies() {
    return this.request('/rsvp-families');
  }

  async addRsvpFamily(data: any) {
    return this.request('/rsvp-families', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RSVP check-in
  async processRsvpCheckIn(data: { rsvpFamilyId: number }) {
    return this.request('/rsvp-checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRsvpCheckIns() {
    return this.request('/rsvp-checkins');
  }

  // Statistics
  async getStats() {
    return this.request('/stats');
  }
}

export const apiClient = new ApiClient();
