import AppText from '@/components/ui/AppText'; // 👈 Ajouté pour remplacer <Text>
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ReviewCardProps {
  rating: number;
  text: string;
  author: string;
  date: string;
}

export default function ReviewCard({ rating, text, author, date }: ReviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.ratingRow}>
        <Image source={require('../../assets/images/star.png')} style={styles.starIcon} />
        <AppText style={styles.ratingText}>{rating}/5</AppText>
      </View>
      <AppText style={styles.reviewText}>{text}</AppText>
      <View style={styles.authorDateRow}>
        <AppText style={styles.author}>{author}</AppText>
        <AppText style={styles.date}>(publié le {date})</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  reviewText: {
    marginVertical: 4,
    color: '#333',
    fontSize: 15,
  },
  authorDateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // aligné à droite
    alignItems: 'center',
    marginTop: 4,
  },
  author: {
    fontSize: 15,
    color: '#555',
    marginRight: 4,
  },
  date: {
    fontSize: 15,
    color: '#777',
  },
});
