import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable, LayoutChangeEvent, Platform, Easing, Image, ActivityIndicator } from "react-native";
import { theme } from "@/app/theme";
import { Card } from "./Card";
import { GridContainer } from "./GridContainer";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SolarRoof, Wall, CubeTransparent } from "phosphor-react-native";
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

// Material interfaces (remain same)
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

interface MaterialSectionProps {
  budgetMin: number[];
  budgetMax: number[];
  materials0?: any;
  materials1?: any;
  materials2?: any;
  isLandscape?: boolean;
  state: (data: boolean) => void;
  selectedBudgetTypeIndex: number; // New prop from parent
  onBudgetTypeChange: (index: number) => void; // New callback prop to parent
}

interface CategoryType {
  id: string;
  title: string;
  icon: React.ReactNode;
}

// Custom component for Material Card with loading indicator
interface MaterialCardProps {
  material: Material;
  style?: any;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.materialCard, style]}>
      <View style={styles.imageContainer}>
        {material.image && !hasError ? (
          <Image
            source={{ uri: material.image }}
            style={styles.materialImage}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.materialImage, styles.placeholderContainer]}>
            <MaterialIcons 
              name="image" 
              size={32} 
              color={theme.colors.customGray[100]} 
            />
          </View>
        )}
        
        {isLoading && material.image && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator 
              size="small" 
              color={theme.colors.customGreen[300]} 
            />
          </View>
        )}
      </View>
      
      <Text style={styles.materialTitle} numberOfLines={2}>
        {material.name}
      </Text>
      <Text style={styles.materialDescription} numberOfLines={1}>
        {material.subcategory}
      </Text>
    </View>
  );
};

