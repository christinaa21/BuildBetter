import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { typography } from './theme/typography';
import ProgressButton from '@/component/ProgressButton';
import { MaterialIcons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container} onTouchEnd={() => router.push('/login')}>
      <View>
        <Text style={styles.welcomeText}>
          Yuk tanyakan lebih lanjut!
        </Text>

        <Text style={[typography.body1, styles.description]}>
        Dengan BuildBetter, kamu bisa berkonsultasi lebih dalam dengan arsitek terkait persiapan rumah yang akan dibangun.
        </Text>
      </View>
      <ProgressButton count={100} icon={() => <MaterialIcons name="chevron-right" size={40} color="white" />} page='/login'/>
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
    marginBottom: 32,
  },
  description: {
    color: theme.colors.customGreen[200],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});