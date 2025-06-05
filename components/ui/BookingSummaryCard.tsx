import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import AppText from './AppText'; // ✅ Ajout d'AppText

interface BookingSummaryCardProps {
  date: string;
  provider: string;
  service: string;
  address: string;
  duration: string;
  clientName: string;
  price: number;
}

export default function BookingSummaryCard({
  date,
  provider,
  service,
  address,
  duration,
  clientName,
  price,
}: BookingSummaryCardProps) {
  return (
    <View style={styles.card}>
      <AppText style={styles.date}>{date}</AppText>

      <View style={styles.row}>
        <Image
          source={require('../../assets/images/userbooking.png')}
          style={styles.icon}
        />
        <AppText style={styles.text}>Maquilleuse : {provider}</AppText>
      </View>

      <View style={styles.row}>
        <Image
          source={require('../../assets/images/booking.png')}
          style={styles.icon}
        />
        <AppText style={styles.text}>Prestation : {service}</AppText>
      </View>

      <View style={styles.row}>
        <Image
          source={require('../../assets/images/locationbooking.png')}
          style={styles.icon}
        />
        <AppText style={styles.text}>Lieu : {address}</AppText>
      </View>

      <View style={styles.row}>
        <Image
          source={require('../../assets/images/clock.png')}
          style={styles.icon}
        />
        <AppText style={styles.text}>Durée : {duration}</AppText>
      </View>

      <AppText style={[styles.text, styles.clientText]}>Pour : {clientName}</AppText>

      <AppText style={styles.price}>Total: {price} €</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 16,
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  clientText: {
    marginTop: 8,
  },
  price: {
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'right',
    fontSize: 18,
  },
});
