import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeAdminScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const adminAvatar = require('@/assets/images/avataradmin.png');

  const adminMenuItems = [
    'Mon dashboard',
    'Gérer les utilisateurs',
    'Logs utilisateur',
    'Paramètres',
    'Déconnexion',
  ];

  const handleMenuItemPress = (item: string) => {
    switch (item) {
      case 'Mon dashboard':
        router.push('/admin/home');
        break;
      case 'Gérer les utilisateurs':
        router.push('/admin/user-management');
        break;
      case 'Logs utilisateur':
        router.push('/admin/user-logs');
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
        title={`Bienvenue, ${currentUser?.name || 'Admin'} !`}
        subtitle="Administrez vos utilisateurs "
        avatarUri={adminAvatar}
        showMenu={true}
        showSearch={false}
        menuItems={adminMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.profileContainer}>
          <View style={styles.rowButtonsContainer}>
            <View style={styles.buttonBlock}>
              <TouchableOpacity onPress={() => router.push('/admin/user-management')}>
                <Image
                  source={require('@/assets/images/manage-users.png')}
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
              <AppText style={styles.buttonLabel}>Gérer les utilisateurs</AppText>
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

          <View style={[styles.buttonBlock, styles.centeredButton]}>
            <TouchableOpacity onPress={() => router.push('/admin/user-logs')}>
              <Image
                source={require('@/assets/images/logs.png')}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
            <AppText style={styles.buttonLabel}>Logs utilisateurs</AppText>
          </View>
        </View>
        <Footer />
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
  buttonIcon: { width: 140, height: 140, borderRadius: 15, alignItems:'center' },
  buttonLabel: { marginTop: 10, fontSize: 15, fontWeight: 'bold', color: '#000' },
});
