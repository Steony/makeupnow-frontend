import Footer from '@/components/ui/Footer';
import ProviderCard from '@/components/ui/ProviderCard';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext'; // <-- Import du hook useAuth
import { handleLogout } from '@/utils/authService';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import HeaderGradient from '../../components/ui/HeaderGradient';

export default function CustomerHomeScreen() {
  const { currentUser } = useAuth();  // <-- Utilisation du contexte Auth

  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const providersResponse = await api.get('/providers');
        let providersArray = providersResponse.data;

        if (typeof providersArray === 'string') {
          try {
            const match = providersArray.match(/\[.*?\]/);
            if (match) {
              providersArray = JSON.parse(match[0]);
            } else {
              providersArray = [];
            }
          } catch (e) {
            console.error('Erreur parsing JSON providers:', e);
            providersArray = [];
          }
        }

        if (!Array.isArray(providersArray)) {
          providersArray = [];
        }

        // --- Extraction de la catégorie depuis les services ---
        providersArray = providersArray.map((provider: any) => {
          const categories = provider.services?.map((service: any) => service.category) || [];
          const uniqueCategories = [...new Set(categories)];
          return {
            ...provider,
            category: uniqueCategories.join(', ') || 'Makeup Artist',
          };
        });

        setProviders(providersArray);
      } catch (error: any) {
        console.error('Erreur lors de la récupération des données :', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: "Impossible de charger les données.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const safeLower = (value: any) => (typeof value === 'string' ? value.toLowerCase() : '');

  const filteredProviders = providers.filter((provider) => {
    const fullName = `${safeLower(provider.firstname)} ${safeLower(provider.lastname)}`;
    const keywordMatch =
      fullName.includes(searchQuery.toLowerCase()) ||
      safeLower(provider.address).includes(searchQuery.toLowerCase());

    const locationMatch = safeLower(provider.address).includes(locationQuery.toLowerCase());
    return keywordMatch && locationMatch;
  });

  const handleGoToProfile = (providerId: number | string) => {
    router.push(`/profile-provider`);
  };

  const customerMenuItems = [
    'Accueil',
    'Mes réservations',
    'Mon profil',
    'Paramètres',
    'Déconnexion',
  ];

  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Accueil':
        router.push('/customer/home');
        break;
      case 'Mes réservations':
        router.push('/customer/booking-list');
        break;
      case 'Mon profil':
        router.push('/customer/profile');
        break;
      case 'Paramètres':
        router.push('/settings');
        break;
      case 'Déconnexion':
        handleLogout();
        break;
      default:
        console.log('Aucune action définie');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title={`Bienvenue ${currentUser?.name ?? 'Utilisateur'},`} 
        subtitle="Trouvez votre Make up Artist !"
        avatarUri={getDefaultAvatar('CLIENT')}
        showMenu={true}
        showSearch={true}
        showLocationSearch={true}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        locationQuery={locationQuery}
        onChangeLocation={setLocationQuery}
        menuItems={customerMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />

      <Text style={{ textAlign: 'center', color: '#9B59B6', marginTop: 8 }}>
        Providers trouvés : {filteredProviders.length}
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.providersList}>
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={`${provider.firstname} ${provider.lastname}`}
              imageUri={getDefaultAvatar('PROVIDER')}
              category={provider.category}
              address={provider.address}
              rating={provider.averageRating}
              onPressProfile={() => handleGoToProfile(provider.id)}
              role="PROVIDER"
            />
          ))}
        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3EDF7',
  },
  scrollContainer: {},
  providersList: {
    marginTop: 20,
  },
});
