import AppText from '@/components/ui/AppText';
import { useAuth } from '@/utils/AuthContext';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const MenuBurger = ({
  visible,
  onClose,
  items = [],
  onItemPress,
}: {
  visible: boolean;
  onClose: () => void;
  items?: string[];
  onItemPress?: (item: string) => void;
}) => {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    if (onItemPress) onItemPress(item);
                    onClose();
                  }}
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
};

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

  const categories = ['Mariage', 'Beauté', 'Mode/Editorial', 'Tournage', 'SFX', 'Théâtre', 'Enfant', 'Homme'];

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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.filterContainer}>
              <AppText style={styles.filterTitle}>Catégorie</AppText>
              <ScrollView style={{ marginBottom: 10 }}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.filterItem}
                    onPress={() => toggleCategory(category)}
                  >
                    {selectedCategories.includes(category) && (
                      <AppText style={styles.checkIcon}>✔️</AppText>
                    )}
                    <AppText style={[styles.filterItemText, { marginLeft: 10 }]}>{category}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.validateButton} onPress={validateSelection}>
                <AppText style={styles.validateButtonText}>Valider</AppText>
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
  showSearch?: boolean;
  showLocationSearch?: boolean;
  searchQuery?: string;
  onChangeSearch?: (text: string) => void;
  locationQuery?: string;
  onChangeLocation?: (text: string) => void;
  onCategorySelect?: (categories: string[]) => void;
  showCategoryButton?: boolean;
  menuItems?: string[];
  onMenuItemPress?: (item: string) => void;
}

export default function HeaderGradient({
  title,
  subtitle,
  avatarUri,
  showMenu = true,
  showSearch = true,
  showLocationSearch = true,
  searchQuery,
  onChangeSearch,
  locationQuery,
  onChangeLocation,
  onCategorySelect,
  showCategoryButton = true,
  menuItems = [],
  onMenuItemPress,
}: HeaderGradientProps) {
  const { currentUser } = useAuth();
  const defaultAvatar = getDefaultAvatar(
  (currentUser?.role?.toUpperCase() as 'CLIENT' | 'PROVIDER' | 'ADMIN') || 'CLIENT'
);


  const dynamicAvatar =
    avatarUri || defaultAvatar;

  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const toggleFilter = () => setFilterVisible(!filterVisible);

  const handleCategorySelect = (categories: string[]) => {
    if (onCategorySelect) {
      onCategorySelect(categories);
    }
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
              <Image source={require('../../assets/images/menuBar.png')} style={styles.menuIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}
          <Image
            source={typeof dynamicAvatar === 'string' && dynamicAvatar.startsWith('http') ? { uri: dynamicAvatar } : dynamicAvatar}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        {title && <AppText style={styles.title}>{title}</AppText>}
        {subtitle && <AppText style={styles.subtitle}>{subtitle}</AppText>}

        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Image source={require('../../assets/images/search.png')} style={styles.icon} />
              <TextInput
                placeholder="Rechercher..."
                placeholderTextColor="#888"
                style={styles.textInput}
                value={searchQuery}
                onChangeText={onChangeSearch}
              />
              {showCategoryButton && (
                <TouchableOpacity style={styles.addButton} onPress={toggleFilter}>
                  <Image source={require('../../assets/images/more.png')} style={styles.addIcon} />
                </TouchableOpacity>
              )}
            </View>

            {showLocationSearch && (
              <View style={styles.searchInputWrapper}>
                <Image source={require('../../assets/images/locationSearch.png')} style={styles.icon} />
                <TextInput
                  placeholder="Lieu"
                  placeholderTextColor="#888"
                  style={styles.textInput}
                  value={locationQuery}
                  onChangeText={onChangeLocation}
                />
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <MenuBurger
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        onItemPress={onMenuItemPress}
      />

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
  gradient: { width, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingTop: 70, paddingHorizontal: 35 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  menuButton: { padding: 8 },
  menuIcon: { width: 55, height: 55 },
  avatar: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  title: { color: '#fff', fontSize: 20, marginBottom: 23 },
  subtitle: { color: '#fff', fontSize: 22, marginBottom: 16 },
  searchContainer: { marginTop: 15 },
  searchInputWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.93)', borderRadius: 5, flexDirection: 'row', alignItems: 'center', marginBottom: 22, paddingHorizontal: 12, width: '100%', alignSelf: 'center', height: 60 },
  icon: { width: 40, height: 40, marginRight: 8 },
  textInput: { flex: 1, color: '#000', fontSize: 16 },
  addButton: { padding: 6, borderRadius: 20 },
  addIcon: { width: 40, height: 40 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'flex-start', alignItems: 'flex-start' },
  menuContainer: { width: 190, height: 310, backgroundColor: '#fff', paddingTop: 30, marginTop: 90, paddingHorizontal: 28, borderTopRightRadius: 5, borderBottomRightRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
  menuItem: { marginBottom: 35 },
  menuText: { fontSize: 16, color: '#000', fontFamily: 'Inter_400Regular' },
  filterContainer: { position: 'absolute', top: 260, left: 180, width: 180, maxHeight: 460, backgroundColor: '#fff', borderRadius: 5, padding: 19, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
  filterTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  filterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterItemText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  checkIcon: { fontSize: 16, color: 'green' },
  validateButton: { backgroundColor: '#6229c6', borderRadius: 5, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
  validateButtonText: { color: '#fff', fontWeight: 'bold' },
});
