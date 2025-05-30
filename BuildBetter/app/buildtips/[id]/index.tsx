import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { theme } from '@/app/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buildTipsData } from '@/data/buildtips';

interface BuildTipArticle {
  id: string;
  title: string;
  image: any;
  content: string;
  createdAt: string;
}

export default function ArticlePage() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const [article, setArticle] = useState<BuildTipArticle | null>(null);

  useEffect(() => {
    if (articleId) {
      const foundArticle = buildTipsData.find((item: BuildTipArticle) => item.id === articleId);
      setArticle(foundArticle || null);
    }
  }, [articleId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.customWhite[50]} />
        <View style={styles.notFoundContainer}>
          <Text style={[theme.typography.body1, styles.notFoundText]}>
            Artikel tidak ditemukan
          </Text>
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
        <Image
          source={article.image}
          style={styles.articleImage}
          resizeMode="cover"
        />

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Date */}
          <Text style={[theme.typography.caption, styles.articleDate]}>
            {formatDate(article.createdAt)}
          </Text>

          {/* Title */}
          <Text style={[theme.typography.title, styles.articleTitle]}>
            {article.title}
          </Text>

          {/* Content */}
          <Text style={[theme.typography.body1, styles.articleText]}>
            {article.content}
          </Text>
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
  articleDate: {
    color: theme.colors.customGray[200],
    marginBottom: 8,
  },
  articleTitle: {
    color: theme.colors.customOlive[50],
    marginBottom: 16,
    lineHeight: 28,
  },
  articleText: {
    color: theme.colors.customOlive[50],
    lineHeight: 24,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notFoundText: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
  },
});