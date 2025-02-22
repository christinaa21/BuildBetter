import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/app/theme';

interface TooltipProps {
  content: React.ReactNode | string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, position = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [iconPosition, setIconPosition] = useState({
    pageX: 0,
    pageY: 0,
    width: 0,
    height: 0,
  });

  const handleIconPress = (event: any) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setIconPosition({ pageX, pageY, width, height });
      setIsVisible(true);
    });
  };

  const renderTooltipContent = () => {
    const screenWidth = Dimensions.get('window').width;
    const tooltipWidth = Math.min(250, screenWidth - 40);
    
    let tooltipStyle: {
      position: 'absolute';
      width: number;
      backgroundColor: string;
      padding: number;
      borderRadius: number;
      right?: number;
      top?: number;
      left?: number;
      bottom?: number;
    } = {
      position: 'absolute' as const,
      width: tooltipWidth,
      backgroundColor: theme.colors.customGreen[300],
      padding: 12,
      borderRadius: 8,
    };

    // Calculate position based on icon location
    switch (position) {
      case 'left':
        tooltipStyle = {
          ...tooltipStyle,
          right: screenWidth - iconPosition.pageX + 8,
          top: iconPosition.pageY - 10,
        };
        break;
      case 'top':
        tooltipStyle = {
          ...tooltipStyle,
          left: iconPosition.pageX - tooltipWidth / 2,
          bottom: screenWidth - iconPosition.pageY + iconPosition.height + 8,
        };
        break;
      case 'bottom':
        tooltipStyle = {
          ...tooltipStyle,
          left: iconPosition.pageX - tooltipWidth / 2,
          top: iconPosition.pageY + iconPosition.height + 8,
        };
        break;
      case 'right':
      default:
        tooltipStyle = {
          ...tooltipStyle,
          left: iconPosition.pageX + iconPosition.width + 8,
          top: iconPosition.pageY - 10,
        };
    }

    return (
      <View style={tooltipStyle}>
        {typeof content === 'string' ? (
            <Text style={[theme.typography.body2, styles.tooltipText]}>{content}</Text>
        ) : (
            content
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleIconPress}
        style={styles.iconContainer}
      >
        <Ionicons name="help-circle-outline" size={24} color={theme.colors.customGreen[300]} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            {renderTooltipContent()}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  iconContainer: {
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tooltipText: {
    color: theme.colors.customWhite[50],
    lineHeight: 20,
  },
});

export default Tooltip;