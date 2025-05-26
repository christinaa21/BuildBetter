// components/ArchitectCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StyleProp, ViewStyle } from 'react-native';
import theme from '@/app/theme';
import Button from './Button';

export type ArchitectStatus = 'Dijadwalkan' | 'Berlangsung' | 'Berakhir';

export interface ArchitectCardProps {
  id: string;
  name: string;
  experience: string;
  location: string;
  chatPrice: number;
  meetingPrice: number;
  profileImage?: string;
  status?: ArchitectStatus; // Optional - only shown if user has consultation history
  onChatPress?: () => void;
  onMeetPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface StatusDisplayProps {
  backgroundColor: string;
  dotColor: string;
  textColor: string;
}

const statusStyles: Record<ArchitectStatus, StatusDisplayProps> = {
  'Dijadwalkan': { backgroundColor: '#CAE1DB', dotColor: theme.colors.customGreen[300], textColor: theme.colors.customOlive[50] },
  'Berlangsung': { backgroundColor: '#E3F2FD', dotColor: '#2196F3', textColor: theme.colors.customOlive[50] },
  'Berakhir': { backgroundColor: theme.colors.customGray[50], dotColor: theme.colors.customOlive[50], textColor: theme.colors.customOlive[50] },
};

const ArchitectCard: React.FC<ArchitectCardProps> = ({
  name,
  experience,
  location,
  chatPrice,
  meetingPrice,
  profileImage,
  status,
  onChatPress,
  onMeetPress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {status && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusChip, { backgroundColor: statusStyles[status].backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyles[status].dotColor }]} />
            <Text style={[theme.typography.overline, { color: statusStyles[status].textColor }]}>
              {status}
            </Text>
          </View>
        </View>
      )}
      
      <View style={[styles.content, status && styles.contentWithStatus]}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[theme.typography.subtitle2, styles.name]}>{name}</Text>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={[theme.typography.caption, styles.tagText]}>{experience}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={[theme.typography.caption, styles.tagText]}>Portofolio</Text>
              </View>
              <View style={styles.tag}>
                <Text style={[theme.typography.caption, styles.tagText]}>{location}</Text>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <Text style={[theme.typography.caption, styles.priceText]}>
                chat: {chatPrice}k/sesi
              </Text>
              <Text style={[theme.typography.caption, styles.priceText]}>
                tatap muka: {meetingPrice}k/sesi
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <Button
            title="lihat chat"
            variant="outline"
            onPress={onChatPress}
            minHeight={32}
            minWidth={80}
            paddingVertical={6}
            paddingHorizontal={12}
            textStyle={[theme.typography.caption, styles.buttonText]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  statusContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
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
  content: {
    marginTop: 0,
  },
  contentWithStatus: {
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.customGray[50],
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: theme.colors.customOlive[50],
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: theme.colors.customGray[50],
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: theme.colors.customOlive[50],
    fontSize: 10,
  },
  priceInfo: {
    marginTop: 4,
  },
  priceText: {
    color: theme.colors.customOlive[50],
    fontSize: 10,
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  buttonText: {
    fontSize: 10,
  },
});

export default ArchitectCard;