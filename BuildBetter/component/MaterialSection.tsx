import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback, Pressable } from "react-native";
import { theme } from "@/app/theme";
import { Card } from "./Card";
import { GridContainer } from "./GridContainer";
import Button from "./Button";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SolarRoof, Wall, CubeTransparent } from "phosphor-react-native";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

interface Material {
  id: string;
  title: string;
  description?: string;
  image?: any;
  icon?: React.ReactNode;
}

interface MaterialCategory {
  id: string | number;
  title: string;
  icon: React.ReactNode;
  materials?: Material[];
}

interface MaterialProps {
  data?: Material[];
  isLandscape?: boolean;
  state: (data: boolean) => void;
}

export const MaterialSection: React.FC<MaterialProps> = ({ data = [], isLandscape = true, state }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const { height, width } = Dimensions.get('window');
  const panelHeight = height * 0.5; // 40% of screen height
  
  // Material categories
  const materialTypes: MaterialCategory[] = [
    { id: 'atap', title: 'Atap', icon: <SolarRoof size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'dinding', title: 'Dinding', icon: <Wall size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'lantai', title: 'Lantai', icon: <MaterialCommunityIcons name="floor-plan" size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'bukaan', title: 'Bukaan', icon: <MaterialIcons name="window" size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'balok-kolom', title: 'Balok- Kolom', icon: <CubeTransparent size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'pondasi', title: 'Pondasi', icon: <MaterialIcons name="foundation" size={24} color={theme.colors.customGreen[300]} /> }
  ];

  // Sample material data (this would come from your API)
  const materialData = {
    atap: [
      { id: 'genting', title: 'Genting', description: 'Atap', image: require('@/assets/images/genting.png')},
      { id: 'baja_ringan', title: 'Baja Ringan', description: 'Struktur Atap', image: require('@/assets/images/baja-ringan.png')},
      { id: 'pvc', title: 'PVC', description: 'Plafon', image: require('@/assets/images/pvc.png')}
    ],
    dinding: [
      { id: 'bata', title: 'Bata', description: 'Struktur Dinding', image: require('@/assets/images/bata.jpeg')},
      { id: 'hebel', title: 'Cat', description: 'Pelapis Dinding', image: require('@/assets/images/cat.jpg')}
    ],
    // Add other categories as needed
  };

  const closePanel = () => {
    Animated.timing(panelAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setSelectedCategory(null);
      state(false);
    });
  };

  useEffect(() => {
    if (isOpen) {
      Animated.timing(panelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  // Function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Get materials for the selected category
  const getMaterialsForCategory = () => {
    if (!selectedCategory) return [];
    return materialData[selectedCategory as keyof typeof materialData] || [];
  };

  // Calculate transform values for the panel
  const translateY = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [panelHeight, 0],
  });

  const backdropOpacity = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <GestureHandlerRootView style={styles.container}>
          {/* Material Panel */}
          <Animated.View 
            style={[
              styles.panel,
              { 
                  height: panelHeight,
                  transform: [{ translateY }]
              }
            ]}
          >
            {/* Panel Header */}
            <View style={styles.panelHeader}>
              {selectedCategory && (
                <Pressable onPress={() => setSelectedCategory(null)} style={styles.closeButton}>
                  <MaterialIcons name="chevron-left" size={32} color={theme.colors.customGreen[300]} />
                </Pressable>
              )}

              <Text style={styles.panelTitle}>
                {selectedCategory 
                  ? materialTypes.find(type => type.id === selectedCategory)?.title || 'Materials'
                  : 'Pilih Tipe Material'
                }
              </Text>
              
              <Pressable onPress={closePanel} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={theme.colors.customGreen[300]} />
              </Pressable>
            </View>

            {/* Panel Content */}
            <ScrollView style={styles.panelContent}>
              {!selectedCategory ? (
                <GridContainer
                  data={materialTypes}
                  numColumns={6}
                  columnSpacing={8}
                  rowSpacing={8}
                  renderItem={(item) => (
                    <Card
                      icon={item.icon}
                      title={item.title}
                      onButtonPress={() => handleCategorySelect(item.id.toString())}
                      showButton={false}
                      style={styles.categoryCard}
                    />
                  )}
                />
              ) : (
                <GridContainer
                  data={getMaterialsForCategory()}
                  numColumns={3}
                  columnSpacing={12}
                  rowSpacing={12}
                  renderItem={(item) => (
                    <Card
                      image={item.image}
                      title={item.title}
                      description={item.description}
                      showButton={false}
                      imageStyle={styles.materialImage}
                      style={styles.materialCard}
                    />
                  )}
                />
              )}
            </ScrollView>
          </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex:1,
    zIndex: 1000,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.customWhite[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1001,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  panelTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  categoryCard: {
    padding: 12,
    backgroundColor: '#CAE1DB',
    aspectRatio: 1
  },
  materialImage: {
    width: '40%',
    height: '45%',
    alignSelf: 'center'
  },
  materialCard: {
    width: '75%',
    alignSelf: 'center',
    backgroundColor: '#CAE1DB',
  },
});