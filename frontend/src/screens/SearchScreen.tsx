import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCrime } from '../hooks/useIncidents';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { incidents, loading } = useCrime();

  const handleBack = () => {
    navigation.goBack();
  };

  // Extract unique neighborhoods from real crime data
  const neighborhoods = React.useMemo(() => {
    const uniqueNeighborhoods = new Set<string>();
    incidents.forEach(incident => {
      if (incident.location_block) {
        // Extract neighborhood from location_block (e.g., "100 BLOCK N 2ND ST" -> "N 2ND ST")
        const parts = incident.location_block.split(' ');
        if (parts.length > 2) {
          const neighborhood = parts.slice(2).join(' ');
          uniqueNeighborhoods.add(neighborhood);
        }
      }
    });
    return Array.from(uniqueNeighborhoods).sort((a, b) => a.localeCompare(b));
  }, [incidents]);

  // Extract unique locations from real crime data
  const locations = React.useMemo(() => {
    const uniqueLocations = new Set<string>();
    incidents.forEach(incident => {
      if (incident.location_block) {
        uniqueLocations.add(incident.location_block);
      }
    });
    return Array.from(uniqueLocations).sort((a, b) => a.localeCompare(b));
  }, [incidents]);

  const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
    neighborhood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Location</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Search neighborhoods, addresses, landmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...filteredNeighborhoods.map(n => ({ type: 'neighborhood', name: n, address: '' })), 
            ...filteredLocations.map(l => ({ type: 'location', name: l, address: l }))
          ]}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResult}>
              <Ionicons 
                name={item.type === 'neighborhood' ? 'location' : 'business'} 
                size={20} 
                color="#8E8E93" 
              />
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.name}</Text>
                {item.type === 'location' && Boolean(item.address) && (
                  <Text style={styles.resultSubtitle}>{item.address}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1C1C1E',
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default SearchScreen;