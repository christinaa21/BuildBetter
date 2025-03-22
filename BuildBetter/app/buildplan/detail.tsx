import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import Button from '@/component/Button';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';

const HouseResultPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // For production, this would come from your API
  // Use a public model URL that is known to work for testing
  const modelUri = 'https://c7ff-180-254-76-163.ngrok-free.app/assets/rumah.glb';
  
  const goBack = () => {
    router.back();
  };

  const handleSaveDesign = () => {
    // Implement saving logic here
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

  // Render landscape layout
  if (isLandscape) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landscapeContainer}>
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
            
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
            </View>
          </View>

          <MaterialIcons name="chevron-left" size={40} color={theme.colors.customOlive[50]} style={styles.landscapeBackButton}/>
          <View style={styles.landscapeHeader}>
            <Text style={[styles.title, theme.typography.title]}>Saran 1</Text>
            <View style={styles.tabs}>
              <Button 
                title="3D Rumah" 
                variant="outline"
                onPress={() => console.log('View materials')}
                minHeight={20}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
              <Button 
                title="Denah" 
                variant="outline"
                onPress={() => console.log('View materials')}
                minHeight={8}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
            </View>
          </View>
          
          <View style={styles.landscapeRightSidebar}>
            <View style={styles.budgetInfoRight}>
              <Text style={[styles.infoLabelRight, theme.typography.caption]}>Kisaran Budget</Text>
              <Text style={[styles.infoValueRight, theme.typography.subtitle2]}>Rp500 - 900 juta</Text>
            </View>
            <Button 
              title="Simpan" 
              variant="primary"
              icon = {<MaterialIcons name="bookmark" size={16}/>}
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
              icon = {<MaterialIcons name="grid-view" size={16}/>}
              iconPosition='left'
              onPress={() => console.log('View materials')}
              minHeight={10}
              minWidth={50}
              paddingHorizontal={16}
              paddingVertical={8}
            />
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
          <Text style={[styles.title, theme.typography.title]}>Saran 1</Text>
            <View style={styles.tabs}>
              <Button 
                title="3D Rumah" 
                variant="outline"
                onPress={() => console.log('View materials')}
                minHeight={20}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
              <Button 
                title="Denah" 
                variant="outline"
                onPress={() => console.log('View materials')}
                minHeight={8}
                minWidth={50}
                paddingVertical={4}
                paddingHorizontal={12}
              />
            </View>
        </View>

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
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.budgetInfo}>
            <Text style={[styles.infoLabel, theme.typography.body2]}>Kisaran Budget</Text>
            <Text style={[styles.infoValue, theme.typography.subtitle1]}>Rp500 - 900 juta</Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <Button 
              title="Material" 
              variant="outline"
              onPress={() => console.log('View materials')}
              style={styles.materialButton}
            />
            
            <Button 
              title="Simpan" 
              variant="primary"
              onPress={handleSaveDesign}
              style={styles.saveButton}
            />
          </View>
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
    paddingBottom: 10,
  },
  title: {
    marginLeft: 4,
    marginBottom: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
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
    padding: 20,
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
  buttonGroup: {
    flexDirection: 'row',
  },
  materialButton: {
    marginRight: 10,
  },
  saveButton: {
    minWidth: 100,
  },
  
  // Add these to your StyleSheet:
  landscapeContainer: {
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  landscapeBackButton: {
    position: 'absolute',
    top: '1%',
    left: '1%',
    zIndex: 10,
  },
  landscapeHeader: {
    position: 'absolute',
    top: '3%',
    left: '6%',
    zIndex: 10,
  },
  landscapeViewerContainer: {
    flex: 1,
    position: 'relative',
    padding: 8,
  },
  landscapeRightSidebar: {
    position: 'absolute',
    top: '2%',
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
  infoLabelRight: {
    color: theme.colors.customOlive[50],
  },
  infoValueRight: {
    color: theme.colors.customGreen[300],
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: '6%',
    left: '6%',
  },
  copyrightText: {
    color: theme.colors.customGray[200],
  },
});

export default HouseResultPage;