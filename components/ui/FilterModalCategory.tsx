import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AppText from './AppText';

interface FilterModalCategoryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selectedCategories: string[]) => void;
}

export default function FilterModalCategory({
  visible,
  onClose,
  onSelect,
}: FilterModalCategoryProps) {
  const [isMoreVisible, setIsMoreVisible] = useState(true);
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
                <AppText style={styles.title}>Catégorie</AppText>
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
                        {selectedCategories.includes(category) && (
                          <AppText style={styles.checkIcon}>✔️</AppText>
                        )}
                        <AppText style={styles.itemText}>{category}</AppText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.validateButton}
                    onPress={validateSelection}
                  >
                    <AppText style={styles.validateButtonText}>Valider</AppText>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10,
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
