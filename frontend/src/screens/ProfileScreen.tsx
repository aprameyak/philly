import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { apiService, UserData } from '../services/api';

// Status levels with dynamic thresholds
const STATUS_LEVELS = [
  { name: 'Newbie Helper', minReports: 0, maxReports: 2, icon: 'leaf', color: '#8E8E93', description: 'Just got started' },
  { name: 'Good Samaritan', minReports: 3, maxReports: 7, icon: 'heart', color: '#34C759', description: 'Helped a few people' },
  { name: 'Community Hero', minReports: 8, maxReports: 15, icon: 'star', color: '#FF9500', description: 'Consistently helping' },
  { name: 'Neighborhood Guardian', minReports: 16, maxReports: 30, icon: 'shield', color: '#007AFF', description: 'Protects their local area' },
  { name: 'City Legend', minReports: 31, maxReports: 50, icon: 'trophy', color: '#FF2D92', description: 'Major contributor across many places' },
  { name: 'Dark Knight', minReports: 51, maxReports: 100, icon: 'moon', color: '#5856D6', description: 'Super rare / meme tier 🦇' },
  { name: 'Mythic Ally', minReports: 101, maxReports: Infinity, icon: 'diamond', color: '#FF3B30', description: 'Legendary status' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.username) {
        try {
          const data = await apiService.getUserData(user.username);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user?.username]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => { logout(); } },
      ]
    );
  };

  // Calculate current status based on total submissions
  const getCurrentStatus = () => {
    const totalReports = userData?.total_submissions || 0;
    return STATUS_LEVELS.find(level => 
      totalReports >= level.minReports && totalReports <= level.maxReports
    ) || STATUS_LEVELS[0];
  };

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    const totalReports = userData?.total_submissions || 0;
    const currentStatus = getCurrentStatus();
    const currentIndex = STATUS_LEVELS.findIndex(level => level.name === currentStatus.name);
    
    // If at max level, return null
    if (currentIndex === STATUS_LEVELS.length - 1) {
      return null;
    }
    
    const nextLevel = STATUS_LEVELS[currentIndex + 1];
    const reportsNeeded = nextLevel.minReports - totalReports;
    
    return {
      nextLevel: nextLevel.name,
      reportsNeeded: Math.max(0, reportsNeeded),
      progress: Math.min(100, ((totalReports - currentStatus.minReports) / (nextLevel.minReports - currentStatus.minReports)) * 100)
    };
  };

  const statsData = [
    { label: 'Reports Submitted', value: userData?.total_submissions?.toString() || '0', icon: 'document-text' },
  ];

  const currentStatus = getCurrentStatus();
  const progressToNext = getProgressToNextLevel();

  const menuItems = [
    { title: 'Logout', icon: 'log-out', onPress: handleLogout, isDestructive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.username}>{user?.display_name || 'User'}</Text>
          <Text style={styles.userSubtitle}>@{user?.username} • Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025'}</Text>
        </View>

        {/* My Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>My Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: currentStatus.color + '20' }]}>
                <Ionicons name={currentStatus.icon as any} size={24} color={currentStatus.color} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusName, { color: currentStatus.color }]}>{currentStatus.name}</Text>
                <Text style={styles.statusDescription}>{currentStatus.description}</Text>
              </View>
            </View>
            
            {progressToNext && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>Progress to {progressToNext.nextLevel}</Text>
                  <Text style={styles.progressCount}>{progressToNext.reportsNeeded} more reports</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progressToNext.progress}%`, backgroundColor: currentStatus.color }]} />
                </View>
              </View>
            )}
            
            {!progressToNext && (
              <View style={styles.maxLevelContainer}>
                <Text style={styles.maxLevelText}>🏆 You've reached the highest status!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {statsData.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon as any} size={20} color="#007AFF" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>


        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.isDestructive ? "#FF3B30" : "#8E8E93"} 
                  />
                </View>
                <Text style={[
                  styles.menuTitle,
                  item.isDestructive && styles.destructiveText
                ]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PhillySafe v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for Philadelphia</Text>
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
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  statusSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E5E7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  maxLevelContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  maxLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
});

export default ProfileScreen;