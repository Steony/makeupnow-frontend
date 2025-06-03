import DateTimeCard from '@/components/ui/DateTimeCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import ReviewCard from '@/components/ui/ReviewCard';
import ServiceCard from '@/components/ui/ServiceCard';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

const mockReviews = [
  {
    id: 1,
    rating: 5,
    text: 'Professionnelle, talentueuse et tout simplement géniale !',
    author: 'Emma L.',
    date: '02/06/24',
  },
];

const mockServices = [
  {
    id: 1,
    title: 'Maquillage mariée',
    category: 'Mariage',
    description: 'Maquillage naturel et lumineux, idéal pour sublimer le teint le jour du mariage.',
    price: 120,
    duration: '2h',
  },
  {
    id: 2,
    title: 'Maquillage soirée',
    category: 'Beauté',
    description: 'Look sophistiqué pour briller lors de vos événements en soirée.',
    price: 80,
    duration: '1h30',
  },
];

const mockDates = [
  {
    date: 'Mardi 24 avril 2025',
    hours: ['11h00', '13h00', '15h00', '17h00'],
  },
  {
    date: 'Mercredi 25 avril 2025',
    hours: ['10h00', '12h00', '14h00'],
  },
  {
    date: 'Jeudi 26 avril 2025',
    hours: ['9h00', '11h00', '16h00'],
  },
];

export default function ProviderProfileScreen() {
  const averageRating = 4.8;
  const router = useRouter(); // ✅ Déplacé ici

  const [selectedGlobal, setSelectedGlobal] = useState<{ date: string; hour: string } | null>(null);
  const [selectedServiceGlobal, setSelectedServiceGlobal] = useState<number | null>(null);

  const handleSelectHour = (date: string, hour: string) => {
    setSelectedGlobal({ date, hour });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton
        title="Prendre RDV"
        avatarUri={require('../assets/images/avatarclient.png')}
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Photo et nom + note */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/avatarprovider.png')}
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>Selena Vega</Text>
              <View style={styles.ratingContainer}>
                <Image source={require('../assets/images/star.png')} style={styles.starIconLarge} />
                <Text style={styles.ratingText}>{averageRating}/5</Text>
              </View>
            </View>
            <Text style={styles.category}>Mariage, Film</Text>
            <View style={styles.addressRow}>
              <Image
                source={require('../assets/images/locationapi.png')}
                style={styles.locationIcon}
              />
              <Text style={styles.address}>60 avenue du bois, Bagnolet 93170</Text>
            </View>
          </View>

          {/* Avis clients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {mockReviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                text={review.text}
                author={review.author}
                date={review.date}
              />
            ))}
          </View>

          {/* Prestations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prestations</Text>
            {mockServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                category={service.category}
                description={service.description}
                price={service.price}
                duration={service.duration}
                isSelected={selectedServiceGlobal === service.id}
                onPressChoose={() => setSelectedServiceGlobal(service.id)}
              />
            ))}
          </View>

          {/* Date et heure */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure</Text>
            {mockDates.map((item) => (
              <DateTimeCard
                key={item.date}
                date={item.date}
                hours={item.hours}
                selectedGlobal={selectedGlobal}
                onSelectHour={(hour) => handleSelectHour(item.date, hour)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.validateButton}
            onPress={() => {
              if (selectedGlobal && selectedServiceGlobal) {
                // ✅ Navigation vers booking-summary
                router.push('/customer/booking-summary');
              } else {
                console.log('Veuillez sélectionner un service et un créneau !');
              }
            }}
          >
            <Text style={styles.validateButtonText}>Valider mes choix</Text>
          </TouchableOpacity>

          <Footer />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#7946CD',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconLarge: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  category: {
    fontSize: 20,
    color: '#555',
    marginBottom: 7,
    marginTop: 9,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 25,
    height: 25,
    marginRight: 4,
  },
  address: {
    fontSize: 17,
    color: '#444',
    marginTop: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6229C6',
  },
  validateButton: {
    backgroundColor: '#7946CD',
    borderRadius: 5,
    paddingVertical: 14,
    margin: 8,
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
