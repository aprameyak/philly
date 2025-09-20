// API service for PhillySafe backend
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL
// Auth service (separate auth microservice) - change if your auth server runs elsewhere
const AUTH_BASE_URL = 'http://127.0.0.1:8000';

export interface Incident {
  id?: string;
  _id?: string;
  the_geom?: string;
  cartodb_id?: number;
  the_geom_webmercator?: string;
  objectid?: number;
  dc_dist?: number;
  psa?: number;
  dispatch_date_time?: string;
  dispatch_date?: string;
  dispatch_time?: string;
  hour?: number;
  dc_key?: string;
  location_block?: string;
  ucr_general?: number;
  text_general_code?: string;
  point_x?: number;
  point_y?: number;
  lat?: number;
  lng?: number;
}

// Converted incident data for UI display
export interface ConvertedIncident {
  id: string;
  type: string;
  location: string;
  address: string;
  neighborhood: string;
  time: string;
  distance: number;
  lat: number;
  lon: number;
  source: string;
  severity: string;
  category: string;
  description?: string;
  caseNumber?: string;
  reportedBy?: string;
  status?: string;
  photos?: string[];
}

export interface CreateIncidentRequest {
  the_geom?: string;
  cartodb_id?: number;
  the_geom_webmercator?: string;
  objectid?: number;
  dc_dist?: number;
  psa?: number;
  dispatch_date_time?: string;
  dispatch_date?: string;
  dispatch_time?: string;
  hour?: number;
  dc_key?: string;
  location_block?: string;
  ucr_general?: number;
  text_general_code?: string;
  point_x?: number;
  point_y?: number;
  lat?: number;
  lng?: number;
}

// User Report Interfaces
export interface UserReport {
  id: string;
  type: string;
  location: string;
  use_current_location: boolean;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact?: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  status: string;
  user_id?: string;
}

export interface CreateUserReportRequest {
  type: string;
  location: string;
  use_current_location: boolean;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact?: string;
  lat?: number;
  lng?: number;
  user_id?: string; // Add user_id for gamification
}

// User Data Interfaces for Gamification
export interface UserData {
  id: string;
  user_id: string;
  total_submissions: number;
  first_submission_date?: string;
  last_submission_date?: string;
  submission_types: Record<string, number>;
  total_photos_submitted: number;
  reports_resolved: number;
  reports_pending: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
  level: number;
  experience_points: number;
  achievements: string[];
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserDataRequest {
  user_id: string;
  total_submissions?: number;
  first_submission_date?: string;
  last_submission_date?: string;
  submission_types?: Record<string, number>;
  total_photos_submitted?: number;
  reports_resolved?: number;
  reports_pending?: number;
  streak_days?: number;
  longest_streak?: number;
  last_activity_date?: string;
  level?: number;
  experience_points?: number;
  achievements?: string[];
  badges?: string[];
}

export interface UpdateUserDataRequest {
  total_submissions?: number;
  last_submission_date?: string;
  submission_types?: Record<string, number>;
  total_photos_submitted?: number;
  reports_resolved?: number;
  reports_pending?: number;
  streak_days?: number;
  longest_streak?: number;
  last_activity_date?: string;
  level?: number;
  experience_points?: number;
  achievements?: string[];
  badges?: string[];
}

// Authentication Interfaces
export interface User {
  id: string;
  username: string;
  display_name: string;
  total_contributions: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserRegister {
  username: string;
  password: string;
  display_name: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request helper.
   * If `endpoint` is an absolute URL (starts with http), use it as-is.
   * Otherwise prefix with `baseUrl`.
   * Automatically attaches JSON content-type by default and adds Authorization header when token is set.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge headers passed in options (options.headers may be Headers or Record)
    const passedHeaders = (options.headers as Record<string, string>) || {};
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...passedHeaders,
    };

    // Attach auth token when available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Allow AuthContext or other callers to set the token
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken() {
    return this.authToken;
  }

  // Get all crime data
  async getCrime(): Promise<Incident[]> {
    return this.request<Incident[]>('/crime');
  }

  // Get a specific crime record by ID
  async getCrimeById(id: string): Promise<Incident> {
    return this.request<Incident>(`/crime/${id}`);
  }

