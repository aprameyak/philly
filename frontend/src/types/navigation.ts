import { NavigatorScreenParams } from "@react-navigation/native";
import { Incident } from "../services/api";

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  IncidentDetails: { incident: Incident };
  SnapShot: undefined;
  Onboarding: undefined;
  Report: { autoType?: string };
};

export type MainTabParamList = {
  Map: undefined;
  Search: undefined;
  Report: { autoType?: string }; 
  Profile: undefined;
  Leaderboard: undefined;
  Filter: {
    currentFilters?: AppFilters;
  };
};

export interface AppFilters {
  timeRange: string;
  customStartDate?: Date;
  customEndDate?: Date;
  crimeTypes: string[];
  timeOfDay: string[];
  dataSources: {
    official: boolean;
    community: boolean;
  };
  heatmapIntensity: number[];
  heatmapRadius: number[];
  showHeatmap: boolean;
  searchLocation: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
