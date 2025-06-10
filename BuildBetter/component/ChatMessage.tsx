// component/ChatMessage.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import theme from '../app/theme';

interface ChatMessageProps {
  id: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
  senderName?: string;
  senderAvatar?: string;
  isFirstMessageFromSender?: boolean; // New prop to indicate if this is the first message in a sequence
}

export default function ChatMessage({ 
  message, 
  timestamp, 
  isFromUser, 
  senderName, 
  senderAvatar,
  isFirstMessageFromSender = false
}: ChatMessageProps) {
  const getAvatarSource = () => {
    if (senderAvatar) {
      return { uri: senderAvatar };
    }
    return require('@/assets/images/blank-profile.png');
  };

  return (
    <View style={[
      styles.container, 
      isFromUser ? styles.userMessage : styles.architectMessage,
      isFirstMessageFromSender && styles.firstMessageFromSender
    ]}>
      {!isFromUser && (
        <View style={styles.avatarContainer}>
          <Image 
            source={getAvatarSource()} 
            style={styles.avatar}
            defaultSource={require('@/assets/images/blank-profile.png')}
          />
        </View>
      )}
      
      <View style={[styles.bubble, isFromUser ? styles.userBubble : styles.architectBubble]}>
        <Text style={[styles.messageText, isFromUser ? styles.userText : styles.architectText]}>
          {message}
        </Text>
        <Text style={[styles.timestamp, isFromUser ? styles.userTimestamp : styles.architectTimestamp]}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  architectMessage: {
    justifyContent: 'flex-start',
  },
  firstMessageFromSender: {
    marginTop: 12, // Increased spacing when switching between architect and user
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  messageText: {
    ...theme.typography.body2,
    lineHeight: 20,
  },
  userText: {
    color: theme.colors.customWhite[50],
  },
  architectText: {
    color: theme.colors.customOlive[50],
  },
  timestamp: {
    ...theme.typography.caption,
    marginTop: 4,
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  architectTimestamp: {
    color: theme.colors.customGray[200],
  },
});