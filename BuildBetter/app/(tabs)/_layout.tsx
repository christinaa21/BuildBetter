import { View, StyleSheet } from 'react-native';
import { Tabs } from "expo-router";
import theme from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type IconNames = ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: theme.colors.customGreen[300],
          tabBarInactiveTintColor: theme.colors.customGray[200],
          tabBarLabelStyle: [theme.typography.caption],
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: IconNames;

            switch (route.name) {
              case 'home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'consult':
                iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                break;
              case 'history':
                iconName = focused ? 'time' : 'time-outline';
                break;
              case 'profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'home';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="consult"
          options={{
            title: "Consult",
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.customWhite[50],
    borderTopWidth: 1,
    borderTopColor: theme.colors.customGray[200],
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    paddingTop: 4,
    height: 64,
  },
});