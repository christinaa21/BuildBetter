import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable, LayoutChangeEvent, Platform, Easing } from "react-native";
import { theme } from "@/app/theme";
import { Card } from "./Card";
import { GridContainer } from "./GridContainer";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SolarRoof, Wall, CubeTransparent } from "phosphor-react-native";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

interface Material {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
}

interface MaterialSubCategory {
  subCategory: string;
  materials: Material[];
}

interface MaterialCategory {
  category: string;
  subCategories: MaterialSubCategory[];
}

interface BudgetOption {
  id: string;
  title: string;
  priceRange: string;
  animation?: Animated.Value;
  width?: number;
}

// Props interface for the MaterialSectionVertical component
interface MaterialSectionVerticalProps {
  budgetMin: number[];
  budgetMax: number[];
  materials0?: any;
  materials1?: any;
  materials2?: any;
  isLandscape?: boolean;
  state: (data: boolean) => void;
}

// Interface for mapped category types with icons
interface CategoryType {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export const MaterialSectionVertical: React.FC<MaterialSectionVerticalProps> = ({ 
  budgetMin = [300000, 500000, 1200000],
  budgetMax = [800000, 1500000, 3000000],
  materials0 = {}, 
  materials1 = {}, 
  materials2 = {}, 
  isLandscape = false, 
  state 
}) => {
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
  
  // Format price to Rupiah
  const formatPriceToRupiah = (price: number) => {
    if (price >= 1000000) {
      return `Rp${(price / 1000000).toFixed(3)} juta`;
    } else if (price >= 1000) {
      return `Rp${(price / 1000).toFixed(0)} ribu`;
    }
    return `Rp${price}`;
  };

  // Dynamic budget options data - now using props
  const getBudgetOptions = (): BudgetOption[] => {
    return [
      { 
        id: 'original', 
        title: 'Original', 
        priceRange: `${formatPriceToRupiah(budgetMin[1])} - ${formatPriceToRupiah(budgetMax[1])}`, 
        animation: originalAnimation,
        width: 110 // Estimated width, will be updated on measurement
      },
      { 
        id: 'ekonomis', 
        title: 'Ekonomis', 
        priceRange: `${formatPriceToRupiah(budgetMin[0])} - ${formatPriceToRupiah(budgetMax[0])}`, 
        animation: ekonomisAnimation,
        width: 105 // Estimated width, will be updated on measurement
      },
      { 
        id: 'premium', 
        title: 'Premium', 
        priceRange: `${formatPriceToRupiah(budgetMin[2])} - ${formatPriceToRupiah(budgetMax[2])}`, 
        animation: premiumAnimation,
        width: 95 // Estimated width, will be updated on measurement
      }
    ];
  };
  
  // Map for category icons
  const categoryIcons: { [key: string]: React.ReactNode } = {
    'atap': <SolarRoof size={24} color={theme.colors.customGreen[300]} />,
    'dinding': <Wall size={24} color={theme.colors.customGreen[300]} />,
    'lantai': <MaterialCommunityIcons name="floor-plan" size={24} color={theme.colors.customGreen[300]} />,
    'bukaan': <MaterialIcons name="window" size={24} color={theme.colors.customGreen[300]} />,
    'balok-kolom': <CubeTransparent size={24} color={theme.colors.customGreen[300]} />
  };

  // Initial animation setup
  useEffect(() => {
    // Initialize animations based on the default selected budget
    animateBudgetSelection('original', false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(panelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, []);

  const closePanel = () => {
    Animated.timing(panelAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }).start(() => {
      setIsOpen(false);
      setSelectedCategory(null);
      state(false);
    });
  };

  // Function to handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Function to animate budget selection changes with improved animation config
  const animateBudgetSelection = (budgetId: string, animate = true) => {
    // Create animation sequence for each budget option
    const animations = getBudgetOptions().map(budget => {
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

  const transformMaterialsToArray = (materialsObj: any): MaterialCategory[] => {
    if (!materialsObj) return [];

    return Object.keys(materialsObj).map(categoryName => ({
      category: categoryName,
      subCategories: Object.keys(materialsObj[categoryName]).map(subCategoryName => ({
        subCategory: subCategoryName,
        materials: materialsObj[categoryName][subCategoryName].map((material: any) => ({
          id: material.id,
          name: material.name,
          category: categoryName,
          subcategory: subCategoryName,
          image: material.image
        }))
      }))
    }));
  };

  // Get all available categories from the materials data
  const getAllCategories = (): CategoryType[] => {
    const categoriesSet = new Set<string>();
    
    // Collect all unique categories from all budget levels
    const materialArrays = [
      transformMaterialsToArray(materials0),
      transformMaterialsToArray(materials1),
      transformMaterialsToArray(materials2)
    ];
    
    materialArrays.forEach(materialsByBudget => {
      materialsByBudget.forEach(category => {
        categoriesSet.add(category.category.toLowerCase());
      });
    });
    
    // Convert to array and map to the expected format with icons
    return Array.from(categoriesSet).map(category => ({
      id: category,
      title: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
      icon: categoryIcons[category] || <MaterialIcons name="category" size={24} color={theme.colors.customGreen[300]} />
    }));
  };

  // Map budget string IDs to materials array index
  const getBudgetMaterialsIndex = (budgetId: string): number => {
    switch(budgetId) {
      case 'ekonomis': return 0;
      case 'original': return 1;
      case 'premium': return 2;
      default: return 1; // Default to original
    }
  };

  // Get materials for the selected category and budget
  const getMaterialsForCategory = () => {
    if (!selectedCategory) return [];
    
    const budgetIndex = getBudgetMaterialsIndex(selectedBudget);
    const materialsByBudget = budgetIndex === 0 ? 
      transformMaterialsToArray(materials0) : 
      budgetIndex === 1 ? 
      transformMaterialsToArray(materials1) : 
      transformMaterialsToArray(materials2);
    
    // Find the category in the materials for the selected budget
    const categoryData = materialsByBudget.find(cat => cat.category.toLowerCase() === selectedCategory.toLowerCase());
    if (!categoryData) return [];
    
    // Flatten all materials from all subcategories
    let allMaterials: Material[] = [];
    categoryData.subCategories.forEach(subCat => {
      allMaterials = [...allMaterials, ...subCat.materials];
    });
    
    return allMaterials;
  };

  // Check if there is any material data for the selected category and budget
  const hasMaterialData = () => {
    const materials = getMaterialsForCategory();
    return materials && materials.length > 0;
  };

  // Get the current budget price range
  const getCurrentBudgetPriceRange = () => {
    const budgetOptions = getBudgetOptions();
    const currentBudget = budgetOptions.find(budget => budget.id === selectedBudget);
    return currentBudget?.priceRange || '';
  };

  // Calculate the number of columns based on the device width and orientation
  const getNumColumns = () => {
    const materialsCount = getMaterialsForCategory().length;
    // For vertical mode, we'll use at most 2 columns
    return Math.min(materialsCount === 0 ? 1 : materialsCount, 2);
  };

  // Calculate transform values for the panel with optimized interpolation
  const translateY = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [panelHeight, 0],
    extrapolate: 'clamp',
  });

  // Render budget buttons in a column for vertical mode
  const renderBudgetButtons = () => {
    const budgetOptions = getBudgetOptions();
    
    return (
      <View>
        <View style={styles.budgetFiltersVertical}>
          {budgetOptions.map((budget) => (
            <Pressable
              key={budget.id}
              style={[
                styles.budgetButtonVertical,
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
            </Pressable>
          ))}
        </View>
        
        {/* Budget range display below filter buttons */}
        <Text style={styles.budgetRangeDisplay}>
          Rentang budget: {getCurrentBudgetPriceRange()}/m²
        </Text>
      </View>
    );
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
        {getBudgetOptions().map(budget => (
          <Text
            key={`measure-${budget.id}`}
            style={styles.budgetRangeText}
            onLayout={(event) => measureBudgetRangeWidth(budget.id, event)}
          >
            ({budget.priceRange})
          </Text>
        ))}
      </View>

      {/* Material Panel */}
      <Animated.View 
        style={[
          styles.panel,
          { 
            height: panelHeight,
            transform: [{ translateY }]
          }
        ]}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
      >
        <View style={styles.panelHeaderVertical}>
          <View style={styles.headerTopRow}>
            {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)} style={styles.backButton}>
                <MaterialIcons name="chevron-left" size={24} color={theme.colors.customGreen[300]} />
              </Pressable>
            )}

            <Text style={styles.panelTitle}>
              {selectedCategory 
                ? (getAllCategories().find(cat => cat.id === selectedCategory)?.title || 'Materials')
                : "Material"
              }
            </Text>
            
            <Pressable onPress={closePanel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.customGreen[300]} />
            </Pressable>
          </View>
          
          {/* Budget filter options and range display */}
          {renderBudgetButtons()}
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
              data={getAllCategories()}
              numColumns={3} // 3 columns for categories in vertical mode
              columnSpacing={8}
              rowSpacing={8}
              renderItem={(item) => (
                <Card
                  icon={item.icon}
                  title={item.title}
                  onButtonPress={() => handleCategorySelect(item.id)}
                  showButton={false}
                  style={styles.categoryCardVertical}
                />
              )}
            />
          ) : !hasMaterialData() ? (
            renderEmptyState()
          ) : (
            <View style={styles.materialsContainer}>
              <GridContainer
                data={getMaterialsForCategory()}
                numColumns={getNumColumns()}
                columnSpacing={16}
                rowSpacing={16}
                renderItem={(item) => (
                  <Card
                    image={item.image ? { uri: item.image } : undefined}
                    title={item.name}
                    description={item.subcategory}
                    showButton={false}
                    imageStyle={styles.materialImage}
                    style={styles.materialCardVertical}
                    touchable={false}
                  />
                )}
                contentContainerStyle={styles.gridContainerVertical}
              />
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
    borderColor: "rgba(171, 196, 190, 0.6)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1001,
    overflow: 'hidden',
  },
  // Vertical header layout
  panelHeaderVertical: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGreen[50],
  },
  // Top row with title and close button
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the title horizontally
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative', // For absolute positioning of back/close buttons
  },
  panelTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    textAlign: 'center', // Center the text
  },
  backButton: {
    padding: 4,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  // Vertical budget filters
  budgetFiltersVertical: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  budgetButtonVertical: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[300],
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
  budgetRangeDisplay: {
    ...theme.typography.caption,
    color: theme.colors.customGreen[500],
    textAlign: 'center',
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
    width: '100%',
  },
  // Adjusted grid container for vertical layout
  gridContainerVertical: {
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 16,
  },
  // Adjusted category cards for vertical layout
  categoryCardVertical: {
    padding: 12,
    backgroundColor: '#CAE1DB',
    aspectRatio: 1,
    minHeight: 100,
  },
  materialImage: {
    width: 80,
    height: 50,
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  // Material cards for vertical layout
  materialCardVertical: {
    width: '100%',
    backgroundColor: '#CAE1DB',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Empty state styles
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