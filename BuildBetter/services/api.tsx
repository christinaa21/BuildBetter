import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://build-better.site/api/v1';

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
    city: string;
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

// Plan-related interfaces
export interface Material {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  image: string;
}

export interface MaterialsByCategory {
  [category: string]: {
    [subCategory: string]: Material;
  };
}

export interface Suggestion {
  id: string;
  houseNumber: number | string;
  landArea: number;
  buildingArea: number;
  style: string;
  floor: number;
  rooms: number;
  buildingHeight: number;
  designer: string;
  defaultBudget: number;
  budgetMin: number[]; // budgetMin[0] for ekonomis, budgetMin[1] for original, and budgetMin[2] for premium
  budgetMax: number[]; // same like budgetMin but this one for the max
  floorplans: Array<string> | null; // array of floorplans url
  object: string | null; // 3D house design, in url
  houseImageFront: string | null; // image url
  houseImageSide: string | null; // image url
  houseImageBack: string | null; // image url
  pdf?: string; // pdf url
  materials0: MaterialsByCategory; // ekonomis
  materials1: MaterialsByCategory; // original
  materials2: MaterialsByCategory; // premium
}

export interface UserInput {
  province: string;
  city: string;
  landform: string;
  landArea: number;
  entranceDirection: string;
  style: string;
  floor: number;
  rooms: number;
}

export interface SavePlanData {
  style: string;
  landArea: number;
  floor: number;
  entranceDirection: string;
  province: string;
  city: string;
  landform: string;
  rooms: number;
  suggestionId: string;
}

export interface SavePlanResponse {
  code: number;
  status: string;
  message?: string;
  error?: string | string[];
}

export interface Plan {
  id: string;
  userId: string;
  suggestionId: string;
  style: string;
  landArea: number;
  floor: number;
  entranceDirection: string;
  province: string;
  city: string;
  landform: string;
  rooms: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanWithSuggestion {
  userInput: UserInput;
  suggestions: Suggestion;
}

export interface GetPlansResponse {
  code: number;
  status: string;
  message?: string;
  data?: PlanWithSuggestion[];
  error?: string;
}

export interface GetPlanByIdResponse {
  code: number;
  status: string;
  message?: string;
  data?: PlanWithSuggestion;
  error?: string;
}

// User profile response type
export interface UserProfileResponse {
  code: number;
  status: string;
  data?: {
    id: string;
    phoneNumber: string;
    email: string;
    username: string;
    province: string;
    city: string;
    photo: null | string;
    role: string;
    createdAt: string;
  };
  error?: string;
}

export interface UpdateProfileData {
  phoneNumber: string;
  email: string;
  username: string;
  province: string;
  city: string;
  photo: string;
}

export interface UpdateProfileResponse {
  code: number;
  status: string;
  message?: string;
  error?: string | string[];
}

export interface ForgotPasswordResponse {
  code: number;
  status: string;
  message?: string;
  error?: string | string[];
}

export interface ResetPasswordResponse {
  code: number;
  status: string;
  message?: string;
  error?: string | string[];
}

export interface Architect {
  id: string;
  username: string;
  experience: number;
  city: string;
  rateOnline: number;
  rateOffline: number;
  portfolio?: string;
  photo?: string;
}

export interface GetArchitectsResponse {
  code: number;
  status: string;
  message?: string;
  data?: Architect[];
  error?: string;
}

export interface Consultation {
  id: string;
  userId: string;
  architectId: string;
  roomId: string | null;
  type: 'online' | 'offline';
  total: number;
  status: 'waiting-for-payment' | 'waiting-for-confirmation' | 'cancelled' | 'scheduled' | 'in-progress' | 'ended';
  reason: string | null;
  paymentAttempt: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface GetConsultationsResponse {
  code: number;
  status: string;
  message?: string;
  data?: Consultation[];
  error?: string;
}

export interface ArchitectSchedule {
  date: string;
  time: string[];
}

export interface GetArchitectSchedulesResponse {
  code: number;
  status: string;
  data?: ArchitectSchedule[];
  error?: string;
}

export interface CreateConsultationData {
  startDate: string;
  endDate: string;
  architectId: string;
  type: 'online' | 'offline';
  location?: string;
  total: number;
}

export interface CreateConsultationResponse {
  code: number;
  status: string;
  message?: string;
  data?: string; // This will be the consultation ID
  error?: string;
}

export interface GetConsultationByIdResponse {
  code: number;
  status: string;
  data?: {
    id: string;
    userId: string;
    userName: string;
    userCity: string;
    architectId: string;
    architectName: string;
    architectCity: string;
    roomId: string | null;
    type: 'online' | 'offline';
    total: number;
    status: 'waiting-for-payment' | 'scheduled' | 'in-progress' | 'ended' | 'cancelled' | 'waiting-for-confirmation';
    reason: string | null;
    location: string | null;
    locationDescription: string | null;
    startDate: string;
    endDate: string;
    createdAt: string;
  };
  error?: string;
}

export interface UploadPaymentResponse {
  code: number;
  status: string;
  message?: string;
  data?: string;
  error?: string;
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
    await SecureStore.setItemAsync('city', data.city);
  },
 
