import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@/app/theme';

interface RadioOption {
  label: string;
  value: any;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error
}) => {
  return (
    <View style={styles.container}>
      <Text style={[theme.typography.body2, styles.label]}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionWrapper}
            onPress={() => onChange(option.value)}
          >
            <View style={styles.radioWrapper}>
              <View style={[
                styles.radio,
                value === option.value && styles.radioSelected
              ]}>
                {value === option.value && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                theme.typography.body1,
                styles.radioLabel,
                value === option.value && styles.radioLabelSelected
              ]}>
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <Text style={[theme.typography.caption, styles.error]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    marginBottom: 8,
    maxWidth: 300,
  },
  label: {
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionWrapper: {
    marginBottom: 16,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.customGray[200],
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.customGreen[300],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.customGreen[300],
  },
  radioLabel: {
    color: theme.colors.customOlive[50],
  },
  radioLabelSelected: {
    color: theme.colors.customGreen[300],
  },
  error: {
    color: 'red',
    marginTop: 4,
  },
});

export default RadioGroup;