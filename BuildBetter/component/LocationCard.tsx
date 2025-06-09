// component/LocationCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../app/theme';

interface LocationCardProps {
  date: string;
  time: string;
  location: string;
}

export default function LocationCard({ date, time, location }: LocationCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="event-available" size={24} color={theme.colors.customGreen[300]} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Konsultasi Tatap Muka</Text>
        <Text style={styles.dateTime}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
        
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color={theme.colors.customGray[200]} />
          <Text style={styles.location}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.customGray[50],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.subtitle2,
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  dateTime: {
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
    marginBottom: 2,
  },
  time: {
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  location: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
});