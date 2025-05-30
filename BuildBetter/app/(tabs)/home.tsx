import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Dimensions, ImageBackground, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '@/component/Button';
import Textfield from '@/component/Textfield';
import ArticleCard from '@/component/ArticleCard';
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
import { useAuth } from '@/context/AuthContext';
import { buildTipsData } from '@/data/buildtips';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 0.45*SCREEN_HEIGHT;

interface BuildTipArticle {
  id: string;
  title: string;
  image: string;
  content: string;
  createdAt: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const name = user?.username;
  const router = useRouter();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredArticles, setFilteredArticles] = useState<BuildTipArticle[]>(buildTipsData);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(buildTipsData);
    } else {
      const filtered = buildTipsData.filter((article: BuildTipArticle) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleArticlePress = (article: BuildTipArticle) => {
    // Navigate to article detail page
    router.push({
      pathname: '../buildtips/article',
      params: { articleId: article.id }
    });
  };

  // Gesture for the drawer handle only
  const drawerGesture = Gesture.Pan()
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

      <Animated.View style={[styles.buildTips, rBottomSheetStyle]}>
        {/* Expanded pan gesture area including header content */}
        <GestureDetector gesture={drawerGesture}>
          <View style={styles.drawerHeaderArea}>
            <View style={styles.drawerHandle} />
            <Text style={[theme.typography.title, styles.buildTipsTitle]}>BuildTips</Text>
            
            <View style={styles.searchContainer}>
              <Textfield
                icon={<MaterialIcons name="search" size={16}/>}
                placeholder="Cari artikel di sini..."
                value={searchQuery}
                onChangeText={handleSearch}
                paddingVertical={12}
                borderRadius={100}
              />
            </View>

            <Text style={[theme.typography.body2, styles.buildTipsDescription]}>
              Yuk cari tahu lebih banyak tentang persiapan pembangunan dan renovasi rumah!
            </Text>
          </View>
        </GestureDetector>

        <ScrollView 
          style={styles.articlesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articlesContainer}
        >
          {filteredArticles.map((item) => (
            <ArticleCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              content={item.content}
              createdAt={item.createdAt}
              onPress={() => handleArticlePress(item)}
            />
          ))}
        </ScrollView>
      </Animated.View>
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
    paddingBottom: 50
  },
  drawerHeaderArea: {
    paddingBottom: 8,
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
    marginBottom: 2,
  },
  searchContainer: {
    marginBottom: 4,
  },
  buildTipsDescription: {
    color: theme.colors.customOlive[50],
  },
  articlesContainer: {
    paddingBottom: 24,
  },
  articlesList: {
    flex: 1,
    marginTop: 8,
  },
});