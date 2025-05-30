// app/buildconsult/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../theme';
import Textfield from '@/component/Textfield';
import ArchitectCard from '@/component/ArchitectCard';
import { useAuth } from '@/context/AuthContext';

// Mock data for architects
const mockArchitects = [
  {
    id: '1',
    username: 'Erensa Ratu Chelsia',
    experience: 10,
    city: 'Kota Bandung',
    rateOnline: 30,
    rateOffline: 100,
    portfolio: 'https://issuu.com/erensaratu/docs/architecture_portfolio_by_erensa_ratu_chelsia'
  },
  {
    id: '2',
    username: 'Ahmad Prasetyo',
    experience: 8,
    city: 'Kota Jakarta Selatan',
    rateOnline: 35,
    rateOffline: 120,
  },
  {
    id: '3',
    username: 'Sari Indah',
    experience: 12,
    city: 'Surabaya',
    rateOnline: 40,
    rateOffline: 150,
  },
];

export default function Architects() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.username;
  
  // State to determine if user has consultation history
  // In real app, this would come from API/database
  const [hasConsultationHistory, setHasConsultationHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [architects, setArchitects] = useState(mockArchitects);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter architects based on search query
    if (query.trim() === '') {
      setArchitects(mockArchitects);
    } else {
      const filtered = mockArchitects.filter(architect =>
        architect.username.toLowerCase().includes(query.toLowerCase()) ||
        architect.city.toLowerCase().includes(query.toLowerCase())
      );
      setArchitects(filtered);
    }
  };

  const handleChatPress = (architectId: string) => {
    // Navigate to chat with architect
    console.log('Chat with architect:', architectId);
  };

  const handleBooking = (architectId: string) => {
    // Navigate to booking flow
    router.push('/buildconsult/booking');
  };

  // Returning user view with search and architect list
  return (
    <View style={styles.container}>
      <ScrollView style={styles.architectList} showsVerticalScrollIndicator={false}>
        <View style={styles.infoChip}>
          <Text style={[theme.typography.subtitle1]}>Rekomendasi Arsitek</Text>
          <Text style={[theme.typography.caption, styles.infoChipText]}>
            Sebagai informasi, 1 sesi chat berlangsung selama 30 menit dan 1 sesi tatap muka berlangsung selama 1 jam.
          </Text>
          <Textfield
            icon={<MaterialIcons name="search" size={16}/>}
            placeholder="Cari arsitek di sini..."
            paddingVertical={12}
            borderRadius={100}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {architects.map((architect) => (
          <ArchitectCard
            key={architect.id}
            {...architect}
            onChatPress={() => handleChatPress(architect.id)}
            onBookPress={() => handleBooking(architect.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  // Returning user styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  infoChip: {
    paddingHorizontal: 8,
    gap: 2,
    paddingVertical: 12,
  },
  infoChipText: {
    color: theme.colors.customOlive[50],
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
  },
  infoButtonText: {
    color: theme.colors.customOlive[50],
    fontSize: 10,
  },
  architectList: {
    flex: 1,
    paddingHorizontal: 16,
  },
});