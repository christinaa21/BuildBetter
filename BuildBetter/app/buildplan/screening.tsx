import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Location from './components/Location';
import Condition from './components/Condition';
import DesignPreference from './components/DesignPreference';
import ProgressSteps from '@/component/ProgressSteps';
import theme from '../theme';
import { useRouter } from 'expo-router';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface FormData {
  location: {
    province: string;
    city: string;
  };
  condition: {
    shape: string;
    area: string;
    wind_direction: string;
  };
  design: {
    design_style: string;
    floor: number;
    room: number;
  };
}

const Screening = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const step = ['Step 1', 'Step 2', 'Step 3'];
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    location: {
      province: '',
      city: '',
    },
    condition: {
      shape: 'Persegi Panjang',
      area: '',
      wind_direction: 'north',
    },
    design: {
      design_style: '',
      floor: 0,
      room: 0,
    }
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const response = await authApi.getUserProfile();
          
          if (response.code === 200 && response.data) {
            // Update form data with user's location
            setFormData(prev => ({
              ...prev,
              location: {
                province: response.data?.province?.toLowerCase() ?? '',
                city: response.data?.city?.toLowerCase() ?? '',
              }
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const steps = [
    {
      title: 'Lokasi Pembangunan',
      component: Location
    },
    {
      title: 'Kondisi Lahan',
      component: Condition
    },
    {
      title: 'Preferensi Desain Rumah',
      component: DesignPreference
    }
  ] as const;

  const submitFormData = async (data: FormData) => {
    // Capitalize province and city
    const capitalizeWords = (str: string) => 
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    const apiData = {
      style: data.design.design_style,
      landArea: parseFloat(data.condition.area) || 0,
      floor: data.design.floor,
      entranceDirection: data.condition.wind_direction,
      province: capitalizeWords(data.location.province),
      city: capitalizeWords(data.location.city),
      landform: data.condition.shape,
      rooms: data.design.room
    };

    try {
      setIsLoading(true);
      const response = await authApi.generateSuggestions(apiData);
      
      if (response.code === 200) {
        router.push({
          pathname: './result',
          params: { 
            suggestions: JSON.stringify(response.data.suggestions),
            userInput: JSON.stringify(response.data.userInput)
          }
        });
      } else {
        alert('Failed to get suggestions');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = (stepData: any) => {
    if (currentStep < steps.length - 1) {
      setFormData(prev => ({
        ...prev,
        [getCurrentStepKey()]: stepData
      }));
      setCurrentStep(prev => prev + 1);
    } else {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          [getCurrentStepKey()]: stepData
        };
        console.log('Complete form data:', newFormData);
        submitFormData(newFormData);
        return newFormData;
      });
    }
  };

  const handleBack = (stepData: any) => {
    if (currentStep > 0) {
      setFormData(prev => ({
        ...prev,
        [getCurrentStepKey()]: stepData
      }));
      setCurrentStep(prev => prev - 1);
    }
  };

  const getCurrentStepKey = (): keyof FormData => {
    return ['location', 'condition', 'design'][currentStep] as keyof FormData;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
      </View>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <View style={styles.container}>
      <ProgressSteps
        steps={step}
        currentStep={currentStep}
      />
      
      <CurrentStepComponent
        data={formData[getCurrentStepKey()]}
        onNext={handleNext}
        onBack={handleBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Screening;