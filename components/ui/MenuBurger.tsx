import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface MenuBurgerProps {
  visible: boolean;
  onClose: () => void;
  items: string[];
  onItemPress?: (item: string) => void;
}

export default function MenuBurger({
  visible,
  onClose,
  items,
  onItemPress,
}: MenuBurgerProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Bouton Close supprimé */}
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    if (onItemPress) onItemPress(item);
                    onClose();
                  }}
                >
                  <Text style={styles.menuText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  container: {
    width: 190,
    height: 310,
    backgroundColor: '#fff',
    paddingTop: 40, // ⇦ descend encore plus les titres
    marginTop: 90,
    paddingHorizontal: 28,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
     shadowColor: '#000', // Couleur de l'ombre
    shadowOffset: { width: 0, height: 3 }, // Décalage
    shadowOpacity: 0.2, // Opacité
    shadowRadius: 4, // Flou
  },
  menuItem: {
    marginBottom: 35, // ⇦ espace entre les titres
  },
  menuText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Inter_400Regular',
  },
});
