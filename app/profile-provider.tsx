// src/screens/customer/ProviderProfileScreen.tsx

import AppText from '@/components/ui/AppText';
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

// Helper pour parser les réponses API foireuses
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

// 🔤 Fonction utilitaire pour mettre la 1ère lettre en majuscule
function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProviderProfileScreen() {
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const router = useRouter();
  const { currentUser } = useAuth();

  // STATES : Toujours déclarer en haut dans le composant
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [selectedGlobal, setSelectedGlobal] = useState<{ date: string; hour: string; scheduleId?: number } | null>(null);
  const [selectedServiceGlobal, setSelectedServiceGlobal] = useState<number | null>(null);
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);

  // Recherche l'objet service complet à partir de l'id sélectionné
  // (mise à jour quand selectedServiceGlobal change)
  useEffect(() => {
    if (providerProfile?.services && selectedServiceGlobal !== null) {
      const serviceFound = providerProfile.services.find((service: any) => service.id === selectedServiceGlobal);
      setSelectedService(serviceFound || null);
    } else {
      setSelectedService(null);
    }
  }, [providerProfile, selectedServiceGlobal]);

  // Variables pour récapitulatif
  const providerName = providerProfile ? `${providerProfile.firstname} ${providerProfile.lastname}` : '';
  const providerAddress = providerProfile?.address || '';
  const serviceTitle = selectedService ? selectedService.title : '';
  const serviceDuration = selectedService ? `${selectedService.duration} min` : '';
  const totalPrice = selectedServicePrice || 0;


 function getUserFullName(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ') || '';
  return `${firstName} ${lastName}`.trim();
}

const clientName = currentUser ? getUserFullName(currentUser.name) : '';

  // Gestion sélection horaire
  const handleSelectHour = (date: string, hour: string, scheduleId?: number) => {
    setSelectedGlobal({ date, hour, scheduleId });
  };

  // Récupérer le profil du provider
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

  // Appel fetchAvailableSchedules à l'ouverture de la page
  useEffect(() => {
    if (providerId) {
      fetchAvailableSchedules();
    }
  }, [providerId]);

  const fetchAvailableSchedules = async () => {
    try {
      console.log('👉 ProviderID envoyé:', providerId);

      const res = await api.get(`/schedules/provider/${providerId}/available`);
      let data = res.data;
      console.log('🟣 Data reçu Schedules:', data);

      // Correction du bug "array double"
      if (typeof data === 'string' && data.includes('][')) {
        const firstArrayMatch = data.match(/\[[\s\S]*?\]/);
        if (firstArrayMatch) {
          data = firstArrayMatch[0];
        }
      }

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          data = [];
        }
      }
      if (!Array.isArray(data)) data = [];
      setAvailableSchedules(data);
      console.log('🟠 Nb créneaux stockés:', data.length);
    } catch (err) {
      setAvailableSchedules([]);
      Toast.show({ type: 'error', text1: 'Impossible de charger les créneaux' });
      console.log('🔴 ERREUR:', err);
    }
  };

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
                    : '0'}
                  /5
                </Text>
              </View>
            </View>
            <Text style={styles.category}>{providerProfile?.categoriesString || ''}</Text>

            {/* Coordonnées en colonne */}
            <View style={styles.contactsContainer}>
              {providerProfile?.address && (
                <View style={styles.contactRow}>
                  <Image source={require('../assets/images/locationapi.png')} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{providerProfile.address}</Text>
                </View>
              )}
              {providerProfile?.email && (
                <View style={styles.contactRow}>
                  <Image source={require('../assets/images/mailprovider.png')} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{providerProfile.email}</Text>
                </View>
              )}
              {providerProfile?.phoneNumber && (
                <View style={styles.contactRow}>
                  <Image source={require('../assets/images/phoneprovider.png')} style={styles.contactIcon} />
                  <Text style={styles.contactText}>{providerProfile.phoneNumber}</Text>
                </View>
              )}
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
                    setSelectedService(service);
                    // Ne pas rappeler fetchAvailableSchedules ici
                  }}
                />
              ))
            ) : (
              <Text style={{ color: '#555' }}>Aucune prestation disponible.</Text>
            )}
          </View>

          {/* Créneaux disponibles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure</Text>
            {Array.isArray(availableSchedules) && availableSchedules.length > 0 ? (
              availableSchedules.map((item: any) => (
                <DateTimeCard
                  key={item.id}
                  date={
                    item.startTime
                      ? capitalize(
                          new Date(item.startTime).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }),
                        )
                      : ''
                  }
                  hours={[
                    item.startTime
                      ? new Date(item.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '',
                  ]}
                  selectedGlobal={selectedGlobal}
                  onSelectHour={(hour) =>
                    handleSelectHour(
                      item.startTime
                        ? capitalize(
                            new Date(item.startTime).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }),
                          )
                        : '',
                      hour,
                      item.id,
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
              if (
                selectedGlobal &&
                selectedGlobal.scheduleId &&
                selectedServiceGlobal &&
                selectedServicePrice !== null &&
                currentUser
              ) {
                router.push({
                  pathname: '/customer/booking-summary',
                  params: {
                    providerId: String(providerId),
                    serviceId: String(selectedServiceGlobal),
                    scheduleId: String(selectedGlobal.scheduleId),
                    totalPrice: String(totalPrice),
                    customerId: String(currentUser.id),
                    providerName,
                    providerAddress,
                    serviceTitle,
                    serviceDuration,
                    clientName,
                    
                  },
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: 'Merci de sélectionner un créneau et un service.',
                });
              }
            }}
          >
            <AppText style={styles.validateButtonText}>Valider</AppText>
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
  category: { fontSize: 20, color: '#555', marginBottom: 7, marginTop: 9, fontWeight: '600', textAlign: 'center' },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  contactIcon: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  contactText: {
    fontSize: 16,
  },

  contactsContainer: {},

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#6229C6' },
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
  validateButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
