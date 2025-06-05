import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AppText from '../components/ui/AppText'; // ✅ Ajout de AppText pour la police par défaut
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
          <AppText style={styles.text}>
            <AppText style={styles.bold}>Makeup Now</AppText>, est éditée dans le cadre d’un projet personnel de développement.
          </AppText>

          <AppText style={styles.text}>
            Développeuse : <AppText style={styles.italic}>Stéphanie NGUYEN</AppText>{'\n'}
            Localisation : <AppText style={styles.italic}>Orly, France</AppText>{'\n'}
            Contact : <AppText style={styles.italic}>Steony.pro@gmail.com</AppText>
          </AppText>

          <AppText style={styles.text}>
            Les contenus et visuels présents sur cette application sont protégés.
          </AppText>
          <AppText style={styles.text}>
            Toute reproduction est interdite sans autorisation.
          </AppText>

          <AppText style={styles.text}>
            Pour toute question ou réclamation, veuillez utiliser la page{' '}
            <AppText
              style={styles.link}
              onPress={() => router.push('/contact')}
            >
              [Contact]
            </AppText>.
          </AppText>
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
    color: '#000',
    marginBottom: 8,
    fontSize: 14,
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
    color: '#000',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#A478DD',
    fontWeight: 'bold',
  },
});
