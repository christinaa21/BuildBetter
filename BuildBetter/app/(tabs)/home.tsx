import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Pressable, ImageBackground } from 'react-native';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import { theme } from '@/app/theme';
import { typography } from '@/app/theme/typography';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('@/assets/images/house.png')} style={styles.image} resizeMode="cover">
        {/* Hero Section with Background House */}
        <View style={styles.heroSection}>
          <View style={styles.headerContent}>
            <Text style={[theme.typography.title, styles.greeting]}>Hai, Yulia!</Text>
            <Text style={[theme.typography.body1, styles.subheading]}>
              Mau bangun atau renovasi apa hari ini?
            </Text>
          </View>

          {/* BuildPlan Button */}
          <View style={styles.buildPlanContainer}>
            <Button
              title="BuildPlan"
              variant="primary"
              onPress={() => {}}
              style={styles.buildPlanButton}
            />
            <Text style={[theme.typography.caption, styles.buttonCaption]}>
              Lihat hasil BuildPlan yang kamu simpan
            </Text>
          </View>
        </View>
      </ImageBackground>
      {/* BuildTips Card */}
      <View style={styles.buildTipsCard}>
        <Text style={[theme.typography.title, styles.buildTipsTitle]}>BuildTips</Text>

        <Text style={[theme.typography.body1, styles.buildTipsDescription]}>
          Yuk cari tahu lebih banyak tentang{'\n'}persiapan pembangunan dan renovasi rumah!
        </Text>
        
        {/* BuildTips Image */}
        <Image
          source={require('@/assets/images/buildtips.png')}
          style={styles.buildTipsImage}
          resizeMode="cover"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    justifyContent: 'center',
  },
  heroSection: {
    height: 400,
    paddingHorizontal: 16,
  },
  headerContent: {
    marginTop: 16,
    zIndex: 2,
    alignItems: 'center',
  },
  greeting: {
    color: theme.colors.customGreen[700],
    marginBottom: 4,
    alignItems: 'center',
  },
  subheading: {
    color: theme.colors.customGreen[500],
  },
  buildPlanContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  buildPlanButton: {
    width: '100%',
  },
  buttonCaption: {
    color: theme.colors.customGray[100],
    marginTop: 4,
    textAlign: 'center',
  },
  buildTipsCard: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  buildTipsTitle: {
    color: theme.colors.customGreen[700],
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.customGray[50],
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    ...typography.body1,
    color: theme.colors.customGray[100],
  },
  buildTipsDescription: {
    color: theme.colors.customGreen[500],
    marginBottom: 16,
  },
  buildTipsImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
});