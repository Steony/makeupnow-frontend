import { useRouter } from 'expo-router';
import React, { useState, } from 'react';
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

import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';

export default function UserManagementScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<'Tous' | 'Clients' | 'Prestataires'>('Tous');
  const [selectedStatus, setSelectedStatus] = useState<'Actif' | 'Suspendu'>('Actif');
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [showBookings, setShowBookings] = useState(true);
  const [showRecentActions, setShowRecentActions] = useState(false);

  const selectedUser = {
    avatar: require('@/assets/images/avatarprovider.png'),
    name: 'Selena Vega',
    email: 'vegaselena@gmail.com',
    role: 'Prestataire' as const,
    roleColor: '#a478dd',
  };

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
    router.push(routes[item] ?? '/');
  };

  const bookings = [
    {
      id: 1,
      title: 'Maquillage soirée',
      date: '10 mai 2024',
      time: '18:00',
      price: 75,
      status: 'Terminée et payée',
      address: '60 avenue du bois, Gallieni',
      clientName: 'Ralph Wiggum',
      clientEmail: 'ralphy@gmail.com',
      clientPhone: '06 59 49 22 31',
      rating: 5,
      review: 'Make-up artiste professionnelle, à l’écoute et ultra talentueuse.',
      reviewDate: '11/05/24',
    },
  ];

  const recentAction = {
    action: 'Suppression de la prestation #1',
    date: '20 janvier 2024 à 20:06',
  };

  const toggleSuspend = () => {
    setSelectedStatus(prev => (prev === 'Actif' ? 'Suspendu' : 'Actif'));
    setSuspendModalVisible(false);
  };

  const confirmDelete = () => {
    console.log('Compte supprimé');
    setDeleteModalVisible(false);
  };

  const confirmPaymentMod = (mode: 'Payé' | 'Litige') => {
    console.log('Paiement modifié en :', mode);
    setPaymentModalVisible(false);
  };

  const Separator = () => (
    <View style={{ height: 1, backgroundColor: '#ccc', marginHorizontal: 16 }} />
  );

  return (
     <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <HeaderGradient
        title={`Bienvenue ${currentUser?.name ?? 'Utilisateur'},`}
        subtitle="Gérez les utilisateurs et leurs réservations"
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

      <View style={styles.filterContainer}>
        <AppText style={styles.filterLabel}>Filtre:</AppText>
        {['Tous', 'Clients', 'Prestataires'].map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.filterButton, selectedFilter === option && styles.activeFilterButton]}
            onPress={() => setSelectedFilter(option as any)}
          >
            <AppText
              style={[
                styles.filterButtonText,
                selectedFilter === option && styles.activeFilterButtonText,
              ]}
            >
              {option}
            </AppText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterButton, { flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => setStatusDropdownVisible(true)}
        >
          <AppText style={styles.filterButtonText}>État</AppText>
          <Image
            source={require('@/assets/images/arrow-down.png')}
            style={{ width: 12, height: 12, marginLeft: 4 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
  <Separator />
      <Modal transparent visible={statusDropdownVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setStatusDropdownVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.dropdownContainer}>
              {['Actif', 'Suspendu'].map(st => (
                <TouchableOpacity
                  key={st}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStatus(st as any);
                    setStatusDropdownVisible(false);
                  }}
                >
                  <AppText style={styles.dropdownItemText}>{st}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView style={{ flex: 1, paddingHorizontal: 8 }}>
        {/* Carte utilisateur */}
        <View style={styles.userCard}>
          <Image source={selectedUser.avatar} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <AppText style={styles.userName}>{selectedUser.name}</AppText>
            <View style={styles.badgeRow}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: selectedStatus === 'Actif' ? '#4CAF50' : '#e54d4d' },
              ]}>
                <AppText style={styles.badgeText}>{selectedStatus}</AppText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: selectedUser.roleColor }]}>
                <AppText style={styles.badgeText}>{selectedUser.role}</AppText>
              </View>
            </View>
            <AppText style={styles.userEmail}>{selectedUser.email}</AppText>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => setSuspendModalVisible(true)}
                style={styles.suspendButton}
              >
                <AppText style={styles.suspendButtonText}>
                  {selectedStatus === 'Actif' ? 'Suspendre' : 'Réactiver'}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                style={styles.deleteButton}
              >
                <AppText style={styles.deleteButtonText}>Supprimer le compte</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Separator />

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
            title={b.title}
            date={b.date}
            time={b.time}
            price={b.price}
            status={b.status}
            address={b.address}
            providerName={currentUser?.name ?? ''}
            providerEmail={currentUser?.email ?? ''}
            providerPhone={b.clientPhone}
            clientName={b.clientName}
            clientEmail={b.clientEmail}
            clientPhone={b.clientPhone}
            rating={b.rating}
            review={b.review}
            reviewDate={b.reviewDate}
            role="Admin"
            onPressModifyPayment={() => setPaymentModalVisible(true)}
          />
        ))}

        <Separator />

        {/* Actions récentes */}
        <TouchableOpacity onPress={() => setShowRecentActions(!showRecentActions)} style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Actions récentes</AppText>
          <Image
            source={showRecentActions ? require('@/assets/images/arrow-up.png') : require('@/assets/images/arrow-down.png')}
            style={{ width: 35, height: 35 }}
          />
        </TouchableOpacity>

        {showRecentActions && (
  <View style={styles.logContainer}>
    <View style={styles.logItem}>
      <AppText style={styles.logAction}>{recentAction.action}</AppText>
      <AppText style={styles.logDate}>{recentAction.date}</AppText>
    </View>
    <TouchableOpacity
      style={styles.viewAllButton}
      onPress={() => router.push('/admin/user-logs')}
    >
      <AppText style={styles.viewAllText}>Voir tout</AppText>
    </TouchableOpacity>
  </View>
)}
  <Separator />
      </ScrollView>
     <Footer />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 15, marginBottom: 10 },
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
  userEmail: { color: '#5d4370', marginTop: 3, marginBottom: 2 },
  badgeRow: { flexDirection: 'row', marginVertical: 4 },
  statusBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5 },
  badgeText: { color: '#fff', fontSize: 12 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  suspendButton: { backgroundColor: '#d5c3eb', borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10, marginRight: 10 },
  suspendButtonText: { color: '#381b34', fontSize: 13 },
  deleteButton: { backgroundColor: '#e54d4d', borderRadius: 5, paddingVertical: 4, paddingHorizontal: 10 },
  deleteButtonText: { color: '#fff', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#381b34' },
  logContainer: {
  backgroundColor: '#f5edf9',
  borderRadius: 10,
  marginHorizontal: 5,
  marginBottom: 25,
  padding: 12,
  elevation: 2, // pour ombre Android
  shadowColor: '#000', // pour ombre iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
logItem: {
  marginBottom: 10,
},
logAction: {
  fontWeight: 'bold',
  color: '#381b34',
  marginBottom: 4,
},
logDate: {
  color: '#555',
},
viewAllButton: {
  alignSelf: 'flex-end',
},
viewAllText: {
  color: '#6229c6',
  fontWeight: 'bold',
},

});
