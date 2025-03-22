import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';
import { Card } from '@/component/Card';
import { GridContainer } from '@/component/GridContainer';
import Button from '@/component/Button';
import { useRouter } from 'expo-router';

export default function Saved() {
  const recommendations = [
    { id: 1, title: 'Saran 1', image: require('@/assets/images/modern1.jpg') },
    { id: 2, title: 'Saran 2', image: require('@/assets/images/modern2.jpg') },
    { id: 3, title: 'Saran 3', image: require('@/assets/images/industrialis1.jpg') },
    { id: 4, title: 'Saran 4', image: require('@/assets/images/industrialis2.jpg') },
  ]
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[theme.typography.body1, styles.text]}>Yuk lihat rekomendasi berikut sesuai dengan kebutuhan dan keinginanmu!</Text>
        <GridContainer
            data={recommendations}
            numColumns={2}
            columnSpacing={16}
            rowSpacing={16}
            renderItem={(item) => (
                <Card
                title={item.title}
                image={item.image}
                buttonTitle="Lihat Detil"
                buttonVariant='primary'
                onButtonPress={() => router.push('./detail')}
                />
            )}
        />
      </View>
      <Button
        title="Kembali ke Beranda"
        variant="outline"
        onPress={() => router.push('/(tabs)/home')}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.customWhite[50],
  },
  content: {
    flex: 1,
    padding: 24,
  },
  text: {
    color: theme.colors.customOlive[50],
    paddingBottom: 16,
  },
  button: {
    margin: '8%',
  }
});