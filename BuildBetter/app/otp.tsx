import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  Pressable,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/component/Button';
import { theme } from './theme';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const OTP = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance to next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    
    try {
      setIsLoading(true);
      // Add your OTP resend logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      Alert.alert('Berhasil', 'Kode OTP telah dikirimkan kembali melalui SMS.');
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengirimkan ulang kode OTP. Mohon coba lagi nanti');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Mohon masukkan kode OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Add your OTP verification logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // If verification successful, navigate to next screen
      router.replace('/otp-success');
    } catch (error) {
      Alert.alert('Error', 'Kode OTP salah. Mohon masukkan kode OTP yang benar.');
      // Clear OTP fields on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, theme.typography.title]}>Verifikasi OTP</Text>
            <Text style={[styles.subtitle, theme.typography.body1]}>
              Masukkan kode OTP yang telah dikirim melalui SMS ke nomor telepon Anda.
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {Array(OTP_LENGTH).fill(0).map((_, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, theme.typography.subtitle1]}
                value={otp[index]}
                onChangeText={text => handleOtpChange(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={theme.colors.customGreen[50]}
                autoComplete="sms-otp"
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, theme.typography.body2]}>Tidak menerima kode? </Text>
            <Pressable
              onPress={handleResendOtp}
              disabled={cooldown > 0 || isLoading}
            >
              <Text
                style={[
                  styles.resendButton,
                  theme.typography.subtitle2,
                  (cooldown > 0 || isLoading) && styles.resendButtonDisabled
                ]}
              >
                {cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : 'Kirim ulang'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Loading...' : 'Verifikasi'}
              variant="primary"
              onPress={handleVerify}
              disabled={isLoading || otp.join('').length !== OTP_LENGTH}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: theme.colors.customGreen[300],
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    color: theme.colors.customOlive[100],
    borderColor: theme.colors.customGray[100],
    backgroundColor: theme.colors.customWhite[50],
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: theme.colors.customOlive[50],
  },
  resendButton: {
    color: theme.colors.customGreen[200],
  },
  resendButtonDisabled: {
    color: theme.colors.customGray[200],
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});

export default OTP;