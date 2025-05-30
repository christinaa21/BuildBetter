import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import theme from "./theme";
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
import { AuthProvider } from '@/context/AuthContext';

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

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens */}
        <Stack.Screen 
          name="register" 
          options={{
            headerShown: true,
            headerTitle: "Daftar Akun",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="otp" 
          options={{
            headerShown: true,
            headerTitle: "Daftar Akun",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{
            headerShown: true,
            headerTitle: "Lupa Kata Sandi",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="buildplan/onboarding" 
          options={{
            headerShown: true,
            headerTitle: "BuildPlan",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="buildplan/screening" 
          options={{
            headerShown: true,
            headerTitle: "BuildPlan",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="buildplan/result" 
          options={{
            headerShown: true,
            headerTitle: "Hasil",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="buildplan/saved" 
          options={{
            headerShown: true,
            headerTitle: "Tersimpan",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="profile/edit" 
          options={{
            headerShown: true,
            headerTitle: "Edit Profil",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="profile/help" 
          options={{
            headerShown: true,
            headerTitle: "Pusat Bantuan",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="profile/change-password" 
          options={{
            headerShown: true,
            headerTitle: "Ubah Kata Sandi",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
        <Stack.Screen 
          name="buildtips/[id]/index" 
          options={{
            headerShown: true,
            headerTitle: "BuildTips",
            headerTintColor: theme.colors.customGreen[300],
            headerTitleAlign: 'center',
            headerTitleStyle: theme.typography.title,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}