import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceCardProps {
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  isSelected: boolean;
  onPressChoose: () => void;
}

export default function ServiceCard({
  title,
  category,
  description,
  price,
  duration,
  isSelected,
  onPressChoose,
}: ServiceCardProps) {
  return (
    <View style={styles.container}>
      {/* Ligne Titre et Prix */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price}€</Text>
      </View>

      {/* Catégorie */}
      <Text style={styles.category}>{category}</Text>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Ligne Durée et Bouton Choisir alignés */}
      <View style={styles.bottomRow}>
        <View style={styles.durationRow}>
          <Image
            source={require('../../assets/images/clock.png')}
            style={styles.clockIcon}
          />
          <Text style={styles.duration}>{duration}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.chooseButton,
            isSelected && styles.chooseButtonSelected,
          ]}
          onPress={onPressChoose}
        >
          <Text
            style={[
              styles.chooseButtonText,
              isSelected && styles.chooseButtonTextSelected,
            ]}
          >
            Choisir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  price: {
    fontSize: 16,
    color: '#A478DD',
    fontWeight: 'bold',
  },
  category: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#444',
    marginTop: 4,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  duration: {
    fontSize: 14,
    color: '#000',
  },
  chooseButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 17,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chooseButtonSelected: {
    backgroundColor: '#000',
  },
  chooseButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  chooseButtonTextSelected: {
    color: '#fff',
  },
});
