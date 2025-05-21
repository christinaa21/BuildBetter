// components/CompactPicker.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '@/app/theme';
// You might want to add an icon library for the dropdown arrow, e.g., Feather from 'expo/vector-icons'
// import { Feather } from '@expo/vector-icons';

interface CompactPickerProps<T extends string> {
  label: string;
  options: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
}

function CompactPicker<T extends string>({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Pilih...",
}: CompactPickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option: T) => {
    onValueChange(option);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}:</Text>
      <Pressable onPress={() => setModalVisible(true)} style={styles.pickerButton}>
        <Text style={styles.selectedValueText}>{selectedValue || placeholder}</Text>
        {/* <Feather name="chevron-down" size={18} color={theme.colors.customGray[200]} /> */}
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <SafeAreaView style={styles.modalContentContainer} edges={['bottom', 'left', 'right']}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih {label}</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.customOlive[100],
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.customWhite[50],
  },
  selectedValueText: {
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
  },
  arrow: {
    fontSize: 12,
    color: theme.colors.customGray[200],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
     backgroundColor: theme.colors.customWhite[50],
     borderTopLeftRadius: 16,
     borderTopRightRadius: 16,
     maxHeight: '50%', // Limit height
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 12,
  },
  optionText: {
    ...theme.typography.body1,
    color: theme.colors.customOlive[50],
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.customGray[50],
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.customGreen[300],
    borderRadius: 8,
  },
  closeButtonText: {
    ...theme.typography.body2, // Assuming you have a button style in typography
    color: theme.colors.customWhite[50],
    textAlign: 'center',
    fontFamily: theme.typography.subtitle2.fontFamily, // Use a specific font
    fontSize: theme.typography.subtitle2.fontSize
  },
});

export default CompactPicker;