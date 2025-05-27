// app/buildconsult/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import ArchitectCard, { ArchitectStatus } from '@/component/ArchitectCard';
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
    status: 'Dijadwalkan' as ArchitectStatus,
  },
  {
    id: '2',
    username: 'Ahmad Prasetyo',
    experience: 8,
    city: 'Jakarta',
    rateOnline: 35,
    rateOffline: 120,
    status: 'Berlangsung' as ArchitectStatus,
  },
  {
    id: '3',
    username: 'Sari Indah',
    experience: 12,
    city: 'Surabaya',
    rateOnline: 40,
    rateOffline: 150,
    status: 'Berakhir' as ArchitectStatus,
  },
];

export default function BuildConsultPage() {
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

  const handleNewChat = () => {
    // Navigate to new chat flow
    router.push('/buildconsult/new-chat');
  };

  const handleConsultNow = () => {
    // Navigate to consultation booking
    router.push('/buildconsult/booking');
  };

  // First time user view
  if (!hasConsultationHistory) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Textfield
            icon={<MaterialIcons name="search" size={16}/>}
            placeholder="Cari arsitek di sini..."
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

        <TouchableOpacity style={styles.chatIcon} onPress={() => setHasConsultationHistory(true)}>
          <View style={styles.chatIconContainer}>
            <MaterialCommunityIcons name="chat-plus" size={24} color={theme.colors.customWhite[50]} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Returning user view with search and architect list
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Textfield
          icon={<MaterialIcons name="search" size={16}/>}
          placeholder="Cari arsitek di sini..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        
        <View style={styles.infoChip}>
          <Text style={[theme.typography.caption, styles.infoChipText]}>
            Sebagai Informasi:
          </Text>
          <Text style={[theme.typography.caption, styles.infoChipText]}>
            • 1 sesi chat: 30 menit
          </Text>
          <Text style={[theme.typography.caption, styles.infoChipText]}>
            • 1 sesi tatap muka: 1 jam
          </Text>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={[theme.typography.caption, styles.infoButtonText]}>
              Oke, saya paham!
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.architectList} showsVerticalScrollIndicator={false}>
        {architects.map((architect) => (
          <ArchitectCard
            key={architect.id}
            {...architect}
            onChatPress={() => handleChatPress(architect.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <View style={styles.newChatButtonContent}>
          <MaterialIcons name="add" size={20} color={theme.colors.customOlive[50]} />
          <Text style={[theme.typography.caption, styles.newChatButtonText]}>
            new chat
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
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
  },
  chatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  infoChip: {
    backgroundColor: theme.colors.customWhite[100],
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    position: 'relative',
  },
  infoChipText: {
    color: theme.colors.customOlive[50],
    fontSize: 11,
    marginBottom: 2,
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
  newChatButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  newChatButtonContent: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
  },
  newChatButtonText: {
    color: theme.colors.customOlive[50],
    marginLeft: 4,
    fontSize: 12,
  },
});