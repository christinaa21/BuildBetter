import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { typography } from './theme/typography';
import ProgressButton from '@/component/ProgressButton';
import { MaterialIcons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container} onTouchEnd={() => router.push('/landing3')}>
      <View>
        <Text style={styles.welcomeText}>
          Yuk rencanakan rumahmu!
        </Text>

        <Text style={[typography.body1, styles.description]}>
            Jawab pertanyaan seputar rencana pembangunan rumahmu dan dapatkan rekomendasi desain rumah dan daftar material yang sesuai dengan kebutuhanmu.
        </Text>
      </View>
      <ProgressButton count={66} icon={() => <MaterialIcons name="chevron-right" size={40} color="white" />} page='/landing3'/>
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