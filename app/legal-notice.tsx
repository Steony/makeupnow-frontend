import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Footer from '../components/ui/Footer';
import HeaderWithBackButton from '../components/ui/HeaderWithBackButton';

export default function LegalNoticeScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header réutilisable */}
          <HeaderWithBackButton title="Mentions légales" />

          {/* Logo */}
          <Image
            source={require('../assets/images/logoshort.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Texte */}
          <Text style={styles.text}>
            <Text style={styles.bold}>Makeup Now</Text>, est éditée dans le cadre d’un projet personnel de développement.
          </Text>

          <Text style={styles.text}>
            Développeuse : <Text style={styles.italic}>Stéphanie NGUYEN</Text>{'\n'}
            Localisation : <Text style={styles.italic}>Orly, France</Text>{'\n'}
            Contact : <Text style={styles.italic}>Steony.pro@gmail.com</Text>
          </Text>

          <Text style={styles.text}>
            Les contenus et visuels présents sur cette application sont protégés.
          </Text>
          <Text style={styles.text}>
            Toute reproduction est interdite sans autorisation.
          </Text>

          <Text style={styles.text}>
            Pour toute question ou réclamation, veuillez utiliser la page{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/contact')}
            >
              [Contact]
            </Text>.
          </Text>
        </ScrollView>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingVertical: 10,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
  text: {
    color: '#371B34',
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'justify',
    lineHeight: 20,
    paddingBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#A478DD',
  },
  italic: {
    fontStyle: 'italic',
    color: '#371B34',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#A478DD', 
    fontWeight: 'bold',
  },
});
