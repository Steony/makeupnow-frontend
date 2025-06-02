// utils/authService.ts
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { api } from '../config/api';

// Selon la plateforme, on stocke/récupère dans localStorage (Web) ou SecureStore (iOS/Android)
async function getItem(key: string): Promise<string | null> {
  if (Constants.platform?.web) {
    console.log("📦 getItem (Web) pour clé:", key);
    return window.localStorage.getItem(key);
  } else {
    console.log("🔐 getItem (Mobile) pour clé:", key);
    return await SecureStore.getItemAsync(key);
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (Constants.platform?.web) {
    console.log("📦 setItem (Web)", key, value);
    window.localStorage.setItem(key, value);
  } else {
    console.log("🔐 setItem (Mobile)", key, value);
    await SecureStore.setItemAsync(key, value);
  }
}

async function removeItem(key: string): Promise<void> {
  if (Constants.platform?.web) {
    console.log("📦 removeItem (Web) pour clé:", key);
    window.localStorage.removeItem(key);
  } else {
    console.log("🔐 removeItem (Mobile) pour clé:", key);
    await SecureStore.deleteItemAsync(key);
  }
}

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
      text2: 'Connexion réussie !',
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
      text2: response.data || 'Inscription réussie !',
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

// On exporte aussi les helpers pour l’intercepteur Axios
export { getItem, removeItem, setItem };

