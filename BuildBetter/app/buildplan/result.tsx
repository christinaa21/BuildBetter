import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';
import { Card } from '@/component/Card';
import { GridContainer } from '@/component/GridContainer';
import Button from '@/component/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';

interface Material {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
}

interface MaterialSubCategory {
  subCategory: string;
  materials: Material[];
}

interface MaterialCategory {
  category: string;
  subCategories: MaterialSubCategory[];
}

interface Suggestion {
  id: string;
  houseNumber: number | string;
  landArea: number;
  buildingArea: number;
  style: string;
  floor: number;
  rooms: number;
  buildingHeight: number;
  designer: string;
  defaultBudget: number;
  budgetMin: number[]; //budgetMin[0] for ekonomis, budgetMin[1] for original, and budgetMin[2] for premium
  budgetMax: number[]; //same like budgetMin but this one for the max
  floorplans: Array<string>; //array of floorplans url
  object: string; //3D house design, in url
  houseImageFront: string; //image url
  houseImageSide: string; //image url
  houseImageBack: string; //image url
  pdf: string; //pdf url
  materials0: MaterialCategory[];
  materials1: MaterialCategory[];
  materials2: MaterialCategory[];
}

interface UserInput {
  province: string;
  city: string;
  landform: string;
  landArea: number;
  entranceDirection: string;
  style: string;
  floor: number;
  rooms: number;
}

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  const params = useLocalSearchParams();
  const stringifiedParams = useMemo(() => JSON.stringify(params), [params.suggestions, params.userInput]);

  useEffect(() => {
    const parseData = () => {
      try {
        setLoading(true);
        
        // Only parse if params actually exist
        if (!params.suggestions || !params.userInput) return;

        const parsedSuggestions = JSON.parse(params.suggestions as string);
        const parsedUserInput = JSON.parse(params.userInput as string);

        // Prevent unnecessary state updates
        if (JSON.stringify(parsedSuggestions) !== JSON.stringify(suggestions)) {
          setSuggestions(parsedSuggestions);
        }
        if (JSON.stringify(parsedUserInput) !== JSON.stringify(userInput)) {
          setUserInput(parsedUserInput);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load suggestions. Please try again.');
        console.error('Parsing error:', err);
      } finally {
        setLoading(false);
      }
    };

    parseData();
  }, [stringifiedParams]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.customGreen[300]} />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Kembali ke Beranda"
          variant="outline"
          onPress={() => router.push('/(tabs)/home')}
          style={styles.button}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[theme.typography.body1, styles.text]}>
          Yuk lihat rekomendasi berikut sesuai dengan kebutuhan dan keinginanmu!
        </Text>

        {suggestions.length === 0 ? (
          <Text style={styles.errorText}>Tidak ada rekomendasi yang ditemukan</Text>
        ) : (
          <GridContainer
            data={suggestions}
            numColumns={2}
            columnSpacing={16}
            rowSpacing={16}
            renderItem={(item: Suggestion) => (
              <Card
                title={`Rumah ${item.houseNumber}`}
                image={
                  item.houseImageFront 
                    ? { uri: item.houseImageFront }
                    : require('@/assets/images/blank.png')
                }
                buttonTitle="Lihat Detil"
                buttonVariant='primary'
                onButtonPress={() => router.push({
                  pathname: './detail/[id]',
                  params: { id: item.id,
                            suggestion: JSON.stringify(item),
                            userInput: JSON.stringify(userInput) }
                })}
              />
            )}
          />
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
});