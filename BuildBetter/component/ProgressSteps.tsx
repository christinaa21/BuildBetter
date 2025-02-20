import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ProgressStepsProps {
  steps: any[];
  currentStep: number;
  activeColor?: string;
  inactiveColor?: string;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep, activeColor = theme.colors.customGreen[300], inactiveColor = theme.colors.customGray[50]}) => {
  return (
    <View style={styles.container}>
        {/* Step numbers */}
        <View style={styles.numbersContainer}>
          {steps.map((step, index) => (
            <Text
              key={index}
              style={[
                { color: index <= currentStep ? activeColor : inactiveColor },
                theme.typography.caption
              ]}>
              {index + 1}
            </Text>
          ))}
        </View>

      {/* Steps row */}
      <View style={styles.stepsContainer}>
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <MaterialIcons
              name={index <= currentStep ? 'check-circle' : 'circle'}
              color={index <= currentStep ? activeColor : inactiveColor}
              size={24}
            />

            {/* Connector line */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: index < currentStep ? activeColor : inactiveColor,
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    flex: 1,
    height: 8,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 2,
  },
});

export default ProgressSteps;