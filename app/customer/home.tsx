import Footer from '@/components/ui/Footer';
import ProviderCard from '@/components/ui/ProviderCard';
import { handleLogout } from '@/utils/authService'; // ✅ On importe la fonction de déconnexion
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import avatarClient from '../../assets/images/avatarclient.png';
import HeaderGradient from '../../components/ui/HeaderGradient';

export default function CustomerHomeScreen() {
  const userFirstname = 'Ralphy';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const providers = [
    {
      id: 1,
      name: 'Pat McGrath',
      category: 'Mariage, Film',
      address: '1 rue gallieni, Bagnolet 93170',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Charlotte Tilbury',
      category: 'Edito, TV',
      address: '2 avenue de la république, Bagnolet 93170',
      rating: 4.7,
    },
    {
      id: 3,
      name: 'Pat McGrath',
      category: 'Mariage, Film',
      address: '1 rue gallieni, Bagnolet 93170',
      rating: 4.8,
    },
  ];

  const filteredProviders = providers.filter((provider) => {
    const keywordMatch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchQuery.toLowerCase());

    const locationMatch = provider.address.toLowerCase().includes(locationQuery.toLowerCase());

    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => provider.category.toLowerCase().includes(cat.toLowerCase()));

    return keywordMatch && locationMatch && categoryMatch;
  });

  const handleGoToProfile = () => {
    router.push('/profile-provider');
  };

  // ✅ Définis les items du menu pour le rôle Customer
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

  // ✅ Callback quand un item du menu est pressé
  const handleMenuItemPress = (item: string) => {
    console.log('Menu Item sélectionné :', item);
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
        handleLogout(); // ✅ Appelle directement la fonction handleLogout
        break;
      default:
        console.log('Aucune action définie');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title={`Bienvenue ${userFirstname},`}
        subtitle="Trouvez votre Make up Artist !"
        avatarUri={avatarClient}
        showMenu={true}
        showSearch={true}
        showLocationSearch={true}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        locationQuery={locationQuery}
        onChangeLocation={setLocationQuery}
        onCategorySelect={(categories) => {
          console.log('Catégories sélectionnées (customer-home) :', categories);
          setSelectedCategories(categories);
        }}
        menuItems={customerMenuItems} // ✅ Passe les items du menu
        onMenuItemPress={handleMenuItemPress} // ✅ Passe la logique de navigation et de logout
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.providersList}>
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={provider.name}
              imageUri={require('../../assets/images/avatarclient.png')}
              category={provider.category}
              address={provider.address}
              rating={provider.rating}
              onPressProfile={handleGoToProfile}
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
