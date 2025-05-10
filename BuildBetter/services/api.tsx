import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://54.153.132.144:8080/api/v1';

// Types for API responses
export interface LoginResponse {
  code: number;
  status: string;
  data?: {
    token: string;
    userId: string;
    email: string;
    role: string;
    username: string;
  };
  error?: string;
}

export interface RegisterResponse {
  code: number;
  status: string;
  message?: string;
  data?: any;
  error?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  phoneNumber: string;
  email: string;
  username: string;
  province: string;
  city: string;
  password: string;
}

// API client
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
  // Login only requires email and password
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      // We only send email and password in the request body
      const response = await apiClient.post<LoginResponse>('/login', {
        email: data.email,
        password: data.password
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as LoginResponse;
      }
      throw error;
    }
  },
  
  // Register new user
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>('/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log('API error response:', error.response.data);
        return error.response.data as RegisterResponse;
      }
      // Create a standardized error response for network or unexpected errors
      return {
        code: 500,
        status: 'ERROR',
        error: ['Network or server error. Please check your connection and try again.']
      };
    }
  },
  
  // Send OTP to email
  sendOtp: async (email: string): Promise<{code: number; status: string; message?: string; error?: string}> => {
    try {
      const response = await apiClient.post('/send-otp', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<{code: number; status: string; message?: string; error?: string}> => {
    try {
      const response = await apiClient.post('/verify-user', { email, otp });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
 
  // Store authentication data
  storeAuthData: async (data: LoginResponse['data']) => {
    if (!data || !data.token) return;
   
    await SecureStore.setItemAsync('userToken', data.token);
    await SecureStore.setItemAsync('userId', data.userId);
    await SecureStore.setItemAsync('userEmail', data.email);
    await SecureStore.setItemAsync('userRole', data.role);
    await SecureStore.setItemAsync('username', data.username);
  },
 
  // Clear authentication data
  clearAuthData: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('userRole');
    await SecureStore.deleteItemAsync('username');
  }
};

export default apiClient;