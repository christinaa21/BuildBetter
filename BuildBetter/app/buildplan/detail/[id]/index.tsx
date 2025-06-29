import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Alert, useWindowDimensions, TouchableOpacity, Animated, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import HouseViewer from '@/component/HouseViewer';
import FloorplanViewer from '@/component/FloorplanViewer';
import Button from '@/component/Button';
import { theme } from '@/app/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialSection } from '@/component/MaterialSection';
import { MaterialSectionVertical } from '@/component/MaterialSectionVertical'; // Assuming this component exists and will accept similar props
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { plansApi } from '@/services/api';

// Type definitions (remain the same)
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
  budgetMin: number[];
  budgetMax: number[];
  floorplans: Array<string>;
  object: string;
  houseImageFront: string;
  houseImageSide: string;
  houseImageBack: string;
  pdf: string;
  materials0: MaterialCategory[];
  materials1: MaterialCategory[];
  materials2: MaterialCategory[];
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
  source: any;
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
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'save' | 'download' | 'already_saved'>('download');
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);

  // State for selected budget type: 0 for Ekonomis, 1 for Original, 2 for Premium
  const [selectedBudgetTypeIndex, setSelectedBudgetTypeIndex] = useState<number>(1);

  React.useEffect(() => {
    try {
      if (params.planDetails) {
        const parsedPlan = JSON.parse(params.planDetails as string);
        setSuggestion(parsedPlan.suggestions);
        setUserInput(parsedPlan.userInput);
        setIsAlreadySaved(true);
        setIsCheckingSaved(false);
        // Consider loading saved budget type index if available in parsedPlan
        return;
      }

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
      setErrorMsg('Gagal memuat detail rumah. Silakan coba lagi.');
    }
  }, [params.suggestion, params.userInput, params.planDetails]);

  useEffect(() => {
    if (suggestion && !isAlreadySaved && !params.planDetails) {
      checkIfDesignIsSaved();
    }
  }, [suggestion, isAlreadySaved, params.planDetails]);

  const checkIfDesignIsSaved = async () => {
    if (!suggestion) return;
    setIsCheckingSaved(true);
    try {
      const response = await plansApi.getPlans();
      if (response.code === 200 && response.data) {
        const isSaved = response.data.some(plan => 
          plan.suggestions.id === suggestion.id
        );
        setIsAlreadySaved(isSaved);
      }
    } catch (error) {
      console.error('Error memeriksa denah tersimpan:', error);
    } finally {
      setIsCheckingSaved(false);
    }
  };

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

  const showNotificationAnimation = (type: 'save' | 'download' | 'already_saved') => {
    setNotificationType(type);
    setShowNotification(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setShowNotification(false));
  };

  const saveDesign = async (): Promise<boolean> => {
    if (isAlreadySaved) {
      showNotificationAnimation('already_saved');
      return false;
    }
    if (!suggestion || !userInput) {
      Alert.alert('Kesalahan', 'Data yang diperlukan untuk menyimpan desain tidak lengkap');
      return false;
    }
    setIsSaving(true);
    try {
      const saveData = {
        style: userInput.style,
        landArea: userInput.landArea,
        floor: userInput.floor,
        entranceDirection: userInput.entranceDirection,
        province: userInput.province,
        city: userInput.city,
        landform: userInput.landform,
        rooms: userInput.rooms,
        suggestionId: suggestion.id
      };
      const response = await plansApi.savePlan(saveData);
      setIsSaving(false);
      if (response.code === 200) {
        console.log('Desain berhasil disimpan:', response.message);
        setIsAlreadySaved(true);
        return true;
      } else {
        console.error('Gagal menyimpan desain:', response.error);
        Alert.alert('Kesalahan', 'Gagal menyimpan desain. Silakan coba lagi.');
        return false;
      }
    } catch (error) {
      setIsSaving(false);
      console.error('Error saving design:', error);
      Alert.alert('Kesalahan', 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.');
      return false;
    }
  };

  // Download PDF function with proper error handling and success check
  const downloadPDF = async (): Promise<boolean> => {
    if (!suggestion?.pdf) {
      Alert.alert('Error', 'PDF not available for this design');
      return false;
    }

    setIsDownloading(true);

    try {
      // Create a filename with the house number
      const fileName = `House_${suggestion.houseNumber}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the PDF
      const downloadResult = await FileSystem.downloadAsync(
        suggestion.pdf,
        fileUri
      );

      setIsDownloading(false);

      // Check if download was successful
      if (downloadResult?.uri && downloadResult.status === 200) {
        // Check if sharing is available
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, { 
            mimeType: 'application/pdf',
            dialogTitle: `Download Rumah ${suggestion.houseNumber}` 
          });
        } else {
          Alert.alert('Download', 'PDF downloaded successfully');
        }
        return true;
      } else {
        console.error('Download failed with status:', downloadResult?.status);
        Alert.alert('Error', 'Could not download PDF. Please try again later.');
        return false;
      }
    } catch (error) {
      setIsDownloading(false);
      console.error('PDF Download Error:', error);
      Alert.alert('Error', 'Could not download PDF. Please try again later.');
      return false;
    }
  };

  const handleAction = async (action: 'save' | 'download') => {
    let success = false;
    if (action === 'save') {
      if (isAlreadySaved) {
        showNotificationAnimation('already_saved');
        return;
      }
      if (isSaving) return;
      success = await saveDesign();
    } else {
      if (isDownloading) return;
      success = await downloadPDF();
    }
    if (success) {
      showNotificationAnimation(action);
    }
  };

  const verifyModelUrl = useCallback(async () => {
    if (!suggestion?.object || errorMsg?.includes(suggestion.object)) return;
    try {
      const response = await fetch(suggestion.object, { method: 'HEAD', headers: { 'ngrok-skip-browser-warning': '1', 'User-Agent': 'ReactNativeApp' }});
      if (!response.ok) {
        setErrorMsg(`Yah, model 3Dnya belum bisa tampil... (Error: ${response.status})`);
      } else {
        setErrorMsg(null); // Clear error if successful
      }
    } catch (error) {
      setErrorMsg('Koneksi bermasalah. Cek internetmu!');
    }
  }, [suggestion?.object, errorMsg]);

  React.useEffect(() => {
    const setupOrientation = async () => {
      try { await ScreenOrientation.unlockAsync(); } 
      catch (error) { console.error('Gagal membuka kunci orientasi:', error); }
    };
    setupOrientation();
    return () => {
      const lockPortrait = async () => {
        try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); } 
        catch (error) { console.error('Gagal mengunci orientasi:', error); }
      };
      lockPortrait();
    };
  }, []);

  React.useEffect(() => {
    if (suggestion?.object) {
      verifyModelUrl();
    }
  }, [suggestion?.object, verifyModelUrl]);

  useEffect(() => {
    setShowMaterials(false);
  }, [isLandscape]);

  const formatBudgetRange = (forLandscape: boolean = true) => {
    if (!suggestion) return '';
    
    const formatCurrency = (amount: number) => {
      if (amount >= 1000000000) { // Miliar
        return `${(amount / 1000000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 3 })} Miliar`;
      } else if (amount >= 1000000) { // Juta
        return `${(amount / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta`;
      }
      return amount.toLocaleString('id-ID');
    };
    
    const minBudget = suggestion.budgetMin[selectedBudgetTypeIndex];
    const maxBudget = suggestion.budgetMax[selectedBudgetTypeIndex];
    
    const formattedMin = `Rp${formatCurrency(minBudget * suggestion.buildingArea)}`;
    const formattedMax = `Rp${formatCurrency(maxBudget * suggestion.buildingArea)}`;
    
    return forLandscape 
      ? `${formattedMin} - ${formattedMax}`
      : `${formattedMin} -\n${formattedMax}`;
  };

  const getNotificationMessage = () => {
    switch (notificationType) {
      case 'save': return 'Desain rumah berhasil disimpan';
      case 'download': return 'PDF berhasil diunduh';
      case 'already_saved': return 'Desain rumah sudah pernah disimpan';
      default: return '';
    }
  };

  const getSaveButtonText = () => {
    if (isCheckingSaved) return "Memeriksa...";
    if (isAlreadySaved) return "Tersimpan";
    if (isSaving) return "Menyimpan...";
    return "Simpan";
  };

  const getSaveButtonIcon = () => {
    if (isCheckingSaved) return "hourglass-empty";
    if (isAlreadySaved) return "bookmark";
    if (isSaving) return "hourglass-empty";
    return "bookmark-outline";
  };

  if (!suggestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}><Text>Memuat detail rumah...</Text></View>
      </SafeAreaView>
    );
  }

  if (isLandscape) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.landscapeContainer}>
          {is3D ? (
            <View style={styles.landscapeViewerContainer}>
              {errorMsg ? (
                <View style={styles.errorMessageContainer}>
                  <Text style={styles.errorMessageText}>{errorMsg}</Text>
                  <Button title="Muat Ulang" variant="primary" onPress={verifyModelUrl} />
                </View>
              ) : ( <HouseViewer modelUri={suggestion.object} /> )}

              {showMaterials && suggestion && (
                <MaterialSection
                  isLandscape={isLandscape}
                  state={(data: boolean) => setShowMaterials(data)}
                  budgetMin={suggestion.budgetMin}
                  budgetMax={suggestion.budgetMax}
                  materials0={suggestion.materials0}
                  materials1={suggestion.materials1}
                  materials2={suggestion.materials2}
                  selectedBudgetTypeIndex={selectedBudgetTypeIndex}
                  onBudgetTypeChange={setSelectedBudgetTypeIndex}
                />
              )}
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.landscapeViewerContainer}>
              <FloorplanViewer floorplans={floorplans} isLandscape={true} />
              <View style={styles.landscapeCopyrightContainer}>
                <Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={goBack} style={styles.landscapeBackButton}>
            <MaterialIcons name="chevron-left" size={40} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          
          <View style={styles.landscapeHeader}>
            <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
            <View style={styles.tabs}>
              <Button title="3D Rumah" variant="outline" onPress={() => setIs3D(true)} selected={is3D} minHeight={20} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
              <Button title="Denah" variant="outline" onPress={() => setIs3D(false)} selected={!is3D} minHeight={8} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
            </View>
          </View>

          {is3D && (
            <Button title="Material" variant="outline" icon={<MaterialIcons name="grid-view" size={16}/>} iconPosition='left' onPress={() => setShowMaterials(!showMaterials)} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6} style={{position: 'absolute', right: '70%', bottom: '60%'}}/>
          )}

          <View style={styles.landscapeRightSidebar}>
            <View style={styles.budgetInfoRight}>
              <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.caption]}>Kisaran Budget</Text>
              <Text style={[{color: theme.colors.customGreen[300]}, theme.typography.subtitle2]}>{formatBudgetRange()}</Text>
            </View>
            <Button title={isDownloading ? "Mengunduh..." : "Unduh PDF"} variant="primary" icon={<MaterialIcons name={isDownloading ? "hourglass-empty" : "download"} size={16}/>} iconPosition='left' onPress={() => handleAction('download')} disabled={!suggestion?.pdf || isDownloading} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
            <Button title={getSaveButtonText()} variant={isAlreadySaved ? "outline" : "primary"} icon={<MaterialIcons name={getSaveButtonIcon()} size={16}/>} iconPosition='left' onPress={() => handleAction('save')} disabled={isSaving || isCheckingSaved} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
          </View>
          
          {showNotification && (
            <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim, top: isLandscape? '80%' : '14%' }]}>
              <View style={styles.notificationContent}>
                <MaterialIcons name={notificationType === 'already_saved' ? "info" : "check-circle"} size={24} color={theme.colors.customWhite[50]} />
                <Text style={styles.notificationText}>  {getNotificationMessage()}</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={32} color={theme.colors.customOlive[50]} />
          </TouchableOpacity>
          <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
          <View style={styles.tabs}>
            <Button title="3D Rumah" variant="outline" onPress={() => setIs3D(true)} selected={is3D} minHeight={20} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
            <Button title="Denah" variant="outline" onPress={() => setIs3D(false)} selected={!is3D} minHeight={8} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
          </View>
        </View>

        {is3D ? (
          <View style={styles.viewerContainer}>
            {errorMsg ? (
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessageText}>{errorMsg}</Text>
                <Button title="Muat Ulang" variant="primary" onPress={verifyModelUrl} />
              </View>
            ) : ( <HouseViewer modelUri={suggestion.object} /> )}

            {showMaterials && suggestion && (
              <MaterialSectionVertical // Assuming MaterialSectionVertical will accept these new props
                isLandscape={isLandscape}
                state={(data: boolean) => setShowMaterials(data)}
                budgetMin={suggestion.budgetMin}
                budgetMax={suggestion.budgetMax}
                materials0={suggestion.materials0}
                materials1={suggestion.materials1}
                materials2={suggestion.materials2}
                selectedBudgetTypeIndex={selectedBudgetTypeIndex}
                onBudgetTypeChange={setSelectedBudgetTypeIndex}
              />
            )}
            <View style={styles.materialButton}>
              <Button title="Material" variant="outline" icon={<MaterialIcons name="grid-view" size={16}/>} iconPosition='left' onPress={() => setShowMaterials(!showMaterials)} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={8}/>
            </View>
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.viewerContainer}>
            <FloorplanViewer floorplans={floorplans} isLandscape={false} />
            <View style={styles.copyrightContainer}>
              <Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.budgetInfo}>
            <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.body2]}>Kisaran Budget</Text>
            <Text style={[{color: theme.colors.customGreen[400]}, theme.typography.subtitle1]}>{formatBudgetRange(false)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title={getSaveButtonText()} variant={isAlreadySaved ? "outline" : "primary"} icon={<MaterialIcons name={getSaveButtonIcon()} size={16}/>} iconPosition='left' onPress={() => handleAction('save')} disabled={isSaving || isCheckingSaved} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
            <Button title={isDownloading ? "Mengunduh..." : "Unduh PDF"} variant="primary" icon={<MaterialIcons name={isDownloading ? "hourglass-empty" : "download"} size={16}/>} iconPosition='left' onPress={() => handleAction('download')} disabled={!suggestion?.pdf || isDownloading} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
          </View>
        </View>
        
        {showNotification && (
          <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim, top: isLandscape? '80%' : '14%' }]}>
            <View style={styles.notificationContent}>
              <MaterialIcons name={notificationType === 'already_saved' ? "info" : "check-circle"} size={24} color={theme.colors.customWhite[50]} />
              <Text style={styles.notificationText}>  {getNotificationMessage()}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same
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
    color: '#721c24', // Consider using theme colors
    backgroundColor: '#f8d7da', // Consider using theme colors
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
    backgroundColor: '#ECFAF6', // Consider theme color
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