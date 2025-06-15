import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api'; // ✅ Ajouté pour faire la requête
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [userFirstname, setUserFirstname] = useState('Client'); // ✅ Début par défaut

  const router = useRouter();

  // ✅ Récupère le prénom comme dans CustomerHomeScreen
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/me');
        const { firstname } = response.data;
        setUserFirstname(firstname ?? 'Client');
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    };

    fetchUserProfile();
  }, []);

  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

  const handleMenuItemPress = (item: string) => {
    console.log('Menu Item sélectionné :', item);
    switch (item) {
      case 'Accueil':
        router.push('/customer/home');
        break;
      case 'Mes réservations':
        router.push('/customer/booking-list');
        break;
      case 'Mon profil':
        router.push('/customer/profile');
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
        title={`Bienvenue ${userFirstname},`} // ✅ Affiche bien le prénom
        subtitle="Mon profil"
        showMenu={true}
        showSearch={false}
        avatarUri={require('@/assets/images/avatarclient.png')}
        menuItems={customerMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />
 <View style={{ flex: 1, justifyContent: 'space-between' }}>
      {/* Corps du profil */}
      <View style={styles.profileContainer}>
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonBlock}>
            <TouchableOpacity onPress={() => router.push('/customer/booking-list')}>
              <Image
                source={require('@/assets/images/bookingcustomer.png')}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <AppText style={styles.buttonLabel}>Réservations</AppText>
          </View>

          <View style={styles.buttonBlock}>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Image
                source={require('@/assets/images/setting.png')}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <AppText style={styles.buttonLabel}>Paramètres</AppText>
          </View>
        </View>
         
      </View>
      <Footer />
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
    fontFamily: 'Inter_400Regular',
  },
  buttonsContainer: {
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
    fontFamily: 'Inter_400Regular',
  },
  buttonIcon: {
    width: 150,
    height: 150,
    borderRadius: 15,
  },
  buttonLabel: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
});
