import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text
} from 'react-native';
import Button from '@/component/Button';
import RadioGroup from '@/component/RadioGroup';
import theme from '@/app/theme';
import Tooltip from '@/component/Tooltip';

interface EnvironmentConditionProps {
  data: any;
  onNext: (data: any) => void;
  onBack: (data: any) => void;
}

interface EnvironmentConditionData {
  land_condition: string;
  soil_condition: string;
  flood: boolean;
  wind_direction: string;
}

const EnvironmentCondition: React.FC<EnvironmentConditionProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState<EnvironmentConditionData>({
    land_condition: data?.land_condition || 'Rata',
    soil_condition: data?.soil_condition || 'Lahan berbatu',
    flood: data?.flood || false,
    wind_direction: data?.wind_direction || 'Utara',
  });

  const handleLandConditionChange = (landConditionValue: string) => {
    setFormData(prev => ({
      ...prev,
      land_condition: landConditionValue,
    }));
  };

  const handleSoilConditionChange = (soilConditionValue: string) => {
    setFormData(prev => ({
      ...prev,
      soil_condition: soilConditionValue,
    }));
  };

  const handleFloodChange = (floodValue: boolean) => {
    setFormData(prev => ({
      ...prev,
      flood: floodValue,
    }));
  };

  const handleWindDirectionChange = (windDirectionValue: string) => {
    setFormData(prev => ({
      ...prev,
      wind_direction: windDirectionValue,
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
              Kondisi Lingkungan
            </Text>
            <Text style={[theme.typography.body2, styles.description]}>
              Kami membutuhkkan data kondisi lingkungan untuk menyesuaikan rekomendasi desain dan estimasi biaya dengan keadaan kondisi lingkungan pembangunan.
            </Text>
            <Text style={[theme.typography.caption, styles.disclaimer]}>
              Semua pertanyaan berikut harus dijawab.
            </Text>

            <View style={styles.inputContainer}>
              <RadioGroup
                label="Kondisi Lahan"
                options={[
                  {"label": "Rata", "value": "Rata"},
                  {"label": "Tidak rata (miring/berundak)", "value": "Tidak rata"}
                ]}
                value={formData.land_condition}
                onChange={handleLandConditionChange}
              />

              <View style={styles.labelContainer}>
                <RadioGroup
                  label="Kondisi Tanah"
                  options={[
                    {"label": "Lahan berbatu", "value": "Lahan berbatu"},
                    {"label": "Lahan berpasir", "value": "Lahan berpasir"},
                    {"label": "Lahan berawa atau rawan banjir", "value": "Lahan berawa atau rawan banjir"},
                    {"label": "Lahan berbukit", "value": "Lahan berbukit"}
                  ]}
                  value={formData.soil_condition}
                  onChange={handleSoilConditionChange}
                />
                <Tooltip
                  content="Pilih kondisi tanah yang paling mendominasi di lahan Anda. Ini akan mempengaruhi rekomendasi pondasi dan struktur bangunan. Sebagai informasi, kondisi tanah yang paling umum adalah lahan berbatu."
                  position="left"
                />
              </View>
              
              <RadioGroup
                label="Apakah daerah di sekitarmu rawan banjir?"
                options={[
                  {"label": "Ya", "value": true},
                  {"label": "Tidak", "value": false}
                ]}
                value={formData.flood}
                onChange={handleFloodChange}
              />

              <View style={styles.labelContainer}>
                <RadioGroup
                  label="Pintu masuk rumahmu akan menghadap ke arah mana?"
                  options={[
                    {"label": "Utara", "value": "Utara"},
                    {"label": "Timur", "value": "Timur"},
                    {"label": "Selatan", "value": "Selatan"},
                    {"label": "Barat", "value": "Barat"}
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
    color: theme.colors.customGreen[200],
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
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

export default EnvironmentCondition;