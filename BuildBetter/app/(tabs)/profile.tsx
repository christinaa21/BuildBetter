import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import theme from '../theme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Button from '@/component/Button';

interface UserProfileResponse {
  id: string;
  phoneNumber: string;
  email: string;
  username:string;
  province: string;
  city: string;
  photos: null | string;
  role: string;
  createdAt: string;
}

interface MenuOptionProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

// Constants for styling
const PROFILE_IMAGE_SIZE = 100;
const GREEN_HEADER_VIEW_HEIGHT = 120;
const WHITE_SHEET_BORDER_RADIUS = 25;

export default function Profile() {
  const { logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authApi.getUserProfile();
        if (response.code === 200 && response.data) {
          setUserProfile(response.data);
        } else {
          Alert.alert('Error', response.error || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Keluar",
      "Anda yakin ingin keluar?",
      [
        {
          text: "Tidak",
          style: "cancel"
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              await logout();
              router.replace('/');  // Navigate back to login screen
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getProfileImage = () => {
    if (!userProfile || userProfile.photos === null) {
      return require('@/assets/images/blank-profile.png');
    }

    try {
      const photoNumber = parseInt(userProfile.photos);
      if (isNaN(photoNumber) || photoNumber < 1 || photoNumber > 11) {
        return require('@/assets/images/blank-profile.png');
      }

      switch(photoNumber) {
        case 1: return require('@/assets/images/1.png');
        case 2: return require('@/assets/images/2.png');
        case 3: return require('@/assets/images/3.png');
        case 4: return require('@/assets/images/4.png');
        case 5: return require('@/assets/images/5.png');
        case 6: return require('@/assets/images/6.png');
        case 7: return require('@/assets/images/7.png');
        case 8: return require('@/assets/images/8.png');
        case 9: return require('@/assets/images/9.png');
        case 10: return require('@/assets/images/10.png');
        case 11: return require('@/assets/images/11.png');
        default: return require('@/assets/images/blank-profile.png');
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      return require('@/assets/images/blank-profile.png');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
      </View>
    );
  }

  const MenuOption: React.FC<MenuOptionProps> = ({ icon, title, onPress }) => (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <Text style={[theme.typography.body1, styles.menuText]}>{title}</Text>
        <Feather name="chevron-right" size={24} color={theme.colors.customGray[200]} />
      </TouchableOpacity>
      <View style={styles.menuDivider} />
    </View>
  );

  return (
    <View style={styles.baseContainer}>
      <View style={[styles.greenHeaderBackground, { height: GREEN_HEADER_VIEW_HEIGHT + insets.top, paddingTop: insets.top + 12 }]}>
        <Text style={[theme.typography.title, {color: theme.colors.customGreen[600]}]}>Profil</Text>
      </View>

      {/* Profile Image - Positioned absolutely */}
      <View style={[
        styles.profileImageWrapper,
        { top: (GREEN_HEADER_VIEW_HEIGHT + insets.top) - (PROFILE_IMAGE_SIZE / 1.6) }
      ]}>
        <Image
          source={getProfileImage()}
          style={styles.profileImage}
        />
      </View>

      <ScrollView
        style={[styles.whiteSheet, { marginTop: -WHITE_SHEET_BORDER_RADIUS }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileTextContent}>
          <Text style={[theme.typography.title, {color: theme.colors.customGreen[500]}]}>{userProfile?.username || 'User'}</Text>
          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <Text style={[styles.editProfileText, theme.typography.body2]}>Edit profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <MenuOption
            icon={<Feather name="bookmark" size={24} color={theme.colors.customGreen[300]} />}
            title="Hasil BuildPlan"
            onPress={() => router.push('/buildplan/saved')}
          />
          <MenuOption
            icon={<Feather name="phone" size={24} color={theme.colors.customGreen[300]} />}
            title="Pusat Bantuan"
            onPress={() => router.push('/profile/help')}
          />
          <MenuOption
            icon={<MaterialIcons name="lock-outline" size={24} color={theme.colors.customGreen[300]} />}
            title="Ubah Kata Sandi"
            onPress={() => router.push('/profile/change-password')}
          />
        </View>

        <View style={styles.footerContainer}>
          <Button
            title={'Keluar'}
            minHeight={10}
            paddingVertical={10}
            variant="outline"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[50],
  },
  greenHeaderBackground: {
    backgroundColor: theme.colors.customGreen[50],
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  profileImageWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    borderWidth: 4,
    borderColor: theme.colors.customWhite[50],
  },
  whiteSheet: {
    flex: 1, // Takes remaining space
    backgroundColor: theme.colors.customWhite[50],
    borderTopLeftRadius: WHITE_SHEET_BORDER_RADIUS,
    borderTopRightRadius: WHITE_SHEET_BORDER_RADIUS,
    paddingTop: (PROFILE_IMAGE_SIZE / 2) + 20,
    paddingHorizontal: 24,
  },
  profileTextContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  editProfileText: {
    marginTop: 6,
    textDecorationLine: 'underline',
    color: theme.colors.customGreen[200]
  },
  menuSection: {
    backgroundColor: theme.colors.customWhite[50],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.customWhite[50],
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    color: theme.colors.customOlive[50]
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.customGray[100],
    marginHorizontal: 8,
  },
  footerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
});