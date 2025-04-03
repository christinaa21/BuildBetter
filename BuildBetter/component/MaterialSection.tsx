import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback, Pressable, LayoutChangeEvent, Platform, Easing } from "react-native";
import { theme } from "@/app/theme";
import { Card } from "./Card";
import { GridContainer } from "./GridContainer";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SolarRoof, Wall, CubeTransparent } from "phosphor-react-native";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

interface Material {
  id: string;
  title: string;
  description?: string;
  image?: any;
  icon?: React.ReactNode;
  budget?: 'original' | 'ekonomis' | 'premium';
  priceRange?: string;
}

interface MaterialCategory {
  id: string | number;
  title: string;
  icon: React.ReactNode;
  materials?: Material[];
}

interface BudgetOption {
  id: string;
  title: string;
  priceRange: string;
  animation?: Animated.Value;
  width?: number;
}

interface MaterialProps {
  data?: Material[];
  isLandscape?: boolean;
  state: (data: boolean) => void;
}

export const MaterialSection: React.FC<MaterialProps> = ({ data = [], isLandscape = true, state }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string>('original');
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const { height, width } = Dimensions.get('window');
  const panelHeight = height * 0.5; // 50% of screen height
  
  // Create animated values for each budget option
  const originalAnimation = useRef(new Animated.Value(1)).current;
  const ekonomisAnimation = useRef(new Animated.Value(0)).current;
  const premiumAnimation = useRef(new Animated.Value(0)).current;
  
  // Store the width measurements of each budget range text
  const [budgetRangeWidths, setBudgetRangeWidths] = useState({
    original: 0,
    ekonomis: 0,
    premium: 0
  });
  
  // Pre-calculate the budget range widths for smoother animation
  const budgetOptions: BudgetOption[] = [
    { 
      id: 'original', 
      title: 'Original', 
      priceRange: 'Rp500K - Rp1.5M', 
      animation: originalAnimation,
      width: 110 // Estimated width, will be updated on measurement
    },
    { 
      id: 'ekonomis', 
      title: 'Ekonomis', 
      priceRange: 'Rp300K - Rp800K', 
      animation: ekonomisAnimation,
      width: 105 // Estimated width, will be updated on measurement
    },
    { 
      id: 'premium', 
      title: 'Premium', 
      priceRange: 'Rp1.2M - Rp3M', 
      animation: premiumAnimation,
      width: 95 // Estimated width, will be updated on measurement
    }
  ];
  
  // Material categories
  const materialTypes: MaterialCategory[] = [
    { id: 'atap', title: 'Atap', icon: <SolarRoof size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'dinding', title: 'Dinding', icon: <Wall size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'lantai', title: 'Lantai', icon: <MaterialCommunityIcons name="floor-plan" size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'bukaan', title: 'Bukaan', icon: <MaterialIcons name="window" size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'balok-kolom', title: 'Balok- Kolom', icon: <CubeTransparent size={24} color={theme.colors.customGreen[300]} /> },
    { id: 'pondasi', title: 'Pondasi', icon: <MaterialIcons name="foundation" size={24} color={theme.colors.customGreen[300]} /> }
  ];

  // Sample material data with budget categories as in original code
  const materialData = {
    atap: {
      original: [
        { id: 'genting', title: 'Genting', description: 'Atap', image: require('@/assets/images/genting.png'), budget: 'original', priceRange: 'Rp500K - Rp1.5M' },
        { id: 'baja_ringan', title: 'Baja Ringan', description: 'Struktur Atap', image: require('@/assets/images/baja-ringan.png'), budget: 'original', priceRange: 'Rp500K - Rp1.5M' },
        { id: 'pvc', title: 'PVC', description: 'Plafon', image: require('@/assets/images/pvc.png'), budget: 'original', priceRange: 'Rp500K - Rp1.5M' }
      ],
      ekonomis: [
        { id: 'seng', title: 'Seng', description: 'Atap', image: require('@/assets/images/genting.png'), budget: 'ekonomis', priceRange: 'Rp300K - Rp800K' },
        { id: 'kayu', title: 'Kayu', description: 'Struktur Atap', image: require('@/assets/images/baja-ringan.png'), budget: 'ekonomis', priceRange: 'Rp300K - Rp800K' }
      ],
      premium: [
        { id: 'genteng_keramik', title: 'Genteng Keramik', description: 'Atap', image: require('@/assets/images/genting.png'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' },
        { id: 'baja_galvanis', title: 'Baja Galvanis', description: 'Struktur Atap', image: require('@/assets/images/baja-ringan.png'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' },
        { id: 'gypsum', title: 'Gypsum', description: 'Plafon', image: require('@/assets/images/pvc.png'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' },
        { id: 'aluminium', title: 'Aluminium', description: 'Aksesoris', image: require('@/assets/images/pvc.png'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' }
      ]
    },
    dinding: {
      original: [
        { id: 'bata', title: 'Bata', description: 'Struktur Dinding', image: require('@/assets/images/bata.jpeg'), budget: 'original', priceRange: 'Rp500K - Rp1.5M' },
        { id: 'cat', title: 'Cat', description: 'Pelapis Dinding', image: require('@/assets/images/cat.jpg'), budget: 'original', priceRange: 'Rp500K - Rp1.5M' }
      ],
      ekonomis: [
        { id: 'batako', title: 'Batako', description: 'Struktur Dinding', image: require('@/assets/images/bata.jpeg'), budget: 'ekonomis', priceRange: 'Rp300K - Rp800K' }
      ],
      premium: [
        { id: 'hebel', title: 'Hebel', description: 'Struktur Dinding', image: require('@/assets/images/bata.jpeg'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' },
        { id: 'wallpaper', title: 'Wallpaper', description: 'Pelapis Dinding', image: require('@/assets/images/cat.jpg'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' },
        { id: 'marmer', title: 'Marmer', description: 'Aksen Dinding', image: require('@/assets/images/cat.jpg'), budget: 'premium', priceRange: 'Rp1.2M - Rp3M' }
      ]
    },
    // Add other categories as needed
  };

  // Initial animation setup
  useEffect(() => {
    // Initialize animations based on the default selected budget
    animateBudgetSelection('original', false);
  }, []);

  const closePanel = () => {
    Animated.timing(panelAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      // Add easing to make animation smoother
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
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
        // Add easing to make animation smoother
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, []);

  // Function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Function to animate budget selection changes with improved animation config
  const animateBudgetSelection = (budgetId: string, animate = true) => {
    // Create animation sequence for each budget option
    const animations = budgetOptions.map(budget => {
      const toValue = budget.id === budgetId ? 1 : 0;
      return Animated.timing(budget.animation!, {
        toValue,
        duration: animate ? 200 : 0, // No animation on initial setup
        useNativeDriver: false, // These animations modify layout, can't use native driver
        easing: Easing.inOut(Easing.ease),
      });
    });

    // Run animations in parallel
    Animated.parallel(animations).start();
  };

  // Function to handle budget selection
  const handleBudgetSelect = (budgetId: string) => {
    setSelectedBudget(budgetId);
    animateBudgetSelection(budgetId);
  };

  // Function to measure the width of a budget range text
  const measureBudgetRangeWidth = (budgetId: string, event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setBudgetRangeWidths(prev => ({
      ...prev,
      [budgetId]: width + 2
    }));
  };

  // Get materials for the selected category and budget
  const getMaterialsForCategory = () => {
    if (!selectedCategory) return [];
    
    const categoryData = materialData[selectedCategory as keyof typeof materialData];
    if (!categoryData) return [];
    
    return categoryData[selectedBudget as keyof typeof categoryData] || [];
  };

  // Check if there is any material data for the selected category and budget
  const hasMaterialData = () => {
    const materials = getMaterialsForCategory();
    return materials && materials.length > 0;
  };

  // Calculate the number of columns based on the number of materials (max 4)
  const getNumColumns = () => {
    const materialsCount = getMaterialsForCategory().length;
    return Math.min(materialsCount === 0 ? 1 : materialsCount, 4);
  };

  // Calculate transform values for the panel with optimized interpolation
  const translateY = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [panelHeight, 0],
    // Add extrapolate clamp to prevent overshooting
    extrapolate: 'clamp',
  });

  // Memoize the rendered budget buttons to prevent unnecessary re-renders
  const renderBudgetButtons = () => {
    return budgetOptions.map((budget) => {
      const fixedWidth = budgetRangeWidths[budget.id as keyof typeof budgetRangeWidths] || budget.width || 0;
      
      // Calculate animation values
      const rangeWidth = budget.animation!.interpolate({
        inputRange: [0, 1],
        outputRange: [0, fixedWidth+20],
        extrapolate: 'clamp',
      });
      
      // Calculate opacity for range text
      const rangeOpacity = budget.animation!.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
        extrapolate: 'clamp',
      });
      
      return (
        <Pressable
          key={budget.id}
          style={[
            styles.budgetButton,
            selectedBudget === budget.id && styles.selectedBudgetButton
          ]}
          onPress={() => handleBudgetSelect(budget.id)}
        >
          <Text
            style={[
              styles.budgetButtonText,
              selectedBudget === budget.id && styles.selectedBudgetButtonText
            ]}
            numberOfLines={1}
          >
            {budget.title}
          </Text>
          <Animated.View 
            style={{
              width: rangeWidth,
              opacity: rangeOpacity,
              overflow: 'hidden',
            }}
          >
            <Text
              style={[
                styles.budgetRangeText,
                selectedBudget === budget.id && styles.selectedBudgetButtonText
              ]}
              numberOfLines={1}
            >
              ({budget.priceRange})/m²
            </Text>
          </Animated.View>
        </Pressable>
      );
    });
  };

  const getContainerWidth = () => {
    const materialsCount = getMaterialsForCategory().length;
    if (materialsCount <= 1) return '90%';
    if (materialsCount === 2) return '50%';
    if (materialsCount === 3) return '70%';
    return '90%';
  };

  // Render empty state when no materials are available
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialIcons name="help" size={48} color={theme.colors.customGray[100]} />
        <Text style={styles.emptyStateMessage}>
          Mohon maaf, saat ini belum ada material {selectedCategory} untuk kategori budget {selectedBudget}.
        </Text>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Hidden text measurement container */}
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        {budgetOptions.map(budget => (
          <Text
            key={`measure-${budget.id}`}
            style={styles.budgetRangeText}
            onLayout={(event) => measureBudgetRangeWidth(budget.id, event)}
          >
            ({budget.priceRange})
          </Text>
        ))}
      </View>

      {/* Material Panel with hardware acceleration */}
      <Animated.View 
        style={[
          styles.panel,
          { 
            height: panelHeight,
            transform: [{ translateY }]
          }
        ]}
        // Add hardware acceleration hint
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
      >

        <View style={styles.panelHeader}>
            {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)} style={styles.backButton}>
                <MaterialIcons name="chevron-left" size={24} color={theme.colors.customGreen[300]} />
              </Pressable>
            )}

            <Text style={styles.panelTitle}>
              {selectedCategory 
                ? (materialTypes.find(type => type.id === selectedCategory)?.title || 'Materials')
                : "Material"
              }
            </Text>

          <View style={styles.headerRightSection}>
            <View style={styles.budgetFilterContainer}>
              {renderBudgetButtons()}
            </View>
            
            <Pressable onPress={closePanel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.customGreen[300]} />
            </Pressable>
          </View>
        </View>

        {/* Panel Content */}
        <ScrollView 
          style={styles.panelContent}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={selectedCategory && !hasMaterialData() ? {flex: 1} : {}}
        >
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
          ) : !hasMaterialData() ? (
            renderEmptyState()
          ) : (
            <View style={styles.materialsContainer}>
              {getNumColumns() > 1 ? (
                <GridContainer
                  data={getMaterialsForCategory()}
                  numColumns={getNumColumns()}
                  columnSpacing={16}
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
                  contentContainerStyle={[
                    styles.gridContainer, 
                    { width: getContainerWidth() }
                  ]}
                />
              ) : (
                <View style={{alignSelf: 'center'}}>
                  <Card
                    image={getMaterialsForCategory()[0].image}
                    title={getMaterialsForCategory()[0].title}
                    description={getMaterialsForCategory()[0].description}
                    showButton={false}
                    imageStyle={styles.materialImage}
                    style={styles.materialCard}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
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
  // Improved single row header with three sections
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGreen[50],
  },
  // Right section for budget filter and close button
  headerRightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  panelTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    flex: 0.2,
    alignItems: 'flex-start',
    paddingLeft: 8
  },
  backButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Improved budget filter container
  budgetFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  // Smaller, more compact budget buttons
  budgetButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[300],
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    minWidth: 80,
  },
  selectedBudgetButton: {
    backgroundColor: theme.colors.customGreen[300],
    borderColor: theme.colors.customGreen[300],
  },
  budgetButtonText: {
    ...theme.typography.body2,
    fontSize: 12,
    color: theme.colors.customGreen[500],
    fontWeight: '600',
  },
  budgetRangeText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.customGreen[500],
    marginLeft: 4,
  },
  selectedBudgetButtonText: {
    color: theme.colors.customWhite[50],
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  materialsContainer: {
    flex: 1,
    width: '100%'
  },
  gridContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  categoryCard: {
    padding: 12,
    backgroundColor: '#CAE1DB',
    aspectRatio: 1,
  },
  materialImage: {
    width: 80,
    height: 50,
    alignSelf: 'center',
  },
  materialCard: {
    width: '100%',
    maxWidth: 160,
    paddingHorizontal: 28,
    backgroundColor: '#CAE1DB',
    alignItems: 'center',
  },
  // New empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateMessage: {
    ...theme.typography.body2,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginVertical: 8,
  },
});