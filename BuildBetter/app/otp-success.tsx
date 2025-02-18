import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { MaterialIcons } from '@expo/vector-icons';

const REDIRECT_DELAY = 3;

const OTPSuccess = () => {
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectInProgress = useRef(false);

  useEffect(() => {
    // Set up the main redirect timeout
    timeoutRef.current = setTimeout(() => {
      redirectInProgress.current = true;
      router.replace('/login');
    }, REDIRECT_DELAY * 1000);

    // Set up the countdown timer
    const intervalId = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        clearInterval(intervalId);
      };
    }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="check-circle" size={160} color={theme.colors.customGreen[300]} />
        
        <Text style={[styles.title, theme.typography.title]}>Verifikasi Berhasil!</Text>
        
        <Text style={[styles.message, theme.typography.body1]}>
          Akun Anda telah berhasil diverifikasi. Yuk login dengan menggunakan akun yang telah dibuat!
        </Text>
        
        <View style={styles.redirectContainer}>
          <ActivityIndicator size="small" color={theme.colors.customGreen[300]} />
          <Text style={[styles.redirectText, theme.typography.caption]}>
            Mengalihkan ke halaman login dalam {countdown} detik...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: theme.colors.customGreen[300],
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  redirectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  redirectText: {
    color: theme.colors.customGray[200],
    marginLeft: 8,
  }
});

export default OTPSuccess;