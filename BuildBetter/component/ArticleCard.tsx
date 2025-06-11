import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@/app/theme';

interface ArticleCardProps {
  id: string;
  title: string;
  image: string | any; // Now accepts both URL string and local image
  content: string;
  createdAt: string;
  onPress: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  image,
  content,
  createdAt,
  onPress
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExternalImage = typeof image === 'string' && (image.startsWith('http') || image.startsWith('https'));

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const renderImage = () => {
    if (imageError) {
      return (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>Image not available</Text>
        </View>
      );
    }

    return (
      <>
        <Image
          source={isExternalImage ? { uri: image } : image}
          style={styles.cardImage}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {imageLoading && isExternalImage && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="small" 
              color={theme.colors.customOlive[50]} 
            />
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {renderImage()}
      </View>
      <View style={styles.cardContent}>
        <Text style={[theme.typography.caption, styles.cardDate]}>
          {formatDate(createdAt)}
        </Text>
        <Text style={[theme.typography.body2, styles.cardTitle]} numberOfLines={3}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.customWhite[50],
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: theme.colors.customGray[200],
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.customGray[50] || '#f5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: theme.colors.customGray[100] || '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.customGray[200],
    fontSize: 12,
    textAlign: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardDate: {
    color: theme.colors.customGray[200],
    marginBottom: 4,
  },
  cardTitle: {
    color: theme.colors.customOlive[50],
    lineHeight: 20,
  },
});

export default ArticleCard;