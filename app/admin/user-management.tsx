import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

// --------- AJOUT FONCTION UTILE ---------
function getDateSchedule(booking:any) {
  // Cas 1 : Backend renvoie déjà date au format JJ/MM/AA ou JJ/MM/AAAA
  if (booking.dateSchedule && booking.dateSchedule.includes('/')) return booking.dateSchedule;
  // Cas 2 : Format ISO ou string YYYY-MM-DD
  const rawDate =
    booking.schedule?.startTime ??
    booking.startTime ??
    booking.dateSchedule ??
    booking.schedule?.date ??
    null;

  if (!rawDate) return 'Date non renseignée';

  if (rawDate.includes('T')) {
    // Format complet
    const [date] = rawDate.split('T');
    const [year, month, day] = date.split('-');
    if (!year || !month || !day) return date;
    return `${day}/${month}/${year.slice(2, 4)}`;
  } else if (rawDate.includes('-')) {
    // Format juste date
    const [year, month, day] = rawDate.split('-');
    if (!year || !month || !day) return rawDate;
    return `${day}/${month}/${year.slice(2, 4)}`;
  }
  return rawDate;
}

function getTimeSchedule(booking: any) {
  // Cas 1 : Champ dédié timeSchedule
  if (booking.timeSchedule) return booking.timeSchedule.slice(0, 5);
  // Cas 2 : Format ISO
  const rawDate =
    booking.schedule?.startTime ??
    booking.startTime ??
    booking.schedule?.date ??
    null;
  if (!rawDate) return '';
  if (rawDate.includes('T')) {
    const parts = rawDate.split('T');
    if (parts.length < 2) return '';
    return parts[1].slice(0, 5); // HH:MM
  }
  return '';
}






