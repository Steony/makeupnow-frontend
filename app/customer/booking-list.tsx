import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { handleLogout } from '@/utils/authService'; // ✅ Import de la fonction handleLogout
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity, View } from 'react-native';

export default function BookingList() {
  const router = useRouter();

  const bookings = [
    {
      id: 1,
      title: 'Maquillage mariée',
      date: '10 août 2025',
      time: '9:00',
      price: 120,
      status: 'Confirmée',
      address: '60 avenue du bois, Gallieni',
      providerName: 'Selena Vega',
      providerEmail: 'vegaselena@gmail.com',
      providerPhone: '06 88 63 25 88',
    },
    {
      id: 2,
      title: 'Maquillage soirée',
      date: '10 mai 2024',
      time: '18:00',
      price: 75,
      status: 'Terminée et payée',
      address: '60 avenue du bois, Gallieni',
      providerName: 'Selena Vega',
      providerEmail: 'vegaselena@gmail.com',
      providerPhone: '06 88 63 25 88',
      rating: 5,
      review: "Make-up artist professionnelle, à l'écoute et ultra talentueuse. Elle a su sublimer mon visage tout en respectant mes envies. Le maquillage a tenu toute la journée, et j’ai reçu plein de compliments.",
      reviewDate: "11/05/24",
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'En cours' && booking.status === 'En cours') ||
      (statusFilter === 'Confirmée' && booking.status === 'Confirmée') ||
      (statusFilter === 'Annulé' && booking.status === 'Annulé') ||
      (statusFilter === 'Terminé' && booking.status.toLowerCase().includes('terminée'));

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.some((cat) => booking.title.toLowerCase().includes(cat.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleConfirm = (id: number) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir confirmer le paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            console.log('Paiement confirmé pour la réservation', id);
            ToastAndroid.show('Paiement confirmé avec succès ✅', ToastAndroid.SHORT);
          },
        },
      ]
    );
  };

  const handleCancel = (id: number) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir annuler la réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            console.log('Réservation annulée pour', id);
            ToastAndroid.show('Réservation annulée ✅', ToastAndroid.SHORT);
          },
        },
      ]
    );
  };

  // ✅ Menu items pour le client
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

  // ✅ Navigation en fonction de l'item du menu
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
        handleLogout(); // ✅ Ici, la déconnexion
        break;
      default:
        console.log('Aucune action définie');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mes réservations"
        showMenu={true}
        showSearch={true}
        showLocationSearch={false}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onCategorySelect={(categories) => {
          console.log('Catégories sélectionnées (booking-list) :', categories);
          setSelectedCategories(categories);
        }}
        showCategoryButton={false}
        menuItems={customerMenuItems} // ✅ Passe le menu à HeaderGradient
        onMenuItemPress={handleMenuItemPress} // ✅ Passe la logique de navigation et de logout
      />

      {/* Filtres de statut */}
      <View style={styles.filterContainer}>
        <AppText style={styles.filterLabel}>Filtre:</AppText>
        {['Tous', 'Terminé', 'En cours', 'Annulé'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <AppText
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.activeFilterButtonText,
              ]}
            >
              {status}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.bookingList}>
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onPressConfirm={() => handleConfirm(booking.id)}
              onPressCancel={() => handleCancel(booking.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    marginLeft: 5,
    marginRight: 8,
    fontWeight: 'bold',
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#a478dd',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },
  filterButtonText: {
    color: '#a478dd',
  },
  activeFilterButton: {
    backgroundColor: '#a478dd',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  bookingList: {
    gap: 5,
  },
});
