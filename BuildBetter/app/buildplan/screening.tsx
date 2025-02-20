import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';
import ProgressSteps from '@/component/ProgressSteps';

export default function Screening() {
  const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
  const currentStep = 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressSteps
          steps={steps} 
          currentStep={currentStep}
        />
        <Text style={styles.text}>Saved</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  content: {
    flex: 1,
    padding: 24,
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: theme.colors.customOlive[50],
  },
});