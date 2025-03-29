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
  GestureHandlerRootView 
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
}

const FloorplanViewer: React.FC<FloorplanViewerProps> = ({ floorplans = [] }) => {
  const [currentFloor, setCurrentFloor] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const { width, height } = Dimensions.get('window');
  
  const currentFloorplan = floorplans[currentFloor];
  
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
    if (currentFloor < floorplans.length - 1) {
      setCurrentFloor(currentFloor + 1);
    }
  };

  const prevFloor = () => {
    if (currentFloor > 0) {
      setCurrentFloor(currentFloor - 1);
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
      
      {floorplans.length > 1 && (
        <View style={styles.floorControls}>
          <TouchableOpacity 
            style={[styles.floorButton, currentFloor === 0 && styles.floorButtonDisabled]} 
            onPress={prevFloor}
            disabled={currentFloor === 0}
          >
            <MaterialIcons name="keyboard-arrow-up" size={24} color={currentFloor === 0 ? '#CCCCCC' : theme.colors.customOlive[50]} />
          </TouchableOpacity>
          
          <View style={styles.floorIndicator}>
            {floorplans.map((floor, index) => (
              <Button 
                key={floor.id}
                title={floor.name}
                variant="outline"
                onPress={() => setCurrentFloor(index)}
                selected={currentFloor === index}
                minHeight={20}
                minWidth={20}
                paddingVertical={6}
                paddingHorizontal={6}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.floorButton, currentFloor === floorplans.length - 1 && styles.floorButtonDisabled]} 
            onPress={nextFloor}
            disabled={currentFloor === floorplans.length - 1}
          >
            <MaterialIcons name="keyboard-arrow-down" size={24} color={currentFloor === floorplans.length - 1 ? '#CCCCCC' : theme.colors.customOlive[50]} />
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
    right: 16,
    bottom: '5%',
    backgroundColor: 'rgba(236, 250, 246, 0.8)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  floorDot: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  floorDotActive: {
    backgroundColor: theme.colors.customOlive[50],
  },
  floorText: {
    fontSize: 12,
    color: theme.colors.customOlive[50],
  },
  floorTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  copyrightText: {
    color: theme.colors.customGray[200],
  },
});

export default FloorplanViewer;