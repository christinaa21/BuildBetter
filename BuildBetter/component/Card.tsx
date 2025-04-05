import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
import Button from './Button';
import theme from '@/app/theme';

interface CardProps {
  title: string;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  buttonTitle?: string;
  description?: string;
  onButtonPress?: () => void;
  imageStyle?: object;
  style?: object;
  buttonVariant?: 'primary' | 'outline';
  showButton?: boolean;
  touchable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  image,
  icon,
  buttonTitle,
  description,
  onButtonPress,
  imageStyle,
  style,
  buttonVariant = 'outline',
  showButton = true,
  touchable = true,
}) => {
  // Card content component to avoid duplication
  const CardContent = () => (
    <View style={[styles.card, style]}>
      {image && (
        <Image 
            source={image} 
            style={[styles.cardImage, imageStyle]} 
            resizeMode="cover"
        />
      )}
      {icon && !image && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={styles.cardTitle}>{title}</Text>
      {description && (
        <Text style={styles.cardDescription}>{description}</Text>
      )}
      {buttonTitle && showButton && (
          <Button
          title={buttonTitle}
          variant={buttonVariant}
          onPress={onButtonPress}
          style={styles.button}
          minHeight={24}
          paddingVertical={8}
          />
      )}
    </View>
  );

  // Conditionally wrap content in TouchableOpacity based on touchable prop
  return touchable ? (
    <TouchableOpacity activeOpacity={0.4} onPress={onButtonPress}>
      <CardContent />
    </TouchableOpacity>
  ) : (
    <CardContent />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.customGray[50],
    borderRadius: 16,
    padding: 8,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ECFAF6'
  },
  cardTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.customOlive[100],
    textAlign: 'center',
  },
  cardDescription: {
    ...theme.typography.caption,
    color: 'grey',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    width: '100%',
  },
});