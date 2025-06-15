import AddServiceModal from '@/components/ui/AddServiceModal';
import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import ScheduleModal from '@/components/ui/ScheduleModal';
import ServicesList from '@/components/ui/ServicesList';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

// Types pour les créneaux
type Slot = {
  id: number | string;
  startTime: string;
  endTime: string;
};

export default function PlanningScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // --- Services ---
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Créneaux ---
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeTab, setActiveTab] = useState<'Services' | 'Créneaux'>('Services');
  const [dateSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal ajout/modif créneau
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Modal suppression créneau
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  // === FETCH SERVICES ===
  const fetchServices = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const response = await api.get(`/makeup-services/provider/${currentUser.id}`);
      let data = response.data;

      // Cas tableau JSON collé en string
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
        setServices([]);
        setFilteredServices([]);
        return;
      }

      // Supprimer doublons
      const uniqueServicesMap = new Map();
      data.forEach((service: any) => {
        uniqueServicesMap.set(service.id, service);
      });
      const uniqueServices = Array.from(uniqueServicesMap.values());

      setServices(uniqueServices);
      setFilteredServices(uniqueServices);
    } catch (error) {
      console.error('Erreur lors de la récupération des services :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les services',
      });
    }
  }, [currentUser]);

  // Recherche dans services
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredServices(services);
    } else {
      const lowerText = text.toLowerCase();
      const filtered = services.filter(s =>
        s.title.toLowerCase().includes(lowerText) ||
        s.description.toLowerCase().includes(lowerText) ||
        s.categoryTitle.toLowerCase().includes(lowerText)
      );
      setFilteredServices(filtered);
    }
  };

  // Après ajout ou modif service
  const handleServiceAddedOrUpdated = async () => {
    await fetchServices();
    Toast.show({
      type: 'success',
      text1: 'La liste a été mise à jour !',
    });
  };


  // Edition service
  const handleEditService = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId) || null;
    setServiceToEdit(service);
    setIsServiceModalVisible(true);
  };

  // === FETCH CRENEAUX ===
  const fetchSlots = useCallback(async () => {
    if (!currentUser?.id) return;
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
    } catch  {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger les créneaux' });
      setSlots([]);
    }
  }, [currentUser]);

  // Recharge données services et créneaux au chargement et update
  const reloadData = useCallback(() => {
    fetchServices();
    fetchSlots();
  }, [fetchServices, fetchSlots]);

  React.useEffect(() => { reloadData(); }, [reloadData]);

  // Créneaux triés uniques
  const uniqueSlots = slots.filter((slot, i, self) => i === self.findIndex(s => s.id === slot.id));
  const sortedSlots = uniqueSlots.sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return dateSortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  // Modals création / modification créneau
  const openAddSlotModal = () => {
    setEditingSlot(null);
    setIsSlotModalVisible(true);
  };
  const openEditSlotModal = (slot: Slot) => {
    setEditingSlot(slot);
    setIsSlotModalVisible(true);
  };

  // Ajout/modif créneau
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
      setIsSlotModalVisible(false);
      setEditingSlot(null);
      reloadData();
    } catch  {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder le créneau' });
    }
  };

  // Modal suppression créneau
  const openDeleteSlotModal = (slot: Slot) => {
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
    } catch  {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de supprimer le créneau' });
    }
  };

  // Rendu carte créneau
  const renderSlotCard = (slot: Slot) => (
    <View key={slot.id} style={styles.slotCardContainer}>
      <View style={styles.slotTexts}>
        <AppText style={styles.slotDate}>{new Date(slot.startTime).toLocaleDateString('fr-FR')}</AppText>
        <AppText style={styles.slotTime}>
          {new Date(slot.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -{' '}
          {new Date(slot.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      </View>

      <View style={styles.slotButtons}>
        <TouchableOpacity onPress={() => openEditSlotModal(slot)} style={styles.editButton}>
          <AppText style={styles.editButtonText}>Modifier</AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDeleteSlotModal(slot)} style={styles.deleteButton}>
          <AppText style={styles.deleteButtonText}>Supprimer</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.slotSeparator} />
    </View>
  );

  const providerMenuItems = ['Mon dashboard', 'Services', 'Réservations clients', 'Paramètres', 'Déconnexion'];
  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Mon dashboard': router.push('/provider/home'); break;
      case 'Services': router.push('/provider/services'); break;
      case 'Réservations clients': router.push('/provider/booking-list'); break;
      case 'Paramètres': router.push('/settings'); break;
      case 'Déconnexion': handleLogout(); break;
      default: break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <HeaderGradient
          title="Services"
          showMenu
          showSearch
          menuItems={providerMenuItems}
          onMenuItemPress={handleMenuItemPress}
          avatarUri={providerAvatar}
          searchQuery={searchQuery}
          onChangeSearch={handleSearchChange}
        />

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Services' && styles.activeTab]}
            onPress={() => setActiveTab('Services')}
          >
            <AppText style={[styles.tabText, activeTab === 'Services' && styles.activeTabText]}>
              Services
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

        {activeTab === 'Services' && (
          <>
            <TouchableOpacity
              style={[styles.filterButton, { alignSelf: 'flex-start', marginLeft: 16, marginTop: 10 }]}
              onPress={() => {
                setServiceToEdit(null);
                setIsServiceModalVisible(true);
              }}
            >
              <AppText style={styles.filterButtonText}>+ Ajouter une prestation</AppText>
            </TouchableOpacity>

            <ServicesList
              services={filteredServices}
              onEdit={handleEditService}
              refreshServices={fetchServices}
            />

            <AddServiceModal
              visible={isServiceModalVisible}
              onClose={() => {
                setIsServiceModalVisible(false);
                setServiceToEdit(null);
              }}
              onServiceAdded={handleServiceAddedOrUpdated}
              serviceToEdit={serviceToEdit}
            />
          </>
        )}

       {activeTab === 'Créneaux' && (
  <>
    <TouchableOpacity
      style={[styles.filterButton, { alignSelf: 'flex-start', marginLeft: 16, marginTop: 10 }]}
      onPress={openAddSlotModal}
    >
      <AppText style={styles.filterButtonText}>+ Ajouter un créneau</AppText>
    </TouchableOpacity>

    {sortedSlots.length === 0 ? (
      <AppText style={{ marginHorizontal: 16 }}>Aucun créneau disponible</AppText>
    ) : (
      <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {sortedSlots.map(renderSlotCard)}
      </View>
    )}

    <ScheduleModal
      visible={isSlotModalVisible}
      onClose={() => {
        setIsSlotModalVisible(false);
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
          </>
        )}

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingBottom: 30 },
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
  filterButton: {
    borderWidth: 1,
    borderColor: '#a478dd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginBottom: 20,
  },
  filterButtonText: {
    color: '#a478dd',
  },
  slotCardContainer: {
    paddingVertical: 8,
    width: '94%',
    alignSelf: 'center',
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
     marginLeft: 45,
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
