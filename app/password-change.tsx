import AppText from '@/components/ui/AppText';
import CustomInput from '@/components/ui/CustomInput';
import Footer from '@/components/ui/Footer';
import HeaderWithBackButton from '@/components/ui/HeaderWithBackButton';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function PasswordChangeScreen() {
  const { currentUser } = useAuth();

  // Dynamique : avatar selon le rôle
  const avatarUri = useMemo(
    () => getDefaultAvatar((currentUser?.role as 'CLIENT' | 'PROVIDER' | 'ADMIN') || 'CLIENT'),
    [currentUser]
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDisabled =
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    loading;

  const handleChangePassword = async () => {
    if (isDisabled) return;

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Les nouveaux mots de passe ne correspondent pas.',
      });
      return;
    }

    setLoading(true);

    try {
      const passwordData = {
        currentPassword,
        newPassword,
      };

      const response = await api.put('/users/update-password', passwordData);

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: response.data || 'Mot de passe mis à jour avec succès.',
      });

      // Réinitialise les champs après succès
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erreur mise à jour mot de passe:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2:
          error.response?.data?.message ||
          error.response?.data ||
          "Impossible de mettre à jour le mot de passe.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithBackButton
        title="Modifier le mot de passe"
        avatarUri={avatarUri}
      />

      <View style={styles.form}>
        <AppText style={styles.label}>Mot de passe actuel</AppText>
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          showEyeIcon
          autoCapitalize="none"
          textContentType="password"
        />

        <AppText style={styles.label}>Nouveau mot de passe</AppText>
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          showEyeIcon
          autoCapitalize="none"
          textContentType="newPassword"
        />

        <AppText style={styles.label}>Confirmer le nouveau mot de passe</AppText>
        <CustomInput
          icon={require('@/assets/images/lock.png')}
          placeholder="Confirmer"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          showEyeIcon
          autoCapitalize="none"
          textContentType="newPassword"
        />

        <TouchableOpacity
          style={[
            styles.saveButton,
            isDisabled && { backgroundColor: '#ccc' },
          ]}
          onPress={handleChangePassword}
          disabled={isDisabled}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.saveButtonText}>Enregistrer</AppText>
          )}
        </TouchableOpacity>
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#371B34', marginTop: 20, marginBottom: 4 },
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
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
