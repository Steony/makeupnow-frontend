import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showBookings, setShowBookings] = useState(true);
  const [showRecentActions, setShowRecentActions] = useState(false);

  // Modals
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // --- Menu Admin
  const adminAvatar = require('@/assets/images/avataradmin.png');
  const adminMenuItems = [
    'Mon dashboard',
    'Gérer les utilisateurs',
    'Logs utilisateur',
    'Paramètres',
    'Déconnexion',
  ];

  const handleMenuItemPress = (item: string) => {
    if (item === 'Déconnexion') return handleLogout();
    const routes: Record<string, string> = {
      'Mon dashboard': '/admin/home',
      'Gérer les utilisateurs': '/admin/user-management',
      'Logs utilisateur': '/admin/user-logs',
      'Paramètres': '/settings',
    };
    router.push((routes[item] ?? '/') as any);
  };

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
        } catch {
          setUsers([]); setLoadingUsers(false); return;
        }
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
    } catch {
      setUsers([]);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, [selectedFilter, selectedStatus, search]);

  // --- Auto-select first user when list changes
  useEffect(() => {
    if (users.length > 0) {
      setSelectedUserId(users[0].id);
    } else {
      setSelectedUserId(null);
    }
  }, [users]);

  useEffect(() => {
    setSelectedUser(users.find(u => u.id === selectedUserId) ?? null);
  }, [selectedUserId, users]);

  // --- Booking & Logs for selected user
  const loadBookings = async (userId: number) => {
    if (!userId) return setBookings([]);
    try {
      let res = await api.get(`/bookings/user/${userId}`);
      let data = res.data;
      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
          }
          data = JSON.parse(data);
        } catch {
          setBookings([]); return;
        }
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    }
  };

  const loadLogs = async (userId: number) => {
    if (!userId) return setLogs([]);
    try {
      let res = await api.get(`/logs/user/${userId}`);
      let data = res.data;
      if (typeof data === 'string') {
        try {
          if (data.startsWith('[') && data.includes('][')) {
            const parts = data.split('][');
            data = parts[0] + ']';
          }
          data = JSON.parse(data);
        } catch {
          setLogs([]); return;
        }
      }
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    }
  };

  // --- Charger bookings/logs à chaque sélection de user
  useEffect(() => {
    if (selectedUserId) {
      loadBookings(selectedUserId);
      loadLogs(selectedUserId);
    } else {
      setBookings([]);
      setLogs([]);
    }
  }, [selectedUserId]);

  // --- Status & Action Buttons
  const handleToggleStatus = async () => {
    // Ici, appelle ton endpoint de suspension/réactivation selon selectedUserId
    // await api.put(`/users/${selectedUserId}/toggle-active`);
    setSuspendModalVisible(false);
    await loadUsers();
  };

  const handleDeleteUser = async () => {
    // Ici, appelle ton endpoint de suppression
    // await api.delete(`/users/${selectedUserId}`);
    setDeleteModalVisible(false);
    await loadUsers();
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
        {/* Fiche utilisateur sélectionné */}
        
          {users.length === 0 && (
            <AppText style={{ color: '#a478dd', textAlign: 'center', marginTop: 24 }}>
              Aucun utilisateur trouvé
            </AppText>
          )}
          {/* Pour chaque utilisateur */}
        
          {users.map(user => (
            <View key={user.id}>


              {/* Fiche utilisateur */}
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
                : '#BD6E00'
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
        onPress={() => { setSelectedUserId(user.id); setSuspendModalVisible(true); }}
        style={styles.suspendButton}
      >
        <AppText style={styles.suspendButtonText}>
          {user.isActive ? 'Suspendre' : 'Réactiver'}
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { setSelectedUserId(user.id); setDeleteModalVisible(true); }}
        style={styles.deleteButton}
      >
        <AppText style={styles.deleteButtonText}>Supprimer le compte</AppText>
      </TouchableOpacity>
    </View>
  </View>
  <Separator />
</View>


              {/* Réservations et paiements */}
              <TouchableOpacity onPress={() => setShowBookings(!showBookings)} style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Réservations et paiements</AppText>
                <Image
                  source={showBookings ? require('@/assets/images/arrow-up.png') : require('@/assets/images/arrow-down.png')}
                  style={{ width: 35, height: 35 }}
                />
              </TouchableOpacity>
              {showBookings && bookings.map(b => (
                <BookingCard
                  key={b.id}
                  title={b.title ?? b.serviceTitle ?? b.service?.title ?? ''}
                  dateSchedule={b.dateSchedule ?? b.schedule?.startTime?.split('T')[0] ?? ''}
                  timeSchedule={b.timeSchedule ?? (b.schedule?.startTime ? b.schedule?.startTime.split('T')[1]?.substring(0, 5) : '')}
                  price={b.totalPrice ?? b.price ?? 0}
                  status={
                    b.status === 'CONFIRMED'
                      ? 'Confirmé'
                      : b.status === 'COMPLETED'
                        ? 'Terminé et payé'
                        : b.status === 'CANCELLED'
                          ? 'Annulé'
                          : b.status ?? ''
                  }
                  address={b.address ?? b.provider?.address ?? ''}
                  providerName={b.providerName ?? b.provider?.firstname + ' ' + b.provider?.lastname}
                  providerEmail={b.providerEmail ?? b.provider?.email}
                  providerPhone={b.providerPhone ?? b.provider?.phoneNumber}
                  clientName={b.clientName ?? b.customer?.firstname + ' ' + b.customer?.lastname}
                  clientEmail={b.clientEmail ?? b.customer?.email}
                  clientPhone={b.clientPhone ?? b.customer?.phoneNumber}
                  rating={b.review?.rating}
                  review={b.review?.comment}
                  reviewDate={b.review?.dateComment}
                  role="Admin"
                  // onPressModifyPayment={() => ...}
                />
              ))}
              <Separator />

              {/* Actions récentes / logs */}
              <TouchableOpacity onPress={() => setShowRecentActions(!showRecentActions)} style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Actions récentes</AppText>
                <Image
                  source={showRecentActions ? require('@/assets/images/arrow-up.png') : require('@/assets/images/arrow-down.png')}
                  style={{ width: 35, height: 35 }}
                />
              </TouchableOpacity>
              {showRecentActions && (
                <View style={styles.logContainer}>
                  {logs.length === 0 ? (
                    <AppText style={{ color: '#a478dd' }}>Aucune action récente</AppText>
                  ) : (
                    logs.map((log: any, idx: number) => (
                      <View key={log.id ?? idx} style={styles.logItem}>
                        <AppText style={styles.logAction}>{log.action ?? log.message}</AppText>
                        <AppText style={styles.logDate}>{log.date ?? log.createdAt}</AppText>
                      </View>
                    ))
                  )}
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/admin/user-logs')}
                  >
                    <AppText style={styles.viewAllText}>Voir tout</AppText>
                  </TouchableOpacity>
                </View>
              )}
               <View style={{ height: 4, backgroundColor: '#7C7C7C', marginHorizontal: 3, marginVertical: 5 }} />
            </View>
          ))}

          {/* Modals suspend/delete */}
          <Modal transparent visible={suspendModalVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setSuspendModalVisible(false)}>
              <View style={styles.overlay}>
                <View style={[styles.dropdownContainer, { width: 250, alignItems: 'center', padding: 20 }]}>
                  <AppText style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {selectedUser?.isActive ? 'Suspendre ce compte ?' : 'Réactiver ce compte ?'}
                  </AppText>
                  <View style={{ flexDirection: 'row', marginTop: 18 }}>
                    <TouchableOpacity onPress={handleToggleStatus} style={styles.suspendButton}>
                      <AppText style={styles.suspendButtonText}>Confirmer</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSuspendModalVisible(false)} style={styles.deleteButton}>
                      <AppText style={styles.deleteButtonText}>Annuler</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          <Modal transparent visible={deleteModalVisible} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
              <View style={styles.overlay}>
                <View style={[styles.dropdownContainer, { width: 250, alignItems: 'center', padding: 20 }]}>
                  <AppText style={{ fontWeight: 'bold', fontSize: 16 }}>
                    Supprimer définitivement ce compte ?
                  </AppText>
                  <View style={{ flexDirection: 'row', marginTop: 18 }}>
                    <TouchableOpacity onPress={handleDeleteUser} style={styles.suspendButton}>
                      <AppText style={styles.suspendButtonText}>Supprimer</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.deleteButton}>
                      <AppText style={styles.deleteButtonText}>Annuler</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
       <Footer/>
      </View>
     
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
  paddingBottom: 32,  
  paddingHorizontal: 0, 
},
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
  userCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, padding: 12, borderRadius: 12, elevation: 3 },
  userAvatar: { width: 56, height: 56, borderRadius: 30, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#381b34' },
  userEmail: { color: '#5d4370', marginTop: 3, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', marginVertical: 9 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4, marginRight: 5 },
  badgeText: { color: '#fff', fontSize: 13, },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  suspendButton: { backgroundColor: '#fff',borderWidth: 1, borderColor: '#000',  borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10, marginRight: 10 },
  suspendButtonText: { color: '#381b34', fontSize: 13 },
  deleteButton: { backgroundColor: '#000', borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10, marginLeft: 27, },
  deleteButtonText: { color: '#fff', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#381b34', },
  logContainer: {
    backgroundColor: '#f5edf9',
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 25,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logItem: { marginBottom: 10 },
  logAction: { fontWeight: 'bold', color: '#381b34', marginBottom: 4 },
  logDate: { color: '#555' },
  viewAllButton: { alignSelf: 'flex-end' },
  viewAllText: { color: '#6229c6', fontWeight: 'bold' },
});

