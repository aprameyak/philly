import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppFilters } from '../types/navigation';

const FilterScreen = () => {
  const navigation = useNavigation();
  const [filters, setFilters] = useState<AppFilters>({
    timeRange: '7d',
    crimeTypes: [],
    timeOfDay: [],
    dataSources: {
      official: true,
      community: true,
    },
    heatmapIntensity: [50],
    heatmapRadius: [30],
    showHeatmap: true,
    searchLocation: ''
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleApplyFilters = () => {
    // Apply filters and go back
    navigation.goBack();
  };

  const handleResetFilters = () => {
    setFilters({
      timeRange: '7d',
      crimeTypes: [],
      timeOfDay: [],
      dataSources: {
        official: true,
        community: true,
      },
      heatmapIntensity: [50],
      heatmapRadius: [30],
      showHeatmap: true,
      searchLocation: ''
    });
  };

  const timeRanges = [
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 3 Months' },
  ];

  const crimeTypes = [
    { id: 'violent', label: 'Violent Crime', color: '#FF3B30' },
    { id: 'property', label: 'Property Crime', color: '#FF9500' },
    { id: 'vehicle', label: 'Vehicle Crime', color: '#007AFF' },
    { id: 'drug', label: 'Drug Activity', color: '#8E4EC6' },
    { id: 'vandalism', label: 'Vandalism', color: '#FF2D92' },
    { id: 'quality-of-life', label: 'Quality of Life', color: '#34C759' },
  ];

  const toggleCrimeType = (typeId: string) => {
    setFilters(prev => ({
      ...prev,
      crimeTypes: prev.crimeTypes.includes(typeId)
        ? prev.crimeTypes.filter(id => id !== typeId)
        : [...prev.crimeTypes, typeId]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleResetFilters} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={styles.optionsGrid}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.timeRangeOption,
                  filters.timeRange === range.id && styles.selectedOption
                ]}
                onPress={() => setFilters({ ...filters, timeRange: range.id })}
              >
                <Text style={[
                  styles.optionText,
                  filters.timeRange === range.id && styles.selectedOptionText
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crime Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Types</Text>
          <View style={styles.crimeTypesList}>
            {crimeTypes.map((crime) => (
              <TouchableOpacity
                key={crime.id}
                style={[
                  styles.crimeTypeOption,
                  filters.crimeTypes.includes(crime.id) && styles.selectedCrimeType
                ]}
                onPress={() => toggleCrimeType(crime.id)}
              >
                <View style={[styles.crimeTypeColor, { backgroundColor: crime.color }]} />
                <Text style={[
                  styles.crimeTypeText,
                  filters.crimeTypes.includes(crime.id) && styles.selectedCrimeTypeText
                ]}>
                  {crime.label}
                </Text>
                {filters.crimeTypes.includes(crime.id) && (
                  <Ionicons name="checkmark" size={16} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sources</Text>
          
          <View style={styles.sourceOption}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#F0F8FF' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={styles.sourceTitle}>Official Reports</Text>
                <Text style={styles.sourceSubtitle}>Police and government data</Text>
              </View>
            </View>
            <Switch
              value={filters.dataSources.official}
              onValueChange={(value) => setFilters({
                ...filters,
                dataSources: { ...filters.dataSources, official: value }
              })}
              trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
              thumbColor="white"
            />
          </View>

          <View style={styles.sourceOption}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="people" size={20} color="#FF9500" />
              </View>
              <View>
                <Text style={styles.sourceTitle}>Community Reports</Text>
                <Text style={styles.sourceSubtitle}>User-submitted incidents</Text>
              </View>
            </View>
            <Switch
              value={filters.dataSources.community}
              onValueChange={(value) => setFilters({
                ...filters,
                dataSources: { ...filters.dataSources, community: value }
              })}
              trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Map Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map Display</Text>
          
          <View style={styles.sourceOption}>
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIcon, { backgroundColor: '#F0FFF0' }]}>
                <Ionicons name="layers" size={20} color="#34C759" />
              </View>
              <View>
                <Text style={styles.sourceTitle}>Show Heatmap</Text>
                <Text style={styles.sourceSubtitle}>3D density visualization</Text>
              </View>
            </View>
            <Switch
              value={filters.showHeatmap}
              onValueChange={(value) => setFilters({ ...filters, showHeatmap: value })}
              trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Active Filters Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Filters</Text>
          <View style={styles.activeFiltersContainer}>
            {filters.timeRange !== '7d' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {timeRanges.find(r => r.id === filters.timeRange)?.label}
                </Text>
              </View>
            )}
            {filters.crimeTypes.map(typeId => {
              const crime = crimeTypes.find(c => c.id === typeId);
              return crime ? (
                <View key={typeId} style={styles.activeFilterChip}>
                  <View style={[styles.miniColorDot, { backgroundColor: crime.color }]} />
                  <Text style={styles.activeFilterText}>{crime.label}</Text>
                </View>
              ) : null;
            })}
            {(!filters.dataSources.official || !filters.dataSources.community) && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {filters.dataSources.official ? 'Official only' : 'Community only'}
                </Text>
              </View>
            )}
            {filters.crimeTypes.length === 0 && filters.timeRange === '7d' && filters.dataSources.official && filters.dataSources.community && (
              <Text style={styles.noFiltersText}>No active filters</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 16,
    color: '#007AFF',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeRangeOption: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  crimeTypesList: {
    gap: 8,
  },
  crimeTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCrimeType: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
  },
  crimeTypeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  crimeTypeText: {
    fontSize: 16,
    color: '#1C1C1E',
    flex: 1,
  },
  selectedCrimeTypeText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  sourceSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeFilterText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  miniColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  noFiltersText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterScreen;