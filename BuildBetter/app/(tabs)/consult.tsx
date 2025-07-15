// app/buildconsult/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import ConsultationCard, { ConsultationStatus } from '@/component/ConsultationCard';
import { useAuth } from '@/context/AuthContext';
import { buildconsultApi, Architect } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

// Define consultation types based on API response
interface Consultation {
  id: string;
  userId: string;
  architectId: string;
  roomId: string | null;
  type: 'online' | 'offline';
  total: number;
  status: 'waiting-for-payment' | 'waiting-for-confirmation' | 'cancelled' | 'scheduled' | 'in-progress' | 'ended';
  reason: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  location?: string; // Add location field for offline consultations
}

interface ConsultationWithArchitect extends Consultation {
  architect: Architect;
}

// Helper function to map consultation status to ConsultationStatus
const mapConsultationStatus = (status: string): ConsultationStatus => {
  switch (status) {
    case 'scheduled':
      return 'Dijadwalkan';
    case 'in-progress':
      return 'Berlangsung';
    case 'ended':
      return 'Berakhir';
    case 'cancelled':
      return 'Dibatalkan';
    case 'waiting-for-payment':
      return 'Menunggu pembayaran';
    case 'waiting-for-confirmation':
      return 'Menunggu konfirmasi';
    default:
      return 'Berakhir';
  }
};

