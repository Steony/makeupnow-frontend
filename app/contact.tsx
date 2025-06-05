import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AppText from '../components/ui/AppText'; // ✅ Ajout de AppText
import Footer from '../components/ui/Footer';
import HeaderWithBackButton from '../components/ui/HeaderWithBackButton';

export default function ContactScreen() {
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
          <HeaderWithBackButton title="Contact" />

          {/* Logo */}
          <Image
            source={require('../assets/images/logoshort.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Texte */}
          <AppText style={styles.text}>
            Pour toute question, suggestion ou demande liée à l’application (y compris la suspension ou la
            suppression de votre compte), vous pouvez nous écrire à l’adresse suivante :
          </AppText>

          <AppText style={styles.text}>
            Email : <AppText style={styles.italic}>Steony.pro@gmail.com</AppText>
          </AppText>

          <AppText style={styles.text}>
            Une réponse vous sera apportée dans les meilleurs délais.
          </AppText>

          <AppText style={styles.text}>
            Merci pour votre confiance !
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
  italic: {
    fontStyle: 'italic',
    color: '#000',
  },
});
