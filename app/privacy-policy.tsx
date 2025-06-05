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

export default function PrivacyPolicyScreen() {
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
          <HeaderWithBackButton title="Politique de confidentialité" />

          {/* Logo */}
          <Image
            source={require('../assets/images/logoshort.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Date de mise à jour */}
          <AppText style={styles.updateDate}>Mise à jour le 25 avril 2025</AppText>

          {/* Texte */}
          <AppText style={styles.text}>
            <AppText style={styles.bold}>Makeup Now</AppText> respecte votre vie privée et s’engage à protéger vos
            données personnelles.
          </AppText>

          <AppText style={styles.text}>- Aucune donnée sensible n’est collectée sans votre consentement.</AppText>
          <AppText style={styles.text}>
            -  Les données personnelles (nom, email, téléphone, réservations) sont utilisées uniquement pour
            le bon fonctionnement de l’application.
          </AppText>
          <AppText style={styles.text}>-  Aucune donnée n’est vendue, partagée ou transmise à des tiers.</AppText>
          <AppText style={styles.text}>
            -  Les données sont conservées pendant la durée d’utilisation du service, à l’exception des logs
            de connexion qui peuvent être conservés à des fins de sécurité même après suppression du compte
            (anonymisés).
          </AppText>

          <AppText style={styles.sectionTitle}>Vous pouvez à tout moment :</AppText>
          <AppText style={styles.text}>-  Accéder à vos données.</AppText>
          <AppText style={styles.text}>-  Demander leur modification ou leur suppression.</AppText>
          <AppText style={styles.text}>-  Vous opposer au traitement de vos données.</AppText>
          <AppText style={styles.text}>
            -  Pour toute demande, contactez-nous par email : steony.pro@gmail.com
          </AppText>

          <AppText style={styles.sectionTitle}>L’application utilise :</AppText>
          <AppText style={styles.text}>-  une connexion sécurisée (HTTPS),</AppText>
          <AppText style={styles.text}>-  une authentification via jetons JWT,</AppText>
          <AppText style={styles.text}>
            -  et un chiffrement des mots de passe pour garantir la sécurité de vos données.
          </AppText>

          <AppText style={styles.sectionTitle}>Anonymisation des logs d’actions :</AppText>
          <AppText style={styles.text}>
            Les logs d’actions des utilisateurs (connexion, modification de compte, etc.) sont conservés
            même après la suppression du compte, mais les informations sensibles sont automatiquement
            anonymisées.
          </AppText>

          <Footer />
        </ScrollView>
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
  updateDate: {
    textAlign: 'center',
    color: '#616161',
    marginBottom: 20,
  },
  text: {
    color: '#000',
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'justify',
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
    color: '#A478DD',
  },
});
