import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import theme from '@/app/theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import Dropdown from '@/component/Dropdown';

// Mock data - replace with actual data from props/API
const mockArchitectData = {
  id: 'arch_001',
  username: 'Erensa Ratu Chelsia',
  experience: 10,
  city: 'Kota Bandung',
  rateOnline: 30000,
  rateOffline: 100000,
  photo: null, // Will use default image
  portfolio: 'https://portfolio.example.com'
};

// Consultation types with their rates
const consultationTypes = [
  { label: 'Chat', value: 'chat', rate: mockArchitectData.rateOnline },
  { label: 'Tatap Muka', value: 'tatap_muka', rate: mockArchitectData.rateOffline }
];

// Time slots for consultation (start times only)
const timeSlots = [
  { label: '09.00', value: '09:00' },
  { label: '10.00', value: '10:00' },
  { label: '11.00', value: '11:00' },
  { label: '13.00', value: '13:00' },
  { label: '14.00', value: '14:00' },
  { label: '15.00', value: '15:00' },
  { label: '16.00', value: '16:00' },
  { label: '17.00', value: '17:00' },
  { label: '18.00', value: '18:00' },
  { label: '19.00', value: '19:00' }
];

// Duration options based on consultation type
const chatDurations = [
  { label: '30 menit', value: '30' },
  { label: '1 jam', value: '60' },
  { label: '1,5 jam', value: '90' },
  { label: '2 jam', value: '120' },
  { label: '2,5 jam', value: '150' },
  { label: '3 jam', value: '180' },
  { label: '3,5 jam', value: '210' },
  { label: '4 jam', value: '240' },
];

const tatapMukaDurations = [
  { label: '1 jam', value: '60' },
  { label: '2 jam', value: '120' },
  { label: '3 jam', value: '180' },
  { label: '4 jam', value: '240' },
  { label: '5 jam', value: '300' },
];

interface BookingFormData {
  consultationType: string;
  consultationDate: Date | null;
  consultationTime: string;
  duration: number | null;
  googleMapsLink: string;
  locationDescription: string;
  architectOnlyInBandung: boolean;
}

interface FormErrors {
  consultationType?: string;
  consultationDate?: string;
  consultationTime?: string;
  duration?: string;
  googleMapsLink?: string;
  locationDescription?: string;
}

