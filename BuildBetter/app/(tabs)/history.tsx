// screens/History.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Platform, Pressable, Modal, ScrollView } from 'react-native'; // Added ScrollView
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons'; // Or from 'react-native-vector-icons'
import theme from '@/app/theme';
import HistoryCard, { HistoryCardProps, HistoryStatus, HistoryMetode } from '@/component/HistoryCard';
import MultiSelectDrawer from '@/component/MultiSelectDrawer';
import Button from '@/component/Button';

// --- Mock Data --- (Same as your last version)
const MOCK_HISTORY_DATA: HistoryCardProps[] = [
  { id: '1', orderCreatedAt: '28 Maret 2024', tanggal: '01 April 2024', waktu: '09.00 - 11.00', arsitek: 'Erensa Ratu', metode: 'Chat', kota: 'Surabaya', totalPembayaran: 30000, status: 'Berlangsung', onHubungiLagi: () => console.log('Hubungi Lagi 1') },
  { id: '2', orderCreatedAt: '15 Februari 2024', tanggal: '20 Februari 2024', waktu: '14.00 - 15.00', arsitek: 'Erensa Ratu', metode: 'Tatap Muka', kota: 'Jakarta Pusat', totalPembayaran: 30000, status: 'Berakhir', onHubungiLagi: () => console.log('Hubungi Lagi 2') },
  { id: '3', orderCreatedAt: '01 Januari 2024', tanggal: '03 Januari 2024', waktu: '10.00 - 12.00', arsitek: 'Yuni Ariefah', metode: 'Chat', kota: 'Bandung', totalPembayaran: 15000, status: 'Berakhir', onHubungiLagi: () => console.log('Hubungi Lagi 3') },
  { id: '4', orderCreatedAt: '10 Mei 2024', tanggal: '15 Mei 2024', waktu: '13.00 - 14.00', arsitek: 'Budi Santoso', metode: 'Tatap Muka', kota: 'Jakarta Barat', totalPembayaran: 50000, status: 'Menunggu konfirmasi', onHubungiLagi: () => console.log('Hubungi Lagi 4') },
  { id: '5', orderCreatedAt: '01 Juni 2024', tanggal: '10 Juni 2024', waktu: '16.00 - 17.00', arsitek: 'Citra Lestari', metode: 'Chat', kota: 'Yogyakarta', totalPembayaran: 25000, status: 'Dijadwalkan', onHubungiLagi: () => console.log('Hubungi Lagi 5') },
  { id: '6', orderCreatedAt: '01 Maret 2024', tanggal: '05 Maret 2024', waktu: '11.00 - 12.00', arsitek: 'Andi Wijaya', metode: 'Tatap Muka', kota: 'Semarang', totalPembayaran: 40000, status: 'Dibatalkan', onHubungiLagi: () => console.log('Hubungi Lagi 6') },
];

const STATUS_FILTER_OPTIONS: HistoryStatus[] = ['Menunggu konfirmasi', 'Dijadwalkan', 'Berlangsung', 'Berakhir', 'Dibatalkan'];
const METODE_FILTER_OPTIONS: HistoryMetode[] = ['Chat', 'Tatap Muka'];

// parseConsultationDate and formatDateForDisplay (Same as your last version)
const parseConsultationDate = (dateString: string): Date | null => {
    const months: { [key: string]: number } = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
        'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    const parts = dateString.split(' ');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthName = parts[1];
        const year = parseInt(parts[2], 10);
        const month = months[monthName];
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    console.warn(`Failed to parse date: ${dateString}`);
    return null;
};

