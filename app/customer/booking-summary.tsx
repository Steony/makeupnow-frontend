import AppText from '@/components/ui/AppText';
import BookingSummaryCard from '@/components/ui/BookingSummaryCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { api } from '@/config/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const {
    providerId,
    serviceId,
    scheduleId,
    totalPrice,
    customerId,
    providerName,
    providerAddress,
    serviceTitle,
    serviceDuration,
    clientName,
  } = useLocalSearchParams<{
    providerId: string;
    serviceId: string;
    scheduleId: string;
    totalPrice: string;
    customerId: string;
    providerName?: string;
    providerAddress?: string;
    serviceTitle?: string;
    serviceDuration?: string;
    clientName?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleConfirmReservation = async () => {
    setLoading(true);
    setBookingError(null);

    if (!providerId || !serviceId || !scheduleId || !customerId || !totalPrice) {
      setBookingError('Informations manquantes pour créer la réservation.');
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Informations manquantes pour créer la réservation.',
      });
      return;
    }

    try {
      const response = await api.post('/bookings', {
        providerId: Number(providerId),
        serviceId: Number(serviceId),
        scheduleId: Number(scheduleId),
        customerId: Number(customerId),
        totalPrice: Number(totalPrice),
      });

      console.log('Réponse brute du serveur:', response.data);

      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          console.warn('Parsing JSON échoué, on continue quand même');
          data = null;
        }
      }

      setBookingDetails(data);

      // 🔁 Création du paiement après la réservation
if (data?.id) {
  const paymentResponse = await api.post('/payments', {
    bookingId: data.id,
    amount: data.totalPrice,
    status: 'En attente',
  });

  const paymentData = paymentResponse.data;

  // Mise à jour de bookingDetails avec le statut de paiement
  setBookingDetails({ ...data, paymentStatus: paymentData.status });
}


      Toast.show({
        type: 'success',
        text1: 'Réservation confirmée !',
        text2: 'Votre réservation a bien été enregistrée.',
        topOffset: 100,
      });

      setTimeout(() => {
        router.push('/customer/booking-list');
      }, 1500);
    } catch (error: any) {
      setBookingError('Impossible de créer la réservation.');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.response?.data?.message || 'Impossible de créer la réservation.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton
        title="Prendre RDV"
        avatarUri={require('../../assets/images/avatarclient.png')}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7946CD" style={{ marginTop: 50 }} />
      ) : bookingError ? (
        <AppText style={{ marginTop: 50, textAlign: 'center', color: 'red' }}>{bookingError}</AppText>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <AppText style={styles.title}>Récapitulatif de la réservation</AppText>

          <BookingSummaryCard
            date={formatDate(bookingDetails?.dateSchedule || '')}
            provider={bookingDetails?.providerName || providerName || ''}
            service={bookingDetails?.serviceTitle || serviceTitle || ''}
            address={bookingDetails?.providerAddress || providerAddress || ''}
            duration={bookingDetails?.serviceDuration || serviceDuration || ''}
            clientName={bookingDetails?.customerName || clientName || ''}
            price={Number(bookingDetails?.totalPrice ?? totalPrice ?? 0)}
             paymentStatus={bookingDetails?.paymentStatus || 'PENDING'}
          />

          <TouchableOpacity style={styles.validateButton} onPress={handleConfirmReservation}>
            <AppText style={styles.validateButtonText}>Confirmer la réservation</AppText>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  validateButton: {
    backgroundColor: '#7946CD',
    borderRadius: 5,
    paddingVertical: 14,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  validateButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
