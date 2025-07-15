import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  ActivityIndicator
} from 'react-native';
import Button from '@/component/Button';
import theme from '@/app/theme';
import Dropdown from '@/component/Dropdown';
import locationData from '@/data/location.json';

interface LocationProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: (data: any) => void;
}

interface LocationData {
  province: string;
  city: string;
}

interface ValidationState {
  province: boolean;
  city: boolean;
}

const Location: React.FC<LocationProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<LocationData>({
    province: data?.province || '',
    city: data?.city || '',
  });
  const [errors, setErrors] = useState<Partial<LocationData>>({});
  const [isValid, setIsValid] = useState<ValidationState>({
    province: false,
    city: false,
  });
  const [cities, setCities] = useState<Array<{ label: string; value: string }>>([]);
  const [initializing, setInitializing] = useState(true);
  
  const provinces = locationData.provinces.map(province => ({
    label: province.label,
    value: province.value
  }));

  // Initialize cities array when province is already set (from API)
  useEffect(() => {
    if (formData.province) {
      const provinceCities = getCities(formData.province).map(city => ({
        label: city.label,
        value: city.value
      }));
      setCities(provinceCities);
      setInitializing(false);
    } else {
      setInitializing(false);
    }
  }, []);

  // Update cities when province changes
  useEffect(() => {
    if (formData.province) {
      const provinceCities = getCities(formData.province).map(city => ({
        label: city.label,
        value: city.value
      }));
      setCities(provinceCities);
    }
  }, [formData.province]);

  const handleProvinceChange = (provinceValue: string) => {
    const provinceCities = getCities(provinceValue).map(city => ({
      label: city.label,
      value: city.value
    }));
    
    setFormData(prev => ({
      ...prev,
      province: provinceValue,
      city: '', // Reset city when province changes
    }));
    setCities(provinceCities);
  };

  const handleCityChange = (cityValue: string) => {
    setFormData(prev => ({
      ...prev,
      city: cityValue,
    }));
  };

  const getCities = (provinceValue: string) => {
    const province = locationData.provinces.find(p => p.value === provinceValue);
    return province?.cities || [];
  };

  const buttonAnimation = new Animated.Value(0);

  const validateProvince = (province: string) => {
    if (!province) return 'Harap pilih provinsi';
    return undefined;
  };

  const validateCity = (city: string) => {
    if (!city) return 'Harap pilih kota';
    return undefined;
  };

  const handleValidation = (field: keyof ValidationState, isFieldValid: boolean) => {
    setIsValid(prev => ({
      ...prev,
      [field]: isFieldValid,
    }));
  };

  const handleData = async () => {
    Keyboard.dismiss();

    const provinceError = validateProvince(formData.province);
    const cityError = validateCity(formData.city);

    setErrors({
      province: provinceError,
      city: cityError,
    });

    if (provinceError || cityError) {
      animateButton();
      return;
    }

    try {
      onNext(formData);
    } catch (error) {
      console.error('Data input failed', error);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (initializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <Text style={[theme.typography.title, styles.title]}>
              Lokasi Pembangunan
            </Text>
            <Text style={[theme.typography.body2, styles.description]}>
              Kami membutuhkkan data lokasi pembangunan untuk menyesuaikan rekomendasi desain dengan peraturan daerah setempat.
            </Text>
            <Text style={[theme.typography.caption, styles.disclaimer]}>
              Semua pertanyaan berikut harus dijawab.
            </Text>

            <View style={styles.inputContainer}>
              <Dropdown
                label="Provinsi"
                placeholder="Pilih provinsi"
                searchPlaceholder='Cari provinsi...'
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                error={errors.province}
              />

              <Dropdown
                label="Kota"
                placeholder="Pilih kota"
                searchPlaceholder='Cari kota...'
                options={cities}
                value={formData.city}
                onChange={handleCityChange}
                error={errors.city}
              />
            </View>

            <Animated.View style={[{ transform: [{ translateX: buttonAnimation }] }, styles.button]}>
              <Button
                title={'Selanjutnya'}
                variant="primary"
                onPress={handleData}
              />
            </Animated.View>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    paddingBottom: 80, // Default padding to ensure button is always visible
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.colors.customGreen[300],
    paddingBottom: 8,
  },
  description: {
    color: theme.colors.customGray[200],
    lineHeight: 20,
    paddingBottom: 8,
  },
  disclaimer: {
    color: '#ED4337',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Location;