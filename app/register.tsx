import CheckBox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../components/ui/CustomInput';
import PrimaryButton from '../components/ui/PrimaryButton';

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
  const [isCertified, setIsCertified] = useState(false);

  const handleUserType = (type: 'Client' | 'Pro') => setUserType(type);

  const handleRegister = () => {
    console.log('Inscription avec :', { email, password, prenom, nom, adresse, mobile, isCertified });
    router.push('/'); // redirection après inscription
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      {/* Onglets Client / Pro */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, userType === 'Client' && styles.tabButtonActive]}
          onPress={() => handleUserType('Client')}
        >
          <Text style={[styles.tabText, userType === 'Client' && styles.tabTextActive]}>Client</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, userType === 'Pro' && styles.tabButtonActive]}
          onPress={() => handleUserType('Pro')}
        >
          <Text style={[styles.tabText, userType === 'Pro' && styles.tabTextActive]}>Pro</Text>
        </TouchableOpacity>
      </View>

      {/* Champs */}
      <CustomInput
        icon={require('../assets/images/user.png')}
        placeholder="Prénom"
        value={prenom}
        onChangeText={setPrenom}
      />

      <CustomInput
        icon={require('../assets/images/user.png')}
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
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

      <CustomInput
        icon={require('../assets/images/mail.png')}
        placeholder="Adresse"
        value={adresse}
        onChangeText={setAdresse}
      />

      <CustomInput
        icon={require('../assets/images/mobile.png')}
        placeholder="Mobile"
        value={mobile}
        onChangeText={setMobile}
      />

      {/* Checkbox pour la certification (affichée uniquement pour Pro) */}
      {userType === 'Pro' && (
        <View style={styles.checkboxContainer}>
          <CheckBox value={isCertified} onValueChange={setIsCertified} />
          <Text style={styles.checkboxText}>
            J’atteste avoir une certification professionnelle de maquilleur(se) (facultatif)
          </Text>
        </View>
      )}

      {/* Checkbox avec lien vers la politique de confidentialité */}
      <View style={styles.checkboxContainer}>
        <CheckBox value={isChecked} onValueChange={setIsChecked} />
        <Text style={styles.checkboxText}>
          J’ai lu et j’accepte{' '}
          <Text
            style={styles.privacyLink}
            onPress={() => router.push('/privacy-policy')}
          >
            la politique de confidentialité
          </Text>
        </Text>
      </View>

      {/* Bouton d’inscription */}
      <PrimaryButton title="S’inscrire" onPress={handleRegister} />

      {/* Lien pour se connecter */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Déjà un compte ? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#371B34',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#CFCFCF',
    // Ajout du shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  tabButtonActive: {
    backgroundColor: '#A478DD',
  },
  tabText: {
    color: '#333',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginBottom: 30,
    width: '100%',
  },
  checkboxText: {
    marginLeft: 10,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 35,
  },
  loginText: {
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
    fontWeight: '500',
    fontSize: 15,
  },
  loginLink: {
    color: '#A478DD',
    fontFamily: 'Inter_400Regular',
    fontWeight: '500',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  privacyLink: {
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});

