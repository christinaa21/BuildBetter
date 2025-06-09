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
}

export default function ChatMessage({ 
  message, 
  timestamp, 
  isFromUser, 
  senderName, 
  senderAvatar 
}: ChatMessageProps) {
  return (
    <View style={[styles.container, isFromUser ? styles.userMessage : styles.architectMessage]}>
      {!isFromUser && (
        <View style={styles.avatarContainer}>
          {senderAvatar ? (
            <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {senderName ? senderName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
          )}
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
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  architectMessage: {
    justifyContent: 'flex-start',
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
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.customGreen[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.caption,
    color: theme.colors.customWhite[50],
    fontWeight: '600',
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