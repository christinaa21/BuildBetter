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
  Text
} from 'react-native';
import Button from '@/component/Button';
import theme from '@/app/theme';
import Dropdown from '@/component/Dropdown';
import RadioGroup from '@/component/RadioGroup';
import locationData from '@/data/location.json';

interface LocationDimensionProps {
  data: any;
  onNext: (data: any) => void;
  onBack: (data: any) => void;
}

interface LocationDimensionData {
  province: string;
  city: string;
  shape: string;
  area: string;
}

interface ValidationState {
  province: boolean;
  city: boolean;
}

const LocationDimension: React.FC<LocationDimensionProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<LocationDimensionData>({
    province: data?.province || '',
    city: data?.city || '',
    shape: data?.shape || 'Persegi Panjang',
    area: data?.area || '42 - 60',
  });
  const [errors, setErrors] = useState<Partial<LocationDimensionData>>({});
  const [isValid, setIsValid] = useState<ValidationState>({
    province: false,
    city: false,
  });
  const [cities, setCities] = useState<Array<{ label: string; value: string }>>([]);

  const provinces = locationData.provinces.map(province => ({
    label: province.label,
    value: province.value
  }));

  const handleProvinceChange = (provinceValue: string) => {
    const provinceCities = getCities(provinceValue).map(city => ({
      label: city.label,
      value: city.value
    }));
    
    setFormData(prev => ({
      ...prev,
      province: provinceValue,
      city: '',
    }));
    setCities(provinceCities);
  };

  const handleCityChange = (cityValue: string) => {
    setFormData(prev => ({
      ...prev,
      city: cityValue,
    }));
  };

  const handleShapeChange = (shapeValue: string) => {
    setFormData(prev => ({
      ...prev,
      shape: shapeValue,
    }));
  };

  const handleAreaChange = (areaValue: string) => {
    setFormData(prev => ({
      ...prev,
      area: areaValue,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[theme.typography.title, styles.title]}>
              Dimensi Lahan
            </Text>
            <Text style={[theme.typography.body2, styles.description]}>
              Kami membutuhkkan data lokasi pembangunan dan dimensi lahan untuk menyesuaikan rekomendasi desain dengan peraturan daerah setempat dan keadaan lahan yang Anda miliki.
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

              <View style={styles.radioContainer}>
              <RadioGroup
                label="Bentuk Lahan"
                options={[
                  {"label": "Persegi Panjang", "value": "Persegi Panjang"},
                  {"label": "Persegi", "value": "Persegi"}
                ]}
                value={formData.shape}
                onChange={handleShapeChange}
              />

              <RadioGroup
                label="Luas Lahan"
                options={[
                  {"label": "36 - 42 m²", "value": "36 - 42"},
                  {"label": "42 - 60 m²", "value": "42 - 60"},
                  {"label": "60 - 72 m²", "value": "60 - 72"},
                  {"label": "72 - 90 m²", "value": "72 - 90"},
                  {"label": "90 - 150 m²", "value": "90 - 150"}
                ]}
                value={formData.area}
                onChange={handleAreaChange}
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
    color: theme.colors.customGreen[200],
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 32,
  }
});

export default LocationDimension;