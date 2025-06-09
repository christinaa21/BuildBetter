// component/DevTools.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../app/theme';

export type DevToolsState = {
  consultationType: 'online' | 'offline';
  chatStatus: 'waiting' | 'active' | 'ended';
  showLocationCard: boolean;
  hasMessages: boolean;
  architectName: string;
  consultationDate: string;
  consultationTime: string;
  location: string;
};

interface DevToolsProps {
  onStateChange: (state: DevToolsState) => void;
  currentState: DevToolsState;
}

export default function DevTools({ onStateChange, currentState }: DevToolsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const updateState = (updates: Partial<DevToolsState>) => {
    onStateChange({ ...currentState, ...updates });
  };

  const presetStates = [
    {
      name: '🔴 Online Chat - Waiting',
      state: {
        consultationType: 'online' as const,
        chatStatus: 'waiting' as const,
        showLocationCard: false,
        hasMessages: false,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: '',
      }
    },
    {
      name: '🟢 Online Chat - Active',
      state: {
        consultationType: 'online' as const,
        chatStatus: 'active' as const,
        showLocationCard: false,
        hasMessages: true,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: '',
      }
    },
    {
      name: '⚫ Online Chat - Ended',
      state: {
        consultationType: 'online' as const,
        chatStatus: 'ended' as const,
        showLocationCard: false,
        hasMessages: true,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: '',
      }
    },
    {
      name: '🔴 Tatap Muka - Waiting',
      state: {
        consultationType: 'offline' as const,
        chatStatus: 'waiting' as const,
        showLocationCard: false,
        hasMessages: false,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: 'Jalan Cendrawasih, Raharja, Jawa Barat',
      }
    },
    {
      name: '🟢 Tatap Muka - Active',
      state: {
        consultationType: 'offline' as const,
        chatStatus: 'active' as const,
        showLocationCard: true,
        hasMessages: true,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: 'Jalan Cendrawasih, Raharja, Jawa Barat',
      }
    },
    {
      name: '⚫ Tatap Muka - Ended',
      state: {
        consultationType: 'offline' as const,
        chatStatus: 'ended' as const,
        showLocationCard: true,
        hasMessages: true,
        architectName: 'Erensa Ratu',
        consultationDate: '31 Mei 2025',
        consultationTime: '17:00 - 18:00',
        location: 'Jalan Cendrawasih, Raharja, Jawa Barat',
      }
    }
  ];

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <>
      {/* Floating Dev Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="build" size={20} color="white" />
        <Text style={styles.devText}>DEV</Text>
      </TouchableOpacity>

      {/* Dev Tools Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isMinimized && styles.minimized]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🛠️ Dev Tools</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={() => setIsMinimized(!isMinimized)}
                  style={styles.headerButton}
                >
                  <MaterialIcons 
                    name={isMinimized ? "expand-less" : "expand-more"} 
                    size={20} 
                    color={theme.colors.customOlive[50]} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsVisible(false)}
                  style={styles.headerButton}
                >
                  <MaterialIcons name="close" size={20} color={theme.colors.customOlive[50]} />
                </TouchableOpacity>
              </View>
            </View>

            {!isMinimized && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Presets */}
                <Text style={styles.sectionTitle}>Quick States</Text>
                {presetStates.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetButton}
                    onPress={() => updateState(preset.state)}
                  >
                    <Text style={styles.presetText}>{preset.name}</Text>
                  </TouchableOpacity>
                ))}

                {/* Manual Controls */}
                <Text style={styles.sectionTitle}>Manual Controls</Text>
                
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Consultation Type:</Text>
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        currentState.consultationType === 'online' && styles.segmentActive
                      ]}
                      onPress={() => updateState({ consultationType: 'online' })}
                    >
                      <Text style={[
                        styles.segmentText,
                        currentState.consultationType === 'online' && styles.segmentActiveText
                      ]}>Online</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        currentState.consultationType === 'offline' && styles.segmentActive
                      ]}
                      onPress={() => updateState({ consultationType: 'offline' })}
                    >
                      <Text style={[
                        styles.segmentText,
                        currentState.consultationType === 'offline' && styles.segmentActiveText
                      ]}>Tatap Muka</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Chat Status:</Text>
                  <View style={styles.segmentedControl}>
                    {(['waiting', 'active', 'ended'] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.segmentButton,
                          styles.smallSegment,
                          currentState.chatStatus === status && styles.segmentActive
                        ]}
                        onPress={() => updateState({ chatStatus: status })}
                      >
                        <Text style={[
                          styles.segmentText,
                          styles.smallSegmentText,
                          currentState.chatStatus === status && styles.segmentActiveText
                        ]}>
                          {status === 'waiting' ? 'Wait' : status === 'active' ? 'Active' : 'End'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.controlLabel}>Show Location Card:</Text>
                  <Switch
                    value={currentState.showLocationCard}
                    onValueChange={(value) => updateState({ showLocationCard: value })}
                    trackColor={{ false: theme.colors.customGray[100], true: theme.colors.customGreen[300] }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.controlLabel}>Has Messages:</Text>
                  <Switch
                    value={currentState.hasMessages}
                    onValueChange={(value) => updateState({ hasMessages: value })}
                    trackColor={{ false: theme.colors.customGray[100], true: theme.colors.customGreen[300] }}
                  />
                </View>

                {/* Current State Display */}
                <Text style={styles.sectionTitle}>Current State</Text>
                <View style={styles.stateDisplay}>
                  <Text style={styles.stateText}>Type: {currentState.consultationType}</Text>
                  <Text style={styles.stateText}>Status: {currentState.chatStatus}</Text>
                  <Text style={styles.stateText}>Location Card: {currentState.showLocationCard ? 'Yes' : 'No'}</Text>
                  <Text style={styles.stateText}>Messages: {currentState.hasMessages ? 'Yes' : 'No'}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  devText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  minimized: {
    maxHeight: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.customGray[50],
  },
  title: {
    ...theme.typography.subtitle1,
    color: theme.colors.customOlive[50],
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.customOlive[50],
    marginTop: 16,
    marginBottom: 8,
  },
  presetButton: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.customGreen[300],
  },
  presetText: {
    ...theme.typography.body2,
    color: theme.colors.customGreen[300],
    fontWeight: '500',
  },
  controlRow: {
    marginBottom: 16,
  },
  controlLabel: {
    ...theme.typography.body2,
    color: theme.colors.customOlive[50],
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.customGray[50],
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  smallSegment: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: theme.colors.customGreen[300],
  },
  segmentText: {
    ...theme.typography.body2,
    color: theme.colors.customGray[200],
  },
  smallSegmentText: {
    fontSize: 12,
  },
  segmentActiveText: {
    color: theme.colors.customWhite[50],
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stateText: {
    ...theme.typography.caption,
    color: theme.colors.customGray[200],
    marginBottom: 4,
  },
});