const BookingConsultation: React.FC = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<BookingFormData>({
    consultationType: '',
    consultationDate: null,
    consultationTime: '',
    duration: null,
    googleMapsLink: '',
    locationDescription: '',
    architectOnlyInBandung: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Calculate total payment
  const calculateTotal = (): number => {
    if (!formData.consultationType || !formData.duration) {
      return 0;
    }

    const { consultationType, duration } = formData;
    
    if (consultationType === 'chat') {
      // Online rate is per 30 minutes
      const sessions = duration / 30;
      return sessions * mockArchitectData.rateOnline;
    } else if (consultationType === 'tatap_muka') {
      // Offline rate is per 60 minutes (1 hour)
      const sessions = duration / 60;
      return sessions * mockArchitectData.rateOffline;
    }
    
    return 0;
  };

  // Validation functions
  const validateConsultationType = (type: string) => {
    if (!type) return 'Harap pilih tipe konsultasi';
    return undefined;
  };

  const validateConsultationDate = (date: Date | null) => {
    if (!date) return 'Harap pilih tanggal konsultasi';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return 'Tanggal konsultasi tidak boleh di masa lalu';
    return undefined;
  };

  const validateConsultationTime = (time: string) => {
    if (!time) return 'Harap pilih waktu konsultasi';
    return undefined;
  };

  const validateDuration = (duration: number | null) => {
    if (!duration) return 'Harap pilih durasi konsultasi';
    return undefined;
  };

  const validateGoogleMapsLink = (link: string) => {
    if (!link.trim()) return 'Harap masukkan link Google Maps';
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(link)) return 'Link Google Maps tidak valid';
    return undefined;
  };

  // Handle form field changes
  const handleConsultationTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      consultationType: value,
      duration: null, // Reset duration when consultation type changes
      // Reset location fields when switching from tatap muka to chat
      googleMapsLink: value === 'chat' ? '' : prev.googleMapsLink,
      locationDescription: value === 'chat' ? '' : prev.locationDescription,
      architectOnlyInBandung: value === 'tatap_muka' ? false : prev.architectOnlyInBandung
    }));
    setErrors(prev => ({ ...prev, consultationType: undefined, duration: undefined }));
  };

  const handleDateConfirm = (date: Date) => {
    setFormData(prev => ({ ...prev, consultationDate: date }));
    setErrors(prev => ({ ...prev, consultationDate: undefined }));
    setDatePickerVisible(false);
  };

  const handleTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, consultationTime: value }));
    setErrors(prev => ({ ...prev, consultationTime: undefined }));
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setFormData(prev => ({ ...prev, duration }));
    setErrors(prev => ({ ...prev, duration: undefined }));
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Pilih tanggal konsultasi...';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const formatScheduleSummary = (): string => {
    if (!formData.consultationDate || !formData.consultationTime || !formData.duration) {
      return '';
    }
    
    const dateStr = formData.consultationDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    const endTime = calculateEndTime(formData.consultationTime, formData.duration);
    
    return `${dateStr}, ${formData.consultationTime} - ${endTime}`;
  };

  const isFormValid = (): boolean => {
    const basicFieldsValid = formData.consultationType && 
                            formData.consultationDate && 
                            formData.consultationTime && 
                            formData.duration;
    
    if (formData.consultationType === 'tatap_muka') {
      return !!(basicFieldsValid && 
                formData.googleMapsLink && 
                formData.architectOnlyInBandung);
    }
    
    return !!basicFieldsValid;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to safely handle URL opening
  const handlePortfolioPress = (portfolio: string | undefined) => {
    if (!portfolio || typeof portfolio !== 'string' || portfolio.trim() === '') {
      return;
    }
    
    try {
      // Basic URL validation
      const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
      Linking.openURL(url).catch((err) => {
        console.warn('Failed to open portfolio URL:', err);
      });
    } catch (error) {
      console.warn('Invalid portfolio URL:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const consultationTypeError = validateConsultationType(formData.consultationType);
    const consultationDateError = validateConsultationDate(formData.consultationDate);
    const consultationTimeError = validateConsultationTime(formData.consultationTime);
    const durationError = validateDuration(formData.duration);
    
    let googleMapsError, locationDescriptionError;
    if (formData.consultationType === 'tatap_muka') {
      googleMapsError = validateGoogleMapsLink(formData.googleMapsLink);
    }

    setErrors({
      consultationType: consultationTypeError,
      consultationDate: consultationDateError,
      consultationTime: consultationTimeError,
      duration: durationError,
      googleMapsLink: googleMapsError,
      locationDescription: locationDescriptionError,
    });

    if (consultationTypeError || consultationDateError || consultationTimeError || 
        durationError || googleMapsError || locationDescriptionError) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Booking data:', {
        architectId: mockArchitectData.id,
        consultationType: formData.consultationType,
        consultationDate: formData.consultationDate,
        consultationTime: formData.consultationTime,
        googleMapsLink: formData.googleMapsLink,
        locationDescription: formData.locationDescription,
        totalAmount: calculateTotal()
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Booking Berhasil',
        'Konsultasi Anda telah berhasil dijadwalkan. Kami akan menghubungi Anda segera.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/buildconsult/payment')
          }
        ]
      );
    } catch (error) {
      console.error('Booking failed:', error);
      Alert.alert(
        'Booking Gagal',
        'Terjadi kesalahan saat memproses booking. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Architect Info */}
          <View style={styles.architectCard}>
            <Image 
              source={mockArchitectData.photo ? { uri: mockArchitectData.photo } : require('@/assets/images/blank-profile.png')} 
              style={styles.architectPhoto}
              defaultSource={require('@/assets/images/blank-profile.png')}
            />
            <View style={styles.architectInfo}>
              <Text style={[theme.typography.subtitle2, styles.architectName]}>
                {mockArchitectData.username}
              </Text>
              <View style={styles.architectTags}>
                <View style={styles.tag}>
                  <FontAwesome6 name="suitcase" size={10} color={theme.colors.customGreen[200]} />
                  <Text style={[theme.typography.caption, styles.tagText]}>
                    {mockArchitectData.experience} tahun
                  </Text>
                </View>
                <View style={styles.tag}>
                  <FontAwesome6 name="location-dot" size={10} color={theme.colors.customGreen[200]} />
                  <Text style={[theme.typography.caption, styles.tagText]}>
                    {mockArchitectData.city}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.portfolioLink} onPress={() => handlePortfolioPress(mockArchitectData.portfolio)}>
                <Text style={[theme.typography.caption, styles.portfolioText]}>
                  Lihat Portfolio
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Form */}
          <View>
            <View style={styles.sectionTitle}>
              <Text style={theme.typography.subtitle1}>
                Pesan Sesi Konsultasi
              </Text>
              <Text style={[{color: theme.colors.customOlive[50], fontSize: 13, fontWeight: '400'}]}>
                Konsultasi via chat: {formatCurrency(mockArchitectData.rateOnline)} per 30 menit {'\n'}
                Konsultasi tatap muka: {formatCurrency(mockArchitectData.rateOffline)} per 1 jam
              </Text>
            </View>

            {/* Consultation Type */}
            <Dropdown
              label="Tipe konsultasi"
              placeholder="Pilih tipe konsultasi..."
              options={consultationTypes}
              value={formData.consultationType}
              onChange={handleConsultationTypeChange}
              error={errors.consultationType}
            />

            {/* Consultation Date */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={[theme.typography.body2, styles.inputLabel]}>
                  Tanggal konsultasi
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.datePickerButton, errors.consultationDate && styles.inputError]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={[
                  theme.typography.body1,
                  { color: formData.consultationDate ? theme.colors.customGreen[500] : theme.colors.customGray[100] },
                  styles.dateText
                ]}>
                  {formatDate(formData.consultationDate)}
                </Text>
                <MaterialIcons 
                  name="keyboard-arrow-down" 
                  size={24} 
                  color={theme.colors.customOlive[50]}
                  style={styles.dateIcon}
                />
              </TouchableOpacity>
              {errors.consultationDate && (
                <Text style={styles.errorText}>{errors.consultationDate}</Text>
              )}
            </View>

            {/* Consultation Time */}
            <Dropdown
              label="Waktu konsultasi"
              placeholder="Pilih waktu konsultasi..."
              options={timeSlots}
              value={formData.consultationTime}
              onChange={handleTimeChange}
              error={errors.consultationTime}
            />

            {/* Duration */}
            {formData.consultationType && (
              <Dropdown
                label="Durasi"
                placeholder="Pilih durasi konsultasi..."
                options={formData.consultationType === 'chat' ? chatDurations : tatapMukaDurations}
                value={formData.duration?.toString() || ''}
                onChange={handleDurationChange}
                error={errors.duration}
              />
            )}

            {/* Schedule Summary */}
            {formatScheduleSummary() && (
              <>
                <Text style={[theme.typography.caption, styles.scheduleLabel]}>
                  Tanggal dan waktu konsultasi yang dipilih:
                </Text>
                <Text style={[theme.typography.caption, styles.scheduleSummary]}>
                  {formatScheduleSummary()}
                </Text>
              </>
            )}

            {/* Location fields - only show for tatap muka */}
            {formData.consultationType === 'tatap_muka' && (
              <>
                <Textfield
                  label="Link Google Maps"
                  placeholder="Masukkan link Google Maps..."
                  value={formData.googleMapsLink}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, googleMapsLink: text }));
                    setErrors(prev => ({ ...prev, googleMapsLink: undefined }));
                  }}
                  error={errors.googleMapsLink}
                  validate={validateGoogleMapsLink}
                  keyboardType="url"
                  autoCapitalize="none"
                />

                <Textfield
                  label="Deskripsi Lokasi"
                  placeholder="Deskripsikan patokan lokasi..."
                  value={formData.locationDescription}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, locationDescription: text }));
                    setErrors(prev => ({ ...prev, locationDescription: undefined }));
                  }}
                  error={errors.locationDescription}
                  multiline
                  numberOfLines={3}
                />

                {/* Architect availability notice */}
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setFormData(prev => ({ ...prev, architectOnlyInBandung: !prev.architectOnlyInBandung }))}
                >
                  <View style={[styles.checkbox, formData.architectOnlyInBandung && styles.checkboxChecked]}>
                    {formData.architectOnlyInBandung && (
                      <MaterialIcons name="check" size={16} color={theme.colors.customWhite[50]} />
                    )}
                  </View>
                  <Text style={[theme.typography.body2, styles.checkboxText]}>
                    Saya mengetahui bahwa arsitek hanya dapat ditemui di {mockArchitectData.city}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Container */}
        <View style={styles.bottomContainer}>
          <View style={styles.paymentInfo}>
            <Text style={[theme.typography.body2, styles.paymentLabel]}>
              Total pembayaran
            </Text>
            <Text style={[theme.typography.title, styles.paymentAmount]}>
              {formatCurrency(calculateTotal())}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Memproses...' : 'Pesan'}
              variant="primary"
              onPress={handleSubmit}
              disabled={isLoading || !isFormValid()}
            />
          </View>
        </View>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          minimumDate={new Date()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 120, // Add padding to prevent content from being hidden behind bottom container
  },
  architectCard: {
    flexDirection: 'row',
    paddingVertical: 24,
  },
  architectPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  architectInfo: {
    flex: 1,
  },
  architectName: {
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  architectTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[100],
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
    elevation: 1,
  },
  tagText: {
    marginLeft: 4,
    color: theme.colors.customGreen[200],
    fontSize: 12,
  },
  portfolioLink: {
    alignSelf: 'flex-start',
  },
  portfolioText: {
    color: theme.colors.customGreen[300],
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    color: theme.colors.customOlive[100],
    gap: 2,
    marginBottom: 8
  },
  inputGroup: {
    marginBottom: 8,
    paddingTop: 8,
  },
  labelContainer: {
    position: 'relative',
    height: 20,
    marginBottom: 4,
  },
  inputLabel: {
    position: 'absolute',
    left: 2,
    color: theme.colors.customOlive[50],
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.customGray[50],
    borderRadius: 16,
    backgroundColor: theme.colors.customWhite[50],
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    padding: 16,
  },
  dateIcon: {
    padding: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  scheduleLabel: {
    color: theme.colors.customOlive[50],
    marginTop: 8,
    marginBottom: 4,
  },
  scheduleSummary: {
    color: theme.colors.customGreen[300],
    fontWeight: '500',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.customGray[200],
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.customGreen[300],
    borderColor: theme.colors.customGreen[300],
  },
  checkboxText: {
    color: theme.colors.customOlive[50],
    flex: 1,
    lineHeight: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[100],
    backgroundColor: theme.colors.customWhite[50],
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  paymentAmount: {
    color: theme.colors.customGreen[300],
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 16,
  },
});

export default BookingConsultation;