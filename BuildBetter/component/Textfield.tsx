import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
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

interface TextfieldProps extends TextInputProps {
  label?: string;
  example?: string;
  error?: string;
  isPassword?: boolean;
  icon?: React.ReactNode;
  validate?: (text: string) => string | undefined;
  onValidation?: (isValid: boolean) => void;
  height?: number;
  paddingVertical?: number;
  borderRadius?: number;
  disabled?: boolean;
}

const Textfield: React.FC<TextfieldProps> = ({
  label,
  example,
  error,
  isPassword,
  icon,
  validate,
  onValidation,
  onChangeText,
  height,
  paddingVertical,
  borderRadius = 16,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [value, setValue] = useState(props.value || '');
  const [shouldValidate, setShouldValidate] = useState(false);
  
  const borderColorAnim = React.useRef(new Animated.Value(0)).current;
  const labelAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  const validateInput = useCallback(() => {
    if (validate && shouldValidate && !disabled) {
      const validationError = validate(value);
      setLocalError(validationError);
      onValidation?.(!validationError);
    }
  }, [value, validate, shouldValidate, onValidation, disabled]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(validateInput, 100);
      return () => clearTimeout(timer);
    }
  }, [value, validateInput, disabled]);

  useEffect(() => {
    if (isFocused && localError && !disabled) {
      setLocalError(undefined);
    }
  }, [value, isFocused, disabled]);

  const animateFocus = (focused: boolean) => {
    if (disabled) return;
    
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

  const handleChangeText = (text: string) => {
    if (disabled) return;
    
    setValue(text);
    if (localError) {
      setLocalError(undefined);
    }
    onChangeText?.(text);
  };

  const handleFocus = () => {
    if (disabled) return;
    
    setIsFocused(true);
    setShouldValidate(false);
    animateFocus(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    
    setIsFocused(false);
    setShouldValidate(true);
    animateFocus(false);
    validateInput();
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.customGray[50] || '#E5E5E5';
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

  // Clone and modify icon with appropriate color if it exists
  const getIconColor = () => {
    if (disabled) return theme.colors.customGray[100] || '#999999';
    if (localError) return 'red';
    return theme.colors.customGreen[300];
  };

  const coloredIcon = icon && React.isValidElement(icon) 
    ? React.cloneElement(icon as React.ReactElement, {
        color: getIconColor(),
        size: 20,
      })
    : icon;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text 
            style={[
              styles.label,
              typography.body2,
              labelStyle,
              isFocused && !localError && !disabled && styles.labelFocused,
              localError && !disabled && styles.labelError,
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      )}
      
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor(), height: height, borderRadius: borderRadius },
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {coloredIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input, 
            typography.body1,
            {paddingVertical: paddingVertical},
            disabled && styles.inputDisabled,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          value={value}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={disabled ? theme.colors.customGray[100] : theme.colors.customGray[100]}
          placeholder={!isFocused ? example : ''}
          editable={!disabled}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => !disabled && setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={disabled}
          >
            {showPassword ? 
              <MaterialIcons 
                name="visibility" 
                size={20} 
                color={disabled ? theme.colors.customGray[100] : theme.colors.customOlive[50]} 
              /> :
              <MaterialIcons 
                name="visibility-off" 
                size={20} 
                color={disabled ? theme.colors.customGray[100] : theme.colors.customOlive[50]} 
              />
            }
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {localError && !disabled && (
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
  labelDisabled: {
    color: theme.colors.customGray[200] || '#999999',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.customWhite[50],
    shadowColor: theme.colors.customGreen[300],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  inputContainerDisabled: {
    backgroundColor: '#F5F5F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 16,
    color: theme.colors.customGreen[500],
  },
  inputDisabled: {
    color: theme.colors.customGray[100] || '#999999',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
  eyeIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Textfield;