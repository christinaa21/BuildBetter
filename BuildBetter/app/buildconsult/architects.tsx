import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../theme';
import Textfield from '@/component/Textfield';
import ArchitectCard from '@/component/ArchitectCard';
import { useAuth } from '@/context/AuthContext';
import { buildconsultApi, Architect } from '@/services/api';
import * as SecureStore from 'expo-secure-store';

export default function Architects() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.username;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    const [filteredArchitects, setFilteredArchitects] = useState<Architect[]>(architects);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArchitects(architects);
    } else {
      const filtered = architects.filter((architect: Architect) =>
        architect.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        architect.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArchitects(filtered);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
      fetchArchitects();
    }, []);
  
    const fetchArchitects = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in by verifying token exists
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          setError('Please log in to view architect list.');
          setLoading(false);
          return;
        }
  
        const response = await buildconsultApi.getArchitects();
        
        if (response.code === 200 && response.data) {
          setArchitects(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch architects');
          setArchitects([]);
        }
      } catch (err) {
        console.error('Error fetching architects:', err);
        setError('Network error or server unavailable. Please try again later.');
        setArchitects([]);
      } finally {
        setLoading(false);
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
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
        </View>
      </SafeAreaView>
    );
  }

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

        {filteredArchitects.map((architect) => (
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
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