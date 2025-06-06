import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import ScheduleModal from '@/components/ui/ScheduleModal'; // ✅ Ajout du modal pour créneaux
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function PlanningScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [activeTab, setActiveTab] = useState<'Réservations' | 'Créneaux'>('Réservations');
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalVisible, setIsModalVisible] = useState(false); // ✅ État pour le modal

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await api.get(`/bookings/provider/${currentUser.id}`);
        setBookings(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations :', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de charger les réservations',
        });
      }
    };

    const fetchSlots = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await api.get(`/schedules/provider/${currentUser.id}`);
        setSlots(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des créneaux :', error);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Impossible de charger les créneaux',
        });
      }
    };

    fetchBookings();
    fetchSlots();
  }, [currentUser]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'En cours' && booking.status === 'EN_COURS') ||
      (statusFilter === 'Confirmée' && booking.status === 'CONFIRMED') ||
      (statusFilter === 'Annulé' && booking.status === 'CANCELLED') ||
      (statusFilter === 'Terminé' && booking.status === 'COMPLETED');
    return matchesStatus;
  });

  const handleConfirmPayment = (paymentId: number) => {
    Alert.alert('Confirmation', 'Confirmer le paiement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await api.post('/payments/confirm/provider', null, {
              params: { paymentId, providerId: currentUser?.id },
            });
            Toast.show({
              type: 'success',
              text1: 'Paiement confirmé !',
            });
          } catch (error) {
            console.error('Erreur de confirmation paiement :', error);
            Toast.show({
              type: 'error',
              text1: 'Erreur',
              text2: 'Impossible de confirmer le paiement',
            });
          }
        },
      },
    ]);
  };

  const handleAddSlot = async (slotData: { date: string; startTime: string; endTime: string }) => {
    try {
      await api.post('/schedules', {
        providerId: currentUser?.id,
        date: slotData.date,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
      });
      Toast.show({ type: 'success', text1: 'Créneau ajouté avec succès !' });
      setIsModalVisible(false);
      const response = await api.get(`/schedules/provider/${currentUser?.id}`);
      setSlots(response.data); // recharge la liste
    } catch (error) {
      console.error('Erreur ajout créneau :', error);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible d\'ajouter le créneau' });
    }
  };

  const providerMenuItems = ['Mon dashboard', 'Mes prestations', 'Mon planning', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Mon dashboard':
        router.push('/provider/home');
        break;
      case 'Mes prestations':
        router.push('/provider/services');
        break;
      case 'Mon planning':
        router.push('/provider/planning');
        break;
      case 'Paramètres':
        router.push('/settings');
        break;
      case 'Déconnexion':
        handleLogout();
        break;
      default:
        console.log('Aucune action définie');
    }
  };

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('fr-FR');
  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const sortedSlots = [...slots].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mon planning"
        showMenu={true}
        showSearch={true}
        showLocationSearch={false}
        menuItems={providerMenuItems}
        onMenuItemPress={handleMenuItemPress}
        avatarUri={providerAvatar}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Réservations' && styles.activeTab]}
          onPress={() => setActiveTab('Réservations')}
        >
          <AppText style={[styles.tabText, activeTab === 'Réservations' && styles.activeTabText]}>
            Réservations clients
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Créneaux' && styles.activeTab]}
          onPress={() => setActiveTab('Créneaux')}
        >
          <AppText style={[styles.tabText, activeTab === 'Créneaux' && styles.activeTabText]}>
            Créneaux disponibles
          </AppText>
        </TouchableOpacity>
      </View>

      {activeTab === 'Créneaux' && (
        <TouchableOpacity
          style={[styles.filterButton, { alignSelf: 'flex-start', marginLeft: 16, marginTop: 10 }]}
          onPress={() => setIsModalVisible(true)}
        >
          <AppText style={styles.filterButtonText}>+ Ajouter un créneau</AppText>
        </TouchableOpacity>
      )}

      {activeTab === 'Réservations' && (
        <View style={styles.filterContainer}>
          <AppText style={styles.filterLabel}>Filtre:</AppText>
          {['Tous', 'Terminé', 'En cours', 'Annulé'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.activeFilterButton,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.activeFilterButtonText,
                ]}
              >
                {status}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'Créneaux' && (
        <View style={styles.filterContainer}>
          <AppText style={styles.filterLabel}>Trier par date:</AppText>
          {['Croissant', 'Décroissant'].map((order) => (
            <TouchableOpacity
              key={order}
              style={[
                styles.filterButton,
                (order === 'Croissant' && dateSortOrder === 'asc') ||
                (order === 'Décroissant' && dateSortOrder === 'desc')
                  ? styles.activeFilterButton
                  : {},
              ]}
              onPress={() =>
                setDateSortOrder(order === 'Croissant' ? 'asc' : 'desc')
              }
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  (order === 'Croissant' && dateSortOrder === 'asc') ||
                  (order === 'Décroissant' && dateSortOrder === 'desc')
                    ? styles.activeFilterButtonText
                    : {},
                ]}
              >
                {order}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'Réservations' ? (
          <View style={styles.bookingList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                title={booking.serviceTitle}
                date={formatDate(booking.dateBooking)}
                time={formatTime(booking.dateBooking)}
                price={booking.totalPrice}
                status={booking.status}
                address={booking.customerAddress}
                providerName={booking.customerName}
                providerEmail={booking.customerEmail}
                providerPhone={booking.customerPhone}
                rating={booking.review?.rating}
                review={booking.review?.comment}
                reviewDate={booking.review?.dateComment}
                onPressConfirm={() => handleConfirmPayment(booking.paymentId)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.bookingList}>
            {sortedSlots.map((slot) => (
              <View
                key={slot.id}
                style={{
                  backgroundColor: '#f1f1f1',
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 10,
                }}
              >
                <AppText>Date: {formatDate(slot.date)}</AppText>
                <AppText>Heure: {formatTime(slot.date)}</AppText>
                <AppText>Durée: {slot.duration} min</AppText>
                <AppText>Disponible: {slot.isAvailable ? 'Oui' : 'Non'}</AppText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Footer />
      <ScheduleModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddSlot}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#a478dd',
  },
  tabText: {
    fontSize: 16,
    color: '#000',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#a478dd',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 15,
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
    fontSize: 14,
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
