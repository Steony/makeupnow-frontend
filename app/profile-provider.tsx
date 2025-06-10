// src/screens/customer/ProviderProfileScreen.tsx

import DateTimeCard from '@/components/ui/DateTimeCard';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import ReviewCard from '@/components/ui/ReviewCard';
import ServiceCard from '@/components/ui/ServiceCard';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

/**
 * Helper universel pour parser les réponses API foireuses (string JSON, array, objet, etc.)
 */
function parseApiData(data: any) {
  if (typeof data === 'string') {
    const matchArray = data.match(/\[.*?\]/s);
    if (matchArray) {
      try {
        return JSON.parse(matchArray[0]);
      } catch {}
    }
    try {
      return JSON.parse(data);
    } catch {}
  }
  return data;
}

export default function ProviderProfileScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();

  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [selectedGlobal, setSelectedGlobal] = useState<{ date: string; hour: string; scheduleId?: number } | null>(null);
  const [selectedServiceGlobal, setSelectedServiceGlobal] = useState<number | null>(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null);

  const handleSelectHour = (date: string, hour: string, scheduleId?: number) => {
    setSelectedGlobal({ date, hour, scheduleId });
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        if (!providerId) {
          console.error('Aucun id de provider trouvé.');
          return;
        }
        const profileRes = await api.get(`/providers/${providerId}/profile`);
        let data = profileRes.data;

        if (typeof data === 'string') {
          const splitted = data.split('}{');
          if (splitted.length > 1) {
            try {
              data = JSON.parse(splitted[0] + '}');
            } catch (e) {
              console.error('Erreur parsing JSON partie 1:', e);
              data = {};
            }
          } else {
            try {
              data = JSON.parse(data);
            } catch (e) {
              console.error('Erreur parsing JSON:', e);
              data = {};
            }
          }
        }

        setProviderProfile(data);
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

  // Avatar du Header : user connecté ou fallback
  const headerAvatar = currentUser?.avatar || getDefaultAvatar(currentUser?.role as any);
  // Avatar du provider (fallback si pas d’avatar)
  const providerAvatar = providerProfile?.avatar
    ? { uri: providerProfile.avatar }
    : require('../assets/images/avatarprovider.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton title="Prendre RDV" avatarUri={headerAvatar} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Avatar + nom + rating */}
          <View style={styles.header}>
            <Image source={providerAvatar} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>
                {providerProfile && providerProfile.firstname && providerProfile.lastname
                  ? `${providerProfile.firstname} ${providerProfile.lastname}`
                  : '...'}
              </Text>
              <View style={styles.ratingContainer}>
                <Image source={require('../assets/images/star.png')} style={styles.starIconLarge} />
                <Text style={styles.ratingText}>
                  {typeof providerProfile?.averageRating === 'number' && !isNaN(providerProfile.averageRating)
                    ? providerProfile.averageRating.toFixed(1)
                    : '0'
                  }/5
                </Text>
              </View>
            </View>
            <Text style={styles.category}>
              {providerProfile?.categoriesString || ''}
            </Text>
            <View style={styles.addressRow}>
              <Image source={require('../assets/images/locationapi.png')} style={styles.locationIcon} />
              <Text style={styles.address}>{providerProfile?.address || ''}</Text>
            </View>
          </View>

          {/* Avis clients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {!providerProfile?.reviews || providerProfile.reviews.length === 0 ? (
              <Text style={{ color: '#555' }}>Aucun avis pour le moment.</Text>
            ) : (
              providerProfile.reviews.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  rating={review.rating}
                  text={review.comment}
                  author={review.customerName}
                  date={review.dateComment ? new Date(review.dateComment).toLocaleDateString('fr-FR') : ''}
                />
              ))
            )}
          </View>

          {/* Prestations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prestations</Text>
            {providerProfile?.services?.length > 0 ? (
              providerProfile.services.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  category={service.categoryTitle}
                  description={service.description}
                  price={service.price}
                  duration={`${service.duration} min`}
                  isSelected={selectedServiceGlobal === service.id}
                  onPressChoose={() => {
                    setSelectedServiceGlobal(service.id);
                    setSelectedServicePrice(service.price);
                  }}
                />
              ))
            ) : (
              <Text style={{ color: '#555' }}>Aucune prestation disponible.</Text>
            )}
          </View>

          {/* Créneaux */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure</Text>
            {providerProfile?.schedules?.length > 0 ? (
              providerProfile.schedules.map((item: any) => (
                <DateTimeCard
                  key={item.id}
                  date={
                    item.startTime
                      ? new Date(item.startTime).toLocaleDateString('fr-FR')
                      : ''
                  }
                  hours={[
                    item.startTime
                      ? new Date(item.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : ''
                  ]}
                  selectedGlobal={selectedGlobal}
                  onSelectHour={(hour) =>
                    handleSelectHour(
                      item.startTime ? new Date(item.startTime).toLocaleDateString('fr-FR') : '',
                      hour,
                      item.id // transmet l'id du créneau ici
                    )
                  }
                />
              ))
            ) : (
              <Text style={{ color: '#555' }}>Aucun créneau disponible.</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.validateButton}
            onPress={() => {
              if (selectedGlobal && selectedServiceGlobal && selectedGlobal.scheduleId) {
                router.push({
                  pathname: '/customer/booking-summary',
                  params: {
                    providerId: providerProfile.id.toString(),
                    serviceId: selectedServiceGlobal.toString(),
                    scheduleId: selectedGlobal.scheduleId.toString(),
                    totalPrice: selectedServicePrice?.toString() || '',
                    customerId: currentUser?.id.toString() || '',
                  },
                });
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
