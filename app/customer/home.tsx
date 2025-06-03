import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import HeaderGradient from '../../components/ui/HeaderGradient';

// ✅ Import de l’avatar du client uniquement
import Footer from '@/components/ui/Footer';
import avatarClient from '../../assets/images/avatarclient.png';



export default function CustomerHomeScreen() {
  const userFirstname = 'Ralphy';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <HeaderGradient
        title={`Bienvenue ${userFirstname},`}
        subtitle="Trouvez votre Make up Artist !"
        avatarUri={avatarClient}
        showMenu={true}
        // onPressMenu={() => console.log('Menu pressed')}
      />


      {/* CONTENU PRINCIPAL */}
      <View style={styles.content}>
        <Text style={styles.welcome}>
          Bienvenue sur votre espace client{'\n'}
          <Text style={{ color: '#A478DD', fontWeight: 'bold' }}>MAKEUPNOW</Text> !
        </Text>

      </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#E1D6EF',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  menuButtonText: {
    color: '#A478DD',
    fontWeight: 'bold',
    fontSize: 17,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  welcome: {
    fontSize: 18,
    color: '#371B34',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 26,
    marginHorizontal: 18,
    marginTop: 12,
  },
});
