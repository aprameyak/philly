import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login({ username: username.trim(), password });
      } else {
        await register({ 
          username: username.trim(), 
          password, 
          display_name: displayName.trim() 
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#007AFF" />
            <Text style={styles.title}>PhillySafe</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-circle-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Keep Philadelphia safe by reporting incidents and staying informed
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AuthScreen;
