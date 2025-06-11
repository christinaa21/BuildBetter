import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/app/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi, Article } from '@/services/api';
import Button from '@/component/Button';

export default function ArticlePage() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    } else {
      setLoading(false);
      setError('No article ID provided');
    }
  }, [articleId]);

  const fetchArticle = async () => {
    if (!articleId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.getPlanById(articleId); // Note: This seems to be the article endpoint based on your API
      
      if (response.code === 200 && response.data) {
        setArticle(response.data);
      } else {
        setError(response.error || 'Failed to fetch article');
        Alert.alert('Error', 'Failed to load article. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Network error occurred');
      Alert.alert('Error', 'Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchArticle();
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Split content by paragraphs and render with proper spacing
    return content.split('\n\n').map((paragraph, index) => (
      <Text key={index} style={[theme.typography.body1, styles.articleParagraph]}>
        {paragraph.trim()}
      </Text>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.customWhite[50]} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.customOlive[50]} />
          <Text style={[theme.typography.body2, styles.loadingText]}>
            Memuat artikel...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.customWhite[50]} />
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.customGray[200]} />
          <Text style={[theme.typography.body1, styles.errorText]}>
            {error || 'Article not found'}
          </Text>
          <Button
            title="Try Again"
            variant="outline"
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.customWhite[50]} />

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {article.banner && (
          <Image
            source={{ uri: article.banner }}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Author and Date */}
          <View style={styles.articleMeta}>
            {article.author && 
              <Text style={[theme.typography.caption, styles.authorText]}>
                Ditulis oleh {article.author}
              </Text>
            }
            <Text style={[theme.typography.caption, styles.articleDate]}>
              {formatDate(article.createdAt)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[theme.typography.title, styles.articleTitle]}>
            {article.title}
          </Text>

          {/* Content */}
          <View style={styles.contentContainer}>
            {formatContent(article.content)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[100],
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: theme.colors.customOlive[50],
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  articleImage: {
    width: '100%',
    height: 240,
  },
  articleContent: {
    padding: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorText: {
    color: theme.colors.customGray[200],
    fontWeight: '600',
  },
  articleDate: {
    color: theme.colors.customGray[200],
  },
  articleTitle: {
    color: theme.colors.customOlive[50],
    marginBottom: 16,
    lineHeight: 28,
  },
  contentContainer: {
    marginTop: 8,
  },
  articleParagraph: {
    color: theme.colors.customOlive[50],
    lineHeight: 24,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: theme.colors.customOlive[50],
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.customGray[200],
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
});