import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

type Review = {
  id: string;
  rating: number;
  comment: string;
  dateComment: string;
};

type Booking = {
  id: string;
  serviceTitle: string;
  dateSchedule: string;
  timeSchedule: string;
  totalPrice: number;
  status: string;
  customerAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  review?: Review;
  serviceDuration?: string;
  startTime: string;
  endTime: string;
  paymentId?: number;
  paymentStatus?: string; 
};

export default function ServicesScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('Tous');

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.get(`/bookings/provider/${currentUser.id}`);
      let data = res.data;

      if (typeof data === 'string') {
        const matches = data.match(/\[.*?\]/g);
        if (matches && matches.length) {
          let arr: any[] = [];
          matches.forEach((str) => {
            try { arr = arr.concat(JSON.parse(str)); } catch {}
          });
          data = arr;
        } else {
          try { data = JSON.parse(data); } catch { data = []; }
        }
      }
      if (Array.isArray(data) && Array.isArray(data[0])) {
        data = data.flat();
      }
      if (!Array.isArray(data)) data = [];
      setBookings(data);
    } catch (e) {
      console.error('Erreur chargement réservations', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les réservations' });
      setBookings([]);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'COMPLETED': return 'Terminé et payé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  function getDurationInMinutes(start: string, end: string): number | undefined {
    if (!start || !end) return undefined;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return undefined;
    return Math.round((e - s) / 60000);
  }

  // Bookings sans doublon
  const uniqueBookings = bookings.filter(
    (booking, i, self) => i === self.findIndex(b => b.id === booking.id)
  );

  // Filtrage selon statusFilter
  const filteredBookings = uniqueBookings.filter((booking) => {
    if (statusFilter === 'Tous') return true;
    if (statusFilter === 'Terminé') return booking.status === 'COMPLETED';
    if (statusFilter === 'Confirmé') return booking.status === 'CONFIRMED';
    if (statusFilter === 'Annulé') return booking.status === 'CANCELLED';
    return true;
  });

  // Paiement reçu côté Provider
  const handleConfirmPayment = async (paymentId: number, providerId: number) => {
    if (!paymentId || !providerId) {
      Toast.show({ type: 'error', text1: 'Impossible de confirmer : infos manquantes' });
      return;
    }
    try {
      await api.post('/payments/confirm/provider', null, {
        params: { paymentId, providerId }
      });
      Toast.show({ type: 'success', text1: 'Paiement confirmé !' });
      fetchBookings();
    } catch (error) {
      console.error('Erreur de confirmation paiement :', error);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de confirmer le paiement' });
    }
  };

  const providerMenuItems = ['Mon dashboard', 'Services', 'Réservations clients', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Mon dashboard': router.push('/provider/home'); break;
      case 'Services': router.push('/provider/services'); break;
      case 'Réservations clients': router.push('/provider/booking-list'); break;
      case 'Paramètres': router.push('/settings'); break;
      case 'Déconnexion': handleLogout(); break;
      default: break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <HeaderGradient
          title="Réservations clients"
          showMenu
          showSearch
          menuItems={providerMenuItems}
          onMenuItemPress={handleMenuItemPress}
          avatarUri={providerAvatar}
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

        {filteredBookings.length === 0 ? (
          <AppText style={{ marginHorizontal: 16 }}>Aucune réservation</AppText>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id + '-' + (booking.review?.id || 'noreview')}
              title={booking.serviceTitle}
              dateSchedule={booking.dateSchedule}
              timeSchedule={booking.timeSchedule}
              price={booking.totalPrice}
              status={translateStatus(booking.status)}
              address={booking.customerAddress}
              clientName={booking.customerName}
              clientEmail={booking.customerEmail}
              clientPhone={booking.customerPhone}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              reviewId={booking.review?.id}
              duration={parseInt(booking.serviceDuration || '', 10) || getDurationInMinutes(booking.startTime, booking.endTime)}
              role="Provider"
              paymentId={booking.paymentId}
              paymentStatus={booking.paymentStatus}
              providerId={currentUser?.id ? Number(currentUser.id) : undefined}
              onPressConfirm={() =>
                booking.paymentId && currentUser?.id
                  ? handleConfirmPayment(booking.paymentId, Number(currentUser.id))
                  : Toast.show({ type: 'error', text1: 'Impossible de confirmer : infos manquantes' })
              }
            />
          ))
        )}

        <Footer />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingBottom: 30 },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 8,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#a478dd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginBottom: 20,
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
});