const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "Pilih";
    const day = date.getDate();
    const year = date.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${day} ${monthNames[date.getMonth()]} ${year}`;
};

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryCardProps[]>(MOCK_HISTORY_DATA);
  const [selectedStatuses, setSelectedStatuses] = useState<HistoryStatus[]>([]);
  const [selectedMetodes, setSelectedMetodes] = useState<HistoryMetode[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isStatusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [isMetodeDrawerVisible, setMetodeDrawerVisible] = useState(false);

  const filteredHistory = useMemo(() => {
    return historyData.filter(item => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(item.status)) return false;
      if (selectedMetodes.length > 0 && !selectedMetodes.includes(item.metode)) return false;
      const consultationItemDate = parseConsultationDate(item.tanggal);
      if (!consultationItemDate) return true; // Keep item if date parsing fails, or handle as error
      if (startDate) {
        const filterStartDate = new Date(startDate);
        filterStartDate.setHours(0,0,0,0);
        if (consultationItemDate < filterStartDate) return false;
      }
      if (endDate) {
        const filterEndDate = new Date(endDate);
        filterEndDate.setHours(23,59,59,999);
        if (consultationItemDate > filterEndDate) return false;
      }
      return true;
    });
  }, [historyData, selectedStatuses, selectedMetodes, startDate, endDate]);

  // Date handling functions (Same as your last version)
  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    hideStartDatePicker();
    if (endDate && date > endDate) setEndDate(null);
  };

  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);
  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
    hideEndDatePicker();
    if (startDate && date < startDate) setStartDate(null);
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  }

  const applyDateFiltersAndClose = () => {
    setDateFilterModalVisible(false);
  }

  const getDateFilterButtonText = () => {
    if (startDate && endDate) return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
    if (startDate) return `Mulai: ${formatDateForDisplay(startDate)}`;
    if (endDate) return `Hingga: ${formatDateForDisplay(endDate)}`;
    return "Tanggal";
  }

  const getMultiSelectButtonText = (selectedItems: string[], defaultText: string) => {
    if (selectedItems.length === 0) return defaultText;
    if (selectedItems.length === 1) return selectedItems[0];
    return `${selectedItems.length} Terpilih`;
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="search-off" size={64} color={theme.colors.customGray[100]} />
      <Text style={styles.emptyText}>Tidak ada riwayat aktivitas yang sesuai.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Riwayat Aktivitas</Text>
      </View>

      <View style={styles.topFiltersBar}>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollViewContent}
        >
            <Pressable style={styles.filterButton} onPress={() => setDateFilterModalVisible(true)}>
                <Text style={styles.filterButtonText} numberOfLines={1}>{getDateFilterButtonText()}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color={theme.colors.customGreen[300]} />
            </Pressable>
            <Pressable style={styles.filterButton} onPress={() => setStatusDrawerVisible(true)}>
                <Text style={styles.filterButtonText} numberOfLines={1}>{getMultiSelectButtonText(selectedStatuses, "Status")}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color={theme.colors.customGreen[300]} />
            </Pressable>
            <Pressable style={styles.filterButton} onPress={() => setMetodeDrawerVisible(true)}>
                <Text style={styles.filterButtonText} numberOfLines={1}>{getMultiSelectButtonText(selectedMetodes, "Metode")}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color={theme.colors.customGreen[300]} />
            </Pressable>
            {/* Add more filters here if needed, they will scroll */}
        </ScrollView>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={({ item }) => <HistoryCard {...item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Date Filter Modal (Same as your last version, with Pressable fix) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDateFilterModalVisible}
        onRequestClose={() => setDateFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDateFilterModalVisible(false)}>
          <SafeAreaView style={styles.dateModalContentContainer} edges={['bottom', 'left', 'right']}>
            <Pressable style={styles.dateModalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.dateModalTitle}>Filter Tanggal Konsultasi</Text>
              <Pressable onPress={showStartDatePicker} style={styles.datePickerButton}>
                <Text style={styles.datePickerButtonTextLabel}>Dari:</Text>
                <Text style={styles.datePickerButtonTextValue}>{formatDateForDisplay(startDate) === "Pilih" ? "Pilih Tanggal Mulai" : formatDateForDisplay(startDate)}</Text>
              </Pressable>
              <Pressable onPress={showEndDatePicker} style={styles.datePickerButton}>
                <Text style={styles.datePickerButtonTextLabel}>Sampai:</Text>
                <Text style={styles.datePickerButtonTextValue}>{formatDateForDisplay(endDate) === "Pilih" ? "Pilih Tanggal Akhir" : formatDateForDisplay(endDate)}</Text>
              </Pressable>
              <View style={styles.dateModalActions}>
                <Button
                    title="Hapus"
                    variant="outline"
                    onPress={clearDateFilters}
                    style={{flex: 1}}
                />
                <Button
                    title="Set"
                    variant="primary"
                    onPress={applyDateFiltersAndClose}
                    style={{flex: 1}}
                />
              </View>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>

      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
        maximumDate={endDate || undefined}
        date={startDate || new Date()}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
        minimumDate={startDate || undefined}
        date={endDate || startDate || new Date()}
      />

      <MultiSelectDrawer
        isVisible={isStatusDrawerVisible}
        onClose={() => setStatusDrawerVisible(false)}
        title="Filter by Status"
        options={STATUS_FILTER_OPTIONS}
        selectedValues={selectedStatuses}
        onApply={(values) => setSelectedStatuses(values as HistoryStatus[])}
      />
      <MultiSelectDrawer
        isVisible={isMetodeDrawerVisible}
        onClose={() => setMetodeDrawerVisible(false)}
        title="Filter by Metode"
        options={METODE_FILTER_OPTIONS}
        selectedValues={selectedMetodes}
        onApply={(values) => setSelectedMetodes(values as HistoryMetode[])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.customWhite[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[50],
  },
  pageTitle: {
    ...theme.typography.title,
    color: theme.colors.customOlive[50],
    textAlign: 'center',
  },
  topFiltersBar: {
    // Removed justifyContent: 'space-around'
    flexDirection: 'row', // Keeps items in a row for the ScrollView
    paddingVertical: 12,
    backgroundColor: theme.colors.customWhite[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[50],
    paddingHorizontal: 12, // Overall padding for the bar
  },
  filtersScrollViewContent: {
    alignItems: 'center', // Vertically center items in scroll view
    // paddingHorizontal: 4, // Optional: if first/last item needs specific padding from scrollview edge
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.customGreen[200],
    marginHorizontal: 4, // Spacing between buttons
    height: 36, // Fixed height for consistency
    // flexShrink: 1, // Allow button to shrink if text is long, used with numberOfLines
  },
  filterButtonText: {
    ...theme.typography.caption,
    color: theme.colors.customOlive[50],
    marginRight: 4,
    fontWeight: '500',
    // flexShrink: 1, // Allows text to shrink or be ellipsized
  },
  // Date Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContentContainer: {
     backgroundColor: theme.colors.customWhite[50],
     borderTopLeftRadius: 16,
     borderTopRightRadius: 16,
  },
  dateModalContent: {
    padding:20
  },
  dateModalTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 20,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.customWhite[50],
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  datePickerButtonTextLabel: {
    ...theme.typography.body2,
    color: theme.colors.customGray[200],
  },
  datePickerButtonTextValue: {
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
    fontWeight: '600'
  },
  dateModalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  // List Styles
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1, // Ensure empty component can center if list is short
  },
  emptyContainer: { // New style for empty state container
    flex: 1, // Allow it to take up available space in FlatList
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Add some padding around content
  },
  emptyText: {
    ...theme.typography.body1,
    color: theme.colors.customGray[200],
    textAlign: 'center',
    marginTop: 16, // Space between icon and text
  },
  // Unused styles from original (dateModalActionButton, dateModalClearButton, etc.) are removed for brevity
  // if they are now fully handled by the <Button> component's variants and styles prop.
  // Kept for reference if Button component doesn't cover all styling needs.
  dateModalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  dateModalClearButton: {
    backgroundColor: theme.colors.customGray[50],
    marginRight: 8,
    borderWidth:1,
    borderColor: theme.colors.customGray[100]
  },
  dateModalClearButtonText: {
    color: theme.colors.customOlive[50],
    ...theme.typography.body2
  },
  dateModalSetButton: {
    backgroundColor: theme.colors.customGreen[300],
    marginLeft: 8,
  },
  dateModalSetButtonText: {
     color: theme.colors.customWhite[50],
     ...theme.typography.body2
  },
});