export default function BuildConsultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.username;
  
  const [hasConsultationHistory, setHasConsultationHistory] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationWithArchitect[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define allowed statuses for display
  const allowedStatuses: Consultation['status'][] = ['scheduled', 'in-progress', 'ended'];

  // Filter consultations based on search query AND status
  const filteredConsultations = consultations.filter(consultation => {
    // First filter by allowed statuses
    const hasAllowedStatus = allowedStatuses.includes(consultation.status);
    
    // Then filter by search query (architect name or city)
    const matchesSearch = consultation.architect.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consultation.architect.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    return hasAllowedStatus && matchesSearch;
  });

  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  const fetchConsultationHistory = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        setError('Please log in to view consultation history.');
        setLoading(false);
        return;
      }

      // Step 1: Refresh consultations first to update expired ones
      try {
        const refreshResponse = await buildconsultApi.refreshConsultations();
        if (refreshResponse.code !== 200) {
          console.warn('Failed to refresh consultations:', refreshResponse.error);
          // Continue with fetching even if refresh fails
        }
      } catch (refreshError) {
        console.warn('Error refreshing consultations:', refreshError);
        // Continue with fetching even if refresh fails
      }

      // Step 2: Fetch the (now updated) list of consultations
      const consultationResponse = await buildconsultApi.getConsultations();
      
      if (consultationResponse.code !== 200 || !consultationResponse.data) {
        setError(consultationResponse.error || 'Failed to fetch consultation history');
        setLoading(false);
        return;
      }

      const consultationsData: Consultation[] = consultationResponse.data;

      if (consultationsData.length === 0) {
        setHasConsultationHistory(false);
        setLoading(false);
        return;
      }

      // Step 3: Fetch architects to match with consultations
      const architectResponse = await buildconsultApi.getArchitects();
      
      if (architectResponse.code !== 200 || !architectResponse.data) {
        setError(architectResponse.error || 'Failed to fetch architect data');
        setLoading(false);
        return;
      }

      const architectsData: Architect[] = architectResponse.data;
      const architectMap = new Map<string, Architect>();
      architectsData.forEach(architect => {
        architectMap.set(architect.id, architect);
      });

      const consultationsWithArchitects: ConsultationWithArchitect[] = consultationsData
        .map(consultation => {
          const architect = architectMap.get(consultation.architectId);
          if (architect) {
            return { ...consultation, architect };
          }
          return null;
        })
        .filter((item): item is ConsultationWithArchitect => item !== null)
        // IMPORTANT: Sort by creation date descending to easily find the latest
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // --- START: MODIFICATION - Group consultations by roomId and get the latest ---
      const latestConsultationsMap = new Map<string, ConsultationWithArchitect>();

      consultationsWithArchitects.forEach(consultation => {
        // Use roomId as the primary key for grouping.
        // If roomId is null (e.g., for an offline consultation), use the unique consultation.id instead.
        const groupKey = consultation.roomId || consultation.id;

        // Because the list is sorted with the newest first, we only add
        // the first one we encounter for each groupKey, effectively getting the latest.
        if (!latestConsultationsMap.has(groupKey)) {
          latestConsultationsMap.set(groupKey, consultation);
        }
      });

      const uniqueLatestConsultations = Array.from(latestConsultationsMap.values());
      uniqueLatestConsultations.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      // --- END: MODIFICATION ---

      // Update state with the processed, unique list of latest consultations
      setConsultations(uniqueLatestConsultations);
      
      // Check the processed list to determine if there's history to show
      const hasDisplayableConsultations = uniqueLatestConsultations.some(consultation => 
        allowedStatuses.includes(consultation.status)
      );
      
      setHasConsultationHistory(hasDisplayableConsultations);

    } catch (err) {
      console.error('Error fetching consultation history:', err);
      setError('Network error or server unavailable. Please try again later.');
      setHasConsultationHistory(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatPress = (consultation: ConsultationWithArchitect) => {
    if (!consultation.roomId) {
      Alert.alert("Error", "Chat room not available for this consultation.");
      return;
    }
    // Navigate to chat with architect, passing roomId and the latest consultationId
    router.push({
      pathname: '/buildconsult/chat/[roomId]',
      params: { 
        roomId: consultation.roomId,
        consultationId: consultation.id 
      },
    });
  };

  const handleConsultNow = () => {
    router.push('/buildconsult/architects');
  };

  const handleRetry = () => {
    fetchConsultationHistory();
  };

  // --- RENDER LOGIC ---

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Textfield
            icon={<MaterialIcons name="search" size={16}/>}
            placeholder="Cari konsultasi di sini..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
          <Text style={[theme.typography.body2, styles.loadingText]}>
            Memuat riwayat konsultasi...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Textfield
            icon={<MaterialIcons name="search" size={16}/>}
            placeholder="Cari konsultasi di sini..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.customGray[100]} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Coba Lagi"
            variant="primary"
            onPress={handleRetry}
          />
        </View>
        <TouchableOpacity style={styles.chatIcon} onPress={handleConsultNow}>
          <MaterialCommunityIcons name="chat-plus" size={24} color={theme.colors.customWhite[50]} />
        </TouchableOpacity>
      </View>
    );
  }

  // First time user view
  if (!hasConsultationHistory) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Textfield
            icon={<MaterialIcons name="search" size={16}/>}
            placeholder="Cari konsultasi di sini..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.welcomeContent}>
          <Text style={[theme.typography.title, styles.titleText]}>
            Hai, {name}!
          </Text>
          <Text style={[theme.typography.body1, styles.description]}>
            Yuk mulai konsultasi via chat ataupun tatap muka dengan para arsitek kami!
          </Text>
          
          <View style={styles.infoBox}>
            <Text style={[theme.typography.body2, styles.infoTitle]}>
              Sebagai informasi:
            </Text>
            <Text style={[theme.typography.body2, styles.infoText]}>
              • 1 sesi chat = 30 menit
            </Text>
            <Text style={[theme.typography.body2, styles.infoText]}>
              • 1 sesi tatap muka = 1 jam
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Konsultasi sekarang"
              variant="primary"
              onPress={handleConsultNow}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.chatIcon} onPress={handleConsultNow}>
          <MaterialCommunityIcons name="chat-plus" size={24} color={theme.colors.customWhite[50]} />
        </TouchableOpacity>
      </View>
    );
  }

  // Returning user view with consultation history
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Textfield
          icon={<MaterialIcons name="search" size={16}/>}
          placeholder="Cari konsultasi di sini..."
          paddingVertical={12}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView 
        style={styles.consultationList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchConsultationHistory}
            colors={[theme.colors.customGreen[300]]}
            tintColor={theme.colors.customGreen[300]}
          />
        }
      >
        <View style={styles.infoChip}>
          <Text style={[theme.typography.title, {color: theme.colors.customGreen[300]}]}>Konsultasi Saya</Text>
        </View>
        
        {filteredConsultations.length === 0 && searchQuery.trim() !== '' && (
          <View style={styles.emptySearchContainer}>
            <MaterialIcons name="search-off" size={64} color={theme.colors.customGray[100]} />
            <Text style={styles.emptySearchText}>
              Tidak ada konsultasi yang sesuai dengan pencarian "{searchQuery}".
            </Text>
          </View>
        )}

        {filteredConsultations.map((consultation) => (
          <ConsultationCard
            // The consultation.id is now guaranteed to be from the latest consultation in its group
            key={consultation.roomId || consultation.id}
            id={consultation.id}
            architectName={consultation.architect.username}
            architectPhoto={consultation.architect.photo}
            consultationType={consultation.type}
            status={mapConsultationStatus(consultation.status)}
            startDate={consultation.startDate}
            endDate={consultation.endDate}
            onChatPress={() => handleChatPress(consultation)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.chatIcon} onPress={handleConsultNow} activeOpacity={0.4}>
        <MaterialCommunityIcons name="chat-plus" size={24} color={theme.colors.customWhite[50]} />
      </TouchableOpacity>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: theme.colors.customOlive[50],
    marginTop: 16,
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginVertical: 16,
  },
  // First time user styles
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: '16%',
    alignItems: 'center',
  },
  titleText: {
    color: theme.colors.customGreen[300],
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#CAE1DB',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  infoTitle: {
    color: theme.colors.customOlive[50],
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  buttonContainer: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: theme.colors.customGreen[300],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Returning user styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  infoChip: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 4,
  },
  infoChipText: {
    color: theme.colors.customOlive[50],
    marginBottom: 2,
  },
  consultationList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySearchText: {
    ...theme.typography.body1,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginTop: 16,
  },
});