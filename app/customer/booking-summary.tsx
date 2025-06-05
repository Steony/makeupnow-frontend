// 📁 customer/BookingSummaryScreen.tsx

import AppText from '@/components/ui/AppText'; // ✅ Utiliser AppText
import BookingSummaryCard from '@/components/ui/BookingSummaryCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

export default function BookingSummaryScreen() {
  const router = useRouter();

  const bookingDetails = {
    date: 'Mardi 12 octobre à 12h00',
    provider: 'Selena Vega',
    service: 'Maquillage mariée',
    address: '60 avenue du bois, Gallieni',
    duration: '2h',
    clientName: 'Ralphy Wiggum',
    price: 120,
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton
        title="Prendre RDV"
        avatarUri={require('../../assets/images/avatarclient.png')}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AppText style={styles.title}>Récapitulatif de la réservation</AppText>

        <BookingSummaryCard
          date={bookingDetails.date}
          provider={bookingDetails.provider}
          service={bookingDetails.service}
          address={bookingDetails.address}
          duration={bookingDetails.duration}
          clientName={bookingDetails.clientName}
          price={bookingDetails.price}
        />

        <TouchableOpacity
          style={styles.validateButton}
          onPress={handleConfirmReservation}
        >
          <AppText style={styles.validateButtonText}>Confirmer la réservation</AppText>
        </TouchableOpacity>
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
