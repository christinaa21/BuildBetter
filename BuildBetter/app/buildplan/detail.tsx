import React, { useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import HouseViewer from '@/component/HouseViewer';
import Button from '@/component/Button';

const HouseResultPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // For production, this would come from your API
  // Use a public model URL that is known to work for testing
  const modelUri = 'https://7caf-182-2-167-85.ngrok-free.app/assets/rumah.glb';
  
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
        setErrorMsg(`Model is not accessible (${response.status}). Please check the URL.`);
      } else {
        console.log('Model URL is accessible');
        setErrorMsg(null);
      }
    } catch (error) {
      console.error('Error checking model URL:', error);
      setErrorMsg('Could not verify model URL. Please check your connection.');
    }
  };

  // Verify the model URL when component mounts
  React.useEffect(() => {
    verifyModelUrl();
  }, []);

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
    backgroundColor: '#F5F5F5',
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
});

export default HouseResultPage;