import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <Text style={styles.link}>Mentions légales</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
          <Text style={styles.link}>Politique de confidentialité</Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity onPress={() => router.push('/contact')}>
          <Text style={styles.link}>Contact</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyright}>© 2025 Makeup Now. Tous droits réservés.</Text>
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
    flexWrap: 'wrap', // wrap au cas où ça dépasse
  },
  link: {
    color: '#A478DD',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginHorizontal: 5,
  },
  separator: {
    color: '#A478DD',
    marginHorizontal: 5,
    fontFamily: 'Inter_400Regular',
  },
  copyright: {
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
