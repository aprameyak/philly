import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Incident } from '../services/api';

const IncidentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { incident } = route.params as { incident: Incident };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent': return '#FF3B30';
      case 'property': return '#FF9500';
      case 'vehicle': return '#007AFF';
      case 'drug': return '#8E4EC6';
      case 'vandalism': return '#FF2D92';
      case 'quality-of-life': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'resolved': return '#34C759';
      case 'in-progress': return '#FF9500';
      case 'open': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${incident.type} reported at ${incident.location} - ${incident.description || 'No description available'}`,
        title: 'PhilaWatch Incident Report',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const timeInfo = formatTime(incident.time);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.typeContainer}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(incident.category) }]} />
              <Text style={styles.incidentType}>{incident.type}</Text>
            </View>
            
            <View style={styles.badges}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                <Text style={styles.badgeText}>{incident.severity.toUpperCase()}</Text>
              </View>
              <View style={[styles.sourceBadge, { backgroundColor: incident.source === 'official' ? '#007AFF' : '#FF9500' }]}>
                <Text style={styles.badgeText}>{incident.source === 'official' ? 'OFFICIAL' : 'COMMUNITY'}</Text>
              </View>
              {incident.status && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                  <Text style={styles.badgeText}>{incident.status.toUpperCase().replace('-', ' ')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.address}>{incident.address}</Text>
          <Text style={styles.neighborhood}>{incident.neighborhood}</Text>
          <Text style={styles.distance}>{incident.distance} miles from your location</Text>
        </View>

        {/* Time Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#FF9500" />
            <Text style={styles.sectionTitle}>When</Text>
          </View>
          <Text style={styles.dateTime}>{timeInfo.date}</Text>
          <Text style={styles.time}>{timeInfo.time}</Text>
        </View>

        {/* Description */}
        {incident.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{incident.description}</Text>
          </View>
        )}

        {/* Case Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#8E4EC6" />
            <Text style={styles.sectionTitle}>Case Details</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{incident.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
          </View>
          
          {incident.caseNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Case Number:</Text>
              <Text style={styles.detailValue}>{incident.caseNumber}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Incident ID:</Text>
            <Text style={styles.detailValue}>#{incident.id}</Text>
          </View>
          
          {incident.reportedBy && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reported By:</Text>
              <Text style={styles.detailValue}>{incident.reportedBy}</Text>
            </View>
          )}
        </View>

        {/* Photos */}
        {incident.photos && incident.photos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={20} color="#FF2D92" />
              <Text style={styles.sectionTitle}>Photos</Text>
            </View>
            <Text style={styles.photosCount}>{incident.photos.length} photo(s) attached</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flag" size={20} color="#FF3B30" />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Save Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="navigate" size={20} color="#34C759" />
            <Text style={styles.actionButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Tips */}
        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield" size={20} color="#FF9500" />
            <Text style={styles.safetyTitle}>Safety Reminder</Text>
          </View>
          <Text style={styles.safetyText}>
            Stay alert when in this area. If you witness any suspicious activity or feel unsafe, 
            contact local authorities immediately. For emergencies, call 911.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  incidentType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sourceBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  neighborhood: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dateTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#8E8E93',
  },
  description: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  photosCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
    fontWeight: '500',
  },
  safetySection: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

export default IncidentDetailsScreen;