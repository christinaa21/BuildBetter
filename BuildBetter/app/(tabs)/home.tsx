import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import Button from '@/component/Button';
import { theme } from '@/app/theme';
import { Link, useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 0.45*SCREEN_HEIGHT;

export default function HomeScreen() {
  const name = 'Yulia';
  const router = useRouter();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(MAX_TRANSLATE_Y, Math.min(translateY.value, 0));
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        translateY.value = withSpring(0, { damping: 32 });
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 32 });
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [24, 5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }],
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('@/assets/images/house.png')} style={styles.image} resizeMode="cover">
        <View style={styles.heroSection}>
          <View style={styles.headerContent}>
            <Text style={[theme.typography.title, styles.greeting]}>Hai {name}!</Text>
            <Text style={[theme.typography.body1, styles.subheading]}>
              Mau bangun rumah seperti apa hari ini?
            </Text>
          </View>

          <View style={styles.buildPlanContainer}>
            <Button
              title="BuildPlan"
              variant="primary"
              onPress={() => router.push('../buildplan/onboarding')}
              style={styles.buildPlanButton}
            />
            <Link style={[theme.typography.caption, styles.buttonCaption]} href="../buildplan/saved">
              Lihat hasil BuildPlan yang kamu simpan
            </Link>
          </View>
        </View>
      </ImageBackground>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.buildTips, rBottomSheetStyle]}>
          <View style={styles.drawerHandle} />
          <Text style={[theme.typography.title, styles.buildTipsTitle]}>BuildTips</Text>
          <Text style={[theme.typography.body2, styles.buildTipsDescription]}>
            Yuk cari tahu lebih banyak tentang persiapan pembangunan dan renovasi rumah!
          </Text>
          <Image
            source={require('@/assets/images/buildtips.png')}
            style={styles.buildTipsImage}
            resizeMode="cover"
          />
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7E7E7C',
  },
  image: {
    justifyContent: 'center',
  },
  heroSection: {
    height: 0.55*SCREEN_HEIGHT,
    paddingHorizontal: 16,
  },
  headerContent: {
    marginTop: 12,
    alignItems: 'center',
  },
  greeting: {
    color: theme.colors.customOlive[100],
    marginBottom: 4,
  },
  subheading: {
    color: theme.colors.customOlive[50],
  },
  buildPlanContainer: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  buildPlanButton: {
    width: '70%',
  },
  buttonCaption: {
    color: theme.colors.customWhite[50],
    marginTop: 4,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  buildTips: {
    position: 'absolute',
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: theme.colors.customWhite[50],
    top: 0.55*SCREEN_HEIGHT,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  drawerHandle: {
    width: 75,
    height: 4,
    backgroundColor: theme.colors.customOlive[50],
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 2,
  },
  buildTipsTitle: {
    color: theme.colors.customOlive[50],
    marginBottom: 16,
  },
  buildTipsDescription: {
    color: theme.colors.customOlive[50],
    marginBottom: 16,
  },
  buildTipsImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
});