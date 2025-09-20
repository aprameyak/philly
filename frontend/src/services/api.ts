const AUTH_BASE_URL = 'http://127.0.0.1:8000';

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
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
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

    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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

  // -------------------
  // Crime Data Methods
  // -------------------

  async getCrime(): Promise<CrimeIncident[]> {
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
