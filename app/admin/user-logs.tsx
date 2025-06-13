import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function UserLogsScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [selectedStatus, setSelectedStatus] = useState('Actif');
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [dateDropdownVisible, setDateDropdownVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  // Nouveaux states pour les vraies données :
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const adminAvatar = require('@/assets/images/avataradmin.png');
  const adminMenuItems = [
    'Mon dashboard',
    'Gérer les utilisateurs',
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

  // Fetch user + logs avec robustesse
  useEffect(() => {
    if (!userId) {
      console.log('Pas de userId trouvé dans les params !');
      return;
    }
    setLoading(true);

    // Fetch logs de ce user
    const fetchLogs = async () => {
      try {
        // On récupère la réponse brute en texte, pas en JSON direct !
        const res = await api.get(`/user-action-logs/user/${userId}`, { responseType: 'text' });
        let raw = res.data;

        // PATCH : Extraire le 1er tableau JSON rencontré
        let logsArr = [];
        const matches = String(raw).match(/\[[\s\S]*?\]/g);
        if (matches && matches.length > 0) {
          logsArr = JSON.parse(matches[0]);
        } else {
          // Fallback classique (au cas où c’est un JSON normal)
          try {
            logsArr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            logsArr = [];
          }
        }
        setLogs(Array.isArray(logsArr) ? logsArr : []);
      } catch (err) {
        console.error('Erreur lors de la récupération des logs', err);
        setLogs([]);
      }
    };

    // Fetch user
    const fetchUser = async () => {
      try {
        // Force la réponse en texte, pas en JSON
        const res = await api.get('/admin/users', { responseType: 'text' });
        let raw = res.data;

        // PATCH : On prend juste le premier tableau JSON trouvé
        let usersArr = [];
        const matches = String(raw).match(/\[[\s\S]*?\]/g);
        if (matches && matches.length > 0) {
          usersArr = JSON.parse(matches[0]);
        } else {
          try {
            usersArr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch  {
            usersArr = [];
          }
        }

        // Typescript : usersArr est "any[]" donc pas d'erreur dans le find
        const found = usersArr.find((u: any) => String(u.id) === String(userId));
        setUser(found || null);
      } catch (err) {
        console.error('Erreur lors de la récupération du user', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchLogs();
  }, [userId]);

  // Filtrage côté front au cas où tu reçois tous les logs
  const filteredLogs = logs.filter((log: any) => {
    if (!user) return false;
    // Match fullname (exemple), tu peux adapter sur l’id ou email selon backend
    return log.user === `${user.firstname} ${user.lastname}`;
  });

  // Tri les logs (desc par défaut)
  const sortedLogs = [...filteredLogs].sort((a: any, b: any) => {
    const dateA = new Date(a.timestamp || a.date).getTime();
    const dateB = new Date(b.timestamp || b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Util pour afficher la date FR
  function formatDateTime(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) +
      ' à ' +
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <HeaderGradient
          
          subtitle="Consultez les logs utilisateur"
          avatarUri={adminAvatar}
          showMenu={true}
          showSearch={true}
          showLocationSearch={false}
          searchQuery={search}
          onChangeSearch={setSearch}
          menuItems={adminMenuItems}
          onMenuItemPress={handleMenuItemPress}
          showCategoryButton={false}
        />

        {/* Menu déroulant "Etat" */}
        <Modal
          transparent
          visible={statusDropdownVisible}
          animationType="fade"
          onRequestClose={() => setStatusDropdownVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setStatusDropdownVisible(false)}>
            <View style={styles.overlay}>
              <View style={styles.dropdownContainer}>
                {['Actif', 'Suspendu'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedStatus(status);
                      setStatusDropdownVisible(false);
                    }}
                  >
                    <AppText style={styles.dropdownItemText}>{status}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <ScrollView style={styles.logsList}>

          {/* Utilisateur sélectionné */}
          <View style={styles.userCard}>
            <Image
              source={
                user?.role === 'ADMIN'
                  ? require('@/assets/images/avataradmin.png')
                  : user?.role === 'PROVIDER'
                  ? require('@/assets/images/avatarprovider.png')
                  : require('@/assets/images/avatarclient.png')
              }
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <AppText style={styles.userName}>
                {user ? `${user.firstname} ${user.lastname}` : ''}
              </AppText>
              {/* BADGES ACTIF/SUSPENDU + ROLE */}
              <View style={{ flexDirection: 'row', gap: 6, marginVertical: 3 }}>
                {/* Badge actif/suspendu */}
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: user?.isActive ? '#008505' : '#9B0404' }
                ]}>
                  <AppText style={styles.badgeText}>
                    {user?.isActive ? 'Actif' : 'Suspendu'}
                  </AppText>
                </View>
                {/* Badge rôle */}
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      user?.role === 'ADMIN'
                        ? '#0313A2'
                        : user?.role === 'PROVIDER'
                        ? '#8602BF'
                        : '#FF68CD'
                  }
                ]}>
                  <AppText style={styles.badgeText}>
                    {user?.role === 'ADMIN'
                      ? 'Admin'
                      : user?.role === 'PROVIDER'
                        ? 'Prestataire'
                        : 'Client'}
                  </AppText>
                </View>
              </View>
              <AppText style={styles.userEmail}>{user?.email ?? ''}</AppText>
            </View>
          </View>

          {/* Barre de tri */}
          <View style={styles.sortRow}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setDateDropdownVisible(true)}
            >
              <AppText style={styles.sortButtonText}>Date ▾</AppText>
            </TouchableOpacity>
            <AppText style={styles.tableHeader}>Action</AppText>
            <AppText style={styles.tableHeader}>Description</AppText>
          </View>

          {/* Menu déroulant "Date" */}
          <Modal
            transparent
            visible={dateDropdownVisible}
            animationType="fade"
            onRequestClose={() => setDateDropdownVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setDateDropdownVisible(false)}>
              <View style={styles.overlay}>
                <View style={styles.dropdownContainer}>
                  {['Croissant', 'Décroissant'].map((order) => (
                    <TouchableOpacity
                      key={order}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSortOrder(order === 'Croissant' ? 'asc' : 'desc');
                        setDateDropdownVisible(false);
                      }}
                    >
                      <AppText style={styles.dropdownItemText}>{order}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Liste des logs triée */}
          {loading ? (
            <AppText style={{ textAlign: 'center', marginVertical: 20 }}>Chargement...</AppText>
          ) : sortedLogs.length === 0 ? (
            <AppText style={{ color: '#a478dd', marginLeft: 25, marginBottom: 10 }}>
              Aucun log pour cet utilisateur
            </AppText>
          ) : (
            sortedLogs.map((log: any, idx: number) => (
              <View key={idx} style={styles.logRow}>
                <AppText style={styles.logDate}>{formatDateTime(log.timestamp || log.date)}</AppText>
                <AppText style={styles.logAction}>{log.action}</AppText>
                <AppText style={styles.logDesc}>{log.details || log.description}</AppText>
              </View>
            ))
          )}
        </ScrollView>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffff' },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  filterLabel: { fontSize: 16, marginLeft: 5, marginRight: 8, fontWeight: 'bold' },
  filterButton: {
    borderWidth: 1,
    borderColor: '#a478dd',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },
  filterButtonText: { color: '#a478dd', fontSize: 14 },
  activeFilterButton: { backgroundColor: '#a478dd' },
  activeFilterButtonText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, width: 130, elevation: 5 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownItemText: { fontSize: 15, color: '#381b34', textAlign: 'center' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginTop: 5,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  userAvatar: { width: 56, height: 56, borderRadius: 30, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#381b34' },
  userEmail: { color: '#5d4370', marginTop: 3, marginBottom: 2 },
  // Ajout badge status/rôle
  statusBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4, marginRight: 5 },
  badgeText: { color: '#fff', fontSize: 13 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#efe7f7', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2, marginVertical: 2 },
  roleText: { fontWeight: 'bold', fontSize: 12 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#c5b1e2',
    backgroundColor: '#f9f4ff',
    gap: 10,
  },
  sortButton: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 7, borderWidth: 1, borderColor: '#a478dd', backgroundColor: '#fff', marginRight: 10 },
  sortButtonText: { fontWeight: 'bold', color: '#a478dd' },
  tableHeader: { fontWeight: 'bold', flex: 1, fontSize: 15, color: '#381b34' },
  logsList: { paddingHorizontal: 8 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  logDate: { width: 90, color: '#7d6e8a', fontSize: 13 },
  logAction: { flex: 1, fontWeight: 'bold', fontSize: 13, color: '#1d1445' },
  logDesc: { flex: 2, color: '#544a5f', fontSize: 13 },
});
