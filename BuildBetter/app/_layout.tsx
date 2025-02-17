import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import {
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
} from "@expo-google-fonts/poppins";
import theme from "./theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_400Regular_Italic,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    Poppins_700Bold_Italic
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="register" options = {{
        headerShown: true,
        headerTitle: "Daftar Akun",
        headerTintColor: theme.colors.customGreen[300],
        headerTitleAlign: 'center',
        headerTitleStyle: theme.typography.title,
        headerLeft: () => (<MaterialIcons name="chevron-left" size={36} color={theme.colors.customGreen[300]}/>),
        }}/>
      <Stack.Screen name="otp" options = {{
        headerShown: true,
        headerTitle: "Daftar Akun",
        headerTintColor: theme.colors.customGreen[300],
        headerTitleAlign: 'center',
        headerTitleStyle: theme.typography.title,
        headerLeft: () => (<MaterialIcons name="chevron-left" size={36} color={theme.colors.customGreen[300]}/>),
        }}/>
    </Stack>;
}