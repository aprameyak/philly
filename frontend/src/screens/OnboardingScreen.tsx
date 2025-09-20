import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();

  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Alert.alert('Success', 'Location access enabled');
        navigation.navigate('Main' as never);
      } else {
        Alert.alert('Permission Denied', 'You can still browse incidents by searching for locations');
        navigation.navigate('Main' as never);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      navigation.navigate('Main' as never);
    }
  };

  const handleBrowseWithoutLocation = () => {
    navigation.navigate('Main' as never);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1641956405046-5e81c5bcff14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGlsYWRlbHBoaWElMjBjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3NTgzMzg4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      }}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="location" size={40} color="#007AFF" />
          </View>
          <Text style={styles.title}>PhillySafe</Text>
          <Text style={styles.subtitle}>Crime Heatmaps & Community Reports</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="map" size={24} color="#007AFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Interactive Crime Heatmaps</Text>
              <Text style={styles.featureDescription}>
                Visualize incident density across Philadelphia neighborhoods
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Community Reporting</Text>
              <Text style={styles.featureDescription}>
                Report broken lights, trash piles, and other local issues
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="time" size={24} color="#FF9500" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real-time Updates</Text>
              <Text style={styles.featureDescription}>
                Stay informed with the latest incident data and reports
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLocationPermission}>
            <Ionicons name="location" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Enable Location & Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBrowseWithoutLocation}>
            <Text style={styles.secondaryButtonText}>Browse Without Location</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            We use your location to show nearby incidents and enable location-based reporting.
            You can change this anytime in settings.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  ctaContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default OnboardingScreen;