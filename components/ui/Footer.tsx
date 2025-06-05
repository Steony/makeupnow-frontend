import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from './AppText';

export default function Footer() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#9B59B6" />
      </View>
    );
  }

  return (
    <View style={styles.footerContainer}>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => router.push('/legal-notice')}>
          <AppText style={styles.link}>Mentions légales</AppText>
        </TouchableOpacity>

        <AppText style={styles.separator}>|</AppText>

        <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
          <AppText style={styles.link}>Politique de confidentialité</AppText>
        </TouchableOpacity>

        <AppText style={styles.separator}>|</AppText>

        <TouchableOpacity onPress={() => router.push('/contact')}>
          <AppText style={styles.link}>Contact</AppText>
        </TouchableOpacity>
      </View>

      <AppText style={styles.copyright}>
        © 2025 Makeup Now. Tous droits réservés.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  link: {
    color: '#616161',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginHorizontal: 5,
  },
  separator: {
    color: '#616161',
    marginHorizontal: 5,
  },
  copyright: {
    color: '#616161',
    fontSize: 12,
  },
});
