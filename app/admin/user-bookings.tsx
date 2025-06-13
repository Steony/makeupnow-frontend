import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import AppText from '@/components/ui/AppText';
import BookingCard from '@/components/ui/BookingCard';
import Footer from '@/components/ui/Footer';
import HeaderGradient from '@/components/ui/HeaderGradient';
import { api } from '@/config/api';
import { handleLogout } from '@/utils/authService';

type Params = {
  userId?: string;
  userRole?: string;
  userName?: string;
};

export default function AdminUserBookings() {
  const router = useRouter();
  const { userId, userRole, userName } = useLocalSearchParams<Params>();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Toast.show({
      type,
      text1: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Fetch user à partir de l'id
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.log('[FETCH_USER] Pas de userId reçu !');
        return;
      }
      setLoadingUser(true);
      try {
        console.log('[FETCH_USER] Début appel /admin/users');
        const res = await api.get('/admin/users', { responseType: 'text' });
        let raw = res.data;
        console.log('[FETCH_USER] Données reçues:', raw);
        let usersArr = [];
        const matches = String(raw).match(/\[[\s\S]*?\]/g);
        if (matches && matches.length > 0) {
          usersArr = JSON.parse(matches[0]);
        } else {
          try { usersArr = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { usersArr = []; }
        }
        const found = usersArr.find((u: any) => String(u.id) === String(userId));
        console.log('[FETCH_USER] Utilisateur trouvé :', found);
        setUser(found || null);
      } catch (e) {
        console.error('[FETCH_USER] ERREUR !', e);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [userId]);

  // Getters robustes
  const getServiceTitle = (booking: any) =>
    booking.serviceTitle ?? booking.service?.title ?? '';
  const getProviderName = (booking: any) =>
    booking.providerName ??
    (booking.provider ? `${booking.provider.firstname} ${booking.provider.lastname}` : '') ??
    '';
  const getProviderEmail = (booking: any) =>
    booking.providerEmail ?? booking.provider?.email ?? '';
  const getProviderPhone = (booking: any) =>
    booking.providerPhone ?? booking.provider?.phoneNumber ?? '';
  const getProviderAddress = (booking: any) =>
    booking.providerAddress ?? booking.provider?.address ?? '';
  const getServiceDuration = (booking: any) =>
    booking.serviceDuration ?? booking.service?.duration?.toString() ?? '';
  const getDateSchedule = (booking: any) =>
    booking.dateSchedule ?? booking.schedule?.startTime?.split('T')[0] ?? '';
  const getTimeSchedule = (booking: any) =>
    booking.timeSchedule ??
    (booking.schedule?.startTime ? booking.schedule?.startTime.split('T')[1]?.substring(0, 5) : '') ??
    '';

  const translateStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'COMPLETED':
        return 'Terminé et payé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Charger les bookings selon le rôle cible
  const loadBookings = async () => {
  if (!userId || !userRole) {
    console.log('[LOAD_BOOKINGS] userId ou userRole manquant:', { userId, userRole });
    return;
  }

  try {
    let url = '';
    const role = userRole.toString().toUpperCase();

    if (role === 'CLIENT') url = `/bookings/customer/${userId}`;
    else if (role === 'PROVIDER') url = `/bookings/provider/${userId}`;
    else {
      console.warn('[LOAD_BOOKINGS] Rôle non supporté:', role);
      setBookings([]);
      return;
    }

    console.log('[LOAD_BOOKINGS] Appel API bookings URL:', url);

    const response = await api.get(url);
    let data = response.data;
    console.log('[LOAD_BOOKINGS] Réponse bookings reçue:', data);

    if (typeof data === 'string') {
      if (data.startsWith('[') && data.includes('][')) {
        const parts = data.split('][');
        data = parts[0] + ']';
        console.warn('[LOAD_BOOKINGS] Réponse bookings multiple détectée, on prend la première partie');
      }
      try {
        data = JSON.parse(data);
      } catch (parseError) {
        console.error('[LOAD_BOOKINGS] Erreur parsing JSON:', parseError);
        showToast('Erreur dans les données reçues du serveur', 'error');
        setBookings([]);
        return;
      }
    }

    // Ne PAS reparsser chaque élément du tableau (à moins que tu sois certain que ce soit nécessaire)
    if (!Array.isArray(data)) {
      console.warn('[LOAD_BOOKINGS] Data reçue n’est pas un tableau, on met tableau vide');
      setBookings([]);
      return;
    }

    console.log('[LOAD_BOOKINGS] BOOKINGS_FINAL:', data);
    setBookings(data);
  } catch (error) {
    console.error('[LOAD_BOOKINGS] Erreur récupération réservations (admin):', error);
    showToast('Erreur lors du chargement des réservations', 'error');
    setBookings([]);
  }
};


  useEffect(() => {
    console.log('[useEffect BOOKINGS] userId:', userId, '| userRole:', userRole);
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole]);

  const filteredBookings = bookings.filter((booking) => {
    const serviceTitle = getServiceTitle(booking).toLowerCase();
    const matchesSearch = serviceTitle.includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'Tous' ||
      (statusFilter === 'Confirmé' && booking.status === 'CONFIRMED') ||
      (statusFilter === 'Annulé' && booking.status === 'CANCELLED') ||
      (statusFilter === 'Terminé' && booking.status === 'COMPLETED');
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) =>
        serviceTitle.includes(cat.toLowerCase())
      );
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Menu admin
  const adminMenuItems = [
    'Mon dashboard',
    'Gérer les utilisateurs',
    'Paramètres',
    'Déconnexion',
  ];
  const handleMenuItemPress = (item: string) => {
    const routes: Record<string, string> = {
      'Mon dashboard': '/admin/home',
      'Gérer les utilisateurs': '/admin/user-management',
      'Paramètres': '/settings',
    };
    if (item === 'Déconnexion') return handleLogout();
    router.push((routes[item] ?? '/') as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGradient
        title={userName ? `Réservations de ${userName}` : "Réservations de l'utilisateur"}
        showMenu
        showSearch
        showLocationSearch={false}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onCategorySelect={setSelectedCategories}
        showCategoryButton={false}
        menuItems={adminMenuItems}
        onMenuItemPress={handleMenuItemPress}
      />

      {/* UserCard au-dessus du filtre */}
      {loadingUser ? (
        <AppText style={{ textAlign: 'center', marginTop: 20 }}>Chargement du profil...</AppText>
      ) : user ? (
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
            {/* BADGES ACTIF/SUSPENDU + ROLE */}
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 3 }}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user?.isActive ? '#008505' : '#9B0404' }
              ]}>
                <AppText style={styles.badgeText}>
                  {user?.isActive ? 'Actif' : 'Suspendu'}
                </AppText>
              </View>
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
            <AppText style={styles.userEmail}>{user.email}</AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.filterContainer}>
        <AppText style={styles.filterLabel}>Filtre:</AppText>
        {['Tous', 'Terminé', 'Confirmé', 'Annulé'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <AppText
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.activeFilterButtonText,
              ]}
            >
              {status}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.bookingList}>
          {filteredBookings.length === 0 && (
            <AppText
              style={{
                color: '#a478dd',
                textAlign: 'center',
                marginTop: 32,
              }}
            >
              Aucune réservation trouvée pour cet utilisateur
            </AppText>
          )}
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id + '-' + (booking.review?.id || 'noreview')}
              title={getServiceTitle(booking)}
              dateSchedule={getDateSchedule(booking)}
              timeSchedule={getTimeSchedule(booking)}
              price={booking.totalPrice ?? booking.price ?? 0}
              status={translateStatus(booking.status ?? '')}
              address={getProviderAddress(booking)}
              providerName={getProviderName(booking)}
              providerEmail={getProviderEmail(booking)}
              providerPhone={getProviderPhone(booking)}
              rating={booking.review?.rating}
              review={booking.review?.comment}
              reviewDate={booking.review?.dateComment}
              reviewId={booking.review?.id}
              duration={parseInt(getServiceDuration(booking), 10) || 0}
              role="Admin"
            />
          ))}
        </View>
      </ScrollView>
      <Footer />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    marginLeft: 5,
    marginRight: 8,
    fontWeight: 'bold',
  },
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
  },
  activeFilterButton: {
    backgroundColor: '#a478dd',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  bookingList: {
    gap: 5,
  },
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
  // Badge style pour actif/suspendu et rôle
  statusBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4, marginRight: 5 },
  badgeText: { color: '#fff', fontSize: 13 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#efe7f7',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 2,
  },
  roleText: { fontWeight: 'bold', fontSize: 12 },
});
