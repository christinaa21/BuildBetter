// app/buildconsult/architects.tsx
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
  
  // Pagination state for handling large datasets
  const [displayedCount, setDisplayedCount] = useState(20); // Show 20 initially
  const [loadingMore, setLoadingMore] = useState(false);

  // Get all available cities from location data
  const cityOptions = getAllCities();

  // Sort and filter architects based on search query and selected cities
  const filteredArchitects = useMemo(() => {
    let filtered = architects;

    // Apply city filter only if cities are selected
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

    // Sort by user's city first, then alphabetically by username
    const sortedFiltered = filtered.sort((a, b) => {
      // If user has a city, prioritize architects from user's city
      if (userCity) {
        const aIsUserCity = a.city === userCity;
        const bIsUserCity = b.city === userCity;
        
        if (aIsUserCity && !bIsUserCity) return -1;
        if (!aIsUserCity && bIsUserCity) return 1;
      }
      
      // Secondary sort by username (alphabetical)
      return a.username.localeCompare(b.username);
    });

    return sortedFiltered;
  }, [architects, searchQuery, selectedCities, userCity]);

  // Get architects to display (with pagination)
  const displayedArchitects = useMemo(() => {
    return filteredArchitects.slice(0, displayedCount);
  }, [filteredArchitects, displayedCount]);

  const hasMoreArchitects = displayedCount < filteredArchitects.length;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset displayed count when searching
    setDisplayedCount(20);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreArchitects) {
      setLoadingMore(true);
      // Simulate loading delay (remove if not needed)
      setTimeout(() => {
        setDisplayedCount(prev => prev + 10); // Load 10 more
        setLoadingMore(false);
      }, 300);
    }
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

  const handleBooking = (architect: Architect) => {
    // Navigate to booking flow with architect data
    const architectData = {
      id: architect.id,
      username: architect.username,
      experience: architect.experience,
      city: architect.city,
      rateOnline: architect.rateOnline,
      rateOffline: architect.rateOffline,
      photo: architect.photo,
      portfolio: architect.portfolio
    };

    // Pass architect data as route params
    router.push({
      pathname: '/buildconsult/booking',
      params: {
        architectData: JSON.stringify(architectData)
      }
    });
  };

  const getCityFilterButtonText = () => {
    if (selectedCities.length === 0) return "Filter Kota";
    if (selectedCities.length === 1) return selectedCities[0];
    return `${selectedCities.length} Kota Terpilih`;
  };

  // Handle city filter changes
  const handleCityFilterApply = (values: string[]) => {
    setSelectedCities(values);
    // Reset displayed count when filtering
    setDisplayedCount(20);
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
          
          {/* BuildBetter Team Information */}
          <Text style={[theme.typography.caption, styles.buildBetterInfoText]}>
            <MaterialIcons name="verified" size={12} color={theme.colors.customGreen[400]} /> Semua arsitek merupakan arsitek profesional yang telah diseleksi oleh tim BuildBetter.
          </Text>

          <Text style={[theme.typography.caption, styles.infoChipText]}>
            Sebagai informasi, 1 sesi chat = 30 menit dan 1 sesi tatap muka = 1 jam.
          </Text>
          
          {/* Show user city priority info */}
          {userCity && (
            <Text style={[theme.typography.caption, styles.priorityText]}>
              Arsitek dari {userCity} ditampilkan terlebih dahulu.
            </Text>
          )}
          
          <View style={styles.searchAndFilterContainer}>
            <View style={styles.searchFieldContainer}>
              <Textfield
                icon={<MaterialIcons name="search" size={16}/>}
                placeholder="Cari arsitek..."
                paddingVertical={12}
                borderRadius={100}
                height={50}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            
            <Pressable 
              style={[
                styles.cityFilterButton,
                selectedCities.length > 0 && styles.cityFilterButtonActive
              ]} 
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

        {/* Results count */}
        {filteredArchitects.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              Menampilkan {displayedArchitects.length} dari {filteredArchitects.length} arsitek
            </Text>
          </View>
        )}

        {displayedArchitects.map((architect) => (
          <ArchitectCard
            key={architect.id}
            {...architect}
            onChatPress={() => handleChatPress(architect.id)}
            onBookPress={() => handleBooking(architect)}
          />
        ))}

        {/* Load more button */}
        {hasMoreArchitects && (
          <View style={styles.loadMoreContainer}>
            <Pressable 
              style={styles.loadMoreButton} 
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={theme.colors.customGreen[300]} />
              ) : (
                <>
                  <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>
                  <MaterialIcons 
                    name="keyboard-arrow-down" 
                    size={20} 
                    color={theme.colors.customGreen[300]} 
                  />
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      <MultiSelectDrawer
        isVisible={isCityDrawerVisible}
        onClose={() => setCityDrawerVisible(false)}
        title="Filter by Kota"
        options={cityOptions}
        selectedValues={selectedCities}
        onApply={handleCityFilterApply}
        enableSearch
        twoStepFilter={true}
        twoStepData={{
          provinces: locationData.provinces
        }}
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
    paddingTop: 12,
  },
  infoChipText: {
    color: theme.colors.customOlive[50],
  },
  buildBetterInfoText: {
    color: theme.colors.customGreen[400],
    marginBottom: 4,
  },
  priorityText: {
    color: theme.colors.customGreen[400],
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
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
  cityFilterButtonActive: {
    backgroundColor: theme.colors.customGreen[50],
    borderColor: theme.colors.customGreen[300],
  },
  cityFilterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.customOlive[50],
    marginRight: 4,
    textAlign: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resultsText: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
  },
  loadMoreContainer: {
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[200],
    gap: 8,
  },
  loadMoreText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[300],
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