import AddServiceModal from '@/components/ui/AddServiceModal';
import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import ServicesList from '@/components/ui/ServicesList';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { getItem, handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ServicesScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]); // Liste filtrée à afficher
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // État pour recherche

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  // Récupère la liste des services pour le provider connecté
  const fetchServices = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const jwt = await getItem('jwtToken');
      console.log('🟣 JWT récupéré avant appel API:', jwt);

      let response = await api.get(`/makeup-services/provider/${currentUser.id}`);
      let data = response.data;

      // Gestion cas tableau JSON collé en string
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
        console.error('❌ Données API inattendues :', data);
        setServices([]);
        setFilteredServices([]);
        return;
      }

      // Supprimer doublons sur id
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

  // Met à jour la liste filtrée quand la recherche change
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

  // Après ajout ou modification
  const handleServiceAddedOrUpdated = async () => {
    await fetchServices();
    Toast.show({
      type: 'success',
      text1: 'La liste a été mise à jour !',
    });
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Suppression d'un service
  const handleDeleteService = async (serviceId: number) => {
    try {
      await api.delete(`/makeup-services/${serviceId}`);
      Toast.show({
        type: 'success',
        text1: 'Service supprimé',
      });
      await fetchServices();
    } catch (error) {
      console.error('Erreur suppression service :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de supprimer la prestation',
      });
    }
  };

  // Edition
  const handleEditService = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId) || null;
    setServiceToEdit(service);
    setIsModalVisible(true);
  };

  const providerMenuItems = [
    'Mon dashboard',
    'Mes prestations',
    'Mon planning',
    'Paramètres',
    'Déconnexion',
  ];

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title="Mes prestations"
        showMenu={true}
        showSearch={true}
        showLocationSearch={false}
        menuItems={providerMenuItems}
        onMenuItemPress={handleMenuItemPress}
        avatarUri={providerAvatar}
        searchQuery={searchQuery}
        onChangeSearch={handleSearchChange} 
      />

      <TouchableOpacity
        style={[styles.filterButton, { alignSelf: 'flex-start', marginLeft: 16, marginTop: 10 }]}
        onPress={() => {
          setServiceToEdit(null);
          setIsModalVisible(true);
        }}
      >
        <AppText style={styles.filterButtonText}>+ Ajouter une prestation</AppText>
      </TouchableOpacity>

      <ServicesList
        services={filteredServices} // <-- afficher la liste filtrée
        onEdit={handleEditService}
        refreshServices={fetchServices}
      />

      <Footer />

      <AddServiceModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setServiceToEdit(null);
        }}
        onServiceAdded={handleServiceAddedOrUpdated}
        serviceToEdit={serviceToEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
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
});
