import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import Button from '@/component/Button';

const HouseResultPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the useWindowDimensions hook to get current screen dimensions
  const { width, height } = useWindowDimensions();
  
  // Determine if the orientation is landscape
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
        setErrorMsg(`Yah, model 3Dnya belum bisa tampil saat ini. Coba lagi nanti yaa! (Error code: ${response.status})`);
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
        // First lock to landscape orientation when entering the page
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        
        setTimeout(async () => {
          await ScreenOrientation.unlockAsync();
        }, 5000); // 5000ms = 5 seconds
      } catch (error) {
        console.error('Failed to manage orientation:', error);
      }
    };
  
    // Run setup and verify model URL
    setupOrientation();
    verifyModelUrl();
  
    // Clean up function remains the same
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

  // Log orientation changes for debugging
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  // Render landscape layout
  if (isLandscape) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landscapeContainer}>
          <View style={styles.landscapeHeader}>
            <Text style={styles.title}>Saran 1</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>3D Rumah</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Denah</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.landscapeViewerContainer}>
            {errorMsg ? (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>{errorMsg}</Text>
                <Button 
                  title="Retry" 
                  variant="primary"
                  onPress={verifyModelUrl}
                  style={styles.retryButton}
                />
              </View>
            ) : (
              <HouseViewer 
                modelUri={modelUri} 
                onClose={goBack}
              />
            )}
            
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>≡</Text>
            </TouchableOpacity>
            
            <View style={styles.copyrightContainer}>
              <Text style={styles.copyrightText}>© Designed by Naila Juniah</Text>
            </View>
          </View>
          
          <View style={styles.landscapeRightSidebar}>
            <View style={styles.budgetInfoRight}>
              <Text style={styles.infoLabelRight}>Kisaran Budget</Text>
              <Text style={styles.infoValueRight}>Rp500 - 900 juta</Text>
            </View>
            
            <View style={styles.landscapeButtonGroup}>
              <Button 
                title="Material" 
                variant="outline"
                onPress={() => console.log('View materials')}
                style={styles.materialButtonRight}
              />
              
              <Button 
                title="Simpan" 
                variant="primary"
                onPress={handleSaveDesign}
                style={styles.saveButtonRight}
              />
            </View>
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
          <Text style={styles.title}>Saran 1</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>3D Rumah</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Denah</Text>
            </View>
          </View>
        </View>

        <View style={styles.viewerContainer}>
          {errorMsg ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>{errorMsg}</Text>
              <Button 
                title="Retry" 
                variant="primary"
                onPress={verifyModelUrl}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <HouseViewer 
              modelUri={modelUri} 
              onClose={goBack}
            />
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.budgetInfo}>
            <Text style={styles.infoLabel}>Kisaran Budget</Text>
            <Text style={styles.infoValue}>Rp500 - 900 juta</Text>
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#4CAF50',
    fontWeight: '500',
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
    padding: 15,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
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
  landscapeHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  landscapeViewerContainer: {
    flex: 1,
    position: 'relative',
    padding: 8,
  },
  landscapeRightSidebar: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  budgetInfoRight: {
    backgroundColor: '#F8FFF8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoLabelRight: {
    fontSize: 14,
    color: '#757575',
  },
  infoValueRight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  landscapeButtonGroup: {
    alignItems: 'flex-end',
  },
  materialButtonRight: {
    margin: 10,
  },
  saveButtonRight: {
    margin: 10,
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    top: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#184D29',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  menuButtonText: {
    fontSize: 20,
    color: 'white',
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#555555',
  },
});

export default HouseResultPage;