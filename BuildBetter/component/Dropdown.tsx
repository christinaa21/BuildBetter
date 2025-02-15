import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../app/theme';
import { typography } from '@/app/theme/typography';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface DropdownProps {
  label?: string;
  example?: string;
  value: string;
  items: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  example,
  value,
  items,
  onSelect,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const animateFocus = (focused: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnimation, {
        toValue: focused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
    animateFocus(!isOpen);
  };

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
    setIsFocused(false);
    setLocalError(undefined);
    animateFocus(false);
  };

  const getBorderColor = () => {
    if (localError) return 'red';
    return borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.customGray[50], theme.colors.customGreen[300]],
    });
  };

  const labelStyle = {
    transform: [
      {
        translateY: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  };

  const selectedItem = items.find(item => item.value === value);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Animated.Text 
          style={[
            styles.label,
            typography.body2,
            labelStyle,
            isFocused && !localError && styles.labelFocused,
            localError && styles.labelError,
          ]}
        >
          {label}
        </Animated.Text>
      </View>
      
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
        ]}
      >
        <TouchableOpacity
          style={styles.selector}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.selectorText,
            typography.body1,
            !value && styles.placeholder
          ]}>
            {selectedItem?.label || example || `Pilih ${label}`}
          </Text>
          <MaterialIcons
            name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color={theme.colors.customOlive[50]}
          />
        </TouchableOpacity>
      </Animated.View>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.item}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={[
                  styles.itemText,
                  typography.body1,
                  value === item.value && styles.selectedItem
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {localError && (
        <Text style={[styles.errorText, typography.caption]}>
          {localError}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingTop: 8,
    zIndex: 1,
  },
  labelContainer: {
    position: 'relative',
    height: 20,
    marginBottom: 4,
  },
  label: {
    position: 'absolute',
    left: 2,
    color: theme.colors.customOlive[50],
    backgroundColor: 'transparent',
  },
  labelFocused: {
    color: theme.colors.customGreen[300],
  },
  labelError: {
    color: 'red',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.customWhite[50],
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectorText: {
    flex: 1,
    color: theme.colors.customGreen[500],
  },
  placeholder: {
    color: theme.colors.customGray[100],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.customWhite[50],
    borderWidth: 1,
    borderColor: theme.colors.customGray[50],
    borderRadius: 16,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollView: {
    maxHeight: 200,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[50],
  },
  itemText: {
    color: theme.colors.customGreen[500],
  },
  selectedItem: {
    color: theme.colors.customGreen[300],
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
});

export default Dropdown;