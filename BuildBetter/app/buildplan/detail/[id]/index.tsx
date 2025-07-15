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
import { MaterialSectionVertical } from '@/component/MaterialSectionVertical';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { plansApi } from '@/services/api';
import Tooltip from '@/component/Tooltip'; 

// --- Type definitions remain the same ---
interface Material { id: string; name: string; category: string; subcategory: string; image: string; }
interface MaterialSubCategory { subCategory: string; materials: Material[]; }
interface MaterialCategory { category: string; subCategories: MaterialSubCategory[]; }
interface Suggestion { id: string; houseNumber: number | string; landArea: number; buildingArea: number; style: string; floor: number; rooms: number; buildingHeight: number; designer: string; defaultBudget: number; budgetMin: number[]; budgetMax: number[]; floorplans: Array<string>; object: string; houseImageFront: string; houseImageSide: string; houseImageBack: string; pdf: string; windDirection: string[]; materials0: MaterialCategory[]; materials1: MaterialCategory[]; materials2: MaterialCategory[]; }
interface UserInput { province: string; city: string; landform: string; landArea: number; entranceDirection: string; style: string; floor: number; rooms: number; }
interface FloorplanData { id: number; floor: number; name: string; source: any; orientation: 'horizontal' | 'vertical'; }

const TooltipItem = ({ icon, label, userValue, houseValue }: {icon: any, label: string, userValue: string | number, houseValue: string | number}) => {
    const isMatch = String(userValue).trim().toLowerCase() === String(houseValue).trim().toLowerCase();
    return (
      <View style={styles.tooltipItem}>
        <MaterialIcons name={icon} size={20} color={theme.colors.customWhite[50]} style={styles.tooltipIcon} />
        <View style={styles.tooltipTextContainer}>
          <Text style={styles.tooltipLabel}>{label}</Text>
          <Text style={styles.tooltipValueText}>Pilihanmu: {userValue}</Text>
          <Text style={[styles.tooltipValueText, !isMatch && styles.tooltipValueMismatch]}>Hasil: {houseValue}</Text>
        </View>
      </View>
    );
};

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
  const [notificationType, setNotificationType] = useState<'save' | 'unsave' | 'download'>('download');
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaving, setIsUnsaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

  const [selectedBudgetTypeIndex, setSelectedBudgetTypeIndex] = useState<number>(1);

  const renderComparisonTooltipContent = (isLandscapeMode: boolean) => {
    if (!userInput || !suggestion) return 'Memuat informasi...';

    const comparisons = [
      { icon: "square-foot", label: "Luas Tanah", userValue: `${userInput.landArea} m²`, houseValue: `${suggestion.landArea} m²` },
      { icon: "home", label: "Gaya Desain", userValue: userInput.style, houseValue: suggestion.style },
      { icon: "layers", label: "Jumlah Lantai", userValue: `${userInput.floor} Lantai`, houseValue: `${suggestion.floor} Lantai` },
      { icon: "hotel", label: "Jumlah Kamar", userValue: `${userInput.rooms} Kamar Tidur`, houseValue: `${suggestion.rooms} Kamar Tidur` }
    ];

    const directionMap: { [key: string]: string } = {
        north: 'Utara', east: 'Timur', south: 'Selatan', west: 'Barat',
        northeast: 'Timur Laut', northwest: 'Barat Laut',
        southeast: 'Tenggara', southwest: 'Barat Daya'
    };
    const translate = (dir: string) => directionMap[dir.toLowerCase()] || dir;

    const userDirection = userInput.entranceDirection ? translate(userInput.entranceDirection) : 'N/A';
    const optimalDirections = suggestion.windDirection.length > 0 ? suggestion.windDirection.map(translate).join(' / ') : 'N/A';
    const isMatch = userInput.entranceDirection && suggestion.windDirection.some(dir => dir.toLowerCase() === userInput.entranceDirection.toLowerCase());

    const EntranceDirectionInfoText = () => {
        if (!userInput.entranceDirection || suggestion.windDirection.length === 0) return null;
        if (isMatch) {
            return (<Text style={styles.tooltipInfoText}>Arah yang direkomendasikan sesuai dengan arah rumah yang diinginkan (<Text style={{fontWeight: 'bold'}}>{userDirection}</Text>) untuk pencahayaan dan sirkulasi optimal.</Text>);
        } else {
            return (<Text style={styles.tooltipInfoText}>Optimal di arah <Text style={{fontWeight: 'bold'}}>{optimalDirections}</Text>. Pilihanmu berbeda (<Text style={{fontWeight: 'bold'}}>{userDirection}</Text>), sehingga disarankan mengurangi bukaan di sisi Barat (dengan gorden/kanopi).</Text>);
        }
    };
    
    const Disclaimer = () => (
        <>
            <View style={styles.tooltipDivider} />
            <Text style={styles.tooltipDisclaimer}>
              Info: Desain ini paling mendekati permintaanmu, namun mungkin terdapat sedikit perbedaan.
            </Text>
        </>
    ); 

    if (isLandscapeMode) {
        const column1Items = comparisons.slice(0, 2);
        const column2Items = comparisons.slice(2, 4);
        const VerticalDivider = () => <View style={styles.tooltipVerticalDivider} />;

        return (
            <View>
                <View style={styles.tooltipMultiColumnContainer}>
                    {/* Column 1 */}
                    <View style={styles.tooltipColumn}>
                        {column1Items.map(comp => <TooltipItem key={comp.label} {...comp} />)}
                    </View>
                    <VerticalDivider />
                    {/* Column 2 */}
                    <View style={styles.tooltipColumn}>
                        {column2Items.map(comp => <TooltipItem key={comp.label} {...comp} />)}
                    </View>
                    <VerticalDivider />
                    {/* Column 3 */}
                    <View style={styles.tooltipColumn}>
                        <View style={[styles.tooltipItem, {marginBottom: 2}]}>
                            <MaterialIcons name="explore" size={20} color={theme.colors.customWhite[50]} style={styles.tooltipIcon} />
                            <View style={styles.tooltipTextContainer}>
                                <Text style={styles.tooltipLabel}>Arah Hadap Rumah</Text>
                                <EntranceDirectionInfoText />
                            </View>
                        </View>
                    </View>
                </View>
                <Disclaimer />
            </View>
        );
    }
    
    // Original single-column layout for portrait mode
    return (
      <View>
        {comparisons.map(comp => <TooltipItem key={comp.label} {...comp} />)}
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipItem}>
            <MaterialIcons name="explore" size={20} color={theme.colors.customWhite[50]} style={styles.tooltipIcon} />
            <View style={styles.tooltipTextContainer}>
                <Text style={styles.tooltipLabel}>Arah Hadap Rumah</Text>
                <EntranceDirectionInfoText />
            </View>
        </View>
        <Disclaimer />
      </View>
    );
  };
  
  // ... (rest of the component's functions and hooks are unchanged) ...
  useEffect(() => {
    try {
      if (params.planDetails) {
        const parsedPlan = JSON.parse(params.planDetails as string);
        setSuggestion(parsedPlan.suggestions);
        setUserInput(parsedPlan.userInput);
        setSavedPlanId(parsedPlan.id);
        setIsAlreadySaved(true);
        setIsCheckingSaved(false);
        return;
      }
      if (params.suggestion) setSuggestion(JSON.parse(params.suggestion as string));
      if (params.userInput) setUserInput(JSON.parse(params.userInput as string));
    } catch (error) {
      console.error('Error parsing params:', error);
      setErrorMsg('Gagal memuat detail rumah. Silakan coba lagi.');
    }
  }, [params.suggestion, params.userInput, params.planDetails]);
  useEffect(() => {
    if (suggestion && !params.planDetails) {
      checkIfDesignIsSaved();
    }
  }, [suggestion, params.planDetails]);
  const checkIfDesignIsSaved = async () => {
    if (!suggestion) return;
    setIsCheckingSaved(true);
    try {
      const response = await plansApi.getPlans();
      if (response.code === 200 && response.data) {
        const savedPlan = response.data.find(plan => 
          plan.suggestions.id === suggestion.id
        );
        if (savedPlan) {
          setIsAlreadySaved(true);
          setSavedPlanId(savedPlan.id);
        } else {
          setIsAlreadySaved(false);
          setSavedPlanId(null);
        }
      }
    } catch (error) {
      console.error('Error memeriksa denah tersimpan:', error);
    } finally {
      setIsCheckingSaved(false);
    }
  };
  const floorplans: FloorplanData[] = React.useMemo(() => {
    if (!suggestion?.floorplans) return [];
    return suggestion.floorplans.map((url, index) => ({
      id: index + 1, floor: index + 1, name: `Lantai ${index + 1}`, source: { uri: url }, orientation: 'horizontal'
    }));
  }, [suggestion]);
  const goBack = useCallback(() => {
    if (showMaterials) {
      setShowMaterials(false);
      return;
    }
    router.back();
  }, [showMaterials, router]);
  const showNotificationAnimation = (type: 'save' | 'unsave' | 'download') => {
    setNotificationType(type);
    setShowNotification(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(type === 'save' ? 5000 : 2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setShowNotification(false));
  };
  const handleGoToSaved = () => {
    fadeAnim.setValue(0);
    setShowNotification(false);
    router.push('/buildplan/saved');
  };
  const saveDesign = async () => {
    if (!suggestion || !userInput) {
      Alert.alert('Kesalahan', 'Data yang diperlukan untuk menyimpan desain tidak lengkap');
      return;
    }
    setIsSaving(true);
    try {
      const saveData = {
        style: userInput.style, landArea: userInput.landArea, floor: userInput.floor,
        entranceDirection: userInput.entranceDirection, province: userInput.province,
        city: userInput.city, landform: userInput.landform, rooms: userInput.rooms,
        suggestionId: suggestion.id
      };
      const response = await plansApi.savePlan(saveData);
      
      if (response.code === 200) {
        setIsAlreadySaved(true);
        showNotificationAnimation('save');
        const plansResponse = await plansApi.getPlans();
        if (plansResponse.code === 200 && plansResponse.data) {
            const newPlan = plansResponse.data.find(p => p.suggestions.id === suggestion.id);
            if (newPlan) setSavedPlanId(newPlan.id);
            else console.error("Critical: Failed to find the newly saved plan ID after re-fetching.");
        }
      } else {
        Alert.alert('Kesalahan', 'Gagal menyimpan desain. Silakan coba lagi.');
      }
    } catch (error) {
      Alert.alert('Kesalahan', 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.');
    } finally {
      setIsSaving(false);
    }
  };
  const unsaveDesign = async () => {
    if (!savedPlanId) {
      Alert.alert('Kesalahan', 'Tidak dapat menghapus. ID denah tidak ditemukan.');
      return;
    }
    setIsUnsaving(true);
    try {
      const response = await plansApi.deletePlan(savedPlanId);
      if (response.code === 200) {
        setIsAlreadySaved(false);
        setSavedPlanId(null);
        showNotificationAnimation('unsave');
      } else {
        Alert.alert('Kesalahan', 'Gagal menghapus desain dari daftar simpanan. Silakan coba lagi.');
      }
    } catch (error) {
      Alert.alert('Kesalahan', 'Terjadi kesalahan jaringan. Silakan coba lagi nanti.');
    } finally {
      setIsUnsaving(false);
    }
  };
  const downloadPDF = async () => {
    if (!suggestion?.pdf) {
      Alert.alert('Error', 'PDF not available for this design');
      return;
    }
    setIsDownloading(true);
    try {
      const fileName = `House_${suggestion.houseNumber}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadResult = await FileSystem.downloadAsync(suggestion.pdf, fileUri);
      if (downloadResult?.uri && downloadResult.status === 200) {
        showNotificationAnimation('download');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, { mimeType: 'application/pdf', dialogTitle: `Download Rumah ${suggestion.houseNumber}` });
        } else {
          Alert.alert('Download', 'PDF downloaded successfully');
        }
      } else {
        Alert.alert('Error', 'Could not download PDF. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not download PDF. Please try again later.');
    } finally {
        setIsDownloading(false);
    }
  };
  const handleAction = (action: 'toggleSave' | 'download') => {
    if (action === 'toggleSave') {
      if (isSaving || isUnsaving || isCheckingSaved) return;
      if (isAlreadySaved) unsaveDesign();
      else saveDesign();
    } else if (action === 'download') {
      if (isDownloading) return;
      downloadPDF();
    }
  };
  const verifyModelUrl = useCallback(async () => {
    if (!suggestion?.object || errorMsg?.includes(suggestion.object)) return;
    try {
      const response = await fetch(suggestion.object, { method: 'HEAD', headers: { 'ngrok-skip-browser-warning': '1', 'User-Agent': 'ReactNativeApp' }});
      if (!response.ok) setErrorMsg(`Yah, model 3Dnya belum bisa tampil... (Error: ${response.status})`);
      else setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Koneksi bermasalah. Cek internetmu!');
    }
  }, [suggestion?.object, errorMsg]);
  useEffect(() => { (async () => { try { await ScreenOrientation.unlockAsync(); } catch (error) { console.error('Gagal membuka kunci orientasi:', error); } })(); return () => { (async () => { try { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); } catch (error) { console.error('Gagal mengunci orientasi:', error); } })(); }; }, []);
  useEffect(() => { if (suggestion?.object) verifyModelUrl(); }, [suggestion?.object, verifyModelUrl]);
  useEffect(() => { setShowMaterials(false); }, [isLandscape]);
  const formatBudgetRange = (forLandscape: boolean = true) => {
    if (!suggestion) return '';
    const formatCurrency = (amount: number) => {
      if (amount >= 1000000000) return `${(amount / 1000000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 3 })} Miliar`;
      if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta`;
      return amount.toLocaleString('id-ID');
    };
    const min = `Rp${formatCurrency(suggestion.budgetMin[selectedBudgetTypeIndex] * suggestion.buildingArea)}`;
    const max = `Rp${formatCurrency(suggestion.budgetMax[selectedBudgetTypeIndex] * suggestion.buildingArea)}`;
    return forLandscape ? `${min} - ${max}` : `${min} -\n${max}`;
  };
  const getNotificationMessage = () => { switch (notificationType) { case 'save': return 'Desain rumah berhasil disimpan'; case 'unsave': return 'Desain rumah dihapus dari daftar'; case 'download': return 'PDF berhasil diunduh'; default: return ''; } };
  const getSaveButtonText = () => { if (isCheckingSaved) return "Memeriksa..."; if (isUnsaving) return "Menghapus..."; if (isSaving) return "Menyimpan..."; if (isAlreadySaved) return "Tersimpan"; return "Simpan"; };
  const getSaveButtonIcon = () => { if (isCheckingSaved || isSaving || isUnsaving) return "hourglass-empty"; if (isAlreadySaved) return "bookmark"; return "bookmark-outline"; };
  const getBudgetTypeName = (index: number): string => { switch (index) { case 0: return 'Ekonomis'; case 1: return 'Original'; case 2: return 'Premium'; default: return 'Original'; } };

  if (!suggestion) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.loadingContainer}><Text>Memuat detail rumah...</Text></View></SafeAreaView>;
  }

  const MainContent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="chevron-left" size={32} color={theme.colors.customOlive[50]} />
        </TouchableOpacity>
        <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
        <View style={styles.headerControls}>
          <View style={styles.tabs}>
            <Button title="3D Rumah" variant="outline" onPress={() => setIs3D(true)} selected={is3D} minHeight={20} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
            <Button title="Denah" variant="outline" onPress={() => setIs3D(false)} selected={!is3D} minHeight={8} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
          </View>
          <Tooltip content={renderComparisonTooltipContent(false)} position="left" />
        </View>
      </View>
      {is3D ? (
        <View style={styles.viewerContainer}>
          {errorMsg ? ( <View style={styles.errorMessageContainer}><Text style={styles.errorMessageText}>{errorMsg}</Text><Button title="Muat Ulang" variant="primary" onPress={verifyModelUrl} /></View> ) : ( <HouseViewer modelUri={suggestion.object} /> )}
          {showMaterials && suggestion && <MaterialSectionVertical isLandscape={isLandscape} state={(data: boolean) => setShowMaterials(data)} budgetMin={suggestion.budgetMin} budgetMax={suggestion.budgetMax} materials0={suggestion.materials0} materials1={suggestion.materials1} materials2={suggestion.materials2} selectedBudgetTypeIndex={selectedBudgetTypeIndex} onBudgetTypeChange={setSelectedBudgetTypeIndex}/>}
          <View style={styles.materialButton}><Button title="Material" variant="outline" icon={<MaterialIcons name="grid-view" size={16}/>} iconPosition='left' onPress={() => setShowMaterials(!showMaterials)} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={8}/></View>
          <View style={styles.copyrightContainer}><Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text></View>
        </View>
      ) : (
        <View style={styles.viewerContainer}>
          <FloorplanViewer floorplans={floorplans} isLandscape={false} />
          <View style={styles.copyrightContainer}><Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text></View>
        </View>
      )}
      <View style={styles.infoContainer}>
        <View style={styles.budgetInfo}>
          <Text style={[{color: theme.colors.customOlive[50]}, theme.typography.body2]}>Kisaran Budget {getBudgetTypeName(selectedBudgetTypeIndex)}</Text>
          <Text style={[{color: theme.colors.customGreen[400]}, theme.typography.subtitle1]}>{formatBudgetRange(false)}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title={getSaveButtonText()} variant={isAlreadySaved ? "outline" : "primary"} icon={<MaterialIcons name={getSaveButtonIcon()} size={16}/>} iconPosition='left' onPress={() => handleAction('toggleSave')} disabled={isSaving || isCheckingSaved || isUnsaving} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
          <Button title={isDownloading ? "Mengunduh..." : "Unduh PDF"} variant="primary" icon={<MaterialIcons name={isDownloading ? "hourglass-empty" : "download"} size={16}/>} iconPosition='left' onPress={() => handleAction('download')} disabled={!suggestion?.pdf || isDownloading} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
        </View>
      </View>
    </>
  );

  const LandscapeContent = (
    <>
      {is3D ? (
        <View style={styles.landscapeViewerContainer}>
          {errorMsg ? ( <View style={styles.errorMessageContainer}><Text style={styles.errorMessageText}>{errorMsg}</Text><Button title="Muat Ulang" variant="primary" onPress={verifyModelUrl} /></View> ) : ( <HouseViewer modelUri={suggestion.object} /> )}
          {showMaterials && suggestion && <MaterialSection isLandscape={isLandscape} state={(data: boolean) => setShowMaterials(data)} budgetMin={suggestion.budgetMin} budgetMax={suggestion.budgetMax} materials0={suggestion.materials0} materials1={suggestion.materials1} materials2={suggestion.materials2} selectedBudgetTypeIndex={selectedBudgetTypeIndex} onBudgetTypeChange={setSelectedBudgetTypeIndex}/>}
          <View style={styles.landscapeCopyrightContainer}><Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text></View>
        </View>
      ) : (
        <View style={styles.landscapeViewerContainer}>
          <FloorplanViewer floorplans={floorplans} isLandscape={true} />
          <View style={styles.landscapeCopyrightContainer}><Text style={[styles.copyrightText, theme.typography.overline]}>© Didesain oleh {suggestion.designer || 'Naila Juniah'}</Text></View>
        </View>
      )}
      <TouchableOpacity onPress={goBack} style={styles.landscapeBackButton}><MaterialIcons name="chevron-left" size={40} color={theme.colors.customOlive[50]} /></TouchableOpacity>
      <View style={styles.landscapeHeader}>
        <Text style={[styles.title, theme.typography.title]}>Rumah {suggestion.houseNumber}</Text>
        <View style={styles.headerControls}>
          <View style={styles.tabs}>
            <Button title="3D Rumah" variant="outline" onPress={() => setIs3D(true)} selected={is3D} minHeight={20} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
            <Button title="Denah" variant="outline" onPress={() => setIs3D(false)} selected={!is3D} minHeight={8} minWidth={50} paddingVertical={4} paddingHorizontal={12}/>
          </View>
          <Tooltip content={renderComparisonTooltipContent(true)} position="bottom" width={540} />
        </View>
      </View>
      {is3D && <Button title="Material" variant="outline" icon={<MaterialIcons name="grid-view" size={16}/>} iconPosition='left' onPress={() => setShowMaterials(!showMaterials)} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6} style={{position: 'absolute', right: '70%', bottom: '60%'}}/>}
      <View style={styles.landscapeRightSidebar}>
        <View style={styles.budgetInfoRight}><Text style={[{color: theme.colors.customOlive[50]}, theme.typography.caption]}>Kisaran Budget {getBudgetTypeName(selectedBudgetTypeIndex)}</Text><Text style={[{color: theme.colors.customGreen[300]}, theme.typography.subtitle2]}>{formatBudgetRange()}</Text></View>
        <Button title={isDownloading ? "Mengunduh..." : "Unduh PDF"} variant="primary" icon={<MaterialIcons name={isDownloading ? "hourglass-empty" : "download"} size={16}/>} iconPosition='left' onPress={() => handleAction('download')} disabled={!suggestion?.pdf || isDownloading} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
        <Button title={getSaveButtonText()} variant={isAlreadySaved ? "outline" : "primary"} icon={<MaterialIcons name={getSaveButtonIcon()} size={16}/>} iconPosition='left' onPress={() => handleAction('toggleSave')} disabled={isSaving || isCheckingSaved || isUnsaving} minHeight={10} minWidth={50} paddingHorizontal={16} paddingVertical={6}/>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={isLandscape ? styles.landscapeContainer : styles.container}>
        {isLandscape ? LandscapeContent : MainContent}
        {showNotification && (
          <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim, top: isLandscape ? '80%' : '14%' }]}>
            <View style={styles.notificationContent}>
              <View style={styles.notificationTopRow}><MaterialIcons name="check-circle" size={24} color={theme.colors.customWhite[50]} /><Text style={styles.notificationText}>  {getNotificationMessage()}</Text></View>
              {notificationType === 'save' && (<TouchableOpacity onPress={handleGoToSaved}><Text style={styles.notificationLinkText}>Lihat daftar rumah yang tersimpan</Text></TouchableOpacity>)}
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.customWhite[50], },
  container: { flex: 1, },
  header: { paddingHorizontal: 20, paddingTop: 20, },
  backButton: { position: 'absolute', top: 20, left: 10, zIndex: 10, },
  title: { marginLeft: 40, marginBottom: 4, color: theme.colors.customOlive[50] },
  headerControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 40, justifyContent: 'space-between', paddingRight: 8 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 8, },
  viewerContainer: { flex: 1, },
  errorMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
  errorMessageText: { color: '#721c24', backgroundColor: '#f8d7da', padding: 16, borderRadius: 24, textAlign: 'center', marginBottom: 24, },
  infoContainer: { paddingHorizontal: '6%', paddingVertical: '4%', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E0E0E0', },
  budgetInfo: { flex: 1, },
  buttonContainer: { flex: 1, flexDirection: 'column', gap: 8, },
  copyrightContainer: { position: 'absolute', bottom: '2%', left: '6%', },
  materialButton: { position: 'absolute', right: 22, paddingVertical: 8, bottom: '1%' },
  landscapeContainer: { flex: 1, flexDirection: 'column', position: 'relative', },
  landscapeBackButton: { position: 'absolute', top: '2%', left: '1%', zIndex: 10, },
  landscapeHeader: { position: 'absolute', top: '4%', left: '6%', zIndex: 10, },
  landscapeViewerContainer: { flex: 1, position: 'relative', paddingVertical: 8, },
  landscapeRightSidebar: { position: 'absolute', top: '4%', right: '2%', zIndex: 10, alignItems: 'flex-end', gap: 12, },
  budgetInfoRight: { backgroundColor: '#ECFAF6', padding: 8, borderRadius: 16, alignItems: 'center', },
  landscapeCopyrightContainer: { position: 'absolute', bottom: '6%', left: '6%', },
  copyrightText: { color: theme.colors.customGray[200], },
  notificationContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20, },
  notificationContent: { flexDirection: 'column', backgroundColor: 'rgba(14, 25, 23, 0.7)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', },
  notificationTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
  notificationText: { color: theme.colors.customWhite[50], ...theme.typography.body2 },
  notificationLinkText: { color: theme.colors.customWhite[50], ...theme.typography.body2, textDecorationLine: 'underline', marginTop: 2, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  tooltipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, },
  tooltipIcon: { marginRight: 10, marginTop: 2, },
  tooltipTextContainer: { flex: 1, },
  tooltipLabel: { color: theme.colors.customWhite[50], fontWeight: 'bold', marginBottom: 2, fontSize: 14 },
  tooltipValueText: { color: theme.colors.customWhite[50], fontSize: 12, lineHeight: 16, },
  tooltipValueMismatch: { fontWeight: 'bold', },
  tooltipInfoText: { color: theme.colors.customWhite[50], fontSize: 12, lineHeight: 16, flexWrap: 'wrap', },
  tooltipDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 8, },
  tooltipDisclaimer: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 4, lineHeight: 16, },
  
  // --- New/Updated styles for multi-column tooltip ---
  tooltipMultiColumnContainer: {
    flexDirection: 'row',
  },
  tooltipColumn: {
    flex: 1,
  },
  tooltipVerticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  }
});

export default HouseDetailPage;