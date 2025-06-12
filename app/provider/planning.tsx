import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import ScheduleModal from '@/components/ui/ScheduleModal';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

type Slot = {
  id: number | string;
  startTime: string;
  endTime: string;
};

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
};

export default function PlanningScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeTab, setActiveTab] = useState<'Réservations' | 'Créneaux'>('Réservations');
  const [dateSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal ajout/modif
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Modal suppression
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

  const providerAvatar = require('@/assets/images/avatarprovider.png');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Rechargement bookings et slots
  const reloadData = useCallback(() => {
    if (!currentUser?.id) return;

    const fetchBookings = async () => {
      try {
        const res = await api.get(`/bookings/provider/${currentUser.id}`);
        let data = res.data;

        if (typeof data === 'string') {
          // Gère les retours string/json foireux du backend
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
    };

    const fetchSlots = async () => {
      try {
        const res = await api.get(`/schedules/provider/${currentUser.id}`);
        let data = res.data;
        if (typeof data === 'string') {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            const firstArray = JSON.parse(parts[0] + ']');
            const secondArray = JSON.parse('[' + parts[1]);
            data = [...firstArray, ...secondArray];
          } else {
            data = JSON.parse(data);
          }
        }
        if (!Array.isArray(data)) {
          setSlots([]);
          return;
        }
        setSlots(data);
      } catch (e) {
        console.error('Erreur chargement créneaux', e);
        Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les créneaux' });
        setSlots([]);
      }
    };

    fetchBookings();
    fetchSlots();
  }, [currentUser]);

  useEffect(() => { reloadData(); }, [reloadData]);

  // Slots triés et sans doublons
  const uniqueSlots = slots.filter((slot, i, self) => i === self.findIndex(s => s.id === slot.id));
  const sortedSlots = uniqueSlots.sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return dateSortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  // Modal ajout
  const openAddModal = () => {
    setEditingSlot(null);
    setIsModalVisible(true);
  };

  // Modal modif
  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    setIsModalVisible(true);
  };

  // Ajout ou modif slot
  const handleSubmitSlot = async (slotData: { date: string; startTime: string; endTime: string }) => {
    try {
      const { date, startTime, endTime } = slotData;
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      if (editingSlot) {
        await api.put(`/schedules/${editingSlot.id}`, { startTime: startDateTime, endTime: endDateTime });
        Toast.show({ type: 'success', text1: 'Créneau modifié avec succès !' });
      } else {
        await api.post('/schedules', { providerId: currentUser?.id, startTime: startDateTime, endTime: endDateTime });
        Toast.show({ type: 'success', text1: 'Créneau ajouté avec succès !' });
      }

      setIsModalVisible(false);
      setEditingSlot(null);
      reloadData();
    } catch (e) {
      console.error('Erreur sauvegarde créneau', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder le créneau' });
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'COMPLETED': return 'Terminé et payé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  // Modal suppression
  const openDeleteModal = (slot: Slot) => {
    setSlotToDelete(slot);
    setDeleteModalVisible(true);
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    try {
      await api.delete(`/schedules/${slotToDelete.id}`);
      Toast.show({ type: 'success', text1: 'Créneau supprimé avec succès !' });
      setDeleteModalVisible(false);
      setSlotToDelete(null);
      reloadData();
    } catch (e) {
      console.error('Erreur suppression créneau', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de supprimer le créneau' });
    }
  };

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
      reloadData();
    } catch (error) {
      console.error('Erreur de confirmation paiement :', error);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de confirmer le paiement' });
    }
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? 'Date invalide' : d.toLocaleDateString('fr-FR');
  };

  const formatTime = (isoDate: string) => {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? 'Heure invalide' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Rendu carte créneau
  const renderSlotCard = (slot: Slot) => (
    <View key={slot.id} style={styles.slotCardContainer}>
      <View style={styles.slotTexts}>
        <AppText style={styles.slotDate}>{formatDate(slot.startTime)}</AppText>
        <AppText style={styles.slotTime}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</AppText>
      </View>

      <View style={styles.slotButtons}>
        <TouchableOpacity onPress={() => openEditModal(slot)} style={styles.editButton}>
          <AppText style={styles.editButtonText}>Modifier</AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDeleteModal(slot)} style={styles.deleteButton}>
          <AppText style={styles.deleteButtonText}>Supprimer</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.slotSeparator} />
    </View>
  );

  const providerMenuItems = ['Mon dashboard', 'Mes prestations', 'Mon planning', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Mon dashboard': router.push('/provider/home'); break;
      case 'Mes prestations': router.push('/provider/services'); break;
      case 'Mon planning': router.push('/provider/planning'); break;
      case 'Paramètres': router.push('/settings'); break;
      case 'Déconnexion': handleLogout(); break;
      default: break;
    }
  };

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

  function getDurationInMinutes(start: string, end: string): number | undefined {
    if (!start || !end) return undefined;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return undefined;
    return Math.round((e - s) / 60000);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mon planning"
        showMenu
        showSearch
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
          onPress={openAddModal}
        >
          <AppText style={styles.filterButtonText}>+ Ajouter un créneau</AppText>
        </TouchableOpacity>
      )}

      {activeTab === 'Réservations' && (
        <>
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

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {filteredBookings.map((booking) => {
              console.log('DEBUG Booking:', booking, 'currentUser:', currentUser);
              return (
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
                  providerId={currentUser?.id ? Number(currentUser.id) : undefined}
                  onPressConfirm={() =>
                    booking.paymentId && currentUser?.id
                      ? handleConfirmPayment(booking.paymentId, Number(currentUser.id))
                      : Toast.show({ type: 'error', text1: 'Impossible de confirmer : infos manquantes' })
                  }
                />
              );
            })}
          </ScrollView>
        </>
      )}

      {activeTab === 'Créneaux' && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {sortedSlots.length === 0 ? (
            <AppText>Aucun créneau disponible</AppText>
          ) : (
            sortedSlots.map(renderSlotCard)
          )}
        </ScrollView>
      )}

      <Footer />

      {/* Modal ajout/modif */}
      <ScheduleModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingSlot(null);
        }}
        onSubmit={handleSubmitSlot}
        mode={editingSlot ? 'edit' : 'add'}
        initialData={
          editingSlot
            ? {
                date: editingSlot.startTime.slice(0, 10),
                startTime: editingSlot.startTime.slice(11, 16),
                endTime: editingSlot.endTime.slice(11, 16),
              }
            : undefined
        }
      />

      {/* Modal suppression */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Confirmer la suppression ?</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleDeleteSlot}>
                <AppText style={styles.modalButtonConfirmText}>Oui</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setDeleteModalVisible(false)}>
                <AppText style={styles.modalButtonCancelText}>Non</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
     marginBottom: 12,
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
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
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
  slotCardContainer: {
    paddingVertical: 12,
  },
  slotTexts: {
    flexDirection: 'column',
    flex: 1,
  },
  slotDate: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
  },
  slotButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  editButtonText: {
    color: '#000',
  },
  deleteButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  slotSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButtonConfirm: {
    backgroundColor: '#a478dd',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: '#a478dd',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  modalButtonCancelText: {
    color: '#a478dd',
    fontWeight: '700',
  },
});
