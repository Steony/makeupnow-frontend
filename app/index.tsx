import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useAuth } from '../utils/AuthContext'; // 👈 ajoute ça

export const unstable_settings = {
  headerShown: false,
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const { currentUser } = useAuth(); // 👈 accès au user connecté

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  useEffect(() => {
    if (currentUser) {
      // Rediriger vers la home en fonction du rôle
      const role = currentUser.role;
      if (role === 'CLIENT') {
        router.replace('/customer/home');
      } else if (role === 'PROVIDER') {
        router.replace('/provider/home');
      } else if (role === 'ADMIN') {
        router.replace('/admin/home');
      }
    }
  }, [currentUser, router]);

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
          style={[styles.logoImage, { width: width * 0.9, height: width * 0.9 }]}
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  logoImage: {
    marginTop: 70,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#A478DD',
    paddingVertical: 20,
    paddingHorizontal: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
  },
});
