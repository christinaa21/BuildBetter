import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import theme from '../theme';
import Button from '@/component/Button';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const name = user?.username;

  return (
    <View style={styles.container}>
      <View>
        <Text style={[theme.typography.title, styles.titleText]}>
          Hai {name}!
        </Text>
        <Text style={[theme.typography.body1, styles.description]}>
          Agar kami dapat memberikan rencana persiapan pembangunan rumah yang sesuai kebutuhanmu, kami membutuhkan data terkait kondisi lahan, kebutuhan, dan preferensimu. Yuk jawab pertanyaan-pertanyaan berikut dengan sungguh-sungguh agar mendapatkan rekomendasi yang memuaskan!
        </Text>
      </View>
      <View>
        <Text style={[theme.typography.body1, styles.description]}>
          *Pastikan kamu melakukan analisis dengan sebaik mungkin.
        </Text>
        <Text style={[theme.typography.title, styles.titleText]}>
          Sudah siap?
        </Text>
        <Button 
            title="Mulai Sekarang"
            variant="primary"
            onPress={() => router.push('/buildplan/screening')}
        />
        <Text style={[theme.typography.caption, styles.or]}>
          atau
        </Text>
        <Button 
            title="Lihat Hasil yang Disimpan"
            variant="outline"
            onPress={() => router.push('/buildplan/saved')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: '16%',
    paddingBottom: '24%',
  },
  titleText: {
    color: theme.colors.customGreen[300],
    textAlign: 'center',
    paddingBottom: 16,
  },
  description: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    paddingBottom: 8,
  },
  or: {
    color: theme.colors.customOlive[50],
    textAlign: 'center',
    paddingVertical: 8,
  },
});