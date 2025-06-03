import Footer from '@/components/ui/Footer';
import ProviderCard from '@/components/ui/ProviderCard';
import { useRouter } from 'expo-router'; // ✅ Ajout pour la navigation
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import avatarClient from '../../assets/images/avatarclient.png';
import HeaderGradient from '../../components/ui/HeaderGradient';

export default function CustomerHomeScreen() {
  const userFirstname = 'Ralphy';
  const router = useRouter(); // ✅ Hook pour la navigation

  // Fonction pour aller sur la page du profil du prestataire
  const handleGoToProfile = () => {
    router.push('/profile-provider'); // ✅ Redirection vers la page "profile-provider"
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <HeaderGradient
          title={`Bienvenue ${userFirstname},`}
          subtitle="Trouvez votre Make up Artist !"
          avatarUri={avatarClient}
          showMenu={true}
        />

        <View style={styles.providersList}>
          <ProviderCard
            name="Pat McGrath"
            imageUri={require('../../assets/images/avatarclient.png')}
            category="Mariage, Film"
            address="1 rue gallieni, Bagnolet 93170"
            rating={4.8}
            onPressProfile={handleGoToProfile} // 
          />
          <ProviderCard
            name="Charlotte Tilbury"
            imageUri={require('../../assets/images/avatarclient.png')}
            category="Edito, TV"
            address="2 avenue de la république, Bagnolet 93170"
            rating={4.7}
            onPressProfile={handleGoToProfile}
          />
          <ProviderCard
            name="Pat McGrath"
            imageUri={require('../../assets/images/avatarclient.png')}
            category="Mariage, Film"
            address="1 rue gallieni, Bagnolet 93170"
            rating={4.8}
            onPressProfile={handleGoToProfile}
          />
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {},
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#E1D6EF',
    borderRadius: 5,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  menuButtonText: {
    color: '#A478DD',
    fontWeight: 'bold',
    fontSize: 17,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  welcome: {
    fontSize: 18,
    color: '#371B34',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 26,
    marginHorizontal: 18,
    marginTop: 12,
  },
  providersList: {
    marginTop: 20,
  },
});