export default function UserManagementScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // --- States
  const [selectedFilter, setSelectedFilter] = useState<'Tous' | 'Clients' | 'Prestataires' | 'Admins'>('Tous');
  const [selectedStatus, setSelectedStatus] = useState<'Actif' | 'Suspendu'>('Actif');
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showRecentActions, setShowRecentActions] = useState(false);

  // Bookings
  const [userBookings, setUserBookings] = useState<{ [userId: number]: any[] }>({});
  const [openBookings, setOpenBookings] = useState<{ [userId: number]: boolean }>({});

  // Modal global de confirmation
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);

  // --- Menu Admin
  const adminAvatar = require('@/assets/images/avataradmin.png');
  const adminMenuItems = [
    'Mon dashboard',
    'Gérer les utilisateurs',
    'Paramètres',
    'Déconnexion',
  ];

  const handleMenuItemPress = (item: string) => {
    if (item === 'Déconnexion') return handleLogout();
    const routes: Record<string, string> = {
      'Mon dashboard': '/admin/home',
      'Gérer les utilisateurs': '/admin/user-management',
      'Paramètres': '/settings',
    };
    router.push((routes[item] ?? '/') as any);
  };

  // --- Load bookings for a specific user only on demand
  const loadBookings = async (userId: number, userRole?: string) => {
    if (!userId || !userRole) return;
    let url = '';
    if (userRole === 'CLIENT') url = `/bookings/customer/${userId}`;
    else if (userRole === 'PROVIDER') url = `/bookings/provider/${userId}`;
    else { setUserBookings(prev => ({ ...prev, [userId]: [] })); return; }

    try {
      let res = await api.get(url);
      let data = res.data;
      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
          }
          data = JSON.parse(data);
        } catch { setUserBookings(prev => ({ ...prev, [userId]: [] })); return; }
      }
      setUserBookings(prev => ({ ...prev, [userId]: Array.isArray(data) ? data : [] }));
    } catch { setUserBookings(prev => ({ ...prev, [userId]: [] })); }
  };

  function formatDateTime(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' à ' +
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // --- Loading Users List with Filter/Status/Search
  const loadUsers = async () => {
    setLoadingUsers(true);
    let url = '/admin/users';
    try {
      let res = await api.get(url);
      let data = res.data;
      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
          }
          data = JSON.parse(data);
        } catch { setUsers([]); setLoadingUsers(false); return; }
      }
      let filtered = Array.isArray(data) ? data : [];
      if (selectedFilter === 'Clients') filtered = filtered.filter(u => u.role === "CLIENT");
      if (selectedFilter === 'Prestataires') filtered = filtered.filter(u => u.role === "PROVIDER");
      if (selectedFilter === 'Admins') filtered = filtered.filter(u => u.role === "ADMIN");
      if (selectedStatus) {
        filtered = filtered.filter(u => (selectedStatus === 'Actif' ? u.isActive : !u.isActive));
      }
      if (search) {
        filtered = filtered.filter(u =>
          u.firstname?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastname?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setUsers(filtered);
    } catch { setUsers([]); }
    setLoadingUsers(false);
  };

  useEffect(() => { loadUsers(); }, [selectedFilter, selectedStatus, search]);

  // --- Auto-select first user when list changes
  useEffect(() => {
    if (users.length > 0) setSelectedUserId(users[0].id);
    else setSelectedUserId(null);
  }, [users]);

  useEffect(() => {
    setSelectedUser(users.find(u => u.id === selectedUserId) ?? null);
  }, [selectedUserId, users]);

  // --- LOGS
  const loadLogs = async (userId: number) => {
    if (!userId) return setLogs([]);
    try {
      let res = await api.get(`/user-action-logs/user/${userId}`)
      let data = res.data;
      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
          }
          data = JSON.parse(data);
        } catch { setLogs([]); return; }
      }
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); }
  };

  useEffect(() => {
    if (selectedUserId) loadLogs(selectedUserId);
    else setLogs([]);
  }, [selectedUserId]);

  // --- Global Action (suspend/delete) avec confirmation & toast
  const handleGlobalAction = async () => {
    setConfirmModalVisible(false);
    if (!selectedUser || !confirmAction) return;
    const adminId = currentUser?.id;
    const userId = selectedUser.id;
    try {
      if (confirmAction === 'suspend') {
        if (selectedUser.isActive) {
          await api.put(`/admin/users/${adminId}/deactivate/${userId}`);
          Toast.show({ type: 'success', text1: 'Utilisateur suspendu !' });
        } else {
          await api.put(`/admin/users/${adminId}/reactivate/${userId}`);
          Toast.show({ type: 'success', text1: 'Utilisateur réactivé !' });
        }
      }
      if (confirmAction === 'delete') {
        await api.delete(`/admin/users/${adminId}/delete/${userId}`);
        Toast.show({ type: 'success', text1: 'Compte supprimé définitivement !' });
      }
      await loadUsers();
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Action impossible. Vérifiez votre connexion ou les droits d'admin." });
    }
  };

  // --- UI
  const Separator = () => (
    <View style={{ height: 1, backgroundColor: '#ccc', marginHorizontal: 16 }} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <HeaderGradient
          title="Gérer les utilisateurs"
          avatarUri={adminAvatar}
          showMenu
          showSearch
          searchQuery={search}
          onChangeSearch={setSearch}
          menuItems={adminMenuItems}
          onMenuItemPress={handleMenuItemPress}
          showCategoryButton={false}
          showLocationSearch={false}
        />

        {/* Filtres */}
        <View style={styles.filterContainer}>
          <AppText style={styles.filterLabel}>Filtre:</AppText>
          {['Tous', 'Clients', 'Prestataires', 'Admins'].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterButton,
                selectedFilter === option && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(option as any)}
            >
              <AppText
                style={[
                  styles.filterButtonText,
                  selectedFilter === option && styles.activeFilterButtonText
                ]}
              >
                {option}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 10 }}>
          <TouchableOpacity
            style={[styles.filterButton, { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }]}
            onPress={() => setStatusDropdownVisible(true)}
          >
            <AppText style={styles.filterButtonText}>État</AppText>
            <Image
              source={require('@/assets/images/arrow-down.png')}
              style={{ width: 25, height: 25, marginLeft: 9 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Separator />

        {/* Dropdown État */}
        <Modal transparent visible={statusDropdownVisible} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setStatusDropdownVisible(false)}>
            <View style={styles.overlay}>
              <View style={styles.dropdownContainer}>
                {['Actif', 'Suspendu'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedStatus(st as any); setStatusDropdownVisible(false); }}
                  >
                    <AppText style={styles.dropdownItemText}>{st}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Separator />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {users.length === 0 && (
            <AppText style={{ color: '#a478dd', textAlign: 'center', marginTop: 24 }}>
              Aucun utilisateur trouvé
            </AppText>
          )}
          {users.map(user => (
            <View key={user.id}>
              <View style={styles.userCard}>
                <Image
                  source={
                    user.role === 'ADMIN'
                      ? require('@/assets/images/avataradmin.png')
                      : user.role === 'PROVIDER'
                        ? require('@/assets/images/avatarprovider.png')
                        : require('@/assets/images/avatarclient.png')
                  }
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <AppText style={styles.userName}>
                    {user.firstname} {user.lastname}
                  </AppText>
                  <View style={styles.badgeRow}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: user.isActive ? '#008505' : '#9B0404' }
                    ]}>
                      <AppText style={styles.badgeText}>
                        {user.isActive ? 'Actif' : 'Suspendu'}
                      </AppText>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          user.role === 'ADMIN'
                            ? '#0313A2'
                            : user.role === 'PROVIDER'
                              ? '#8602BF'
                              : '#FF68CD'
                      }
                    ]}>
                      <AppText style={styles.badgeText}>
                        {user.role === 'ADMIN'
                          ? 'Admin'
                          : user.role === 'PROVIDER'
                            ? 'Prestataire'
                            : 'Client'}
                      </AppText>
                    </View>
                  </View>
                  <AppText style={styles.userEmail}>{user.email}</AppText>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedUserId(user.id);
                        setSelectedUser(user);
                        setConfirmAction('suspend');
                        setConfirmModalVisible(true);
                      }}
                      style={styles.suspendButton}
                    >
                      <AppText style={styles.suspendButtonText}>
                        {user.isActive ? 'Suspendre' : 'Réactiver'}
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedUserId(user.id);
                        setSelectedUser(user);
                        setConfirmAction('delete');
                        setConfirmModalVisible(true);
                      }}
                      style={styles.deleteButton}
                    >
                      <AppText style={styles.deleteButtonText}>Supprimer le compte</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
                <Separator />
              </View>

              {/* Réservations et paiements */}
              <TouchableOpacity
                onPress={() => {
                  setOpenBookings(prev => ({
                    ...prev,
                    [user.id]: !prev[user.id]
                  }));
                  if (!userBookings[user.id]) loadBookings(user.id, user.role);
                }}
                style={styles.sectionHeader}
              >
                <AppText style={styles.sectionTitle}>Réservations et paiements</AppText>
                <Image
                  source={
                    openBookings[user.id]
                      ? require('@/assets/images/arrow-up.png')
                      : require('@/assets/images/arrow-down.png')
                  }
                  style={{ width: 35, height: 35 }}
                />
              </TouchableOpacity>

              {openBookings[user.id] && (
                userBookings[user.id]?.length > 0 ? (
                  <View>
                    {(() => {
                      const lastBooking = userBookings[user.id][userBookings[user.id].length - 1];
                      return (
                        <View style={{
                          backgroundColor: '#f5edf9',
                          borderRadius: 12,
                          padding: 15,
                          marginHorizontal: 16,
                          marginTop: 8,
                          marginBottom: 0,
                          shadowColor: '#000',
                          shadowOpacity: 0.3,
                          shadowOffset: { width: 0, height: 1 },
                          shadowRadius: 4,
                          elevation: 1,
                        }}>
                          <AppText style={{ fontWeight: 'bold', fontSize: 18, color: '#381b34' }}>
                            {lastBooking.serviceTitle || lastBooking.title || lastBooking.service?.title || 'Prestation'}
                          </AppText>

                          
                           <AppText style={{ fontSize: 15, color: '#000', marginTop: 10, }}>
  {`Le ${getDateSchedule(lastBooking)}${getTimeSchedule(lastBooking) ? ' à ' + getTimeSchedule(lastBooking) : ''}`}
</AppText>

                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                            <AppText style={{ fontSize: 15, color: '#444' }}>

                            
                            </AppText>
                            <AppText style={{ color: lastBooking.status === 'CANCELLED' ? '#C42A5A' : '#7C55B1', fontWeight: 'bold', marginTop: -10, fontSize: 17, }}>
                              {lastBooking.status === 'CONFIRMED'
                                ? 'Confirmé'
                                : lastBooking.status === 'COMPLETED'
                                  ? 'Terminé et payé'
                                  : lastBooking.status === 'CANCELLED'
                                    ? 'Annulé'
                                    : lastBooking.status ?? ''}
                            </AppText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                            <AppText style={{ fontWeight: 'bold', fontSize: 17, color: '#1A092B', marginBottom: 2, }}>
                              {(lastBooking.totalPrice ?? lastBooking.price ?? 0) + '€'}
                            </AppText>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                            <Image source={require('@/assets/images/clock.png')} style={{ width: 28, height: 28, marginRight: 7 }} />
                            <AppText style={{ color: '#000', fontWeight: '600', fontSize: 15 }}>
                              {(() => {
                                const d =
                                  (typeof lastBooking.serviceDuration === 'string'
                                    ? parseInt(lastBooking.serviceDuration, 10)
                                    : lastBooking.serviceDuration) ||
                                  lastBooking.schedule?.duration ||
                                  lastBooking.duration ||
                                  0;
                                if (d >= 60) return `${Math.floor(d / 60)}h${d % 60 ? d % 60 : ''}`;
                                return `${d}min`;
                              })()}
                            </AppText>
                            <Image source={require('@/assets/images/location.png')} style={{ width: 28, height: 28, marginLeft: 16, marginRight: 6 }} />
                            <AppText style={{ color: '#000', fontSize: 15 }}>
                              {lastBooking.provider?.address ||
                                lastBooking.providerAddress ||
                                ''}
                            </AppText>
                          </View>
                          
                          <TouchableOpacity
  style={[styles.viewAllButton, { marginTop: 18, alignSelf: 'flex-end' }]}
  onPress={() => {
    
    if (user.role === 'CLIENT') router.push(`/admin/user-bookings?userId=${user.id}`);
    else if (user.role === 'PROVIDER') router.push(`/admin/user-bookings?providerId=${user.id}`);
  
  }}
>
  <AppText style={styles.viewAllText}>
    Voir toutes les réservations
  </AppText>
</TouchableOpacity>

                        </View>
                      );
                    })()}
                    <TouchableOpacity
                      style={[styles.viewAllButton, { marginTop: 10, marginLeft: 16 }]}
                      onPress={() => router.push(`/admin/user-bookings`)}
                    >
                    </TouchableOpacity>
                  </View>
                ) : (
                  <AppText style={{ color: '#a478dd', marginLeft: 25, marginBottom: 10 }}>
                    Aucune réservation
                  </AppText>
                )
              )}
              <Separator />

              {/* Actions récentes / logs */}
              <TouchableOpacity
                onPress={() => setShowRecentActions(!showRecentActions)}
                style={styles.sectionHeader}
              >
                <AppText style={styles.sectionTitle}>Actions récentes</AppText>
                <Image
                  source={
                    showRecentActions
                      ? require('@/assets/images/arrow-up.png')
                      : require('@/assets/images/arrow-down.png')
                  }
                  style={{ width: 35, height: 35 }}
                />
              </TouchableOpacity>

              {showRecentActions && (
                <View style={[styles.logContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  {logs.length === 0 ? (
                    <AppText style={{ color: '#a478dd' }}>Aucune action récente</AppText>
                  ) : (
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.logAction, { fontWeight: 'bold', fontSize: 18 }]}>
                        {logs[0]?.id ? `#${logs[0].id} — ` : ''}
                        {logs[0]?.action ?? logs[0]?.message}
                      </AppText>
                      <AppText style={styles.logDate}>
                        {logs[0]?.timestamp
                          ? formatDateTime(logs[0].timestamp)
                          : logs[0]?.date ?? logs[0]?.createdAt}
                      </AppText>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push(`/admin/user-logs?userId=${user.id}`)}
                  >
                    <AppText style={styles.viewAllText}>Voir tout</AppText>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 4, backgroundColor: '#7C7C7C', marginHorizontal: 3, marginVertical: 5 }} />
            </View>
          ))}

          {/* Modal universelle de confirmation */}
          <Modal transparent visible={confirmModalVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
              <View style={styles.overlay}>
                <View style={[styles.dropdownContainer, { width: 250, alignItems: 'center', padding: 20 }]}>
                  <AppText style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
                    {confirmAction === 'suspend'
                      ? (selectedUser?.isActive ? 'Suspendre ce compte ?' : 'Réactiver ce compte ?')
                      : 'Supprimer définitivement ce compte ?'}
                  </AppText>
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity onPress={handleGlobalAction} style={styles.suspendButton}>
                      <AppText style={styles.suspendButtonText}>Confirmer</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.deleteButton}>
                      <AppText style={styles.deleteButtonText}>Annuler</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
        <Footer />
       
        <Toast />
      </View>
    </SafeAreaView>
  );
}

