import AppText from '@/components/ui/AppText';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { useAuth } from '@/utils/AuthContext';
import { handleLogout } from '@/utils/authService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, } from 'react-native';

const fakeUser = {
  avatar: require('@/assets/images/avatarprovider.png'),
  name: 'Selena Vega',
  email: 'vegaselena@gmail.com',
  role: 'Prestataire',
  roleColor: '#a478dd',
};

const fakeLogs = [
  {
    date: '20 janvier 2024 à 20:06',
    action: "Suppression de la prestation #1",
    description: 'La prestation "Maquillage naturel express" (ID#1) a été supprimée de l’offre.',
  },
  {
    date: '23 avril 2025 à 09:50',
    action: 'Modification du prix d’une prestation',
    description: 'Tarif de la prestation "Maquillage soirée" modifié de 70€ à 75€.',
  },
  {
    date: '23 avril 2025 à 14:32',
    action: 'Suppression d’un créneau de planning',
    description: 'Le créneau du 26 avril 2025, 10h à 12h, a été supprimé.',
  },
];

export default function UserLogsScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [selectedStatus, setSelectedStatus] = useState('Actif');
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [dateDropdownVisible, setDateDropdownVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

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

  // Tri les logs en fonction de l'ordre sélectionné
  const sortedLogs = [...fakeLogs].sort((a, b) => {
    const dateA = new Date(a.date.split(' à ')[0].split(' ').reverse().join('-')).getTime();
    const dateB = new Date(b.date.split(' à ')[0].split(' ').reverse().join('-')).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <HeaderGradient
        title={`Bienvenue ${currentUser?.name ?? 'Utilisateur'},`}
        subtitle="Consultez les logs utilisateurs"
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

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <AppText style={styles.filterLabel}>Filtre:</AppText>
        {['Tous', 'Clients', 'Prestataires'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              selectedFilter === option && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(option)}
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
        {/* Bouton "Etat" */}
        <TouchableOpacity
          style={[styles.filterButton, { flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => setStatusDropdownVisible(true)}
        >
          <AppText style={styles.filterButtonText}>Etat</AppText>
          <Image
            source={require('@/assets/images/arrow-down.png')}
            style={{ width: 12, height: 12, marginLeft: 4 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Menu déroulant "Etat" */}
      <Modal transparent visible={statusDropdownVisible} animationType="fade" onRequestClose={() => setStatusDropdownVisible(false)}>
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
        <Image source={fakeUser.avatar} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <AppText style={styles.userName}>{fakeUser.name}</AppText>
          <View style={styles.roleBadge}>
            <AppText style={[styles.roleText, { color: fakeUser.roleColor }]}>
              {fakeUser.role}
            </AppText>
          </View>
          <AppText style={styles.userEmail}>{fakeUser.email}</AppText>
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
      <Modal transparent visible={dateDropdownVisible} animationType="fade" onRequestClose={() => setDateDropdownVisible(false)}>
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
      
        {sortedLogs.map((log, idx) => (
          <View key={idx} style={styles.logRow}>
            <AppText style={styles.logDate}>{log.date}</AppText>
            <AppText style={styles.logAction}>{log.action}</AppText>
            <AppText style={styles.logDesc}>{log.description}</AppText>
          </View>
        ))}
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
