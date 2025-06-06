import AppText from '@/components/ui/AppText';
import CustomInput from '@/components/ui/CustomInput';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { api } from '@/config/api';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const router = useRouter();

  // États des données utilisateur
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER' | 'ADMIN'>('CLIENT');
  const [id, setId] = useState<number | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Avatar dynamique basé sur le rôle
  const defaultAvatar = getDefaultAvatar(role);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me');
        const user = response.data;
        setId(user.id);
        setFirstName(user.firstname);
        setLastName(user.lastname);
        setEmail(user.email);
        setPhone(user.phoneNumber || '');
        setAddress(user.address || '');
        setRole(user.role || 'CLIENT');
      } catch (error) {
        console.error('Erreur lors du chargement des infos user:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const updateData: any = {
        id,
        firstname: firstName,
        lastname: lastName,
        email: newEmail || email,
        address: newAddress || address,
        phoneNumber: newPhone || phone,
      };

      // Inclure le mot de passe seulement s’il est fourni
      if (currentPassword.trim() !== '') {
        updateData.password = currentPassword;
      }

      await api.put('/users/update', updateData);
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: 'Modifications enregistrées.',
      });
      setConfirmModalVisible(false);
    } catch (error) {
      console.error('Erreur update user:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Échec de l'enregistrement.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Paramètres" avatarUri={defaultAvatar} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText style={styles.sectionTitle}>Informations personnelles</AppText>
        <CustomInput icon={require('@/assets/images/user.png')} placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
        <CustomInput icon={require('@/assets/images/user.png')} placeholder="Nom" value={lastName} onChangeText={setLastName} />

        <AppText style={styles.sectionTitle}>Adresse e-mail</AppText>
        <CustomInput icon={require('@/assets/images/mail.png')} placeholder="Adresse e-mail actuelle" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <CustomInput icon={require('@/assets/images/mail.png')} placeholder="Nouvelle adresse e-mail" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" />

        <AppText style={styles.sectionTitle}>Téléphone</AppText>
        <CustomInput icon={require('@/assets/images/mobile.png')} placeholder="Numéro actuel" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <CustomInput icon={require('@/assets/images/mobile.png')} placeholder="Nouveau numéro" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />

        <AppText style={styles.sectionTitle}>Adresse</AppText>
        <CustomInput icon={require('@/assets/images/locationapi.png')} placeholder="Adresse actuelle" value={address} onChangeText={setAddress} />
        <CustomInput icon={require('@/assets/images/locationapi.png')} placeholder="Nouvelle adresse" value={newAddress} onChangeText={setNewAddress} />

        <AppText style={styles.sectionTitle}>Mot de passe requis pour valider</AppText>
        <CustomInput icon={require('@/assets/images/lock.png')} placeholder="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry showEyeIcon />

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
  saveButton: { backgroundColor: '#7946CD', borderRadius: 5, paddingVertical: 15, alignItems: 'center', marginVertical: 10, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 9, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, alignItems: 'center', padding: 10, marginHorizontal: 5, borderRadius: 5, backgroundColor: '#ddd' },
  modalButtonText: { color: '#000', fontWeight: 'bold' },
});
