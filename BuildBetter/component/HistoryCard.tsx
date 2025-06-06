// components/HistoryCard.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import theme from '@/app/theme';
import Button from './Button';
import { Architect } from '@/services/api';

export type HistoryStatus = 'Menunggu pembayaran' | 'Menunggu konfirmasi' | 'Dibatalkan' | 'Dijadwalkan' | 'Berlangsung' | 'Berakhir';
export type HistoryMetode = 'Chat' | 'Tatap Muka';

export interface HistoryCardProps {
  id: string;
  orderCreatedAt: string; // The formatted creation date for display
  createdAtISO: string; // The raw ISO string for timer logic
  arsitek: Architect; // Pass the whole architect object for re-booking
  metode: HistoryMetode;
  tanggal: string; 
  waktu: string;   
  kota: string;
  totalPembayaran: number;
  status: HistoryStatus;
  reason?: string | null; // For cancellation reason
  roomId?: string | null; // For chat
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

const HistoryCard: React.FC<HistoryCardProps> = (props) => {
  const {
    id,
    orderCreatedAt,
    createdAtISO,
    arsitek,
    metode,
    tanggal,
    waktu,
    kota,
    totalPembayaran,
    status,
    reason,
    roomId,
    style,
  } = props;
  
  const router = useRouter();
  const currentStatusStyle = statusStyles[status];

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
        createdAt: createdAtISO,
      }
    });
  };

  const handleLihatChat = () => {
    // Navigate to the chat screen with the roomId
    // Example: router.push(`/chat/${roomId}`);
    console.log('Navigate to chat room:', roomId);
    alert('Fungsi "Lihat Chat" belum diimplementasikan.');
  };
  
  const handleLihatStatus = () => {
    alert('Pembayaran Anda sedang diverifikasi oleh admin. Silakan cek kembali nanti.');
  };

  const renderActionButton = () => {
    const buttonProps = {
      minHeight: 36,
      minWidth: 100,
      paddingVertical: 8,
      paddingHorizontal: 16,
      textStyle: theme.typography.caption,
    };

    switch (status) {
      case 'Menunggu pembayaran':
        return (
          <Button
            title="Lanjut Bayar"
            variant="primary"
            onPress={handleLanjutBayar}
            {...buttonProps}
          />
        );
      case 'Menunggu konfirmasi':
        return (
          <Button
            title="Lihat Status"
            variant="outline"
            onPress={handleLihatStatus}
            {...buttonProps}
          />
        );
      case 'Dijadwalkan':
      case 'Berlangsung':
        return (
          <Button
            title="Lihat Chat"
            variant="primary"
            onPress={handleLihatChat}
            disabled={!roomId}
            {...buttonProps}
          />
        );
      case 'Berakhir':
      case 'Dibatalkan':
        return (
          <Button
            title="Hubungi Lagi"
            variant="outline"
            onPress={handleHubungiLagi}
            {...buttonProps}
          />
        );
      default:
        return null;
    }
  };

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
      {status === 'Dibatalkan' && reason &&
        <Text style={[theme.typography.body2, styles.reasonText]}>Alasan: {reason}</Text>
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