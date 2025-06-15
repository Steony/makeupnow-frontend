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
  categoriesString?: string | null;
}

export default function CustomerHomeScreen() {
  const { currentUser } = useAuth();

  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get('/providers');
        let data = res.data;

        if (typeof data === 'string') {
          const matches = data.match(/\[.*?\]/g);
          if (matches && matches.length) {
            try {
              data = JSON.parse(matches[0]);
            } catch {
              data = [];
            }
          } else {
            try {
              data = JSON.parse(data);
            } catch {
              data = [];
            }
          }
        }

        setAllProviders(Array.isArray(data) ? data : []);
        setFilteredProviders(Array.isArray(data) ? data : []);
      } catch {
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

  useEffect(() => {
    let result = allProviders;

    if (search) {
      const searchLC = search.toLowerCase();
      result = result.filter(provider => {
        const fullText = (
          (provider.firstname || '') + ' ' +
          (provider.lastname || '') + ' ' +
          (provider.address || '') + ' ' +
          (provider.categoriesString || '')
        ).toLowerCase();
        return fullText.includes(searchLC);
      });
    }

    if (location) {
      const locLC = location.toLowerCase();
      result = result.filter(provider =>
        (provider.address || '').toLowerCase().includes(locLC)
      );
    }

    if (categories.length > 0) {
      result = result.filter(provider =>
        categories.some(cat =>
          (provider.categoriesString ?? '').toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    setFilteredProviders(result);
  }, [search, categories, location, allProviders]);

  const handleGoToProfile = (providerId: number) => {
    router.push(`/profile-provider?providerId=${providerId}`);
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
       <ScrollView>
      <HeaderGradient
        title={`Bienvenue, ${currentUser?.name || 'Client'} !`}
        subtitle="Trouvez votre Make up Artist !"
        avatarUri={getDefaultAvatar('CLIENT')}
        showMenu={true}
        showSearch={true}
        showLocationSearch={true}
        menuItems={customerMenuItems}
        onMenuItemPress={handleMenuItemPress}
        searchQuery={search}
        onChangeSearch={setSearch}
        locationQuery={location}
        onChangeLocation={setLocation}
        onCategorySelect={setCategories}
      />

      <View style={{ backgroundColor: 'white', padding: 15 }}>
        <Text>Providers trouvés : {filteredProviders.length}</Text>
        {categories.length > 0 && (
          <Text style={{ color: '#6229c6', marginTop: 8 }}>
            Filtre(s) actif(s) : {categories.join(', ')}
          </Text>
        )}
        {location && (
          <Text style={{ color: '#6d38b1', marginTop: 2 }}>
            Localisation : {location}
          </Text>
        )}
        {search && (
          <Text style={{ color: '#e07c39', marginTop: 2 }}>
            Recherche : {search}
          </Text>
        )}
      </View>

     
        {filteredProviders.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#A478DD', fontSize: 18 }}>
              Aucun prestataire trouvé...
            </Text>
          </View>
        ) : (
          filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={`${provider.firstname} ${provider.lastname}`}
              address={provider.address}
              category={provider.categoriesString || 'Makeup Artist'}
              rating={provider.averageRating}
              onPressProfile={() => handleGoToProfile(provider.id)}
            />
          ))
        )}
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