  // Create a new crime record
  async createCrime(incident: CreateIncidentRequest): Promise<Incident> {
    return this.request<Incident>('/crime', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  // User Reports API Methods
  // Get all user reports
  async getUserReports(): Promise<UserReport[]> {
    return this.request<UserReport[]>('/reports');
  }

  // Get a specific user report by ID
  async getUserReportById(id: string): Promise<UserReport> {
    return this.request<UserReport>(`/reports/${id}`);
  }

  // Create a new user report
  async createUserReport(report: CreateUserReportRequest): Promise<UserReport> {
    return this.request<UserReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  // Update report status (for admin use)
  async updateReportStatus(reportId: string, status: string): Promise<UserReport> {
    return this.request<UserReport>(`/reports/${reportId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // User Data API Methods (Gamification)
  // Get user data and statistics
  async getUserData(userId: string): Promise<UserData> {
    return this.request<UserData>(`/userdata/${userId}`);
  }

  // Create new user data
  async createUserData(userData: CreateUserDataRequest): Promise<UserData> {
    return this.request<UserData>('/userdata', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Get leaderboard (all users sorted by total submissions)
  async getLeaderboard(): Promise<UserData[]> {
    return this.request<UserData[]>('/userdata/leaderboard');
  }

  // Authentication API Methods
  // Register a new user
  async registerUser(userData: UserRegister): Promise<User> {
    // authapi expects form-encoded fields for register; use absolute URL in case auth service is separate
    const form = new URLSearchParams();
    form.append('username', userData.username);
    form.append('password', userData.password);
    // authapi does not accept display_name by default; include it as an optional field
    if (userData.display_name) form.append('display_name', userData.display_name);

  const result = await this.request<any>(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    // authapi returns a success message; convert to frontend User shape minimal object
    return {
      id: result.id || userData.username,
      username: userData.username,
      display_name: userData.display_name || userData.username,
      total_contributions: 0,
    } as User;
  }

  // Login user
  
  async loginUser(loginData: UserLogin): Promise<User> {
    // authapi login expects OAuth2 form encoded data; it returns access_token
    const form = new URLSearchParams();
    form.append('username', loginData.username);
    form.append('password', loginData.password);
    

  const tokenResult = await this.request<{ access_token: string; token_type: string }>(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    // Store token for subsequent requests
    this.setAuthToken(tokenResult.access_token);

    // Fetch profile info
  const profile = await this.request<any>(`${AUTH_BASE_URL}/profile`);

    return {
      id: profile.username,
      username: profile.username,
      display_name: profile.username,
      total_contributions: 0,
    } as User;
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User> {
    // authapi exposes /profile which requires Authorization header; ensure token is set and call /profile
  return this.request<User>(`${AUTH_BASE_URL}/profile`);
  }

  // Update user contributions
  async updateUserContributions(username: string, contributions: number): Promise<{message: string}> {
    return this.request<{message: string}>(`${this.baseUrl}/auth/users/${username}/contributions?contributions=${contributions}`, {
      method: 'PUT',
    });
  }

  // Convert API incident to map-compatible format
  convertToMapData(incidents: Incident[]) {
    return incidents.map(incident => ({
      id: incident.id || incident._id,
      latitude: incident.lat || incident.point_y || 0,
      longitude: incident.lng || incident.point_x || 0,
      crime_type: this.getCrimeTypeFromUCR(incident.ucr_general),
      severity: this.getSeverityFromUCR(incident.ucr_general),
      date: incident.dispatch_date ? incident.dispatch_date.split('T')[0] : new Date().toISOString().split('T')[0],
      address: incident.location_block || 'Unknown Location',
      neighborhood: this.extractNeighborhood(incident.location_block),
      type: incident.text_general_code || 'Unknown Crime',
      source: 'official', // All data from MongoDB is official
      description: incident.text_general_code,
      hour: incident.hour,
      dc_dist: incident.dc_dist,
      psa: incident.psa,
    }));
  }

  private getCrimeTypeFromUCR(ucr_general?: number): string {
    if (!ucr_general) return 'other';
    
    // Map UCR codes to crime types
    if (ucr_general >= 100 && ucr_general < 200) return 'violent';
    if (ucr_general >= 200 && ucr_general < 300) return 'property';
    if (ucr_general >= 300 && ucr_general < 400) return 'violent';
    if (ucr_general >= 400 && ucr_general < 500) return 'property';
    if (ucr_general >= 500 && ucr_general < 600) return 'property';
    if (ucr_general >= 600 && ucr_general < 700) return 'vehicle';
    if (ucr_general >= 700 && ucr_general < 800) return 'drug';
    if (ucr_general >= 800 && ucr_general < 900) return 'vandalism';
    return 'other';
  }

  private getSeverityFromUCR(ucr_general?: number): number {
    if (!ucr_general) return 1;
    
    // Map UCR codes to severity levels
    if (ucr_general >= 100 && ucr_general < 200) return 3; // Violent crimes
    if (ucr_general >= 200 && ucr_general < 300) return 2; // Property crimes
    if (ucr_general >= 300 && ucr_general < 400) return 3; // Violent crimes
    if (ucr_general >= 400 && ucr_general < 500) return 2; // Property crimes
    if (ucr_general >= 500 && ucr_general < 600) return 2; // Property crimes
    if (ucr_general >= 600 && ucr_general < 700) return 2; // Vehicle crimes
    if (ucr_general >= 700 && ucr_general < 800) return 3; // Drug crimes
    if (ucr_general >= 800 && ucr_general < 900) return 1; // Vandalism
    return 1;
  }

  private extractNeighborhood(location_block?: string): string {
    if (!location_block) return 'Unknown';
    
    // Extract neighborhood from location block
    // This is a simple extraction - you might want to improve this
    const parts = location_block.split(' ');
    if (parts.length > 2) {
      return parts.slice(2).join(' ');
    }
    return 'Unknown';
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
