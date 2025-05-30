// components/ArchitectCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StyleProp, ViewStyle, Linking } from 'react-native';
import theme from '@/app/theme';
import Button from './Button';
import { FontAwesome6, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export type ArchitectStatus = 'Dijadwalkan' | 'Berlangsung' | 'Berakhir';

export interface ArchitectCardProps {
  id: string;
  username: string;
  experience: number;
  city: string;
  rateOnline: number;
  rateOffline: number;
  portfolio?: string;
  photo?: string;
  status?: ArchitectStatus; // Optional - only shown if user has consultation history
  onChatPress?: () => void;
  onBookPress?: () => void;
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

function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

// Helper function to safely handle URL opening
const handlePortfolioPress = (portfolio: string | undefined) => {
  if (!portfolio || typeof portfolio !== 'string' || portfolio.trim() === '') {
    return;
  }
  
  try {
    // Basic URL validation
    const url = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Failed to open portfolio URL:', err);
    });
  } catch (error) {
    console.warn('Invalid portfolio URL:', error);
  }
};

// Helper function to safely format numbers
const formatRate = (rate: number | null | undefined): string => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '0';
  }
  return Math.max(0, rate).toString();
};

// Helper function to safely format experience
const formatExperience = (experience: number | null | undefined): string => {
  if (experience === null || experience === undefined || isNaN(experience)) {
    return '0';
  }
  return Math.max(0, experience).toString();
};

const ArchitectCard: React.FC<ArchitectCardProps> = ({
  username,
  experience,
  city,
  rateOnline,
  rateOffline,
  photo,
  status,
  portfolio,
  onChatPress,
  onBookPress,
  style,
}) => {
  // Safe fallbacks for required props
  const safeUsername = truncate(username, 20) || 'Unknown Architect';
  const safeCity = truncate(city, 24) || 'Unknown City';
  const safeExperience = formatExperience(experience);
  const safeRateOnline = formatRate(rateOnline);
  const safeRateOffline = formatRate(rateOffline);
  
  // Check if portfolio is valid
  const hasValidPortfolio = portfolio && 
    typeof portfolio === 'string' && 
    portfolio.trim() !== '';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.4}
      onPress={onChatPress}>
        <Image 
          source={photo && typeof photo === 'string' && photo.trim() !== '' 
            ? { uri: photo } 
            : require('@/assets/images/blank-profile.png')
          } 
          style={styles.photo}
          defaultSource={require('@/assets/images/blank-profile.png')}
          onError={() => {
            // Handle image loading error silently
            console.warn('Failed to load architect photo');
          }}
        />
        <View style={[{flex: 1}]}>
          <View style={styles.header}>
            <Text style={[theme.typography.subtitle2, styles.name]}>
              {safeUsername}
            </Text>
            {status && statusStyles[status] && (
              <View style={[styles.statusChip, { backgroundColor: statusStyles[status].backgroundColor }]}>
                <View style={[styles.statusDot, { backgroundColor: statusStyles[status].dotColor }]} />
                <Text style={[theme.typography.overline, { color: statusStyles[status].textColor }]}>
                  {status}
                </Text>
              </View>
            )}
          </View>
          <View>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <FontAwesome6 name="suitcase" size={10} color={theme.colors.customGreen[200]} />
                <Text style={[theme.typography.caption, styles.tagText]}>
                  {safeExperience} tahun
                </Text>
              </View>
              <View style={styles.tag}>
                <FontAwesome6 name="location-dot" size={10} color={theme.colors.customGreen[200]} />
                <Text style={[theme.typography.caption, styles.tagText]}>
                  {safeCity}
                </Text>
              </View>
            </View>
            <View style={styles.priceInfo}>
              <Text style={[theme.typography.caption, styles.priceText]}>
                Chat: Rp{safeRateOnline}rb/sesi
              </Text>
              <Text style={[theme.typography.caption, styles.priceText]}>
                Tatap muka: Rp{safeRateOffline}rb/sesi
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <Button
                title="Portfolio"
                icon={<MaterialIcons name="link" size={8} color={theme.colors.customGreen[300]} />}
                variant="outline"
                onPress={() => handlePortfolioPress(portfolio)}
                minHeight={20}
                minWidth={80}
                paddingVertical={6}
                paddingHorizontal={10}
                textStyle={[theme.typography.caption]}
                disabled={!hasValidPortfolio}
              />
              
              {status && statusStyles[status] ? (
                <Button
                  title="Lihat Chat"
                  icon={<MaterialCommunityIcons name="chat" size={8} color={theme.colors.customWhite[50]} />}
                  variant="primary"
                  onPress={onChatPress}
                  minHeight={20}
                  minWidth={80}
                  paddingVertical={4}
                  paddingHorizontal={10}
                  textStyle={[theme.typography.caption]}
                />
                ) : (
                <Button
                  title="Hubungi"
                  icon={<MaterialCommunityIcons name="chat" size={8} color={theme.colors.customWhite[50]} />}
                  variant="primary"
                  onPress={onBookPress}
                  minHeight={20}
                  minWidth={80}
                  paddingVertical={4}
                  paddingHorizontal={10}
                  textStyle={[theme.typography.caption]}
                />
              )
            }
            </View>
        </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: theme.colors.customGray[200],
    elevation: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    flex: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    marginBottom: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 12,
    alignSelf: 'flex-start'
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.customGray[50],
    borderWidth: 1,
    borderColor: theme.colors.customGray[100],
  },
  name: {
    color: theme.colors.customOlive[50],
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[100],
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginVertical: 4,
    elevation: 1,
  },
  tagText: {
    marginLeft: 4,
    color: theme.colors.customGreen[200],
    fontWeight: '100',
    fontFamily: 'poppins',
    fontSize: 12
  },
  priceInfo: {
    marginTop: 4,
  },
  priceText: {
    color: theme.colors.customOlive[50],
    fontSize: 11
  },
  actionButtons: {
    alignItems: 'center',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  arrowContainer: {
    justifyContent: 'center',
  },
});

export default ArchitectCard;