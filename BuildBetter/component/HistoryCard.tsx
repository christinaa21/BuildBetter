import React, { useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import theme from '@/app/theme';
import Button from './Button';
import { Architect, paymentsApi } from '@/services/api';

export type HistoryStatus = 'Menunggu pembayaran' | 'Menunggu konfirmasi' | 'Dibatalkan' | 'Dijadwalkan' | 'Berlangsung' | 'Berakhir';
export type HistoryMetode = 'Chat' | 'Tatap Muka';

// MODIFIED: Added new props
export interface HistoryCardProps {
  id: string;
  orderCreatedAt: string;
  createdAtISO: string;
  arsitek: Architect;
  metode: HistoryMetode;
  tanggal: string; 
  waktu: string;   
  kota: string;
  totalPembayaran: number;
  status: HistoryStatus;
  reason?: string | null;
  paymentAttempt: number; // New prop
  roomId?: string | null;
  style?: StyleProp<ViewStyle>;
}

interface StatusDisplayProps {
  backgroundColor: string;
  dotColor: string;
  textColor: string;
}

const statusStyles: Record<HistoryStatus, StatusDisplayProps> = {
  'Menunggu pembayaran': { backgroundColor: '#FEFCE8', dotColor: '#EFB100', textColor: theme.colors.customOlive[50] },
  'Menunggu konfirmasi': { backgroundColor: '#FFF3E0', dotColor: '#FF9800', textColor: theme.colors.customOlive[50] },
  'Dibatalkan': { backgroundColor: '#FFEBEE', dotColor: '#F44336', textColor: theme.colors.customOlive[50] },
  'Dijadwalkan': { backgroundColor: '#CAE1DB', dotColor: theme.colors.customGreen[300], textColor: theme.colors.customOlive[50] },
  'Berlangsung': { backgroundColor: '#E3F2FD', dotColor: '#2196F3', textColor: theme.colors.customOlive[50] },
  'Berakhir': { backgroundColor: theme.colors.customGray[50], dotColor: theme.colors.customOlive[50], textColor: theme.colors.customOlive[50] },
};

const formatReasonMessage = (reason: string | null | undefined): string | null => {
  if (!reason) return null;
  const reasonKey = reason.toLowerCase();
  switch (reasonKey) {
    case 'consultation was automatically cancelled by the system':
      return 'Dibatalkan otomatis oleh sistem.';
    case 'proof of payment is invalid':
      return 'Bukti pembayaran tidak valid.';
    case 'architect is unavailable':
      return 'Arsitek tidak tersedia.';
    case 'user cancelled the consultation':
      return 'Anda membatalkan konsultasi.';
    default:
      return reason; // Fallback to the original message if unknown
  }
};

const HistoryCard: React.FC<HistoryCardProps> = (props) => {
  const { id, createdAtISO, arsitek, metode, tanggal, waktu, kota, totalPembayaran, status, reason, paymentAttempt, roomId, style, orderCreatedAt } = props;
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const currentStatusStyle = statusStyles[status];

  // --- NAVIGATION AND ACTION HANDLERS ---
  const handleHubungiLagi = () => {
    router.push({
      pathname: '/buildconsult/booking',
      params: { architectData: JSON.stringify(arsitek) }
    });
  };

  const handleLanjutBayar = () => {
    router.push({
      pathname: '/buildconsult/payment',
      params: { 
        consultationId: id,
        totalAmount: totalPembayaran.toString(),
      }
    });
  };

  const handleCekStatus = () => {
    router.push({
      pathname: '/buildconsult/loading',
      params: { 
        consultationId: id,
        totalAmount: totalPembayaran.toString(),
        createdAt: createdAtISO,
      }
    });
  };

  const handleLihatChat = () => {
    if (roomId) {
      router.push({
        pathname: '/buildconsult/chat/[roomId]',
        params: { 
          roomId: roomId,
          consultationId: id
        },
      });
    } else {
      alert('Room chat belum tersedia untuk konsultasi ini.');
    }
  };

  const handleUploadUlang = async () => {
    setIsLoading(true);
    try {
      const response = await paymentsApi.repay(id);
      if (response.code === 200) {
        Alert.alert(
          "Berhasil", 
          "Silakan unggah kembali bukti pembayaran Anda dalam 10 menit.",
          [{ text: 'OK', onPress: handleLanjutBayar }]
        );
      } else {
        Alert.alert("Gagal", response.error || "Gagal memproses permintaan Anda.");
      }
    } catch (err) {
      Alert.alert("Error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJadwalkanUlang = () => {
    router.push({
      pathname: '/buildconsult/booking',
      params: { mode: 'reschedule', consultationId: id },
    });
  };
  
  const handleHubungiAdmin = () => {
    Linking.openURL('https://wa.me/6281274460188');
  };

  // --- MAIN LOGIC: RENDER ACTION BUTTON ---
  const renderActionButton = () => {
    const buttonProps = {
      minHeight: 36,
      minWidth: 120, // Give more space for longer text
      paddingVertical: 8,
      paddingHorizontal: 12,
      textStyle: theme.typography.caption,
      disabled: isLoading,
    };

    switch (status) {
      case 'Menunggu pembayaran':
        return <Button title="Lanjut Bayar" variant="primary" onPress={handleLanjutBayar} {...buttonProps} />;
      
      case 'Menunggu konfirmasi':
        return <Button title="Cek Status" variant="outline" onPress={handleCekStatus} {...buttonProps} />;
      
      case 'Dijadwalkan':
      case 'Berlangsung':
        return <Button title="Lihat Chat" variant="outline" onPress={handleLihatChat} {...buttonProps} />;
      
      case 'Berakhir':
        return <Button title="Hubungi Lagi" variant="outline" onPress={handleHubungiLagi} {...buttonProps} />;

      case 'Dibatalkan':
        const reasonKey = (reason || 'consultation was automatically cancelled by the system').toLowerCase();

        if (reasonKey.includes('proof of payment is invalid')) {
          return paymentAttempt < 2
            ? <Button title={isLoading ? "Memproses..." : "Upload Ulang"} variant="primary" onPress={handleUploadUlang} {...buttonProps} />
            : <Button title="Hubungi Lagi" variant="outline" onPress={handleHubungiLagi} {...buttonProps} />;
        
        } else if (reasonKey.includes('architect is unavailable')) {
          return <Button title="Jadwalkan Ulang" variant="primary" onPress={handleJadwalkanUlang} {...buttonProps} />
        
        } else { // Includes user_cancelled, system_cancelled (expired), etc.
          return <Button title="Hubungi Admin" variant="outline" onPress={handleHubungiAdmin} {...buttonProps} />;
        }
        
      default:
        return null;
    }
  };

  const formattedReason = formatReasonMessage(reason);

  return (
    <View style={[styles.card, style]}>
       <View style={styles.header}>
        <Text style={[theme.typography.caption, styles.dateText]}>{orderCreatedAt}</Text>
        <View style={[styles.statusChip, { backgroundColor: currentStatusStyle.backgroundColor }]}>
          <View style={[styles.statusDot, { backgroundColor: currentStatusStyle.dotColor }]} />
          <Text style={[theme.typography.overline, { color: currentStatusStyle.textColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={[theme.typography.subtitle2, styles.serviceTitle]}>Layanan BuildConsult</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Arsitek: {arsitek.username}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Metode: {metode}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Tanggal konsultasi: {tanggal}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Waktu konsultasi: {waktu}</Text>
      {metode === 'Tatap Muka' &&
        <Text style={[theme.typography.body2, styles.infoText]}>Kota: {kota}</Text>
      }
      {status === 'Dibatalkan' && formattedReason &&
        <Text style={[theme.typography.body2, styles.reasonText]}>Alasan: {formattedReason}</Text>
      }

      <View style={styles.footer}>
        <View>
          <Text style={[theme.typography.caption, styles.paymentLabel]}>Total Pembayaran</Text>
          <Text style={[theme.typography.subtitle1, styles.paymentAmount]}>
            Rp{totalPembayaran.toLocaleString('id-ID')}
          </Text>
        </View>
        {renderActionButton()}
      </View>
    </View>
  );
};

// --- Styles are unchanged, so they are omitted for brevity ---
const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.customWhite[50],
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    dateText: {
      color: theme.colors.customGray[200],
    },
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 16,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      marginRight: 6,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.customGray[50],
      marginVertical: 8,
    },
    serviceTitle: {
      color: theme.colors.customOlive[50],
      marginBottom: 4,
    },
    infoText: {
      color: theme.colors.customOlive[50],
      marginBottom: 2
    },
    reasonText: {
      color: '#F44336',
      fontStyle: 'italic',
      marginTop: 4,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 12,
    },
    paymentLabel: {
      color: theme.colors.customGray[200],
    },
    paymentAmount: {
      color: theme.colors.customOlive[50],
    },
  });

export default HistoryCard;