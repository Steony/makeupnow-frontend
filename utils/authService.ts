// utils/authService.ts

import { RegisterDTO } from '@/types/RegisterDTO';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { api } from '../config/api';


//
// Helpers pour stocker/récupérer le JWT en fonction de la plateforme
//

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log("📦 getItem (Web) pour clé:", key);
    return window.localStorage.getItem(key);
  } else {
    console.log("🔐 getItem (Native) pour clé:", key);
    return await SecureStore.getItemAsync(key);
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log("📦 setItem (Web)", key, value);
    window.localStorage.setItem(key, value);
  } else {
    console.log("🔐 setItem (Native)", key, value);
    await SecureStore.setItemAsync(key, value);
  }
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log("📦 removeItem (Web) pour clé:", key);
    window.localStorage.removeItem(key);
  } else {
    console.log("🔐 removeItem (Native)", key);
    await SecureStore.deleteItemAsync(key);
  }
}

//
// handleLogin / handleRegister
//

// Modifie la signature pour recevoir refreshUser
export const handleLogin = async (
  email: string,
  password: string,
  refreshUser?: () => Promise<void> // optionnel, mais à utiliser
) => {
  if (!email || !password) {
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: 'Email et mot de passe obligatoires.',
    });
    return;
  }

  try {
    const response = await api.post('/users/login', { email, password });
    const { token } = response.data;

    if (!token || typeof token !== 'string') {
      throw new Error('Token invalide ou manquant');
    }

    await setItem('jwtToken', token);

    // Forcer le refresh du contexte si fourni
    if (refreshUser) {
      await refreshUser();
    }

    // Décodage pour récupérer le rôle
    const decoded: any = jwtDecode(token);
    const roleRaw = decoded.role || '';
    const roleNormalized = roleRaw.startsWith('ROLE_') ? roleRaw.substring(5) : roleRaw;

    if (roleNormalized === 'CLIENT') {
      router.replace('/customer/home');
    } else if (roleNormalized === 'PROVIDER') {
      router.replace('/provider/home');
    } else if (roleNormalized === 'ADMIN') {
      router.replace('/admin/home');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Rôle non reconnu.',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Succès',
      text2: 'Connexion réussie !',
    });

  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Une erreur s'est produite.";
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: message,
    });
  }
};


export const handleRegister = async (userData: RegisterDTO) => {
  console.log("🔔 handleRegister appelé avec :", userData);
  try {
    const response = await api.post('/users/register', userData);

    Toast.show({
      type: 'success',
      text1: 'Succès',
      text2: response.data || 'Inscription réussie ! 🎉',
    });

    // 👉 Info toast pour inviter à se connecter
    Toast.show({
      type: 'info',
      text1: 'Connexion requise',
      text2: 'Veuillez vous connecter pour continuer.',
    });

    router.push('/login');
  } catch (error: any) {
    console.error('Erreur lors de l’inscription :', error);
    const message =
      error.response?.data?.message ||
      "Une erreur s'est produite. Veuillez réessayer.";

    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: message,
    });
  }
};


//
// handleLogout
//
export const handleLogout = async () => {
  console.log('🔔 handleLogout appelé');

  try {
    const token = await getItem('jwtToken');

    if (token) {
      await api.post(
        '/users/logout',
        {}, // corps vide
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('📨 Appel backend de logout réussi');
    } else {
      console.warn('⚠️ Aucun token trouvé — skip appel backend');
    }

    await removeItem('jwtToken');
    router.push('/login');

    Toast.show({
      type: 'success',
      text1: 'Déconnexion réussie',
      text2: 'À bientôt ! ',
    });
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion :', error);
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: "Impossible de se déconnecter pour l’instant.",
    });
  }
};

// On exporte également pour l’intercepteur Axios
export { getItem, removeItem, setItem };

