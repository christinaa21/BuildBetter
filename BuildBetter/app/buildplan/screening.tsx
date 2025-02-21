import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LocationDimension from './components/LocationDimension';
import EnvironmentCondition from './components/EnvironmentCondition';
import DesignPreference from './components/DesignPreference';
import ProgressSteps from '@/component/ProgressSteps';
import theme from '../theme';

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
    flood: string;
    wind_direction: string;
  };
  design: {
    design_style: string;
    floor: string;
    room: string;
  };
}

const Screening = () => {
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
      flood: '',
      wind_direction: '',
    },
    design: {
      design_style: '',
      floor: '',
      room: '',
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

  const handleNext = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      [getCurrentStepKey()]: stepData
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Handle form completion
      handleFormComplete();
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