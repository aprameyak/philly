import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, UserData } from '../services/api';

interface UserStatsProps {
  userId: string;
  onClose?: () => void;
}

const UserStats: React.FC<UserStatsProps> = ({ userId, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUserData(userId);
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!userData) return 0;
    const currentLevelXP = userData.experience_points % 100;
    return currentLevelXP;
  };

  const getNextLevelXP = () => {
    if (!userData) return 100;
    return 100 - (userData.experience_points % 100);
  };

  const getAchievementIcon = (achievement: string) => {
    switch (achievement) {
      case 'first_report':
        return '🎯';
      case 'reporter_10':
        return '📊';
      case 'reporter_50':
        return '🏆';
      case 'streak_7':
        return '🔥';
      case 'streak_30':
        return '💪';
      case 'photographer':
        return '📸';
      default:
        return '🏅';
    }
  };

  const getAchievementName = (achievement: string) => {
    switch (achievement) {
      case 'first_report':
        return 'First Report';
      case 'reporter_10':
        return 'Dedicated Reporter';
      case 'reporter_50':
        return 'Crime Fighter';
      case 'streak_7':
        return 'Week Warrior';
      case 'streak_30':
        return 'Monthly Champion';
      case 'photographer':
        return 'Photo Evidence';
      default:
        return 'Achievement';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Stats</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your stats...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Stats</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load stats</Text>
          <TouchableOpacity onPress={fetchUserData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Stats</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>No stats available yet</Text>
          <Text style={styles.emptySubtext}>Submit your first report to start tracking!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Stats</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Level and XP */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelText}>Level {userData.level}</Text>
            <Text style={styles.xpText}>{userData.experience_points} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getLevelProgress()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {getNextLevelXP()} XP to next level
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{userData.total_reports}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="camera" size={24} color="#34C759" />
            <Text style={styles.statNumber}>{userData.total_photos_submitted}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>{userData.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFD60A" />
            <Text style={styles.statNumber}>{userData.longest_streak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Achievements */}
        {userData.achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {userData.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>
                    {getAchievementIcon(achievement)}
                  </Text>
                  <Text style={styles.achievementName}>
                    {getAchievementName(achievement)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Report Types */}
        {Object.keys(userData.submission_types).length > 0 && (
          <View style={styles.typesSection}>
            <Text style={styles.sectionTitle}>Report Types</Text>
            {Object.entries(userData.submission_types).map(([type, count]) => (
              <View key={type} style={styles.typeRow}>
                <Text style={styles.typeName}>{type}</Text>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  xpText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E7',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  achievementsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  typesSection: {
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 16,
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  typeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default UserStats;
