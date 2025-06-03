import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProviderCardProps {
  name: string;
  imageUri: string | number;
  category: string;
  address: string;
  rating: number;
  onPressProfile: () => void;
}

export default function ProviderCard({
  name,
  imageUri,
  category,
  address,
  rating,
  onPressProfile,
}: ProviderCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Avatar + Note */}
      <View style={styles.avatarContainer}>
        <Image source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri} style={styles.avatar} />
        <View style={styles.ratingContainer}>
          <Image source={require('../../assets/images/star.png')} style={styles.starIcon} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}/5</Text>
        </View>
      </View>

      {/* Infos */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>

        <View style={styles.addressRow}>
          <Image source={require('../../assets/images/locationapi.png')} style={styles.locationIcon} />
          <Text style={styles.address}>{address}</Text>
        </View>

        <TouchableOpacity style={styles.profileButton} onPress={onPressProfile}>
          <Text style={styles.profileButtonText}>Voir le profil</Text>
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
    textAlign: 'justify'
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
