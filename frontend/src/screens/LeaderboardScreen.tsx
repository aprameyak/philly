import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService, UserData } from '../services/api';

// Status levels with dynamic thresholds (same as ProfileScreen)
const STATUS_LEVELS = [
  { name: 'Newbie Helper', minReports: 0, maxReports: 2, icon: 'leaf', color: '#8E8E93', description: 'Just got started' },
  { name: 'Good Samaritan', minReports: 3, maxReports: 7, icon: 'heart', color: '#34C759', description: 'Helped a few people' },
  { name: 'Community Hero', minReports: 8, maxReports: 15, icon: 'star', color: '#FF9500', description: 'Consistently helping' },
  { name: 'Neighborhood Guardian', minReports: 16, maxReports: 30, icon: 'shield', color: '#007AFF', description: 'Protects their local area' },
  { name: 'City Legend', minReports: 31, maxReports: 50, icon: 'trophy', color: '#FF2D92', description: 'Major contributor across many places' },
  { name: 'Dark Knight', minReports: 51, maxReports: 100, icon: 'moon', color: '#5856D6', description: 'Super rare / meme tier 🦇' },
  { name: 'Mythic Ally', minReports: 101, maxReports: Infinity, icon: 'diamond', color: '#FF3B30', description: 'Legendary status' },
];

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const data = await apiService.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return { name: 'trophy', color: '#FFD700' }; // Gold
      case 1:
        return { name: 'medal', color: '#C0C0C0' }; // Silver
      case 2:
        return { name: 'medal', color: '#CD7F32' }; // Bronze
      default:
        return { name: 'person', color: '#8E8E93' }; // Default
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return '#8E8E93'; // Default
    }
  };

  const formatUserDisplayName = (userData: UserData) => {
    // Try to get display name from user data, fallback to user_id
    return userData.user_id || 'Anonymous User';
  };

  const isCurrentUser = (userData: UserData) => {
    return user?.username === userData.user_id;
  };

  // Calculate current status based on total submissions
  const getCurrentStatus = (userData: UserData) => {
    const totalReports = userData.total_submissions || 0;
    return STATUS_LEVELS.find(level => 
      totalReports >= level.minReports && totalReports <= level.maxReports
    ) || STATUS_LEVELS[0];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Contributors</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={60} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to submit a report and appear on the leaderboard!
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboardContainer}>
            {leaderboard.map((userData, index) => {
              const rankIcon = getRankIcon(index);
              const rankColor = getRankColor(index);
              const isCurrent = isCurrentUser(userData);
              const userStatus = getCurrentStatus(userData);

              return (
                <View
                  key={userData.id || userData.user_id || `user-${index}`}
                  style={[
                    styles.leaderboardItem,
                    isCurrent && styles.currentUserItem,
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <View style={[styles.rankIcon, { backgroundColor: rankColor }]}>
                      <Ionicons name={rankIcon.name as any} size={20} color="white" />
                    </View>
                    <Text style={[styles.rankNumber, { color: rankColor }]}>
                      #{index + 1}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, isCurrent && styles.currentUserName]}>
                      {formatUserDisplayName(userData)}
                      {isCurrent && ' (You)'}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusIcon, { backgroundColor: userStatus.color + '20' }]}>
                        <Ionicons name={userStatus.icon as any} size={12} color={userStatus.color} />
                      </View>
                      <Text style={[styles.statusText, { color: userStatus.color }]}>
                        {userStatus.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={[styles.score, { color: rankColor }]}>
                      {userData.total_reports}
                    </Text>
                    <Text style={styles.scoreLabel}>reports</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  leaderboardContainer: {
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#007AFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userStats: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default LeaderboardScreen;