import React, { useState, useRef } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Dimensions,
  Animated,
  ImageSourcePropType,
  ActivityIndicator
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
import FilterDropdown from './FilterDropdown';

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
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: number]: boolean }>({});
  const scale = useRef(new Animated.Value(1)).current;
  const { width, height } = Dimensions.get('window');
  
  const currentFloorplan = sortedFloorplans[currentFloorIndex];
  
  // Convert floorplans to filter options
  const floorFilterOptions = sortedFloorplans.map((floor, index) => ({
    id: floor.id,
    label: floor.name,
    value: index
  }));
  
  // Handle filter selection
  const handleFloorFilterChange = (selectedValues: any[]) => {
    if (selectedValues.length > 0) {
      setCurrentFloorIndex(selectedValues[0]);
    }
  };
  
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

  // Handle image load
  const handleImageLoad = (floorplanId: number) => {
    setImagesLoaded(prev => ({
      ...prev,
      [floorplanId]: true
    }));
  };

  // Check if current image is loaded
  const isCurrentImageLoaded = imagesLoaded[currentFloorplan?.id];

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
        activeOffsetY={[-20, 20]}
      >
        <View style={styles.panGestureContainer}>
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
              {!isCurrentImageLoaded && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.customGreen[500]} />
                  <Text style={styles.loadingText}>Loading denah rumah...</Text>
                </View>
              )}
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
                      : { width: width * 0.9, height: height * 1.4 }
                  ]}
                  resizeMode="contain"
                  onLoad={() => handleImageLoad(currentFloorplan.id)}
                />
              </ScrollView>
            </Animated.View>
          </PinchGestureHandler>
        </View>
      </PanGestureHandler>
      
      {floorplans.length > 1 && (
        <View style={[
          styles.floorIndicator, 
          { right: isLandscape ? '70%' : '6%' }, 
          { bottom: isLandscape 
            ? '58%' 
            : currentFloorplan.orientation === 'vertical' 
              ? '10%' 
              : '1%' 
          }
        ]}>
          <FilterDropdown 
            options={floorFilterOptions}
            selectedValues={[currentFloorIndex]}
            onSelectionChange={handleFloorFilterChange}
            allowMultiple={false}
            placeholder="Select Floor"
            buttonWidth={126}
            dropdownWidth={130}
            maxHeight={120}
            icon={<MaterialIcons name="layers" size={16} />}
            position={isLandscape ? 'below' : 'above'}
          />
        </View>
      )}
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
  floorIndicator: {
    position: 'absolute',
    zIndex: 1000,
    paddingVertical: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.customGreen[200],
  },
});

export default FloorplanViewer;