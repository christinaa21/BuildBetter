// component/ChatInput.tsx

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import theme from '../app/theme';

export interface MessageAsset {
  uri: string;
  type: 'image' | 'file';
  name: string;
  mimeType?: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, assets?: MessageAsset[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Tulis pesanmu disini",
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access camera roll is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const imageAssets: MessageAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
          // --- THIS IS THE FIX ---
          // Use asset.mimeType instead of asset.type to get the correct content type (e.g., 'image/jpeg')
          mimeType: asset.mimeType, 
        }));
        onSendMessage('', imageAssets);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert("Error", "Failed to select images. Please try again.");
    }
  };

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const fileAssets: MessageAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'file',
          name: asset.name,
          mimeType: asset.mimeType,
        }));
        onSendMessage('', fileAssets);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert("Error", "Failed to select files. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={pickFiles}
          disabled={disabled}
        >
          <Ionicons 
            name="attach-outline" 
            size={24} 
            color={disabled ? theme.colors.customGray[100] : theme.colors.customOlive[50]} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={pickImages}
          disabled={disabled}
        >
          <Ionicons 
            name="image-outline" 
            size={24} 
            color={disabled ? theme.colors.customGray[100] : theme.colors.customOlive[50]} 
          />
        </TouchableOpacity>
        
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
          <Ionicons 
            name="send" 
            size={16} 
            color={(!message.trim() || disabled) ? theme.colors.customGray[200] : theme.colors.customWhite[50]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.customWhite[50], paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.colors.customGray[50] },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F8F8F8', borderRadius: 24, paddingHorizontal: 8, paddingVertical: 8, minHeight: 48 },
  actionButton: { padding: 8 },
  textInput: { flex: 1, ...theme.typography.body2, color: theme.colors.customOlive[50], marginHorizontal: 4, maxHeight: 100, alignSelf: 'center', paddingTop: 0, paddingBottom: 0 },
  disabledInput: { color: theme.colors.customGray[100] },
  sendButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.customGreen[300], justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: theme.colors.customGray[50] },
});