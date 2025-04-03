import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import FloorplanViewer from '@/component/FloorplanViewer';
import Button from '@/component/Button';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialSection } from '@/component/MaterialSection';
import { MaterialSectionVertical } from '@/component/MaterialSectionVertical';

const HouseResultPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [showMaterials, setShowMaterials] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // For production, this would come from your API
  const modelUri = 'https://d2bd-180-254-69-155.ngrok-free.app/assets/rumah.glb';
  
  // Sample floorplan data - in a real app, this would come from your API
  const floorplans = [
    {
      id: 1,
      floor: 1,
      name: 'Lantai 1',
      source: require('@/assets/images/denah1.png'),
      orientation: 'horizontal' as 'horizontal'
    },
    {
      id: 2,
      floor: 2,
      name: 'Lantai 2',
      source: require('@/assets/images/denah2.png'),
      orientation: 'horizontal' as 'horizontal'
    },
  ];

  const goBack = () => {
    if (showMaterials) {
      setShowMaterials(false);
      return;
    }
    router.back();
  };

  const handleSaveDesign = () => {
    Alert.alert('Success', 'Design has been saved successfully');
    console.log('Design saved');
  };

  // Function to verify the model URL is accessible
  const verifyModelUrl = async () => {
    try {
      const response = await fetch(modelUri, {
        method: 'HEAD',
        headers: {
          'ngrok-skip-browser-warning': '1',
          'User-Agent': 'ReactNativeApp'
        }
      });
      
      if (!response.ok) {
        console.error('Model URL is not accessible:', response.status);
        setErrorMsg(`Yah, model 3Dnya belum bisa tampil saat ini.\n Coba lagi nanti yaa! (Error code: ${response.status})`);
      } else {
        console.log('Model URL is accessible');
        setErrorMsg(null);
      }
    } catch (error) {
      console.error('Error checking model URL:', error);
      setErrorMsg('Sepertinya koneksimu sedang bermasalah nih. Coba cek internetmu yaa!');
    }
  };

  // Set up orientation control when component mounts
  useEffect(() => {
    const setupOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        
        setTimeout(async () => {
          await ScreenOrientation.unlockAsync();
        }, 5000);
      } catch (error) {
        console.error('Failed to manage orientation:', error);
      }
    };
  
    setupOrientation();
    verifyModelUrl();
  
    return () => {
      const lockPortrait = async () => {
        try {
          // Lock back to portrait when leaving this screen
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

  useEffect(() => {
    setShowMaterials(false);
  }, [isLandscape]);

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
                  modelUri={modelUri}
                />
              )}

              {showMaterials && (
                <MaterialSection
                  isLandscape={isLandscape}
                  state={(data: boolean) => setShowMaterials(data)}
                />
              )}
              
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
              </View>
            </View>
          ) : (
            <View style={styles.landscapeViewerContainer}>
              <FloorplanViewer floorplans={floorplans} isLandscape={true} />
              
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={goBack} style={styles.landscapeBackButton}>
            <MaterialIcons name="chevron-left" size={40} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          
          <View style={styles.landscapeHeader}>
            <Text style={[styles.title, theme.typography.title]}>Saran 1</Text>
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

          <View style={styles.landscapeRightSidebar}>
            <View style={styles.budgetInfoRight}>
              <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.caption]}>Kisaran Budget</Text>
              <Text style={[{color: theme.colors.customGreen[300]}, theme.typography.subtitle2]}>Rp500 - 900 juta</Text>
            </View>
            
            {is3D ? (
              <>
                <Button 
                  title="Simpan" 
                  variant="primary"
                  icon={<MaterialIcons name="bookmark" size={16}/>}
                  iconPosition='left'
                  onPress={handleSaveDesign}
                  minHeight={10}
                  minWidth={50}
                  paddingHorizontal={16}
                  paddingVertical={6}
                />
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
              </>
            ) : (
              <Button 
                title="Simpan" 
                variant="primary"
                icon={<MaterialIcons name="bookmark" size={16}/>}
                iconPosition='left'
                onPress={handleSaveDesign}
                minHeight={10}
                minWidth={50}
                paddingHorizontal={16}
                paddingVertical={6}
              />
            )}
          </View>
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
          <Text style={[styles.title, theme.typography.title]}>Saran 1</Text>
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
                modelUri={modelUri}
              />
            )}

            {showMaterials && (
              <MaterialSectionVertical
                isLandscape={isLandscape}
                state={(data: boolean) => setShowMaterials(data)}
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
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
            </View>
          </View>
        ) : (
          <View style={styles.viewerContainer}>
            <FloorplanViewer floorplans={floorplans} isLandscape={false} />
              
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.budgetInfo}>
            <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.body2]}>Kisaran Budget</Text>
            <Text style={[{color: theme.colors.customGreen[400]}, theme.typography.subtitle1]}>Rp500 - 900 juta</Text>
          </View>
          
          <Button 
            title="Simpan" 
            variant="primary"
            icon={<MaterialIcons name="bookmark" size={16}/>}
            iconPosition='left'
            onPress={handleSaveDesign}
            minHeight={10}
            minWidth={50}
            paddingHorizontal={16}
            paddingVertical={6}
          />
        </View>
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
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
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
});

export default HouseResultPage;