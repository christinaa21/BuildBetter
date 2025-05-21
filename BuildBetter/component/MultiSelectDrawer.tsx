// components/MultiSelectDrawer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '@/app/theme'; // Assuming theme.ts is in the parent directory of components
import Button from './Button';

interface MultiSelectDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  options: string[]; // Array of simple string options
  selectedValues: string[];
  onApply: (newSelectedValues: string[]) => void;
}

export default function MultiSelectDrawer({
  isVisible,
  onClose,
  title,
  options,
  selectedValues,
  onApply,
}: MultiSelectDrawerProps) {
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>(selectedValues);

  useEffect(() => {
    // Sync with external changes if the modal is re-opened
    if (isVisible) {
      setTempSelectedValues(selectedValues);
    }
  }, [selectedValues, isVisible]);

  const handleToggleOption = (option: string) => {
    setTempSelectedValues(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleClear = () => {
    setTempSelectedValues([]);
  };

  const handleApply = () => {
    onApply(tempSelectedValues);
    onClose();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.optionItem} onPress={() => handleToggleOption(item)}>
      <Text style={styles.optionText}>{item}</Text>
      <View style={[styles.checkboxBase, tempSelectedValues.includes(item) && styles.checkboxChecked]}>
        {tempSelectedValues.includes(item) && <Text style={styles.checkboxCheckmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

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
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.list}
            />
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
     backgroundColor: theme.colors.customWhite[50], // Or your modal background color
     borderTopLeftRadius: 16,
     borderTopRightRadius: 16,
     maxHeight: '60%', // Adjust as needed
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20, // Handle SafeAreaView padding for bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
  },
  clearButtonText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[300], // Or your accent color for clear
  },
  list: {
    // Max height can be managed by safeAreaContainer's maxHeight or here
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    ...theme.typography.body1,
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.customGreen[300], // Checkbox border color
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.customGreen[300], // Checkbox checked color
  },
  checkboxCheckmark: {
    color: theme.colors.customWhite[50],
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.customGray[50],
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: theme.colors.customGreen[300], // Your primary action color
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    ...theme.typography.subtitle2,
    color: theme.colors.customWhite[50],
  },
  buttonContainer: {
    paddingTop: 48,
    paddingBottom: Platform.OS === 'ios' ? 5 : 20, // Adjust for notch if SafeAreaView not enough
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[50],
  },
});