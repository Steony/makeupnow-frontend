import AppText from '@/components/ui/AppText';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { handleLogout } from '@/utils/authService'; // ✅ Ajoute l’import pour handleLogout
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const userFirstname = 'Ralphy';
  const router = useRouter();

  // ✅ Menu items pour le client
  const customerMenuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

  // ✅ Navigation en fonction de l'item du menu
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
        handleLogout(); // ✅ Déconnexion avec handleLogout
        break;
      default:
        console.log('Aucune action définie');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderGradient
        title={`Bienvenue ${userFirstname},`}
        subtitle="Mon profil"
        showMenu={true}
        showSearch={false}
        avatarUri={require('@/assets/images/avatarclient.png')}
        menuItems={customerMenuItems} // ✅ Passe le menu à HeaderGradient
        onMenuItemPress={handleMenuItemPress} // ✅ Passe la logique de navigation et de logout
      />

      {/* Corps du profil */}
      <View style={styles.profileContainer}>
        {/* Boutons avec icônes et titres */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5edf9' },
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
    borderRadius: 15,
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
