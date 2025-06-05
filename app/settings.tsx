import AppText from '@/components/ui/AppText';
import CustomInput from '@/components/ui/CustomInput';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [firstName, setFirstName] = useState('Ralph');
  const [lastName, setLastName] = useState('Wiggum');
  const [email, setEmail] = useState('Ralph@gmail.com');
  const [newEmail, setNewEmail] = useState('');
  const [phone, setPhone] = useState('0659492231');
  const [newPhone, setNewPhone] = useState('');
  const [address, setAddress] = useState('38 rue des Lilas, 93100 Montreuil France');
  const [newAddress, setNewAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleSave = () => {
    // Logique réelle de sauvegarde ici
    console.log('Modifications enregistrées !');
    setConfirmModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton
        title="Paramètres"
        avatarUri={require('@/assets/images/avatarclient.png')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section Informations personnelles */}
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

        {/* Section Email */}
        <AppText style={styles.sectionTitle}>Adresse e-mail</AppText>
        <CustomInput
          icon={require('@/assets/images/mail.png')}
          placeholder="Adresse e-mail actuelle"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <CustomInput
          icon={require('@/assets/images/mail.png')}
          placeholder="Nouvelle adresse e-mail"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
        />

        {/* Section Téléphone */}
        <AppText style={styles.sectionTitle}>Téléphone</AppText>
        <CustomInput
          icon={require('@/assets/images/mobile.png')}
          placeholder="Numéro de téléphone actuel"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <CustomInput
          icon={require('@/assets/images/mobile.png')}
          placeholder="Nouveau numéro de téléphone"
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
        />

        {/* Section Adresse */}
        <AppText style={styles.sectionTitle}>Adresse</AppText>
        <CustomInput
          icon={require('@/assets/images/locationapi.png')}
          placeholder="Adresse actuelle"
          value={address}
          onChangeText={setAddress}
        />
        <CustomInput
          icon={require('@/assets/images/locationapi.png')}
          placeholder="Nouvelle adresse"
          value={newAddress}
          onChangeText={setNewAddress}
        />

        {/* Section Mot de passe */}
        <AppText style={styles.sectionTitle}>Mot de passe</AppText>
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          showEyeIcon
        />
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          showEyeIcon
        />
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Saisissez à nouveau le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          showEyeIcon
        />

        {/* Bouton de sauvegarde */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setConfirmModalVisible(true)}
        >
          <AppText style={styles.saveButtonText}>Enregistrer les modifications</AppText>
        </TouchableOpacity>
      </ScrollView>

      <Footer />

      {/* Modal de confirmation */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Confirmation</AppText>
            <AppText style={styles.modalText}>Êtes-vous sûr de vouloir modifier vos informations ?</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={styles.modalButton}
              >
                <AppText style={styles.modalButtonText}>Annuler</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.modalButton, { backgroundColor: '#a478dd' }]}
              >
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#371B34',
    marginBottom: 10,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#7946CD',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  modalButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

