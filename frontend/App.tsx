import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Authentication
import { AuthProvider } from "./src/contexts/AuthContext";
import ProtectedRoute from "./src/components/ProtectedRoute";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import MapScreen from "./src/screens/MapScreen";
import SearchScreen from "./src/screens/SearchScreen";
import ReportScreen from "./src/screens/ReportScreen";
import SnapShot from "./src/screens/Snapshot";
import ProfileScreen from "./src/screens/ProfileScreen";
import IncidentDetailsScreen from "./src/screens/IncidentDetailsScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
// Types
import {
  RootStackParamList,
  MainTabParamList,
} from "./src/types/navigation";

// Icons (you may need to adjust these based on your icon library)
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Report") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Leaderboard") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#387bb5",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("hasLaunched").then((value) => {
      if (value == null) {
        AsyncStorage.setItem("hasLaunched", "true");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);


  if (isFirstLaunch === null) {
    return null; // Loading state
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : null}
            <Stack.Screen name="Main">
              {() => (
                <ProtectedRoute>
                  <MainTabs />
                </ProtectedRoute>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="IncidentDetails"
              component={IncidentDetailsScreen}
              options={{ headerShown: true, title: "Incident Details" }}
            />
            <Stack.Screen name="SnapShot" component={SnapShot} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