  // Clear authentication data
  clearAuthData: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('userRole');
    await SecureStore.deleteItemAsync('username');
    await SecureStore.deleteItemAsync('city');
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfileResponse> => {
    try {
      const response = await apiClient.get<UserProfileResponse>('/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as UserProfileResponse;
      }
      // Create a standardized error response for network or unexpected errors
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  updateProfile: async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
    try {
      const response = await apiClient.patch<UpdateProfileResponse>('/users', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as UpdateProfileResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },

  // Forgot Password function
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ForgotPasswordResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },

  // Reset Password function
  resetPassword: async (email: string, token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/reset-password', { 
        email, 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ResetPasswordResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // Generate Suggestions
  generateSuggestions: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/suggestions/generate', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  },
};

// Plans API
export const plansApi = {
  // Save a new plan
  savePlan: async (data: SavePlanData): Promise<SavePlanResponse> => {
    try {
      const response = await apiClient.post<SavePlanResponse>('/plans', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as SavePlanResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: ['Network or server error. Please check your connection and try again.']
      };
    }
  },

  // Get all plans for the current user
  getPlans: async (): Promise<GetPlansResponse> => {
    try {
      const response = await apiClient.get<GetPlansResponse>('/plans');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetPlansResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },

  // Get a specific plan by its ID
  getPlanById: async (planId: string): Promise<GetPlanByIdResponse> => {
    try {
      const response = await apiClient.get<GetPlanByIdResponse>(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetPlanByIdResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // Delete a plan by its ID
  deletePlan: async (planId: string): Promise<{code: number; status: string; message?: string; error?: string}> => {
    try {
      const response = await apiClient.delete(`/plans/${planId}`);
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
  }
};

export const buildconsultApi = {
  // Get all architects
  getArchitects: async (): Promise<GetArchitectsResponse> => {
    try {
      const response = await apiClient.get<GetArchitectsResponse>('/architects');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetArchitectsResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  // Get User's Consultation
  getConsultations: async (): Promise<GetConsultationsResponse> => {
    try {
      const response = await apiClient.get<GetConsultationsResponse>('/users/consultations');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetConsultationsResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // Get architect schedules
  getArchitectSchedules: async (architectId: string): Promise<GetArchitectSchedulesResponse> => {
    try {
      const response = await apiClient.get<GetArchitectSchedulesResponse>(`/architects/${architectId}/schedules`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetArchitectSchedulesResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  }, 
  
  // NEW: Create a new consultation booking
  createConsultation: async (data: CreateConsultationData): Promise<CreateConsultationResponse> => {
    try {
      const response = await apiClient.post<CreateConsultationResponse>('/consultations', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as CreateConsultationResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },

  // NEW: Get consultation by its ID
  getConsultationById: async (consultationId: string): Promise<GetConsultationByIdResponse> => {
    try {
      const response = await apiClient.get<GetConsultationByIdResponse>(`/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as GetConsultationByIdResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // NEW: Update an existing consultation (for rescheduling)
  updateConsultation: async (consultationId: string, data: { startDate: string, endDate: string }): Promise<any> => {
      try {
          // We assume a PATCH request is used for updates
          const response = await apiClient.patch(`/consultations/${consultationId}`, data);
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

  // NEW: Create a new consultation booking
  refreshConsultations: async (): Promise<CreateConsultationResponse> => {
    try {
      const response = await apiClient.post<CreateConsultationResponse>('/consultations/refresh');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as CreateConsultationResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // NEW: Create a new consultation booking
  cancelConsultation: async (consultationId: string): Promise<CreateConsultationResponse> => {
    try {
      const response = await apiClient.post<CreateConsultationResponse>(`/consultations/${consultationId}/cancel`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as CreateConsultationResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
};

// NEW API object for payments
export const paymentsApi = {
  uploadPaymentProof: async (consultationId: string, data: FormData): Promise<UploadPaymentResponse> => {
    try {
      const response = await apiClient.post<UploadPaymentResponse>(`/payments/${consultationId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as UploadPaymentResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // NEW: Create a new consultation booking
  markExpired: async (consultationId: string): Promise<UploadPaymentResponse> => {
    try {
      const response = await apiClient.post<UploadPaymentResponse>(`/payments/${consultationId}/expired`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as UploadPaymentResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
  
  // NEW: Create a new consultation booking
  repay: async (consultationId: string): Promise<UploadPaymentResponse> => {
    try {
      const response = await apiClient.post<UploadPaymentResponse>(`/payments/${consultationId}/repay`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as UploadPaymentResponse;
      }
      return {
        code: 500,
        status: 'ERROR',
        error: 'Network or server error. Please check your connection and try again.'
      };
    }
  },
};

export default apiClient;