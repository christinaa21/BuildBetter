// components/MultiSelectDrawer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@/app/theme';
import Button from './Button';
import Textfield from './Textfield';

interface MultiSelectDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValues: string[];
  onApply: (newSelectedValues: string[]) => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  // Two-step filter props
  twoStepFilter?: boolean;
  twoStepData?: {
    provinces: Array<{
      label: string;
      cities: Array<{ label: string }>;
    }>;
  };
}

export default function MultiSelectDrawer({
  isVisible,
  onClose,
  title,
  options,
  selectedValues,
  onApply,
  enableSearch = false,
  searchPlaceholder = "Cari...",
  twoStepFilter = false,
  twoStepData,
}: MultiSelectDrawerProps) {
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(selectedValues);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Two-step filter states
  const [currentStep, setCurrentStep] = useState<'province' | 'city'>('province');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      setTempSelectedValues(selectedValues);
      setSearchQuery('');
      
      // Reset two-step filter states when modal opens
      if (twoStepFilter) {
        setCurrentStep('province');
        setSelectedProvince(null);
        setAvailableCities([]);
        setSelectedProvinces([]);
      }
    }
  }, [selectedValues, isVisible, twoStepFilter]);

  // Get provinces for two-step filter
  const provinces = useMemo(() => {
    if (!twoStepFilter || !twoStepData) return [];
    return twoStepData.provinces.map(province => province.label);
  }, [twoStepFilter, twoStepData]);

  // Get current options based on step and filter
  const currentOptions = useMemo(() => {
    if (twoStepFilter) {
      if (currentStep === 'province') {
        return provinces;
      } else {
        return availableCities;
      }
    }
    return options;
  }, [twoStepFilter, currentStep, provinces, availableCities, options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!enableSearch || searchQuery.trim() === '') {
      return currentOptions;
    }
    return currentOptions.filter(option => 
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentOptions, searchQuery, enableSearch]);

  // Get current selected values based on step
  const currentSelectedValues = useMemo(() => {
    if (twoStepFilter) {
      if (currentStep === 'province') {
        return selectedProvinces;
      } else {
        return tempSelectedValues;
      }
    }
    return tempSelectedValues;
  }, [twoStepFilter, currentStep, selectedProvinces, tempSelectedValues]);

  const handleToggleOption = (option: string) => {
    if (twoStepFilter) {
      if (currentStep === 'province') {
        // Handle province selection (multi-select for selecting all cities in provinces)
        setSelectedProvinces(prev => {
          const newSelection = prev.includes(option) 
            ? prev.filter(item => item !== option) 
            : [...prev, option];
          
          // Update selected cities based on province selection
          updateCitiesFromProvinces(newSelection);
          return newSelection;
        });
      } else {
        // Handle city selection (multi-select)
        setTempSelectedValues(prev =>
          prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
      }
    } else {
      // Original behavior for non-two-step filter
      setTempSelectedValues(prev =>
        prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
      );
    }
  };

  // Helper function to update cities based on selected provinces
  const updateCitiesFromProvinces = (provinces: string[]) => {
    if (!twoStepData) return;
    
    const allCitiesFromSelectedProvinces: string[] = [];
    provinces.forEach(provinceName => {
      const provinceData = twoStepData.provinces.find(p => p.label === provinceName);
      if (provinceData) {
        const cities = provinceData.cities.map(city => city.label);
        allCitiesFromSelectedProvinces.push(...cities);
      }
    });
    
    setTempSelectedValues(allCitiesFromSelectedProvinces);
  };

  // Handle province navigation (when user wants to drill down to specific cities)
  const handleProvinceNavigation = (provinceName: string) => {
    setSelectedProvince(provinceName);
    
    // Find cities for selected province
    const provinceData = twoStepData?.provinces.find(p => p.label === provinceName);
    if (provinceData) {
      const cities = provinceData.cities.map(city => city.label);
      setAvailableCities(cities);
      setCurrentStep('city');
      setSearchQuery(''); // Reset search when moving to cities
    }
  };

  const handleClear = () => {
    if (twoStepFilter) {
      if (currentStep === 'province') {
        setSelectedProvinces([]);
        setTempSelectedValues([]);
      } else {
        setTempSelectedValues([]);
      }
    } else {
      setTempSelectedValues([]);
    }
  };

  const handleBack = () => {
    if (twoStepFilter && currentStep === 'city') {
      setCurrentStep('province');
      setSelectedProvince(null);
      setAvailableCities([]);
      setSearchQuery('');
    }
  };

  const handleApply = () => {
    onApply(tempSelectedValues);
    onClose();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = currentSelectedValues.includes(item);
    const isProvinceStep = twoStepFilter && currentStep === 'province';
    
    return (
      <TouchableOpacity style={styles.optionItem} onPress={() => handleToggleOption(item)}>
        <View style={styles.optionContent}>
          <View style={[styles.checkboxBase, isSelected && styles.checkboxChecked]}>
            {isSelected && <Text style={styles.checkboxCheckmark}>✓</Text>}
          </View>
          <Text style={styles.optionText}>{item}</Text>
          {isProvinceStep && (
            <TouchableOpacity 
              style={styles.navigateButton}
              onPress={(e) => {
                e.stopPropagation();
                handleProvinceNavigation(item);
              }}
            >
              <MaterialIcons 
                name="keyboard-arrow-right" 
                size={24} 
                color={theme.colors.customGreen[300]} 
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="search-off" size={48} color={theme.colors.customGray[100]} />
      <Text style={styles.emptyText}>Tidak ada hasil yang sesuai dengan pencarian.</Text>
    </View>
  );

  // Get current title based on step
  const getCurrentTitle = () => {
    if (twoStepFilter) {
      if (currentStep === 'province') {
        return 'Pilih Provinsi';
      } else {
        return `Pilih Kota - ${selectedProvince}`;
      }
    }
    return title;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <SafeAreaView style={styles.safeAreaContainer} edges={['bottom']}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {twoStepFilter && currentStep === 'city' && (
                  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.customGreen[300]} />
                  </TouchableOpacity>
                )}
                <Text style={[styles.modalTitle, twoStepFilter && currentStep === 'city' && styles.modalTitleWithBack]}>
                  {getCurrentTitle()}
                </Text>
              </View>
              
              {/* Always show reset button for both steps */}
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {enableSearch && (
              <View style={styles.searchContainer}>
                <Textfield
                  icon={<MaterialIcons name="search" size={16} />}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  paddingVertical={10}
                  borderRadius={100}
                />
              </View>
            )}

            {/* Options List */}
            <View style={styles.listContainer}>
              <FlatList
                data={filteredOptions}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                style={styles.list}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={enableSearch ? renderEmptyList : null}
                keyboardShouldPersistTaps="handled"
              />
            </View>

            {/* Fixed Bottom Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Set filter"
                variant="primary"
                onPress={handleApply}
                minHeight={44}
                paddingVertical={10}
              />
            </View>   
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  safeAreaContainer: {
    backgroundColor: theme.colors.customWhite[50],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '64%',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 8,
  },
  modalTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
  },
  modalTitleWithBack: {
    marginLeft: 0,
    paddingRight: 48,
  },
  clearButtonText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[300],
  },
  searchContainer: {
    marginBottom: 4,
    marginTop: -8,
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    ...theme.typography.body1,
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: 48,
  },
  navigateButtonText: {
    ...theme.typography.caption,
    color: theme.colors.customGreen[300],
    marginRight: 2,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.customGreen[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.customGreen[300],
  },
  checkboxCheckmark: {
    color: theme.colors.customWhite[50],
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.customGray[50],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginTop: 12,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 5 : 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[50],
    backgroundColor: theme.colors.customWhite[50],
  },
  instructionContainer: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 5 : 20,
    paddingHorizontal: 4,
  },
  instructionText: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    lineHeight: 18,
  },
});