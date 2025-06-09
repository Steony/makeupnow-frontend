import Footer from '@/components/ui/Footer';
import ProviderCard from '@/components/ui/ProviderCard';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import HeaderGradient from '../../components/ui/HeaderGradient';

interface Provider {
  id: number;
  firstname: string;
  lastname: string;
  address: string;
  averageRating?: number;
  categoriesString?: string; // le champ concaténé du backend
}

export default function CustomerHomeScreen() {
  const { currentUser } = useAuth();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get('/providers');

        if (Array.isArray(res.data)) {
          setProviders(res.data);
          console.log('Providers reçus:', res.data);
        } else {
          setProviders([]);
          console.warn('Réponse inattendue des providers:', res.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des providers:', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de charger les prestataires.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Sécurise la conversion en minuscules
 const filteredProviders = providers.filter((provider) => {
  const searchLower = (searchQuery || '').toLowerCase();
  const locationLower = (locationQuery || '').toLowerCase();
  const fullName = `${(provider.firstname || '').toLowerCase()} ${(provider.lastname || '').toLowerCase()}`;
  const addressLower = (provider.address || '').toLowerCase();
  const categoriesLower = (provider.categoriesString || '').toLowerCase();

  if (!searchLower && !locationLower) return true;

  const matchesKeyword =
    searchLower &&
    (fullName.includes(searchLower) ||
      addressLower.includes(searchLower) ||
      categoriesLower.includes(searchLower));

  const matchesLocation =
    locationLower && addressLower.includes(locationLower);

  if (searchLower && locationLower) return matchesKeyword && matchesLocation;
  return matchesKeyword || matchesLocation;
});



  // Navigation vers profil provider avec query param
  const handleGoToProfile = (providerId: number) => {
    router.push(`/profile-provider?providerId=${providerId}`);
  };

  // Menu client
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
        console.log('Aucune action définie pour:', item);
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
              category={
                provider.categoriesString?.length ? provider.categoriesString : 'Makeup Artist'
              }
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
