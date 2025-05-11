import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import FloorplanViewer from '@/component/FloorplanViewer';
import Button from '@/component/Button';
import { theme } from '@/app/theme';
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
  
  // Add states for notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'save' | 'download'>('download');
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // For production, this would come from your API
  const modelUri = 'https://966f-180-254-72-168.ngrok-free.app/assets/17.glb';
  
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
      console.log('PDF downloaded');
      // Here you would make your API call to download PDF
      // downloadPDF().then(...).catch(...);
    }
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

  // Helper function to get notification message based on type
  const getNotificationMessage = () => {
    return notificationType === 'save' 
      ? 'Desain berhasil disimpan'
      : 'PDF berhasil diunduh';
  };

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
              <Text style={[{color: theme.colors.customGreen[300]}, theme.typography.subtitle2]}>Rp500 - 900 juta</Text>
            </View>
            
            <Button 
              title="Unduh PDF" 
              variant="primary"
              icon={<MaterialIcons name="download" size={16}/>}
              iconPosition='left'
              onPress={() => handleAction('download')}
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
});

export default HouseResultPage;