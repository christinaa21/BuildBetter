import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity, Animated, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import FloorplanViewer from '@/component/FloorplanViewer';
import Button from '@/component/Button';
import { theme } from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialSection } from '@/component/MaterialSection';
import { MaterialSectionVertical } from '@/component/MaterialSectionVertical';

// Type definitions
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

interface Suggestion {
  id: string;
  houseNumber: number | string;
  landArea: number;
  buildingArea: number;
  style: string;
  floor: number;
  rooms: number;
  buildingHeight: number;
  designer: string;
  defaultBudget: number;
  budgetMin: number[]; // budgetMin[0] for ekonomis, budgetMin[1] for original, and budgetMin[2] for premium
  budgetMax: number[]; // same like budgetMin but this one for the max
  floorplans: Array<string>; // array of floorplans url
  object: string; // 3D house design, in url
  houseImageFront: string; // image url
  houseImageSide: string; // image url
  houseImageBack: string; // image url
  pdf: string; // pdf url
  materials0: MaterialCategory[]; // ekonomis
  materials1: MaterialCategory[]; // original
  materials2: MaterialCategory[]; // premium
}

interface UserInput {
  province: string;
  city: string;
  landform: string;
  landArea: number;
  entranceDirection: string;
  style: string;
  floor: number;
  rooms: number;
}

interface FloorplanData {
  id: number;
  floor: number;
  name: string;
  source: any; // Either a require() or a {uri: string}
  orientation: 'horizontal' | 'vertical';
}

const HouseDetailPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [showMaterials, setShowMaterials] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Add states for notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'save' | 'download'>('download');
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Parse params on component mount
  React.useEffect(() => {
    try {
      if (params.suggestion) {
        const parsedSuggestion = JSON.parse(params.suggestion as string);
        setSuggestion(parsedSuggestion);
      }
      
      if (params.userInput) {
        const parsedUserInput = JSON.parse(params.userInput as string);
        setUserInput(parsedUserInput);
      }
    } catch (error) {
      console.error('Error parsing params:', error);
      setErrorMsg('Error loading house details. Please try again.');
    }
  }, [params.suggestion, params.userInput]);

  // Generate floorplan data from the suggestion
  const floorplans: FloorplanData[] = React.useMemo(() => {
    if (!suggestion || !suggestion.floorplans || suggestion.floorplans.length === 0) {
      return [];
    }
    
    return suggestion.floorplans.map((floorplanUrl, index) => ({
      id: index + 1,
      floor: index + 1,
      name: `Lantai ${index + 1}`,
      source: { uri: floorplanUrl },
      orientation: 'horizontal' as 'horizontal'
    }));
  }, [suggestion]);

  const goBack = useCallback(() => {
    if (showMaterials) {
      setShowMaterials(false);
      return;
    }
    router.back();
  }, [showMaterials, router]);

  // Animation functions for the notification
  const showNotificationAnimation = (type: 'save' | 'download') => {
    setNotificationType(type);
    setShowNotification(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Show for 2 seconds
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowNotification(false);
    });
  };

  const handleAction = (action: 'save' | 'download') => {
    // Show success notification
    showNotificationAnimation(action);
    
    if (action === 'save') {
      console.log('Design saved');
      // Here you would make your API call to save the design
      // saveDesign().then(...).catch(...);
    } else {
      if (suggestion?.pdf) {
        Linking.openURL(suggestion.pdf).catch(err => {
          console.error('Failed to open PDF', err);
          Alert.alert('Error', 'Could not open PDF. Please try again later.');
        });
      }
      console.log('PDF downloaded');
    }
  };

  // Function to verify the model URL is accessible
  const verifyModelUrl = useCallback(async () => {
    if (!suggestion?.object || errorMsg?.includes(suggestion.object)) return;

    try {
      const response = await fetch(suggestion.object, {
        method: 'HEAD',
        headers: {
          'ngrok-skip-browser-warning': '1',
          'User-Agent': 'ReactNativeApp'
        }
      });
      
      if (!response.ok) {
        setErrorMsg(`Yah, model 3Dnya belum bisa tampil... (Error: ${response.status})`);
      }
    } catch (error) {
      setErrorMsg('Koneksi bermasalah. Cek internetmu!');
    }
  }, [suggestion?.object, errorMsg]);

  // Set up orientation control when component mounts
  React.useEffect(() => {
    const setupOrientation = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.error('Failed to unlock orientation:', error);
      }
    };

    setupOrientation();

    return () => {
      const lockPortrait = async () => {
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
        } catch (error) {
          console.error('Failed to lock orientation:', error);
        }
      };
      lockPortrait();
    };
  }, []);

  // Separate useEffect for model verification
  React.useEffect(() => {
    if (suggestion?.object) {
      verifyModelUrl();
    }
  }, [suggestion?.object, verifyModelUrl]);

  useEffect(() => {
    setShowMaterials(false);
  }, [isLandscape]);

  // Format budget range to display
  const formatBudgetRange = (forLandscape: boolean = true) => {
    if (!suggestion) return '';
    
    const formatCurrency = (amount: number) => {
      if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(3)} miliar`;
      } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} juta`;
      }
      return amount.toString();
    };
    
    // Using the default budget index (usually 1 for original)
    const defaultIndex = 1;
    const minBudget = suggestion.budgetMin[defaultIndex];
    const maxBudget = suggestion.budgetMax[defaultIndex];
    
    const formattedMin = `Rp${formatCurrency(minBudget * suggestion.buildingArea)}`;
    const formattedMax = `Rp${formatCurrency(maxBudget * suggestion.buildingArea)}`;
    
    // Different formatting for landscape and portrait
    return forLandscape 
      ? `${formattedMin} - ${formattedMax}`
      : `${formattedMin} -\n${formattedMax}`;
  };

  // Helper function to get notification message based on type
  const getNotificationMessage = () => {
    return notificationType === 'save' 
      ? 'Desain berhasil disimpan'
      : 'PDF berhasil diunduh';
  };

  // If there's no suggestion data yet, show loading
  if (!suggestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading house details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render landscape layout
  if (isLandscape) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landscapeContainer}>
          {is3D ? (
            <View style={styles.landscapeViewerContainer}>
              {errorMsg ? (
                <View style={styles.errorMessageContainer}>
                  <Text style={styles.errorMessageText}>{errorMsg}</Text>
                  <Button 
                    title="Muat Ulang" 
                    variant="primary"
                    onPress={verifyModelUrl}
                  />
                </View>
              ) : (
                <HouseViewer 
                  modelUri={suggestion.object}
                />
              )}

              {showMaterials && suggestion && (
                <MaterialSection
                  isLandscape={isLandscape}
                  state={(data: boolean) => setShowMaterials(data)}
                  budgetMin={suggestion.budgetMin}
                  budgetMax={suggestion.budgetMax}
                  materials0={suggestion.materials0}
                  materials1={suggestion.materials1}
                  materials2={suggestion.materials2}
                />
              )}
              
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by {suggestion.designer || 'Naila Juniah'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.landscapeViewerContainer}>
              <FloorplanViewer floorplans={floorplans} isLandscape={true} />
              
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by {suggestion.designer || 'Naila Juniah'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={goBack} style={styles.landscapeBackButton}>
            <MaterialIcons name="chevron-left" size={40} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          
          <View style={styles.landscapeHeader}>
            <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
            <View style={styles.tabs}>
              <Button 
                title="3D Rumah" 
                variant="outline"
                onPress={() => setIs3D(true)}
                selected={is3D}
                minHeight={20}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
              <Button 
                title="Denah" 
                variant="outline"
                onPress={() => setIs3D(false)}
                selected={!is3D}
                minHeight={8}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
            </View>
          </View>

          {is3D && (
            <Button 
              title="Material" 
              variant="outline"
              icon={<MaterialIcons name="grid-view" size={16}/>}
              iconPosition='left'
              onPress={() => setShowMaterials(!showMaterials)}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={6}
              style={{position: 'absolute', right: '70%', bottom: '60%'}}
            />
          )}

          <View style={styles.landscapeRightSidebar}>
            <View style={styles.budgetInfoRight}>
              <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.caption]}>Kisaran Budget</Text>
              <Text style={[{color: theme.colors.customGreen[300]}, theme.typography.subtitle2]}>{formatBudgetRange()}</Text>
            </View>
            
            <Button 
              title="Unduh PDF" 
              variant="primary"
              icon={<MaterialIcons name="download" size={16}/>}
              iconPosition='left'
              onPress={() => handleAction('download')}
              disabled={!suggestion?.pdf}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={6}
            />
            <Button 
              title="Simpan" 
              variant="outline"
              icon={<MaterialIcons name="bookmark" size={16}/>}
              iconPosition='left'
              onPress={() => handleAction('save')}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={6}
            />
          </View>
          
          {/* Show notification if active */}
          {showNotification && (
            <Animated.View style={[
              styles.notificationContainer,
              { opacity: fadeAnim, top: isLandscape? '80%' : '14%' }
            ]}>
              <View style={styles.notificationContent}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.customWhite[50]} />
                <Text style={styles.notificationText}>  {getNotificationMessage()}</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Default portrait layout
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={32} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
          <View style={styles.tabs}>
            <Button 
              title="3D Rumah" 
              variant="outline"
              onPress={() => setIs3D(true)}
              selected={is3D}
              minHeight={20}
              minWidth={50}
              paddingVertical={4}
              paddingHorizontal={12}
            />
            <Button 
              title="Denah" 
              variant="outline"
              onPress={() => setIs3D(false)}
              selected={!is3D}
              minHeight={8}
              minWidth={50}
              paddingVertical={4}
              paddingHorizontal={12}
            />
          </View>
        </View>

        {is3D ? (
          <View style={styles.viewerContainer}>
            {errorMsg ? (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>{errorMsg}</Text>
                <Button 
                  title="Muat Ulang" 
                  variant="primary"
                  onPress={verifyModelUrl}
                />
              </View>
            ) : (
              <HouseViewer 
                modelUri={suggestion.object}
              />
            )}

            {showMaterials && suggestion && (
              <MaterialSectionVertical
                isLandscape={isLandscape}
                state={(data: boolean) => setShowMaterials(data)}
                budgetMin={suggestion.budgetMin}
                budgetMax={suggestion.budgetMax}
                materials0={suggestion.materials0}
                materials1={suggestion.materials1}
                materials2={suggestion.materials2}
              />
            )}

            <View style={styles.materialButton}>
              <Button 
                title="Material" 
                variant="outline"
                icon={<MaterialIcons name="grid-view" size={16}/>}
                iconPosition='left'
                onPress={() => setShowMaterials(!showMaterials)}
                minHeight={10}
                minWidth={50}
                paddingHorizontal={16}
                paddingVertical={8}
              />
            </View>
            
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by {suggestion.designer || 'Naila Juniah'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.viewerContainer}>
            <FloorplanViewer floorplans={floorplans} isLandscape={false} />
              
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by {suggestion.designer || 'Naila Juniah'}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.budgetInfo}>
            <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.body2]}>Kisaran Budget</Text>
            <Text style={[{color: theme.colors.customGreen[400]}, theme.typography.subtitle1]}>{formatBudgetRange()}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              title="Simpan" 
              variant="outline"
              icon={<MaterialIcons name="bookmark" size={16}/>}
              iconPosition='left'
              onPress={() => handleAction('save')}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={6}
            />
            <Button 
              title="Unduh PDF" 
              variant="primary"
              icon={<MaterialIcons name="download" size={16}/>}
              iconPosition='left'
              onPress={() => handleAction('download')}
              disabled={!suggestion?.pdf}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={6}
            />
          </View>
        </View>
        
        {/* Show notification if active */}
        {showNotification && (
          <Animated.View style={[
            styles.notificationContainer,
            { opacity: fadeAnim, top: isLandscape? '80%' : '14%' }
          ]}>
            <View style={styles.notificationContent}>
              <MaterialIcons name="check-circle" size={24} color={theme.colors.customWhite[50]} />
              <Text style={styles.notificationText}>  {getNotificationMessage()}</Text>
            </View>
          </Animated.View>
        )}
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
  },
  title: {
    marginLeft: 40,
    marginBottom: 4,
    color: theme.colors.customOlive[50]
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    marginLeft: 40,
  },
  viewerContainer: {
    flex: 1,
  },
  errorMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessageText: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  budgetInfo: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: '2%',
    left: '6%',
  },
  materialButton: {
    position: 'absolute',
    right: 22,
    paddingVertical: 8,
    bottom: '1%'
  },
  
  // Landscape styles
  landscapeContainer: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  landscapeBackButton: {
    position: 'absolute',
    top: '2%',
    left: '1%',
    zIndex: 10,
  },
  landscapeHeader: {
    position: 'absolute',
    top: '4%',
    left: '6%',
    zIndex: 10,
  },
  landscapeViewerContainer: {
    flex: 1,
    position: 'relative',
    paddingVertical: 8,
  },
  landscapeRightSidebar: {
    position: 'absolute',
    top: '4%',
    right: '2%',
    zIndex: 10,
    alignItems: 'flex-end',
    gap: 12,
  },
  budgetInfoRight: {
    backgroundColor: '#ECFAF6',
    padding: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  landscapeCopyrightContainer: {
    position: 'absolute',
    bottom: '6%',
    left: '6%',
  },
  copyrightText: {
    color: theme.colors.customGray[200],
  },
  notificationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 25, 23, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: theme.colors.customWhite[50],
    ...theme.typography.body2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HouseDetailPage;