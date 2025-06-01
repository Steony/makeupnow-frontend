import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';

export const unstable_settings = {
  headerShown: false,
};

export default function Login() {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  const handleLogin = () => {
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    router.push('/'); // Redirige vers la page d'accueil après la connexion
  };

  return (
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

      {/* Mot de passe oublié aligné à droite */}
      <View style={{ width: '100%', alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={() => console.log('Mot de passe oublié')}>
          <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Se connecter" onPress={handleLogin} />

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Pas de compte ? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.signupLink}>S’inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '',
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
    fontFamily: 'Inter_400Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  signupText: {
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
  },
  signupLink: {
    color: '#A478DD',
    fontFamily: 'Inter_400Regular',
    fontWeight: '500',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
