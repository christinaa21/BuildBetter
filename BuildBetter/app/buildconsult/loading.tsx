import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import Button from '@/component/Button';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { buildconsultApi, GetConsultationByIdResponse } from '@/services/api'; // Import API and types

type BookingState = 'loading' | 'success' | 'payment_failed' | 'schedule_failed';
type ConsultationDetails = GetConsultationByIdResponse['data'];

const ConsultationBookingLoading = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId: string }>();
  const { consultationId } = params;

  const [bookingState, setBookingState] = useState<BookingState>('loading');
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('Jadwal tidak tersedia.');

  // Effect to fetch consultation details to display on success screen
  useEffect(() => {
    if (!consultationId) return;

    const fetchDetails = async () => {
      try {
        const response = await buildconsultApi.getConsultationById(consultationId);
        if (response.code === 200 && response.data) {
          setConsultationDetails(response.data);
        } else {
          console.error("Failed to fetch consultation details:", response.error);
          // If we can't get details, we can't show a proper success screen.
          // This could be a generic failure state.
          setBookingState('payment_failed'); 
          setRejectionMessage('Gagal memuat detail konsultasi.');
        }
      } catch (error) {
        console.error("Error fetching consultation details:", error);
        setBookingState('payment_failed');
        setRejectionMessage('Gagal memuat detail konsultasi.');
      }
    };

    fetchDetails();
  }, [consultationId]);

  // Effect for WebSocket connection
  useEffect(() => {
    // Don't start WebSocket if there's no consultationId
    if (!consultationId) {
      Alert.alert("Error", "ID Konsultasi tidak ditemukan.", [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]);
      return;
    }

    const webSocketUrl = `wss://build-better.site/ws/waiting-confirmation/${consultationId}`;
    const ws = new WebSocket(webSocketUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established.');
      // The state is already 'loading', which is correct.
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'APPROVED') {
          setBookingState('success');
          // Close the connection as its purpose is fulfilled
          ws.close(); 
        } else if (message.type === 'REJECTED') {
          // Based on your example, rejection is due to schedule.
          // We can use the message from the server.
          setRejectionMessage(message.message || 'Jadwal yang dipilih tidak tersedia.');
          setBookingState('schedule_failed');
          // Close the connection
          ws.close();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setRejectionMessage('Terjadi kesalahan yang tidak terduga.');
        setBookingState('payment_failed'); // Use as a generic error state
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server untuk konfirmasi. Silakan periksa status konsultasi Anda secara manual nanti.');
      setRejectionMessage('Gagal terhubung ke server.');
      setBookingState('payment_failed'); // Use as a generic error state
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    // Cleanup function: close the WebSocket when the component unmounts
    return () => {
      // Check if the WebSocket is still open or connecting before trying to close
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [consultationId, router]); // Dependency array

  // Disable back button while loading
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (bookingState === 'loading') {
          Alert.alert('Tunggu Sebentar', 'Pesanan sedang diproses, mohon tunggu...');
        } else {
          router.replace('/(tabs)/consult'); // Navigate to a safe page
        }
        return true; // Prevent default back action
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [bookingState, router])
  );

  // Helper to format date and time from the fetched details
  const getFormattedSchedule = () => {
    if (!consultationDetails) {
      return { scheduleDate: '', scheduleTime: '' };
    }
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const scheduleDate = new Date(consultationDetails.startDate).toLocaleDateString('id-ID', options);
    
    const startTime = new Date(consultationDetails.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = new Date(consultationDetails.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    return { scheduleDate, scheduleTime: `${startTime} - ${endTime}` };
  };

  const { scheduleDate, scheduleTime } = getFormattedSchedule();

  const handleGoToChat = () => {
    // Here you would navigate to the chat room with the roomId
    if(consultationDetails?.roomId) {
        router.push(`/`);
    } else {
        Alert.alert("Info", "Room chat akan segera tersedia.");
        router.replace('/(tabs)/consult');
    }
  };

  const handleRetryPayment = () => {
    // Go back to payment page, but it might be better to go to the consultation list
    router.back();
  };

  const handleReschedule = () => {
    // Navigate back to schedule selection for the same architect
    // You might need to pass architectId
    router.replace(`/`);
  };
  
  const handleBackToMain = () => {
    router.replace('/(tabs)/home');
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
              Admin sedang mengonfirmasi pesananmu...
            </Text>
            <ActivityIndicator size="large" color={theme.colors.customGreen[300]} style={styles.loader} />
          </View>
        );

      case 'success':
        return (
          <View style={styles.centerContainer}>
            <MaterialIcons name="check-circle" size={120} color={theme.colors.customGreen[300]} />
            <Text style={[styles.header, theme.typography.title]}>
              Selamat, pemesanan berhasil!
            </Text>
            {consultationDetails && (
              <Text style={[styles.subheader, theme.typography.body1]}>
                Segera lakukan konsultasi {consultationDetails.type} pada {scheduleDate} pukul {scheduleTime}
              </Text>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Lihat Detail Konsultasi" variant="primary" onPress={() => router.replace('/(tabs)/consult')} />
            </View>
          </View>
        );

      case 'payment_failed': // Generic failure
        return (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={120} color={theme.colors.customGray[100]} />
            <Text style={[styles.header, theme.typography.title]}>
              Oops, terjadi kesalahan!
            </Text>
            <Text style={[styles.subheader, theme.typography.body1]}>
              {rejectionMessage}
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Kembali ke Konsultasi" variant="primary" onPress={() => router.replace('/(tabs)/consult')} />
            </View>
          </View>
        );

      case 'schedule_failed':
        return (
          <View style={styles.centerContainer}>
            <MaterialIcons name="event-busy" size={120} color={theme.colors.customGray[100]} />
            <Text style={[styles.header, theme.typography.title]}>
              Yah, jadwalnya tidak tersedia!
            </Text>
            <Text style={[styles.subheader, theme.typography.body1]}>
              {rejectionMessage}
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title={isProcessing ? 'Loading...' : 'Pilih Ulang Jadwal'}
                variant="primary"
                onPress={handleReschedule}
                disabled={isProcessing}
              />
              <TouchableOpacity onPress={handleBackToMain}>
                <Text style={[styles.cancelText, theme.typography.body2]}>
                  Kembali ke beranda
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
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
    justifyContent: 'center',
  },
  centerContainer: {
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
    lineHeight: 22,
  },
  loader: {
    marginTop: 24,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.customGreen[300],
    textAlign: 'center',
    marginTop: 24,
    textDecorationLine: 'underline',
  },
});

export default ConsultationBookingLoading;