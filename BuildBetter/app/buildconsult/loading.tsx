import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import Button from '@/component/Button';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { theme } from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { buildconsultApi, GetConsultationByIdResponse, paymentsApi } from '@/services/api';

type BookingState = 'loading' | 'success' | 'payment_failed' | 'schedule_failed';
type ConsultationDetails = GetConsultationByIdResponse['data'];

const ConsultationBookingLoading = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    consultationId: string;
    totalAmount: string;
    createdAt: string;
  }>();
  const { consultationId, totalAmount } = params;

  const [bookingState, setBookingState] = useState<BookingState>('loading');
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!consultationId) return;
    const fetchDetails = async () => {
      try {
        const response = await buildconsultApi.getConsultationById(consultationId);
        if (response.code === 200 && response.data) {
          setConsultationDetails(response.data);
          // If the status is already decided when landing here, update the UI
          switch(response.data.status) {
            case 'scheduled':
              setBookingState('success');
              break;
            case 'cancelled':
              if (response.data.reason?.includes('invalid')) {
                setBookingState('payment_failed');
              } else if (response.data.reason?.includes('unavailable')) {
                setBookingState('schedule_failed');
              }
              break;
          }
        } else {
          console.error("Failed to fetch consultation details:", response.error);
        }
      } catch (error) {
        console.error("Error fetching consultation details:", error);
      }
    };
    fetchDetails();
  }, [consultationId]);

  useEffect(() => {
    if (!consultationId || bookingState !== 'loading') {
      return;
    }

    const webSocketUrl = `wss://build-better.site/ws/waiting-confirmation/${consultationId}`;
    const ws = new WebSocket(webSocketUrl);

    ws.onopen = () => console.log('WebSocket connection established.');

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'APPROVED') {
          setBookingState('success');
        } else if (data.type === 'REJECTED') {
          const rejectionMsg = (data.message || '').toLowerCase();
          if (rejectionMsg.includes('proof of payment is invalid')) {
            setBookingState('payment_failed');
          } else if (rejectionMsg.includes('architect is unavailable')) {
            setBookingState('schedule_failed');
          } else {
            console.warn("Unknown rejection reason received:", data.message);
            setBookingState('payment_failed');
          }
        }
        ws.close();
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setBookingState('payment_failed');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      Alert.alert('Koneksi Gagal', 'Tidak dapat terhubung ke server untuk konfirmasi. Silakan cek status di halaman riwayat.');
      setBookingState('payment_failed');
    };

    ws.onclose = (event) => console.log('WebSocket connection closed:', event.code, event.reason);

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [consultationId, router, bookingState]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (bookingState === 'loading') {
          Alert.alert(
            'Tunggu Sebentar', 
            'Pesanan sedang diproses. Apakah Anda ingin melihat status di halaman riwayat?', 
            [
              { text: 'Tunggu Disini', style: 'cancel' },
              { 
                text: 'Ke Riwayat', 
                onPress: () => router.replace('/(tabs)/history')
              }
            ]
          );
        } else {
          router.replace('/(tabs)/history');
        }
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [bookingState, router])
  );

  const getFormattedSchedule = () => {
    if (!consultationDetails) return { scheduleDate: '', scheduleTime: '', type: '' };
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const scheduleDate = new Date(consultationDetails.startDate).toLocaleDateString('id-ID', options);
    
    const startTime = new Date(consultationDetails.startDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = new Date(consultationDetails.endDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const type = consultationDetails.type === 'offline' ? 'Tatap Muka' : 'Online';

    return { scheduleDate, scheduleTime: `${startTime} - ${endTime}`, type };
  };

  const { scheduleDate, scheduleTime, type } = getFormattedSchedule();

  const handleGoToChat = () => {
    router.replace('/(tabs)/consult');
  };

  // MODIFIED: This function now calls the repay API and navigates back to payment page
  const handleRetryPayment = async () => {
    setIsProcessing(true);
    try {
      if (!consultationId) return;
      const response = await paymentsApi.repay(consultationId);
      if (response.code === 200) {
        Alert.alert(
          "Berhasil", 
          "Anda mendapat kesempatan lagi untuk membayar. Silakan unggah bukti pembayaran yang valid dalam 10 menit.",
          [{ text: 'OK', onPress: () => {
            router.replace({
              pathname: '/buildconsult/payment',
              params: { consultationId, totalAmount },
            });
          }}]
        );
      } else {
        Alert.alert("Gagal", response.error || "Gagal memproses permintaan pembayaran ulang.");
      }
    } catch (error) {
      console.error("Repay failed:", error);
      Alert.alert("Error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = () => {
    router.replace({
      pathname: '/buildconsult/booking',
      params: { mode: 'reschedule', consultationId },
    });
  };

  const handleBackToMain = () => {
    router.replace('/(tabs)/home');
  };

  const handleCancelConsultation = (refundMessage: boolean = false) => {
    if (!consultationId) return;

    const alertMessage = refundMessage 
      ? "Uang Anda akan dikembalikan oleh admin. Apakah Anda yakin ingin membatalkan pemesanan ini?"
      : "Apakah Anda yakin ingin membatalkan pemesanan ini?";

    Alert.alert(
      "Konfirmasi Pembatalan",
      alertMessage,
      [
        { text: "Tidak", style: "cancel" },
        { 
          text: "Ya, Batalkan", 
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              const response = await buildconsultApi.cancelConsultation(consultationId);
              if (response.code === 200) {
                Alert.alert(
                  "Pemesanan Dibatalkan",
                  "Pemesanan Anda telah berhasil dibatalkan.",
                  [{ text: "OK", onPress: () => router.replace('/(tabs)/history') }]
                );
              } else {
                Alert.alert("Gagal", response.error || "Gagal membatalkan pemesanan. Silakan coba lagi.");
              }
            } catch (error) {
              console.error("Cancellation failed:", error);
              Alert.alert("Error", "Terjadi kesalahan jaringan saat mencoba membatalkan.");
            } finally {
              setIsProcessing(false);
            }
          }
        },
      ]
    );
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
              <ActivityIndicator size="large" color={theme.colors.customGreen[300]} style={styles.loader} />
              <Text style={[styles.hintText, theme.typography.body2]}>
                Anda dapat melihat status pesanan di halaman riwayat
              </Text>
            </View>
          );
  
        case 'success':
          return (
            <View style={styles.centerContainer}>
              <MaterialIcons name="check-circle" size={120} color={theme.colors.customGreen[300]} />
              <Text style={[styles.header, theme.typography.title]}>
                Selamat, pemesanan berhasil!
              </Text>
              <Text style={[styles.subheader, theme.typography.body1]}>
                Segera lakukan konsultasi {type} di tanggal {scheduleDate} pukul {scheduleTime}
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Ke Room Chat" variant="primary" onPress={handleGoToChat} />
                <Button 
                  title="Lihat Riwayat" 
                  variant="outline" 
                  onPress={() => router.replace('/(tabs)/history')} 
                  style={styles.secondaryButton}
                />
              </View>
            </View>
          );
  
        case 'payment_failed':
          return (
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
                  title={isProcessing ? 'Memproses...' : 'Unggah Ulang'}
                  variant="primary"
                  onPress={handleRetryPayment}
                  disabled={isProcessing}
                />
                <Text style={[styles.cancelText, theme.typography.body2]}>
                  Mau batalkan pemesanan saja?{'\n'}
                  <Text style={styles.cancelLink} onPress={() => handleCancelConsultation(false)} disabled={isProcessing}>
                    Klik disini untuk kembali ke riwayat
                  </Text>
                </Text>
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
                  <Text style={styles.cancelLink} onPress={() => handleCancelConsultation(false)} disabled={isProcessing}>
                    Klik disini untuk kembali ke riwayat dan admin akan mengembalikan uangmu
                  </Text>
                </Text>
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
    hintText: {
      color: theme.colors.customOlive[50],
      textAlign: 'center',
      marginTop: 24,
      opacity: 0.7,
    },
    buttonContainer: {
      marginVertical: 16,
      width: '80%', // Added to constrain button width a bit
      alignItems: 'center',
    },
    secondaryButton: {
      marginTop: 12,
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
  });

export default ConsultationBookingLoading;