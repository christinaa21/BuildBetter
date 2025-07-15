import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  SafeAreaView,
  Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../app/theme';

interface ChatMessageProps {
  id: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
  senderName?: string;
  senderAvatar?: string;
  isFirstMessageFromSender?: boolean;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  fileName?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChatMessage({ 
  message, 
  timestamp, 
  isFromUser, 
  senderAvatar,
  isFirstMessageFromSender = false,
  type = 'TEXT',
  fileName,
}: ChatMessageProps) {
  
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  const getAvatarSource = () => {
    if (senderAvatar) {
      return { uri: senderAvatar };
    }
    return require('@/assets/images/blank-profile.png');
  };

  const isLocalUri = (uri: string) => {
    return !uri.startsWith('http');
  };

  const handleFilePress = () => {
    if (type === 'FILE' && !isLocalUri(message)) {
      Linking.openURL(message).catch(err => {
        console.error("Failed to open URL:", err);
        alert('Could not open the file link.');
      });
    }
  };

  // Render content based on type
  const renderMessageContent = () => {
    if (type === 'IMAGE') {
      const imageSource = { uri: message };
      
      if (imageError) {
        return (
          <View style={styles.imageErrorContainer}>
            <MaterialIcons name="broken-image" size={48} color={theme.colors.customGray[200]} />
            <Text style={styles.imageErrorText}>Failed to load image</Text>
          </View>
        );
      }

      return (
        <TouchableOpacity onPress={() => setShowFullImage(true)} style={styles.imageWrapper}>
          <Image 
            source={imageSource}
            style={styles.messageImage}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => { setImageLoading(false); setImageError(true); }}
            resizeMode="cover"
          />
          {(imageLoading || isLocalUri(message)) && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.customWhite[50]} />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (type === 'FILE') {
      const isUploading = isLocalUri(message);
      const fileColor = isFromUser ? theme.colors.customWhite[50] : theme.colors.customOlive[50];

      return (
        <TouchableOpacity
          style={styles.fileContainer}
          onPress={handleFilePress}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={fileColor} style={styles.fileIcon} />
          ) : (
            <MaterialIcons name="attach-file" size={32} color={fileColor} style={styles.fileIcon} />
          )}
          <View style={styles.fileInfo}>
            <Text style={[styles.fileNameText, { color: fileColor }]} numberOfLines={2}>
              {fileName || 'File Attachment'}
            </Text>
            <Text style={[styles.fileActionText, { color: fileColor, opacity: isUploading ? 1 : 0.8 }]}>
              {isUploading ? 'Uploading...' : 'Tap to open'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Default to rendering text
    return (
      <Text style={[styles.messageText, isFromUser ? styles.userText : styles.architectText]}>
        {message}
      </Text>
    );
  };

  const renderFullImageModal = () => {
    if (type !== 'IMAGE' || imageError) return null;

    return (
      <Modal 
        visible={showFullImage} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <SafeAreaView style={styles.fullImageModal}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowFullImage(false)}>
            <MaterialIcons name="close" size={30} color={theme.colors.customWhite[50]} />
          </TouchableOpacity>
          <Image source={{ uri: message }} style={styles.fullImage} resizeMode="contain" />
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <>
      <View style={[
        styles.container, 
        isFromUser ? styles.userMessage : styles.architectMessage,
        isFirstMessageFromSender && styles.firstMessageFromSender
      ]}>
        {!isFromUser && (
          <Image source={getAvatarSource()} style={styles.avatar}/>
        )}
        
        <View style={[
          styles.bubble, 
          isFromUser ? styles.userBubble : styles.architectBubble,
          type === 'IMAGE' && styles.imageBubble
        ]}>
          {renderMessageContent()}
          <Text style={[
            styles.timestamp, 
            isFromUser ? styles.userTimestamp : styles.architectTimestamp,
            type === 'IMAGE' && styles.imageTimestamp
          ]}>
            {timestamp}
          </Text>
        </View>
      </View>
      
      {renderFullImageModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userMessage: { justifyContent: 'flex-end' },
  architectMessage: { justifyContent: 'flex-start' },
  firstMessageFromSender: { marginTop: 12 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.customGreen[300],
    borderBottomRightRadius: 4,
  },
  architectBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  imageBubble: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  messageText: { ...theme.typography.body2, lineHeight: 20 },
  userText: { color: theme.colors.customWhite[50] },
  architectText: { color: theme.colors.customOlive[50] },
  imageWrapper: { position: 'relative' },
  messageImage: { width: 200, height: 150, borderRadius: 12 },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  imageErrorContainer: {
    width: 200,
    height: 150,
    backgroundColor: theme.colors.customGray[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  imageErrorText: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
    marginTop: 8,
  },
  timestamp: { ...theme.typography.caption, marginTop: 4, fontSize: 11 },
  userTimestamp: { color: 'rgba(255, 255, 255, 0.8)', textAlign: 'right' },
  architectTimestamp: { color: theme.colors.customGray[200] },
  imageTimestamp: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: theme.colors.customWhite[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fullImageModal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  fullImage: { width: screenWidth, height: screenHeight, resizeMode: 'contain' },
  // File Styles
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    ...theme.typography.body2,
    fontWeight: 'bold',
  },
  fileActionText: {
    ...theme.typography.caption,
    marginTop: 2,
  },
});