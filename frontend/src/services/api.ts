// Use localhost for development, but fallback to IP if needed
const AUTH_BASE_URL = __DEV__ ? 'http://localhost:8000' : 'http://localhost:8000';

export interface UserReportsResponse {
  username: string;
  total_reports: number;
}

export interface CreateUserReportRequest {
  username: string;
  type: string;
  description: string;
  latitude?: number;
  longitude?: number;
  severity?: number;
  photos?: string[];
}

export interface ReportResponse {
  id: number;
  username: string;
  type: string;
  description: string;
  latitude?: string;
  longitude?: string;
  severity?: number;
  photos?: string[];
  created_at: string;
}

export interface UserResponse {
  username: string;
  display_name?: string;
  reports: number;
}

// Auth-related interfaces
export interface User {
  username: string;
  display_name?: string;
  reports: number;
  created_at?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  username: string;
  password: string;
  display_name?: string;
}

export interface LoginResponse {
  username: string;
  display_name: string;
  total_reports: number;
}

export interface RegisterResponse {
  username: string;
  display_name: string;
  reports: number;
}

export interface CrimeIncident {
  latitude: number;        
  longitude: number;       
  weight?: number;         // optional severity for heatmap
  crime_type?: string;     
  date?: string | Date;   
  severity?: number;       // crime severity (1-5)
  description?: string;    // crime description
  [key: string]: any;      
}

// Alias for backward compatibility
export type Incident = CrimeIncident;

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = AUTH_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(endpoint: string, options: RequestInit & { baseUrl?: string } = {}): Promise<T> {
    const baseUrl = options.baseUrl || this.baseUrl;
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    console.log('Making API request to:', url);
    
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        headers = { ...headers, ...(options.headers as Record<string, string>) };
      }
    }
    const config: RequestInit = { ...options, headers };

    try {
      const response = await fetch(url, config);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data length:', Array.isArray(data) ? data.length : 'not array');
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error(`Network request failed. Make sure the backend is running on ${this.baseUrl}`);
      }
      throw error;
    }
  }

  // -------------------
  // User Reports Methods
  // -------------------

  async createUserReport(reportData: CreateUserReportRequest): Promise<UserReportsResponse> {
    return this.request<UserReportsResponse>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getUserReports(username: string): Promise<UserReportsResponse> {
    return this.request<UserReportsResponse>(`/reports/${username}`);
  }

  async getUserAllReports(username: string): Promise<ReportResponse[]> {
    return this.request<ReportResponse[]>(`/reports/${username}/all`);
  }

  async getUserData(username: string): Promise<UserReportsResponse> {
    return this.request<UserReportsResponse>(`/reports/${username}`);
  }

  async getLeaderboard(): Promise<UserResponse[]> {
    return this.request<UserResponse[]>('/leaderboard');
  }

  // -------------------
  // Auth Methods
  // -------------------

  async registerUser(userData: UserRegister): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: UserLogin): Promise<LoginResponse> {
    // For now, we'll use a simple approach since we don't have a login endpoint
    // We'll just return the user data if they exist
    const userData = await this.getUserData(credentials.username);
    return {
      username: userData.username,
      display_name: userData.username, // Fallback to username
      total_reports: userData.total_reports
    };
  }

  // -------------------
  // Crime Data Methods
  // -------------------

  async getCrime(): Promise<CrimeIncident[]> {
    // Try to get real data from dbapi first, fallback to authapi
    try {
      const realData = await this.request<CrimeIncident[]>('/crime', {
        baseUrl: 'http://localhost:8001'
      });
      if (realData && realData.length > 0) {
        console.log('Using real crime data from dbapi:', realData.length, 'records');
        return realData;
      }
    } catch (error) {
      console.log('dbapi not available, using simulated data from authapi');
    }
    
    // Fallback to simulated data from authapi
    return this.request<CrimeIncident[]>('/crime');
  }

  async getFilteredCrime(filters: {
    crime_type?: string;
    min_severity?: number;
    max_severity?: number;
    days_back?: number;
  } = {}): Promise<CrimeIncident[]> {
    const params = new URLSearchParams();
    if (filters.crime_type) params.append('crime_type', filters.crime_type);
    if (filters.min_severity) params.append('min_severity', filters.min_severity.toString());
    if (filters.max_severity) params.append('max_severity', filters.max_severity.toString());
    if (filters.days_back) params.append('days_back', filters.days_back.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/crime/filtered?${queryString}` : '/crime/filtered';
    
    return this.request<CrimeIncident[]>(endpoint);
  }

  // -------------------
  // Crime Map Data
  // -------------------

  convertToMapData(incidents: CrimeIncident[]): CrimeIncident[] {
    return incidents.map((incident) => ({
      latitude: Number(incident.latitude) || 0,
      longitude: Number(incident.longitude) || 0,
      weight: Number(incident.weight ?? incident.severity) || 1,
      crime_type: incident.crime_type || "Unknown",
      severity: incident.severity || 1,
      description: incident.description || "",
      date: incident.date !== undefined && incident.date !== null ? incident.date : undefined,
    }));
  }
}

export const apiService = new ApiService();
export default apiService;
