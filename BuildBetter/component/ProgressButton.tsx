import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Circle, Svg, G } from 'react-native-svg';
import { theme } from '../app/theme';
import { useRouter } from 'expo-router';

interface ProgressButtonProps {
  count: number;
  icon: () => React.ReactNode;
  page: string;
}

const ProgressButton: React.FC<ProgressButtonProps> = ({ count, icon: IconComponent, page }) => {
  const percentage = Math.round((count / 100) * 100) || 0;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const router = useRouter();

  return (
    <View style={styles.container} onTouchEnd={() => router.push(page as any)}>
      <Svg width="60" height="60" viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r="40"
          fill={theme.colors.customGreen[400]}
          stroke={theme.colors.customWhite[50]}
          strokeWidth="8"
        />
        <G rotation={270} origin="50, 50">
            <Circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={theme.colors.customGreen[400]}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            />
            <Circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={theme.colors.customWhite[50]}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            />
        </G>
      </Svg>
      <View style={styles.iconContainer}>
        <IconComponent />
      </View>
    </View>
  );
};

export default ProgressButton;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});