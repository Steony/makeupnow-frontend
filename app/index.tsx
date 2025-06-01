import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import PrimaryButton from '../components/ui/PrimaryButton';

export const unstable_settings = {
  headerShown: false, // Désactiver le header automatique d’Expo Router
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  const handlePress = () => {
    router.push('/login');
  };

  return (
    <ImageBackground
  source={require('../assets/images/background-index.png')}
  style={[styles.background, { overflow: 'hidden' }]}
  resizeMode="cover"
>

      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo-makeupnow.png')}
          style={[styles.logoImage, { width: width * 1.2, height: width * 1.2 }]}
          resizeMode="contain"
        />

        {/* L’ellipse en fond */}
        <Image
          source={require('../assets/images/Ellipse.png')}
          style={styles.ellipse}
          resizeMode="contain"
        />

        <PrimaryButton title="C’est parti !" onPress={handlePress} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0F9',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipse: {
    position: 'absolute',
    top: '60%',
    left: '40%',
    width: 290,
    height: 300,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  logoImage: {
    marginBottom: 20,
    marginTop: 7,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#A478DD',
    borderRadius: 5,
    paddingVertical: 20,
    paddingHorizontal: 80,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Ombre pour Android
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
});
