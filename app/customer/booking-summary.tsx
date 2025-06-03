// 📁 customer/BookingSummaryScreen.tsx

import BookingSummaryCard from '@/components/ui/BookingSummaryCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { useRouter } from 'expo-router'; // ✅ import du router
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message'; // ✅ import du Toast

export default function BookingSummaryScreen() {
  const router = useRouter(); // ✅ initialiser le router

  // ⚙️ Tu peux ici récupérer dynamiquement les données de la réservation
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
    // ✅ Afficher le toast de confirmation
    Toast.show({
      type: 'success',
      text1: 'Réservation confirmée !',
      text2: 'Votre réservation a bien été enregistrée.',
       topOffset: 100,
    });

    // ✅ Redirection vers la page Mes Réservations (tu peux adapter la route)
    setTimeout(() => {
      router.push('/customer/bookings'); // par exemple vers customer/bookings.tsx
    }, 1500); // léger délai pour laisser le toast s’afficher
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton
        title="Prendre RDV"
        avatarUri={require('../../assets/images/avatarclient.png')}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Récapitulatif de la réservation</Text>

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
          onPress={handleConfirmReservation} // ✅ lie la méthode ici
        >
          <Text style={styles.validateButtonText}>Confirmer ma réservation</Text>
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
