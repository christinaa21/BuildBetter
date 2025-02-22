import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
import Button from './Button';
import theme from '@/app/theme';

interface CardProps {
  title: string;
  image: ImageSourcePropType;
  buttonTitle?: string;
  onButtonPress?: () => void;
  imageStyle?: object;
  style?: object;
  buttonVariant?: 'primary' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  title,
  image,
  buttonTitle,
  onButtonPress,
  imageStyle,
  style,
  buttonVariant = 'outline',
}) => {
  return (
    <TouchableOpacity activeOpacity={0.4}>
      <View style={[styles.card, style]} onTouchEnd={onButtonPress}>
        <Image 
            source={image} 
            style={[styles.cardImage, imageStyle]} 
            resizeMode="cover"
        />
        <Text style={styles.cardTitle}>{title}</Text>
        {buttonTitle && (
            <Button
            title={buttonTitle}
            variant={buttonVariant}
            onPress={onButtonPress}
            style={styles.button}
            />
        )}
      </View>
    </TouchableOpacity>
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
  cardTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.customOlive[50],
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});