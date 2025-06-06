import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api'; // ✅ Ton instance axios
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BookingList() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

 

  // ✅ Récupérer les réservations
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.id) return;

      try {
        const response = await api.get(`/bookings/customer/${currentUser.id}`);
        console.log('Réservations récupérées :', response.data);
        setBookings(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations :', error);
        ToastAndroid.show('Erreur lors du chargement des réservations', ToastAndroid.SHORT);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // ✅ Filtres
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'En cours' && booking.status === 'EN_COURS') ||
      (statusFilter === 'Confirmée' && booking.status === 'CONFIRMED') ||
      (statusFilter === 'Annulé' && booking.status === 'CANCELLED') ||
      (statusFilter === 'Terminé' && booking.status === 'COMPLETED');

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        booking.serviceTitle?.toLowerCase().includes(cat.toLowerCase())
      );

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // ✅ Confirmation du paiement
  const handleConfirm = (id: number) => {
    if (!currentUser?.id) {
      console.error('Erreur : utilisateur non connecté');
      ToastAndroid.show('Erreur : utilisateur non connecté', ToastAndroid.SHORT);
      return;
    }

    Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir confirmer le paiement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            const response = await api.post('/payments/confirm/customer', null, {
              params: { paymentId: id, customerId: currentUser.id },
            });

            if (response.data) {
              ToastAndroid.show('Paiement confirmé avec succès ✅', ToastAndroid.SHORT);
            }
          } catch (error) {
            console.error('Erreur lors de la confirmation du paiement :', error);
            ToastAndroid.show('Erreur de confirmation', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

  // ✅ Annulation de la réservation
  const handleCancel = (id: number) => {
    Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir annuler la réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await api.delete(`/bookings/${id}`);
            ToastAndroid.show('Réservation annulée ✅', ToastAndroid.SHORT);
            setBookings((prev) => prev.filter((b) => b.id !== id));
          } catch (error) {
            console.error('Erreur lors de l’annulation :', error);
            ToastAndroid.show('Erreur d’annulation', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

  // ✅ Menu items client
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

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

  // ✅ Formatage des dates
  const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('fr-FR');
  const formatTime = (isoDate: string) => new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mes réservations"
        showMenu={true}
        showSearch={true}
        showLocationSearch={false}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onCategorySelect={(categories) => setSelectedCategories(categories)}
        showCategoryButton={false}
        menuItems={customerMenuItems}
        onMenuItemPress={handleMenuItemPress}
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

      {/* Liste des réservations */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.bookingList}>
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              title={booking.serviceTitle}
              date={formatDate(booking.dateBooking)}
              time={formatTime(booking.dateBooking)}
              price={booking.totalPrice}
              status={booking.status}
              address={booking.providerAddress}
              providerName={booking.providerName}
              providerEmail={booking.providerEmail}
              providerPhone={booking.providerPhone}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              onPressConfirm={() => handleConfirm(booking.paymentId)}
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
