import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, Text } from 'react-native';
import HouseCard from '@/component/HouseCard';
import { theme } from '../theme';

const Saved = () => {
  // Sample house data - in a real app, this would come from your API
  const houses = [
    {
      id: '1',
      name: 'Rumah 1',
      imageUrl: require('@/assets/images/modern1.jpg'), // Replace with actual image URL
      size: '42-60 m²',
      style: 'Skandinavia',
      floors: 1,
      bedrooms: 2
    },
    {
      id: '2',
      name: 'Rumah 2',
      imageUrl: require('@/assets/images/modern2.jpg'), // Replace with actual image URL
      size: '60-80 m²',
      style: 'Minimalis',
      floors: 2,
      bedrooms: 3
    },
    {
      id: '3',
      name: 'Rumah 3',
      imageUrl: require('@/assets/images/industrialis1.jpg'), // Replace with actual image URL
      size: '80-100 m²',
      style: 'Modern',
      floors: 2,
      bedrooms: 4
    },
    // Add more houses as needed
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>        
        <FlatList
          data={houses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HouseCard house={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
    padding: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default Saved;