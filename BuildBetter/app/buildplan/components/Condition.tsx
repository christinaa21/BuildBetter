import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  findNodeHandle
} from 'react-native';
import Button from '@/component/Button';
import RadioGroup from '@/component/RadioGroup';
import Textfield from '@/component/Textfield';
import theme from '@/app/theme';
import Tooltip from '@/component/Tooltip';

interface ConditionProps {
  data: any;
  onNext: (data: any) => void;
  onBack: (data: any) => void;
}

interface ConditionData {
  shape: string;
  area: string;
  wind_direction: string;
}

interface ValidationState {
  area: boolean;
}

const Condition: React.FC<ConditionProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<ConditionData>({
    shape: data?.shape || 'Persegi Panjang',
    area: data?.area || '',
    wind_direction: data?.wind_direction || 'Utara',
  });
  const [errors, setErrors] = useState<Partial<ConditionData>>({});
  const [isValid, setIsValid] = useState<ValidationState>({
    area: false,
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Reference to the scroll view
  const scrollViewRef = useRef<ScrollView>(null);
  // Reference to the area input field for scrolling to it
  const areaInputRef = useRef<View>(null);

  // Add keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to area input when keyboard shows
        scrollToAreaInput();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const scrollToAreaInput = () => {
    if (areaInputRef.current && scrollViewRef.current) {
      // Add a delay to ensure components are fully rendered
      setTimeout(() => {
        try {
          // First get the native node handle
          const node = findNodeHandle(areaInputRef.current);
          
          if (node && scrollViewRef.current) {
            // Measure the position of the area input relative to the scroll view
            areaInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
              // Scroll to the position with some padding
              scrollViewRef.current?.scrollTo({
                y: pageY - 100, // Adjust this value as needed for proper positioning
                animated: true
              });
            });
          }
        } catch (error) {
          console.log('Error measuring layout:', error);
        }
      }, 150);
    }
  };

  const handleShapeChange = (shapeValue: string) => {
    setFormData(prev => ({
      ...prev,
      shape: shapeValue,
    }));
  };

  const handleAreaChange = (areaValue: string) => {
    // Only allow numbers and a single decimal point
    const formattedValue = areaValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = (formattedValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = formattedValue.split('.');
      const newValue = parts[0] + '.' + parts.slice(1).join('');
      setFormData(prev => ({
        ...prev,
        area: newValue,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      area: formattedValue,
    }));
  };

  const handleWindDirectionChange = (windDirectionValue: string) => {
    setFormData(prev => ({
      ...prev,
      wind_direction: windDirectionValue,
    }));
  };

  const buttonAnimation = new Animated.Value(0);

  const validateArea = (area: string) => {
    if (!area) return 'Harap masukkan luas tanah';
    
    const areaValue = parseFloat(area);
    
    if (isNaN(areaValue)) return 'Luas tanah harus berupa angka';
    if (areaValue <= 0) return 'Luas tanah harus lebih besar dari 0';
    if (areaValue > 1000) return 'Luas tanah maksimal 1000 m²';
    
    return undefined;
  };

  const handleValidation = (field: keyof ValidationState, isFieldValid: boolean) => {
    setIsValid(prev => ({
      ...prev,
      [field]: isFieldValid,
    }));
  };

  const handleNext = async () => {
    Keyboard.dismiss();

    const areaError = validateArea(formData.area);

    setErrors({
      area: areaError,
    });

    if (areaError) {
      animateButton();
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      onNext(formData);
    } catch (error) {
      console.error('Data input failed', error);
    }
  };

  const handleBack = async () => {
    Keyboard.dismiss();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      onBack(formData);
    } catch (error) {
      console.error('Data input failed', error);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 32 }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <Text style={[theme.typography.title, styles.title]}>
              Kondisi Lahan
            </Text>
            <Text style={[theme.typography.body2, styles.description]}>
              Kami membutuhkkan data mengenai kondisi lahan untuk menyesuaikan rekomendasi desain dengan keadaan lahan yang Anda miliki.
            </Text>
            <Text style={[theme.typography.caption, styles.disclaimer]}>
              Semua pertanyaan berikut harus dijawab.
            </Text>

            <View style={styles.inputContainer}>
              <RadioGroup
                label="Bentuk Lahan"
                options={[
                  {"label": "Persegi Panjang", "value": "Persegi Panjang"},
                  {"label": "Persegi", "value": "Persegi"}
                ]}
                value={formData.shape}
                onChange={handleShapeChange}
              />

              <View 
                ref={areaInputRef} 
                collapsable={false} // Important for measuring native views
              >
                <Textfield
                  label="Luas Tanah (m²)"
                  example="60.5"
                  value={formData.area}
                  onChangeText={handleAreaChange}
                  error={errors.area}
                  validate={validateArea}
                  onValidation={(isValid) => handleValidation('area', isValid)}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.labelContainer}>
                <RadioGroup
                  label="Pintu masuk rumahmu akan menghadap ke arah mana?"
                  options={[
                    {"label": "Utara", "value": "north"},
                    {"label": "Timur", "value": "east"},
                    {"label": "Selatan", "value": "south"},
                    {"label": "Barat", "value": "west"}
                  ]}
                  value={formData.wind_direction}
                  onChange={handleWindDirectionChange}
                />
                <Tooltip
                  content={
                    <>
                      <Text style={[theme.typography.body2, styles.tooltipText]}>
                        Cara mengetahui arah mata angin:
                      </Text>
                      <Text style={[theme.typography.body2, styles.tooltipText]}>
                        1. Buka aplikasi kompas di HP Anda.
                      </Text>
                      <Text style={[theme.typography.body2, styles.tooltipText]}>
                        2. Letakkan HP di atas permukaan datar.
                      </Text>
                      <Text style={[theme.typography.body2, styles.tooltipText]}>
                        3. Berdiri ke arah yang akan menjadi arah hadap rumah/pintu masuk.
                      </Text>
                      <Text style={[theme.typography.body2, styles.tooltipText]}>
                        4. Baca arah yang ditunjukkan oleh jarum kompas. Itulah arah mata angin yang akan menjadi arah rumah Anda.
                      </Text>
                    </>}
                  position="left"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Sebelumnya"
                  variant="outline"
                  onPress={handleBack}
                  style={styles.button}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Selanjutnya"
                  variant="primary"
                  onPress={handleNext}
                  style={styles.button}
                />
              </View>
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
    backgroundColor: theme.colors.customWhite[50],
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Default padding to ensure button is always visible
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.colors.customGreen[300],
    paddingBottom: 8,
  },
  description: {
    color: theme.colors.customGray[200],
    lineHeight: 20,
    paddingBottom: 8,
  },
  disclaimer: {
    color: '#ED4337',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tooltipText: {
    color: theme.colors.customWhite[50],
    lineHeight: 20,
  },
});

export default Condition;