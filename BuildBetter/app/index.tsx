import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './theme';
import { typography } from './theme/typography';

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

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/')}
      >
        {/* Temporary arrow using View */}
        <View style={styles.arrow} />
      </TouchableOpacity>
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
    paddingBottom: 40,
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
    paddingHorizontal: 8
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.customGreen[300],
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.customWhite[50],
    transform: [{rotate: '45deg'}],
  }
});