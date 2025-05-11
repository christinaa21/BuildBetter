import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { typography } from './theme/typography';
import ProgressButton from '@/component/ProgressButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { BackHandler } from 'react-native';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAuthenticated) {
        return true; // Prevent going back
      }
      return false; // Allow default behavior
    });

    return () => backHandler.remove();
  }, [isAuthenticated]);

  // If user is authenticated, don't render the landing page content at all
  // This prevents flash of content before redirect happens
  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container} onTouchEnd={() => router.push('/landing2')}>
      <View>
        <Text style={styles.welcomeText}>
          Selamat datang di
        </Text>
        <Text style={styles.buildBetter}>BuildBetter</Text>

        <Text style={[typography.body1, styles.description]}>
          BuildBetter adalah sebuah aplikasi yang dirancang untuk memudahkanmu dalam persiapan pembangunan rumah yang berkelanjutan.
        </Text>
      </View>
      <ProgressButton count={33} icon={() => <MaterialIcons name="chevron-right" size={40} color="white" />} page='/landing2'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: '50%',
    paddingBottom: '25%',
  },
  welcomeText: {
    fontFamily: theme.fonts.poppins.medium,
    fontSize: 32,
    lineHeight: 40,
    color: theme.colors.customGreen[300],
    textAlign: 'center',
  },
  buildBetter: {
    fontFamily: theme.fonts.poppins.bold,
    fontSize: 32,
    letterSpacing: 0.25,
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 32,
  },
  description: {
    color: theme.colors.customGreen[200],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});