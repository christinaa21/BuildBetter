// app/buildconsult/chat/[roomId].tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@/app/theme';
import ChatMessage from '@/component/ChatMessage';
import ChatInput from '@/component/ChatInput';
import WaitingMessage from '@/component/WaitingMessage';
import LocationCard from '@/component/LocationCard';
import DevTools, { DevToolsState } from '@/component/DevTools';
import { useAuth } from '@/context/AuthContext';

// Mock data interfaces (replace with actual API types)
interface Message {
  id: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
  senderName: string;
  senderAvatar?: string;
}

interface ConsultationDetails {
  id: string;
  type: 'online' | 'offline';
  status: 'waiting-for-confirmation' | 'scheduled' | 'in-progress' | 'ended';
  architectName: string;
  architectAvatar?: string;
  startDate: string;
  endDate: string;
  location?: string;
  roomId: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const flatListRef = useRef<FlatList>(null);

  // Dev Tools State
  const [devState, setDevState] = useState<DevToolsState>({
    consultationType: 'online',
    chatStatus: 'waiting',
    showLocationCard: false,
    hasMessages: false,
    architectName: 'Erensa Ratu Chelsia',
    consultationDate: '31 Mei 2025',
    consultationTime: '17:00 - 18:00',
    location: 'Jalan Cendrawasih, Raharja, Jawa Barat',
  });

  useEffect(() => {
    fetchConsultationDetails();
    // TODO: Initialize WebSocket connection here
    // initializeWebSocket();
  }, [roomId]);

  useEffect(() => {
    if (consultation) {
      determineChatStatus();
    }
  }, [consultation]);

  // Dev Tools Effect - Override states in development
  useEffect(() => {
    if (__DEV__) {
      setChatStatus(devState.chatStatus);
      
      // Create mock consultation based on dev state
      const mockConsultation: ConsultationDetails = {
        id: '1',
        type: devState.consultationType,
        status: devState.chatStatus === 'waiting' ? 'scheduled' : 
                devState.chatStatus === 'active' ? 'in-progress' : 'ended',
        architectName: devState.architectName,
        startDate: devState.consultationDate,
        endDate: devState.consultationTime,
        location: devState.location,
        roomId: roomId as string,
      };
      
      setConsultation(mockConsultation);
      setLoading(false);

      // Generate mock messages if needed
      if (devState.hasMessages) {
        generateMockMessages();
      } else {
        setMessages([]);
      }
    }
  }, [devState]);