// Styles (identique à avant)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',  },
  scrollContainer: { paddingBottom: 16 },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginTop: 15, marginBottom: 10 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  filterButton: { borderWidth: 1, borderColor: '#a478dd', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginHorizontal: 2, backgroundColor: '#fff' },
  filterButtonText: { color: '#a478dd', fontSize: 14 },
  activeFilterButton: { backgroundColor: '#a478dd' },
  activeFilterButtonText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { backgroundColor: '#fff', borderRadius: 8, width: 130, elevation: 5 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownItemText: { fontSize: 15, color: '#381b34', textAlign: 'center' },
  userCard: { flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, },
  userAvatar: { width: 56, height: 56, borderRadius: 30, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#381b34' },
  userEmail: { color: '#5d4370', marginTop: 3, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', marginVertical: 9 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4, marginRight: 5 },
  badgeText: { color: '#fff', fontSize: 13 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  suspendButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#000', borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10, marginRight: 10, 
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1, },
  suspendButtonText: { color: '#381b34', fontSize: 13 },
  deleteButton: { backgroundColor: '#000', borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10, marginLeft: 20,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
   },
  deleteButtonText: { color: '#fff', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#381b34', },
  logContainer: {
    backgroundColor: '#f5edf9',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  logItem: { marginBottom: 10,  },
  logAction: { fontWeight: 'bold', color: '#381b34', marginBottom: 4, shadowColor: '#000',
     },
  logDate: { color: '#555' },
  viewAllButton: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 7, marginTop: 4, },
  viewAllText: { fontSize: 16, color: '#6229c6', fontWeight: 'bold' },



});
