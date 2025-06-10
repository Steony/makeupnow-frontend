import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from './AppText';

interface ProviderCardProps {
  name: string;
  imageUri?: string | number;
  category: string;
  address: string;
  rating?: number;
  onPressProfile: () => void;
  role?: 'ADMIN' | 'CLIENT' | 'PROVIDER';
}

export default function ProviderCard({
  name,
  imageUri,
  category,
  address,
  rating,
  onPressProfile,
  role = 'PROVIDER',
}: ProviderCardProps) {
  // Formatage propre de la note
  const displayedRating = rating != null ? rating.toFixed(1) : 'N/A';

  // Source de l'avatar
  const avatarSource =
    typeof imageUri === 'string' && imageUri.length > 0
      ? { uri: imageUri }
      : imageUri
      ? imageUri
      : getDefaultAvatar(role);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.avatarContainer}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.ratingContainer}>
          <Image source={require('@/assets/images/star.png')} style={styles.starIcon} />
          <AppText style={styles.ratingText}>{displayedRating}/5</AppText>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <AppText style={styles.name}>{name}</AppText>
        <AppText style={styles.category}>{category || 'Makeup Artist'}</AppText>

        <View style={styles.addressRow}>
          <Image source={require('@/assets/images/locationapi.png')} style={styles.locationIcon} />
          <AppText style={styles.address}>{address || 'Adresse non renseignée'}</AppText>
        </View>

        <TouchableOpacity style={styles.profileButton} onPress={onPressProfile}>
          <AppText style={styles.profileButtonText}>Voir le profil</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  avatar: {
    width: 67,
    height: 67,
    borderRadius: 35,
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  starIcon: {
    width: 25,
    height: 25,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter_400Regular',
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_400Regular',
    fontWeight: 'bold',
    fontSize: 17,
    color: '#000',
    marginBottom: 9,
  },
  category: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  address: {
    fontSize: 15,
    color: '#444',
    fontFamily: 'Inter_400Regular',
    marginTop: 9,
  },
  profileButton: {
    backgroundColor: '#A478DD',
    borderRadius: 5,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Inter_400Regular',
  },
  locationIcon: {
    width: 30,
    height: 30,
    marginRight: 4,
    marginTop: 9,
  },
});
