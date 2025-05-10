import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import theme from '../theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.heading}>Profile</Text>
          
          {user && (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.value}>{user.username || 'Not available'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email || 'Not available'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{user.role || 'Not available'}</Text>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    backgroundColor: theme.colors.customWhite[100],
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: theme.colors.customOlive[100],
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: theme.colors.customOlive[100],
    width: 100,
  },
  value: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: theme.colors.customOlive[100],
    flex: 1,
  },
  logoutButton: {
    backgroundColor: theme.colors.customOlive[100],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: theme.colors.customWhite[50],
  },
});