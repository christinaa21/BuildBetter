import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../theme';
import Textfield from '@/component/Textfield';
import ArchitectCard from '@/component/ArchitectCard';
import MultiSelectDrawer from '@/component/MultiSelectDrawer';
import { useAuth } from '@/context/AuthContext';
import { buildconsultApi, Architect } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import locationData from '@/data/location.json';
import Button from '@/component/Button';

// Extract all cities from the location data
const getAllCities = () => {
  const cities: string[] = [];
  locationData.provinces.forEach(province => {
    province.cities.forEach(city => {
      cities.push(city.label);
    });
  });
  return cities.sort(); // Sort alphabetically for better UX
};

export default function Architects() {
  const router = useRouter();
  const { user } = useAuth();
  const userCity = user?.city;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isCityDrawerVisible, setCityDrawerVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get all available cities from location data
  const cityOptions = getAllCities();

  // Initialize default filter with user's city
  useEffect(() => {
    if (isInitialLoad && userCity && cityOptions.includes(userCity)) {
      setSelectedCities([userCity]);
      setIsInitialLoad(false);
    } else if (isInitialLoad) {
      // If user doesn't have a city or city is not in options, just mark as initialized
      setIsInitialLoad(false);
    }
  }, [userCity, cityOptions, isInitialLoad]);

  // Filter architects based on search query and selected cities
  const filteredArchitects = useMemo(() => {
    let filtered = architects;

    // Apply city filter
    if (selectedCities.length > 0) {
      filtered = filtered.filter((architect: Architect) =>
        selectedCities.includes(architect.city)
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((architect: Architect) =>
        architect.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        architect.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [architects, searchQuery, selectedCities]);

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

  const getCityFilterButtonText = () => {
    if (selectedCities.length === 0) return "Kota";
    if (selectedCities.length === 1) return selectedCities[0];
    return `${selectedCities.length} Kota Terpilih`;
  };

  // Handle city filter changes
  const handleCityFilterApply = (values: string[]) => {
    setSelectedCities(values);
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
          
          <View style={styles.searchAndFilterContainer}>
            <View style={styles.searchFieldContainer}>
              <Textfield
                icon={<MaterialIcons name="search" size={16}/>}
                placeholder="Cari arsitek di sini..."
                paddingVertical={12}
                borderRadius={100}
                height={50}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            
            <Pressable 
              style={styles.cityFilterButton} 
              onPress={() => setCityDrawerVisible(true)}
            >
              <Text style={styles.cityFilterButtonText} numberOfLines={1}>
                {getCityFilterButtonText()}
              </Text>
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={16} 
                color={theme.colors.customGreen[300]} 
              />
            </Pressable>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {filteredArchitects.length === 0 && !error && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color={theme.colors.customGray[100]} />
            <Text style={styles.emptyText}>
              Tidak ada arsitek yang sesuai dengan kriteria pencarian.
            </Text>
            {selectedCities.length > 0 && (
              <Button
                title="Hapus Filter Kota"
                variant="primary"
                onPress={() => setSelectedCities([])}
              />
            )}
          </View>
        )}

        {filteredArchitects.map((architect) => (
          <ArchitectCard
            key={architect.id}
            {...architect}
            onChatPress={() => handleChatPress(architect.id)}
            onBookPress={() => handleBooking(architect.id)}
          />
        ))}
      </ScrollView>

      <MultiSelectDrawer
        isVisible={isCityDrawerVisible}
        onClose={() => setCityDrawerVisible(false)}
        title="Filter by Kota"
        options={cityOptions}
        selectedValues={selectedCities}
        onApply={handleCityFilterApply}
        enableSearch
      />
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
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  searchFieldContainer: {
    flex: 1,
  },
  cityFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[200],
    minWidth: 80,
    justifyContent: 'center',
  },
  cityFilterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.customOlive[50],
    marginRight: 4,
    textAlign: 'center',
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
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffebee',
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    ...theme.typography.body2,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    ...theme.typography.body1,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginVertical: 16,
  },
});