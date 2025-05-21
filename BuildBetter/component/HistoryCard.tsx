// components/HistoryCard.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import theme from '@/app/theme';
import Button from './Button';

export type HistoryStatus = 'Menunggu konfirmasi' | 'Dibatalkan' | 'Dijadwalkan' | 'Berlangsung' | 'Berakhir';
export type HistoryMetode = 'Chat' | 'Tatap Muka';

export interface HistoryCardProps {
  id: string;
  orderCreatedAt: string; // Date the order/history item was created
  arsitek: string;
  metode: HistoryMetode;
  tanggal: string; // Consultation date
  waktu: string;   // Consultation time
  kota: string;
  totalPembayaran: number;
  status: HistoryStatus;
  onHubungiLagi?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface StatusDisplayProps {
  backgroundColor: string;
  dotColor: string;
  textColor: string;
}

const statusStyles: Record<HistoryStatus, StatusDisplayProps> = {
  'Menunggu konfirmasi': { backgroundColor: '#FFF3E0', dotColor: '#FF9800', textColor: theme.colors.customOlive[50] },
  'Dibatalkan': { backgroundColor: '#FFEBEE', dotColor: '#F44336', textColor: theme.colors.customOlive[50] },
  'Dijadwalkan': { backgroundColor: theme.colors.customGreen[50], dotColor: theme.colors.customGreen[300], textColor: theme.colors.customGreen[500] },
  'Berlangsung': { backgroundColor: '#E3F2FD', dotColor: '#2196F3', textColor: theme.colors.customOlive[50] },
  'Berakhir': { backgroundColor: '#FFFDE7', dotColor: '#FFC107', textColor: theme.colors.customOlive[50] },
};

const HistoryCard: React.FC<HistoryCardProps> = ({
  orderCreatedAt,
  arsitek,
  metode,
  tanggal, // Consultation date
  waktu,   // Consultation time
  kota,
  totalPembayaran,
  status,
  onHubungiLagi,
  style,
}) => {
  const currentStatusStyle = statusStyles[status];

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
      <Text style={[theme.typography.body2, styles.infoText]}>Arsitek: {arsitek}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Metode: {metode}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Tanggal konsultasi: {tanggal}</Text>
      <Text style={[theme.typography.body2, styles.infoText]}>Waktu konsultasi: {waktu}</Text>
      {metode == 'Tatap Muka' &&
        <Text style={[theme.typography.body2, styles.infoText]}>Kota: {kota}</Text>
      }

      <View style={styles.footer}>
        <View>
          <Text style={[theme.typography.caption, styles.paymentLabel]}>Total Pembayaran</Text>
          <Text style={[theme.typography.subtitle1, styles.paymentAmount]}>
            Rp{totalPembayaran.toLocaleString('id-ID')}
          </Text>
        </View>
        {onHubungiLagi && (
          <Button
            title="Hubungi Lagi"
            variant="outline"
            onPress={onHubungiLagi}
            minHeight={36}
            minWidth={100}
            paddingVertical={8}
            paddingHorizontal={16}
            textStyle={theme.typography.caption}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 12,
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
    marginBottom: 8,
  },
  dateText: {
    color: theme.colors.customGray[200],
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.customGray[50],
    marginVertical: 8,
  },
  serviceTitle: { // Changed from serviceName
    color: theme.colors.customOlive[50],
    marginBottom: 2, // Reduced margin
  },
  serviceDescription: {
    marginBottom: 6, // Added margin below description
    fontStyle: 'italic',
    color: theme.colors.customOlive[100],
  },
  infoText: {
    color: theme.colors.customOlive[100],
    marginBottom: 3,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  paymentLabel: {
    color: theme.colors.customGray[200],
    fontSize: 11,
  },
  paymentAmount: {
    color: theme.colors.customOlive[50],
  },
});

export default HistoryCard;