import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { typography } from './theme/typography';
import ProgressButton from '@/component/ProgressButton';
import { MaterialIcons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.welcomeText}>
          Selamat datang di
        </Text>
        <Text style={styles.buildBetter}>BuildBetter</Text>

        <Text style={[typography.body1, styles.description]}>
          BuildBetter adalah sebuah aplikasi yang dirancang untuk memudahkan individu dalam persiapan pembangunan atau renovasi rumah yang berkelanjutan.
        </Text>
      </View>
      <ProgressButton count={33} icon={() => <MaterialIcons name="chevron-right" size={40} color="white" />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: '50%',
    paddingBottom: '25%',
  },
  welcomeText: {
    fontFamily: theme.fonts.poppins.medium,
    fontSize: 32,
    lineHeight: 40,
    color: theme.colors.customGreen[300],
    textAlign: 'center',
  },
  buildBetter: {
    fontFamily: theme.fonts.poppins.bold,
    fontSize: 32,
    letterSpacing: 0.25,
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    marginBottom: 32,
  },
  description: {
    color: theme.colors.customGreen[200],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});