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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const providerAvatar = require('@/assets/images/avatarprovider.png');

  const checkJwtToken = async () => {
    const jwt = await getItem('jwtToken');
    console.log('🟣 JWT récupéré avant appel API:', jwt);
  };

  const fetchServices = useCallback(async () => {
    if (!currentUser?.id) return;

    console.log('🔍 currentUser.id envoyé:', currentUser?.id);
    await checkJwtToken();

    try {
      const response = await api.get(`/makeup-services/provider/${currentUser.id}`);
      console.log('✅ Data reçue:', response.data);

      if (Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        console.error('❌ Données API inattendues :', response.data);
        setServices([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des services :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les services',
      });
    }
  }, [currentUser]);

  const handleServiceAdded = async () => {
    await fetchServices();
    Toast.show({
      type: 'success',
      text1: 'Prestation ajoutée',
      text2: 'La liste a été mise à jour !',
    });
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEditService = (serviceId: number) => {
    console.log('👉 Modifier service ID:', serviceId);
    // Ajoute ici ta logique pour modifier (ouvrir un modal par exemple)
  };

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
      />

      <TouchableOpacity
        style={[styles.filterButton, { alignSelf: 'flex-start', marginLeft: 16, marginTop: 10 }]}
        onPress={() => setIsModalVisible(true)}
      >
        <AppText style={styles.filterButtonText}>+ Ajouter une prestation</AppText>
      </TouchableOpacity>

      <ServicesList
        services={services}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
      />

      <Footer />

      <AddServiceModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onServiceAdded={handleServiceAdded}
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
