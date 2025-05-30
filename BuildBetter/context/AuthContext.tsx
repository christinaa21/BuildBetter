// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, LoginResponse } from '../services/api';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

type User = {
  userId?: string;
  email?: string;
  username?: string;
  role?: string;
  city?: string;
} | null;

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  redirectUnverifiedUser: (email: string) => Promise<boolean>;
  setUser: (user: User) => void; // Add setUser function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>(null);
  const router = useRouter();

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const userId = await SecureStore.getItemAsync('userId') || undefined;
          const email = await SecureStore.getItemAsync('userEmail') || undefined;
          const role = await SecureStore.getItemAsync('userRole') || undefined;
          const username = await SecureStore.getItemAsync('username') || undefined;
          const city = await SecureStore.getItemAsync('city') || undefined;
         
          setUser({ userId, email, username, role, city });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    // Call API with just email and password
    const response = await authApi.login({ email, password });
   
    // Handle successful response - store the data from response
    if (response.code === 200 && response.data) {
      await authApi.storeAuthData(response.data);
     
      // Set user state with the data we received from API
      setUser({
        userId: response.data.userId,
        email: response.data.email,
        username: response.data.username,
        role: response.data.role,
        city: response.data.city
      });
      setIsAuthenticated(true);
    }
   
    return response;
  };

  const logout = async () => {
    await authApi.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  // New function to handle unverified users
  const redirectUnverifiedUser = async (email: string): Promise<boolean> => {
    try {
      // Store email for OTP verification
      await SecureStore.setItemAsync('userEmail', email);
      
      // Send OTP to the email
      const otpResponse = await authApi.sendOtp(email);
      
      if (otpResponse.code === 200) {
        Alert.alert(
          'Verifikasi Akun',
          'Kode verifikasi telah dikirim ke email Anda.',
          [{ text: 'OK', onPress: () => router.push('/otp') }]
        );
        return true;
      } else {
        Alert.alert(
          'Pengiriman OTP Gagal',
          otpResponse.error || 'Gagal mengirim kode verifikasi. Silakan coba lagi.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error handling unverified user:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat mengirim kode verifikasi. Silakan coba lagi nanti.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      login, 
      logout,
      redirectUnverifiedUser,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};