// src/screens/customer/ProviderProfileScreen.tsx
import DateTimeCard from '@/components/ui/DateTimeCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import ReviewCard from '@/components/ui/ReviewCard';
import ServiceCard from '@/components/ui/ServiceCard';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext'; // ➜ Pour l’utilisateur connecté
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ProviderProfileScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();

  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedGlobal, setSelectedGlobal] = useState<{ date: string; hour: string } | null>(null);
  const [selectedServiceGlobal, setSelectedServiceGlobal] = useState<number | null>(null);

  const handleSelectHour = (date: string, hour: string) => {
    setSelectedGlobal({ date, hour });
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        if (!providerId) {
          console.error('Aucun id de provider trouvé.');
          return;
        }

        const profileRes = await api.get(`/providers/${providerId}/profile`);
        setProviderProfile(profileRes.data);

        const ratingRes = await api.get(`/providers/${providerId}/rating`);
        setAverageRating(ratingRes.data);

        const reviewsRes = await api.get(`/reviews/provider/${providerId}`);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du provider :', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de charger les données du profil.',
        });
      }
    };
    fetchProviderData();
  }, [providerId]);

  // 🟣 Avatar du Header : user connecté ou fallback
  const headerAvatar = currentUser?.avatar || getDefaultAvatar(currentUser?.role as any);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton
        title="Prendre RDV"
        avatarUri={headerAvatar}
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 🟣 Avatar du Provider (profil du prestataire) */}
          <View style={styles.header}>
            <Image
              source={
                providerProfile?.avatar
                  ? { uri: providerProfile.avatar }
                  : require('../assets/images/avatarprovider.png')
              }
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{providerProfile?.name || '...'}</Text>
              <View style={styles.ratingContainer}>
                <Image source={require('../assets/images/star.png')} style={styles.starIconLarge} />
                <Text style={styles.ratingText}>{averageRating.toFixed(1)}/5</Text>
              </View>
            </View>
            <Text style={styles.category}>{providerProfile?.category || ''}</Text>
            <View style={styles.addressRow}>
              <Image source={require('../assets/images/locationapi.png')} style={styles.locationIcon} />
              <Text style={styles.address}>{providerProfile?.address || ''}</Text>
            </View>
          </View>

          {/* Avis clients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {reviews.length === 0 ? (
              <Text style={{ color: '#555' }}>Aucun avis pour le moment.</Text>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  rating={review.rating}
                  text={review.text}
                  author={review.author}
                  date={review.date}
                />
              ))
            )}
          </View>

          {/* Prestations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prestations</Text>
            {providerProfile?.services?.map((service: any) => (
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

          {/* Créneaux */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure</Text>
            {providerProfile?.schedules?.map((item: any) => (
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
                router.push('/customer/booking-summary');
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Attention',
                  text2: 'Veuillez sélectionner un service et un créneau !',
                });
              }
            }}
          >
            <Text style={styles.validateButtonText}>Valider</Text>
          </TouchableOpacity>
        </ScrollView>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'space-between' },
  scrollContainer: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  name: { fontSize: 25, fontWeight: 'bold', color: '#7946CD', marginRight: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  starIconLarge: { width: 20, height: 20, marginRight: 4 },
  ratingText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  category: { fontSize: 20, color: '#555', marginBottom: 7, marginTop: 9, fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 25, height: 25, marginRight: 4 },
  address: { fontSize: 17, color: '#444', marginTop: 3 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#6229C6' },
  validateButton: { backgroundColor: '#7946CD', borderRadius: 5, paddingVertical: 14, margin: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.9, shadowRadius: 9, elevation: 2 },
  validateButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
