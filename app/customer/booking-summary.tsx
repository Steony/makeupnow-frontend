// src/screens/customer/BookingSummaryScreen.tsx

import AppText from '@/components/ui/AppText';
import BookingSummaryCard from '@/components/ui/BookingSummaryCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { api } from '@/config/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBookingDetails(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du booking:', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de charger les détails de la réservation.',
        });
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleConfirmReservation = () => {
    Toast.show({
      type: 'success',
      text1: 'Réservation confirmée !',
      text2: 'Votre réservation a bien été enregistrée.',
      topOffset: 100,
    });

    setTimeout(() => {
      router.push('/customer/booking-list');
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      <HeaderWithBackButton title="Prendre RDV" avatarUri={require('../../assets/images/avatarclient.png')} />

      {loading ? (
        <ActivityIndicator size="large" color="#7946CD" style={{ marginTop: 50 }} />
      ) : bookingDetails ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <AppText style={styles.title}>Récapitulatif de la réservation</AppText>

          <BookingSummaryCard
            date={formatDate(bookingDetails.dateBooking)}
            provider={bookingDetails.providerName}
            service={bookingDetails.serviceTitle}
            address={bookingDetails.providerAddress}
            duration={bookingDetails.serviceDuration}
            clientName={bookingDetails.customerName}
            price={bookingDetails.totalPrice}
          />

          <TouchableOpacity style={styles.validateButton} onPress={handleConfirmReservation}>
            <AppText style={styles.validateButtonText}>Confirmer la réservation</AppText>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <AppText style={{ marginTop: 50, textAlign: 'center' }}>Aucune donnée trouvée.</AppText>
      )}

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
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
    shadowOpacity: 0.9,
    shadowRadius: 9,
    elevation: 2,
  },
  validateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
