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
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import theme from '@/app/theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import { buildconsultApi, paymentsApi } from '@/services/api';

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

  // MODIFIED: Countdown timer initialization
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        if (!consultationId) {
          Alert.alert("Error", "Consultation ID not found.", [{ text: "OK", onPress: () => router.back() }]);
          return;
        }

        console.log("Fetching consultation details for timer...");
        const response = await buildconsultApi.getConsultationById(consultationId as string);

        if (response.code === 200 && response.data) {
          // --- START OF THE FIX ---
          let consultationCreationTime = response.data.createdAt;
          
          console.log(`[Timer] Raw createdAt from API: ${consultationCreationTime}`);

          // BEST PRACTICE: Ensure the timestamp string is treated as UTC.
          // If the string doesn't end with 'Z' (for UTC) or have a timezone offset, append 'Z'.
          if (!consultationCreationTime.endsWith('Z') && !/[-+]\d{2}:\d{2}$/.test(consultationCreationTime)) {
            consultationCreationTime += 'Z';
            console.log(`[Timer] Normalized to UTC: ${consultationCreationTime}`);
          }
          // --- END OF THE FIX ---

          setFetchedCreatedAt(response.data.createdAt); // Store original for submission
          
          const expiryTime = new Date(consultationCreationTime).getTime() + 10 * 60 * 1000;
          const now = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
          
          // Add some debugging logs to see the final calculation
          console.log(`[Timer] Expiry Timestamp (ms): ${expiryTime}`);
          console.log(`[Timer] Current Timestamp (ms): ${now}`);
          console.log(`[Timer] Remaining Seconds: ${remainingSeconds}`);
          
          if (remainingSeconds > 0) {
              setTimeRemaining(remainingSeconds);
          } else {
              setTimeRemaining(0);
              // This part is correct, it will trigger if the time is already expired on load.
              await paymentsApi.markExpired(consultationId as string);
              Alert.alert(
                  'Waktu Habis',
                  'Waktu pembayaran untuk sesi ini telah habis. Silakan cek riwayat untuk info lebih lanjut.',
                  [{ text: 'OK', onPress: () => router.replace('/(tabs)/consult') }]
              );
          }
        } else {
            Alert.alert("Error", "Could not fetch consultation details for timer.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

      } catch (error) {
        console.error("Error initializing timer:", error);
        Alert.alert("Error", "Failed to initialize payment timer.", [{ text: "OK", onPress: () => router.back() }]);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeTimer();
  }, [consultationId, router]);

  // MODIFIED: Countdown timer effect with expiry logic
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
          // Time is up, call the markExpired API
          console.log('Timer expired. Marking consultation as expired.');
          paymentsApi.markExpired(consultationId as string)
            .then(res => console.log('Marked as expired:', res.message))
            .catch(err => console.error('Failed to mark as expired:', err));

          Alert.alert(
            'Waktu Habis',
            'Waktu pembayaran telah habis. Pemesanan Anda telah dibatalkan. Silakan cek riwayat untuk info lebih lanjut.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/consult') }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, router, consultationId]);

  // Format countdown timer
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  function truncate(str: string | null | undefined, maxLength: number): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }

  // Validation functions (unchanged)
  const validatePaymentProof = (proof: ImagePicker.ImagePickerAsset | null) => {
    if (!proof) return 'Harap unggah bukti pembayaran';
    return undefined;
  };

  const validatePaymentMethod = (method: string) => {
    if (!method.trim()) return 'Harap isi metode pembayaran';
    return undefined;
  };

  const validateSenderName = (name: string) => {
    if (!name.trim()) return 'Harap isi nama pengirim';
    return undefined;
  };

  const handlePaymentProofUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan izin untuk mengakses galeri foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: [9, 19],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, paymentProof: result.assets[0] }));
        setErrors(prev => ({ ...prev, paymentProof: undefined }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  // handleSubmit (modified to navigate with fetchedCreatedAt)
  const handleSubmit = async () => {
    const paymentProofError = validatePaymentProof(formData.paymentProof);
    const paymentMethodError = validatePaymentMethod(formData.paymentMethod);
    const senderNameError = validateSenderName(formData.senderName);

    const currentErrors = {
      paymentProof: paymentProofError,
      paymentMethod: paymentMethodError,
      senderName: senderNameError,
    };

    setErrors(currentErrors);

    if (Object.values(currentErrors).some(error => error !== undefined)) {
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      const proof = formData.paymentProof!;
      
      const uriParts = proof.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      data.append('image', {
        uri: proof.uri,
        name: proof.fileName || `proof.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      data.append('paymentMethod', formData.paymentMethod);
      data.append('sender', formData.senderName);
      
      const response = await paymentsApi.uploadPaymentProof(consultationId as string, data);

      if (response.code === 200) {
        await SecureStore.deleteItemAsync('currentConsultationId');
        await SecureStore.deleteItemAsync('paymentExpiredDate');
        setTimeRemaining(null); 
        
        router.replace({
          pathname: '/buildconsult/loading',
          params: { 
            consultationId: consultationId as string,
            totalAmount: totalAmount,
            createdAt: fetchedCreatedAt // Use the fetched createdAt
          }
        });

      } else {
        Alert.alert('Konfirmasi Gagal', response.error || 'Terjadi kesalahan saat memproses konfirmasi pembayaran.');
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      Alert.alert('Konfirmasi Gagal', 'Terjadi kesalahan. Periksa koneksi internet Anda dan coba lagi.');
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

  // --- JSX is largely unchanged, so it's omitted for brevity but should be kept as is in your file ---
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
          {/* Payment Deadline Notice */}
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

          {/* Payment Details Card */}
          <View style={styles.paymentCard}>
            <View style={styles.totalSection}>
              <Text style={[theme.typography.body2, styles.totalLabel]}>
                Total yang perlu dibayar:
              </Text>
              <Text style={[theme.typography.subtitle1, styles.totalAmount]}>
                {formatCurrency(Number(totalAmount) || 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.bankSection}>
              <Text style={[theme.typography.body2, styles.sectionTitle]}>
                Lakukan pembayaran ke sini:
              </Text>
              
              <View style={styles.bankInfoRow}>
                <Text style={[theme.typography.body2, styles.bankLabel]}>
                  Bank
                </Text>
                <Text style={[theme.typography.body2, styles.bankValue]}>
                  {bankDetails.bankName}
                </Text>
              </View>

              <View style={styles.bankInfoRow}>
                <Text style={[theme.typography.body2, styles.bankLabel]}>
                  Nomor Rekening
                </Text>
                <Text style={[theme.typography.body2, styles.bankValue]}>
                  {bankDetails.accountNumber}
                </Text>
              </View>

              <View style={styles.bankInfoRow}>
                <Text style={[theme.typography.body2, styles.bankLabel]}>
                  Atas Nama
                </Text>
                <Text style={[theme.typography.body2, styles.bankValue]}>
                  {bankDetails.accountName}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Payment Proof Upload */}
            <TouchableOpacity onPress={handlePaymentProofUpload} activeOpacity={0.9}>
              <Textfield
                label="Bukti Pembayaran"
                placeholder="Unggah bukti bayar disini"
                value={formData.paymentProof ? truncate(formData.paymentProof.fileName, 20) || 'Gambar terpilih' : ''}
                editable={false}
                error={errors.paymentProof}
                icon={
                    <MaterialIcons 
                      name="file-upload" 
                      size={16} 
                      color={theme.colors.customGreen[300]} 
                    />
                }
              />
            </TouchableOpacity>

            {/* Show selected image preview */}
            {formData.paymentProof && (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: formData.paymentProof.uri }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFormData(prev => ({ ...prev, paymentProof: null }))}
                >
                  <MaterialIcons name="close" size={16} color={theme.colors.customWhite[50]} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Additional Information Form */}
          <View style={styles.additionalInfoCard}>
            <Text style={[theme.typography.body2, styles.sectionTitle]}>
              Setelah bayar, isi info berikut:
            </Text>

            <Textfield
              label="Bayar lewat apa?"
              placeholder="mis. Bank BCA, GoPay"
              value={formData.paymentMethod}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, paymentMethod: text }));
                setErrors(prev => ({ ...prev, paymentMethod: undefined }));
              }}
              error={errors.paymentMethod}
              validate={validatePaymentMethod}
            />

            <Textfield
              label="Pengirim atas nama siapa?"
              placeholder="Nama pemilik rekening"
              value={formData.senderName}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, senderName: text }));
                setErrors(prev => ({ ...prev, senderName: undefined }));
              }}
              error={errors.senderName}
              validate={validateSenderName}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Memproses...' : 'Selanjutnya'}
              variant="primary"
              onPress={handleSubmit}
              disabled={isLoading || timeRemaining === 0}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles are unchanged, so they are omitted for brevity but should be kept as is ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  deadlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  deadlineText: {
    color: '#FF6B6B',
    flex: 1,
  },
  timeContainer: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[100],
    minWidth: 88,
  },
  timeText: {
    color: theme.colors.customOlive[50],
    alignSelf: 'center'
  },
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
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: theme.colors.customOlive[50],
  },
  totalAmount: {
    color: theme.colors.customOlive[100],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.customGray[100],
    marginBottom: 16,
  },
  bankSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: theme.colors.customOlive[50],
    marginBottom: 12,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bankLabel: {
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  bankValue: {
    color: theme.colors.customOlive[100],
    textAlign: 'right',
    flex: 1,
  },
  imagePreview: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: theme.colors.customGray[50],
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 8,
  },
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
  buttonContainer: {
    marginBottom: 16,
  },
});

export default PaymentPage;