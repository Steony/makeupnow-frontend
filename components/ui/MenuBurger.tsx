import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AppText from './AppText';

interface MenuBurgerProps {
  visible: boolean;
  onClose: () => void;
  items: string[];
  onItemPress?: (item: string) => void;
  onLogout?: () => void; // <-- ajoute cette prop
}

export default function MenuBurger({
  visible,
  onClose,
  items,
  onItemPress,
  onLogout,
}: MenuBurgerProps) {
  const handleItemPress = (item: string) => {
    if (onItemPress) onItemPress(item);

    if (item.toLowerCase() === 'déconnexion') {
      if (onLogout) {
        onLogout(); // Appelle la vraie déconnexion qui vide le contexte
      }
    }

    onClose();
  };

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
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}
                >
                  <AppText style={styles.menuText}>{item}</AppText>
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
    paddingTop: 40,
    marginTop: 90,
    paddingHorizontal: 28,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    marginBottom: 35,
  },
  menuText: {
    fontSize: 18,
    color: '#000',
  },
});
