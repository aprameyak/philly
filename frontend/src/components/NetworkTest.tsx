import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/api';

export const NetworkTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      // Test AuthAPI connection
      const leaderboard = await apiService.getLeaderboard();
      setStatus(`✅ AuthAPI connected! Found ${leaderboard.length} users`);
      
      // Test dbapi connection
      const crimeData = await apiService.getCrime();
      setStatus(`✅ Both APIs connected! AuthAPI: ${leaderboard.length} users, dbapi: ${crimeData.length} crime records`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Connection failed: ${errorMessage}`);
      console.error('Network test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setStatus('Testing login...');
    
    try {
      // Test login with a test user
      const loginResult = await apiService.loginUser({
        username: 'testuser',
        password: 'password123'
      });
      
      setStatus(`✅ Login successful! User: ${loginResult.username}, Reports: ${loginResult.total_reports}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Login failed: ${errorMessage}`);
      console.error('Login test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      <Text style={styles.status}>{status}</Text>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
        onPress={testLogin}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          {loading ? 'Testing...' : 'Test Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: 'white',
  },
});