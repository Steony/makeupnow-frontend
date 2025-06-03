import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface FilterModalCategoryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selectedCategories: string[]) => void; // Modification pour renvoyer un tableau
}

export default function FilterModalCategory({
  visible,
  onClose,
  onSelect,
}: FilterModalCategoryProps) {
  const [isMoreVisible, setIsMoreVisible] = useState(true); // Par défaut, on affiche
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'Mariage',
    'Beauté',
    'Mode/Editorial',
    'Tournage',
    'SFX',
    'Théâtre',
    'Enfant',
    'Homme',
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const validateSelection = () => {
    onSelect(selectedCategories);
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
              <View style={styles.headerRow}>
                <Text style={styles.title}>Catégorie</Text>
                <TouchableOpacity onPress={() => setIsMoreVisible(!isMoreVisible)}>
                  <Image
                    source={require('../../assets/images/more.png')}
                    style={styles.moreIcon}
                  />
                </TouchableOpacity>
              </View>

              {isMoreVisible && (
                <>
                  <ScrollView style={{ marginBottom: 10 }}>
                    {categories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.item}
                        onPress={() => toggleCategory(category)}
                      >
                        {/* Le check à gauche */}
                        {selectedCategories.includes(category) && (
                          <Text style={styles.checkIcon}>✔️</Text>
                        )}
                        {/* Le texte du titre */}
                        <Text style={styles.itemText}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Bouton Valider */}
                  <TouchableOpacity
                    style={styles.validateButton}
                    onPress={validateSelection}
                  >
                    <Text style={styles.validateButtonText}>Valider</Text>
                  </TouchableOpacity>
                </>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 180,
    maxHeight: 409,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000', // Couleur de l'ombre
    shadowOffset: { width: 0, height: 3 }, // Décalage
    shadowOpacity: 0.2, // Opacité
    shadowRadius: 4, // Flou
  
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_400Regular',
    
  },
  moreIcon: {
    width: 24,
    height: 24,
  },
  item: {
    flexDirection: 'row', // Le check et le texte côte à côte
    alignItems: 'center',
    justifyContent: 'flex-start', // Tout à gauche
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10, // Ajoute un petit espace entre le check et le texte
    fontFamily: 'Inter_400Regular',
  },
  checkIcon: {
    fontSize: 16,
    color: 'green',
  },
  validateButton: {
    backgroundColor: '#6229c6',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
