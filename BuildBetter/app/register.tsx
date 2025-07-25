import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Textfield from '@/component/Textfield';
import { useRouter } from 'expo-router';
import Button from '@/component/Button';
import {theme} from './theme';
import Dropdown from '@/component/Dropdown';
import locationData from '@/data/location.json';
import { authApi } from '@/services/api';

interface RegisterFormData {
  email: string;
  phone: string;
  name: string;
  province: string;
  city: string;
  password: string;
  password2: string;
}

interface ValidationState {
  email: boolean;
  phone: boolean;
  name: boolean;
  province: boolean;
  city: boolean;
  password: boolean;
  password2: boolean;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    name: '',
    province: '',
    city: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<ValidationState>({
    email: false,
    phone: false,
    name: false,
    province: false,
    city: false,
    password: false,
    password2: false,
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

  const getCities = (provinceValue: string) => {
    const province = locationData.provinces.find(p => p.value === provinceValue);
    return province?.cities || [];
  };

  const buttonAnimation = new Animated.Value(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Harap masukkan email';
    if (!emailRegex.test(email)) return 'Format email salah';
    return undefined;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const numberWithoutPrefix = cleanPhone.replace(/^(\+62|0)/, '');
    return '+62' + numberWithoutPrefix;
  };  

  const validatePhone = (phone: string): string | undefined => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (!cleanPhone) {
      return 'Harap masukkan nomor telepon';
    }

    if (!cleanPhone.match(/^(\+62|0)/)) {
      return 'Nomor telepon harus dimulai dengan +62 atau 0';
    }

    const numberWithoutPrefix = cleanPhone.replace(/^(\+62|0)/, '');
    
    if (numberWithoutPrefix[0] !== '8') {
      return 'Nomor telepon harus dimulai dengan 8 setelah kode negara/0';
    }

    if (numberWithoutPrefix.length < 10 || numberWithoutPrefix.length > 13) {
      return 'Panjang nomor telepon tidak valid (harap masukkan 10-13 digit)';
    }

    const secondDigit = numberWithoutPrefix[1];
    if (!['1', '2', '3', '5', '7', '8', '9'].includes(secondDigit)) {
      return 'Prefix nomor telepon tidak valid';
    }

    return undefined;
  };

  const validateName = (name: string) => {
    if (!name) return 'Harap masukkan nama lengkap';
    return undefined;
  };

  const validateProvince = (province: string) => {
    if (!province) return 'Harap pilih provinsi';
    return undefined;
  };

  const validateCity = (city: string) => {
    if (!city) return 'Harap pilih kota';
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password)
        return 'Harap masukkan kata sandi';

    if (password.length < 8)
        return 'Kata sandi harus terdiri dari setidaknya 8 karakter';

    if (!/[A-Z]/.test(password))
        return 'Kata sandi harus mengandung minimal 1 huruf kapital';

    if (!/[a-z]/.test(password))
        return 'Kata sandi harus mengandung minimal 1 huruf kecil';

    if (!/\d/.test(password))
        return 'Kata sandi harus mengandung minimal 1 angka';

    if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(password))
        return 'Kata sandi harus mengandung minimal 1 karakter khusus';
    
