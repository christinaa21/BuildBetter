import React, { useState, useRef } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Dimensions,
  TouchableOpacity,
  Animated,
  ImageSourcePropType
} from 'react-native';
import { 
  PinchGestureHandler, 
  State, 
  PinchGestureHandlerStateChangeEvent,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent 
} from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/app/theme';
import Button from './Button';

// Define the floorplan type
interface Floorplan {
  id: number;
  floor: number;
  name: string;
  source: ImageSourcePropType;
  orientation?: 'horizontal' | 'vertical';
}

interface FloorplanViewerProps {
  floorplans: Floorplan[];
  isLandscape?: boolean;
}

const FloorplanViewer: React.FC<FloorplanViewerProps> = ({ floorplans = [], isLandscape = false }) => {
  const sortedFloorplans = [...floorplans].sort((a, b) => b.floor - a.floor);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(sortedFloorplans.length - 1);
  const scale = useRef(new Animated.Value(1)).current;
  const { width, height } = Dimensions.get('window');
  
  const currentFloorplan = sortedFloorplans[currentFloorIndex];
  
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: false }
  );

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
        bounciness: 0,
      }).start();
    }
  };

  const nextFloor = () => {
    if (currentFloorIndex > 0) {
      setCurrentFloorIndex(currentFloorIndex - 1);
    }
  };

  const prevFloor = () => {
    if (currentFloorIndex < sortedFloorplans.length - 1) {
      setCurrentFloorIndex(currentFloorIndex + 1);
    }
  };

  // Pan gesture handler for swiping between floors
  const onPanGestureEvent = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      if (translationY > -50 && currentFloorIndex > 0) {
        nextFloor();
      }
      else if (translationY < 50 && currentFloorIndex < sortedFloorplans.length - 1) {
        prevFloor();
      }
    }
  };

  if (floorplans.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text>No floorplans available</Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onHandlerStateChange={onPanGestureEvent}
        activeOffsetY={[-20, 20]} // Make the pan gesture activate after 20px of movement
      >
        <View style={styles.panGestureContainer}>
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
              <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                maximumZoomScale={3}
                minimumZoomScale={1}
                horizontal={currentFloorplan.orientation === 'horizontal'}
              >
                <Image 
                  source={currentFloorplan.source}
                  style={[
                    styles.floorplanImage,
                    currentFloorplan.orientation === 'horizontal' 
                      ? { width: width * 0.9, height: height * 0.7 } 
                      : { width: width * 0.7, height: height * 0.9 }
                  ]}
                  resizeMode="contain"
                />
              </ScrollView>
            </Animated.View>
          </PinchGestureHandler>
        </View>
      </PanGestureHandler>
      
      {floorplans.length > 1 && (
        <View style={[
          styles.floorControls,
          isLandscape ? styles.floorControlsLandscape : styles.floorControlsPortrait
        ]}>
          <TouchableOpacity 
            style={[styles.floorButton, currentFloorIndex === 0 && styles.floorButtonDisabled]} 
            onPress={nextFloor}
            disabled={currentFloorIndex === 0}
          >
            <MaterialIcons name="keyboard-arrow-up" size={24} color={currentFloorIndex === 0 ? '#CCCCCC' : theme.colors.customOlive[50]} />
          </TouchableOpacity>
          
          <View style={styles.floorIndicator}>
            {sortedFloorplans.map((floor, index) => (
              <Button 
                key={floor.id}
                title={floor.name}
                variant="outline"
                onPress={() => setCurrentFloorIndex(index)}
                selected={currentFloorIndex === index}
                minHeight={20}
                minWidth={20}
                paddingVertical={6}
                paddingHorizontal={isLandscape ? 16 : 8}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.floorButton, currentFloorIndex === floorplans.length - 1 && styles.floorButtonDisabled]} 
            onPress={prevFloor}
            disabled={currentFloorIndex === floorplans.length - 1}
          >
            <MaterialIcons name="keyboard-arrow-down" size={24} color={currentFloorIndex === floorplans.length - 1 ? '#CCCCCC' : theme.colors.customOlive[50]} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.copyrightContainer}>
        <Text style={[styles.copyrightText, theme.typography.overline]}>© Designed by Naila Juniah</Text>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  panGestureContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  floorplanImage: {
    resizeMode: 'contain',
  },
  floorControls: {
    position: 'absolute',
    backgroundColor: 'rgba(236, 250, 246, 0.8)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floorControlsPortrait: {
    right: 16,
  },
  floorControlsLandscape: {
    right: 16,
    bottom: '5%',
  },
  floorButton: {
    padding: 6,
  },
  floorButtonDisabled: {
    opacity: 0.5,
  },
  floorIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  copyrightText: {
    color: theme.colors.customGray[200],
  },
  swipeIndicatorContainer: {
    position: 'absolute',
    bottom: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.7,
    zIndex: 5,
  },
  swipeIndicatorText: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default FloorplanViewer;