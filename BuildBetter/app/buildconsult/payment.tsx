import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import theme from '@/app/theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import { buildconsultApi, paymentsApi, GetConsultationByIdResponse } from '@/services/api';

const bankDetails = {
  bankName: 'BCA',
  accountNumber: '8570327098',
  accountName: 'Christina Wijaya'
};

interface PaymentFormData {
  paymentProof: ImagePicker.ImagePickerAsset | null;
  paymentMethod: string;
  senderName: string;
}

interface FormErrors {
  paymentProof?: string;
  paymentMethod?: string;
  senderName?: string;
}

type ConsultationDetails = GetConsultationByIdResponse['data'];

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { consultationId, totalAmount } = params;

  const [formData, setFormData] = useState<PaymentFormData>({
    paymentProof: null,
    paymentMethod: '',
    senderName: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [fetchedCreatedAt, setFetchedCreatedAt] = useState<string | null>(null);
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);

  // Data fetching and timer initialization (logic unchanged)
  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!consultationId) {
          Alert.alert("Error", "Consultation ID not found.", [{ text: "OK", onPress: () => router.back() }]);
          return;
        }

        const response = await buildconsultApi.getConsultationById(consultationId as string);

        if (response.code === 200 && response.data) {
          setConsultationDetails(response.data);

          let consultationCreationTime = response.data.createdAt;
          if (!consultationCreationTime.endsWith('Z') && !/[-+]\d{2}:\d{2}$/.test(consultationCreationTime)) {
            consultationCreationTime += 'Z';
          }
          
          setFetchedCreatedAt(response.data.createdAt);
          
          const expiryTime = new Date(consultationCreationTime).getTime() + 10 * 60 * 1000;
          const now = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
          
          if (remainingSeconds > 0) {
              setTimeRemaining(remainingSeconds);
          } else {
              setTimeRemaining(0);
              await paymentsApi.markExpired(consultationId as string);
              Alert.alert(
                  'Waktu Habis',
                  'Waktu pembayaran untuk sesi ini telah habis. Silakan cek riwayat untuk info lebih lanjut.',
                  [{ text: 'OK', onPress: () => router.replace('/(tabs)/history') }]
              );
          }
        } else {
            Alert.alert("Error", "Could not fetch consultation details.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

      } catch (error) {
        console.error("Error initializing page:", error);
        Alert.alert("Error", "Failed to load payment details.", [{ text: "OK", onPress: () => router.back() }]);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializePage();
  }, [consultationId, router]);

  // Countdown timer effect (logic unchanged)
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) {
          clearInterval(timer);
          return null;
        }
        if (prev <= 1) {
          clearInterval(timer);
          paymentsApi.markExpired(consultationId as string)
            .then(res => console.log('Marked as expired:', res.message))
            .catch(err => console.error('Failed to mark as expired:', err));

          Alert.alert(
            'Waktu Habis',
            'Waktu pembayaran telah habis. Pemesanan Anda telah dibatalkan. Silakan cek riwayat untuk info lebih lanjut.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/history') }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, router, consultationId]);

  // Helper functions for summary and formatting
  const formatBookingDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const formatBookingTime = (startIso: string, endIso: string): string => {
    const startTime = new Date(startIso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTime = new Date(endIso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${startTime} - ${endTime}`;
  };
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  function truncate(str: string | null | undefined, maxLength: number): string {
    if (!str || typeof str !== 'string') return '';
    if (str.length > maxLength) return str.substring(0, maxLength) + '...';
    return str;
  }
  
  // Validation and handlers (unchanged)
  const validatePaymentProof = (proof: ImagePicker.ImagePickerAsset | null) => !proof ? 'Harap unggah bukti pembayaran' : undefined;
  const validatePaymentMethod = (method: string) => !method.trim() ? 'Harap isi metode pembayaran' : undefined;
  const validateSenderName = (name: string) => !name.trim() ? 'Harap isi nama pengirim' : undefined;
  const handlePaymentProofUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan izin untuk mengakses galeri foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, paymentProof: result.assets[0] }));
      setErrors(prev => ({ ...prev, paymentProof: undefined }));
    }
  };
  const handleSubmit = async () => {
    const currentErrors = {
      paymentProof: validatePaymentProof(formData.paymentProof),
      paymentMethod: validatePaymentMethod(formData.paymentMethod),
      senderName: validateSenderName(formData.senderName),
    };
    setErrors(currentErrors);
    if (Object.values(currentErrors).some(error => error)) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      const proof = formData.paymentProof!;
      const uriParts = proof.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      data.append('image', { uri: proof.uri, name: proof.fileName || `proof.${fileType}`, type: `image/${fileType}` } as any);
      data.append('paymentMethod', formData.paymentMethod);
      data.append('sender', formData.senderName);
      
      const response = await paymentsApi.uploadPaymentProof(consultationId as string, data);

      if (response.code === 200) {
        await SecureStore.deleteItemAsync('currentConsultationId');
        await SecureStore.deleteItemAsync('paymentExpiredDate');
        setTimeRemaining(null); 
        router.replace({ pathname: '/buildconsult/loading', params: { consultationId: consultationId as string, totalAmount, createdAt: fetchedCreatedAt } });
      } else {
        Alert.alert('Konfirmasi Gagal', response.error || 'Terjadi kesalahan.');
      }
    } catch (error) {
      Alert.alert('Konfirmasi Gagal', 'Terjadi kesalahan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
        </View>
      </SafeAreaView>
    );
  }

  // --- MODIFIED JSX with new structure and styles ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* MODIFIED: Timer is now always on top */}
          <View style={styles.deadlineContainer}>
            <Text style={[theme.typography.body2, styles.deadlineText]}>
              Yuk lakukan pembayaran sebelum waktunya habis!
            </Text>
            <View style={styles.timeContainer}>
              <Text style={[theme.typography.title, styles.timeText]}>
                {timeRemaining !== null ? formatTime(timeRemaining) : '00:00'}
              </Text>
            </View>
          </View>

          {/* MODIFIED: Compact Booking Summary Card */}
          {consultationDetails && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryArchitectInfo}>
                <View>
                  <Text style={[theme.typography.caption, { color: theme.colors.customOlive[50] }]}>{consultationDetails.type === 'online' ? 'Konsultasi via Chat' : 'Konsultasi Tatap Muka'} dengan:</Text>
                  <Text style={[theme.typography.subtitle2, styles.summaryArchitectName]}>
                    {consultationDetails.architectName}
                  </Text>
                  <Text style={styles.detailText}>{formatBookingDate(consultationDetails.startDate)}, {formatBookingTime(consultationDetails.startDate, consultationDetails.endDate)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Details Card (unchanged content) */}
          <View style={styles.paymentCard}>
            <View style={styles.totalSection}>
              <Text style={[theme.typography.body2, styles.totalLabel]}>Total yang perlu dibayar:</Text>
              <Text style={[theme.typography.subtitle1, styles.totalAmount]}>{formatCurrency(Number(totalAmount) || 0)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.bankSection}>
              <Text style={[theme.typography.body2, styles.sectionTitle]}>Lakukan pembayaran ke sini:</Text>
              <View style={styles.bankInfoRow}><Text style={styles.bankLabel}>Bank</Text><Text style={styles.bankValue}>{bankDetails.bankName}</Text></View>
              <View style={styles.bankInfoRow}><Text style={styles.bankLabel}>Nomor Rekening</Text><Text style={styles.bankValue}>{bankDetails.accountNumber}</Text></View>
              <View style={styles.bankInfoRow}><Text style={styles.bankLabel}>Atas Nama</Text><Text style={styles.bankValue}>{bankDetails.accountName}</Text></View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handlePaymentProofUpload} activeOpacity={0.9}>
              <Textfield
                label="Bukti Pembayaran"
                placeholder="Unggah bukti bayar disini"
                value={formData.paymentProof ? truncate(formData.paymentProof.fileName, 20) || 'Gambar terpilih' : ''}
                editable={false}
                error={errors.paymentProof}
                icon={<MaterialIcons name="file-upload" size={16} color={theme.colors.customGreen[300]} />}
              />
            </TouchableOpacity>
            {formData.paymentProof && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: formData.paymentProof.uri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setFormData(prev => ({ ...prev, paymentProof: null }))}>
                  <MaterialIcons name="close" size={16} color={theme.colors.customWhite[50]} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Additional Information Form (unchanged content) */}
          <View style={styles.additionalInfoCard}>
            <Text style={[theme.typography.body2, styles.sectionTitle]}>Setelah bayar, isi info berikut:</Text>
            <Textfield
              label="Bayar lewat apa?" placeholder="mis. Bank BCA, GoPay" value={formData.paymentMethod}
              onChangeText={(text) => { setFormData(prev => ({ ...prev, paymentMethod: text })); setErrors(prev => ({ ...prev, paymentMethod: undefined })); }}
              error={errors.paymentMethod} validate={validatePaymentMethod}
            />
            <Textfield
              label="Pengirim atas nama siapa?" placeholder="Nama pemilik rekening" value={formData.senderName}
              onChangeText={(text) => { setFormData(prev => ({ ...prev, senderName: text })); setErrors(prev => ({ ...prev, senderName: undefined })); }}
              error={errors.senderName} validate={validateSenderName}
            />
          </View>

          {/* Submit Button (unchanged content) */}
          <View style={styles.buttonContainer}>
            <Button title={isLoading ? 'Memproses...' : 'Selanjutnya'} variant="primary" onPress={handleSubmit} disabled={isLoading || timeRemaining === 0} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.customWhite[50] },
  keyboardAvoid: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  // MODIFIED: summaryCard now matches paymentCard style
  summaryCard: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryArchitectInfo: { flexDirection: 'row', alignItems: 'center' },
  summaryArchitectPhoto: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: theme.colors.customGray[50] },
  summaryArchitectName: { color: theme.colors.customOlive[100], paddingBottom: 4, paddingTop: 2 },
  detailText: { ...theme.typography.body2, color: theme.colors.customOlive[50], flex: 1, paddingBottom: 2 },
  deadlineContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8 },
  deadlineText: { color: '#FF6B6B', flex: 1 },
  timeContainer: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.customGreen[100], minWidth: 88 },
  timeText: { color: theme.colors.customOlive[50], alignSelf: 'center' },
  paymentCard: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { color: theme.colors.customOlive[50] },
  totalAmount: { color: theme.colors.customOlive[100] },
  divider: { height: 1, backgroundColor: theme.colors.customGray[100], marginBottom: 16 },
  bankSection: { marginBottom: 8 },
  sectionTitle: { color: theme.colors.customOlive[50], marginBottom: 12 },
  bankInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingLeft: 8 },
  bankLabel: { color: theme.colors.customOlive[50], flex: 1 },
  bankValue: { color: theme.colors.customOlive[100], textAlign: 'right', flex: 1 },
  imagePreview: { position: 'relative', marginTop: 8, marginBottom: 16 },
  previewImage: { width: '100%', height: 400, borderRadius: 16, backgroundColor: theme.colors.customGray[50] },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 16, padding: 8 },
  additionalInfoCard: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  buttonContainer: { marginBottom: 16 },
});

export default PaymentPage;