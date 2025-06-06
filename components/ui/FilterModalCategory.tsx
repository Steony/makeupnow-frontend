import { api } from '@/config/api';
import React, { useEffect, useState } from 'react';
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

interface Category {
  id: number;
  title: string;
}

interface FilterModalCategoryProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selectedCategories: Category[]) => void; // ✅
}

export default function FilterModalCategory({
  visible,
  onClose,
  onSelect,
}: FilterModalCategoryProps) {
  const [isMoreVisible, setIsMoreVisible] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // ✅

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data); // ✅ récupère [{id, title}]
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const toggleCategory = (category: Category) => {
    if (selectedCategories.find((c) => c.id === category.id)) {
      setSelectedCategories(selectedCategories.filter((c) => c.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const validateSelection = () => {
    onSelect(selectedCategories); // ✅ renvoie [{id, title}]
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
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
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.item}
                        onPress={() => toggleCategory(category)}
                      >
                        {selectedCategories.find((c) => c.id === category.id) && (
                          <AppText style={styles.checkIcon}>✔️</AppText>
                        )}
                        <AppText style={styles.itemText}>{category.title}</AppText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={styles.validateButton} onPress={validateSelection}>
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
  },
  moreIcon: {
    width: 24,
    height: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10,
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
