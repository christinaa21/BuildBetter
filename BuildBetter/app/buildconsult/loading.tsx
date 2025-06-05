import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import Button from '@/component/Button';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';

type BookingState = 'loading' | 'success' | 'payment_failed' | 'schedule_failed';

// Mock data for testing
const MOCK_BOOKING_DATA = {
  bookingId: 'BK001',
  scheduleDate: '31 Mei 2025',
  scheduleTime: '17:00 - 18:00',
  type: 'Tatap Muka'
};

// Type for mock API response
type MockApiResponse = {
  code: number;
  data?: string;
  error?: string;
};

// Mock scenarios - you can change this to test different states
const MOCK_SCENARIOS: Record<string, MockApiResponse> = {
  success: { code: 200, data: 'booking confirmed' },
  payment_failed: { code: 400, error: 'pembayaran gagal' },
  schedule_failed: { code: 400, error: 'jadwal tidak tersedia' },
};

const ConsultationBookingLoading = () => {
  const [bookingState, setBookingState] = useState<BookingState>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockScenario, setMockScenario] = useState<keyof typeof MOCK_SCENARIOS>('success');
  const router = useRouter();
  
  // Get booking parameters from URL params or use mock data
  const params = useLocalSearchParams<{ 
    bookingId: string; 
    scheduleDate: string; 
    scheduleTime: string;
    scenario?: keyof typeof MOCK_SCENARIOS;
  }>();
  
  const bookingId = params.bookingId || MOCK_BOOKING_DATA.bookingId;
  const scheduleDate = params.scheduleDate || MOCK_BOOKING_DATA.scheduleDate;
  const scheduleTime = params.scheduleTime || MOCK_BOOKING_DATA.scheduleTime;
  const type = MOCK_BOOKING_DATA.type;

  // Disable back button/gesture
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Return true to prevent default back action
        // You can show an alert or handle it differently based on state
        if (bookingState === 'loading') {
          Alert.alert(
            'Tunggu Sebentar',
            'Pesanan sedang diproses, mohon tunggu...',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Keluar?',
            'Apakah Anda yakin ingin keluar dari halaman ini?',
            [
              { text: 'Batal', style: 'cancel' },
              { text: 'Ya', onPress: () => router.replace('/(tabs)/home') }
            ]
          );
        }
        return true; // Prevent default back action
      };

      // Add event listener
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function
      return () => backHandler.remove();
    }, [bookingState, router])
  );

  // Process booking when component mounts
  useEffect(() => {
    const processBooking = async () => {
      try {
        // Use scenario from params or default mock scenario
        const scenario = params.scenario || mockScenario;
        const mockResponse = MOCK_SCENARIOS[scenario];
        
        console.log('Mock booking processing...', { bookingId, scenario });
        
        if (mockResponse.code === 200) {
          setBookingState('success');
        } else if (mockResponse.error && (mockResponse.error.includes('payment') || mockResponse.error.includes('pembayaran'))) {
          setBookingState('payment_failed');
        } else if (mockResponse.error && (mockResponse.error.includes('schedule') || mockResponse.error.includes('jadwal'))) {
          setBookingState('schedule_failed');
        } else {
          setBookingState('payment_failed');
        }
      } catch (error) {
        console.error('Mock booking error:', error);
        setBookingState('payment_failed');
      }
    };

    // Add delay to show loading state
    const timer = setTimeout(() => {
      processBooking();
    }, 5000); // Increased to 3 seconds to better see loading state

    return () => clearTimeout(timer);
  }, [bookingId, params.scenario, mockScenario]);

  const handleGoToChat = () => {
    console.log('Navigating to chat room...');
    // router.replace('/chat-room');
    Alert.alert('Mock Action', 'Would navigate to chat room');
  };

  const handleRetryPayment = () => {
    setIsProcessing(true);
    console.log('Retrying payment...');
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Mock Action', 'Would navigate to payment page');
      router.back();
    }, 1000);
  };

  const handleReschedule = () => {
    setIsProcessing(true);
    console.log('Rescheduling...');
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Mock Action', 'Would navigate to schedule selection');
      // router.replace('/consultation-schedule');
    }, 1000);
  };

  const handleBackToMain = () => {
    console.log('Going back to main...');
    Alert.alert('Mock Action', 'Would navigate to main page');
    router.replace('/(tabs)/home');
  };

  // Mock scenario switcher for testing (remove in production)
  const handleScenarioSwitch = (scenario: keyof typeof MOCK_SCENARIOS) => {
    setMockScenario(scenario);
    setBookingState('loading');
    
    setTimeout(() => {
      const mockResponse = MOCK_SCENARIOS[scenario];
      if (mockResponse.code === 200) {
        setBookingState('success');
      } else if (mockResponse.error && mockResponse.error.includes('pembayaran')) {
        setBookingState('payment_failed');
      } else if (mockResponse.error && mockResponse.error.includes('jadwal')) {
        setBookingState('schedule_failed');
      }
    }, 2000);
  };

  const renderContent = () => {
    switch (bookingState) {
      case 'loading':
        return (
          <View style={styles.centerContainer}>
            <MaterialIcons name="hourglass-empty" size={120} color={theme.colors.customGreen[300]} />
            <Text style={[styles.header, theme.typography.title]}>
              Tunggu sebentar ya!
            </Text>
            <Text style={[styles.subheader, theme.typography.body1]}>
              Admin sedang mengonfirmasi pesananmu
            </Text>
            <ActivityIndicator 
              size="large" 
              color={theme.colors.customGreen[300]} 
              style={styles.loader}
            />
          </View>
        );

      case 'success':
        return (
          <>
            <View style={styles.centerContainer}>
              <MaterialIcons name="check-circle" size={120} color={theme.colors.customGreen[300]} />
              <Text style={[styles.header, theme.typography.title]}>
                Selamat, pemesanan berhasil!
              </Text>
              <Text style={[styles.subheader, theme.typography.body1]}>
                Segera lakukan konsultasi {type} di tanggal {scheduleDate} pukul {scheduleTime}
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                    title="Ke Room Chat"
                    variant="primary"
                    onPress={handleGoToChat}
                />
              </View>
            </View>
          </>
        );

      case 'payment_failed':
        return (
          <>
            <View style={styles.centerContainer}>
              <MaterialIcons name="credit-card-off" size={120} color={theme.colors.customGray[100]} />
              <Text style={[styles.header, theme.typography.title]}>
                Yah, pembayaranmu gagal!
              </Text>
              <Text style={[styles.subheader, theme.typography.body1]}>
                Mau coba unggah bukti pembayaran ulang?
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                    title={isProcessing ? 'Loading...' : 'Unggah Ulang'}
                    variant="primary"
                    onPress={handleRetryPayment}
                    disabled={isProcessing}
                />
                <Text style={[styles.cancelText, theme.typography.body2]}>
                    Mau batalkan pemesanan saja?{'\n'}
                    <Text 
                    style={styles.cancelLink}
                    onPress={handleBackToMain}
                    >
                    Klik disini untuk kembali ke beranda
                    </Text>
                </Text>
              </View>
            </View>
          </>
        );

      case 'schedule_failed':
        return (
          <>
            <View style={styles.centerContainer}>
              <MaterialIcons name="event-busy" size={120} color={theme.colors.customGray[100]} />
              <Text style={[styles.header, theme.typography.title]}>
                Yah, jadwalnya tidak tersedia!
              </Text>
              <Text style={[styles.subheader, theme.typography.body1]}>
                Mau pilih jadwal ulang?
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                    title={isProcessing ? 'Loading...' : 'Pilih Ulang'}
                    variant="primary"
                    onPress={handleReschedule}
                    disabled={isProcessing}
                />
                <Text style={[styles.cancelText, theme.typography.body2]}>
                    Mau batalkan pemesanan saja?{'\n'}
                    <Text 
                    style={styles.cancelLink}
                    onPress={handleBackToMain}
                    >
                    Klik disini untuk kembali ke beranda dan{'\n'}
                    admin akan mengembalikan uangmu
                    </Text>
                </Text>
              </View>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
        
        {/* Mock Scenario Switcher - Remove in production */}
        {__DEV__ && (
          <View style={styles.mockControls}>
            <Text style={styles.mockTitle}>Mock Scenarios (Dev Only):</Text>
            <View style={styles.mockButtons}>
              <TouchableOpacity 
                style={[styles.mockButton, { backgroundColor: theme.colors.customGreen[300] }]}
                onPress={() => handleScenarioSwitch('success')}
              >
                <Text style={styles.mockButtonText}>Success</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.mockButton, { backgroundColor: '#ff6b6b' }]}
                onPress={() => handleScenarioSwitch('payment_failed')}
              >
                <Text style={styles.mockButtonText}>Payment Failed</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.mockButton, { backgroundColor: '#4ecdc4' }]}
                onPress={() => handleScenarioSwitch('schedule_failed')}
              >
                <Text style={styles.mockButtonText}>Schedule Failed</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingHorizontal: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: theme.colors.customGreen[300],
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  subheader: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
  },
  loader: {
    marginTop: 16,
  },
  buttonContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginTop: 32,
  },
  cancelLink: {
    color: theme.colors.customGreen[300],
    textDecorationLine: 'underline',
  },
  // Mock controls styles (remove in production)
  mockControls: {
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderRadius: 8,
  },
  mockTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  mockButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mockButton: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  mockButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConsultationBookingLoading;