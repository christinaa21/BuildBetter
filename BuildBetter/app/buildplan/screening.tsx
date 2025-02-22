import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LocationDimension from './components/LocationDimension';
import EnvironmentCondition from './components/EnvironmentCondition';
import DesignPreference from './components/DesignPreference';
import ProgressSteps from '@/component/ProgressSteps';
import theme from '../theme';
import { useRouter } from 'expo-router';

interface FormData {
  location: {
    province: string;
    city: string;
    shape: string;
    area: string;
  };
  environment: {
    land_condition: string;
    soil_condition: string;
    flood: boolean;
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
  const step = ['Step 1', 'Step 2', 'Step 3']
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    location: {
      province: '',
      city: '',
      shape: '',
      area: '',
    },
    environment: {
      land_condition: '',
      soil_condition: '',
      flood: false,
      wind_direction: '',
    },
    design: {
      design_style: '',
      floor: 0,
      room: 0,
    }
  });

  const steps = [
    {
      title: 'Lokasi dan Dimensi Lahan',
      component: LocationDimension
    },
    {
      title: 'Kondisi Lingkungan',
      component: EnvironmentCondition
    },
    {
      title: 'Preferensi Desain Rumah',
      component: DesignPreference
    }
  ] as const;

  const submitFormData = async (data: FormData) => {
    console.log('Submitting form data:', data);
    // Add your API call or other submission logic here
    router.push('./result');
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

  const handleFormComplete = () => {
    // Handle the complete form data
    console.log('Complete form data:', formData);
    // Add your submission logic here
  };

  const getCurrentStepKey = (): keyof FormData => {
    return ['location', 'environment', 'design'][currentStep] as keyof FormData;
  };

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
  }
});

export default Screening;