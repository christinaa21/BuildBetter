import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from './Button';
import { theme } from '@/app/theme';
import { ScrollView } from 'react-native-gesture-handler';

interface FilterOption {
  id: string | number;
  label: string;
  value: any;
}

type DropdownPosition = 'auto' | 'above' | 'below';

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValues: any[];
  onSelectionChange: (selectedItems: any[]) => void;
  allowMultiple?: boolean;
  placeholder?: string;
  label?: string;
  buttonWidth?: number;
  dropdownWidth?: number;
  icon?: React.ReactNode;
  maxHeight?: number;
  disabled?: boolean;
  position?: DropdownPosition;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  allowMultiple = false,
  placeholder = "Select option",
  label,
  buttonWidth,
  dropdownWidth,
  icon = <MaterialIcons name="filter-list" size={16} />,
  maxHeight = 300,
  disabled = false,
  position = 'auto' // Default to auto positioning
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');
  const buttonRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');
  
  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    
    if (allowMultiple) {
      if (selectedValues.length === 1) {
        const selected = options.find(opt => opt.value === selectedValues[0]);
        return selected ? selected.label : placeholder;
      }
      return `${selectedValues.length} selected`;
    } else {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected ? selected.label : placeholder;
    }
  };
  
  const toggleDropdown = () => {
    if (disabled) return;
    
    if (!isOpen) {
      buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
        
        // Determine if dropdown should appear above or below
        if (position === 'auto') {
          // Estimate dropdown height based on number of options (with max height constraint)
          const estimatedDropdownHeight = Math.min(
            options.length * 44 + (allowMultiple ? 120 : 0),
            maxHeight
          );
          
          // Check if there's enough space below
          const spaceBelow = height - (pageY + height);
          
          if (spaceBelow < estimatedDropdownHeight && pageY > estimatedDropdownHeight) {
            setDropdownPosition('above');
          } else {
            setDropdownPosition('below');
          }
        } else {
          setDropdownPosition(position);
        }
        
        setIsOpen(true);
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
      });
    }
  };
  
  useEffect(() => {
    if (isOpen && selectedValues.length > 0 && scrollViewRef.current) {
      // Find the index of the first selected option
      const selectedIndex = options.findIndex(opt => opt.value === selectedValues[0]);
      
      if (selectedIndex !== -1) {
        // Use setTimeout to ensure the ScrollView has rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * 44,
            animated: true
          });
        }, 100);
      }
    }
  }, [isOpen, selectedValues, options]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isOpen) {
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsOpen(false);
        });
      }
    };
    
    return () => {
    };
  }, [isOpen, dropdownAnimation]);

  const handleSelection = (value: any) => {
    if (allowMultiple) {
      const isSelected = selectedValues.includes(value);
      let newSelection;
      
      if (isSelected) {
        newSelection = selectedValues.filter(item => item !== value);
      } else {
        newSelection = [...selectedValues, value];
      }
      
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      toggleDropdown();
    }
  };

  // Animation values based on position
  const dropdownTranslateY = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: dropdownPosition === 'above' ? [10, 0] : [-10, 0],
  });

  const dropdownOpacity = dropdownAnimation;
  const calculatedDropdownWidth = dropdownWidth || Math.min(width * 0.4, 250);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.labelText}>{label}</Text>}
      
      <View ref={buttonRef} collapsable={false}>
        <Button
          title={getDisplayText()}
          variant="outline"
          icon={icon}
          iconPosition="left"
          onPress={toggleDropdown}
          minWidth={buttonWidth}
          minHeight={10}
          disabled={disabled}
          paddingVertical={8}
          paddingHorizontal={16}
        />
      </View>
      
      {isOpen && (
        <TouchableWithoutFeedback>
          <View style={styles.dropdownWrapper}>
            <Animated.View 
              style={[
                styles.dropdownContainer,
                {
                  opacity: dropdownOpacity,
                  transform: [{ translateY: dropdownTranslateY }],
                  width: calculatedDropdownWidth || buttonLayout.width,
                  maxHeight: maxHeight,
                  // Position dropdown based on determined position
                  ...(dropdownPosition === 'above' 
                    ? { bottom: buttonLayout.height - 36 } 
                    : { top: buttonLayout.height + 8 }),
                  left: 0
                }
              ]}
            >
              {allowMultiple && (
                <View style={styles.actionButtons}>
                  <Pressable 
                    style={styles.actionButton} 
                    onPress={() => onSelectionChange([])}
                  >
                    <Text style={styles.actionButtonText}>Clear All</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton} 
                    onPress={() => onSelectionChange(options.map(opt => opt.value))}
                  >
                    <Text style={styles.actionButtonText}>Select All</Text>
                  </Pressable>
                </View>
              )}
              
              <ScrollView
                ref={scrollViewRef}
                style={{maxHeight: maxHeight}}>
                {options.map((item) => {
                  const isSelected = selectedValues.includes(item.value);
                  return (
                    <Pressable
                      key={item.id.toString()}
                      style={({ pressed, hovered }) => [
                        styles.optionItem,
                        isSelected && styles.selectedOptionItem,
                        (pressed || hovered) && styles.optionItemHover
                      ]}
                      onPress={() => handleSelection(item.value)}
                    >
                      <Text 
                        style={[
                          styles.optionItemText,
                          isSelected && styles.selectedOptionItemText
                        ]}
                      >
                        {item.label}
                      </Text>
                      
                      {isSelected && (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color={theme.colors.customGreen[500]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              
              {allowMultiple && (
                <View style={styles.applyButtonContainer}>
                  <Button
                    title="Apply"
                    variant="primary"
                    onPress={toggleDropdown}
                    minHeight={40}
                    paddingVertical={8}
                  />
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
      
      {/* Invisible touchable area to close dropdown when clicking outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleDropdown}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  labelText: {
    ...theme.typography.body2,
    color: theme.colors.customGray[200],
    marginBottom: 4,
  },
  dropdownWrapper: {
    position: 'absolute',
    zIndex: 1000,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[100],
    zIndex: 1000,
    overflow: 'hidden'
  },
  flatList: {
    borderRadius: 16,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionItemHover: {
    backgroundColor: '#8CA8A1',
  },
  selectedOptionItem: {
    backgroundColor: theme.colors.customGreen[50],
  },
  optionItemText: {
    ...theme.typography.body1,
    color: theme.colors.customGreen[200],
  },
  selectedOptionItemText: {
    ...theme.typography.body1,
    color: theme.colors.customGreen[500],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[100],
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[400],
  },
  applyButtonContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[100],
    alignItems: 'center',
  }
});

export default FilterDropdown;