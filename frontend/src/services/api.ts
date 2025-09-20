import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Flask backend
const AUTH_BASE_URL = "http://localhost:8000"; // FastAPI backend

// ---------------- Types ---------------- //
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

export interface CreateIncidentRequest extends Partial<Incident> {}

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

export interface CreateUserReportRequest
  extends Omit<UserReport, "id" | "timestamp" | "status"> {}

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

export interface CreateUserDataRequest extends Partial<UserData> {}
export interface UpdateUserDataRequest extends Partial<UserData> {}

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

// ---------------- ApiService ---------------- //
class ApiService {
  // ---------- Crime Data ---------- //
  async getCrime(): Promise<Incident[]> {
    const { data } = await axios.get(`${API_BASE_URL}/crime`);
    console.log("Raw data:", data);

    // Ensure array
    // if (!Array.isArray(data)) {
    //   console.error("Expected array, got:", data);
    //   return [];
    // }

    console.log("Crime data sample:", data.slice(0, 5));
    return data;
  }

  async getCrimeById(id: string): Promise<Incident> {
    const response = await axios.get<Incident>(`${API_BASE_URL}/crime/${id}`);
    return response.data;
  }

  async createCrime(incident: CreateIncidentRequest): Promise<Incident> {
    const response = await axios.post<Incident>(
      `${API_BASE_URL}/crime`,
      incident
    );
    return response.data;
  }

  // ---------- User Reports ---------- //
  async getUserReports(): Promise<UserReport[]> {
    const response = await axios.get<UserReport[]>(`${API_BASE_URL}/reports`);
    return response.data;
  }

  async getUserReportById(id: string): Promise<UserReport> {
    const response = await axios.get<UserReport>(
      `${API_BASE_URL}/reports/${id}`
    );
    return response.data;
  }

  async createUserReport(report: CreateUserReportRequest): Promise<UserReport> {
    const response = await axios.post<UserReport>(
      `${API_BASE_URL}/reports`,
      report
    );
    return response.data;
  }

  async updateReportStatus(
    reportId: string,
    status: string
  ): Promise<UserReport> {
    const response = await axios.put<UserReport>(
      `${API_BASE_URL}/reports/${reportId}/status`,
      { status }
    );
    return response.data;
  }

  // ---------- Gamification Data ---------- //
  async getUserData(userId: string): Promise<UserData> {
    const response = await axios.get<UserData>(
      `${AUTH_BASE_URL}/userdata/${userId}`
    );
    return response.data;
  }

  async createUserData(userData: CreateUserDataRequest): Promise<UserData> {
    const response = await axios.post<UserData>(
      `${AUTH_BASE_URL}/userdata`,
      userData
    );
    return response.data;
  }

  async getLeaderboard(): Promise<UserData[]> {
    const response = await axios.get<UserData[]>(
      `${AUTH_BASE_URL}/userdata/leaderboard`
    );
    return response.data;
  }

  // ---------- Authentication ---------- //
  async registerUser(userData: UserRegister): Promise<User> {
    const response = await axios.post<User>(
      `${AUTH_BASE_URL}/auth/register`,
      userData
    );
    return response.data;
  }

  async loginUser(loginData: UserLogin): Promise<User> {
    const response = await axios.post<User>(
      `${AUTH_BASE_URL}/auth/login`,
      loginData
    );
    return response.data;
  }

  async getUserByUsername(username: string): Promise<User> {
    const response = await axios.get<User>(
      `${AUTH_BASE_URL}/auth/users/${username}`
    );
    return response.data;
  }

  async updateUserContributions(
    username: string,
    contributions: number
  ): Promise<{ message: string }> {
    const response = await axios.put<{ message: string }>(
      `${AUTH_BASE_URL}/auth/users/${username}/contributions?contributions=${contributions}`
    );
    return response.data;
  }

  // ---------- Helpers ---------- //
  convertToMapData(incidents: Incident[] | undefined) {
    if (!incidents || !Array.isArray(incidents)) return [];

    return incidents.map((incident) => ({
      id: incident.id || incident._id,
      latitude: incident.lat || incident.point_y || 0,
      longitude: incident.lng || incident.point_x || 0,
      crime_type: this.getCrimeTypeFromUCR(incident.ucr_general),
      severity: this.getSeverityFromUCR(incident.ucr_general),
      date: incident.dispatch_date
        ? incident.dispatch_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      address: incident.location_block || "Unknown Location",
      neighborhood: this.extractNeighborhood(incident.location_block),
      type: incident.text_general_code || "Unknown Crime",
      source: "official",
      description: incident.text_general_code,
      hour: incident.hour,
      dc_dist: incident.dc_dist,
      psa: incident.psa,
    }));
  }

  private getCrimeTypeFromUCR(ucr_general?: number): string {
    if (!ucr_general) return "other";
    if (ucr_general >= 100 && ucr_general < 200) return "violent";
    if (ucr_general >= 200 && ucr_general < 300) return "property";
    if (ucr_general >= 300 && ucr_general < 400) return "violent";
    if (ucr_general >= 400 && ucr_general < 500) return "property";
    if (ucr_general >= 500 && ucr_general < 600) return "property";
    if (ucr_general >= 600 && ucr_general < 700) return "vehicle";
    if (ucr_general >= 700 && ucr_general < 800) return "drug";
    if (ucr_general >= 800 && ucr_general < 900) return "vandalism";
    return "other";
  }

  private getSeverityFromUCR(ucr_general?: number): number {
    if (!ucr_general) return 1;
    if (ucr_general >= 100 && ucr_general < 200) return 3;
    if (ucr_general >= 200 && ucr_general < 300) return 2;
    if (ucr_general >= 300 && ucr_general < 400) return 3;
    if (ucr_general >= 400 && ucr_general < 500) return 2;
    if (ucr_general >= 500 && ucr_general < 600) return 2;
    if (ucr_general >= 600 && ucr_general < 700) return 2;
    if (ucr_general >= 700 && ucr_general < 800) return 3;
    if (ucr_general >= 800 && ucr_general < 900) return 1;
    return 1;
  }

  private extractNeighborhood(location_block?: string): string {
    if (!location_block) return "Unknown";
    const parts = location_block.split(" ");
    if (parts.length > 2) {
      return parts.slice(2).join(" ");
    }
    return "Unknown";
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