    if (/\s/.test(password))
        return 'Kata sandi tidak boleh mengandung spasi';
    return undefined;
  };

  const validatePassword2 = useCallback((password2: string) => {
    if (!password2) return 'Harap ketik ulang kata sandi';
    if (password2 !== formData.password) return 'Kata sandi tidak cocok';
    return undefined;
  }, [formData.password]);

  const handleValidation = (field: keyof ValidationState, isFieldValid: boolean) => {
    setIsValid(prev => ({
      ...prev,
      [field]: isFieldValid,
    }));
  };

  const router = useRouter();

  const handleRegister = async () => {
    Keyboard.dismiss();

    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const nameError = validateName(formData.name);
    const provinceError = validateProvince(formData.province);
    const cityError = validateCity(formData.city);
    const passwordError = validatePassword(formData.password);
    const password2Error = validatePassword2(formData.password2);

    setErrors({
      email: emailError,
      phone: phoneError,
      name: nameError,
      province: provinceError,
      city: cityError,
      password: passwordError,
      password2: password2Error,
    });

    if (emailError || phoneError || nameError || provinceError || cityError || passwordError || password2Error) {
      animateButton();
      return;
    }
    
    const formattedPhone = formatPhoneNumber(formData.phone);
    
    setIsLoading(true);
    try {
      // Get province and city labels from their values for the API
      const provinceObj = locationData.provinces.find(p => p.value === formData.province);
      const cityObj = provinceObj?.cities.find(c => c.value === formData.city);
      
      const provinceLabel = provinceObj?.label || formData.province;
      const cityLabel = cityObj?.label || formData.city;

      // Prepare API request data - map our form fields to the expected API format
      const registerData = {
        phoneNumber: formattedPhone,
        email: formData.email,
        username: formData.name,  // Using name as username
        province: provinceLabel,
        city: cityLabel,
        password: formData.password
      };

      // Call the register API
      const response = await authApi.register(registerData);
      
      if (response.code === 201) {
        console.log('Register successful', response.data);
        
        // Store the email for the OTP verification
        await SecureStore.setItemAsync('userEmail', formData.email);
        
        // Directly navigate to OTP page without showing alert
        router.replace('/otp');
      } else {
        // Handle API error responses
        console.error('Register failed', response.error);
        
        // Format the error messages for display
        let errorMessage = 'Something went wrong. Please try again.';
        if (response.error && Array.isArray(response.error) && response.error.length > 0) {
          errorMessage = response.error.join('\n');
        }
        
        Alert.alert(
          'Registration Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Register request failed', error);
      Alert.alert(
        'Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
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
            <Image source={require('@/assets/images/adaptive-icon.png')} style={styles.logo}/>
            
            <View style={styles.inputContainer}>
              <Textfield
                label="E-mail"
                example="example@gmail.com"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, email: text }));
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                validate={validateEmail}
                onValidation={(isValid) => handleValidation('email', isValid)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Textfield
                label="Nomor Telepon"
                example="+6281234567890"
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, phone: text }));
                  setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                validate={validatePhone}
                onValidation={(isValid) => {
                  handleValidation('phone', isValid);
                }}
                keyboardType="phone-pad"
              />

              <Textfield
                label="Nama Lengkap"
                example="Build Better"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, name: text }));
                }}
                error={errors.name}
                validate={validateName}
                onValidation={(isValid) => handleValidation('name', isValid)}
                autoComplete="name"
                autoCapitalize='words'
              />

              <Dropdown
                label="Provinsi Domisili"
                placeholder="Pilih provinsi"
                searchPlaceholder='Cari provinsi...'
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                error={errors.province}
              />

              <Dropdown
                label="Kota Domisili"
                placeholder="Pilih kota"
                searchPlaceholder='Cari kota...'
                options={cities}
                value={formData.city}
                onChange={handleCityChange}
                error={errors.city}
              />

              <Textfield
                label="Kata sandi"
                example='Password123!'
                value={formData.password}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, password: text }));
                  setErrors(prev => ({ ...prev, password: undefined }));
                  if (formData.password2) {
                    setErrors(prev => ({ ...prev, password2: undefined }));
                  }
                }}
                error={errors.password}
                validate={validatePassword}
                onValidation={(isValid) => handleValidation('password', isValid)}
                isPassword
                autoComplete="password"
              />

              <Textfield
                label="Ulang kata sandi"
                example='Password123'
                value={formData.password2}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, password2: text }));
                  setErrors(prev => ({ ...prev, password2: undefined }));
                }}
                error={errors.password2}
                validate={validatePassword2}
                onValidation={(isValid) => handleValidation('password2', isValid)}
                isPassword
              />
            </View>

            <Animated.View style={[{ transform: [{ translateX: buttonAnimation }] }, styles.button]}>
              <Button
                title={isLoading ? 'Loading...' : 'Register'}
                variant="primary"
                onPress={handleRegister}
                disabled={isLoading}
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
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 32,
  }
});

export default Register;