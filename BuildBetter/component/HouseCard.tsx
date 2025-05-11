import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/app/theme';

interface House {
  id: string;
  name: string;
  imageUrl: ImageSourcePropType;
  size: string;
  style: string;
  floors: number;
  bedrooms: number;
}

const HouseCard: React.FC<{ house: House }> = ({ house }) => {
  const router = useRouter();
  
  const goToHouseDetail = () => {
    router.push(`/buildplan/detail/${house.id}`);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={goToHouseDetail}
      activeOpacity={0.4}
    >
      <View style={styles.contentContainer}>
        <Image 
          source={house.imageUrl} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        <View style={styles.infoContainer}>
          <Text style={[styles.title, theme.typography.subtitle2]}>{house.name}</Text>
          
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <MaterialIcons name="square-foot" size={16} color={theme.colors.customGreen[200]} />
              <Text style={styles.specText}>{house.size} m²</Text>
            </View>
            
            <View style={styles.specItem}>
              <MaterialIcons name="home" size={16} color={theme.colors.customGreen[200]} />
              <Text style={styles.specText}>{house.style}</Text>
            </View>
          </View>
          
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <MaterialIcons name="layers" size={16} color={theme.colors.customGreen[200]} />
              <Text style={styles.specText}>{house.floors} Lantai</Text>
            </View>
            
            <View style={styles.specItem}>
              <MaterialIcons name="hotel" size={16} color={theme.colors.customGreen[200]} />
              <Text style={styles.specText}>{house.bedrooms} Kamar Tidur</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.customGreen[400]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: theme.colors.customWhite[50],
    margin: 8,
    overflow: 'hidden',
    shadowColor: theme.colors.customGray[200],
    elevation: 6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  title: {
    color: theme.colors.customOlive[50],
    marginBottom: 2,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[100],
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginVertical: 4,
    elevation: 1,

  },
  specText: {
    marginLeft: 4,
    color: theme.colors.customGreen[200],
    fontWeight: '100',
    fontFamily: 'poppins',
    fontSize: 12
  },
  arrowContainer: {
    justifyContent: 'center',
  },
});

export default HouseCard;