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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookingList() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Toast.show({
      type,
      text1: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // CHARGER LES RÉSERVATIONS DU CLIENT
  const loadBookings = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await api.get(`/bookings/customer/${currentUser.id}`);
      let data = response.data;

      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
            console.warn('Réponse multiple détectée, on prend la première partie uniquement');
          }
          data = JSON.parse(data);
        } catch (parseError) {
          console.error('Erreur lors du parsing JSON:', parseError, data);
          showToast('Erreur dans les données reçues du serveur', 'error');
          return;
        }
      }

      if (Array.isArray(data) && typeof data[0] === 'string') {
        try {
          data = data.map(item => JSON.parse(item));
        } catch (e) {
          console.error('Erreur parse array JSON:', e);
          showToast('Erreur dans les données reçues du serveur', 'error');
          return;
        }
      }

      console.log('BOOKINGS_REÇUS:', data); 

      setBookings(data);
    } catch (error) {
      console.error('Erreur récupération réservations :', error);
      showToast('Erreur lors du chargement des réservations', 'error');
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'COMPLETED': return 'Terminé et payé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  // On s'assure de fallback sur tous les cas possibles
  const getServiceTitle = (booking: any) =>
    booking.serviceTitle ??
    booking.service?.title ??
    '';

  const getProviderName = (booking: any) =>
    booking.providerName ??
    (booking.provider ? (booking.provider.firstname + ' ' + booking.provider.lastname) : '') ??
    '';

  const getProviderEmail = (booking: any) =>
    booking.providerEmail ??
    booking.provider?.email ??
    '';

  const getProviderPhone = (booking: any) =>
    booking.providerPhone ??
    booking.provider?.phoneNumber ??
    '';

  const getProviderAddress = (booking: any) =>
    booking.providerAddress ??
    booking.provider?.address ??
    '';

  const getServiceDuration = (booking: any) =>
    booking.serviceDuration ??
    booking.service?.duration?.toString() ??
    '';

  const getDateSchedule = (booking: any) =>
    booking.dateSchedule ??
    booking.schedule?.startTime?.split('T')[0] ??
    '';

  const getTimeSchedule = (booking: any) =>
    booking.timeSchedule ??
    (booking.schedule?.startTime ? booking.schedule?.startTime.split('T')[1]?.substring(0, 5) : '') ??
    '';

  const filteredBookings = bookings.filter((booking) => {
    const serviceTitle = getServiceTitle(booking).toLowerCase();
    const matchesSearch = serviceTitle.includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'Confirmé' && booking.status === 'CONFIRMED') ||
      (statusFilter === 'Annulé' && booking.status === 'CANCELLED') ||
      (statusFilter === 'Terminé' && booking.status === 'COMPLETED');

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(cat =>
        serviceTitle.includes(cat.toLowerCase())
      );

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Annulation de réservation
  const handleCancel = async (bookingId: number) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      showToast('Réservation annulée ✅');
      await loadBookings();
    } catch (err: any) {
      showToast('Erreur d’annulation', 'error');
      console.log('Erreur d’annulation =', err?.response ?? err);
    }
  };

  // Soumission/édition d'avis
  const handleSubmitReview = async (
    rating: number,
    comment: string,
    reviewId?: string | null,
    booking?: any
  ) => {
    try {
      if (!currentUser?.id) throw new Error('Utilisateur non connecté');
      if (!booking) throw new Error('Booking non fourni');

      const reviewPayload = {
        rating,
        comment,
        customerId: currentUser.id,
        providerId: booking.providerId ?? booking.provider?.id,
        makeupServiceId: booking.serviceId ?? booking.service?.id,
        bookingId: booking.id, // 👈
      };

      if (reviewId) {
        await api.put(`/reviews/${reviewId}`, { rating, comment });
        showToast('Avis modifié avec succès');
      } else {
        await api.post('/reviews', reviewPayload);
        showToast('Avis créé avec succès');
      }
      await loadBookings();
    } catch (error) {
      showToast('Erreur lors de la soumission de l’avis', 'error');
      console.error(error);
    }
  };

  // MENU CLIENT UNIQUEMENT
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Accueil': router.push('/customer/home'); break;
      case 'Mes réservations': router.push('/customer/booking-list'); break;
      case 'Mon profil': router.push('/customer/profile'); break;
      case 'Paramètres': router.push('/settings'); break;
      case 'Déconnexion': handleLogout(); break;
      default: break;
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
              key={booking.id + '-' + (booking.review?.id || 'noreview')}
              title={getServiceTitle(booking)}
              dateSchedule={getDateSchedule(booking)}
              timeSchedule={getTimeSchedule(booking)}
              price={booking.totalPrice ?? booking.price ?? 0}
              status={translateStatus(booking.status ?? '')}
              address={getProviderAddress(booking)}
              providerName={getProviderName(booking)}
              providerEmail={getProviderEmail(booking)}
              providerPhone={getProviderPhone(booking)}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              reviewId={booking.review?.id}
              duration={parseInt(getServiceDuration(booking), 10) || 0}
              role="Client"
              onPressCancel={() => handleCancel(booking.id)}
              onSubmitReview={(rating, comment, reviewId) =>
                handleSubmitReview(rating, comment, reviewId, booking)
              }
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
