// utils/authService.ts

import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

export const handleLogin = async (email: string, password: string) => {
  console.log("🔔 handleLogin appelé avec :", { email, password });
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

    await setItem('jwtToken', token);

    router.push('/');

    Toast.show({
      type: 'success',
      text1: 'Succès',
      text2: 'Connexion réussie ! ',
    });
  } catch (error: any) {
    console.error('Erreur de connexion :', error);
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

export const handleRegister = async (userData: any) => {
  console.log("🔔 handleRegister appelé avec :", userData);
  try {
    const response = await api.post('/users/register', userData);

    Toast.show({
      type: 'success',
      text1: 'Succès',
      text2: response.data || 'Inscription réussie ! 🎉',
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
    await removeItem('jwtToken');

    // Redirection vers la page de login
    router.push('/login');

    Toast.show({
      type: 'success',
      text1: 'Déconnexion réussie',
      text2: 'À bientôt ! ',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: "Impossible de se déconnecter pour l’instant.",
    });
  }
};

// On exporte également pour l’intercepteur Axios
export { getItem, removeItem, setItem };

