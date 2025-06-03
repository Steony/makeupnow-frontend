import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderWithBackButtonProps {
  title: string;
  avatarUri?: string | number;
}

export default function HeaderWithBackButton({ title, avatarUri }: HeaderWithBackButtonProps) {
  const router = useRouter();

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

      {/* Avatar client */}
      {avatarUri && (
        <Image
          source={typeof avatarUri === 'string' ? { uri: avatarUri } : avatarUri}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingTop: 40, // Pour éviter la zone d'encoche
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
    marginRight: 34, // Décalage pour centrer le titre avec l’icône à gauche
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    marginRight: 13, // Espace entre l'avatar et le titre
  },
});
