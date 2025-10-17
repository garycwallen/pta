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
    return this.request('/walk-in', {  // ✅ Fixed
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWalkInRegistrations() {
    return this.request('/walk-in');  // ✅ Fixed
  }

  // RSVP families
  async getRsvpFamilies() {
    return this.request('/rsvp-families');  // ✅ Fixed
  }

  async addRsvpFamily(data: any) {
    return this.request('/rsvp-families', {  // ✅ Fixed
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RSVP check-in
  async processRsvpCheckIn(rsvpFamilyId: number) {
    return this.request('/rsvp-checkin', {  // ✅ Fixed
      method: 'POST',
      body: JSON.stringify({ rsvpFamilyId }),
    });
  }

  async getRsvpCheckIns() {
    return this.request('/rsvp-checkins');  // ✅ Fixed
  }

  // Statistics
  async getStats() {
    return this.request('/stats');  // ✅ Fixed
  }
}

export const apiClient = new ApiClient();