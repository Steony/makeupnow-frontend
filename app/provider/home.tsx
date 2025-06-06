import AppText from '@/components/ui/AppText';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';


import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeProviderScreen() {
  const [userFirstname, setUserFirstname] = useState('Provider');
  
  const router = useRouter();

  // ✅ Avatar statique pour le Provider
  const providerAvatar = require('@/assets/images/avatarprovider.png');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/me');
        const { firstname } = response.data;
        setUserFirstname(firstname ?? 'Provider');
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    };

    fetchUserProfile();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <HeaderGradient
        title={`Bienvenue, ${userFirstname} !`}
        subtitle="Votre art, votre planning, votre succès !"
        avatarUri={providerAvatar} // ✅ Avatar fixe pour Provider
        showMenu={true}
        showSearch={false}
        menuItems={providerMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />

      <View style={styles.profileContainer}>
        <View style={styles.rowButtonsContainer}>
          <View style={styles.buttonBlock}>
            <TouchableOpacity onPress={() => router.push('/provider/planning')}>
              <Image
                source={require('@/assets/images/bookingcustomer.png')}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <AppText style={[styles.buttonLabel, { fontFamily: 'app-test' }]}>Mon planning</AppText>
          </View>

          <View style={styles.buttonBlock}>
            <TouchableOpacity onPress={() => router.push('/provider/services')}>
              <Image
                source={require('@/assets/images/brush.png')}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <AppText style={[styles.buttonLabel, { fontFamily: 'app-test' }]}>Mes prestations</AppText>
          </View>
        </View>

        <View style={[styles.buttonBlock, styles.centeredButton]}>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Image
              source={require('@/assets/images/setting.png')}
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
          <AppText style={[styles.buttonLabel, { fontFamily: 'app-test' }]}>Paramètres</AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5edf9' },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  rowButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '95%',
    marginTop: 20,
  },
  buttonBlock: {
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonIcon: { width: 150, height: 150, borderRadius: 15 },
  buttonLabel: { marginTop: 10, fontSize: 17, fontWeight: 'bold', color: '#000' },
});
