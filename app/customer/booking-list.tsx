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

  useEffect(() => {
    // Données factices pour test
    const mockBookings = [
      {
        id: 1,
        serviceTitle: 'Maquillage Mariage',
        dateBooking: new Date().toISOString(),
        totalPrice: 120,
        status: 'CONFIRMED',
        providerAddress: '12 rue des Fleurs, Paris',
        providerName: 'Sophie L.',
        providerEmail: 'sophie@example.com',
        providerPhone: '0601020304',
        paymentId: 101,
        review: {
          rating: 5,
          comment: 'Super prestation !',
          dateComment: new Date().toISOString(),
        },
      },
      {
        id: 2,
        serviceTitle: 'Maquillage Shooting',
        dateBooking: new Date().toISOString(),
        totalPrice: 90,
        status: 'CANCELLED',
        providerAddress: '45 avenue du Parc, Lyon',
        providerName: 'Julien M.',
        providerEmail: 'julien@example.com',
        providerPhone: '0605060708',
        paymentId: 102,
        review: null,
      },
    ];
    setBookings(mockBookings);

    /*
    // Décommenter pour récupération réelle depuis API
    if (!currentUser?.id) return;
    api.get(`/bookings/customer/${currentUser.id}`)
      .then(response => setBookings(Array.isArray(response.data) ? response.data : []))
      .catch(error => {
        console.error('Erreur récupération réservations :', error);
        ToastAndroid.show('Erreur lors du chargement des réservations', ToastAndroid.SHORT);
      });
    */
  }, [currentUser]);

  // Traduction statut backend → utilisateur
  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'COMPLETED': return 'Terminée et payée';
      case 'CANCELLED': return 'Annulée';
      case 'EN_COURS': return 'En cours';
      default: return status;
    }
  };

  // Format date en dd/MM/yy
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  // Format heure hh:mm
  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Filtres combinés
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'Confirmée' && booking.status === 'CONFIRMED') ||
      (statusFilter === 'Annulé' && booking.status === 'CANCELLED') ||
      (statusFilter === 'Terminé' && booking.status === 'COMPLETED');

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(cat =>
        booking.serviceTitle?.toLowerCase().includes(cat.toLowerCase())
      );

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Confirmer paiement
  const handleConfirm = (paymentId: number) => {
    if (!currentUser?.id) {
      ToastAndroid.show('Erreur : utilisateur non connecté', ToastAndroid.SHORT);
      return;
    }

    Alert.alert('Confirmation', 'Confirmer le paiement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            const response = await api.post('/payments/confirm/customer', null, {
              params: { paymentId, customerId: currentUser.id },
            });
            if (response.data) {
              ToastAndroid.show('Paiement confirmé ✅', ToastAndroid.SHORT);
            }
          } catch {
            ToastAndroid.show('Erreur de confirmation', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

  // Annuler réservation
  const handleCancel = (bookingId: number) => {
    Alert.alert('Confirmation', 'Annuler la réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await api.delete(`/bookings/${bookingId}`);
            ToastAndroid.show('Réservation annulée ✅', ToastAndroid.SHORT);
            setBookings(prev => prev.filter(b => b.id !== bookingId));
          } catch {
            ToastAndroid.show('Erreur d’annulation', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

  // Soumettre avis (à connecter à ton backend)
  const handleSubmitReview = (rating: number, comment: string) => {
    console.log('Avis soumis:', rating, comment);
    ToastAndroid.show('Avis soumis !', ToastAndroid.SHORT);
    // ici appel API pour enregistrer l'avis
  };

  // Menu client
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Accueil': router.push('/customer/home'); break;
      case 'Mes réservations': router.push('/customer/booking-list'); break;
      case 'Mon profil': router.push('/customer/profile'); break;
      case 'Paramètres': router.push('/settings'); break;
      case 'Déconnexion': handleLogout(); break;
      default: console.log('Action inconnue');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mes réservations"
        showMenu
        showSearch
        showLocationSearch={false}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onCategorySelect={setSelectedCategories}
        showCategoryButton={false}
        menuItems={customerMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />

      <View style={styles.filterContainer}>
        <AppText style={styles.filterLabel}>Filtre:</AppText>
        {['Tous', 'Terminé', 'En cours', 'Annulé'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, statusFilter === status && styles.activeFilterButton]}
            onPress={() => setStatusFilter(status)}
          >
            <AppText style={[styles.filterButtonText, statusFilter === status && styles.activeFilterButtonText]}>
              {status}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.bookingList}>
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              title={booking.serviceTitle}
              date={formatDate(booking.dateBooking)}
              time={formatTime(booking.dateBooking)}
              price={booking.totalPrice}
              status={translateStatus(booking.status)}
              address={booking.providerAddress}
              providerName={booking.providerName}
              providerEmail={booking.providerEmail}
              providerPhone={booking.providerPhone}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              role="Client"
              onPressConfirm={() => handleConfirm(booking.paymentId)}
              onPressCancel={() => handleCancel(booking.id)}
              onSubmitReview={handleSubmitReview}
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
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 20, marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16, marginLeft: 5, marginRight: 8, fontWeight: 'bold',
  },
  filterButton: {
    borderWidth: 1, borderColor: '#a478dd', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 12, marginHorizontal: 2,
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
