import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { buildconsultApi, PhotoUploadPayload } from '@/services/api';
import theme from '@/app/theme';
import ChatMessage from '@/component/ChatMessage';
import ChatInput from '@/component/ChatInput';
import WaitingMessage from '@/component/WaitingMessage';
import LocationCard from '@/component/LocationCard';
import { useAuth } from '@/context/AuthContext';

// Define the shape of an asset for the onSendMessage callback
interface MessageAsset {
  uri: string;
  type: 'image' | 'file';
  name: string;
  mimeType?: string;
}

// API Response type for a single chat message
interface ApiChatMessage {
    id: string;
    roomId: string;
    sender: string;
    senderRole: 'user' | 'architect';
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE'; // Added FILE
    createdAt: string;
}

// Local state interface for a message
interface Message {
  id: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
  senderName: string;
  senderAvatar?: string;
  type: 'TEXT' | 'IMAGE' | 'FILE'; // Added FILE
  fileName?: string; // Added for file attachments
}

// Local state interface for consultation details (from API)
interface ConsultationDetails {
  id: string;
  type: 'online' | 'offline';
  status: 'waiting-for-confirmation' | 'scheduled' | 'in-progress' | 'ended' | 'cancelled' | 'waiting-for-payment';
  architectName: string;
  architectAvatar?: string;
  startDate: string;
  endDate: string;
  location?: string | null;
  locationDescription?: string | null;
  roomId: string;
}

interface MessageWithDate extends Message {
  date: string;
}

interface GroupedMessage {
  id: string;
  type: 'date' | 'message';
  date?: string;
  message?: MessageWithDate;
  isFirstMessageFromSender?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { roomId, consultationId } = useLocalSearchParams<{ roomId: string, consultationId: string }>();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const flatListRef = useRef<FlatList>(null);
  const ws = useRef<WebSocket | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const consultationRef = useRef<ConsultationDetails | null>(null);
  const userRef = useRef<any>(null);
  const isUnmounting = useRef(false);

  useEffect(() => {
    consultationRef.current = consultation;
    userRef.current = user;
  });

  const getLocalTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const parseTimestamp = (timestamp: string): Date => {
    const cleanTimestamp = timestamp.replace('Z', '');
    return new Date(cleanTimestamp);
  };

  useEffect(() => {
    isUnmounting.current = false;
    loadChatRoom();

    return () => {
      isUnmounting.current = true;
      if (pingInterval.current) clearInterval(pingInterval.current);
      if (ws.current) {
        console.log('Closing WebSocket connection on unmount...');
        ws.current.close(1000);
      }
    };
  }, [roomId, consultationId]);

