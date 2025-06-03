import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Composant interne : Menu burger
const MenuBurger = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const menuItems = ['Accueil', 'Mes réservations', 'Mon profil', 'Paramètres', 'Déconnexion'];

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
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    console.log('Item:', item);
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
};

// Composant interne : Modal de filtre des catégories avec validation et cases à cocher à gauche
const FilterModalCategory = ({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (categories: string[]) => void;
}) => {
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
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Catégorie</Text>
              <ScrollView style={{ marginBottom: 10 }}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.filterItem}
                    onPress={() => toggleCategory(category)}
                  >
                    {/* Check à gauche */}
                    {selectedCategories.includes(category) && (
                      <Text style={styles.checkIcon}>✔️</Text>
                    )}
                    <Text style={[styles.filterItemText, { marginLeft: 10 }]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.validateButton}
                onPress={validateSelection}
              >
                <Text style={styles.validateButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

interface HeaderGradientProps {
  title?: string;
  subtitle?: string;
  avatarUri?: string | any;
  showMenu?: boolean;
}

export default function HeaderGradient({
  title,
  subtitle,
  avatarUri,
  showMenu = true,
}: HeaderGradientProps) {
  const defaultAvatar = require('../../assets/images/avatarclient.png');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const toggleFilter = () => setFilterVisible(!filterVisible);

  const handleCategorySelect = (categories: string[]) => {
    console.log('Catégories sélectionnées:', categories);
  };

  return (
    <>
      <LinearGradient
        colors={['rgba(239, 222, 253, 0.9)', 'rgb(98, 41, 198)']}
        style={styles.gradient}
        start={{ x: 0.8, y: 0.2 }}
        end={{ x: 0.2, y: 1 }}
      >
        <View style={styles.headerRow}>
          {showMenu && (
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Image
                source={require('../../assets/images/menuBar.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <Image
            source={
              typeof avatarUri === 'string' && avatarUri.startsWith('http')
                ? { uri: avatarUri }
                : avatarUri || defaultAvatar
            }
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Image source={require('../../assets/images/search.png')} style={styles.icon} />
            <TextInput
              placeholder="Je cherche..."
              placeholderTextColor="#888"
              style={styles.textInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={toggleFilter}>
              <Image
                source={require('../../assets/images/more.png')}
                style={styles.addIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputWrapper}>
            <Image source={require('../../assets/images/locationSearch.png')} style={styles.icon} />
            <TextInput
              placeholder="Lieu"
              placeholderTextColor="#888"
              style={styles.textInput}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.goButton} onPress={() => console.log('GO! pressed')}>
          <Image
            source={require('../../assets/images/gobutton.png')}
            style={styles.goIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </LinearGradient>

      <MenuBurger visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <FilterModalCategory
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSelect={handleCategorySelect}
      />
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    width: width,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 70,
    paddingHorizontal: 35,
    fontFamily: 'Inter_400Regular',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  menuButton: {
    padding: 8,
    
  },
  menuIcon: {
    width: 55,
    height: 55,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 23,
    fontFamily: 'Inter_400Regular',
  },
  subtitle: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
  },
  searchContainer: {
    marginTop: 15,
  },
  searchInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 12,
    width: '100%',
    alignSelf: 'center',
    height: 60,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  addButton: {
    padding: 6,
    borderRadius: 20,
  },
  addIcon: {
    width: 40,
    height: 40,
  },
  goButton: {
    alignSelf: 'center',
    marginTop: -20,
  },
  goIcon: {
    width: 80,
    height: 80,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    width: 190,
    height: 310,
    backgroundColor: '#fff',
    paddingTop: 30,
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
    marginBottom: 35,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
     fontFamily: 'Inter_400Regular',
  },
  filterContainer: {
    position: 'absolute',
    top: 260,
    left: 180,
    width: 180,
    maxHeight: 460,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 19,
    elevation: 5,
    shadowColor: '#000', // Couleur de l'ombre
    shadowOffset: { width: 0, height: 3 }, // Décalage
    shadowOpacity: 0.2, // Opacité
    shadowRadius: 4, // Flou
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Inter_400Regular', 
    textAlign: 'center',
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterItemText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  checkIcon: {
    fontSize: 16,
    color: 'green',
  },
  validateButton: {
    backgroundColor: '#6229c6',
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  validateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
