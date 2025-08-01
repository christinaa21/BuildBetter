import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@/app/theme';
import { Ionicons } from '@expo/vector-icons';

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
                theme.typography.subtitle2
              ]}>
              {index + 1}
            </Text>
          ))}
        </View>

      {/* Steps row */}
      <View style={styles.stepsContainer}>
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={index <= currentStep ? 'checkmark-circle' : 'ellipse'}
                color={index <= currentStep ? activeColor : inactiveColor}
                size={24}
              />
            </View>

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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginHorizontal: -3,
  },
  line: {
    flex: 1,
    height: 8,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 2,
    paddingHorizontal: 6,
  },
});

export default ProgressSteps;