  const generateMockMessages = () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        message: 'Hai Kak! Okay saya sebentar lagi juga otw ke lokasi yaa',
        timestamp: '16.02',
        isFromUser: true,
        senderName: 'You',
      },
      {
        id: '2',
        message: 'Oke, Siap Bu.',
        timestamp: '16.02',
        isFromUser: false,
        senderName: 'Erensa Ratu',
      },
      {
        id: '3',
        message: 'Hi Bu Erensa! Saya sedang otw ke lokasi yaa',
        timestamp: '16.02',
        isFromUser: false,
        senderName: 'Erensa Ratu',
      },
      {
        id: '4',
        message: 'Hi Bu Erensa! Saya ingin melaksanakan proyek pembangunan untuk rumah saya. Bolehkah kita menjadwalkan untuk bertemu untuk berdiskusi terkait pembangunan ini?',
        timestamp: '14.02',
        isFromUser: false,
        senderName: 'Erensa Ratu',
      },
      {
        id: '5',
        message: 'Hai Kak! Tentu saja bisa, dalam jangka waktu kapan kak saya bersedia untuk bertemu di hari kamis jam 11 pagi. Apakah bersedia?',
        timestamp: '14.02',
        isFromUser: true,
        senderName: 'You',
      },
      {
        id: '6',
        message: 'Hai Kak! Tentu saja bisa, dalam jangka waktu kapan kak saya bersedia untuk bertemu di hari kamis jam 11 pagi. Apakah bersedia?',
        timestamp: '14.02',
        isFromUser: true,
        senderName: 'You',
      },
    ];
    setMessages(mockMessages);
  };

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await buildconsultApi.getConsultationByRoomId(roomId);
      
      // Mock data for demonstration
      const mockConsultation: ConsultationDetails = {
        id: '1',
        type: 'offline', // Change to 'online' to test different scenarios
        status: 'scheduled',
        architectName: 'Erensa Ratu',
        startDate: '31 Mei 2025',
        endDate: '17:00 - 18:00',
        location: 'Jalan Cendrawasih, Raharja, Jawa Barat',
        roomId: roomId as string,
      };
      
      setConsultation(mockConsultation);
      
      // If it's an offline consultation and chat is active, send location card automatically
      if (mockConsultation.type === 'offline' && shouldShowChat()) {
        sendLocationCard();
      }
      
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      Alert.alert('Error', 'Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

  const determineChatStatus = () => {
    if (!consultation) return;

    const now = new Date();
    const consultationStart = new Date(consultation.startDate + ' ' + consultation.endDate.split(' - ')[0]);
    const consultationEnd = new Date(consultation.startDate + ' ' + consultation.endDate.split(' - ')[1]);

    if (consultation.status === 'ended') {
      setChatStatus('ended');
      return;
    }

    if (consultation.type === 'online') {
      // For online consultations, chat is active during the scheduled time
      if (now >= consultationStart && now <= consultationEnd) {
        setChatStatus('active');
      } else if (now > consultationEnd) {
        setChatStatus('ended');
      } else {
        setChatStatus('waiting');
      }
    } else {
      // For offline consultations, chat is active 1 hour before the meeting
      const oneHourBefore = new Date(consultationStart.getTime() - 60 * 60 * 1000);
      
      if (now >= oneHourBefore && now < consultationEnd) {
        setChatStatus('active');
      } else if (now >= consultationEnd) {
        setChatStatus('ended');
      } else {
        setChatStatus('waiting');
      }
    }
  };

  const shouldShowChat = () => {
    if (__DEV__) {
      return devState.chatStatus === 'active';
    }
    return chatStatus === 'active';
  };

  const sendLocationCard = () => {
    if (!consultation || consultation.type !== 'offline') return;

    // Add location card as a system message
    const locationMessage: Message = {
      id: 'location-card',
      message: `📍 Lokasi konsultasi: ${consultation.location}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromUser: false,
      senderName: 'System',
    };

    setMessages(prev => [locationMessage, ...prev]);
  };

  const handleSendMessage = (message: string) => {
    if (!consultation || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isFromUser: true,
      senderName: user.username || 'You',
    };

    setMessages(prev => [newMessage, ...prev]);
    
    // TODO: Send message via WebSocket
    // webSocket.send(JSON.stringify(newMessage));
  };

  const handleBookingPress = () => {
    router.push('/buildconsult/booking');
  };

  const handleBack = () => {
    router.back();
  };

  const formatConsultationTime = () => {
    if (!consultation) return '';
    return `${consultation.startDate}, pukul ${consultation.endDate}`;
  };

  const handleDevStateChange = (newState: DevToolsState) => {
    setDevState(newState);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading consultation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text>Consultation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} />
        </TouchableOpacity>
        <View style={styles.architectInfo}>
          <View style={styles.architectAvatar}>
            <Text style={styles.avatarText}>
              {consultation.architectName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.architectName}>{consultation.architectName}</Text>
        </View>
      </View>

      {/* Chat Content */}
      {!shouldShowChat() ? (
        <WaitingMessage 
          consultationType={consultation.type}
          consultationDate={consultation.startDate}
          consultationTime={consultation.endDate}
        />
      ) : (
        <>
          {/* Location Card for offline consultations */}
          {((consultation.type === 'offline' && __DEV__ && devState.showLocationCard) || 
            (consultation.type === 'offline' && !__DEV__)) && (
            <LocationCard
              date={consultation.startDate}
              time={consultation.endDate}
              location={consultation.location || ''}
            />
          )}

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessage
                id={item.id}
                message={item.message}
                timestamp={item.timestamp}
                isFromUser={item.isFromUser}
                senderName={item.senderName}
                senderAvatar={item.senderAvatar}
              />
            )}
            style={styles.messagesList}
            inverted
          />
        </>
      )}

      {/* Chat Input */}
      {shouldShowChat() && (
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={(__DEV__ ? devState.chatStatus : chatStatus) === 'ended'}
          isConsultationEnded={(__DEV__ ? devState.chatStatus : chatStatus) === 'ended'}
          onBookingPress={handleBookingPress}
        />
      )}

      {/* Dev Tools - Only in Development */}
      {__DEV__ && (
        <DevTools 
          currentState={devState}
          onStateChange={handleDevStateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[50],
    backgroundColor: theme.colors.customWhite[50],
  },
  backButton: {
    marginRight: 8,
  },
  architectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  architectAvatar: {
    width: 36,
    height: 36,
    borderRadius: 40,
    backgroundColor: theme.colors.customGreen[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...theme.typography.caption,
    color: theme.colors.customWhite[50],
    fontWeight: '600',
  },
  architectName: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[100],
  },
  headerTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});