export const MaterialSection: React.FC<MaterialSectionProps> = ({ 
  budgetMin = [300000, 500000, 1200000],
  budgetMax = [800000, 1500000, 3000000],
  materials0 = {}, 
  materials1 = {}, 
  materials2 = {}, 
  isLandscape = true, 
  state,
  selectedBudgetTypeIndex, // Destructure new prop
  onBudgetTypeChange       // Destructure new prop
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get('window');
  const panelHeight = height * 0.5;
  
  const originalAnimation = useRef(new Animated.Value(0)).current;
  const ekonomisAnimation = useRef(new Animated.Value(0)).current;
  const premiumAnimation = useRef(new Animated.Value(0)).current;
  
  const [budgetRangeWidths, setBudgetRangeWidths] = useState({
    original: 0,
    ekonomis: 0,
    premium: 0
  });

  const getBudgetIdFromIndex = useCallback((index: number): string => {
    if (index === 0) return 'ekonomis';
    if (index === 2) return 'premium';
    return 'original';
  }, []);
  
  const [currentDisplayBudget, setCurrentDisplayBudget] = useState<string>(() => getBudgetIdFromIndex(selectedBudgetTypeIndex));

  const formatPriceToRupiah = (price: number) => {
    if (price >= 1000000) {
      return `Rp${(price / 1000000).toFixed(1).replace('.', ',')} jt`;
    } else if (price >= 1000) {
      return `Rp${(price / 1000).toFixed(0)} rb`;
    }
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const getBudgetOptions = useCallback((): BudgetOption[] => {
    return [
      { 
        id: 'original', 
        title: 'Original', 
        priceRange: `${formatPriceToRupiah(budgetMin[1])} - ${formatPriceToRupiah(budgetMax[1])}`, 
        animation: originalAnimation,
        width: budgetRangeWidths.original || 110 
      },
      { 
        id: 'ekonomis', 
        title: 'Ekonomis', 
        priceRange: `${formatPriceToRupiah(budgetMin[0])} - ${formatPriceToRupiah(budgetMax[0])}`, 
        animation: ekonomisAnimation,
        width: budgetRangeWidths.ekonomis || 105
      },
      { 
        id: 'premium', 
        title: 'Premium', 
        priceRange: `${formatPriceToRupiah(budgetMin[2])} - ${formatPriceToRupiah(budgetMax[2])}`, 
        animation: premiumAnimation,
        width: budgetRangeWidths.premium || 95
      }
    ];
  }, [budgetMin, budgetMax, originalAnimation, ekonomisAnimation, premiumAnimation, budgetRangeWidths]);
  
  const categoryIcons: { [key: string]: React.ReactNode } = { // Assuming keys are lowercase
    'atap': <SolarRoof size={24} color={theme.colors.customGreen[300]} />,
    'dinding': <Wall size={24} color={theme.colors.customGreen[300]} />,
    'lantai': <MaterialCommunityIcons name="floor-plan" size={24} color={theme.colors.customGreen[300]} />,
    'bukaan': <MaterialIcons name="window" size={24} color={theme.colors.customGreen[300]} />,
    'balok-kolom': <CubeTransparent size={24} color={theme.colors.customGreen[300]} />
  };

  const animateBudgetSelection = useCallback((budgetId: string, animate = true) => {
    const options = getBudgetOptions();
    const animations = options.map(budget => {
      const toValue = budget.id === budgetId ? 1 : 0;
      return Animated.timing(budget.animation!, {
        toValue,
        duration: animate ? 200 : 0,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      });
    });
    Animated.parallel(animations).start();
  }, [getBudgetOptions]);

  useEffect(() => {
    const budgetIdFromProp = getBudgetIdFromIndex(selectedBudgetTypeIndex);
    if (currentDisplayBudget !== budgetIdFromProp) {
      setCurrentDisplayBudget(budgetIdFromProp);
      animateBudgetSelection(budgetIdFromProp, true);
    }
  }, [selectedBudgetTypeIndex, getBudgetIdFromIndex, currentDisplayBudget, animateBudgetSelection]);
  
  useEffect(() => {
    if (isOpen) {
      Animated.timing(panelAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
    animateBudgetSelection(currentDisplayBudget, false); // Initial animation for budget buttons
  }, [isOpen]); // Only re-run if isOpen changes for panel; budget animation runs once based on initial currentDisplayBudget

  const closePanel = () => {
    Animated.timing(panelAnimation, {
      toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }).start(() => {
      setIsOpen(false); setSelectedCategory(null); state(false);
    });
  };

  const handleCategorySelect = (categoryId: string) => setSelectedCategory(categoryId);

  const handleBudgetSelect = (budgetId: string) => {
    let index = 1; // Default to original
    if (budgetId === 'ekonomis') index = 0;
    else if (budgetId === 'premium') index = 2;
    onBudgetTypeChange(index); // Notify parent
  };

  const measureBudgetRangeWidth = (budgetId: string, event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setBudgetRangeWidths(prev => ({ ...prev, [budgetId]: width + 2 }));
  };

  const transformMaterialsToArray = (materialsObj: any): MaterialCategory[] => {
    if (!materialsObj || typeof materialsObj !== 'object') return []; // Added type check
    return Object.keys(materialsObj).map(categoryName => ({
      category: categoryName,
      subCategories: Object.keys(materialsObj[categoryName]).map(subCategoryName => ({
        subCategory: subCategoryName,
        materials: materialsObj[categoryName][subCategoryName].map((material: any) => ({
          id: material.id, name: material.name, category: categoryName,
          subcategory: subCategoryName, image: material.image
        }))
      }))
    }));
  };

  const getAllCategories = (): CategoryType[] => {
    const categoriesSet = new Set<string>();
    [materials0, materials1, materials2].forEach(matGroup => {
        transformMaterialsToArray(matGroup).forEach(category => {
            categoriesSet.add(category.category.toLowerCase());
        });
    });
    return Array.from(categoriesSet).map(category => ({
      id: category,
      title: category.charAt(0).toUpperCase() + category.slice(1),
      icon: categoryIcons[category] || <MaterialIcons name="category" size={24} color={theme.colors.customGreen[300]} />
    }));
  };

  const getBudgetMaterialsIndex = (budgetId: string): number => {
    if (budgetId === 'ekonomis') return 0;
    if (budgetId === 'premium') return 2;
    return 1; // original
  };

  const getMaterialsForCategory = () => {
    if (!selectedCategory) return [];
    const budgetIndex = getBudgetMaterialsIndex(currentDisplayBudget); // Use currentDisplayBudget
    const materialsByBudget = budgetIndex === 0 ? transformMaterialsToArray(materials0) : 
                              budgetIndex === 1 ? transformMaterialsToArray(materials1) : 
                                                  transformMaterialsToArray(materials2);
    const categoryData = materialsByBudget.find(cat => cat.category.toLowerCase() === selectedCategory.toLowerCase());
    if (!categoryData) return [];
    let allMaterials: Material[] = [];
    categoryData.subCategories.forEach(subCat => { allMaterials = [...allMaterials, ...subCat.materials]; });
    return allMaterials;
  };

  const hasMaterialData = () => getMaterialsForCategory().length > 0;
  // getCurrentBudgetPriceRange not strictly needed if parent controls budget display
  const getNumColumns = () => Math.min(getMaterialsForCategory().length === 0 ? 1 : getMaterialsForCategory().length, 4);

  const translateY = panelAnimation.interpolate({ inputRange: [0, 1], outputRange: [panelHeight, 0], extrapolate: 'clamp' });

  const renderBudgetButtons = () => {
    const budgetOptionsToRender = getBudgetOptions();
    return budgetOptionsToRender.map((budget) => {
      const isSelected = currentDisplayBudget === budget.id;
      const fixedWidth = budget.width || 0;
      const rangeWidth = budget.animation!.interpolate({ inputRange: [0, 1], outputRange: [0, fixedWidth + 20], extrapolate: 'clamp' });
      const rangeOpacity = budget.animation!.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' });
      
      return (
        <Pressable key={budget.id} style={[styles.budgetButton, isSelected && styles.selectedBudgetButton]} onPress={() => handleBudgetSelect(budget.id)}>
          <Text style={[styles.budgetButtonText, isSelected && styles.selectedBudgetButtonText]} numberOfLines={1}>{budget.title}</Text>
          <Animated.View style={{ width: rangeWidth, opacity: rangeOpacity, overflow: 'hidden' }}>
            <Text style={[styles.budgetRangeText, isSelected && styles.selectedBudgetButtonText]} numberOfLines={1}>({budget.priceRange})/m²</Text>
          </Animated.View>
        </Pressable>
      );
    });
  };

  const getContainerWidth = () => { 
    const materials = getMaterialsForCategory();
    const numColumns = getNumColumns();
    if (materials.length === 0) return '100%';
    
    const cardWidth = 160;
    const spacing = 16;
    const totalWidth = (cardWidth * numColumns) + (spacing * (numColumns - 1));
    
    return totalWidth;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="help" size={48} color={theme.colors.customGray[100]} />
      <Text style={styles.emptyStateMessage}>
        Mohon maaf, saat ini belum ada material {selectedCategory} untuk kategori budget {currentDisplayBudget}.
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        {getBudgetOptions().map(budget => (
          <Text key={`measure-${budget.id}`} style={styles.budgetRangeText} onLayout={(event) => measureBudgetRangeWidth(budget.id, event)}>
            ({budget.priceRange})
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.panel, { height: panelHeight, transform: [{ translateY }] }]} renderToHardwareTextureAndroid={true} shouldRasterizeIOS={true}>
        <View style={styles.panelHeader}>
            {selectedCategory && (
              <Pressable onPress={() => setSelectedCategory(null)} style={styles.backButton}>
                <MaterialIcons name="chevron-left" size={24} color={theme.colors.customGreen[300]} />
              </Pressable>
            )}
            <Text style={styles.panelTitle}>
              {selectedCategory ? (getAllCategories().find(cat => cat.id === selectedCategory)?.title || 'Material') : "Material"}
            </Text>
          <View style={styles.headerRightSection}>
            <View style={styles.budgetFilterContainer}>{renderBudgetButtons()}</View>
            <Pressable onPress={closePanel} style={styles.closeButton}><MaterialIcons name="close" size={24} color={theme.colors.customGreen[300]} /></Pressable>
          </View>
        </View>

        <ScrollView style={styles.panelContent} removeClippedSubviews={Platform.OS === 'android'} showsVerticalScrollIndicator={false} contentContainerStyle={selectedCategory && !hasMaterialData() ? {flex: 1} : {}}>
          {!selectedCategory ? (
            <GridContainer data={getAllCategories()} numColumns={5} columnSpacing={8} rowSpacing={8} renderItem={(item) => (<Card icon={item.icon} title={item.title} onButtonPress={() => handleCategorySelect(item.id)} showButton={false} style={styles.categoryCard}/>)}/>
          ) : !hasMaterialData() ? ( renderEmptyState() ) : (
            <View style={styles.materialsContainer}>
              {getNumColumns() > 1 ? (
                <GridContainer 
                  data={getMaterialsForCategory()} 
                  numColumns={getNumColumns()} 
                  columnSpacing={16} 
                  renderItem={(item) => <MaterialCard material={item} />}
                  contentContainerStyle={[styles.gridContainer, { width: getContainerWidth() }]}
                />
              ) : (getMaterialsForCategory().length > 0 &&
                <View style={{alignSelf: 'center'}}>
                  <MaterialCard material={getMaterialsForCategory()[0]} />
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
  // Existing styles remain the same
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
  headerRightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  panelTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    flex: Platform.OS === 'ios' ? 0.25 : 0.2,
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
  budgetFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
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
    minWidth: 75,
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
    backgroundColor: '#CAE1DB'
  },
  
  // Updated material card styles
  materialCard: {
    width: '100%',
    maxWidth: 160,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#CAE1DB',
    alignItems: 'center',
    borderRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 60,
    marginBottom: 8,
  },
  materialImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
  },
  placeholderContainer: {
    backgroundColor: theme.colors.customGray[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  materialTitle: {
    ...theme.typography.body2,
    fontWeight: '600',
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 4,
  },
  materialDescription: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
    textAlign: 'center',
  },
  
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