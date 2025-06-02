import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';
import { toastConfig } from '../config/toastConfig';
import { handleLogin } from '../utils/authService';



export const unstable_settings = { headerShown: false };

export default function Login() {
  const { width } = Dimensions.get('window');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();


  const [fontsLoaded] = useFonts({ Inter_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={[styles.logoImage, { width: width * 0.9, height: width * 0.9 }]}
          resizeMode="contain"
        />

        <CustomInput
          icon={require('../assets/images/mail.png')}
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          icon={require('../assets/images/lock.png')}
          placeholder="•••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showEyeIcon
        />

        <View style={{ width: '100%', alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => console.log('Mot de passe oublié')}>
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton title="Se connecter" onPress={() => handleLogin(email, password)} />

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Pas de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupLink}>S’inscrire</Text>
          </TouchableOpacity>
        </View>

        <Toast config={toastConfig} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
    width: '100%',
    backgroundColor: '#fff',
  },
  logoImage: { marginBottom: 1 },
  forgotPassword: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 50,
    color: '#A478DD',
    fontFamily: 'Inter_400Regular',
  },
  signupContainer: { flexDirection: 'row', marginTop: 40 },
  signupText: { color: '#64748B', fontFamily: 'Inter_400Regular' },
  signupLink: {
    color: '#A478DD',
    fontFamily: 'Inter_400Regular',
    fontWeight: '800',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
