import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';
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

  const loadBookings = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await api.get(`/bookings/customer/${currentUser.id}`);
      let data = response.data;

      if (typeof data === 'string') {
        // Essayer de parser de manière sécurisée
        try {
          // Gérer cas avec concaténation de tableaux JSON : "[...][...]"
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
            console.warn('Réponse multiple détectée, on prend la première partie uniquement');
          }
          data = JSON.parse(data);
        } catch (parseError) {
          console.error('Erreur lors du parsing JSON:', parseError, data);
          ToastAndroid.show('Erreur dans les données reçues du serveur', ToastAndroid.SHORT);
          return;
        }
      }

      if (Array.isArray(data) && typeof data[0] === 'string') {
        try {
          data = data.map(item => JSON.parse(item));
        } catch (e) {
          console.error('Erreur parse array JSON:', e);
          ToastAndroid.show('Erreur dans les données reçues du serveur', ToastAndroid.SHORT);
          return;
        }
      }

      setBookings(data);
    } catch (error) {
      console.error('Erreur récupération réservations :', error);
      ToastAndroid.show('Erreur lors du chargement des réservations', ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'COMPLETED': return 'Terminée et payée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

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
              await loadBookings();
            }
          } catch {
            ToastAndroid.show('Erreur de confirmation', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

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

  const handleSubmitReview = async (rating: number, comment: string, reviewId?: string | null) => {
    try {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté');
      if (reviewId) {
        await api.put(`/reviews/${reviewId}`, { rating, comment });
        ToastAndroid.show('Avis modifié avec succès', ToastAndroid.SHORT);
      } else {
        await api.post('/reviews', {
          rating,
          comment,
          customerId: currentUser.id,
          // ajouter les autres champs obligatoires côté backend si besoin
        });
        ToastAndroid.show('Avis créé avec succès', ToastAndroid.SHORT);
      }
      await loadBookings();
    } catch (error) {
      ToastAndroid.show('Erreur lors de la soumission de l’avis', ToastAndroid.SHORT);
      console.error(error);
    }
  };

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
        {['Tous', 'Terminé', 'Confirmé', 'Annulé'].map(status => (
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
              dateSchedule={booking.dateSchedule}
              timeSchedule={booking.timeSchedule}
              price={booking.totalPrice}
              status={translateStatus(booking.status)}
              address={booking.providerAddress}
              providerName={booking.providerName}
              providerEmail={booking.providerEmail}
              providerPhone={booking.providerPhone}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              reviewId={booking.review?.id}
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