  const loadChatRoom = async () => {
    if (!roomId || !consultationId || !user) {
      Alert.alert('Error', 'Missing required information to load chat.');
      setLoading(false);
      router.back();
      return;
    }

    try {
      setLoading(true);
      const consultationResponse = await buildconsultApi.getConsultationById(consultationId);
      if (consultationResponse.code !== 200 || !consultationResponse.data) throw new Error(consultationResponse.error || 'Failed to load consultation details.');
      
      const details = consultationResponse.data;
      const fetchedConsultation: ConsultationDetails = {
        id: details.id, type: details.type, status: details.status,
        architectName: details.architectName, architectAvatar: undefined,
        startDate: details.startDate, endDate: details.endDate,
        location: details.location, locationDescription: details.locationDescription,
        roomId: details.roomId!,
      };
      setConsultation(fetchedConsultation);
      
      const currentStatus = determineChatStatus(fetchedConsultation);
      setChatStatus(currentStatus);

      const chatHistoryResponse = await buildconsultApi.getRoomsChat(roomId);
      if (chatHistoryResponse.code === 200 && chatHistoryResponse.data) {
        const getFileNameFromUrl = (url: string) => decodeURIComponent(url).substring(url.lastIndexOf('/') + 1).split('?')[0];

        const mappedMessages = (chatHistoryResponse.data as unknown as ApiChatMessage[]).map((msg): Message => ({
          id: msg.id, message: msg.content, timestamp: msg.createdAt,
          isFromUser: msg.sender === user.userId,
          senderName: msg.sender === user.userId ? (user.username || 'You') : fetchedConsultation.architectName,
          type: msg.type, senderAvatar: undefined,
          fileName: msg.type === 'FILE' ? getFileNameFromUrl(msg.content) : undefined,
        }));
        setMessages(mappedMessages);
      } else if (chatHistoryResponse.code !== 404) {
         throw new Error(chatHistoryResponse.error || 'Failed to load chat history.');
      }

      if (currentStatus === 'active') initializeWebSocket(roomId);
    } catch (error: any) {
      console.error('Error loading chat room:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const determineChatStatus = (consult: ConsultationDetails): 'waiting' | 'active' | 'ended' => {
    if (!consult) return 'waiting';
    const now = new Date();
    const consultationStart = parseTimestamp(consult.startDate);
    const consultationEnd = parseTimestamp(consult.endDate);
    if (['ended', 'cancelled'].includes(consult.status)) return 'ended';
    if (consult.status === 'in-progress') return 'active';
    if (consult.status === 'scheduled') {
      if(now >= consultationStart && now < consultationEnd) return 'active';
      if(now >= consultationEnd) return 'ended';
      return 'waiting';
    }
    return 'waiting';
  };

  const initializeWebSocket = async (currentRoomId: string) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return Alert.alert('Authentication Error', 'Cannot connect to chat. Please log in again.');

    if (ws.current) { ws.current.onclose = null; ws.current.close(); }
    
    const wsUrl = `wss://build-better.site/ws/chat/${currentRoomId}`;
    // @ts-ignore
    const newWs = new WebSocket(wsUrl, undefined, { headers: { 'Authorization': `Bearer ${token}` } });

    newWs.onopen = () => {
      console.log('WebSocket connection established.');
      setChatStatus('active');
      if (pingInterval.current) clearInterval(pingInterval.current);
      pingInterval.current = setInterval(() => { if (newWs.readyState === WebSocket.OPEN) newWs.send('PING'); }, 30000);
    };
    
    newWs.onmessage = (event) => {
      const currentUser = userRef.current;
      const currentConsultation = consultationRef.current;

      if (event.data === 'PONG') return;
      if (!currentUser || !currentConsultation) return;

      try {
        const receivedMsg = JSON.parse(event.data);
        if (receivedMsg.sender === currentUser.userId) return;

        const getFileNameFromUrl = (url: string) => decodeURIComponent(url).substring(url.lastIndexOf('/') + 1).split('?')[0];

        const newMessage: Message = {
          id: receivedMsg.id || Date.now().toString(),
          message: receivedMsg.content,
          timestamp: receivedMsg.createdAt || receivedMsg.sentAt || new Date().toISOString(),
          isFromUser: false,
          senderName: currentConsultation.architectName,
          type: receivedMsg.type,
          fileName: receivedMsg.type === 'FILE' ? getFileNameFromUrl(receivedMsg.content) : undefined,
          senderAvatar: undefined,
        };
        setMessages(prev => [newMessage, ...prev]);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e, 'Raw data:', event.data);
      }
    };
  
    newWs.onerror = (error: any) => {
      console.error('WebSocket error:', error.message);
      if (error.message && error.message.includes("Expected HTTP 101 response")) {
        console.log("WebSocket handshake failed.");
        if (consultation) {
            const status = (new Date() > parseTimestamp(consultation.endDate)) ? 'ended' : 'waiting';
            setChatStatus(status);
        }
      } else {
        Alert.alert('Connection Error', 'Lost connection to the chat server.');
        setChatStatus('ended');
      }
    };
  
    newWs.onclose = (event) => { 
      console.log('WebSocket connection closed:', event.code, event.reason); 
      if (pingInterval.current) clearInterval(pingInterval.current);
      if (!isUnmounting.current && event.code !== 1000) {
        setTimeout(() => { if (!isUnmounting.current) initializeWebSocket(currentRoomId); }, 5000);
      }
    };
    ws.current = newWs;
  };

