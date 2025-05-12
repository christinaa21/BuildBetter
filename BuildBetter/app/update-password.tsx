import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Textfield from '@/component/Textfield';
import Button from '@/component/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from './theme';
import { MaterialIcons } from '@expo/vector-icons';
import { authApi } from '@/services/api';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();
  
  // Get token and email from URL params
  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();

  // Check if token and email are present when component mounts
  useEffect(() => {
    if (!token || !email) {
      Alert.alert(
        'Error',
        'Invalid password reset link. Please request a new password reset link.',
        [{ text: 'OK', onPress: () => router.replace('/forgot-password') }]
      );
    }
  }, [token, email, router]);

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

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();

    const passwordError = validatePassword(password);
    setError(passwordError);

    if (passwordError) {
      return;
    }

    // Validate token and email again before API call
    if (!token || !email) {
      Alert.alert(
        'Error',
        'Invalid password reset link. Please request a new password reset link.',
        [{ text: 'OK', onPress: () => router.replace('/forgot-password') }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to reset password
      const response = await authApi.resetPassword(email, token, password);
      
      if (response.code === 200) {
        setPasswordChanged(true);
      } else {
        // Format and show error messages from API
        const errorMessage = Array.isArray(response.error) 
          ? response.error.join('\n') 
          : response.error || 'Gagal mereset kata sandi. Silakan coba lagi.';
          
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        'Error',
        'Gagal mereset kata sandi. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login');
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
            {!passwordChanged ? (
              <>
                <View style={styles.headerContainer}>
                  <MaterialIcons name="lock-reset" size={120} color={theme.colors.customGreen[300]} />
                  <Text style={[styles.header, theme.typography.title]}>Reset Kata Sandi</Text>
                  <Text style={[styles.subheader, theme.typography.body1]}>
                    Mohon buat kata sandi yang baru untuk akun Anda.
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  <Textfield
                    label="Password"
                    example="Password123!"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError(undefined);
                    }}
                    error={error}
                    validate={validatePassword}
                    isPassword
                    autoComplete="password"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title={isLoading ? 'Loading...' : 'Reset Kata Sandi'}
                    variant="primary"
                    onPress={handleUpdatePassword}
                    disabled={isLoading}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.successContainer}>
                    <MaterialIcons name="check-circle" size={120} color={theme.colors.customGreen[300]} />
                    <Text style={[styles.successHeader, theme.typography.title]}>Kata Sandi Berhasil Direset!</Text>
                    <Text style={[styles.successMessage, theme.typography.body1]}>
                        Kata sandi akun Anda telah berhasil direset. Yuk login menggunakan kata sandi yang baru!
                    </Text>
                </View>
                <View style={styles.buttonContainer}>
                <Button
                    title="Kembali ke Login"
                    variant="primary"
                    onPress={handleBackToLogin}
                />
                </View>
              </>
            )}
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
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  header: {
    color: theme.colors.customGreen[300],
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  subheader: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successHeader: {
    color: theme.colors.customGreen[300],
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default UpdatePassword;