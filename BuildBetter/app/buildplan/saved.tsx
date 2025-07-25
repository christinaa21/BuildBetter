import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text, ActivityIndicator } from 'react-native';
// Import useFocusEffect from expo-router
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '../theme';
import { plansApi, PlanWithSuggestion } from '@/services/api';
import Button from '@/component/Button';
import * as SecureStore from 'expo-secure-store';
import HouseCard from '@/component/HouseCard';

const Saved = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanWithSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedPlans = useCallback(async () => {
    try {
      // Set loading to true each time we fetch
      setLoading(true);
      
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        setError('Please log in to view your saved plans.');
        setPlans([]); // Clear previous plans if any
        return;
      }

      const response = await plansApi.getPlans();
      
      if (response.code === 200 && response.data) {
        setPlans(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch saved plans');
        setPlans([]);
      }
    } catch (err) {
      console.error('Error fetching saved plans:', err);
      setError('Network error or server unavailable. Please try again later.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use useFocusEffect instead of useEffect.
  // This will run the fetchSavedPlans function every time this screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      console.log('Saved screen focused, fetching latest plans...');
      fetchSavedPlans();
    }, [fetchSavedPlans])
  );

  const handleViewDetails = (plan: PlanWithSuggestion) => {
    try {
      router.push({
        pathname: '/buildplan/detail/[id]',
        params: {
          id: plan.suggestions.id,
          planDetails: JSON.stringify({
            id: plan.id,
            suggestions: plan.suggestions,
            userInput: plan.userInput
          })
        }
      });
    } catch (err) {
      console.error('Error navigating to plan details:', err);
    }
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {error === 'Please log in to view your saved plans.' && (
              <Button
                title="Go to Login"
                variant="primary"
                onPress={() => router.push('/login')}
                style={styles.button}
              />
            )}
            {error !== 'Please log in to view your saved plans.' && (
              <Button
                title="Try Again"
                variant="outline"
                onPress={fetchSavedPlans} // Allow manual retry as well
                style={styles.button}
              />
            )}
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You don't have any saved house plans yet.</Text>
            <Button
              title="Explore House Plans"
              variant="primary"
              onPress={() => router.push('/(tabs)/home')}
              style={styles.button}
            />
          </View>
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item) => item.id} // Use the unique plan ID as the key
            renderItem={({ item, index }) => (
              <HouseCard
                house={{
                  id: item.suggestions.id,
                  name: `Rumah ${item.suggestions.houseNumber || index + 1}`,
                  imageUrl: item.suggestions.houseImageFront 
                    ? { uri: item.suggestions.houseImageFront } 
                    : require('@/assets/images/blank.png'),
                  size: `${item.suggestions.landArea || item.userInput.landArea}`,
                  style: item.suggestions.style || item.userInput.style,
                  floors: item.suggestions.floor || item.userInput.floor,
                  bedrooms: item.suggestions.rooms || item.userInput.rooms
                }}
                onPress={() => handleViewDetails(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            // Add a refreshing control for pull-to-refresh functionality
            onRefresh={fetchSavedPlans}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
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
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: theme.colors.customOlive[50],
  },
  button: {
    marginTop: 16,
    width: '80%',
  },
});

export default Saved;