  const handleSendMessage = async (message: string, assets?: MessageAsset[]) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !user) {
          Alert.alert('Not Connected', 'You are not connected to the chat.');
          return;
      }
      const sentAt = getLocalTimestamp();

      // Handle text messages
      if (message.trim()) {
          const optimisticMessage: Message = {
              id: `temp_${Date.now()}`, message: message.trim(), timestamp: sentAt,
              isFromUser: true, senderName: user.username || 'You', type: 'TEXT', senderAvatar: undefined,
          };
          setMessages(prev => [optimisticMessage, ...prev]);

          ws.current.send(JSON.stringify({ 
              sender: user.userId, senderRole: "user", content: message.trim(), 
              type: "TEXT", sentAt: sentAt 
          }));
      }

      // Handle image and file assets
      if (assets && assets.length > 0) {
          for (const asset of assets) {
              const isImage = asset.type === 'image';
              const messageType = isImage ? 'IMAGE' : 'FILE';
              const tempId = `temp_${asset.type}_${Date.now()}_${Math.random()}`;
              
              const optimisticMessage: Message = {
                  id: tempId, message: asset.uri, timestamp: sentAt, isFromUser: true,
                  senderName: user.username || 'You', type: messageType,
                  fileName: isImage ? undefined : asset.name, senderAvatar: undefined,
              };
              setMessages(prev => [optimisticMessage, ...prev]);

              try {
                  const filePayload: PhotoUploadPayload = { 
                      uri: asset.uri, name: asset.name, 
                      type: asset.mimeType || (isImage ? 'image/jpeg' : 'application/octet-stream')
                  };
                  const response = await buildconsultApi.uploadFile(roomId!, filePayload);
                  
                  if (response.code === 200 && response.data) {
                      const finalUrl = response.data;
                      setMessages(prev => prev.map(msg => 
                          msg.id === tempId ? { ...msg, message: finalUrl } : msg
                      ));
                      ws.current.send(JSON.stringify({ 
                          sender: user.userId, senderRole: "user", content: finalUrl, 
                          type: messageType, sentAt: sentAt 
                      }));
                  } else {
                      setMessages(prev => prev.filter(msg => msg.id !== tempId));
                      throw new Error(response.error || `Failed to upload ${asset.type}.`);
                  }
              } catch (error: any) {
                  console.error(`Error sending ${asset.type}:`, error);
                  setMessages(prev => prev.filter(msg => msg.id !== tempId));
                  Alert.alert('Upload Failed', error.message);
              }
          }
      }
  };


  const handleBack = () => router.back();
  const handleBookingPress = () => router.push('/buildconsult/booking');

  const formatDate = (timestamp: string) => {
    const date = parseTimestamp(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isSameDay = (d1:Date, d2:Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    if (isSameDay(date, today)) return 'Hari ini';
    if (isSameDay(date, yesterday)) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const groupMessagesByDate = (msgs: Message[]): GroupedMessage[] => {
    if (!msgs || msgs.length === 0) return [];
    const grouped: GroupedMessage[] = [];
    let currentDate = '';
    let previousMessage: MessageWithDate | null = null;
    const sortedMessages = [...msgs].sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime());
    sortedMessages.forEach((message) => {
      const messageDate = parseTimestamp(message.timestamp).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        grouped.push({ id: `date-${messageDate}`, type: 'date', date: formatDate(message.timestamp) });
        previousMessage = null;
      }
      const messageWithDate: MessageWithDate = { ...message, date: messageDate };
      const isFirstMessageFromSender = !previousMessage || previousMessage.isFromUser !== message.isFromUser;
      grouped.push({ id: message.id, type: 'message', message: messageWithDate, isFirstMessageFromSender });
      previousMessage = messageWithDate;
    });
    return grouped.reverse();
  };

  const renderChatItem = ({ item }: { item: GroupedMessage }) => {
    if (item.type === 'date') return <View style={styles.dateContainer}><Text style={styles.dateText}>{item.date}</Text></View>;
    if (item.message) {
      const timestampDate = parseTimestamp(item.message.timestamp);
      const timeString = `${String(timestampDate.getHours()).padStart(2, '0')}:${String(timestampDate.getMinutes()).padStart(2, '0')}`;
      return (
        <ChatMessage
          id={item.message.id}
          message={item.message.message}
          timestamp={timeString}
          isFromUser={item.message.isFromUser}
          senderName={item.message.senderName}
          senderAvatar={item.message.senderAvatar}
          isFirstMessageFromSender={item.isFirstMessageFromSender}
          type={item.message.type}
          fileName={item.message.fileName}
        />
      );
    }
    return null;
  };
  
  const getAvatarSource = () => require('@/assets/images/blank-profile.png');
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading Chat...</Text>
        </View>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.customGreen[300]}/><Text style={{ marginTop: 10 }}>Memuat konsultasi...</Text></View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><TouchableOpacity onPress={handleBack} style={styles.backButton}><MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} /></TouchableOpacity><Text style={styles.headerTitle}>Error</Text></View>
        <View style={styles.errorContainer}><Text>Gagal memuat detail konsultasi.</Text></View>
      </SafeAreaView>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);
  const hasHistory = messages.length > 0;
  const isSessionOver = chatStatus === 'ended' || new Date() > parseTimestamp(consultation.endDate);
  
  const formattedDate = parseTimestamp(consultation.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const startTime = parseTimestamp(consultation.startDate);
  const endTime = parseTimestamp(consultation.endDate);
  const formattedTime = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')} - ${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
  const waitingMessageText = consultation.type === 'online'
      ? `Jadwal Konsultasi Chat akan dimulai pada ${formattedDate}, pukul ${formattedTime}.`
      : 'Kamu baru bisa mengirimkan pesan kepada arsitek 1 jam sebelum konsultasi tatap muka dimulai.';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}><MaterialIcons name="arrow-back" size={24} color={theme.colors.customOlive[50]} /></TouchableOpacity>
          <View style={styles.architectInfo}><Image source={getAvatarSource()} style={styles.architectAvatar} /><Text style={styles.architectName}>{consultation.architectName}</Text></View>
        </View>

        {hasHistory ? (
          <View style={styles.chatContainer}>
            {consultation.type === 'offline' && consultation.location && (<LocationCard date={formattedDate} time={formattedTime} location={consultation.location} locationDescription={consultation.locationDescription || undefined}/>)}
            <FlatList ref={flatListRef} data={groupedMessages} keyExtractor={(item) => item.id} renderItem={renderChatItem} style={styles.messagesList} contentContainerStyle={styles.messagesContainer} inverted/>
          </View>
        ) : (
          <>
            {chatStatus === 'waiting' && <WaitingMessage consultationType={consultation.type} consultationDate={formattedDate} consultationTime={formattedTime} />}
            {isSessionOver && (
              <View style={styles.fullScreenStatusContainer}>
                <MaterialIcons name="check-circle-outline" size={64} color={theme.colors.customGray[200]} style={styles.fullScreenStatusIcon}/>
                <Text style={styles.fullScreenStatusTitle}>Sesi konsultasi telah berakhir.</Text>
                <Text style={styles.fullScreenStatusText}>Mau booking ulang? <Text style={styles.bookingLink} onPress={handleBookingPress}>Silakan klik di sini.</Text></Text>
              </View>
            )}
            {chatStatus === 'active' && <View style={styles.chatContainer} />}
          </>
        )}

        {chatStatus === 'active' && <ChatInput onSendMessage={handleSendMessage} disabled={false}/>}
        {isSessionOver && hasHistory && (<View style={styles.bookingFooter}><Text style={styles.bookingText}>Sesi konsultasi telah berakhir. Mau booking ulang? <Text style={styles.bookingLink} onPress={handleBookingPress}>Silakan klik di sini.</Text></Text></View>)}
        {chatStatus === 'waiting' && hasHistory && (<View style={styles.bottomBanner}><Text style={styles.bottomBannerText}>{waitingMessageText}</Text></View>)}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.customWhite[50] },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.customGray[50], backgroundColor: theme.colors.customWhite[50] },
  backButton: { marginRight: 8 },
  architectInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  architectAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: theme.colors.customGray[50] },
  architectName: { ...theme.typography.subtitle1, color: theme.colors.customOlive[100] },
  headerTitle: { ...theme.typography.subtitle1, color: theme.colors.customOlive[50], flex: 1 },
  chatContainer: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContainer: { paddingVertical: 8, paddingHorizontal: 8 },
  dateContainer: { alignItems: 'center', marginVertical: 8 },
  dateText: { ...theme.typography.caption, color: theme.colors.customGray[200], backgroundColor: theme.colors.customWhite[100], paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bookingFooter: { backgroundColor: theme.colors.customWhite[50], borderTopWidth: 1, borderTopColor: theme.colors.customGray[50], paddingHorizontal: 16, paddingVertical: 16, marginBottom: 8 },
  bookingText: { ...theme.typography.body2, color: theme.colors.customGray[200], textAlign: 'center', lineHeight: 20 },
  bookingLink: { color: theme.colors.customGreen[300], textDecorationLine: 'underline', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullScreenStatusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  fullScreenStatusIcon: { marginBottom: 16 },
  fullScreenStatusTitle: { ...theme.typography.body1, color: theme.colors.customGray[200], textAlign: 'center', marginBottom: 8 },
  fullScreenStatusText: { ...theme.typography.body1, color: theme.colors.customOlive[50], textAlign: 'center' },
  bottomBanner: { backgroundColor: theme.colors.customWhite[100], borderTopWidth: 1, borderTopColor: theme.colors.customGray[50], paddingHorizontal: 16, paddingVertical: 16, marginBottom: 8 },
  bottomBannerText: { ...theme.typography.body2, color: theme.colors.customOlive[50], textAlign: 'center' },
});