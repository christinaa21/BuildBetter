import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import Textfield from '@/component/Textfield';
import { useRouter } from 'expo-router';

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationState {
  email: boolean;
  password: boolean;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<ValidationState>({
    email: false,
    password: false,
  });

  const buttonAnimation = new Animated.Value(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const handleValidation = (field: keyof ValidationState, isFieldValid: boolean) => {
    setIsValid(prev => ({
      ...prev,
      [field]: isFieldValid,
    }));
  };

  const router = useRouter();

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!isValid.email || !isValid.password) {
      animateButton();
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Add your actual login logic here
      console.log('Login successful', formData);
    } catch (error) {
      console.error('Login failed', error);
      setErrors({
        email: 'Invalid credentials',
        password: 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
      console.log("Navigating to /test");
      router.push('/test');
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
                label="Kata sandi"
                example='Password123'
                value={formData.password}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, password: text }));
                  setErrors(prev => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                validate={validatePassword}
                onValidation={(isValid) => handleValidation('password', isValid)}
                isPassword
                autoComplete="password"
              />

              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassword}>Lupa kata sandi?</Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.loginButtonContainer,
                { transform: [{ translateX: buttonAnimation }] }
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  (!isValid.email || !isValid.password) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading || !isValid.email || !isValid.password}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.registerLink}>Daftar disini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingTop: Dimensions.get('window').height * 0.1,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPassword: {
    color: '#2F4F4F',
    fontSize: 14,
  },
  loginButtonContainer: {
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2F4F4F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0C4C4',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  registerText: {
    color: '#000000',
    fontSize: 14,
  },
  registerLink: {
    color: '#2F4F4F',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Login;