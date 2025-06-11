import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Dimensions, ImageBackground, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
import { authApi, Article } from '@/services/api'; // Import API and Article type

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 0.45*SCREEN_HEIGHT;

export default function HomeScreen() {
  const { user } = useAuth();
  const name = user?.username;
  const router = useRouter();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles from API on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter((article: Article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.getArticles();
      
      if (response.code === 200 && response.data) {
        // Sort articles by createdAt in descending order (newest first)
        const sortedArticles = response.data.sort((a, b) => {
          // Convert createdAt strings to Date objects for comparison
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Newest to oldest
        });
        
        setArticles(sortedArticles);
        setFilteredArticles(sortedArticles);
      } else {
        setError(response.error || 'Failed to fetch articles');
        Alert.alert('Error', 'Failed to load articles. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Network error occurred');
      Alert.alert('Error', 'Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleArticlePress = (article: Article) => {
    // Navigate to article detail page
    router.push({
      pathname: '../buildtips/article',
      params: { articleId: article.id }
    });
  };

  const handleRefresh = () => {
    fetchArticles();
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

  const renderArticlesList = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.customOlive[50]} />
          <Text style={[theme.typography.body2, styles.loadingText]}>
            Memuat artikel...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.customGray[200]} />
          <Text style={[theme.typography.body2, styles.errorText]}>
            {error}
          </Text>
          <Button
            title="Try Again"
            variant="outline"
            onPress={handleRefresh}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (filteredArticles.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="article" size={48} color={theme.colors.customGray[200]} />
          <Text style={[theme.typography.body2, styles.emptyText]}>
            {searchQuery ? 'No articles found matching your search' : 'No articles available'}
          </Text>
        </View>
      );
    }

    return (
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
            image={item.banner} // Using banner from API instead of image
            content={item.content}
            createdAt={item.createdAt}
            onPress={() => handleArticlePress(item)}
          />
        ))}
      </ScrollView>
    );
  };

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

        {renderArticlesList()}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  loadingText: {
    color: theme.colors.customOlive[50],
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.customGray[200],
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.customGray[200],
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
});