// component/ChatInput.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../app/theme';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isConsultationEnded?: boolean;
  onBookingPress?: () => void;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Tulis pesanmu disini",
  isConsultationEnded = false,
  onBookingPress
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  if (isConsultationEnded) {
    return (
      <View style={styles.endedContainer}>
        <TouchableOpacity style={styles.bookingButton} onPress={onBookingPress}>
          <Text style={styles.bookingText}>
            Ingin melakukan konsultasi lagi? Klik di sini untuk booking
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MaterialIcons name="add" size={24} color={theme.colors.customGray[200]} />
        <TextInput
          style={[styles.textInput, disabled && styles.disabledInput]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.customGray[200]}
          multiline
          maxLength={500}
          editable={!disabled}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || disabled) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={(!message.trim() || disabled) ? theme.colors.customGray[200] : theme.colors.customWhite[50]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[50],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
    marginHorizontal: 12,
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  disabledInput: {
    color: theme.colors.customGray[200],
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.customGreen[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.customGray[100],
  },
  endedContainer: {
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[50],
  },
  bookingButton: {
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bookingText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[300],
    textAlign: 'center',
  },
});