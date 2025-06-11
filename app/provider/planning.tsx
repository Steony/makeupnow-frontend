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

export default function PlanningScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // Normaliser données (gère retour API)
  const extractData = (data: any) => {
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) return data[0];
      return data;
    }
    return [];
  };

  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [activeTab, setActiveTab] = useState<'Réservations' | 'Créneaux'>('Réservations');
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal ajout/modif
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Modal suppression
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  // Fonction pour recharger bookings et slots (useCallback pour éviter recréations)
  const reloadData = useCallback(() => {
    if (!currentUser?.id) return;

    const fetchBookings = async () => {
      try {
        const res = await api.get(`/bookings/provider/${currentUser.id}`);
        setBookings(extractData(res.data));
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
          console.error('Les créneaux ne sont pas un tableau', data);
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

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Supprimer doublons et trier
  const uniqueSlots = slots.filter((slot, i, self) => i === self.findIndex(s => s.id === slot.id));
  const sortedSlots = uniqueSlots.sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return dateSortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  // Ouvrir modal ajout
  const openAddModal = () => {
    setEditingSlot(null);
    setIsModalVisible(true);
  };

  // Ouvrir modal modif
  const openEditModal = (slot: Slot) => {
    setEditingSlot(slot);
    setIsModalVisible(true);
  };

  // Soumettre ajout ou modif
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

      // Recharge la liste des créneaux
      reloadData();
    } catch (e) {
      console.error('Erreur sauvegarde créneau', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder le créneau' });
    }
  };

  // Ouvrir modal suppression
  const openDeleteModal = (slot: Slot) => {
    setSlotToDelete(slot);
    setDeleteModalVisible(true);
  };

  // Supprimer créneau confirmé
  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    try {
      await api.delete(`/schedules/${slotToDelete.id}`);
      Toast.show({ type: 'success', text1: 'Créneau supprimé avec succès !' });
      setDeleteModalVisible(false);
      setSlotToDelete(null);

      // Recharge la liste des créneaux
      reloadData();
    } catch (e) {
      console.error('Erreur suppression créneau', e);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de supprimer le créneau' });
    }
  };

  // Confirmation paiement côté Provider
  const handleConfirmPayment = async (paymentId: number) => {
    if (!currentUser?.id) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Utilisateur non connecté' });
      return;
    }

    try {
      await api.post('/payments/confirm/provider', null, {
        params: {
          paymentId: paymentId,
          providerId: currentUser.id,
        },
      });
      Toast.show({ type: 'success', text1: 'Paiement confirmé !' });
      reloadData(); // Recharge réservations pour mise à jour après paiement confirmé
    } catch (error) {
      console.error('Erreur de confirmation paiement :', error);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de confirmer le paiement' });
    }
  };

  // Formatage date/heure
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
      default: console.log('Aucune action définie');
    }
  };

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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {bookings.map((booking) => (
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
              role="Provider"  // ou 'Client' ou 'Admin' selon contexte
              onPressConfirm={() => handleConfirmPayment(booking.paymentId)}
            />
          ))}
        </ScrollView>
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
  filterButton: {
    borderWidth: 1,
    borderColor: '#a478dd',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#a478dd',
    fontSize: 14,
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
