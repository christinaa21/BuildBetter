// app/buildconsult/booking.tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import theme from '@/app/theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import Dropdown from '@/component/Dropdown';
import { buildconsultApi } from '@/services/api';

// Define interfaces for the API response
interface ArchitectSchedule {
  date: string;
  time: string[];
}

interface ArchitectData {
  id: string;
  username: string;
  experience: number;
  city: string;
  rateOnline: number;
  rateOffline: number;
  photo?: string;
  portfolio?: string;
}

// Consultation types with their rates
const consultationTypes = [
  { label: 'Chat', value: 'chat' },
  { label: 'Tatap Muka', value: 'tatap_muka' }
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

// NEW: Helper function to perform time calculations
const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const newHours = date.getHours().toString().padStart(2, '0');
  const newMins = date.getMinutes().toString().padStart(2, '0');
  return `${newHours}:${newMins}`;
};

const BookingConsultation: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const architectData: ArchitectData = params.architectData 
    ? JSON.parse(params.architectData as string) 
    : null;

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
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [architectSchedules, setArchitectSchedules] = useState<ArchitectSchedule[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    if (!architectData) {
      Alert.alert('Error', 'Architect data not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [architectData, router]);

  const fetchArchitectSchedules = async () => {
    if (!architectData?.id) return;

    try {
      setScheduleLoading(true);
      const response = await buildconsultApi.getArchitectSchedules(architectData.id);
      
      if (response.code === 200 && response.data) {
        setArchitectSchedules(response.data);
      } else {
        console.error('Failed to fetch architect schedules:', response.error);
        Alert.alert('Error', 'Failed to load architect availability');
      }
    } catch (error) {
      console.error('Error fetching architect schedules:', error);
      Alert.alert('Error', 'Failed to load architect availability');
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitectSchedules();
  }, [architectData?.id]);

  const generateAllTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 19 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // CHANGED: This useEffect now handles duration and commute buffers.
  useEffect(() => {
    if (formData.consultationDate) {
      const selectedDateStr = formData.consultationDate.toISOString().split('T')[0];
      const unavailableForDate = architectSchedules.find(schedule => schedule.date === selectedDateStr);
      const baseUnavailableSlots = unavailableForDate ? unavailableForDate.time.map(time => time.substring(0, 5)) : [];

      // NEW: Add 1-hour commute buffer for offline consultations
      let effectiveUnavailableSlots = [...baseUnavailableSlots];
      if (formData.consultationType === 'tatap_muka') {
        const bufferedSlots = new Set<string>();
        baseUnavailableSlots.forEach(slot => {
          // Assuming each booked slot is at least 30 mins
          bufferedSlots.add(slot); // The slot itself
          // 1 hour buffer before
          bufferedSlots.add(addMinutesToTime(slot, -30));
          bufferedSlots.add(addMinutesToTime(slot, -60));
          // 1 hour buffer after
          bufferedSlots.add(addMinutesToTime(slot, 30));
          bufferedSlots.add(addMinutesToTime(slot, 60));
        });
        effectiveUnavailableSlots = Array.from(bufferedSlots);
      }
      
      const allTimeSlots = generateAllTimeSlots();
      
      // NEW: Filter available slots based on duration
      const durationInMinutes = formData.duration || 30; // Default to 30 mins if not selected

      const durationAwareAvailableSlots = allTimeSlots.filter(startTime => {
        // A start time is valid if it and all its subsequent slots needed for the duration are available.
        for (let i = 0; i < durationInMinutes; i += 30) {
          const checkTime = addMinutesToTime(startTime, i);
          if (effectiveUnavailableSlots.includes(checkTime)) {
            return false; // This time window is blocked.
          }
        }
        return true; // This time window is free.
      });

      const timeSlots = durationAwareAvailableSlots.map(time => ({
        label: time,
        value: time
      }));
      
      setAvailableTimeSlots(timeSlots);
      
      // Reset selected time if it's no longer available after duration/type change
      if (!durationAwareAvailableSlots.includes(formData.consultationTime)) {
        setFormData(prev => ({ ...prev, consultationTime: '' }));
      }
    }
  }, [formData.consultationDate, formData.duration, formData.consultationType, architectSchedules]);

  const calculateTotal = (): number => {
    if (!formData.consultationType || !formData.duration || !architectData) {
      return 0;
    }

    const { consultationType, duration } = formData;
    
    if (consultationType === 'chat') {
      const sessions = duration / 30;
      return sessions * architectData.rateOnline;
    } else if (consultationType === 'tatap_muka') {
      const sessions = duration / 60;
      return sessions * architectData.rateOffline;
    }
    
    return 0;
  };

  const validateConsultationType = (type: string) => {
    if (!type) return 'Harap pilih tipe konsultasi';
    return undefined;
  };

  const validateConsultationDate = (date: Date | null) => {
    if (!date) return 'Harap pilih tanggal konsultasi';
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
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(link)) return 'Link Google Maps tidak valid';
    return undefined;
  };

  const handleConsultationTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      consultationType: value,
      duration: null,
      consultationTime: '',
      googleMapsLink: value === 'chat' ? '' : prev.googleMapsLink,
      locationDescription: value === 'chat' ? '' : prev.locationDescription,
      architectOnlyInBandung: value === 'tatap_muka' ? false : prev.architectOnlyInBandung
    }));
    setErrors(prev => ({ ...prev, consultationType: undefined, duration: undefined }));
  };

  const handleDateConfirm = (date: Date) => {
    setFormData(prev => ({ ...prev, consultationDate: date, consultationTime: '' }));
    setErrors(prev => ({ ...prev, consultationDate: undefined }));
    setDatePickerVisible(false);
  };

  const handleTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, consultationTime: value }));
    setErrors(prev => ({ ...prev, consultationTime: undefined }));
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setFormData(prev => ({ ...prev, duration, consultationTime: '' }));
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
    return addMinutesToTime(startTime, duration);
  };

  // ... (the rest of the component remains largely the same)

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

  const handlePortfolioPress = (portfolio: string | undefined) => {
    if (!portfolio || typeof portfolio !== 'string' || portfolio.trim() === '') {
      return;
    }
    
    try {
      const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
      Linking.openURL(url).catch((err) => {
        console.warn('Failed to open portfolio URL:', err);
      });
    } catch (error) {
      console.warn('Invalid portfolio URL:', error);
    }
  };

  const handleSubmit = async () => {
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
      console.log('Booking data:', {
        architectId: architectData?.id,
        consultationType: formData.consultationType,
        consultationDate: formData.consultationDate,
        consultationTime: formData.consultationTime,
        googleMapsLink: formData.googleMapsLink,
        locationDescription: formData.locationDescription,
        totalAmount: calculateTotal()
      });

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

  if (!architectData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
        </View>
      </SafeAreaView>
    );
  }

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
              source={architectData.photo ? { uri: architectData.photo } : require('@/assets/images/blank-profile.png')} 
              style={styles.architectPhoto}
              defaultSource={require('@/assets/images/blank-profile.png')}
            />
            <View style={styles.architectInfo}>
              <Text style={[theme.typography.subtitle2, styles.architectName]}>
                {architectData.username}
              </Text>
              <View style={styles.architectTags}>
                <View style={styles.tag}>
                  <FontAwesome6 name="suitcase" size={10} color={theme.colors.customGreen[200]} />
                  <Text style={[theme.typography.caption, styles.tagText]}>
                    {architectData.experience} tahun
                  </Text>
                </View>
                <View style={styles.tag}>
                  <FontAwesome6 name="location-dot" size={10} color={theme.colors.customGreen[200]} />
                  <Text style={[theme.typography.caption, styles.tagText]}>
                    {architectData.city}
                  </Text>
                </View>
              </View>
              {architectData.portfolio && (
                <TouchableOpacity style={styles.portfolioLink} onPress={() => handlePortfolioPress(architectData.portfolio)}>
                  <Text style={[theme.typography.caption, styles.portfolioText]}>
                    Lihat Portfolio
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Booking Form */}
          <View>
            <View style={styles.sectionTitle}>
              <Text style={theme.typography.subtitle1}>
                Pesan Sesi Konsultasi
              </Text>
              <Text style={[{color: theme.colors.customOlive[50], fontSize: 13, fontWeight: '400'}]}>
                Konsultasi via chat: {formatCurrency(architectData.rateOnline)} per 30 menit {'\n'}
                Konsultasi tatap muka: {formatCurrency(architectData.rateOffline)} per 1 jam
              </Text>
            </View>

            <Dropdown
              label="Tipe konsultasi"
              placeholder="Pilih tipe konsultasi..."
              options={consultationTypes}
              value={formData.consultationType}
              onChange={handleConsultationTypeChange}
              error={errors.consultationType}
            />

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={[theme.typography.body2, styles.inputLabel]}>
                  Tanggal konsultasi
                  {scheduleLoading && (
                    <ActivityIndicator size="small" color={theme.colors.customGreen[300]} style={{ marginLeft: 8 }} />
                  )}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.datePickerButton, errors.consultationDate && styles.inputError]}
                onPress={() => setDatePickerVisible(true)}
                disabled={scheduleLoading}
              >
                <Text style={[
                  theme.typography.body1,
                  { color: formData.consultationDate ? theme.colors.customGreen[500] : theme.colors.customGray[100] },
                  styles.dateText
                ]}>
                  {scheduleLoading ? 'Memuat jadwal...' : formatDate(formData.consultationDate)}
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

            {/* CHANGED: Duration is now only enabled if a type is also selected */}
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

            <Dropdown
              label="Waktu konsultasi"
              placeholder="Pilih waktu konsultasi..."
              options={availableTimeSlots}
              value={formData.consultationTime}
              onChange={handleTimeChange}
              error={errors.consultationTime}
              disabled={!formData.consultationDate || !formData.duration || availableTimeSlots.length === 0}
            />
            
            {formatScheduleSummary() && (
              <>
                <Text style={[theme.typography.caption, styles.scheduleLabel]}>
                  Estimasi jadwal konsultasi:
                </Text>
                <Text style={[theme.typography.caption, styles.scheduleSummary]}>
                  {formatScheduleSummary()}
                </Text>
              </>
            )}

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
                    Saya mengetahui bahwa arsitek hanya dapat ditemui di {architectData.city}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

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

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          minimumDate={new Date()}
          maximumDate={new Date(new Date().setDate(new Date().getDate() + 90))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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