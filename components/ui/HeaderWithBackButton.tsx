import { useAuth } from '@/utils/AuthContext';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderWithBackButtonProps {
  title: string;
  avatarUri?: string | number;
}

export default function HeaderWithBackButton({ title, avatarUri }: HeaderWithBackButtonProps) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const defaultAvatar = getDefaultAvatar(
  (currentUser?.role?.toUpperCase() as 'CLIENT' | 'PROVIDER' | 'ADMIN') || 'CLIENT'
);



  const dynamicAvatar =
    avatarUri || defaultAvatar;

  return (
    <View style={styles.headerContainer}>
      {/* Bouton retour */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image
          source={require('../../assets/images/backbutton.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Titre */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Avatar dynamique */}
      <Image
        source={typeof dynamicAvatar === 'string' && dynamicAvatar.startsWith('http') ? { uri: dynamicAvatar } : dynamicAvatar}
        style={styles.avatar}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#371B34',
    textAlign: 'center',
    marginRight: 34,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    marginRight: 13,
  },
});
