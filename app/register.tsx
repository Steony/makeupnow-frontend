// src/screens/RegisterScreen.tsx
import AppText from '@/components/ui/AppText';
import CheckBox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomInput from '../components/ui/CustomInput';
import HeaderWithBackButton from '../components/ui/HeaderWithBackButton';
import { toastConfig } from '../config/toastConfig';
import { handleRegister } from '../utils/authService';

export default function RegisterScreen() {
  const router = useRouter();

  const [userType, setUserType] = useState<'Client' | 'Pro'>('Client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [mobile, setMobile] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserType = (type: 'Client' | 'Pro') => setUserType(type);

  const onRegister = async () => {
    if (isLoading) return;

    const emailTrimmed   = email.trim();
    const prenomTrimmed  = prenom.trim();
    const nomTrimmed     = nom.trim();
    const adresseTrimmed = adresse.trim();
    const mobileTrimmed  = mobile.trim();

    if (!prenomTrimmed || !nomTrimmed || !emailTrimmed || !password || !adresseTrimmed || !mobileTrimmed) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Tous les champs doivent être remplis.' });
      return;
    }

    if (!isChecked) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Vous devez accepter la politique de confidentialité.' });
      return;
    }

    if (prenomTrimmed.length < 2 || nomTrimmed.length < 2) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le prénom et le nom doivent avoir au moins 2 lettres.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Veuillez entrer un email valide.' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Le mot de passe doit contenir 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial et faire au moins 8 caractères.',
      });
      return;
    }

    if (adresseTrimmed.length < 2 || mobileTrimmed.length < 2) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Veuillez entrer une adresse et un numéro valides.' });
      return;
    }

    const userData = {
      firstname:   prenomTrimmed,
      lastname:    nomTrimmed,
      email:       emailTrimmed,
      password,
      address:     adresseTrimmed,
      phoneNumber: mobileTrimmed,
      role:        userType === 'Pro' ? 'PROVIDER' : 'CLIENT',
    };

    console.log('🔔 Appel handleRegister avec :', userData);

    setIsLoading(true);
    try {
      await handleRegister(userData);
    } catch {
      // handleRegister affiche déjà le toast d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Définir dynamiquement le placeholder de l’adresse
  const addressPlaceholder = userType === 'Pro'
    ? 'Adresse (lieu d\'exercice professionnel)'
    : 'Adresse de domicile';

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderWithBackButton title="Créer un compte" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, userType === 'Client' && styles.tabButtonActive]}
            onPress={() => handleUserType('Client')}
            disabled={isLoading}
          >
            <AppText style={[styles.tabText, userType === 'Client' && styles.tabTextActive]}>
              Client
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, userType === 'Pro' && styles.tabButtonActive]}
            onPress={() => handleUserType('Pro')}
            disabled={isLoading}
          >
            <AppText style={[styles.tabText, userType === 'Pro' && styles.tabTextActive]}>
              Pro
            </AppText>
          </TouchableOpacity>
        </View>

        <CustomInput icon={require('../assets/images/user.png')} placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
        <CustomInput icon={require('../assets/images/user.png')} placeholder="Nom" value={nom} onChangeText={setNom} />
        <CustomInput icon={require('../assets/images/mail.png')} placeholder="example@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <CustomInput icon={require('../assets/images/lock.png')} placeholder="•••" value={password} onChangeText={setPassword} secureTextEntry showEyeIcon />
        <CustomInput icon={require('../assets/images/location.png')} placeholder={addressPlaceholder} value={adresse} onChangeText={setAdresse} />
        <CustomInput icon={require('../assets/images/mobile.png')} placeholder="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

        <View style={styles.checkboxContainer}>
          <CheckBox value={isChecked} onValueChange={setIsChecked} disabled={isLoading} />
          <AppText style={styles.checkboxText}>
            J’ai lu et j’accepte{' '}
            <AppText
              style={styles.privacyLink}
              onPress={() => router.push('/privacy-policy')}
            >
              la politique de confidentialité
            </AppText>
          </AppText>
        </View>

        <View style={{ width: '100%', alignItems: 'center', marginBottom: 30 }}>
          <TouchableOpacity
            onPress={onRegister}
            style={[styles.button, isLoading && { opacity: 0.6 }]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText style={styles.buttonText}>S’inscrire</AppText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <AppText style={styles.loginText}>Déjà un compte ? </AppText>
          <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
            <AppText style={styles.loginLink}>Se connecter</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast config={toastConfig} topOffset={150} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  tabContainer: { flexDirection: 'row', marginBottom: 35, width: '100%' },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 1,
    backgroundColor: '#CFCFCF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  tabButtonActive: { backgroundColor: '#A478DD' },
  tabText: { color: '#333', fontSize: 16 },
  tabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginBottom: 30, width: '100%' },
  checkboxText: { marginLeft: 10, color: '#64748B', fontFamily: 'Inter_400Regular' },
  loginContainer: { flexDirection: 'row', marginBottom: 30 },
  loginText: { color: '#64748B', fontFamily: 'Inter_400Regular', fontWeight: '500', fontSize: 15 },
  loginLink: { color: '#A478DD', fontFamily: 'Inter_400Regular', fontWeight: '800', fontSize: 15, textDecorationLine: 'underline' },
  privacyLink: { color: '#64748B', textDecorationLine: 'underline' },
  button: { backgroundColor: '#A478DD', borderRadius: 4, paddingVertical: 16, paddingHorizontal: 60, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.7, shadowRadius: 9, elevation: 5, alignItems: 'center', width: '100%' },
  buttonText: { color: 'white', fontSize: 20, fontFamily: 'Inter_400Regular' },
});
