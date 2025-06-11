import AppText from '@/components/ui/AppText';
import CustomInput from '@/components/ui/CustomInput';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth(); // D'abord ici !

  // États des données utilisateur (affichage)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [id, setId] = useState<number | null>(null); // ⚠️ Correction ici : ajout de setId !
  const [avatarUri] = useState<string | undefined>(undefined);

  // Avatar dynamique selon rôle connecté
  const defaultAvatar = getDefaultAvatar(
    (currentUser?.role?.toUpperCase() as 'CLIENT' | 'PROVIDER' | 'ADMIN') || 'CLIENT'
  );

  // États pour les modifications
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function parseWeirdJSON(data: string | object): object {
      if (typeof data !== 'string') return data as object;
      if (data.includes('}{')) {
        const first = data.substring(0, data.indexOf('}') + 1);
        return JSON.parse(first);
      }
      return JSON.parse(data);
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/me`);
        let data = response.data;
        if (typeof data === 'string') {
          data = parseWeirdJSON(data);
        }
        setFirstName(data.firstname || '');
        setLastName(data.lastname || '');
        setEmail(data.email || '');
        setPhone(data.phoneNumber || '');
        setAddress(data.address || '');
        setId(data.id || null); // ⚠️ Correction ici : on set bien l'id reçu du backend
      } catch (error) {
        console.error('Erreur lors du chargement des infos user:', error);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const updateData: any = {
        id, // ⚠️ Correction ici : id est bien alimenté !
        firstname: firstName,
        lastname: lastName,
        email: newEmail || email,
        address: newAddress || address,
        phoneNumber: newPhone || phone,
      };

      if (currentPassword.trim() !== '') {
        updateData.password = currentPassword;
      }

      // Pour debug : tu peux décommenter cette ligne pour être sûre !
      // console.log("Payload envoyé au backend:", updateData);

      await api.put('/users/update', updateData);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Modifications enregistrées.',
      });
      setConfirmModalVisible(false);

      // Mettre à jour les champs affichés
      if (newEmail) setEmail(newEmail);
      if (newPhone) setPhone(newPhone);
      if (newAddress) setAddress(newAddress);

      // On reset les inputs de modif
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Erreur update user:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.response?.data?.message || "Échec de l'enregistrement.",
      });
    }
  };

  if (loading) return <AppText>Chargement…</AppText>;

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Paramètres" avatarUri={avatarUri || defaultAvatar} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AppText style={styles.sectionTitle}>Informations personnelles</AppText>
        <CustomInput
          icon={require('@/assets/images/user.png')}
          placeholder="Prénom"
          value={firstName}
          onChangeText={setFirstName}
        />
        <CustomInput
          icon={require('@/assets/images/user.png')}
          placeholder="Nom"
          value={lastName}
          onChangeText={setLastName}
        />

        <AppText style={styles.sectionTitle}>Adresse e-mail</AppText>
        <CustomInput
          icon={require('@/assets/images/mail.png')}
          placeholder="Adresse e-mail actuelle"
          value={email}
          onChangeText={() => {}} // Bloqué en readonly
          editable={false}
        />
        <CustomInput
          icon={require('@/assets/images/mail.png')}
          placeholder="Nouvelle adresse e-mail"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
        />

        <AppText style={styles.sectionTitle}>Téléphone</AppText>
        <CustomInput
          icon={require('@/assets/images/mobile.png')}
          placeholder="Numéro actuel"
          value={phone}
          onChangeText={() => {}} // Bloqué en readonly
          editable={false}
          keyboardType="phone-pad"
        />
        <CustomInput
          icon={require('@/assets/images/mobile.png')}
          placeholder="Nouveau numéro"
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
        />

        <AppText style={styles.sectionTitle}>Adresse</AppText>
        <CustomInput
          icon={require('@/assets/images/locationapi.png')}
          placeholder="Adresse actuelle"
          value={address}
          onChangeText={() => {}} // Bloqué en readonly
          editable={false}
        />
        <CustomInput
          icon={require('@/assets/images/locationapi.png')}
          placeholder="Nouvelle adresse"
          value={newAddress}
          onChangeText={setNewAddress}
        />

        <AppText style={styles.sectionTitle}>Mot de passe requis pour valider</AppText>
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          showEyeIcon
        />

        <TouchableOpacity style={styles.saveButton} onPress={() => setConfirmModalVisible(true)}>
          <AppText style={styles.saveButtonText}>Enregistrer les modifications</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#000' }]} onPress={() => router.push('/password-change')}>
          <AppText style={styles.saveButtonText}>Changer le mot de passe</AppText>
        </TouchableOpacity>
      </ScrollView>

      <Footer />

      <Modal animationType="fade" transparent visible={confirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Confirmation</AppText>
            <AppText style={styles.modalText}>Êtes-vous sûr de vouloir modifier vos informations ?</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.modalButton}>
                <AppText style={styles.modalButtonText}>Annuler</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalButton, { backgroundColor: '#a478dd' }]}>
                <AppText style={[styles.modalButtonText, { color: '#fff' }]}>Oui</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#371B34', marginBottom: 10, marginTop: 20 },
  saveButton: {
    backgroundColor: '#7946CD',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  modalButtonText: { color: '#000', fontWeight: 'bold' },
});
