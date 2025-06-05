// src/screens/Login.tsx

import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from '../components/ui/AppText';
import CustomInput from '../components/ui/CustomInput';
import { toastConfig } from '../config/toastConfig';
import { handleLogin } from '../utils/authService';

export const unstable_settings = { headerShown: false };

export default function Login() {
  const { width } = Dimensions.get('window');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({ Inter_400Regular });
  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  const onLoginPress = async () => {
    if (isLoading) return;
    const emailTrimmed = email.trim();

    if (!emailTrimmed || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Email et mot de passe sont requis.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await handleLogin(emailTrimmed, password);
    } catch {
      // handleLogin gère déjà l’affichage des erreurs
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={[styles.logoImage, { width: width * 0.9, height: width * 0.9 }]}
          resizeMode="contain"
        />

        {/* Champ email */}
        <CustomInput
          icon={require('../assets/images/mail.png')}
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          secureTextEntry={false}
          showEyeIcon={false}
          keyboardType="email-address"
        />

        {/* Champ mot de passe */}
        <CustomInput
          icon={require('../assets/images/lock.png')}
          placeholder="•••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showEyeIcon
          keyboardType="default"
        />

        <View style={{ width: '100%', alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => console.log('Mot de passe oublié')}>
            <AppText style={styles.forgotPassword}>Mot de passe oublié ?</AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.6 }]}
          onPress={onLoginPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <AppText style={styles.buttonText}>Se connecter</AppText>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <AppText style={styles.signupText}>Pas de compte ? </AppText>
          <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
            <AppText style={styles.signupLink}>S’inscrire</AppText>
          </TouchableOpacity>
        </View>

        <Toast config={toastConfig} topOffset={150} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
    width: '100%',
    backgroundColor: '#fff',
  },
  logoImage: {
    marginBottom: 1,
  },
  forgotPassword: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 50,
    color: '#A478DD',
  },
  button: {
    backgroundColor: '#A478DD',
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 9,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  signupText: {
    color: '#64748B',
  },
  signupLink: {
    color: '#A478DD',
    fontWeight: '800',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
