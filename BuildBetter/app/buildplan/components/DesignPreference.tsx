import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Image
} from 'react-native';
import Button from '@/component/Button';
import Dropdown from '@/component/Dropdown';
import RadioGroup from '@/component/RadioGroup';
import theme from '@/app/theme';

interface DesignPreferenceProps {
  data: any;
  onNext: (data: any) => void;
  onBack: (data: any) => void;
}

interface DesignPreferenceData {
  design_style: string;
  floor: number;
  room: number;
}

const DesignPreference: React.FC<DesignPreferenceProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<DesignPreferenceData>({
    design_style: data?.design_style || 'Modern',
    floor: data?.floor || 2,
    room: data?.room || 2,
  });

  const handleDesignStyleChange = (designStyleValue: string) => {
    setFormData(prev => ({
      ...prev,
      design_style: designStyleValue,
    }));
  };

  const handleFloorChange = (floorValue: number) => {
    setFormData(prev => ({
      ...prev,
      floor: floorValue,
    }));
  };

  const handleRoomChange = (roomValue: number) => {
    setFormData(prev => ({
      ...prev,
      room: roomValue,
    }));
  };

  const handleNext = async () => {
    Keyboard.dismiss();

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
            <Text style={[theme.typography.title, styles.title]}>
              Preferensi Desain Rumah
            </Text>
            <Text style={[theme.typography.body2, styles.description]}>
              Kami membutuhkkan data preferensi desain rumah untuk menyesuaikan rekomendasi desain dan estimasi biaya dengan keinginan dan kebutuhan Anda.
            </Text>
            <Text style={[theme.typography.caption, styles.disclaimer]}>
              Semua pertanyaan berikut harus dijawab.
            </Text>

            <View style={styles.inputContainer}>
              <Dropdown
                label="Gaya Rumah yang Diinginkan"
                placeholder="Pilih gaya rumah"
                searchPlaceholder='Cari gaya rumah...'
                options={[
                  {"label": "Modern", "value": "Modern", "additional":
                    <View style={styles.imageContainer}>
                      <Image source={require('@/assets/images/modern1.jpg')} style={styles.image}/>
                      <Image source={require('@/assets/images/modern2.jpg')} style={styles.image}/>
                    </View>
                    },
                  {"label": "Klasik", "value": "Klasik", "additional":
                    <View style={styles.imageContainer}>
                      <Image source={require('@/assets/images/klasik1.jpg')} style={styles.image}/>
                      <Image source={require('@/assets/images/klasik2.jpg')} style={styles.image}/>
                    </View>
                    },
                  {"label": "Industrialis", "value": "Industrialis", "additional":
                    <View style={styles.imageContainer}>
                      <Image source={require('@/assets/images/industrialis1.jpg')} style={styles.image}/>
                      <Image source={require('@/assets/images/industrialis2.jpg')} style={styles.image}/>
                    </View>
                    },
                  {"label": "Skandinavia", "value": "Skandinavia", "additional":
                    <View style={styles.imageContainer}>
                      <Image source={require('@/assets/images/skandinavia1.jpg')} style={styles.image}/>
                      <Image source={require('@/assets/images/skandinavia2.jpg')} style={styles.image}/>
                    </View>
                    },
                ]}
                maxHeight={0.75}
                value={formData.design_style}
                onChange={handleDesignStyleChange}
              />
            </View>

            <View style={styles.radioContainer}>
              <RadioGroup
                label="Jumlah Lantai yang Akan Dibangun"
                options={[
                  {"label": "1", "value": 1},
                  {"label": "2", "value": 2},
                  {"label": "3", "value": 3},
                  {"label": "4", "value": 4},
                ]}
                value={formData.floor}
                onChange={handleFloorChange}
              />

              <RadioGroup
                label="Jumlah Kamar yang Akan Dibuat"
                options={[
                  {"label": "1", "value": 1},
                  {"label": "2", "value": 2},
                  {"label": "3", "value": 3},
                  {"label": "4", "value": 4},
                  {"label": "5", "value": 5},
                ]}
                value={formData.room}
                onChange={handleRoomChange}
              />
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
                  title="Selesai"
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
  radioContainer: {
    marginBottom: 24,
  },
  imageContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 4,
  },
  image: {
    width: '48%',
    height: 140,
    alignSelf: 'center',
    objectFit: 'cover'
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
  }
});

export default DesignPreference;