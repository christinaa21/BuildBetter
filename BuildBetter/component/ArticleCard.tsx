import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/app/theme';

interface ArticleCardProps {
  id: string;
  title: string;
  image: any;
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={image}
        style={styles.cardImage}
        resizeMode="cover"
      />
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
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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