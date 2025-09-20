import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";

interface ReportData {
  type: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact: string;
}

const reportTypes = [
  {
    id: "trash",
    icon: "trash",
    label: "Trash Pile",
    description: "Illegal dumping or excessive litter",
  },
  {
    id: "light",
    icon: "bulb",
    label: "Broken Streetlight",
    description: "Non-functioning street lighting",
  },
  {
    id: "vandalism",
    icon: "warning",
    label: "Vandalism",
    description: "Property damage or graffiti",
  },
  {
    id: "suspicious",
    icon: "eye",
    label: "Suspicious Activity",
    description: "Concerning behavior or activity",
  },
];

const severityLevels = [
  { id: "low", label: "Low", description: "Minor issue, not urgent" },
  { id: "medium", label: "Medium", description: "Moderate concern" },
  {
    id: "high",
    label: "High",
    description: "Serious issue requiring attention",
  },
];

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyD76ShbpMOEu02aheDb3n2gATANFZc1hgM";

const ReportScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData>({
    type: (route.params as any)?.autoType || "",
    location: (route.params as any)?.snapshotData?.location || "",
    coordinates: (route.params as any)?.snapshotData?.coordinates || null,
    photos: (route.params as any)?.snapshotData?.photos || [],
    description: (route.params as any)?.snapshotData?.description || "",
    severity: (route.params as any)?.snapshotData?.severity || "medium",
    anonymous: true,
    contact: "",
  });

  // Auto-fill data on component mount
  useEffect(() => {
    autofillReportData();
  }, []);

  const autofillReportData = async () => {
    setIsLoading(true);
    
    try {
      // Auto-fill type if not provided
      let autoType = reportData.type;
      if (!autoType) {
        // Default to most common report type or use AI detection logic
        autoType = "trash";
      }

      // Auto-fill location using GPS + Google Maps
      const locationData = await getLocationWithAddress();
      
      // Auto-fill severity based on type (you can customize this logic)
      const autoSeverity = getAutoSeverity(autoType);

      setReportData(prev => ({
        ...prev,
        type: autoType,
        location: locationData.address,
        coordinates: locationData.coordinates,
        severity: autoSeverity,
        // description remains optional and empty
      }));

    } catch (error) {
      console.error("Error auto-filling report data:", error);
      Alert.alert("Error", "Unable to auto-fill some fields. Please fill them manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationWithAddress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Use Google Maps Geocoding API for more accurate address
      const address = await getAddressFromGoogleMaps(latitude, longitude);
      
      return {
        address,
        coordinates: { latitude, longitude }
      };
    } catch (error) {
      console.error("Location error:", error);
      // Fallback to Expo's reverse geocoding
      return await getFallbackLocation();
    }
  };

  const getAddressFromGoogleMaps = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      throw new Error("No address found");
    } catch (error) {
      console.error("Google Maps API error:", error);
      throw error;
    }
  };

  const getFallbackLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const formattedAddress = `${address[0].street || ""} ${
          address[0].name || ""
        }, ${address[0].city || "Philadelphia"}, ${address[0].region || "PA"}`;
        return {
          address: formattedAddress,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        };
      }
      throw new Error("Unable to get address");
    } catch (error) {
      return {
        address: "Philadelphia, PA, USA", // Default fallback
        coordinates: { latitude: 39.9526, longitude: -75.1652 } // Philadelphia coordinates
      };
    }
  };

  const getAutoSeverity = (type: string) => {
    // Auto-determine severity based on report type
    switch (type) {
      case "suspicious":
        return "high";
      case "vandalism":
        return "medium";
      case "light":
        return "medium";
      case "trash":
        return "low";
      default:
        return "medium";
    }
  };

  const handleFieldEdit = (field: string, value: any) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setReportData((prev) => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const handleSubmit = () => {
    const report = {
      ...reportData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: "open",
    };

    Alert.alert("Success", "Your report has been submitted successfully!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const renderEditableField = (
    label: string,
    field: keyof ReportData,
    value: any,
    renderContent: () => React.ReactNode,
    renderEdit: () => React.ReactNode
  ) => {
    const isEditing = editingField === field;
    
    return (
      <View style={styles.editableField}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditingField(isEditing ? null : field)}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create"} 
              size={16} 
              color="#007AFF" 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Done" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isEditing ? renderEdit() : renderContent()}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Auto-filling report details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedType = reportTypes.find((t) => t.id === reportData.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Review Report</Text>
          <Text style={styles.headerSubtitle}>Edit any field as needed</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.autoFilledBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.autoFilledText}>Report auto-filled successfully</Text>
        </View>

        {/* Report Type */}
        {renderEditableField(
          "Report Type",
          "type",
          reportData.type,
          () => (
            <View style={styles.fieldContent}>
              <View style={styles.typeDisplay}>
                <Ionicons name={selectedType?.icon as any} size={24} color="#007AFF" />
                <Text style={styles.typeText}>{selectedType?.label}</Text>
              </View>
            </View>
          ),
          () => (
            <View style={styles.optionsContainer}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    reportData.type === type.id && styles.selectedOption,
                  ]}
                  onPress={() => handleFieldEdit("type", type.id)}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={reportData.type === type.id ? "white" : "#007AFF"}
                    />
                  </View>
                  <Text style={styles.optionTitle}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}

        {/* Location */}
        {renderEditableField(
          "Location",
          "location",
          reportData.location,
          () => (
            <View style={styles.fieldContent}>
              <View style={styles.locationDisplay}>
                <Ionicons name="location" size={20} color="#34C759" />
                <Text style={styles.locationText}>{reportData.location}</Text>
              </View>
            </View>
          ),
          () => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter address or intersection"
                value={reportData.location}
                onChangeText={(text) => handleFieldEdit("location", text)}
                style={styles.textInput}
                autoFocus
              />
              <TouchableOpacity
                style={styles.refreshLocationButton}
                onPress={async () => {
                  const locationData = await getLocationWithAddress();
                  handleFieldEdit("location", locationData.address);
                  handleFieldEdit("coordinates", locationData.coordinates);
                }}
              >
                <Ionicons name="refresh" size={16} color="#007AFF" />
                <Text style={styles.refreshLocationText}>Use Current Location</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {/* Severity */}
        {renderEditableField(
          "Severity",
          "severity",
          reportData.severity,
          () => (
            <View style={styles.fieldContent}>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      reportData.severity === "high"
                        ? "#FF3B30"
                        : reportData.severity === "medium"
                        ? "#FF9500"
                        : "#34C759",
                  },
                ]}
              >
                <Text style={styles.severityBadgeText}>
                  {reportData.severity.toUpperCase()}
                </Text>
              </View>
            </View>
          ),
          () => (
            <View style={styles.severityContainer}>
              {severityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.severityOption,
                    reportData.severity === level.id && styles.selectedSeverity,
                  ]}
                  onPress={() => handleFieldEdit("severity", level.id)}
                >
                  <Text style={styles.severityLabel}>{level.label}</Text>
                  <Text style={styles.severityDescription}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}

        {/* Photos */}
        <View style={styles.editableField}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Photos (Optional)</Text>
            <TouchableOpacity style={styles.editButton} onPress={takePhoto}>
              <Ionicons name="camera" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.photosContainer}>
            {reportData.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() =>
                    setReportData((prev) => ({
                      ...prev,
                      photos: prev.photos.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {reportData.photos.length === 0 && (
              <Text style={styles.noPhotosText}>No photos added</Text>
            )}
          </View>
        </View>

        {/* Description */}
        {renderEditableField(
          "Description (Optional)",
          "description",
          reportData.description,
          () => (
            <View style={styles.fieldContent}>
              <Text style={reportData.description ? styles.descriptionText : styles.descriptionPlaceholder}>
                {reportData.description || "No description provided"}
              </Text>
            </View>
          ),
          () => (
            <TextInput
              placeholder="Describe the issue in detail..."
              value={reportData.description}
              onChangeText={(text) => handleFieldEdit("description", text)}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              autoFocus
            />
          )
        )}

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Safety Reminder</Text>
            <Text style={styles.warningText}>
              If this is an immediate emergency, call 911. This report will
              be visible to the community and may take time to address.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  autoFilledBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  autoFilledText: {
    fontSize: 14,
    color: "#34C759",
    marginLeft: 8,
    fontWeight: "600",
  },
  editableField: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 4,
  },
  fieldContent: {
    marginTop: 8,
  },
  typeDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 16,
    color: "#1C1C1E",
    marginLeft: 12,
  },
  locationDisplay: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationText: {
    fontSize: 16,
    color: "#1C1C1E",
    marginLeft: 8,
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  descriptionPlaceholder: {
    fontSize: 16,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  optionIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  refreshLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  refreshLocationText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 4,
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  severityContainer: {
    gap: 8,
  },
  severityOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedSeverity: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  severityDescription: {
    fontSize: 12,
    color: "#8E8E93",
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removePhoto: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotosText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#E5E5E7",
    minHeight: 80,
    textAlignVertical: "top",
  },
  warningCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9500",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
});

export default ReportScreen;
